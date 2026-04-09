import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from '../../../domain/users/user.repository';
import { CachePort } from '../../shared/ports/cache.port';
import { TOKENS } from '../../../shared/constants/tokens';

@Injectable()
export class DeleteUserUseCase {
  constructor(
    @Inject(TOKENS.USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    @Inject(TOKENS.CACHE_PORT)
    private readonly cachePort: CachePort,
  ) {}

  async execute(id: string): Promise<void> {
    const deleted = await this.userRepository.softDelete(id);
    if (!deleted) {
      throw new NotFoundException('User not found');
    }

    await this.cachePort.del(`user:${id}`);
  }
}
