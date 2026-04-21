import type { PostEntity } from './post.entity.js';
import type { PostType } from '@project/shared-types';

export interface PostQuery {
  limit?: number;
  page?: number;
  sortBy?: 'publishedAt' | 'likes' | 'comments';
  type?: PostType;
  tag?: string;
  authorId?: string;
}

export interface PostRepository {
  findById(id: string): Promise<PostEntity | null>;
  findAll(query: PostQuery): Promise<PostEntity[]>;
  findDrafts(authorId: string): Promise<PostEntity[]>;
  findByTitle(title: string): Promise<PostEntity[]>;
  findRepost(originalPostId: string, authorId: string): Promise<PostEntity | null>;
  save(entity: PostEntity): Promise<PostEntity>;
  update(entity: PostEntity): Promise<PostEntity>;
  deleteById(id: string): Promise<void>;
}
