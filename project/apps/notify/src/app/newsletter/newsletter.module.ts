import { Module } from '@nestjs/common';
import { NewsletterController } from './newsletter.controller';
import { NewsletterService } from './newsletter.service';
import { EmailSubscriberModule } from '../email-subscriber/email-subscriber.module';
import { NotifyPostModule } from '../notify-post/notify-post.module';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [EmailSubscriberModule, NotifyPostModule, MailModule],
  controllers: [NewsletterController],
  providers: [NewsletterService],
})
export class NewsletterModule {}
