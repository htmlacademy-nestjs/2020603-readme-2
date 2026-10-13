import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';
import { UserValidation } from '@project/shared-types';

export class ChangeUserPasswordDto {
  @ApiProperty({
    example: 'oldSecret',
    description: 'Текущий пароль',
    minLength: UserValidation.Password.MinLength,
    maxLength: UserValidation.Password.MaxLength,
  })
  @IsString()
  @MinLength(UserValidation.Password.MinLength)
  @MaxLength(UserValidation.Password.MaxLength)
  public currentPassword!: string;

  @ApiProperty({
    example: 'newSecret',
    description: 'Новый пароль',
    minLength: UserValidation.Password.MinLength,
    maxLength: UserValidation.Password.MaxLength,
  })
  @IsString()
  @MinLength(UserValidation.Password.MinLength)
  @MaxLength(UserValidation.Password.MaxLength)
  public newPassword!: string;
}
