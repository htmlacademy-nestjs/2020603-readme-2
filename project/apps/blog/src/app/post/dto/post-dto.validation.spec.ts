import { BadRequestException, type ArgumentMetadata } from '@nestjs/common';
import { PostStatus, PostTag, YoutubeUrl } from '@project/shared-types';
import { createValidationPipe } from '@project/shared-config';
import { CreateTextPostDto } from './create-text-post.dto';
import { CreateVideoPostDto } from './create-video-post.dto';
import { UpdatePostDto } from '@project/shared-dto';

type ValidationResponse = {
  message: string[];
};

const VALID_TEXT_POST = {
  type: 'text',
  title: 'Мой первый пост о TypeScript разработке',
  announce:
    'Краткий анонс публикации, который заинтересует читателя и расскажет о сути.',
  text: 'Полный текст публикации о том, как мы подключили PostgreSQL и Prisma ORM к сервису Blog, и что из этого вышло.',
};

describe('Blog post DTO validation', () => {
  const validationPipe = createValidationPipe();

  async function transformBody<T extends object>(
    metatype: new () => T,
    value: Record<string, unknown>,
  ): Promise<unknown> {
    return validationPipe.transform(value, {
      metatype,
      type: 'body' as ArgumentMetadata['type'],
    });
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

  describe('tags', () => {
    it('accepts valid tags in any case', async () => {
      await expect(
        transformBody(CreateTextPostDto, {
          ...VALID_TEXT_POST,
          tags: ['NestJS', 'prisma', 'тег'],
        }),
      ).resolves.toBeInstanceOf(CreateTextPostDto);
    });

    it('rejects a tag with a space, a leading digit, or a bad length', async () => {
      const messages = await getValidationMessages(
        transformBody(CreateTextPostDto, {
          ...VALID_TEXT_POST,
          tags: ['two words', '1abc', 'ab', 'abcdefghijk'],
        }),
      );

      expect(messages).toContain(PostTag.ValidationMessage);
    });

    it('rejects more than 8 tags', async () => {
      const messages = await getValidationMessages(
        transformBody(CreateTextPostDto, {
          ...VALID_TEXT_POST,
          tags: [
            'one',
            'two',
            'three',
            'four',
            'five',
            'six',
            'seven',
            'eight',
            'nine',
          ],
        }),
      );

      expect(messages).toContain('tags must contain no more than 8 elements');
    });

    it('accepts repeated tags beyond the limit and keeps unique lowercase ones', async () => {
      const dto = (await transformBody(CreateTextPostDto, {
        ...VALID_TEXT_POST,
        tags: Array.from({ length: PostTag.MaxCount + 1 }, (_, index) =>
          index % 2 === 0 ? 'NestJS' : 'nestjs',
        ),
      })) as CreateTextPostDto;

      expect(dto.tags).toEqual(['nestjs']);
    });
  });

  describe('videoUrl', () => {
    const VALID_VIDEO_POST = {
      type: 'video',
      title: 'Как выучить TypeScript за двадцать минут',
    };

    it.each([
      'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      'https://m.youtube.com/watch?v=dQw4w9WgXcQ',
      'https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=30s',
      'https://www.youtube.com/watch?feature=share&v=dQw4w9WgXcQ',
      'https://youtu.be/dQw4w9WgXcQ?si=AbC-12_x',
      'https://www.youtube.com/shorts/aBcD3fGh1_-',
      'https://www.youtube.com/embed/dQw4w9WgXcQ',
      'https://www.youtube.com/live/dQw4w9WgXcQ',
    ])('accepts %s', async (videoUrl) => {
      await expect(
        transformBody(CreateVideoPostDto, { ...VALID_VIDEO_POST, videoUrl }),
      ).resolves.toBeInstanceOf(CreateVideoPostDto);
    });

    it.each([
      'https://vimeo.com/123456',
      'https://www.youtube.com/watch?v=abc123',
      'https://www.youtube.com/watch?v=dQw4w9WgXcQxyz',
      'https://www.youtube.com/@channel',
      'https://youtube.com.evil.com/watch?v=dQw4w9WgXcQ',
      'https://evil.com/?u=https://youtu.be/dQw4w9WgXcQ',
    ])('rejects %s', async (videoUrl) => {
      const messages = await getValidationMessages(
        transformBody(CreateVideoPostDto, { ...VALID_VIDEO_POST, videoUrl }),
      );

      expect(messages).toContain(YoutubeUrl.ValidationMessage);
    });

    it('applies the same rule when a video post is edited', async () => {
      const messages = await getValidationMessages(
        transformBody(UpdatePostDto, { videoUrl: 'https://vimeo.com/123456' }),
      );

      expect(messages).toContain(YoutubeUrl.ValidationMessage);
    });
  });

  describe('UpdatePostDto', () => {
    it('accepts a partial update with publishedAt and status', async () => {
      const dto = (await transformBody(UpdatePostDto, {
        publishedAt: '2026-09-13T10:00:00.000Z',
        status: PostStatus.Draft,
      })) as UpdatePostDto;

      expect(dto).toBeInstanceOf(UpdatePostDto);
      expect(dto.publishedAt).toBeInstanceOf(Date);
      expect(dto.status).toBe(PostStatus.Draft);
    });

    it('rejects an unknown status and a short title', async () => {
      const messages = await getValidationMessages(
        transformBody(UpdatePostDto, {
          title: 'Слишком коротко',
          status: 'archived',
        }),
      );

      expect(messages).toEqual(
        expect.arrayContaining([
          'title must be longer than or equal to 20 characters',
          'status must be one of the following values: published, draft',
        ]),
      );
    });

    it('rejects an unknown property', async () => {
      const messages = await getValidationMessages(
        transformBody(UpdatePostDto, { authorId: 'someone-else' }),
      );

      expect(messages).toContain('property authorId should not exist');
    });
  });
});
