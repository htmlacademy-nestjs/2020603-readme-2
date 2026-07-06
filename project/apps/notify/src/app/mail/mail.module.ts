import { Module } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';
import { mailConfig } from '../config';
import { MailService } from './mail.service';

@Module({
  imports: [
    MailerModule.forRootAsync({
      inject: [mailConfig.KEY],
      useFactory: (config: ConfigType<typeof mailConfig>) => ({
        transport: {
          host: config.host,
          port: config.port,
          secure: false,
        },
        defaults: {
          from: config.from,
        },
      }),
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
