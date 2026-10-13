import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import type { ConfigType } from '@nestjs/config';
import { servicesConfig } from '../config';
import { UsersClient } from './users.client';
import { BlogClient } from './blog.client';
import { FileStorageClient } from './file-storage.client';
import { NotifyClient } from './notify.client';

@Module({
  imports: [
    ConfigModule.forFeature(servicesConfig),
    HttpModule.registerAsync({
      inject: [servicesConfig.KEY],
      useFactory: (config: ConfigType<typeof servicesConfig>) => ({
        timeout: config.httpTimeout,
      }),
    }),
  ],
  providers: [UsersClient, BlogClient, FileStorageClient, NotifyClient],
  exports: [UsersClient, BlogClient, FileStorageClient, NotifyClient],
})
export class ClientsModule {}
