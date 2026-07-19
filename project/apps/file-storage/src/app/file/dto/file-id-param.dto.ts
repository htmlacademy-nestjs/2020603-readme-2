import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class FileIdParamDto {
  @ApiProperty({
    example: '2f4b7d3a-3c1b-4c4d-8b6a-8ef7b92f1011',
    description: 'Идентификатор файла',
    format: 'uuid',
  })
  @IsUUID('4')
  public fileId!: string;
}
