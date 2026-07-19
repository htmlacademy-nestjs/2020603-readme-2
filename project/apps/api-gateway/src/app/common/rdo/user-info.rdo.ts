import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class UserInfoRdo {
  @ApiProperty({
    description: 'Идентификатор пользователя',
    example: '2f4b7d3a-3c1b-4c4d-8b6a-8ef7b92f1011',
    format: 'uuid',
  })
  @Expose()
  public id!: string;

  @ApiProperty({ description: 'Имя пользователя' })
  @Expose()
  public name!: string;

  @ApiProperty({ description: 'Email пользователя' })
  @Expose()
  public email!: string;

  @ApiProperty({ description: 'URL аватара', required: false })
  @Expose()
  public avatarUrl?: string;
}
