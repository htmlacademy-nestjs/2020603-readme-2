import { Module } from '@nestjs/common';
import { PostController } from './post/post.controller';
import { PostService } from './post/post.service';
import { PostMemoryRepository } from './post/post-memory.repository';
import { CommentController } from './comment/comment.controller';
import { CommentService } from './comment/comment.service';
import { CommentMemoryRepository } from './comment/comment-memory.repository';
import { LikeController } from './like/like.controller';
import { LikeService } from './like/like.service';
import { LikeMemoryRepository } from './like/like-memory.repository';

@Module({
  controllers: [PostController, CommentController, LikeController],
  providers: [
    PostService,
    PostMemoryRepository,
    CommentService,
    CommentMemoryRepository,
    LikeService,
    LikeMemoryRepository,
  ],
})
export class AppModule {}
