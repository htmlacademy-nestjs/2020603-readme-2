export interface NotifyPostEntity {
  id: string;
  postId: string;
  title: string | null;
  type: string;
  authorId: string;
  publishedAt: Date;
  createdAt: Date;
  notifiedAt: Date | null;
}
