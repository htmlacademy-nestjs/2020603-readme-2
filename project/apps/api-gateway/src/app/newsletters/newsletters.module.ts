import { Module } from '@nestjs/common';
import { ClientsModule } from '../clients/clients.module';
import { NewslettersController } from './newsletters.controller';
import { NewslettersService } from './newsletters.service';

@Module({
  imports: [ClientsModule],
  controllers: [NewslettersController],
  providers: [NewslettersService],
})
export class NewslettersModule {}
