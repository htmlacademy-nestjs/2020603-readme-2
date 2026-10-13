import { ImageMimeType } from '@project/shared-types';

export const FileKind = {
  Avatar: 'avatars',
  Photo: 'photos',
} as const;

export type FileKind = (typeof FileKind)[keyof typeof FileKind];

// Шаблон папки по дате: posix-путь (только `/`), значение уходит и в БД, и в URL.
export const DATE_FOLDER_FORMAT = 'YYYY/MM';

// Магические подписи форматов (определяем тип по содержимому, не по mimetype клиента).
export const ImageSignature = {
  Jpeg: Buffer.from([0xff, 0xd8, 0xff]),
  Png: Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
} as const;

export interface ImageFormat {
  mimetype: ImageMimeType;
  extension: string;
  signature: Buffer;
}

// Расширение сохранённого файла берётся из формата, а не из originalname.
export const IMAGE_FORMATS: readonly ImageFormat[] = [
  {
    mimetype: ImageMimeType.Jpeg,
    extension: 'jpg',
    signature: ImageSignature.Jpeg,
  },
  {
    mimetype: ImageMimeType.Png,
    extension: 'png',
    signature: ImageSignature.Png,
  },
];
