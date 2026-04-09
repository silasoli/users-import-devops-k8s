export type ImportJobStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'completed_with_errors'
  | 'failed';

export type ImportJobEntity = {
  id: string;
  filename: string;
  status: ImportJobStatus;
  total_rows: number;
  processed_rows: number;
  success_rows: number;
  error_rows: number;
  started_at: Date;
  finished_at?: Date | null;
  created_at: Date;
  updated_at: Date;
};

export type CreateImportJobInput = {
  filename: string;
  total_rows: number;
};
