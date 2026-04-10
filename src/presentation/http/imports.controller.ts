import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { CreateUsersImportJobUseCase } from '../../application/imports/use-cases/create-users-import-job.usecase';
import { GetImportJobUseCase } from '../../application/imports/use-cases/get-import-job.usecase';
import { ListImportJobErrorsUseCase } from '../../application/imports/use-cases/list-import-job-errors.usecase';
import { CreateUsersImportJobDto } from './dtos/create-users-import-job.dto';
import { IdMongoParamDto } from './dtos/id-mongo-param.dto';
import { ImportJobErrorsPageResponseDto } from './dtos/import-job-errors-page-response.dto';
import { ImportJobResponseDto } from './dtos/import-job-response.dto';
import { PaginationQueryDto } from './dtos/pagination-query.dto';

@ApiTags('imports')
@Controller('imports')
export class ImportsController {
  constructor(
    private readonly createUsersImportJobUseCase: CreateUsersImportJobUseCase,
    private readonly getImportJobUseCase: GetImportJobUseCase,
    private readonly listImportJobErrorsUseCase: ListImportJobErrorsUseCase,
  ) {}

  @ApiOperation({ summary: 'Criar job de importacao de usuarios' })
  @ApiBody({ type: CreateUsersImportJobDto })
  @ApiOkResponse({ type: ImportJobResponseDto })
  @Post('users')
  async createUsersImport(@Body() dto: CreateUsersImportJobDto): Promise<ImportJobResponseDto> {
    const job = await this.createUsersImportJobUseCase.execute(dto);
    return new ImportJobResponseDto(job);
  }

  @ApiOperation({ summary: 'Buscar job de importacao por id' })
  @ApiParam({
    name: 'id',
    description: 'Identificador unico do job (ObjectId).',
    example: '66a4cf8877a3a7b5a7c7b999',
  })
  @ApiOkResponse({ type: ImportJobResponseDto })
  @Get(':id')
  async getById(@Param() params: IdMongoParamDto): Promise<ImportJobResponseDto> {
    const job = await this.getImportJobUseCase.execute(params.id);
    return new ImportJobResponseDto(job);
  }

  @ApiOperation({ summary: 'Listar erros de um job de importacao' })
  @ApiParam({
    name: 'id',
    description: 'Identificador unico do job (ObjectId).',
    example: '66a4cf8877a3a7b5a7c7b999',
  })
  @ApiOkResponse({ type: ImportJobErrorsPageResponseDto })
  @Get(':id/errors')
  async listErrors(
    @Param() params: IdMongoParamDto,
    @Query() query: PaginationQueryDto,
  ): Promise<ImportJobErrorsPageResponseDto> {
    const page = await this.listImportJobErrorsUseCase.execute({
      job_id: params.id,
      page: query.page ?? 1,
      limit: query.limit ?? 20,
    });

    return new ImportJobErrorsPageResponseDto(page);
  }
}
