import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class LoggedUserRdo {
  @ApiProperty({
    description: 'Идентификатор пользователя',
    example: '6707cf8c1234567890abcdef',
  })
  @Expose()
  public id!: string;

  @ApiProperty({
    description: 'Email пользователя',
    example: 'user@example.com',
  })
  @Expose()
  public email!: string;

  @ApiProperty({ description: 'JWT Access Token', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  @Expose()
  public accessToken!: string;

  @ApiProperty({ description: 'JWT Refresh Token', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  @Expose()
  public refreshToken!: string;
}
