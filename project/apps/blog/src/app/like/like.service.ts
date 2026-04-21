import { Injectable } from '@nestjs/common';
import { LikeMemoryRepository } from './like-memory.repository';
import { PostMemoryRepository } from '../post/post-memory.repository';
import { PostNotFoundError } from '../post/post.errors';
import { LikeAlreadyExistsError } from './like.errors';

@Injectable()
export class LikeService {
  constructor(
    private readonly likeRepository: LikeMemoryRepository,
    private readonly postRepository: PostMemoryRepository,
  ) {}

  public async addLike(postId: string, userId: string) {
    const post = await this.postRepository.findById(postId);
    if (!post) throw new PostNotFoundError(postId);

    const existing = await this.likeRepository.findByPostAndUser(postId, userId);
    if (existing) throw new LikeAlreadyExistsError(postId);

    const like = await this.likeRepository.save(postId, userId);
    post.likesCount += 1;
    await this.postRepository.update(post);
    return like;
  }

  public async removeLike(postId: string, userId: string) {
    const post = await this.postRepository.findById(postId);
    if (!post) throw new PostNotFoundError(postId);

    await this.likeRepository.deleteByPostAndUser(postId, userId);
    post.likesCount = Math.max(0, post.likesCount - 1);
    await this.postRepository.update(post);
  }
}
