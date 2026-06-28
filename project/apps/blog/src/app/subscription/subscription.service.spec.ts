import { Subscription } from '@project/shared-types';
import {
  SelfSubscriptionError,
  SubscriptionAlreadyExistsError,
  SubscriptionNotFoundError,
} from './subscription.errors';
import { SubscriptionRepository } from './subscription.repository';
import { SubscriptionService } from './subscription.service';

type SubscriptionRepositoryMock = jest.Mocked<
  Pick<
    SubscriptionRepository,
    | 'findByFollower'
    | 'findByFollowerAndFollowing'
    | 'save'
    | 'deleteByFollowerAndFollowing'
  >
>;

describe('SubscriptionService', () => {
  let service: SubscriptionService;
  let repository: SubscriptionRepositoryMock;

  beforeEach(() => {
    repository = {
      findByFollower: jest.fn(),
      findByFollowerAndFollowing: jest.fn(),
      save: jest.fn(),
      deleteByFollowerAndFollowing: jest.fn(),
    };
    service = new SubscriptionService(repository as SubscriptionRepository);
  });

  it('should create subscription', async () => {
    const subscription = Object.assign(new Subscription(), {
      id: 'subscription-id',
      followerId: 'user-1',
      followingId: 'user-2',
      createdAt: new Date(),
    });
    repository.findByFollowerAndFollowing.mockResolvedValue(null);
    repository.save.mockResolvedValue(subscription);

    await expect(service.subscribe('user-1', 'user-2')).resolves.toBe(
      subscription,
    );
    expect(repository.save).toHaveBeenCalledWith('user-1', 'user-2');
  });

  it('should reject self subscription', async () => {
    await expect(service.subscribe('user-1', 'user-1')).rejects.toBeInstanceOf(
      SelfSubscriptionError,
    );
    expect(repository.save).not.toHaveBeenCalled();
  });

  it('should reject duplicate subscription', async () => {
    repository.findByFollowerAndFollowing.mockResolvedValue(new Subscription());

    await expect(service.subscribe('user-1', 'user-2')).rejects.toBeInstanceOf(
      SubscriptionAlreadyExistsError,
    );
    expect(repository.save).not.toHaveBeenCalled();
  });

  it('should unsubscribe existing subscription', async () => {
    repository.findByFollowerAndFollowing.mockResolvedValue(new Subscription());

    await expect(service.unsubscribe('user-1', 'user-2')).resolves.toBeUndefined();
    expect(repository.deleteByFollowerAndFollowing).toHaveBeenCalledWith(
      'user-1',
      'user-2',
    );
  });

  it('should reject missing subscription deletion', async () => {
    repository.findByFollowerAndFollowing.mockResolvedValue(null);

    await expect(service.unsubscribe('user-1', 'user-2')).rejects.toBeInstanceOf(
      SubscriptionNotFoundError,
    );
    expect(repository.deleteByFollowerAndFollowing).not.toHaveBeenCalled();
  });
});
