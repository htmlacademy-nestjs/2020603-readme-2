import { Module } from '@nestjs/common';
import { FileController } from './file.controller';
import { FileService } from './file.service';
import { FileRepository } from './file.repository';

@Module({
  controllers: [FileController],
  providers: [FileService, FileRepository],
})
export class FileModule {}
