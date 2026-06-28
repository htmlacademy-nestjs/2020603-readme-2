
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { User } from '@project/shared-types';
import { AuthenticationService } from './authentication.service';
import { PasswordHasher } from './password.hasher';
import { UserRepository } from '../user/user.repository';
import { jwtConfig } from '../config';

describe('AuthenticationService', () => {
  let service: AuthenticationService;
  let jwtService: Pick<JwtService, 'signAsync'>;

  beforeEach(async () => {
    const userRepositoryMock: Partial<UserRepository> = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      create: jest.fn(),
      updatePasswordHash: jest.fn(),
      deleteById: jest.fn(),
    };
    jwtService = {
      signAsync: jest
        .fn()
        .mockResolvedValueOnce('access-token')
        .mockResolvedValueOnce('refresh-token'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthenticationService,
        PasswordHasher,
        { provide: UserRepository, useValue: userRepositoryMock },
        { provide: JwtService, useValue: jwtService },
        {
          provide: jwtConfig.KEY,
          useValue: {
            accessTokenSecret: 'access-token-secret-for-tests',
            accessTokenExpiresIn: '15m',
            refreshTokenSecret: 'refresh-token-secret-for-tests',
            refreshTokenExpiresIn: '7d',
          },
        },
      ],
    }).compile();

    service = module.get<AuthenticationService>(AuthenticationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create access and refresh tokens', async () => {
    const user = Object.assign(new User(), {
      id: 'user-id',
      email: 'user@example.com',
      name: 'Иван Иванов',
    });

    await expect(service.createTokens(user)).resolves.toEqual({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    });

    expect(jwtService.signAsync).toHaveBeenNthCalledWith(
      1,
      { sub: user.id, email: user.email, name: user.name },
      {
        secret: 'access-token-secret-for-tests',
        expiresIn: '15m',
      },
    );
    expect(jwtService.signAsync).toHaveBeenNthCalledWith(
      2,
      { sub: user.id, email: user.email, name: user.name },
      {
        secret: 'refresh-token-secret-for-tests',
        expiresIn: '7d',
      },
    );
  });
});
