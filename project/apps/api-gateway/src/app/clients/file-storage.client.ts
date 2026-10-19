import { Inject, Injectable } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { servicesConfig } from '../config';

export interface StoredFileResponse {
  id: string;
  originalName: string;
  hashName: string;
  mimetype: string;
  size: number;
  createdAt: string;
  url: string;
}

// Маршруты загрузки file-storage: у аватара и фото разные лимиты размера.
const UploadRoute = {
  Avatar: 'avatar',
  Photo: 'photo',
} as const;

type UploadRoute = (typeof UploadRoute)[keyof typeof UploadRoute];

@Injectable()
export class FileStorageClient {
  constructor(
    private readonly httpService: HttpService,
    @Inject(servicesConfig.KEY)
    private readonly config: ConfigType<typeof servicesConfig>,
  ) {}

  public async uploadAvatar(
    file: Express.Multer.File,
  ): Promise<StoredFileResponse> {
    return this.upload(file, UploadRoute.Avatar);
  }

  public async uploadPhoto(
    file: Express.Multer.File,
  ): Promise<StoredFileResponse> {
    return this.upload(file, UploadRoute.Photo);
  }

  private async upload(
    file: Express.Multer.File,
    route: UploadRoute,
  ): Promise<StoredFileResponse> {
    const formData = new FormData();
    formData.append('file', new Blob([file.buffer]), file.originalname);

    const { data } = await firstValueFrom(
      this.httpService.post<StoredFileResponse>(
        `${this.config.fileStorageUrl}/files/${route}`,
        formData,
      ),
    );
    return data;
  }
}
