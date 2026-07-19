import { Injectable } from '@nestjs/common';
import { fillRdo } from '@project/shared-helpers';
import { NotifyClient } from '../clients/notify.client';
import { NewsletterResultRdo } from './rdo/newsletter-result.rdo';

@Injectable()
export class NewslettersService {
  constructor(private readonly notifyClient: NotifyClient) {}

  public async trigger() {
    const result = await this.notifyClient.triggerNewsletter();
    return fillRdo(NewsletterResultRdo, result);
  }
}
