import { Injectable } from '@nestjs/common';
import { AccountBalanceChange } from '@prisma/client';

import { AccountBalanceChangeRepo } from '../../database/repos/account-balance-change.repo';

import { CreateAccountBalanceChangeDto } from './dto/create-account-balance-change.dto';

@Injectable()
export class AccountBalanceChangesService {
  constructor(
    private readonly accountBalanceChangeRepo: AccountBalanceChangeRepo,
  ) {}

  async create(
    createAccountBalanceChange: CreateAccountBalanceChangeDto,
  ): Promise<AccountBalanceChange> {
    return this.accountBalanceChangeRepo.create(createAccountBalanceChange);
  }

  async createMany(
    createAccountBalanceChanges: CreateAccountBalanceChangeDto[],
  ): Promise<void> {
    await this.accountBalanceChangeRepo.createMany(createAccountBalanceChanges);
  }

  async findAllByUser(userId: string): Promise<AccountBalanceChange[]> {
    return this.accountBalanceChangeRepo.findMany({ where: { userId } });
  }

  async findAllByUserAndAccount(
    userId: string,
    accountId: string,
  ): Promise<AccountBalanceChange[]> {
    return this.accountBalanceChangeRepo.findMany({
      where: { userId, accountId },
    });
  }

  async removeAllByUser(userId: string): Promise<void> {
    await this.accountBalanceChangeRepo.deleteMany({ userId });
  }
}
