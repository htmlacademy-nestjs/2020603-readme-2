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
import { postgresConfig } from '@project/shared-config';
import { getPostgresConnectionString } from '@project/shared-helpers';

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
