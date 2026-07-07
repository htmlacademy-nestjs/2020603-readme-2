import { Module } from '@nestjs/common';
import { ClientsModule } from '../clients/clients.module';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';

@Module({
  imports: [ClientsModule],
  controllers: [CommentsController],
  providers: [CommentsService],
})
export class CommentsModule {}
