import { registerAs } from '@nestjs/config';

export interface JwtConfig {
  accessTokenSecret: string;
  accessTokenExpiresIn: string;
  refreshTokenSecret: string;
  refreshTokenExpiresIn: string;
}

export const JWT_CONFIG_NAMESPACE = 'jwt';

export const jwtConfig = registerAs(
  JWT_CONFIG_NAMESPACE,
  (): JwtConfig => ({
    accessTokenSecret: process.env.JWT_ACCESS_TOKEN_SECRET as string,
    accessTokenExpiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRES_IN as string,
    refreshTokenSecret: process.env.JWT_REFRESH_TOKEN_SECRET as string,
    refreshTokenExpiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRES_IN as string,
  }),
);
