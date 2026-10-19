import { applyDecorators } from '@nestjs/common';
import { Transform } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';
import { PostTag } from '@project/shared-types';

type TagsParser = (value: unknown) => unknown;

const keepValue: TagsParser = (value) => value;

/** Теги хранятся в нижнем регистре и без повторов («Теги к публикациям»). */
export function normalizeTags(tags: string[]): string[] {
  return [...new Set(tags.map((tag) => tag.toLowerCase()))];
}

// Значение, которое не является массивом строк, возвращается как есть:
// его отклонят валидаторы ниже.
function normalizeTagsValue(value: unknown): unknown {
  const isStringArray =
    Array.isArray(value) && value.every((tag) => typeof tag === 'string');
  return isStringArray ? normalizeTags(value) : value;
}

/**
 * Валидация необязательного списка тегов. Регистр и дубли нормализуются до
 * проверки, поэтому повторяющиеся теги не превышают лимит и не дают ошибку.
 * `parse` приводит исходное значение к массиву (например, строку из multipart).
 */
export function ValidateTags(parse: TagsParser = keepValue): PropertyDecorator {
  return applyDecorators(
    IsOptional(),
    Transform(({ value }) => normalizeTagsValue(parse(value))),
    IsArray(),
    IsString({ each: true }),
    ArrayMaxSize(PostTag.MaxCount),
    Matches(PostTag.Pattern, {
      each: true,
      message: PostTag.ValidationMessage,
    }),
  );
}
