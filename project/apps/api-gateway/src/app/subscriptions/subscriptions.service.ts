import { Injectable } from '@nestjs/common';
import { fillRdo, fillRdoList } from '@project/shared-helpers';
import { BlogClient } from '../clients/blog.client';
import { UsersClient } from '../clients/users.client';
import { SubscriptionParamDto } from './dto/subscription-param.dto';
import { SubscriptionWithUserRdo } from './rdo/subscription-with-user.rdo';

@Injectable()
export class SubscriptionsService {
  constructor(
    private readonly blogClient: BlogClient,
    private readonly usersClient: UsersClient,
  ) {}

  public async findByFollower(
    userId: string,
  ): Promise<SubscriptionWithUserRdo[]> {
    const subscriptions = await this.blogClient.getSubscriptions(userId);
    const users = await this.usersClient.getInfoMap(
      subscriptions.map((subscription) => subscription.followingId),
    );
    const enrichedSubscriptions = subscriptions.map((subscription) => ({
      ...subscription,
      user: users.get(subscription.followingId) ?? null,
    }));
    return fillRdoList(SubscriptionWithUserRdo, enrichedSubscriptions);
  }

  /**
   * §4.5: подписка оформляется по идентификатору существующего пользователя.
   * Несуществующий пользователь — 404 от users, подписка не создаётся.
   */
  public async subscribe(
    userId: string,
    params: SubscriptionParamDto,
  ): Promise<SubscriptionWithUserRdo> {
    const user = await this.usersClient.getById(params.followingId);
    const subscription = await this.blogClient.subscribe(
      userId,
      params.followingId,
    );
    return fillRdo(SubscriptionWithUserRdo, { ...subscription, user });
  }

  public async unsubscribe(
    userId: string,
    params: SubscriptionParamDto,
  ): Promise<void> {
    await this.blogClient.unsubscribe(userId, params.followingId);
  }
}
