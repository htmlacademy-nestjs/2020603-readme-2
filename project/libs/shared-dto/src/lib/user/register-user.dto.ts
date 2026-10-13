import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';
import { UserValidation } from '@project/shared-types';

export class RegisterUserDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Электронная почта',
    format: 'email',
  })
  @IsEmail()
  public email!: string;

  @ApiProperty({
    example: 'Иван Иванов',
    description: 'Имя пользователя',
    minLength: UserValidation.Name.MinLength,
    maxLength: UserValidation.Name.MaxLength,
  })
  @IsString()
  @MinLength(UserValidation.Name.MinLength)
  @MaxLength(UserValidation.Name.MaxLength)
  public name!: string;

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
