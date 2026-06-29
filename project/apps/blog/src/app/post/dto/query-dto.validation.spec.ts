import {
  BadRequestException,
  ValidationPipe,
  type ArgumentMetadata,
} from '@nestjs/common';
import { PostType } from '@project/shared-types';
import { GetCommentQueryDto } from '../../comment/dto/get-comment-query.dto';
import { GetPostQueryDto } from './get-post-query.dto';
import { SearchPostQueryDto } from './search-post-query.dto';

type ValidationResponse = {
  message: string[];
};

describe('Blog query DTO validation', () => {
  const validationPipe = new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
    stopAtFirstError: false,
    transformOptions: {
      enableImplicitConversion: true,
    },
    validationError: {
      target: false,
      value: false,
    },
  });

  async function transformQuery<T extends object>(
    metatype: new () => T,
    value: Record<string, unknown>,
  ): Promise<T> {
    return validationPipe.transform(value, {
      metatype,
      type: 'query' as ArgumentMetadata['type'],
    }) as Promise<T>;
  }

  async function getValidationMessages(
    promise: Promise<unknown>,
  ): Promise<string[]> {
    try {
      await promise;
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestException);
      const response = (error as BadRequestException).getResponse();
      return (response as ValidationResponse).message;
    }

    throw new Error('Validation should fail');
  }

  it('transforms and accepts valid post filters', async () => {
    const query = await transformQuery(GetPostQueryDto, {
      limit: '10',
      page: '2',
      sortBy: 'likes',
      type: PostType.Text,
      tag: 'NestJS',
      authorId: 'user-id-123',
    });

    expect(query).toBeInstanceOf(GetPostQueryDto);
    expect(query.limit).toBe(10);
    expect(query.page).toBe(2);
    expect(query.tag).toBe('nestjs');
  });

  it('rejects invalid post filters', async () => {
    const messages = await getValidationMessages(
      transformQuery(GetPostQueryDto, {
        limit: '26',
        page: '1.5',
        sortBy: 'unknown',
        type: 'unknown',
      }),
    );

    expect(messages).toEqual(
      expect.arrayContaining([
        'limit must not be greater than 25',
        'page must be an integer number',
        'sortBy must be one of the following values: publishedAt, likes, comments',
        'type must be one of the following values: video, text, quote, photo, link',
      ]),
    );
  });

  it('transforms and accepts valid comment filters', async () => {
    const query = await transformQuery(GetCommentQueryDto, {
      limit: '25',
      page: '3',
    });

    expect(query).toBeInstanceOf(GetCommentQueryDto);
    expect(query.limit).toBe(25);
    expect(query.page).toBe(3);
  });

  it('rejects invalid comment filters', async () => {
    const messages = await getValidationMessages(
      transformQuery(GetCommentQueryDto, {
        limit: '51',
        page: '0',
      }),
    );

    expect(messages).toEqual(
      expect.arrayContaining([
        'limit must not be greater than 50',
        'page must not be less than 1',
      ]),
    );
  });

  it('trims and accepts valid search query', async () => {
    const query = await transformQuery(SearchPostQueryDto, {
      title: '  nestjs  ',
    });

    expect(query).toBeInstanceOf(SearchPostQueryDto);
    expect(query.title).toBe('nestjs');
  });

  it('rejects empty search query', async () => {
    const messages = await getValidationMessages(
      transformQuery(SearchPostQueryDto, { title: '   ' }),
    );

    expect(messages).toContain(
      'title must be longer than or equal to 1 characters',
    );
  });
});
