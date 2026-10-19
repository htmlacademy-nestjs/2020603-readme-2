import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';
import { CommentValidation } from '@project/shared-types';

export class CreateCommentDto {
  @ApiProperty({
    example: 'Отличная статья, спасибо!',
    minLength: CommentValidation.Text.MinLength,
    maxLength: CommentValidation.Text.MaxLength,
  })
  @IsString()
  @MinLength(CommentValidation.Text.MinLength)
  @MaxLength(CommentValidation.Text.MaxLength)
  public text!: string;
}
