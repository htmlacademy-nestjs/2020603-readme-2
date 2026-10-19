import { LikeService } from './like.service';
import { LikeRepository } from './like.repository';
import { PostService } from '../post/post.service';
import { LikeAlreadyExistsError, LikeNotFoundError } from './like.errors';
import { PostNotFoundError } from '../post/post.errors';

const USER_ID = '2f4b7d3a-3c1b-4c4d-8b6a-8ef7b92f1011';
const POST_ID = 'a1d2c3b4-5e6f-47a8-9b0c-1d2e3f4a5b6c';

describe('LikeService', () => {
  let service: LikeService;
  let repository: jest.Mocked<
    Pick<LikeRepository, 'findByPostAndUser' | 'save' | 'deleteByPostAndUser'>
  >;
  let postService: jest.Mocked<Pick<PostService, 'getPublishedById'>>;

  beforeEach(() => {
    repository = {
      findByPostAndUser: jest.fn(),
      save: jest.fn(),
      deleteByPostAndUser: jest.fn(),
    } as unknown as jest.Mocked<typeof repository>;
    postService = { getPublishedById: jest.fn() } as unknown as jest.Mocked<
      typeof postService
    >;

    service = new LikeService(
      repository as unknown as LikeRepository,
      postService as unknown as PostService,
    );
  });

  it('rejects liking a draft or missing post', async () => {
    postService.getPublishedById.mockRejectedValue(
      new PostNotFoundError(POST_ID),
    );

    await expect(service.add(POST_ID, USER_ID)).rejects.toBeInstanceOf(
      PostNotFoundError,
    );
    expect(repository.save).not.toHaveBeenCalled();
  });

  it('rejects a second like from the same user', async () => {
    postService.getPublishedById.mockResolvedValue(
      {} as Awaited<ReturnType<PostService['getPublishedById']>>,
    );
    repository.findByPostAndUser.mockResolvedValue({
      id: 'like-id',
      postId: POST_ID,
      userId: USER_ID,
      createdAt: new Date(),
    });

    await expect(service.add(POST_ID, USER_ID)).rejects.toBeInstanceOf(
      LikeAlreadyExistsError,
    );
  });

  it('stores a like for a published post', async () => {
    postService.getPublishedById.mockResolvedValue(
      {} as Awaited<ReturnType<PostService['getPublishedById']>>,
    );
    repository.findByPostAndUser.mockResolvedValue(null);

    await service.add(POST_ID, USER_ID);

    expect(repository.save).toHaveBeenCalledWith(POST_ID, USER_ID);
  });

  it('removes a like from a published post', async () => {
    postService.getPublishedById.mockResolvedValue(
      {} as Awaited<ReturnType<PostService['getPublishedById']>>,
    );
    repository.findByPostAndUser.mockResolvedValue({
      id: 'like-id',
      postId: POST_ID,
      userId: USER_ID,
      createdAt: new Date(),
    });

    await service.remove(POST_ID, USER_ID);

    expect(repository.deleteByPostAndUser).toHaveBeenCalledWith(
      POST_ID,
      USER_ID,
    );
  });

  it('rejects removing a like that was not given (§5.3)', async () => {
    postService.getPublishedById.mockResolvedValue(
      {} as Awaited<ReturnType<PostService['getPublishedById']>>,
    );
    repository.findByPostAndUser.mockResolvedValue(null);

    await expect(service.remove(POST_ID, USER_ID)).rejects.toBeInstanceOf(
      LikeNotFoundError,
    );
    expect(repository.deleteByPostAndUser).not.toHaveBeenCalled();
  });
});
