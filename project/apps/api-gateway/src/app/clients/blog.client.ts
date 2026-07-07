import { Inject, Injectable } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import type { PaginationResult, PostType } from '@project/shared-types';
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

export type PostQueryParams = {
  limit?: number;
  page?: number;
  sortBy?: string;
  type?: PostType;
  tag?: string;
  authorId?: string;
};

@Injectable()
export class BlogClient {
  constructor(
    private readonly httpService: HttpService,
    @Inject(servicesConfig.KEY)
    private readonly config: ConfigType<typeof servicesConfig>,
  ) {}

  // --- Posts ---

  public async getPosts(
    params: PostQueryParams,
  ): Promise<PaginationResult<BlogPost>> {
    const { data } = await firstValueFrom(
      this.httpService.get<PaginationResult<BlogPost>>(
        `${this.config.blogServiceUrl}/posts`,
        { params },
      ),
    );
    return data;
  }

  public async getFeed(
    params: PostQueryParams,
  ): Promise<PaginationResult<BlogPost>> {
    const { data } = await firstValueFrom(
      this.httpService.get<PaginationResult<BlogPost>>(
        `${this.config.blogServiceUrl}/posts/feed`,
        { params },
      ),
    );
    return data;
  }

  public async getDrafts(
    params: PostQueryParams,
  ): Promise<PaginationResult<BlogPost>> {
    const { data } = await firstValueFrom(
      this.httpService.get<PaginationResult<BlogPost>>(
        `${this.config.blogServiceUrl}/posts/drafts`,
        { params },
      ),
    );
    return data;
  }

  public async searchPosts(title: string): Promise<BlogPost[]> {
    const { data } = await firstValueFrom(
      this.httpService.get<BlogPost[]>(
        `${this.config.blogServiceUrl}/posts/search`,
        { params: { title } },
      ),
    );
    return data;
  }

  public async getPost(id: string): Promise<BlogPost> {
    const { data } = await firstValueFrom(
      this.httpService.get<BlogPost>(
        `${this.config.blogServiceUrl}/posts/${id}`,
      ),
    );
    return data;
  }

  public async createPost(
    type: PostType,
    body: Record<string, unknown>,
  ): Promise<BlogPost> {
    const { data } = await firstValueFrom(
      this.httpService.post<BlogPost>(
        `${this.config.blogServiceUrl}/posts/${type.toLowerCase()}`,
        body,
      ),
    );
    return data;
  }

  public async createPhotoPost(body: {
    type: PostType;
    photoUrl: string;
    tags?: string[];
  }): Promise<BlogPost> {
    const { data } = await firstValueFrom(
      this.httpService.post<BlogPost>(
        `${this.config.blogServiceUrl}/posts/photo`,
        body,
      ),
    );
    return data;
  }

  public async updatePost(
    id: string,
    body: Record<string, unknown>,
  ): Promise<BlogPost> {
    const { data } = await firstValueFrom(
      this.httpService.patch<BlogPost>(
        `${this.config.blogServiceUrl}/posts/${id}`,
        body,
      ),
    );
    return data;
  }

  public async deletePost(id: string): Promise<void> {
    await firstValueFrom(
      this.httpService.delete(`${this.config.blogServiceUrl}/posts/${id}`),
    );
  }

  public async repost(id: string): Promise<BlogPost> {
    const { data } = await firstValueFrom(
      this.httpService.post<BlogPost>(
        `${this.config.blogServiceUrl}/posts/${id}/repost`,
      ),
    );
    return data;
  }

  // --- Comments ---

  public async getComments(
    postId: string,
    params: { limit?: number; page?: number },
  ): Promise<PaginationResult<BlogComment>> {
    const { data } = await firstValueFrom(
      this.httpService.get<PaginationResult<BlogComment>>(
        `${this.config.blogServiceUrl}/posts/${postId}/comments`,
        { params },
      ),
    );
    return data;
  }

  public async createComment(
    postId: string,
    body: { text: string },
  ): Promise<BlogComment> {
    const { data } = await firstValueFrom(
      this.httpService.post<BlogComment>(
        `${this.config.blogServiceUrl}/posts/${postId}/comments`,
        body,
      ),
    );
    return data;
  }

  public async deleteComment(
    postId: string,
    commentId: string,
  ): Promise<void> {
    await firstValueFrom(
      this.httpService.delete(
        `${this.config.blogServiceUrl}/posts/${postId}/comments/${commentId}`,
      ),
    );
  }

  // --- Likes ---

  public async addLike(postId: string): Promise<BlogLike> {
    const { data } = await firstValueFrom(
      this.httpService.post<BlogLike>(
        `${this.config.blogServiceUrl}/posts/${postId}/likes`,
      ),
    );
    return data;
  }

  public async removeLike(postId: string): Promise<void> {
    await firstValueFrom(
      this.httpService.delete(
        `${this.config.blogServiceUrl}/posts/${postId}/likes`,
      ),
    );
  }

  // --- Subscriptions ---

  public async getSubscriptions(): Promise<BlogSubscription[]> {
    const { data } = await firstValueFrom(
      this.httpService.get<BlogSubscription[]>(
        `${this.config.blogServiceUrl}/subscriptions`,
      ),
    );
    return data;
  }

  public async subscribe(followingId: string): Promise<BlogSubscription> {
    const { data } = await firstValueFrom(
      this.httpService.post<BlogSubscription>(
        `${this.config.blogServiceUrl}/subscriptions/${followingId}`,
      ),
    );
    return data;
  }

  public async unsubscribe(followingId: string): Promise<void> {
    await firstValueFrom(
      this.httpService.delete(
        `${this.config.blogServiceUrl}/subscriptions/${followingId}`,
      ),
    );
  }

  public async getFollowersCount(userId: string): Promise<FollowersCount> {
    const { data } = await firstValueFrom(
      this.httpService.get<FollowersCount>(
        `${this.config.blogServiceUrl}/subscriptions/followers/${userId}/count`,
      ),
    );
    return data;
  }
}
