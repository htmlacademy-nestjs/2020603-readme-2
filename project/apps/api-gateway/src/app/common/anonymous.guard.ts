import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
} from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import type { TokenPayload } from '@project/shared-types';
import { jwtConfig } from '../config';
import { AlreadyAuthenticatedError } from './auth-token.errors';
import { extractBearerToken } from './extract-bearer-token';

/**
 * §1.1: регистрация доступна только анонимным клиентам. Валидный Bearer-токен
 * блокирует маршрут; отсутствующий или недействительный токен не мешает —
 * такой клиент анонимен.
 */
@Injectable()
export class AnonymousGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private readonly tokenConfig: ConfigType<typeof jwtConfig>,
  ) {}

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = extractBearerToken(request);

    if (!token) {
      return true;
    }

    try {
      await this.jwtService.verifyAsync<TokenPayload>(token, {
        secret: this.tokenConfig.accessTokenSecret,
      });
    } catch {
      return true;
    }

    throw new AlreadyAuthenticatedError();
  }
}
