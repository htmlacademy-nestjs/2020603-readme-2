import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { StoredFile } from '@project/shared-types';

@Injectable()
export class FileService {
  // TODO: заменить на реальное хранилище (файловая система / БД)
  private readonly storage = new Map<string, StoredFile>();

  public async saveFile(file: Express.Multer.File): Promise<StoredFile> {
    const id = randomUUID();
    const stored: StoredFile = {
      id,
      originalName: file.originalname,
      hashName: `${id}-${file.originalname}`,
      mimetype: file.mimetype,
      path: `/uploads/${id}-${file.originalname}`,
      size: file.size,
      createdAt: new Date(),
    };
    this.storage.set(id, stored);
    return stored;
  }

  public async getFile(id: string): Promise<StoredFile> {
    const file = this.storage.get(id);
    if (!file) throw new NotFoundException('File not found');
    return file;
  }
}
