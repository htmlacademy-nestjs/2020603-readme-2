import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class LoginUserDto {
  @ApiProperty({ example: 'user@example.com', description: 'Электронная почта' })
  @IsEmail()
  public email!: string;

  @ApiProperty({ example: 'secret123', description: 'Пароль' })
  @IsString()
  @MinLength(6)
  @MaxLength(12)
  public password!: string;
}
