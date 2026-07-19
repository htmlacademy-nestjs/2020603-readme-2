import { Injectable } from '@nestjs/common';
import { StoredFile } from '@project/shared-types';
import type { File as FileRecord } from '../../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export interface CreateFileData {
  originalName: string;
  subDirectory: string;
  hashName: string;
  mimetype: string;
  size: number;
}

@Injectable()
export class FileRepository {
  constructor(private readonly prisma: PrismaService) {}

  private toDomain(record: FileRecord): StoredFile {
    const file = new StoredFile();
    file.id = record.id;
    file.originalName = record.originalName;
    file.hashName = record.hashName;
    file.mimetype = record.mimetype;
    file.size = record.size;
    file.createdAt = record.createdAt;
    // posix-путь для URL/логики: subDirectory/hashName (оба уже со слэшами `/`).
    file.path = `${record.subDirectory}/${record.hashName}`;
    return file;
  }

  public async create(data: CreateFileData): Promise<StoredFile> {
    const record = await this.prisma.file.create({ data });
    return this.toDomain(record);
  }

  public async findById(id: string): Promise<StoredFile | null> {
    const record = await this.prisma.file.findUnique({ where: { id } });
    return record ? this.toDomain(record) : null;
  }
}
