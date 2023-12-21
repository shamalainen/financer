import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '@prisma/client';

import { parseObjectId } from '../../types/objectId';

export const UserId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as User;

    return user.id;
  },
);

export const UserIdOld = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as User;

    return parseObjectId(user.id);
  },
);
