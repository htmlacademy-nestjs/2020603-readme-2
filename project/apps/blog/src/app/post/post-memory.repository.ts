import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { Post } from '@project/shared-types';
import { PostStatus } from '@project/shared-types';
import type { PostRepository, PostQuery } from './post.repository.interface.js';
import { PostEntity } from './post.entity.js';
import { DEFAULT_LIMIT } from './post.constant.js';

@Injectable()
export class PostMemoryRepository implements PostRepository {
  private readonly storage = new Map<string, PostEntity>();

  public async findById(id: string): Promise<Post | null> {
    const entity = this.storage.get(id);
    return entity ? entity.toObject() : null;
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
    return posts.slice(offset, offset + limit).map((entity) => entity.toObject());
  }

  public async findDrafts(authorId: string): Promise<Post[]> {
    return [...this.storage.values()]
      .filter((p) => p.authorId === authorId && p.status === PostStatus.Draft)
      .map((entity) => entity.toObject());
  }

  public async findByTitle(title: string): Promise<Post[]> {
    const titleLower = title.toLowerCase();
    return [...this.storage.values()]
      .filter(
        (p) =>
          p.status === PostStatus.Published &&
          p.title?.toLowerCase().includes(titleLower),
      )
      .slice(0, 20)
      .map((entity) => entity.toObject());
  }

  public async findRepost(originalPostId: string, authorId: string): Promise<Post | null> {
    const found = [...this.storage.values()].find(
      (p) => p.isRepost && p.originalPostId === originalPostId && p.authorId === authorId,
    );
    return found ? found.toObject() : null;
  }

  public async save(post: Post): Promise<Post> {
    const entity = new PostEntity(post);
    entity.id = randomUUID();
    entity.createdAt = new Date();
    entity.publishedAt = new Date();
    this.storage.set(entity.id, entity);
    return entity.toObject();
  }

  public async update(post: Post): Promise<Post> {
    const entity = new PostEntity(post);
    this.storage.set(entity.id, entity);
    return entity.toObject();
  }

  public async deleteById(id: string): Promise<void> {
    this.storage.delete(id);
  }
}
