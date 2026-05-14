import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class ChangeUserPasswordDto {
  @ApiProperty({ example: 'oldSecret', description: 'Текущий пароль' })
  @IsString()
  @MinLength(6)
  @MaxLength(12)
  public currentPassword!: string;

  @ApiProperty({ example: 'newSecret', description: 'Новый пароль (6–12 символов)' })
  @IsString()
  @MinLength(6)
  @MaxLength(12)
  public newPassword!: string;
}
