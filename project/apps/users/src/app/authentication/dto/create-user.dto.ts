import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Электронная почта',
    format: 'email',
  })
  @IsEmail()
  public email!: string;

  @ApiProperty({
    example: 'Иван Иванов',
    description: 'Имя пользователя (3–50 символов)',
    minLength: 3,
    maxLength: 50,
  })
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  public name!: string;

  @ApiProperty({
    example: 'secret123',
    description: 'Пароль (6–12 символов)',
    minLength: 6,
    maxLength: 12,
  })
  @IsString()
  @MinLength(6)
  @MaxLength(12)
  public password!: string;

  @ApiProperty({
    example: 'https://example.com/avatar.jpg',
    description: 'URL аватара',
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsUrl({ protocols: ['http', 'https'], require_protocol: true, require_tld: false })
  public avatarUrl?: string;
}
