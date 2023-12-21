import { Role, User } from '@prisma/client';
import { NextFunction, Request, Response } from 'express';

export const DUMMY_TEST_USER: Partial<User> = {
  roles: [Role.TEST_USER],
  id: '61460d7354ea082ad0256749',
  name: 'Dummy Test User',
};

export const mockAuthenticationMiddleware = (
  req: Request,
  _: Response,
  next: NextFunction,
): void => {
  req.user = DUMMY_TEST_USER;
  req.isAuthenticated = () => true;
  next();
};
