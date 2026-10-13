import type { PaginationQuery } from '../common/pagination-query.interface';
import type { PostSortBy } from './post-sort-by.enum.js';
import type { PostType } from './post-type.enum.js';

/** Фильтры и сортировка списка публикаций (§3). */
export interface PostQuery extends PaginationQuery {
  sortBy?: PostSortBy;
  type?: PostType;
  tag?: string;
  authorId?: string;
}
