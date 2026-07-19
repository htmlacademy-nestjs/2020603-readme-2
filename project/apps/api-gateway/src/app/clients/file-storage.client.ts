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
    return this.uploadFile(file, 'avatar');
  }

  public async uploadPhoto(
    file: Express.Multer.File,
  ): Promise<StoredFileResponse> {
    return this.uploadFile(file, 'photo');
  }

  private async uploadFile(
    file: Express.Multer.File,
    kind: 'avatar' | 'photo',
  ): Promise<StoredFileResponse> {
    const formData = new FormData();
    formData.append(
      'file',
      new Blob([file.buffer]),
      file.originalname,
    );

    const { data } = await firstValueFrom(
      this.httpService.post<StoredFileResponse>(
        `${this.config.fileStorageServiceUrl}/files/${kind}`,
        formData,
      ),
    );
    return data;
  }
}
