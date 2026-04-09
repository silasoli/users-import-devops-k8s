import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserEntity } from '../../../domain/users/user.entity';
import { UserRepository } from '../../../domain/users/user.repository';
import {
  normalizeDocument,
  normalizeEmail,
  normalizeName,
  validateEmail,
  validateName,
} from '../user-input.util';
import { CachePort } from '../../shared/ports/cache.port';
import { TOKENS } from '../../../shared/constants/tokens';

@Injectable()
export class UpdateUserUseCase {
  constructor(
    @Inject(TOKENS.USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    @Inject(TOKENS.CACHE_PORT)
    private readonly cachePort: CachePort,
  ) {}

  async execute(
    id: string,
    input: { name?: string; email?: string; document?: string | null },
  ): Promise<UserEntity> {
    const current = await this.userRepository.findById(id);
    if (!current) {
      throw new NotFoundException('User not found');
    }

    if (input.name !== undefined) {
      validateName(input.name);
    }

    if (input.email !== undefined) {
      validateEmail(input.email);
      const email = normalizeEmail(input.email);
      const existent = await this.userRepository.findByEmail(email);
      if (existent && existent.id !== id) {
        throw new ConflictException('Email already exists');
      }
    }

    const document = normalizeDocument(input.document);
    if (document) {
      const existentByDocument = await this.userRepository.findByDocument(document);
      if (existentByDocument && existentByDocument.id !== id) {
        throw new ConflictException('Document already exists');
      }
    }

    const updated = await this.userRepository.update(id, {
      name: input.name ? normalizeName(input.name) : undefined,
      email: input.email ? normalizeEmail(input.email) : undefined,
      document: input.document === null ? null : document,
    });

    if (!updated) {
      throw new NotFoundException('User not found');
    }

    await this.cachePort.del(`user:${id}`);
    return updated;
  }
}
