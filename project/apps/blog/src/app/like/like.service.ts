import { Injectable } from '@nestjs/common';
import { LikeRepository } from './like.repository';
import { PostRepository } from '../post/post.repository';
import { PostNotFoundError } from '../post/post.errors';
import { LikeAlreadyExistsError } from './like.errors';

@Injectable()
export class LikeService {
  constructor(
    private readonly likeRepository: LikeRepository,
    private readonly postRepository: PostRepository,
  ) {}

  public async addLike(postId: string, userId: string) {
    const post = await this.postRepository.findById(postId);
    if (!post) throw new PostNotFoundError(postId);

    const existing = await this.likeRepository.findByPostAndUser(postId, userId);
    if (existing) throw new LikeAlreadyExistsError(postId);

    // Счётчик лайков не храним — он вычисляется через Prisma _count при чтении поста.
    return this.likeRepository.save(postId, userId);
  }

  public async removeLike(postId: string, userId: string) {
    const post = await this.postRepository.findById(postId);
    if (!post) throw new PostNotFoundError(postId);

    await this.likeRepository.deleteByPostAndUser(postId, userId);
  }
}
