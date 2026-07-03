import { Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { PostType } from '@project/shared-types';

/**
 * Контракт события `add.post`: данные новой публикации, которые сервис блога
 * публикует при создании поста. Накапливаются до ближайшей рассылки.
 */
export class CreatePostNotificationDto {
  @IsUUID()
  public postId!: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  public title?: string;

  @IsEnum(PostType)
  public type!: PostType;

  // Opaque-ссылка на пользователя другого сервиса — не обязательно UUID (STUB_USER_ID).
  @IsString()
  public authorId!: string;

  @Type(() => Date)
  @IsDate()
  public publishedAt!: Date;
}
