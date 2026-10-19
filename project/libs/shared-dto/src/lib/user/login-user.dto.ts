import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';
import { UserValidation } from '@project/shared-types';

export class LoginUserDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Электронная почта',
  })
  @IsEmail()
  public email!: string;

  @ApiProperty({
    example: 'secret123',
    description: 'Пароль',
    minLength: UserValidation.Password.MinLength,
    maxLength: UserValidation.Password.MaxLength,
  })
  @IsString()
  @MinLength(UserValidation.Password.MinLength)
  @MaxLength(UserValidation.Password.MaxLength)
  public password!: string;
}
