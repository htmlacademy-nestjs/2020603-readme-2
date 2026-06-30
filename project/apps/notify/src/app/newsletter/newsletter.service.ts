import { Injectable, Logger } from '@nestjs/common';
import { EmailSubscriberService } from '../email-subscriber/email-subscriber.service';
import { NotifyPostService } from '../notify-post/notify-post.service';
import { MailService } from '../mail/mail.service';

export interface NewsletterResult {
  posts: number;
  recipients: number;
  sent: number;
  failed: number;
}

@Injectable()
export class NewsletterService {
  private readonly logger = new Logger(NewsletterService.name);

  constructor(
    private readonly emailSubscriberService: EmailSubscriberService,
    private readonly notifyPostService: NotifyPostService,
    private readonly mailService: MailService,
  ) {}

  /** §7.5: запуск рассылки дайджеста по запросу пользователя. */
  public async dispatch(): Promise<NewsletterResult> {
    const posts = await this.notifyPostService.getPendingPosts();
    if (posts.length === 0) {
      this.logger.log('No new posts — newsletter skipped');
      return { posts: 0, recipients: 0, sent: 0, failed: 0 };
    }

    const subscribers = await this.emailSubscriberService.getAllSubscribers();

    const results = await Promise.allSettled(
      subscribers.map((subscriber) =>
        this.mailService.sendNewsletter(
          subscriber.email,
          subscriber.name,
          posts,
        ),
      ),
    );

    const sent = results.filter(
      (result) => result.status === 'fulfilled',
    ).length;
    const failed = results.length - sent;

    // Помечаем публикации разосланными только при наличии успешных отправок,
    // иначе при полном сбое почты они должны попасть в следующую рассылку.
    if (sent > 0) {
      await this.notifyPostService.markNotified(posts.map((post) => post.id));
    }

    this.logger.log(
      `Newsletter dispatched: posts=${posts.length}, sent=${sent}, failed=${failed}`,
    );

    return {
      posts: posts.length,
      recipients: subscribers.length,
      sent,
      failed,
    };
  }
}
