import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Patch,
  Post,
  Param,
  Query,
} from '@nestjs/common';
import {
  ApiBody,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { CreateUserUseCase } from '../../application/users/use-cases/create-user.usecase';
import { DeleteUserUseCase } from '../../application/users/use-cases/delete-user.usecase';
import { GetUserUseCase } from '../../application/users/use-cases/get-user.usecase';
import { ListUsersUseCase } from '../../application/users/use-cases/list-users.usecase';
import { UpdateUserUseCase } from '../../application/users/use-cases/update-user.usecase';
import { CreateUserDto } from './dtos/create-user.dto';
import { IdMongoParamDto } from './dtos/id-mongo-param.dto';
import { PaginationQueryDto } from './dtos/pagination-query.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { UserResponseDto } from './dtos/user-response.dto';
import { UsersPageResponseDto } from './dtos/users-page-response.dto';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly getUserUseCase: GetUserUseCase,
    private readonly listUsersUseCase: ListUsersUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly deleteUserUseCase: DeleteUserUseCase,
  ) {}

  @ApiOperation({ summary: 'Criar usuario' })
  @ApiBody({ type: CreateUserDto })
  @ApiOkResponse({ type: UserResponseDto })
  @Post()
  async create(@Body() dto: CreateUserDto): Promise<UserResponseDto> {
    const user = await this.createUserUseCase.execute(dto);
    return new UserResponseDto(user);
  }

  @ApiOperation({ summary: 'Buscar usuario por id' })
  @ApiParam({
    name: 'id',
    description: 'Identificador unico do usuario (ObjectId).',
    example: '66a4cf8877a3a7b5a7c7b999',
  })
  @ApiOkResponse({ type: UserResponseDto })
  @Get(':id')
  async findById(@Param() params: IdMongoParamDto): Promise<UserResponseDto> {
    const user = await this.getUserUseCase.execute(params.id);
    return new UserResponseDto(user);
  }

  @ApiOperation({ summary: 'Listar usuarios com paginacao' })
  @ApiOkResponse({ type: UsersPageResponseDto })
  @Get()
  async list(@Query() query: PaginationQueryDto): Promise<UsersPageResponseDto> {
    const page = await this.listUsersUseCase.execute({
      page: query.page ?? 1,
      limit: query.limit ?? 20,
    });

    return new UsersPageResponseDto(page);
  }

  @ApiOperation({ summary: 'Atualizar usuario' })
  @ApiParam({
    name: 'id',
    description: 'Identificador unico do usuario (ObjectId).',
    example: '66a4cf8877a3a7b5a7c7b999',
  })
  @ApiBody({ type: UpdateUserDto })
  @ApiOkResponse({ type: UserResponseDto })
  @Patch(':id')
  async update(
    @Param() params: IdMongoParamDto,
    @Body() dto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    const user = await this.updateUserUseCase.execute(params.id, dto);
    return new UserResponseDto(user);
  }

  @ApiOperation({ summary: 'Remover usuario (soft delete)' })
  @ApiNoContentResponse()
  @ApiParam({
    name: 'id',
    description: 'Identificador unico do usuario (ObjectId).',
    example: '66a4cf8877a3a7b5a7c7b999',
  })
  @Delete(':id')
  @HttpCode(204)
  async remove(@Param() params: IdMongoParamDto): Promise<void> {
    await this.deleteUserUseCase.execute(params.id);
  }
}
