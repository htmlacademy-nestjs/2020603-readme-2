import { PostStatus, PostType } from '@project/shared-types';
import type { Post } from '@project/shared-types';

export class PostEntity {
  public id: string;
  public type: PostType;
  public status: PostStatus;
  public authorId: string;
  public originalAuthorId?: string;
  public isRepost: boolean;
  public originalPostId?: string;
  public tags: string[];
  public createdAt: Date;
  public publishedAt: Date;
  public likesCount: number;
  public commentsCount: number;

  // Video / Text
  public title?: string;
  // Video
  public videoUrl?: string;
  // Text
  public announce?: string;
  public text?: string;
  // Quote
  public quoteText?: string;
  public quoteAuthor?: string;
  // Photo
  public photoUrl?: string;
  // Link
  public link?: string;
  public description?: string;

  constructor(data: Post) {
    this.id = data.id;
    this.type = data.type;
    this.status = data.status;
    this.authorId = data.authorId;
    this.originalAuthorId = data.originalAuthorId;
    this.isRepost = data.isRepost;
    this.originalPostId = data.originalPostId;
    this.tags = data.tags;
    this.createdAt = data.createdAt;
    this.publishedAt = data.publishedAt;
    this.likesCount = data.likesCount;
    this.commentsCount = data.commentsCount;

    if (data.type === PostType.Video) {
      this.title = data.title;
      this.videoUrl = data.videoUrl;
    } else if (data.type === PostType.Text) {
      this.title = data.title;
      this.announce = data.announce;
      this.text = data.text;
    } else if (data.type === PostType.Quote) {
      this.quoteText = data.quoteText;
      this.quoteAuthor = data.quoteAuthor;
    } else if (data.type === PostType.Photo) {
      this.photoUrl = data.photoUrl;
    } else if (data.type === PostType.Link) {
      this.link = data.link;
      this.description = data.description;
    }
  }

  public toObject(): PostEntity {
    return { ...this };
  }
}
