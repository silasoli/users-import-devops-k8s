import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';

export class IdMongoParamDto {
  @ApiProperty({
    required: true,
    description: 'ID no formato ObjectId.',
    example: '66a4cf8877a3a7b5a7c7b999',
  })
  @IsString({ message: 'id deve ser string.' })
  @IsNotEmpty({ message: 'id e obrigatorio.' })
  @IsMongoId({ message: 'id deve ser um ObjectId valido.' })
  id: string;
}

