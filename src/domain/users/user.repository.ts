import {
  CreateUserEntityInput,
  UpdateUserEntityInput,
  UserEntity,
} from './user.entity';
import { PageResult } from '../../shared/types/pagination';

export interface UserRepository {
  create(input: CreateUserEntityInput): Promise<UserEntity>;
  findById(id: string): Promise<UserEntity | null>;
  findByEmail(email: string): Promise<UserEntity | null>;
  findByDocument(document: string): Promise<UserEntity | null>;
  list(params: { page: number; limit: number }): Promise<PageResult<UserEntity>>;
  update(id: string, input: UpdateUserEntityInput): Promise<UserEntity | null>;
  softDelete(id: string): Promise<boolean>;
}
