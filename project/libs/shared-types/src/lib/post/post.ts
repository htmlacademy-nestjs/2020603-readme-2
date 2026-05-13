import { PostStatus } from './post-status.enum.js';
import { PostType } from './post-type.enum.js';

export abstract class PostBase {
  public id!: string;
  public status!: PostStatus;
  public authorId!: string;
  public originalAuthorId?: string;
  public isRepost!: boolean;
  public originalPostId?: string;
  public tags!: string[];
  public createdAt!: Date;
  public publishedAt!: Date;
  public likesCount!: number;
  public commentsCount!: number;

  public abstract readonly type: PostType;
}

export class VideoPost extends PostBase {
  public override readonly type = PostType.Video;
  public title!: string;
  public videoUrl!: string;
}

export class TextPost extends PostBase {
  public override readonly type = PostType.Text;
  public title!: string;
  public announce!: string;
  public text!: string;
}

export class QuotePost extends PostBase {
  public override readonly type = PostType.Quote;
  public quoteText!: string;
  public quoteAuthor!: string;
}

export class PhotoPost extends PostBase {
  public override readonly type = PostType.Photo;
  public photoUrl!: string;
}

export class LinkPost extends PostBase {
  public override readonly type = PostType.Link;
  public link!: string;
  public description?: string;
}

export type Post = VideoPost | TextPost | QuotePost | PhotoPost | LinkPost;
