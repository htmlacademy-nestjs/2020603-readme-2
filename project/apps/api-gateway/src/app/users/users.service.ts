import { Injectable } from '@nestjs/common';
import { fillRdo } from '@project/shared-helpers';
import { UsersClient } from '../clients/users.client';
import { BlogClient } from '../clients/blog.client';
import { UserDetailsRdo } from './rdo/user-details.rdo';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersClient: UsersClient,
    private readonly blogClient: BlogClient,
  ) {}

  public async getUserDetails(id: string): Promise<UserDetailsRdo> {
    const [user, postsPage, followers] = await Promise.all([
      this.usersClient.getUser(id),
      this.blogClient.getPosts({ authorId: id, limit: 1 }),
      this.blogClient.getFollowersCount(id),
    ]);

    return fillRdo(UserDetailsRdo, {
      ...user,
      postsCount: postsPage.totalItems,
      subscribersCount: followers.count,
    });
  }
}
