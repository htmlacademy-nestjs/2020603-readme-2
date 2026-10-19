import type { Request } from 'express';

const BEARER_AUTH_SCHEME = 'Bearer';

/** Токен из заголовка `Authorization: Bearer <token>` или undefined. */
export function extractBearerToken(request: Request): string | undefined {
  const [scheme, token] = (request.headers.authorization ?? '').split(' ');
  return scheme === BEARER_AUTH_SCHEME && token ? token : undefined;
}
