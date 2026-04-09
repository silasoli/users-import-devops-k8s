import { ImportUserRowMessage } from '../../../domain/imports/import-job-item.entity';

export interface ImportPublisherPort {
  publishImportRow(message: ImportUserRowMessage): Promise<void>;
}
