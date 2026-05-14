import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'user@example.com', description: 'Электронная почта' })
  @IsEmail()
  public email!: string;

  @ApiProperty({ example: 'Иван Иванов', description: 'Имя пользователя (3–50 символов)' })
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  public name!: string;

  @ApiProperty({ example: 'secret123', description: 'Пароль (6–12 символов)' })
  @IsString()
  @MinLength(6)
  @MaxLength(12)
  public password!: string;

  @ApiProperty({ example: 'https://example.com/avatar.jpg', description: 'URL аватара', required: false })
  @IsOptional()
  @IsString()
  public avatarUrl?: string;
}
