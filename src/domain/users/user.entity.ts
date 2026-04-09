export type UserSource = 'manual' | 'import';

export type UserEntity = {
  id: string;
  name: string;
  email: string;
  document?: string;
  source: UserSource;
  external_ref?: string;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date | null;
};

export type CreateUserEntityInput = {
  name: string;
  email: string;
  document?: string;
  source?: UserSource;
  external_ref?: string;
};

export type UpdateUserEntityInput = {
  name?: string;
  email?: string;
  document?: string | null;
};
