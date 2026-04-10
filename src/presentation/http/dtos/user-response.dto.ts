import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserEntity } from '../../../domain/users/user.entity';

export class UserResponseDto {
  @ApiProperty({ example: '66a4cf8877a3a7b5a7c7b999' })
  id: string;

  @ApiProperty({ example: 'Joao da Silva' })
  name: string;

  @ApiProperty({ example: 'joao@email.com' })
  email: string;

  @ApiPropertyOptional({ example: '12345678900', nullable: true })
  document?: string;

  @ApiProperty({ enum: ['manual', 'import'], example: 'manual' })
  source: 'manual' | 'import';

  @ApiPropertyOptional({ example: 'erp-user-123', nullable: true })
  external_ref?: string;

  @ApiProperty({ example: '2026-04-09T21:00:00.000Z' })
  created_at: Date;

  @ApiProperty({ example: '2026-04-09T21:10:00.000Z' })
  updated_at: Date;

  @ApiPropertyOptional({ example: null, nullable: true })
  deleted_at?: Date | null;

  constructor(entity: UserEntity) {
    this.id = entity.id;
    this.name = entity.name;
    this.email = entity.email;
    this.document = entity.document;
    this.source = entity.source;
    this.external_ref = entity.external_ref;
    this.created_at = entity.created_at;
    this.updated_at = entity.updated_at;
    this.deleted_at = entity.deleted_at;
  }
}

