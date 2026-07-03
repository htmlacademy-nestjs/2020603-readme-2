import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { appConfig, postgresConfig, rabbitmqConfig, validateEnv } from './config';
import { PrismaModule } from './prisma/prisma.module';
import { PostModule } from './post/post.module';
import { CommentModule } from './comment/comment.module';
import { LikeModule } from './like/like.module';
import { SubscriptionModule } from './subscription/subscription.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      envFilePath: 'apps/blog/.env',
      load: [appConfig, postgresConfig, rabbitmqConfig],
      validate: validateEnv,
    }),
    PrismaModule,
    PostModule,
    CommentModule,
    LikeModule,
    SubscriptionModule,
  ],
})
export class AppModule {}
