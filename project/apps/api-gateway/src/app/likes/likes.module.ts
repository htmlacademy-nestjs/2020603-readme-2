import { Module } from '@nestjs/common';
import { ClientsModule } from '../clients/clients.module';
import { LikesController } from './likes.controller';
import { LikesService } from './likes.service';

@Module({
  imports: [ClientsModule],
  controllers: [LikesController],
  providers: [LikesService],
})
export class LikesModule {}
