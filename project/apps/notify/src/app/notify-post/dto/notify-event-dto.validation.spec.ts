import { BadRequestException, type ArgumentMetadata } from '@nestjs/common';
import { createValidationPipe } from '@project/shared-config';
import { PostType } from '@project/shared-types';
import { PostPublishedDto } from './post-published.dto';
import { PostUnpublishedDto } from './post-unpublished.dto';

const POST_ID = 'a1d2c3b4-5e6f-47a8-9b0c-1d2e3f4a5b6c';

describe('Notify event DTO validation', () => {
  const validationPipe = createValidationPipe();

  async function transformPayload<T extends object>(
    metatype: new () => T,
    value: Record<string, unknown>,
  ): Promise<unknown> {
    return validationPipe.transform(value, {
      metatype,
      type: 'body' as ArgumentMetadata['type'],
    });
  }

  it('converts publishedAt of a post.published event to Date', async () => {
    const dto = (await transformPayload(PostPublishedDto, {
      postId: POST_ID,
      title: 'Мой первый пост о TypeScript разработке',
      type: PostType.Text,
      authorId: '2f4b7d3a-3c1b-4c4d-8b6a-8ef7b92f1011',
      publishedAt: '2026-09-01T00:00:00.000Z',
    })) as PostPublishedDto;

    expect(dto.publishedAt).toBeInstanceOf(Date);
    expect(dto.publishedAt.toISOString()).toBe('2026-09-01T00:00:00.000Z');
  });

  it('rejects a post.unpublished event with a malformed post id', async () => {
    await expect(
      transformPayload(PostUnpublishedDto, { postId: 'not-a-uuid' }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
