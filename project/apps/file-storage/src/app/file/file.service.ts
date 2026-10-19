import { Inject, Injectable } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { randomUUID } from 'node:crypto';
import { mkdir, unlink, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import dayjs from 'dayjs';
import type { StoredFile } from '@project/shared-types';
import { FileRepository } from './file.repository';
import { storageConfig } from '../config';
import { DATE_FOLDER_FORMAT, FileKind, IMAGE_FORMATS } from './file.constant';
import type { ImageFormat } from './file.constant';
import { FileNotFoundError, UnsupportedImageTypeError } from './file.errors';

type StoredFileWithUrl = StoredFile & { url: string };

@Injectable()
export class FileService {
  constructor(
    private readonly repository: FileRepository,
    @Inject(storageConfig.KEY)
    private readonly storage: ConfigType<typeof storageConfig>,
  ) {}

  public async save(
    file: Express.Multer.File,
    kind: FileKind,
  ): Promise<StoredFileWithUrl> {
    // Тип определяем по магическим байтам буфера, а не по file.mimetype:
    // клиент может соврать в обе стороны.
    const { mimetype, extension } = this.detectImageFormat(file.buffer);

    // posix-значение для БД и URL — только `/` в шаблонной строке.
    const subDirectory = `${kind}/${dayjs().format(DATE_FOLDER_FORMAT)}`;
    const hashName = `${randomUUID()}.${extension}`;

    // Физический путь — через path.join (корректно для платформы).
    const targetPath = join(
      this.storage.uploadDirectory,
      subDirectory,
      hashName,
    );
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
      return this.addUrl(stored);
    } catch (error) {
      // БД упала — удаляем осиротевший файл (best-effort).
      await this.removeOrphanFile(targetPath);
      throw error;
    }
  }

  public async getById(id: string): Promise<StoredFileWithUrl> {
    const file = await this.repository.findById(id);
    if (!file) {
      throw new FileNotFoundError(id);
    }
    return this.addUrl(file);
  }

  private addUrl(file: StoredFile): StoredFileWithUrl {
    // URL строит сервис; контроллер — тонкий.
    return {
      ...file,
      url: `${this.storage.baseUrl}${this.storage.serveRoot}/${file.path}`,
    };
  }

  private detectImageFormat(buffer: Buffer): ImageFormat {
    const format = IMAGE_FORMATS.find(({ signature }) =>
      buffer.subarray(0, signature.length).equals(signature),
    );
    if (!format) {
      throw new UnsupportedImageTypeError();
    }
    return format;
  }

  private async removeOrphanFile(filePath: string): Promise<void> {
    try {
      await unlink(filePath);
    } catch {
      // Файла уже может не быть — наружу всё равно уходит исходная ошибка БД.
    }
  }
}
