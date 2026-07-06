import { Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { NewsletterService } from './newsletter.service';
import type { NewsletterResult } from './newsletter.service';

@ApiTags('newsletters')
@Controller('newsletters')
export class NewsletterController {
  constructor(private readonly newsletterService: NewsletterService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      'Запустить рассылку дайджеста новых публикаций всем подписчикам (§7.5)',
  })
  @ApiOkResponse({
    description:
      'Итог рассылки: количество новых публикаций, получателей и отправленных писем',
  })
  public async trigger(): Promise<NewsletterResult> {
    return this.newsletterService.dispatch();
  }
}
