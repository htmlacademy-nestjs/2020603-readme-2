import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class CommentParamDto {
  @ApiProperty({
    description: 'Идентификатор публикации',
    example: '2f4b7d3a-3c1b-4c4d-8b6a-8ef7b92f1011',
    format: 'uuid',
  })
  @IsUUID('4')
  public postId!: string;

  @ApiProperty({
    description: 'Идентификатор комментария',
    example: '3a5c7e9d-2b1a-4f3e-8c7d-6b5a4c3d2e1f',
    format: 'uuid',
  })
  @IsUUID('4')
  public commentId!: string;
}
