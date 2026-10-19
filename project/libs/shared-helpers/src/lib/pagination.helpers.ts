import type { PaginationResult } from '@project/shared-types';

interface PaginationPage<T> {
  entities: T[];
  totalItems: number;
  currentPage: number;
  itemsPerPage: number;
}

/** Собирает ответ постраничной выдачи: число страниц считается из общего количества. */
export function createPaginationResult<T>({
  entities,
  totalItems,
  currentPage,
  itemsPerPage,
}: PaginationPage<T>): PaginationResult<T> {
  return {
    entities,
    totalPages: Math.ceil(totalItems / itemsPerPage),
    totalItems,
    currentPage,
    itemsPerPage,
  };
}
