import { plainToInstance, ClassConstructor } from 'class-transformer';
import type { PaginationResult } from '@project/shared-types';

/**
 * Преобразует источник (доменный объект/запись БД) в RDO,
 * оставляя только @Expose-поля (excludeExtraneousValues: true).
 */
export function fillRdo<T, V>(RdoClass: ClassConstructor<T>, source: V): T {
  return plainToInstance(RdoClass, source, { excludeExtraneousValues: true });
}

/** Версия для массивов — для списочных эндпоинтов. */
export function fillRdoList<T, V>(
  RdoClass: ClassConstructor<T>,
  source: V[],
): T[] {
  return source.map((item) => fillRdo(RdoClass, item));
}

export function fillRdoPagination<T, V>(
  RdoClass: ClassConstructor<T>,
  source: PaginationResult<V>,
): PaginationResult<T> {
  return {
    ...source,
    entities: fillRdoList(RdoClass, source.entities),
  };
}
