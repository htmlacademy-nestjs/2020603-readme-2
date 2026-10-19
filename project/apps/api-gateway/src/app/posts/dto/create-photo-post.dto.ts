import { ApiProperty } from '@nestjs/swagger';
import { ValidateTags } from '@project/shared-helpers';

// В multipart-форме теги приходят строкой «a,b,c» или повтором поля tags.
function parseMultipartTags(value: unknown): unknown {
  if (typeof value === 'string') {
    return value
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);
  }
  return Array.isArray(value) ? value : [value];
}

/** Поля формы фото-публикации; сам файл приходит отдельно (§2.8). */
export class CreatePhotoPostDto {
  @ApiProperty({ example: ['photo', 'nature'], required: false })
  @ValidateTags(parseMultipartTags)
  public tags?: string[];
}
