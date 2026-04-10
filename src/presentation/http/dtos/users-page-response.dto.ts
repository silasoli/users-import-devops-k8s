import { ApiProperty } from '@nestjs/swagger';
import { UserEntity } from '../../../domain/users/user.entity';
import { PageResult } from '../../../shared/types/pagination';
import { UserResponseDto } from './user-response.dto';

export class UsersPageResponseDto {
  @ApiProperty({ type: () => UserResponseDto, isArray: true })
  items: UserResponseDto[];

  @ApiProperty({ example: 42 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 20 })
  limit: number;

  constructor(pageResult: PageResult<UserEntity>) {
    this.items = pageResult.items.map((item) => new UserResponseDto(item));
    this.total = pageResult.total;
    this.page = pageResult.page;
    this.limit = pageResult.limit;
  }
}

