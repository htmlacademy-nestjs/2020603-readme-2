import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { CreateSubscriberDto } from './dto/create-subscriber.dto';
import type { EmailSubscriberEntity } from './email-subscriber.entity';

@Injectable()
export class EmailSubscriberRepository {
  constructor(private readonly prisma: PrismaService) {}

  public async upsert(
    dto: CreateSubscriberDto,
  ): Promise<EmailSubscriberEntity> {
    return this.prisma.emailSubscriber.upsert({
      where: { userId: dto.userId },
      update: { email: dto.email, name: dto.name },
      create: { userId: dto.userId, email: dto.email, name: dto.name },
    });
  }

  public async findAll(): Promise<EmailSubscriberEntity[]> {
    return this.prisma.emailSubscriber.findMany({
      orderBy: { createdAt: 'asc' },
    });
  }
}
