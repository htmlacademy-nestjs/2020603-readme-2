import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class CommentRdo {
  @ApiProperty({ description: 'Идентификатор комментария' })
  @Expose()
  public id!: string;

  @ApiProperty({ description: 'Идентификатор публикации' })
  @Expose()
  public postId!: string;

  @ApiProperty({ description: 'Идентификатор автора' })
  @Expose()
  public authorId!: string;

  @ApiProperty({ description: 'Текст комментария' })
  @Expose()
  public text!: string;

  @ApiProperty({ description: 'Дата создания' })
  @Expose()
  public createdAt!: Date;
}
