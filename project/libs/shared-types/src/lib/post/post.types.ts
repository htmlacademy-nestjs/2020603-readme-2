import { PostStatus } from './post-status.enum.js';
import { PostType } from './post-type.enum.js';

interface PostBase {
  id: string;
  status: PostStatus;
  authorId: string;
  originalAuthorId?: string;
  isRepost: boolean;
  originalPostId?: string;
  tags: string[];
  createdAt: Date;
  publishedAt: Date;
  likesCount: number;
  commentsCount: number;
}

export interface VideoPost extends PostBase {
  type: PostType.Video;
  title: string;
  videoUrl: string;
}

export interface TextPost extends PostBase {
  type: PostType.Text;
  title: string;
  announce: string;
  text: string;
}

export interface QuotePost extends PostBase {
  type: PostType.Quote;
  quoteText: string;
  quoteAuthor: string;
}

export interface PhotoPost extends PostBase {
  type: PostType.Photo;
  photoUrl: string;
}

export interface LinkPost extends PostBase {
  type: PostType.Link;
  link: string;
  description?: string;
}

export type Post = VideoPost | TextPost | QuotePost | PhotoPost | LinkPost;
