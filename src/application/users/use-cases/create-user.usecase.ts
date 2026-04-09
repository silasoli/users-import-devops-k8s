import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { UserEntity, CreateUserEntityInput } from '../../../domain/users/user.entity';
import { UserRepository } from '../../../domain/users/user.repository';
import { normalizeDocument, normalizeEmail, normalizeName, validateEmail, validateName } from '../user-input.util';
import { TOKENS } from '../../../shared/constants/tokens';

@Injectable()
export class CreateUserUseCase {
  constructor(
    @Inject(TOKENS.USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {}

  async execute(input: CreateUserEntityInput): Promise<UserEntity> {
    validateName(input.name);
    validateEmail(input.email);

    const email = normalizeEmail(input.email);
    const document = normalizeDocument(input.document);

    const existentByEmail = await this.userRepository.findByEmail(email);
    if (existentByEmail) {
      throw new ConflictException('Email already exists');
    }

    if (document) {
      const existentByDocument = await this.userRepository.findByDocument(document);
      if (existentByDocument) {
        throw new ConflictException('Document already exists');
      }
    }

    return this.userRepository.create({
      name: normalizeName(input.name),
      email,
      document,
      source: input.source ?? 'manual',
      external_ref: input.external_ref,
    });
  }
}
