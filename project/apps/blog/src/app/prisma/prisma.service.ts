import {
  Inject,
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../generated/prisma/client';
import { postgresConfig } from '../config';
import { getPostgresConnectionString } from '../helpers/postgres.helpers';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor(
    @Inject(postgresConfig.KEY)
    config: ConfigType<typeof postgresConfig>,
  ) {
    // Prisma 7: рантайм-клиент обязательно через driver adapter (@prisma/adapter-pg)
    super({
      adapter: new PrismaPg({
        connectionString: getPostgresConnectionString(config),
      }),
    });
  }

  public async onModuleInit(): Promise<void> {
    await this.$connect();
    this.logger.log('PostgreSQL connected (Prisma)');
  }

  public async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
