import { Module } from '@nestjs/common';
import { ClientsModule } from '../clients/clients.module';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';

@Module({
  imports: [ClientsModule],
  controllers: [PostsController],
  providers: [PostsService],
})
export class PostsModule {}
