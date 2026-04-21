import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class CreateCommentDto {
  @ApiProperty({ example: 'Отличная статья, спасибо!', description: '10–300 символов' })
  @IsString()
  @MinLength(10)
  @MaxLength(300)
  public text!: string;
}
