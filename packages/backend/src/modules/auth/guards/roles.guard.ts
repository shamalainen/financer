import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';

import { BaseGuard } from './base.guard';

export const ROLES_KEY = 'roles';

@Injectable()
export class RolesGuard extends BaseGuard {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) {
      return true;
    }
    const user = this.getRequestUser(context);
    return requiredRoles.some((role) => user?.roles?.includes(role));
  }
}
