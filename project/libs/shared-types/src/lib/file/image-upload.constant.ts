const BYTES_IN_KILOBYTE = 1024;

/** Лимиты загрузки: аватар ≤ 500 КБ (§1.2), фото-публикация ≤ 1 МБ (§2.8). */
export const MaxFileSize = {
  Avatar: 500 * BYTES_IN_KILOBYTE,
  Photo: BYTES_IN_KILOBYTE * BYTES_IN_KILOBYTE,
} as const;

/** Допустимые форматы изображений: jpeg и png. */
export const ImageMimeType = {
  Jpeg: 'image/jpeg',
  Png: 'image/png',
} as const;

export type ImageMimeType = (typeof ImageMimeType)[keyof typeof ImageMimeType];

// Nest 11: FileTypeValidator сверяет mime, определённый по магическим байтам
// буфера, поэтому шаблон описывает именно его: `image/jpeg`, а не `image/jpg`.
export const IMAGE_MIME_TYPE_PATTERN = /^image\/(jpeg|png)$/;
