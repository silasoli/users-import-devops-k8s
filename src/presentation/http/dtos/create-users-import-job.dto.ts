import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEmail,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';

export class ImportUserRowDto {
  @IsString()
  @MinLength(3)
  @MaxLength(120)
  name: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  document?: string;

  @IsOptional()
  @IsString()
  external_ref?: string;
}

export class CreateUsersImportJobDto {
  @IsString()
  filename: string;

  @IsArray()
  @ArrayMinSize(0)
  @ValidateNested({ each: true })
  @Type(() => ImportUserRowDto)
  rows: ImportUserRowDto[];
}
