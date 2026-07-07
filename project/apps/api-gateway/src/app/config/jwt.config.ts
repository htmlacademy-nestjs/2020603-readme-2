import { registerAs } from '@nestjs/config';

export interface JwtConfig {
  accessTokenSecret: string;
}

export const JWT_CONFIG_NAMESPACE = 'jwt';

export const jwtConfig = registerAs(
  JWT_CONFIG_NAMESPACE,
  (): JwtConfig => ({
    accessTokenSecret: process.env.JWT_ACCESS_TOKEN_SECRET as string,
  }),
);
