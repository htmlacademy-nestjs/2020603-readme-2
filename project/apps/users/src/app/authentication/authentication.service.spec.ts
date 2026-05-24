
import { Test, TestingModule } from '@nestjs/testing';
import { AuthenticationService } from './authentication.service';
import { PasswordHasher } from './password.hasher';
import { UserRepository } from '../user/user.repository';

describe('AuthenticationService', () => {
  let service: AuthenticationService;

  beforeEach(async () => {
    const userRepositoryMock: Partial<UserRepository> = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      create: jest.fn(),
      updatePasswordHash: jest.fn(),
      deleteById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthenticationService,
        PasswordHasher,
        { provide: UserRepository, useValue: userRepositoryMock },
      ],
    }).compile();

    service = module.get<AuthenticationService>(AuthenticationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
