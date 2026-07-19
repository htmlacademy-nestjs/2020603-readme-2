import {
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { NewslettersService } from './newsletters.service';
import { NewsletterResultRdo } from './rdo/newsletter-result.rdo';
import { JwtAuthGuard } from '../common/jwt-auth.guard';

@ApiTags('newsletters')
@Controller('newsletters')
export class NewslettersController {
  constructor(private readonly newslettersService: NewslettersService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Запустить рассылку дайджеста новых публикаций всем подписчикам',
  })
  @ApiOkResponse({
    description: 'Итог рассылки',
    type: NewsletterResultRdo,
  })
  public async trigger(): Promise<NewsletterResultRdo> {
    return this.newslettersService.trigger();
  }
}
