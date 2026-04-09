import { Inject, Injectable } from '@nestjs/common';
import { ImportJobItemRepository } from '../../../domain/imports/import-job.repository';
import { ImportJobItemEntity } from '../../../domain/imports/import-job-item.entity';
import { PageResult } from '../../../shared/types/pagination';
import { TOKENS } from '../../../shared/constants/tokens';

@Injectable()
export class ListImportJobErrorsUseCase {
  constructor(
    @Inject(TOKENS.IMPORT_JOB_ITEM_REPOSITORY)
    private readonly importJobItemRepository: ImportJobItemRepository,
  ) {}

  async execute(params: {
    job_id: string;
    page: number;
    limit: number;
  }): Promise<PageResult<ImportJobItemEntity>> {
    return this.importJobItemRepository.listErrors(params);
  }
}
