import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { MailModule } from './mail/mail.module';
import { EmailSubscriberModule } from './email-subscriber/email-subscriber.module';
import { NotifyPostModule } from './notify-post/notify-post.module';
import { NewsletterModule } from './newsletter/newsletter.module';
import {
  appConfig,
  postgresConfig,
  rabbitmqConfig,
  mailConfig,
  validateEnv,
} from './config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      envFilePath: 'apps/notify/.env',
      load: [appConfig, postgresConfig, rabbitmqConfig, mailConfig],
      validate: validateEnv,
    }),
    PrismaModule,
    MailModule,
    EmailSubscriberModule,
    NotifyPostModule,
    NewsletterModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
