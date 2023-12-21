import { AccountType, TransactionType } from '@local/types';
import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { ObjectId, parseObjectId } from '../../types/objectId';
import { PaginationDto } from '../../types/pagination.dto';
import { sumArrayItems } from '../../utils/arrays';
import { AccountBalanceChangesService } from '../account-balance-changes/account-balance-changes.service';
import { TransactionsService } from '../transactions/transactions.service';

import { AccountBalanceHistoryDto } from './dto/account-balance-history.dto';
import { AccountDto } from './dto/account.dto';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { Account, AccountDocument } from './schemas/account.schema';

@Injectable()
export class AccountsService {
  constructor(
    @InjectModel(Account.name) private accountModel: Model<AccountDocument>,
    private accountBalanceChangesService: AccountBalanceChangesService,
    @Inject(forwardRef(() => TransactionsService))
    private transactionsService: TransactionsService,
  ) {}

  async create(
    userId: ObjectId,
    createAccountDto: CreateAccountDto,
  ): Promise<AccountDocument> {
    return this.accountModel.create({ ...createAccountDto, owner: userId });
  }

  async createMany(
    createAccountDto: CreateAccountDto[],
  ): Promise<AccountDocument[]> {
    return this.accountModel.insertMany(createAccountDto);
  }

  async findOne(userId: ObjectId, id: ObjectId): Promise<AccountDocument> {
    const account = await this.accountModel.findOne({ _id: id });

    if (!account) {
      throw new NotFoundException('Account not found.');
    } else if (!account.owner.equals(userId)) {
      throw new UnauthorizedException('Unauthorized to access this account.');
    }

    return account;
  }

  async findAllByUser(
    userId: string,
    accountTypes?: AccountType[],
    limit = 20,
    page?: number,
  ): Promise<PaginationDto<AccountDto<ObjectId>[]>> {
    const query = {
      owner: parseObjectId(userId),
      isDeleted: { $ne: true },
      ...this.getAccountTypeFilter(accountTypes),
    };

    const totalCount = await this.accountModel
      .find(query)
      .countDocuments()
      .exec();
    const lastPage = page ? Math.ceil(totalCount / limit) : 1;

    if (page && (page < 1 || page > lastPage) && page !== 1) {
      throw new NotFoundException(
        `Page "${page}" not found. First page is "1" and last page is "${lastPage}"`,
      );
    }

    const accounts = await this.accountModel
      .find(query)
      .sort({ date: 'desc' })
      .skip(page ? (page - 1) * limit : 0)
      .limit(page ? limit : 0)
      .exec();

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

  async findAllIncludeDeletedByUser(
    userId: ObjectId,
  ): Promise<AccountDocument[]> {
    return this.accountModel.find({ owner: userId });
  }

  async update(
    userId: ObjectId,
    id: ObjectId,
    updateAccountDto: UpdateAccountDto,
  ): Promise<AccountDocument> {
    const accountBeforeChange = await this.findOne(userId, id);

    if (
      updateAccountDto.balance &&
      updateAccountDto.balance !== accountBeforeChange.balance
    ) {
      const balanceChangeAmount =
        updateAccountDto.balance - accountBeforeChange.balance;
      await this.accountBalanceChangesService.create({
        accountId: id,
        userId,
        amount: balanceChangeAmount,
        date: new Date(),
      });
    }

    return this.accountModel.findByIdAndUpdate(id, updateAccountDto).exec();
  }

  async updateBalance(
    userId: ObjectId,
    id: ObjectId,
    amount: number,
  ): Promise<AccountDocument> {
    await this.findOne(userId, id);

    return this.accountModel
      .findByIdAndUpdate(
        id,
        {
          $inc: { balance: amount },
        },
        { new: true },
      )
      .exec();
  }

  async remove(id: ObjectId, userId: ObjectId) {
    await this.findOne(userId, id);
    await this.accountModel.findByIdAndUpdate(id, { isDeleted: true });
  }

  async removeAllByUser(userId: ObjectId) {
    await this.accountModel.deleteMany({ owner: userId }).exec();
  }

  async getAccountBalanceHistory(
    userId: ObjectId,
    accountId: ObjectId,
  ): Promise<AccountBalanceHistoryDto[]> {
    const account = await this.findOne(userId, accountId);

    const accountBalanceChanges = (
      await this.accountBalanceChangesService.findAllByUserAndAccount(
        userId,
        accountId,
      )
    ).map(({ amount, date }) => ({ amount, date }));

    const accountTransactions = (
      await this.transactionsService.findAllByUser(
        userId,
        TransactionType.ANY,
        undefined,
        undefined,
        undefined,
        undefined,
        accountId,
      )
    ).data.map(({ amount, date, toAccount }) => ({
      date,
      amount: accountId.equals(toAccount) ? amount : -amount,
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
