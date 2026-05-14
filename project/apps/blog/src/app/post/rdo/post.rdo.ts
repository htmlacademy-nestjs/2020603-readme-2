import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { PostStatus, PostType } from '@project/shared-types';

export class PostRdo {
  @ApiProperty({ description: 'Идентификатор публикации' })
  @Expose()
  public id!: string;

  @ApiProperty({ enum: PostType, description: 'Тип публикации' })
  @Expose()
  public type!: PostType;

  @ApiProperty({ enum: PostStatus, description: 'Статус публикации' })
  @Expose()
  public status!: PostStatus;

  @ApiProperty({ description: 'Идентификатор автора' })
  @Expose()
  public authorId!: string;

  @ApiProperty({ description: 'Признак репоста' })
  @Expose()
  public isRepost!: boolean;

  @ApiProperty({ description: 'Идентификатор оригинального автора', required: false })
  @Expose()
  public originalAuthorId?: string;

  @ApiProperty({ description: 'Идентификатор оригинальной публикации', required: false })
  @Expose()
  public originalPostId?: string;

  @ApiProperty({ description: 'Теги публикации' })
  @Expose()
  public tags!: string[];

  @ApiProperty({ description: 'Дата создания' })
  @Expose()
  public createdAt!: Date;

  @ApiProperty({ description: 'Дата публикации' })
  @Expose()
  public publishedAt!: Date;

  @ApiProperty({ description: 'Количество лайков' })
  @Expose()
  public likesCount!: number;

  @ApiProperty({ description: 'Количество комментариев' })
  @Expose()
  public commentsCount!: number;

  // Video, Text
  @ApiProperty({ description: 'Заголовок (video, text)', required: false })
  @Expose()
  public title?: string;

  // Video
  @ApiProperty({ description: 'Ссылка на YouTube (video)', required: false })
  @Expose()
  public videoUrl?: string;

  // Text
  @ApiProperty({ description: 'Анонс (text)', required: false })
  @Expose()
  public announce?: string;

  @ApiProperty({ description: 'Текст публикации (text)', required: false })
  @Expose()
  public text?: string;

  // Quote
  @ApiProperty({ description: 'Текст цитаты (quote)', required: false })
  @Expose()
  public quoteText?: string;

  @ApiProperty({ description: 'Автор цитаты (quote)', required: false })
  @Expose()
  public quoteAuthor?: string;

  // Photo
  @ApiProperty({ description: 'URL фотографии (photo)', required: false })
  @Expose()
  public photoUrl?: string;

  // Link
  @ApiProperty({ description: 'Ссылка (link)', required: false })
  @Expose()
  public link?: string;

  @ApiProperty({ description: 'Описание ссылки (link)', required: false })
  @Expose()
  public description?: string;
}
