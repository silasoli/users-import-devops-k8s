import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ImportJobItemEntity } from '../../../domain/imports/import-job-item.entity';

export class ImportJobItemResponseDto {
  @ApiProperty({ example: '66a4cf8877a3a7b5a7c7b999' })
  id: string;

  @ApiProperty({ example: '66a4cf8877a3a7b5a7c7b111' })
  job_id: string;

  @ApiProperty({ example: 7 })
  row_number: number;

  @ApiProperty({
    example: {
      name: 'Maria Oliveira',
      email: 'maria@email.com',
      document: '12345678900',
      external_ref: 'erp-123',
    },
  })
  payload: Record<string, unknown>;

  @ApiProperty({ enum: ['success', 'error'], example: 'error' })
  status: 'success' | 'error';

  @ApiPropertyOptional({ example: 'INVALID_EMAIL', nullable: true })
  error_code?: string;

  @ApiPropertyOptional({ example: 'Email already exists', nullable: true })
  error_message?: string;

  @ApiProperty({ example: '2026-04-09T21:05:00.000Z' })
  created_at: Date;

  constructor(entity: ImportJobItemEntity) {
    this.id = entity.id;
    this.job_id = entity.job_id;
    this.row_number = entity.row_number;
    this.payload = entity.payload;
    this.status = entity.status;
    this.error_code = entity.error_code;
    this.error_message = entity.error_message;
    this.created_at = entity.created_at;
  }
}

