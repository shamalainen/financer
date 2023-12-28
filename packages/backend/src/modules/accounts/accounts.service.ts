import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Account, AccountType } from '@prisma/client';

import { AccountRepo } from '../../database/repos/account.repo';
import { PaginationDto } from '../../types/pagination.dto';
import { sumArrayItems } from '../../utils/arrays';
import { AccountBalanceChangesService } from '../account-balance-changes/account-balance-changes.service';
import { TransactionsService } from '../transactions/transactions.service';

import { AccountBalanceHistoryDto } from './dto/account-balance-history.dto';
import { AccountDto } from './dto/account.dto';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';

@Injectable()
export class AccountsService {
  constructor(
    private readonly accountRepo: AccountRepo,
    @Inject(forwardRef(() => TransactionsService))
    private transactionsService: TransactionsService,
    private accountBalanceChangeService: AccountBalanceChangesService,
  ) {}

  async create(
    userId: string,
    createAccountDto: CreateAccountDto,
  ): Promise<Account> {
    return this.accountRepo.create({ ...createAccountDto, userId });
  }

  async createMany(
    createAccountDto: CreateAccountDto[],
    userId: string,
  ): Promise<void> {
    await this.accountRepo.createMany(
      createAccountDto.map((account) => ({ ...account, userId })),
    );
  }

  async findOne(userId: string, id: string): Promise<Account> {
    const account = await this.accountRepo.findOne({ id, userId });

    if (!account) {
      throw new NotFoundException('Account not found.');
    }

    return account;
  }

  async findAllByUser(
    userId: string,
    accountTypes?: AccountType[],
    limit = 20,
    page = 1,
  ): Promise<PaginationDto<AccountDto[]>> {
    const skip = page * limit - limit;

    const accounts = await this.accountRepo.findMany({
      where: { userId, isDeleted: false, type: { in: accountTypes } },
      take: limit,
      skip,
    });

    const totalCount = await this.accountRepo.getCount({
      where: { userId, isDeleted: false, type: { in: accountTypes } },
    });

    const lastPage = page ? Math.ceil(totalCount / limit) : 1;

    return {
      data: accounts,
      currentPage: page ?? 1,
      limit: page ? limit : totalCount,
      totalPageCount: lastPage,
      hasNextPage: (page ?? 1) < lastPage,
      hasPreviousPage: (page ?? 1) > 1,
      totalRowCount: totalCount,
    };
  }

  async findAllIncludeDeletedByUser(userId: string): Promise<Account[]> {
    return this.accountRepo.findMany({ where: { userId } });
  }

  async update(
    userId: string,
    id: string,
    updateAccountDto: UpdateAccountDto,
  ): Promise<Account> {
    const accountBeforeChange = await this.findOne(userId, id);

    if (
      updateAccountDto.balance &&
      updateAccountDto.balance !== accountBeforeChange.balance
    ) {
      const balanceChangeAmount =
        updateAccountDto.balance - accountBeforeChange.balance;
      await this.accountBalanceChangeService.create({
        accountId: id.toString(),
        userId: userId.toString(),
        amount: balanceChangeAmount,
        date: new Date(),
      });
    }

    return this.accountRepo.update({
      where: { userId, id },
      data: updateAccountDto,
    });
  }

  async updateBalance(
    userId: string,
    id: string,
    amount: number,
  ): Promise<Account> {
    await this.findOne(userId, id);

    return this.accountRepo.update({
      where: { userId, id },
      data: { balance: { increment: amount } },
    });
  }

  async remove(id: string, userId: string) {
    await this.findOne(userId, id);
    await this.accountRepo.update({
      where: { id, userId },
      data: { isDeleted: true },
    });
  }

  async removeAllByUser(userId: string) {
    await this.accountRepo.deleteMany({ userId });
  }

  async getAccountBalanceHistory(
    userId: string,
    accountId: string,
  ): Promise<AccountBalanceHistoryDto[]> {
    const account = await this.findOne(userId, accountId);

    const accountBalanceChanges = (
      await this.accountBalanceChangeService.findAllByUserAndAccount(
        userId.toString(),
        accountId.toString(),
      )
    ).map(({ amount, date }) => ({ amount, date }));

    const accountTransactions = (
      await this.transactionsService.findAllByUser(
        userId,
        null,
        undefined,
        undefined,
        undefined,
        undefined,
        accountId,
      )
    ).data.map(({ amount, date, toAccount }) => ({
      date,
      amount: accountId === toAccount.toString() ? amount : -amount,
    }));

    const allBalanceChanges = accountBalanceChanges.concat(accountTransactions);

    const summarizedBalanceChanges = allBalanceChanges
      .reduce(
        (previous, { date }) =>
          previous.some((d) => d.getTime() === date.getTime())
            ? previous
            : previous.concat(date),
        [] as Date[],
      )
      .sort((a, b) => b.getTime() - a.getTime())
      .map((date) => {
        const balanceChangeAmounts = allBalanceChanges
          .filter(({ date: itemDate }) => itemDate.getTime() === date.getTime())
          .map(({ amount }) => amount);

        return {
          date,
          amount: sumArrayItems(balanceChangeAmounts),
        };
      })
      .reduce((previous, { date, amount }) => {
        const previousBalance = previous.at(-1)?.balance ?? account.balance;

        const previousAmount = previous.at(-1)?.amount ?? 0;

        const newBalance = previousBalance - previousAmount;

        return previous.concat({
          date,
          amount,
          balance: newBalance,
        });
      }, [] as AccountBalanceHistoryDto[]);

    return summarizedBalanceChanges;
  }

  private getAccountTypeFilter(accountTypes?: AccountType[]) {
    if (!accountTypes?.length) return {};

    return {
      type: {
        $in: accountTypes,
      },
    };
  }
}
