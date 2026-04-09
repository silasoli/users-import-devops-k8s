export type ImportJobItemStatus = 'success' | 'error';

export type ImportJobItemEntity = {
  id: string;
  job_id: string;
  row_number: number;
  payload: Record<string, unknown>;
  status: ImportJobItemStatus;
  error_code?: string;
  error_message?: string;
  created_at: Date;
};

export type ImportUserRowPayload = {
  name: string;
  email: string;
  document?: string;
  external_ref?: string;
};

export type ImportUserRowMessage = {
  job_id: string;
  row_number: number;
  payload: ImportUserRowPayload;
};
