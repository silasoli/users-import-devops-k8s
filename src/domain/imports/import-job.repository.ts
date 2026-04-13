import {
  CreateImportJobInput,
  ImportJobEntity,
  ImportJobStatus,
} from './import-job.entity';
import { ImportJobItemEntity } from './import-job-item.entity';
import { PageResult } from '../../shared/types/pagination';

export interface ImportJobRepository {
  create(input: CreateImportJobInput): Promise<ImportJobEntity>;
  findById(id: string): Promise<ImportJobEntity | null>;
  list(params: { page: number; limit: number }): Promise<PageResult<ImportJobEntity>>;
  incrementProgress(
    id: string,
    outcome: 'success' | 'error',
  ): Promise<ImportJobEntity | null>;
  updateStatus(id: string, status: ImportJobStatus): Promise<void>;
}

export interface ImportJobItemRepository {
  create(item: {
    job_id: string;
    row_number: number;
    payload: Record<string, unknown>;
    status: 'success' | 'error';
    error_code?: string;
    error_message?: string;
  }): Promise<ImportJobItemEntity>;
  listErrors(params: {
    job_id: string;
    page: number;
    limit: number;
  }): Promise<PageResult<ImportJobItemEntity>>;
}
