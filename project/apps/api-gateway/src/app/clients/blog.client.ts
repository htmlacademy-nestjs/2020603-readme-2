import { Inject, Injectable } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { USER_ID_HEADER } from '@project/shared-types';
import type {
  PaginationQuery,
  PaginationResult,
  PostQuery,
  PostType,
} from '@project/shared-types';
import { servicesConfig } from '../config';

export interface BlogPost {
  id: string;
  type: PostType;
  status: string;
  authorId: string;
  isRepost: boolean;
  originalAuthorId?: string;
  originalPostId?: string;
  tags: string[];
  createdAt: string;
  publishedAt: string;
  likesCount: number;
  commentsCount: number;
  title?: string;
  videoUrl?: string;
  announce?: string;
  text?: string;
  quoteText?: string;
  quoteAuthor?: string;
  photoUrl?: string;
  link?: string;
  description?: string;
}

export interface BlogComment {
  id: string;
  postId: string;
  authorId: string;
  text: string;
  createdAt: string;
}

export interface BlogLike {
  id: string;
  postId: string;
  userId: string;
  createdAt: string;
}

export interface BlogSubscription {
  id: string;
  followerId: string;
  followingId: string;
  createdAt: string;
}

export interface FollowersCount {
  count: number;
}

@Injectable()
export class BlogClient {
  constructor(
    private readonly httpService: HttpService,
    @Inject(servicesConfig.KEY)
    private readonly config: ConfigType<typeof servicesConfig>,
  ) {}

  /**
   * Blog не проверяет JWT: личность пользователя ему сообщает gateway
   * заголовком `X-User-Id` после верификации токена.
   */
  private buildUserRequestConfig(userId: string, params?: PostQuery) {
    return {
      headers: { [USER_ID_HEADER]: userId },
      ...(params ? { params } : {}),
    };
  }

  // --- Posts ---

  public async getPosts(
    params: PostQuery,
  ): Promise<PaginationResult<BlogPost>> {
    const { data } = await firstValueFrom(
      this.httpService.get<PaginationResult<BlogPost>>(
        `${this.config.blogUrl}/posts`,
        { params },
      ),
    );
    return data;
  }

  public async getFeed(
    userId: string,
    params: PostQuery,
  ): Promise<PaginationResult<BlogPost>> {
    const { data } = await firstValueFrom(
      this.httpService.get<PaginationResult<BlogPost>>(
        `${this.config.blogUrl}/posts/feed`,
        this.buildUserRequestConfig(userId, params),
      ),
    );
    return data;
  }

  public async getDrafts(
    userId: string,
    params: PostQuery,
  ): Promise<PaginationResult<BlogPost>> {
    const { data } = await firstValueFrom(
      this.httpService.get<PaginationResult<BlogPost>>(
        `${this.config.blogUrl}/posts/drafts`,
        this.buildUserRequestConfig(userId, params),
      ),
    );
    return data;
  }

  public async searchPosts(title: string): Promise<BlogPost[]> {
    const { data } = await firstValueFrom(
      this.httpService.get<BlogPost[]>(`${this.config.blogUrl}/posts/search`, {
        params: { title },
      }),
    );
    return data;
  }

  public async getPost(id: string, userId?: string): Promise<BlogPost> {
    const { data } = await firstValueFrom(
      this.httpService.get<BlogPost>(
        `${this.config.blogUrl}/posts/${id}`,
        userId ? this.buildUserRequestConfig(userId) : undefined,
      ),
    );
    return data;
  }

  public async createPost(
    userId: string,
    type: PostType,
    body: Record<string, unknown>,
  ): Promise<BlogPost> {
    const { data } = await firstValueFrom(
      this.httpService.post<BlogPost>(
        `${this.config.blogUrl}/posts/${type}`,
        body,
        this.buildUserRequestConfig(userId),
      ),
    );
    return data;
  }

  public async updatePost(
    userId: string,
    id: string,
    body: Record<string, unknown>,
  ): Promise<BlogPost> {
    const { data } = await firstValueFrom(
      this.httpService.patch<BlogPost>(
        `${this.config.blogUrl}/posts/${id}`,
        body,
        this.buildUserRequestConfig(userId),
      ),
    );
    return data;
  }

  public async deletePost(userId: string, id: string): Promise<void> {
    await firstValueFrom(
      this.httpService.delete(
        `${this.config.blogUrl}/posts/${id}`,
        this.buildUserRequestConfig(userId),
      ),
    );
  }

  public async repost(userId: string, id: string): Promise<BlogPost> {
    const { data } = await firstValueFrom(
      this.httpService.post<BlogPost>(
        `${this.config.blogUrl}/posts/${id}/repost`,
        undefined,
        this.buildUserRequestConfig(userId),
      ),
    );
    return data;
  }

  // --- Comments ---

  public async getComments(
    postId: string,
    params: PaginationQuery,
  ): Promise<PaginationResult<BlogComment>> {
    const { data } = await firstValueFrom(
      this.httpService.get<PaginationResult<BlogComment>>(
        `${this.config.blogUrl}/posts/${postId}/comments`,
        { params },
      ),
    );
    return data;
  }

  public async createComment(
    userId: string,
    postId: string,
    body: { text: string },
  ): Promise<BlogComment> {
    const { data } = await firstValueFrom(
      this.httpService.post<BlogComment>(
        `${this.config.blogUrl}/posts/${postId}/comments`,
        body,
        this.buildUserRequestConfig(userId),
      ),
    );
    return data;
  }

  public async deleteComment(
    userId: string,
    postId: string,
    commentId: string,
  ): Promise<void> {
    await firstValueFrom(
      this.httpService.delete(
        `${this.config.blogUrl}/posts/${postId}/comments/${commentId}`,
        this.buildUserRequestConfig(userId),
      ),
    );
  }

  // --- Likes ---

  public async addLike(userId: string, postId: string): Promise<BlogLike> {
    const { data } = await firstValueFrom(
      this.httpService.post<BlogLike>(
        `${this.config.blogUrl}/posts/${postId}/likes`,
        undefined,
        this.buildUserRequestConfig(userId),
      ),
    );
    return data;
  }

  public async removeLike(userId: string, postId: string): Promise<void> {
    await firstValueFrom(
      this.httpService.delete(
        `${this.config.blogUrl}/posts/${postId}/likes`,
        this.buildUserRequestConfig(userId),
      ),
    );
  }

  // --- Subscriptions ---

  public async getSubscriptions(userId: string): Promise<BlogSubscription[]> {
    const { data } = await firstValueFrom(
      this.httpService.get<BlogSubscription[]>(
        `${this.config.blogUrl}/subscriptions`,
        this.buildUserRequestConfig(userId),
      ),
    );
    return data;
  }

  public async subscribe(
    userId: string,
    followingId: string,
  ): Promise<BlogSubscription> {
    const { data } = await firstValueFrom(
      this.httpService.post<BlogSubscription>(
        `${this.config.blogUrl}/subscriptions/${followingId}`,
        undefined,
        this.buildUserRequestConfig(userId),
      ),
    );
    return data;
  }

  public async unsubscribe(userId: string, followingId: string): Promise<void> {
    await firstValueFrom(
      this.httpService.delete(
        `${this.config.blogUrl}/subscriptions/${followingId}`,
        this.buildUserRequestConfig(userId),
      ),
    );
  }

  public async getFollowersCount(userId: string): Promise<FollowersCount> {
    const { data } = await firstValueFrom(
      this.httpService.get<FollowersCount>(
        `${this.config.blogUrl}/subscriptions/followers/${userId}/count`,
      ),
    );
    return data;
  }
}
