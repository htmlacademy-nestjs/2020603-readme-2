import { Injectable } from '@nestjs/common';
import { Subscription } from '@project/shared-types';
import { PrismaService } from '../prisma/prisma.service';

type SubscriptionRecord = {
  id: string;
  followerId: string;
  followingId: string;
  createdAt: Date;
};

@Injectable()
export class SubscriptionRepository {
  constructor(private readonly prisma: PrismaService) {}

  private toDomain(record: SubscriptionRecord): Subscription {
    const subscription = new Subscription();
    subscription.id = record.id;
    subscription.followerId = record.followerId;
    subscription.followingId = record.followingId;
    subscription.createdAt = record.createdAt;
    return subscription;
  }

  public async findByFollower(followerId: string): Promise<Subscription[]> {
    const records = await this.prisma.subscription.findMany({
      where: { followerId },
      orderBy: { createdAt: 'desc' },
    });
    return records.map((record) => this.toDomain(record));
  }

  public async findByFollowerAndFollowing(
    followerId: string,
    followingId: string,
  ): Promise<Subscription | null> {
    const record = await this.prisma.subscription.findUnique({
      where: { followerId_followingId: { followerId, followingId } },
    });
    return record ? this.toDomain(record) : null;
  }

  public async save(
    followerId: string,
    followingId: string,
  ): Promise<Subscription> {
    const record = await this.prisma.subscription.create({
      data: { followerId, followingId },
    });
    return this.toDomain(record);
  }

  public async deleteByFollowerAndFollowing(
    followerId: string,
    followingId: string,
  ): Promise<void> {
    await this.prisma.subscription.delete({
      where: { followerId_followingId: { followerId, followingId } },
    });
  }

  public async countByFollowing(followingId: string): Promise<number> {
    return this.prisma.subscription.count({
      where: { followingId },
    });
  }
}
