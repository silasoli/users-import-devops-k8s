import { ApiProperty } from '@nestjs/swagger';
import { ImportJobItemEntity } from '../../../domain/imports/import-job-item.entity';
import { PageResult } from '../../../shared/types/pagination';
import { ImportJobItemResponseDto } from './import-job-item-response.dto';

export class ImportJobErrorsPageResponseDto {
  @ApiProperty({ type: () => ImportJobItemResponseDto, isArray: true })
  items: ImportJobItemResponseDto[];

  @ApiProperty({ example: 15 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 20 })
  limit: number;

  constructor(pageResult: PageResult<ImportJobItemEntity>) {
    this.items = pageResult.items.map((item) => new ImportJobItemResponseDto(item));
    this.total = pageResult.total;
    this.page = pageResult.page;
    this.limit = pageResult.limit;
  }
}

