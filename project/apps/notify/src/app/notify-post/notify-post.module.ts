import { Module } from '@nestjs/common';
import { NotifyPostController } from './notify-post.controller';
import { NotifyPostService } from './notify-post.service';
import { NotifyPostRepository } from './notify-post.repository';

@Module({
  controllers: [NotifyPostController],
  providers: [NotifyPostService, NotifyPostRepository],
  exports: [NotifyPostService],
})
export class NotifyPostModule {}
