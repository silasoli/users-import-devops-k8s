import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { UserEntity } from '../../../domain/users/user.entity';
import { UserRepository } from '../../../domain/users/user.repository';
import { CachePort } from '../../shared/ports/cache.port';
import { TOKENS } from '../../../shared/constants/tokens';

const USER_CACHE_TTL_SECONDS = 30;

@Injectable()
export class GetUserUseCase {
  constructor(
    @Inject(TOKENS.USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    @Inject(TOKENS.CACHE_PORT)
    private readonly cachePort: CachePort,
  ) {}

  async execute(id: string): Promise<UserEntity> {
    const cacheKey = `user:${id}`;
    const cached = await this.cachePort.get<UserEntity>(cacheKey);
    if (cached) {
      return cached;
    }

    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.cachePort.set(cacheKey, user, USER_CACHE_TTL_SECONDS);
    return user;
  }
}
