import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';

import { AccountsService } from '../accounts/accounts.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private accountsService: AccountsService,
  ) {}

  async getAuthenticationStatus(user?: User) {
    const accounts = user
      ? await this.accountsService.findAllByUser(user.id)
      : { data: [] };
    return {
      authenticated: Boolean(user),
      payload: user,
      hasAccounts: Boolean(accounts?.data?.length),
    };
  }

  async validateUserByGithub(githubId: string): Promise<User> {
    return this.usersService.findOneByGithubId(githubId);
  }

  async validateUserByAuth0(auht0Id: string): Promise<User> {
    return this.usersService.findOneByAuth0Id(auht0Id);
  }
}
