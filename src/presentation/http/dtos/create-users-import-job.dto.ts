import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';

export class ImportUserRowDto {
  @ApiProperty({
    description: 'Nome do usuario da linha.',
    example: 'Maria Oliveira',
    minLength: 3,
    maxLength: 120,
  })
  @IsString()
  @IsNotEmpty({ message: 'Nome e obrigatorio.' })
  @MinLength(3, { message: 'Nome deve ter no minimo 3 caracteres.' })
  @MaxLength(120, { message: 'Nome deve ter no maximo 120 caracteres.' })
  name: string;

  @ApiProperty({
    description: 'E-mail do usuario da linha.',
    example: 'maria@email.com',
  })
  @IsEmail()
  @IsNotEmpty({ message: 'E-mail e obrigatorio.' })
  email: string;

  @ApiPropertyOptional({
    description: 'Documento opcional da linha.',
    example: '12345678900',
  })
  @IsOptional()
  @IsString()
  document?: string;

  @ApiPropertyOptional({
    description: 'Referencia externa opcional para idempotencia.',
    example: 'erp-user-123',
  })
  @IsOptional()
  @IsString()
  external_ref?: string;
}

export class CreateUsersImportJobDto {
  @ApiProperty({
    description: 'Nome do arquivo de origem do import.',
    example: 'users_import_2026-04-09.csv',
  })
  @IsString()
  @IsNotEmpty({ message: 'filename e obrigatorio.' })
  filename: string;

  @ApiProperty({
    description: 'Linhas de usuarios para importacao.',
    type: () => ImportUserRowDto,
    isArray: true,
  })
  @IsArray()
  @ArrayMinSize(0)
  @ValidateNested({ each: true })
  @Type(() => ImportUserRowDto)
  rows: ImportUserRowDto[];
}
