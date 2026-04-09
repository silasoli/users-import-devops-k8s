import { Inject, Injectable } from '@nestjs/common';
import { UserEntity } from '../../../domain/users/user.entity';
import { UserRepository } from '../../../domain/users/user.repository';
import { PageResult } from '../../../shared/types/pagination';
import { TOKENS } from '../../../shared/constants/tokens';

@Injectable()
export class ListUsersUseCase {
  constructor(
    @Inject(TOKENS.USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {}

  async execute(params: {
    page: number;
    limit: number;
  }): Promise<PageResult<UserEntity>> {
    return this.userRepository.list(params);
  }
}
