import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId } from 'class-validator';

export class UserIdParamDto {
  @ApiProperty({
    example: '6707cf8c1234567890abcdef',
    description: 'Идентификатор пользователя',
  })
  @IsMongoId()
  public id!: string;
}
