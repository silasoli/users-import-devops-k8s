import { Inject, Injectable, Logger } from '@nestjs/common';
import { ImportJobItemRepository, ImportJobRepository } from '../../../domain/imports/import-job.repository';
import { ImportUserRowMessage } from '../../../domain/imports/import-job-item.entity';
import { UserRepository } from '../../../domain/users/user.repository';
import { CachePort } from '../../shared/ports/cache.port';
import { normalizeDocument, normalizeEmail, normalizeName, validateEmail, validateName } from '../../users/user-input.util';
import { ImportItemErrorCode, toErrorMessage } from '../import-errors';
import { TOKENS } from '../../../shared/constants/tokens';

@Injectable()
export class ProcessImportUserRowUseCase {
  private readonly logger = new Logger(ProcessImportUserRowUseCase.name);

  constructor(
    @Inject(TOKENS.IMPORT_JOB_REPOSITORY)
    private readonly importJobRepository: ImportJobRepository,
    @Inject(TOKENS.IMPORT_JOB_ITEM_REPOSITORY)
    private readonly importJobItemRepository: ImportJobItemRepository,
    @Inject(TOKENS.USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    @Inject(TOKENS.CACHE_PORT)
    private readonly cachePort: CachePort,
  ) {}

  async execute(message: ImportUserRowMessage): Promise<void> {
    const idempotencyKey = `import:item:${message.job_id}:${message.row_number}`;
    const canProcess = await this.cachePort.acquireIdempotencyKey(
      idempotencyKey,
      24 * 60 * 60,
    );

    if (!canProcess) {
      this.logger.debug(
        `Skipping duplicated message for job ${message.job_id} row ${message.row_number}`,
      );
      return;
    }

    const job = await this.importJobRepository.findById(message.job_id);
    if (!job) {
      await this.importJobItemRepository.create({
        job_id: message.job_id,
        row_number: message.row_number,
        payload: message.payload as Record<string, unknown>,
        status: 'error',
        error_code: 'JOB_NOT_FOUND',
        error_message: toErrorMessage('JOB_NOT_FOUND'),
      });
      return;
    }

    const normalizedEmail = normalizeEmail(message.payload.email);
    const normalizedName = normalizeName(message.payload.name);
    const normalizedDocument = normalizeDocument(message.payload.document);

    let hasError = false;

    try {
      validateEmail(normalizedEmail);
      validateName(normalizedName);

      const existentByEmail = await this.userRepository.findByEmail(normalizedEmail);
      if (existentByEmail) {
        throw new Error('EMAIL_ALREADY_EXISTS');
      }

      if (normalizedDocument) {
        const existentByDocument =
          await this.userRepository.findByDocument(normalizedDocument);
        if (existentByDocument) {
          throw new Error('DOCUMENT_ALREADY_EXISTS');
        }
      }

      await this.userRepository.create({
        name: normalizedName,
        email: normalizedEmail,
        document: normalizedDocument,
        source: 'import',
        external_ref: message.payload.external_ref,
      });

      await this.importJobItemRepository.create({
        job_id: message.job_id,
        row_number: message.row_number,
        payload: message.payload as Record<string, unknown>,
        status: 'success',
      });
    } catch (error) {
      hasError = true;
      const code = this.toKnownErrorCode(error);

      await this.importJobItemRepository.create({
        job_id: message.job_id,
        row_number: message.row_number,
        payload: message.payload as Record<string, unknown>,
        status: 'error',
        error_code: code,
        error_message: toErrorMessage(code),
      });
    }

    const updated = await this.importJobRepository.incrementProgress(
      message.job_id,
      hasError ? 'error' : 'success',
    );

    if (!updated) return;

    if (updated.processed_rows >= updated.total_rows) {
      await this.importJobRepository.updateStatus(
        message.job_id,
        updated.error_rows > 0 ? 'completed_with_errors' : 'completed',
      );
    }

    await this.cachePort.del(`import:${message.job_id}`);
  }

  private toKnownErrorCode(error: unknown): ImportItemErrorCode {
    if (typeof error === 'object' && error !== null && 'code' in error) {
      const mongoError = error as {
        code?: number;
        keyPattern?: Record<string, unknown>;
        message?: string;
      };

      if (mongoError.code === 11000) {
        if (mongoError.keyPattern?.email) return 'EMAIL_ALREADY_EXISTS';
        if (mongoError.keyPattern?.document) return 'DOCUMENT_ALREADY_EXISTS';

        const rawMessage = mongoError.message ?? '';
        if (rawMessage.includes('email')) return 'EMAIL_ALREADY_EXISTS';
        if (rawMessage.includes('document')) return 'DOCUMENT_ALREADY_EXISTS';
      }
    }

    if (error instanceof Error) {
      const code = error.message;
      if (
        code === 'INVALID_EMAIL' ||
        code === 'NAME_OUT_OF_RANGE' ||
        code === 'EMAIL_ALREADY_EXISTS' ||
        code === 'DOCUMENT_ALREADY_EXISTS'
      ) {
        return code;
      }
    }

    return 'UNEXPECTED_ERROR';
  }
}
