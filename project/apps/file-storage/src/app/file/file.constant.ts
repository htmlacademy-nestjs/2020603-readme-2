export const FileKind = {
  Avatar: 'avatars',
  Photo: 'photos',
} as const;

export type FileKind = (typeof FileKind)[keyof typeof FileKind];

// Лимиты раздельные: аватар ≤ 500 КБ, фото-публикация ≤ 1 МБ.
export const AVATAR_MAX_FILE_SIZE = 500 * 1024;
export const PHOTO_MAX_FILE_SIZE = 1024 * 1024;

// Nest 11: FileTypeValidator по умолчанию сверяет mime, продетектированный
// по магическим байтам буфера (file-type@21.3.4). Регекс матчит именно
// продетектированное значение: `image/jpeg`, не `image/jpg`.
export const IMAGE_MIME_TYPE_PATTERN = /^image\/(jpeg|png)$/;

// Шаблон папки по дате: posix-путь (только `/`), значение уходит и в БД, и в URL.
export const DATE_FOLDER_FORMAT = 'YYYY/MM';

// Магические подписи форматов (определяем тип по содержимому, не по mimetype клиента).
export const JPEG_SIGNATURE = Buffer.from([0xff, 0xd8, 0xff]);
export const PNG_SIGNATURE = Buffer.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
]);

// Расширение берётся из продетектированного mime, не из originalname.
export const IMAGE_FILE_EXTENSIONS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
};
