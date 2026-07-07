import {
  BadRequestException,
  ValidationPipe,
  type ArgumentMetadata,
} from '@nestjs/common';
import { ChangeUserPasswordDto } from './change-user-password.dto';
import { CreateUserDto } from './create-user.dto';
import { LoginUserDto } from './login-user.dto';
import { UserIdParamDto } from '../../user/dto/user-id-param.dto';

type ValidationResponse = {
  message: string[];
};

describe('Authentication DTO validation', () => {
  const validationPipe = new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
    stopAtFirstError: false,
    transformOptions: {
      enableImplicitConversion: true,
    },
    validationError: {
      target: false,
      value: false,
    },
  });

  async function transformDto<T extends object>(
    metatype: new () => T,
    value: Record<string, unknown>,
    type: ArgumentMetadata['type'] = 'body',
  ): Promise<unknown> {
    return validationPipe.transform(value, { metatype, type });
  }

  async function getValidationMessages(
    promise: Promise<unknown>,
  ): Promise<string[]> {
    try {
      await promise;
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestException);
      const response = (error as BadRequestException).getResponse();
      return (response as ValidationResponse).message;
    }

    throw new Error('Validation should fail');
  }

  it('accepts valid registration data', async () => {
    await expect(
      transformDto(CreateUserDto, {
        email: 'user@example.com',
        name: 'Иван Иванов',
        password: 'secret123',
        avatarUrl: 'https://example.com/avatar.jpg',
      }),
    ).resolves.toBeInstanceOf(CreateUserDto);
  });

  it('accepts localhost avatarUrl (file-storage statics, require_tld:false)', async () => {
    await expect(
      transformDto(CreateUserDto, {
        email: 'user@example.com',
        name: 'Иван Иванов',
        password: 'secret123',
        avatarUrl: 'http://localhost:3004/static/avatars/2026/01/abc.jpg',
      }),
    ).resolves.toBeInstanceOf(CreateUserDto);
  });

  it('rejects invalid registration data with all field errors', async () => {
    const messages = await getValidationMessages(
      transformDto(CreateUserDto, {
        email: 'not-an-email',
        name: 'Iv',
        password: '123',
        avatarUrl: 'not-an-url',
      }),
    );

    expect(messages).toEqual(
      expect.arrayContaining([
        'email must be an email',
        'name must be longer than or equal to 3 characters',
        'password must be longer than or equal to 6 characters',
        'avatarUrl must be a URL address',
      ]),
    );
  });

  it('rejects extra fields in login data', async () => {
    const messages = await getValidationMessages(
      transformDto(LoginUserDto, {
        email: 'user@example.com',
        password: 'secret123',
        role: 'admin',
      }),
    );

    expect(messages).toContain('property role should not exist');
  });

  it('accepts valid password change data', async () => {
    await expect(
      transformDto(ChangeUserPasswordDto, {
        currentPassword: 'secret123',
        newPassword: 'new12345',
      }),
    ).resolves.toBeInstanceOf(ChangeUserPasswordDto);
  });

  it('rejects invalid user route id', async () => {
    const messages = await getValidationMessages(
      transformDto(UserIdParamDto, { id: 'invalid-id' }, 'param'),
    );

    expect(messages).toContain('id must be a UUID');
  });
});
