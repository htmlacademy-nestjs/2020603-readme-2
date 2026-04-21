import type { Comment } from '@project/shared-types';

export class CommentEntity implements Comment {
  public id: string;
  public postId: string;
  public authorId: string;
  public text: string;
  public createdAt: Date;

  constructor(data: Comment) {
    this.id = data.id;
    this.postId = data.postId;
    this.authorId = data.authorId;
    this.text = data.text;
    this.createdAt = data.createdAt;
  }
}
