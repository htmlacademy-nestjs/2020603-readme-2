import {
  FileTypeValidator,
  MaxFileSizeValidator,
  ParseFilePipe,
} from '@nestjs/common';
import { IMAGE_MIME_TYPE_PATTERN } from '@project/shared-types';

interface ImageFilePipeOptions {
  maxSize: number;
  isRequired?: boolean;
}

/**
 * Пайп загрузки изображения: ограничение размера и формат jpeg/png,
 * определённый по магическим байтам содержимого.
 */
export function createImageFilePipe({
  maxSize,
  isRequired = true,
}: ImageFilePipeOptions): ParseFilePipe {
  return new ParseFilePipe({
    validators: [
      new MaxFileSizeValidator({ maxSize }),
      new FileTypeValidator({ fileType: IMAGE_MIME_TYPE_PATTERN }),
    ],
    fileIsRequired: isRequired,
  });
}
