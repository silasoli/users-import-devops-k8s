export type ImportItemErrorCode =
  | 'INVALID_EMAIL'
  | 'NAME_OUT_OF_RANGE'
  | 'EMAIL_ALREADY_EXISTS'
  | 'DOCUMENT_ALREADY_EXISTS'
  | 'JOB_NOT_FOUND'
  | 'UNEXPECTED_ERROR';

export function toErrorMessage(code: ImportItemErrorCode): string {
  switch (code) {
    case 'INVALID_EMAIL':
      return 'Email is invalid.';
    case 'NAME_OUT_OF_RANGE':
      return 'Name must have between 3 and 120 characters.';
    case 'EMAIL_ALREADY_EXISTS':
      return 'Email already exists.';
    case 'DOCUMENT_ALREADY_EXISTS':
      return 'Document already exists.';
    case 'JOB_NOT_FOUND':
      return 'Import job not found.';
    default:
      return 'Unexpected import error.';
  }
}
