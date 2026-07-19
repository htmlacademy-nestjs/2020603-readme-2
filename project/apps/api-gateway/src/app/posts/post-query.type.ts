import { PostType } from '@project/shared-types';

export const POST_SORT_VALUES = ['publishedAt', 'likes', 'comments'] as const;

export type PostSortBy = (typeof POST_SORT_VALUES)[number];

export type PostQuery = {
  limit?: number;
  page?: number;
  sortBy?: PostSortBy;
  type?: PostType;
  tag?: string;
  authorId?: string;
};
