import {CanActivate, ExecutionContext, Inject, Injectable} from '@nestjs/common';
import type {ConfigType} from '@nestjs/config';
import {JwtService} from '@nestjs/jwt';
import type {Request} from 'express';
import type {TokenPayload} from '@project/shared-types';
import {jwtConfig} from '../config';
import {InvalidTokenError, TokenNotProvidedError} from './auth-token.errors';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private readonly tokenConfig: ConfigType<typeof jwtConfig>,
  ) {}

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request & { user?: TokenPayload }>();
    const token = this.extractToken(request);

    if (!token) {
      throw new TokenNotProvidedError();
    }

    try {
      request.user = await this.jwtService.verifyAsync<TokenPayload>(token, {
        secret: this.tokenConfig.accessTokenSecret,
      });
      return true;
    } catch {
      throw new InvalidTokenError();
    }
  }

  private extractToken(request: Request): string | undefined {
    const [type, token] = (request.headers.authorization ?? '').split(' ');
    return type === 'Bearer' ? token : undefined;
  }
}
