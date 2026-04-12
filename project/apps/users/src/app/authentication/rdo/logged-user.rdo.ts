import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class LoggedUserRdo {
  @ApiProperty({ description: 'Идентификатор пользователя' })
  @Expose()
  public id!: string;

  @ApiProperty({ description: 'Email пользователя' })
  @Expose()
  public email!: string;

  @ApiProperty({ description: 'JWT Access Token' })
  @Expose()
  public accessToken!: string;
}
