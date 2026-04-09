import { Inject, Injectable } from '@nestjs/common';
import { ImportJobEntity } from '../../../domain/imports/import-job.entity';
import { ImportJobRepository } from '../../../domain/imports/import-job.repository';
import { ImportUserRowPayload } from '../../../domain/imports/import-job-item.entity';
import { ImportPublisherPort } from '../ports/import-publisher.port';
import { CachePort } from '../../shared/ports/cache.port';
import { TOKENS } from '../../../shared/constants/tokens';

@Injectable()
export class CreateUsersImportJobUseCase {
  constructor(
    @Inject(TOKENS.IMPORT_JOB_REPOSITORY)
    private readonly importJobRepository: ImportJobRepository,
    @Inject(TOKENS.IMPORT_PUBLISHER_PORT)
    private readonly importPublisher: ImportPublisherPort,
    @Inject(TOKENS.CACHE_PORT)
    private readonly cachePort: CachePort,
  ) {}

  async execute(input: {
    filename: string;
    rows: ImportUserRowPayload[];
  }): Promise<ImportJobEntity> {
    const job = await this.importJobRepository.create({
      filename: input.filename,
      total_rows: input.rows.length,
    });

    if (input.rows.length === 0) {
      await this.importJobRepository.updateStatus(job.id, 'completed');
      const completed = await this.importJobRepository.findById(job.id);
      if (completed) {
        await this.cachePort.set(`import:${job.id}`, completed, 15);
        return completed;
      }
      return job;
    }

    await Promise.all(
      input.rows.map((row, index) =>
        this.importPublisher.publishImportRow({
          job_id: job.id,
          row_number: index + 1,
          payload: row,
        }),
      ),
    );

    return job;
  }
}
