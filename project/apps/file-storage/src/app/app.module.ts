import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { FileModule } from './file/file.module';
import { PrismaModule } from './prisma/prisma.module';
import { appConfig, postgresConfig } from '@project/shared-config';
import { storageConfig, validateEnv } from './config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      envFilePath: 'apps/file-storage/.env',
      load: [appConfig, postgresConfig, storageConfig],
      validate: validateEnv,
    }),
    PrismaModule,
    FileModule,
  ],
})
export class AppModule {}
