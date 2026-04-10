import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    description: 'Nome do usuario.',
    example: 'Joao da Silva',
    minLength: 3,
    maxLength: 120,
  })
  @IsString()
  @IsNotEmpty({ message: 'Nome e obrigatorio.' })
  @MinLength(3, { message: 'Nome deve ter no minimo 3 caracteres.' })
  @MaxLength(120, { message: 'Nome deve ter no maximo 120 caracteres.' })
  name: string;

  @ApiProperty({
    description: 'E-mail unico do usuario.',
    example: 'joao@email.com',
  })
  @IsEmail()
  @IsNotEmpty({ message: 'E-mail e obrigatorio.' })
  email: string;

  @ApiPropertyOptional({
    description: 'Documento opcional e unico.',
    example: '12345678900',
  })
  @IsOptional()
  @IsString()
  document?: string;
}
