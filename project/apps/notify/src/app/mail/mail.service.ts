import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import type { NotifyPostEntity } from '../notify-post/notify-post.entity';

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  public async sendNewsletter(
    email: string,
    name: string,
    posts: NotifyPostEntity[],
  ): Promise<void> {
    await this.mailerService.sendMail({
      to: email,
      subject: `Readme: новых публикаций — ${posts.length}`,
      html: this.buildHtml(name, posts),
    });
  }

  private buildHtml(name: string, posts: NotifyPostEntity[]): string {
    const items = posts
      .map((post) => {
        const title =
          post.title?.trim() || `Публикация типа «${post.type}»`;
        const date = post.publishedAt.toISOString().slice(0, 10);
        return `<li><strong>${escapeHtml(title)}</strong> — ${escapeHtml(
          post.type,
        )} (${date})</li>`;
      })
      .join('');

    return [
      `<h1>Здравствуйте, ${escapeHtml(name)}!</h1>`,
      '<p>С момента прошлой рассылки на Readme появились новые публикации:</p>',
      `<ul>${items}</ul>`,
    ].join('');
  }
}
