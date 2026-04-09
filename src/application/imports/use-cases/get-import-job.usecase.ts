import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ImportJobEntity } from '../../../domain/imports/import-job.entity';
import { ImportJobRepository } from '../../../domain/imports/import-job.repository';
import { CachePort } from '../../shared/ports/cache.port';
import { TOKENS } from '../../../shared/constants/tokens';

const IMPORT_CACHE_TTL_SECONDS = 15;

@Injectable()
export class GetImportJobUseCase {
  constructor(
    @Inject(TOKENS.IMPORT_JOB_REPOSITORY)
    private readonly importJobRepository: ImportJobRepository,
    @Inject(TOKENS.CACHE_PORT)
    private readonly cachePort: CachePort,
  ) {}

  async execute(id: string): Promise<ImportJobEntity> {
    const cacheKey = `import:${id}`;
    const cached = await this.cachePort.get<ImportJobEntity>(cacheKey);
    if (cached) return cached;

    const job = await this.importJobRepository.findById(id);
    if (!job) {
      throw new NotFoundException('Import job not found');
    }

    await this.cachePort.set(cacheKey, job, IMPORT_CACHE_TTL_SECONDS);
    return job;
  }
}
