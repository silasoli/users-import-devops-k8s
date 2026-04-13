import { Inject, Injectable } from '@nestjs/common';
import { ImportJobEntity } from '../../../domain/imports/import-job.entity';
import { ImportJobRepository } from '../../../domain/imports/import-job.repository';
import { TOKENS } from '../../../shared/constants/tokens';
import { PageResult } from '../../../shared/types/pagination';

@Injectable()
export class ListImportJobsUseCase {
  constructor(
    @Inject(TOKENS.IMPORT_JOB_REPOSITORY)
    private readonly importJobRepository: ImportJobRepository,
  ) {}

  async execute(params: { page: number; limit: number }): Promise<PageResult<ImportJobEntity>> {
    return this.importJobRepository.list(params);
  }
}

