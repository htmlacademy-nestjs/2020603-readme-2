import { Inject, Injectable } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { servicesConfig } from '../config';

export interface NewsletterResult {
  posts: number;
  recipients: number;
  sent: number;
  failed: number;
}

@Injectable()
export class NotifyClient {
  constructor(
    private readonly httpService: HttpService,
    @Inject(servicesConfig.KEY)
    private readonly config: ConfigType<typeof servicesConfig>,
  ) {}

  public async triggerNewsletter(): Promise<NewsletterResult> {
    const { data } = await firstValueFrom(
      this.httpService.post<NewsletterResult>(
        `${this.config.notifyServiceUrl}/newsletters`,
      ),
    );
    return data;
  }
}
