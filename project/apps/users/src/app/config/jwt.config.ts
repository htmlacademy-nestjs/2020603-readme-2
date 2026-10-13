import { registerAs } from '@nestjs/config';
import type { JwtSignOptions } from '@nestjs/jwt';

// Срок жизни токена в формате пакета ms («15m», «7d»), как его ждёт jsonwebtoken.
type TokenLifetime = NonNullable<JwtSignOptions['expiresIn']>;

export interface JwtConfig {
  accessTokenSecret: string;
  accessTokenExpiresIn: TokenLifetime;
  refreshTokenSecret: string;
  refreshTokenExpiresIn: TokenLifetime;
}

export const JWT_CONFIG_NAMESPACE = 'jwt';

export const jwtConfig = registerAs(
  JWT_CONFIG_NAMESPACE,
  (): JwtConfig => ({
    accessTokenSecret: process.env.JWT_ACCESS_TOKEN_SECRET as string,
    accessTokenExpiresIn: process.env
      .JWT_ACCESS_TOKEN_EXPIRES_IN as TokenLifetime,
    refreshTokenSecret: process.env.JWT_REFRESH_TOKEN_SECRET as string,
    refreshTokenExpiresIn: process.env
      .JWT_REFRESH_TOKEN_EXPIRES_IN as TokenLifetime,
  }),
);
