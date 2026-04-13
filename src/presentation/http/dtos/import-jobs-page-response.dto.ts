import { ApiProperty } from '@nestjs/swagger';
import { ImportJobEntity } from '../../../domain/imports/import-job.entity';
import { PageResult } from '../../../shared/types/pagination';
import { ImportJobResponseDto } from './import-job-response.dto';

export class ImportJobsPageResponseDto {
  @ApiProperty({ type: () => ImportJobResponseDto, isArray: true })
  items: ImportJobResponseDto[];

  @ApiProperty({ example: 15 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 20 })
  limit: number;

  constructor(pageResult: PageResult<ImportJobEntity>) {
    this.items = pageResult.items.map((item) => new ImportJobResponseDto(item));
    this.total = pageResult.total;
    this.page = pageResult.page;
    this.limit = pageResult.limit;
  }
}

