import { CanActivate, ExecutionContext } from '@nestjs/common';
import { User } from '@prisma/client';
import { Observable } from 'rxjs';

import { isNodeEnvInTest } from '../../../config/configuration';
import { DUMMY_TEST_USER } from '../../../config/mockAuthenticationMiddleware';

export abstract class BaseGuard implements CanActivate {
  canActivate(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    throw new Error('Method not implemented.');
  }

  protected getRequestUser(context: ExecutionContext): User {
    if (isNodeEnvInTest()) {
      return DUMMY_TEST_USER as User;
    }
    const request = context.switchToHttp().getRequest();
    return request.user;
  }
}
