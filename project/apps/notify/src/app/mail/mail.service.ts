import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import dayjs from 'dayjs';
import type { NotifyPostEntity } from '../notify-post/notify-post.entity';

const NEWSLETTER_DATE_FORMAT = 'YYYY-MM-DD';
const HTML_SPECIAL_CHARS_PATTERN = /[&<>"']/g;
const HTML_ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

// Один проход по строке: каждый спецсимвол заменяется своей HTML-сущностью.
function escapeHtml(value: string): string {
  return value.replace(
    HTML_SPECIAL_CHARS_PATTERN,
    (char) => HTML_ENTITIES[char],
  );
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
    const postsHtml = posts
      .map((post) => {
        const title = post.title?.trim() || `Публикация типа «${post.type}»`;
        const date = dayjs(post.publishedAt).format(NEWSLETTER_DATE_FORMAT);
        return `<li><strong>${escapeHtml(title)}</strong> — ${escapeHtml(
          post.type,
        )} (${date})</li>`;
      })
      .join('');

    return [
      `<h1>Здравствуйте, ${escapeHtml(name)}!</h1>`,
      '<p>С момента прошлой рассылки на Readme появились новые публикации:</p>',
      `<ul>${postsHtml}</ul>`,
    ].join('');
  }
}
