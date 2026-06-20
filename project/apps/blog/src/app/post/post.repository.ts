import { Injectable } from '@nestjs/common';
import {
  LinkPost,
  PhotoPost,
  PostStatus,
  PostType,
  QuotePost,
  TextPost,
  VideoPost,
} from '@project/shared-types';
import type { Post } from '@project/shared-types';
import { PrismaService } from '../prisma/prisma.service';
import { DEFAULT_LIMIT } from './post.constant';

export type PostSortBy = 'publishedAt' | 'likes' | 'comments';

export type PostQuery = {
  limit?: number;
  page?: number;
  sortBy?: PostSortBy;
  type?: PostType;
  tag?: string;
  authorId?: string;
};

// Запись таблицы posts вместе со связями, нужными для маппинга в домен.
type PostWithRelations = {
  id: string;
  type: string;
  status: string;
  authorId: string;
  isRepost: boolean;
  originalAuthorId: string | null;
  originalPostId: string | null;
  title: string | null;
  videoUrl: string | null;
  announce: string | null;
  text: string | null;
  quoteText: string | null;
  quoteAuthor: string | null;
  photoUrl: string | null;
  link: string | null;
  linkDescription: string | null;
  createdAt: Date;
  publishedAt: Date;
  tags: { title: string }[];
  _count: { likes: number; comments: number };
};

const POST_INCLUDE = {
  tags: { select: { title: true } },
  _count: { select: { likes: true, comments: true } },
} as const;

@Injectable()
export class PostRepository {
  constructor(private readonly prisma: PrismaService) {}

  private toDomain(record: PostWithRelations): Post {
    const base = {
      id: record.id,
      status: record.status as PostStatus,
      authorId: record.authorId,
      originalAuthorId: record.originalAuthorId ?? undefined,
      isRepost: record.isRepost,
      originalPostId: record.originalPostId ?? undefined,
      tags: record.tags.map((tag) => tag.title),
      createdAt: record.createdAt,
      publishedAt: record.publishedAt,
      likesCount: record._count.likes,
      commentsCount: record._count.comments,
    };

    switch (record.type as PostType) {
      case PostType.Video:
        return Object.assign(new VideoPost(), base, {
          title: record.title ?? '',
          videoUrl: record.videoUrl ?? '',
        });
      case PostType.Text:
        return Object.assign(new TextPost(), base, {
          title: record.title ?? '',
          announce: record.announce ?? '',
          text: record.text ?? '',
        });
      case PostType.Quote:
        return Object.assign(new QuotePost(), base, {
          quoteText: record.quoteText ?? '',
          quoteAuthor: record.quoteAuthor ?? '',
        });
      case PostType.Photo:
        return Object.assign(new PhotoPost(), base, {
          photoUrl: record.photoUrl ?? '',
        });
      case PostType.Link:
        return Object.assign(new LinkPost(), base, {
          link: record.link ?? '',
          description: record.linkDescription ?? undefined,
        });
    }
  }

  // Раскладывает доменный пост по колонкам таблицы (без id/служебных связей).
  private toTypeColumns(post: Post) {
    switch (post.type) {
      case PostType.Video:
        return { title: post.title, videoUrl: post.videoUrl };
      case PostType.Text:
        return { title: post.title, announce: post.announce, text: post.text };
      case PostType.Quote:
        return { quoteText: post.quoteText, quoteAuthor: post.quoteAuthor };
      case PostType.Photo:
        return { photoUrl: post.photoUrl };
      case PostType.Link:
        return { link: post.link, linkDescription: post.description };
    }
  }

  private tagsConnectOrCreate(tags: string[]) {
    return tags.map((title) => ({
      where: { title },
      create: { title },
    }));
  }

  public async findById(id: string): Promise<Post | null> {
    const record = await this.prisma.post.findUnique({
      where: { id },
      include: POST_INCLUDE,
    });
    return record ? this.toDomain(record as PostWithRelations) : null;
  }

  public async findAll(query: PostQuery): Promise<Post[]> {
    const {
      limit = DEFAULT_LIMIT,
      page = 1,
      sortBy = 'publishedAt',
      type,
      tag,
      authorId,
    } = query;

    const orderBy =
      sortBy === 'likes'
        ? { likes: { _count: 'desc' as const } }
        : sortBy === 'comments'
          ? { comments: { _count: 'desc' as const } }
          : { publishedAt: 'desc' as const };

    const records = await this.prisma.post.findMany({
      where: {
        status: PostStatus.Published,
        ...(type ? { type } : {}),
        ...(authorId ? { authorId } : {}),
        ...(tag ? { tags: { some: { title: tag } } } : {}),
      },
      include: POST_INCLUDE,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
    });

    return records.map((record) => this.toDomain(record as PostWithRelations));
  }

  public async findDrafts(authorId: string): Promise<Post[]> {
    const records = await this.prisma.post.findMany({
      where: { authorId, status: PostStatus.Draft },
      include: POST_INCLUDE,
      orderBy: { createdAt: 'desc' },
    });
    return records.map((record) => this.toDomain(record as PostWithRelations));
  }

  public async findByTitle(title: string): Promise<Post[]> {
    const records = await this.prisma.post.findMany({
      where: {
        status: PostStatus.Published,
        title: { contains: title, mode: 'insensitive' },
      },
      include: POST_INCLUDE,
      take: 20,
    });
    return records.map((record) => this.toDomain(record as PostWithRelations));
  }

  public async findRepost(
    originalPostId: string,
    authorId: string,
  ): Promise<Post | null> {
    const record = await this.prisma.post.findFirst({
      where: { isRepost: true, originalPostId, authorId },
      include: POST_INCLUDE,
    });
    return record ? this.toDomain(record as PostWithRelations) : null;
  }

  public async save(post: Post): Promise<Post> {
    const record = await this.prisma.post.create({
      data: {
        type: post.type,
        status: post.status,
        authorId: post.authorId,
        isRepost: post.isRepost,
        originalAuthorId: post.originalAuthorId,
        originalPostId: post.originalPostId,
        publishedAt: post.publishedAt,
        ...this.toTypeColumns(post),
        tags: { connectOrCreate: this.tagsConnectOrCreate(post.tags) },
      },
      include: POST_INCLUDE,
    });
    return this.toDomain(record as PostWithRelations);
  }

  public async update(post: Post): Promise<Post> {
    const record = await this.prisma.post.update({
      where: { id: post.id },
      data: {
        status: post.status,
        publishedAt: post.publishedAt,
        ...this.toTypeColumns(post),
        tags: { set: [], connectOrCreate: this.tagsConnectOrCreate(post.tags) },
      },
      include: POST_INCLUDE,
    });
    return this.toDomain(record as PostWithRelations);
  }

  public async deleteById(id: string): Promise<void> {
    await this.prisma.post.delete({ where: { id } });
  }
}
