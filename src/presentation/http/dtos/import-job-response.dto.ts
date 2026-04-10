import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ImportJobEntity, ImportJobStatus } from '../../../domain/imports/import-job.entity';

export class ImportJobResponseDto {
  @ApiProperty({ example: '66a4cf8877a3a7b5a7c7b999' })
  id: string;

  @ApiProperty({ example: 'users_import_2026-04-09.csv' })
  filename: string;

  @ApiProperty({
    enum: ['pending', 'processing', 'completed', 'completed_with_errors', 'failed'],
    example: 'processing',
  })
  status: ImportJobStatus;

  @ApiProperty({ example: 100 })
  total_rows: number;

  @ApiProperty({ example: 20 })
  processed_rows: number;

  @ApiProperty({ example: 18 })
  success_rows: number;

  @ApiProperty({ example: 2 })
  error_rows: number;

  @ApiProperty({ example: '2026-04-09T21:00:00.000Z' })
  started_at: Date;

  @ApiPropertyOptional({ example: null, nullable: true })
  finished_at?: Date | null;

  @ApiProperty({ example: '2026-04-09T21:00:00.000Z' })
  created_at: Date;

  @ApiProperty({ example: '2026-04-09T21:10:00.000Z' })
  updated_at: Date;

  constructor(entity: ImportJobEntity) {
    this.id = entity.id;
    this.filename = entity.filename;
    this.status = entity.status;
    this.total_rows = entity.total_rows;
    this.processed_rows = entity.processed_rows;
    this.success_rows = entity.success_rows;
    this.error_rows = entity.error_rows;
    this.started_at = entity.started_at;
    this.finished_at = entity.finished_at;
    this.created_at = entity.created_at;
    this.updated_at = entity.updated_at;
  }
}

