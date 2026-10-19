import { Injectable } from '@nestjs/common';
import { fillRdo } from '@project/shared-helpers';
import { UsersClient } from '../clients/users.client';
import { BlogClient } from '../clients/blog.client';
import { UserDetailsRdo } from './rdo/user-details.rdo';

// Число публикаций берём из totalItems: одной записи на странице достаточно.
const POSTS_COUNT_QUERY_LIMIT = 1;

@Injectable()
export class UsersService {
  constructor(
    private readonly usersClient: UsersClient,
    private readonly blogClient: BlogClient,
  ) {}

  public async getDetails(id: string): Promise<UserDetailsRdo> {
    const [user, postsPage, followers] = await Promise.all([
      this.usersClient.getById(id),
      this.blogClient.getPosts({
        authorId: id,
        limit: POSTS_COUNT_QUERY_LIMIT,
      }),
      this.blogClient.getFollowersCount(id),
    ]);

    return fillRdo(UserDetailsRdo, {
      ...user,
      postsCount: postsPage.totalItems,
      subscribersCount: followers.count,
    });
  }
}
