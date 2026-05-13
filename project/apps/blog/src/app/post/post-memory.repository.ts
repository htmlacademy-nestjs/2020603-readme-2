import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { Post, PostType } from '@project/shared-types';
import { PostStatus } from '@project/shared-types';
import { DEFAULT_LIMIT } from './post.constant.js';

export type PostSortBy = 'publishedAt' | 'likes' | 'comments';

export type PostQuery = {
  limit?: number;
  page?: number;
  sortBy?: PostSortBy;
  type?: PostType;
  tag?: string;
  authorId?: string;
};

@Injectable()
export class PostMemoryRepository {
  private readonly storage = new Map<string, Post>();

  public async findById(id: string): Promise<Post | null> {
    return this.storage.get(id) ?? null;
  }

  public async findAll(query: PostQuery): Promise<Post[]> {
    const {
      limit = DEFAULT_LIMIT,
      page = 1,
      sortBy = 'publishedAt',
      type,
      tag,
      authorId,
    } = query;

    let posts = [...this.storage.values()].filter(
      (p) => p.status === PostStatus.Published,
    );

    if (type) posts = posts.filter((p) => p.type === type);
    if (tag) posts = posts.filter((p) => p.tags.includes(tag));
    if (authorId) posts = posts.filter((p) => p.authorId === authorId);

    posts.sort((a, b) => {
      if (sortBy === 'likes') return b.likesCount - a.likesCount;
      if (sortBy === 'comments') return b.commentsCount - a.commentsCount;
      return b.publishedAt.getTime() - a.publishedAt.getTime();
    });

    const offset = (page - 1) * limit;
    return posts.slice(offset, offset + limit);
  }

  public async findDrafts(authorId: string): Promise<Post[]> {
    return [...this.storage.values()].filter(
      (p) => p.authorId === authorId && p.status === PostStatus.Draft,
    );
  }

  public async findByTitle(title: string): Promise<Post[]> {
    const titleLower = title.toLowerCase();
    return [...this.storage.values()]
      .filter(
        (p) =>
          p.status === PostStatus.Published &&
          'title' in p &&
          typeof p.title === 'string' &&
          p.title.toLowerCase().includes(titleLower),
      )
      .slice(0, 20);
  }

  public async findRepost(originalPostId: string, authorId: string): Promise<Post | null> {
    const found = [...this.storage.values()].find(
      (p) => p.isRepost && p.originalPostId === originalPostId && p.authorId === authorId,
    );
    return found ?? null;
  }

  public async save(post: Post): Promise<Post> {
    post.id = randomUUID();
    post.createdAt = new Date();
    post.publishedAt = new Date();
    this.storage.set(post.id, post);
    return post;
  }

  public async update(post: Post): Promise<Post> {
    this.storage.set(post.id, post);
    return post;
  }

  public async deleteById(id: string): Promise<void> {
    this.storage.delete(id);
  }
}
