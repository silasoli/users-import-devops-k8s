import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateUsersImportJobUseCase } from '../../application/imports/use-cases/create-users-import-job.usecase';
import { GetImportJobUseCase } from '../../application/imports/use-cases/get-import-job.usecase';
import { ListImportJobErrorsUseCase } from '../../application/imports/use-cases/list-import-job-errors.usecase';
import { CreateUsersImportJobDto } from './dtos/create-users-import-job.dto';
import { PaginationQueryDto } from './dtos/pagination-query.dto';

@ApiTags('imports')
@Controller('imports')
export class ImportsController {
  constructor(
    private readonly createUsersImportJobUseCase: CreateUsersImportJobUseCase,
    private readonly getImportJobUseCase: GetImportJobUseCase,
    private readonly listImportJobErrorsUseCase: ListImportJobErrorsUseCase,
  ) {}

  @Post('users')
  async createUsersImport(@Body() dto: CreateUsersImportJobDto) {
    return this.createUsersImportJobUseCase.execute(dto);
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    return this.getImportJobUseCase.execute(id);
  }

  @Get(':id/errors')
  async listErrors(@Param('id') id: string, @Query() query: PaginationQueryDto) {
    return this.listImportJobErrorsUseCase.execute({
      job_id: id,
      page: query.page ?? 1,
      limit: query.limit ?? 20,
    });
  }
}
