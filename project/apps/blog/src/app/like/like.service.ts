import { Injectable } from '@nestjs/common';
import { LikeRepository } from './like.repository';
import { PostService } from '../post/post.service';
import { LikeAlreadyExistsError, LikeNotFoundError } from './like.errors';

@Injectable()
export class LikeService {
  constructor(
    private readonly likeRepository: LikeRepository,
    private readonly postService: PostService,
  ) {}

  public async add(postId: string, userId: string) {
    // §5.2: лайкать можно только опубликованную публикацию.
    await this.postService.getPublishedById(postId);

    const existing = await this.likeRepository.findByPostAndUser(
      postId,
      userId,
    );
    if (existing) {
      throw new LikeAlreadyExistsError(postId);
    }

    // Счётчик лайков не храним — он вычисляется через Prisma _count при чтении поста.
    return this.likeRepository.save(postId, userId);
  }

  /** §5.3: забрать можно только ранее оставленный лайк. */
  public async remove(postId: string, userId: string) {
    await this.postService.getPublishedById(postId);

    const existing = await this.likeRepository.findByPostAndUser(
      postId,
      userId,
    );
    if (!existing) {
      throw new LikeNotFoundError(postId);
    }

    await this.likeRepository.deleteByPostAndUser(postId, userId);
  }
}
