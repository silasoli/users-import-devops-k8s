import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateUserUseCase } from '../../application/users/use-cases/create-user.usecase';
import { DeleteUserUseCase } from '../../application/users/use-cases/delete-user.usecase';
import { GetUserUseCase } from '../../application/users/use-cases/get-user.usecase';
import { ListUsersUseCase } from '../../application/users/use-cases/list-users.usecase';
import { UpdateUserUseCase } from '../../application/users/use-cases/update-user.usecase';
import { CreateUserDto } from './dtos/create-user.dto';
import { PaginationQueryDto } from './dtos/pagination-query.dto';
import { UpdateUserDto } from './dtos/update-user.dto';

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

  @Post()
  async create(@Body() dto: CreateUserDto) {
    return this.createUserUseCase.execute(dto);
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.getUserUseCase.execute(id);
  }

  @Get()
  async list(@Query() query: PaginationQueryDto) {
    return this.listUsersUseCase.execute({
      page: query.page ?? 1,
      limit: query.limit ?? 20,
    });
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.updateUserUseCase.execute(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id') id: string): Promise<void> {
    await this.deleteUserUseCase.execute(id);
  }
}
