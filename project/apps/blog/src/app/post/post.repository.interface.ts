import type { Post, PostType } from '@project/shared-types';

export type PostSortBy = 'publishedAt' | 'likes' | 'comments';

export type PostQuery = {
  limit?: number;
  page?: number;
  sortBy?: PostSortBy;
  type?: PostType;
  tag?: string;
  authorId?: string;
};

export interface PostRepository {
  findById(id: string): Promise<Post | null>;
  findAll(query: PostQuery): Promise<Post[]>;
  findDrafts(authorId: string): Promise<Post[]>;
  findByTitle(title: string): Promise<Post[]>;
  findRepost(originalPostId: string, authorId: string): Promise<Post | null>;
  save(post: Post): Promise<Post>;
  update(post: Post): Promise<Post>;
  deleteById(id: string): Promise<void>;
}
