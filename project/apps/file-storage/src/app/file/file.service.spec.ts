import { Test, TestingModule } from '@nestjs/testing';
import { mkdir, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { StoredFile } from '@project/shared-types';
import { FileService } from './file.service';
import { FileRepository } from './file.repository';
import { FileNotFoundError, UnsupportedImageTypeError } from './file.errors';
import { storageConfig } from '../config';
import { FileKind, JPEG_SIGNATURE } from './file.constant';

describe('FileService', () => {
  let service: FileService;
  let repositoryMock: {
    create: jest.Mock;
    findById: jest.Mock;
  };
  let uploadDirectory: string;

  beforeEach(async () => {
    uploadDirectory = await mkdtemp(join(tmpdir(), 'file-storage-uploads-'));
    await mkdir(uploadDirectory, { recursive: true });

    repositoryMock = {
      create: jest.fn(),
      findById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FileService,
        { provide: FileRepository, useValue: repositoryMock },
        {
          provide: storageConfig.KEY,
          useValue: {
            uploadDirectory,
            serveRoot: '/static',
            baseUrl: 'http://localhost:3004',
          },
        },
      ],
    }).compile();

    service = module.get<FileService>(FileService);
  });

  afterEach(async () => {
    await rm(uploadDirectory, { recursive: true, force: true });
  });

  describe('saveFile', () => {
    it('writes bytes to <kind>/<YYYY/MM>/<uuid>.jpg, calls create with posix subDirectory and detected mimetype', async () => {
      // Буфер — валидный JPEG (магические байты ff d8 ff), но mimetype клиента соврёт: image/png.
      // Сервис должен сохранить продетектированный image/jpeg.
      const buffer = Buffer.concat([
        JPEG_SIGNATURE,
        Buffer.from([0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00]),
      ]);
      const file: Express.Multer.File = {
        buffer,
        originalname: 'avatar.png',
        mimetype: 'image/png',
        size: buffer.length,
      } as Express.Multer.File;

      const persistedRecord = Object.assign(new StoredFile(), {
        id: '11111111-1111-1111-1111-111111111111',
        originalName: 'avatar.png',
        hashName: 'saved-uuid.jpg',
        mimetype: 'image/jpeg',
        size: buffer.length,
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        path: 'avatars/2026/01/saved-uuid.jpg',
      });
      // Мок эхом возвращает запись, чей path соответствует входным subDirectory/hashName,
      // как это делал бы настоящий toDomain в FileRepository.
      repositoryMock.create.mockImplementation(async (data) =>
        Object.assign(new StoredFile(), {
          id: '11111111-1111-1111-1111-111111111111',
          originalName: data.originalName,
          hashName: data.hashName,
          mimetype: data.mimetype,
          size: data.size,
          createdAt: new Date('2026-01-01T00:00:00.000Z'),
          path: `${data.subDirectory}/${data.hashName}`,
        }),
      );

      const result = await service.saveFile(file, FileKind.Avatar);

      // create позвался с posix subDirectory (только `/`) и продетектированным mimetype.
      expect(repositoryMock.create).toHaveBeenCalledTimes(1);
      const [callArg] = repositoryMock.create.mock.calls[0];
      expect(callArg.subDirectory).toMatch(/^avatars\/\d{4}\/\d{2}$/);
      expect(callArg.hashName).toMatch(/\.jpg$/);
      expect(callArg.mimetype).toBe('image/jpeg');
      expect(callArg.originalName).toBe('avatar.png');
      expect(callArg.size).toBe(buffer.length);

      // Файл действительно записан на диск в подпапку avatars/<YYYY>/<MM>/.
      const subDirectory: string = callArg.subDirectory;
      const hashName: string = callArg.hashName;
      const targetPath = join(uploadDirectory, subDirectory, hashName);
      const { readFile } = await import('node:fs/promises');
      await expect(readFile(targetPath)).resolves.toEqual(buffer);

      // Ответ — домен + готовый абсолютный url.
      expect(result.id).toBe(persistedRecord.id);
      expect(result.url).toBe(
        `http://localhost:3004/static/${subDirectory}/${hashName}`,
      );
    });

    it('deletes the orphan file and rethrows when repository.create fails', async () => {
      const buffer = Buffer.concat([
        JPEG_SIGNATURE,
        Buffer.from([0xe1, 0x00, 0x10, 0x45, 0x78, 0x69, 0x66, 0x00]),
      ]);
      const file: Express.Multer.File = {
        buffer,
        originalname: 'avatar.jpg',
        mimetype: 'image/jpeg',
        size: buffer.length,
      } as Express.Multer.File;

      const dbError = new Error('DB is down');
      repositoryMock.create.mockRejectedValue(dbError);

      await expect(service.saveFile(file, FileKind.Avatar)).rejects.toBe(
        dbError,
      );

      // Папка подпапки не должна содержать осиротевшего файла.
      const { readdir } = await import('node:fs/promises');
      const subDirectories = await readdir(uploadDirectory);
      // avatars/<YYYY>/<MM>/ — должны быть пустыми (файл удалён, папки могут остаться).
      const avatarsDir = join(uploadDirectory, 'avatars');
      const avatarEntries = await readdir(avatarsDir, { recursive: true }).catch(
        () => [],
      );
      expect(avatarEntries.every((entry) => !String(entry).endsWith('.jpg'))).toBe(
        true,
      );
      expect(subDirectories).toContain('avatars');
    });

    it('throws UnsupportedImageTypeError when buffer is not jpeg/png', async () => {
      const buffer = Buffer.from('plain text, no magic bytes');
      const file: Express.Multer.File = {
        buffer,
        originalname: 'fake.jpg',
        mimetype: 'image/jpeg',
        size: buffer.length,
      } as Express.Multer.File;

      await expect(service.saveFile(file, FileKind.Photo)).rejects.toBeInstanceOf(
        UnsupportedImageTypeError,
      );
      expect(repositoryMock.create).not.toHaveBeenCalled();
    });
  });

  describe('getFile', () => {
    it('throws FileNotFoundError when repository returns null', async () => {
      repositoryMock.findById.mockResolvedValue(null);

      await expect(
        service.getFile('2f4b7d3a-3c1b-4c4d-8b6a-8ef7b92f1011'),
      ).rejects.toBeInstanceOf(FileNotFoundError);

      expect(repositoryMock.findById).toHaveBeenCalledWith(
        '2f4b7d3a-3c1b-4c4d-8b6a-8ef7b92f1011',
      );
    });

    it('returns the file with a correct url', async () => {
      const record = Object.assign(new StoredFile(), {
        id: '22222222-2222-2222-2222-222222222222',
        originalName: 'photo.png',
        hashName: 'uuid.png',
        mimetype: 'image/png',
        size: 68,
        createdAt: new Date('2026-01-02T00:00:00.000Z'),
        path: 'photos/2026/01/uuid.png',
      });
      repositoryMock.findById.mockResolvedValue(record);

      const result = await service.getFile(record.id);

      expect(result.url).toBe(
        'http://localhost:3004/static/photos/2026/01/uuid.png',
      );
      expect(result.id).toBe(record.id);
    });
  });
});
