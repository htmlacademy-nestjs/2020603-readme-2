import { Inject, Injectable } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { randomUUID } from 'node:crypto';
import { mkdir, unlink, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import dayjs from 'dayjs';
import type { StoredFile } from '@project/shared-types';
import { FileRepository } from './file.repository';
import { storageConfig } from '../config';
import {
  DATE_FOLDER_FORMAT,
  IMAGE_FILE_EXTENSIONS,
  JPEG_SIGNATURE,
  PNG_SIGNATURE,
  FileKind,
} from './file.constant';
import { FileNotFoundError, UnsupportedImageTypeError } from './file.errors';

type StoredFileWithUrl = StoredFile & { url: string };

@Injectable()
export class FileService {
  constructor(
    private readonly repository: FileRepository,
    @Inject(storageConfig.KEY)
    private readonly storage: ConfigType<typeof storageConfig>,
  ) {}

  public async saveFile(
    file: Express.Multer.File,
    kind: FileKind,
  ): Promise<StoredFileWithUrl> {
    // Тип определяем по магическим байтам буфера, а не по file.mimetype:
    // клиент может соврать в обе стороны.
    const mimetype = this.detectMimetype(file.buffer);

    // posix-значение для БД и URL — только `/` в шаблонной строке.
    const subDirectory = `${kind}/${dayjs().format(DATE_FOLDER_FORMAT)}`;
    const extension = IMAGE_FILE_EXTENSIONS[mimetype];
    const hashName = `${randomUUID()}.${extension}`;

    // Физический путь — через path.join (корректно для платформы).
    const targetPath = join(this.storage.uploadDirectory, subDirectory, hashName);
    await mkdir(dirname(targetPath), { recursive: true });
    await writeFile(targetPath, file.buffer);

    try {
      const stored = await this.repository.create({
        originalName: file.originalname,
        subDirectory,
        hashName,
        mimetype,
        size: file.size,
      });
      return this.withUrl(stored);
    } catch (error) {
      // БД упала — удаляем осиротевший файл (best-effort).
      await unlink(targetPath).catch(() => undefined);
      throw error;
    }
  }

  public async getFile(id: string): Promise<StoredFileWithUrl> {
    const file = await this.repository.findById(id);
    if (!file) {
      throw new FileNotFoundError(id);
    }
    return this.withUrl(file);
  }

  private withUrl(file: StoredFile): StoredFileWithUrl {
    // URL строит сервис; контроллер — тонкий.
    return { ...file, url: `${this.storage.baseUrl}${this.storage.serveRoot}/${file.path}` };
  }

  private detectMimetype(buffer: Buffer): string {
    if (buffer.subarray(0, JPEG_SIGNATURE.length).equals(JPEG_SIGNATURE)) {
      return 'image/jpeg';
    }
    if (buffer.subarray(0, PNG_SIGNATURE.length).equals(PNG_SIGNATURE)) {
      return 'image/png';
    }
    throw new UnsupportedImageTypeError();
  }
}
