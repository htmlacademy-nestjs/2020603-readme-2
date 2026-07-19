import { createParamDecorator } from '@nestjs/common';
import type { TokenPayload } from '@project/shared-types';

export const CurrentUser = createParamDecorator<
  keyof TokenPayload | undefined>((data, ctx) => {
  const request = ctx.switchToHttp().getRequest();
  const user = request.user as TokenPayload;
  return data ? user?.[data] : user;
});
