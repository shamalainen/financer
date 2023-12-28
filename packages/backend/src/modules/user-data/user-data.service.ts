import { forwardRef, Inject, Injectable } from '@nestjs/common';
import {
  Account,
  AccountBalanceChange,
  Transaction,
  TransactionCategory,
  TransactionCategoryMapping,
  TransactionTemplate,
  User,
  UserPreferences,
} from '@prisma/client';

import { AccountBalanceChangesService } from '../account-balance-changes/account-balance-changes.service';
import { AccountsService } from '../accounts/accounts.service';
import { TransactionCategoriesService } from '../transaction-categories/transaction-categories.service';
import { TransactionCategoryMappingsService } from '../transaction-category-mappings/transaction-category-mappings.service';
import { TransactionTemplatesService } from '../transaction-templates/transaction-templates.service';
import { TransactionsService } from '../transactions/transactions.service';
import { UserPreferencesService } from '../user-preferences/user-preferences.service';
import { UsersService } from '../users/users.service';

export type ImportUserDataDto = {
  transactions: Transaction[];
  accounts: Account[];
  accountBalanceChanges: AccountBalanceChange[];
  transactionCategories: TransactionCategory[];
  transactionCategoryMappings: TransactionCategoryMapping[];
  userPreferences: UserPreferences[];
  transactionTemplates: TransactionTemplate[];
};

export type ExportUserDataDto = ImportUserDataDto & {
  user: User;
};

const getMyDataFilename = (): string => {
  const addLeadingZero = (number: number): string => `0${number}`.substr(-2);

  const date = new Date();
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `my-financer-data-${year}${addLeadingZero(month)}${addLeadingZero(
    day,
  )}.json`;
};

@Injectable()
export class UserDataService {
  constructor(
    @Inject(forwardRef(() => UsersService))
    private usersService: UsersService,
    private accountsService: AccountsService,
    private accountBalanceChangesService: AccountBalanceChangesService,
    private transactionService: TransactionsService,
    private transactionCategoriesService: TransactionCategoriesService,
    private transactionCategoryMappingService: TransactionCategoryMappingsService,
    private userPreferencesService: UserPreferencesService,
    private transactionTemplateService: TransactionTemplatesService,
  ) {}

  async findAllOneUserData(
    userId: string,
  ): Promise<{ filename: string; data: ExportUserDataDto }> {
    const user = await this.usersService.findOne(userId);
    const accounts =
      await this.accountsService.findAllIncludeDeletedByUser(userId);
    const accountBalanceChanges =
      await this.accountBalanceChangesService.findAllByUser(userId);
    const transactions =
      await this.transactionService.findAllByUserForExport(userId);
    const transactionCategories =
      await this.transactionCategoriesService.findAllByUser(userId);
    const transactionCategoryMappings =
      await this.transactionCategoryMappingService.findAllByUser(userId);
    const userPreferences = await this.userPreferencesService.findAll(userId);
    const transactionTemplates =
      await this.transactionTemplateService.findAllByUser(userId);

    const filename = getMyDataFilename();
    const data = {
      user,
      accounts,
      accountBalanceChanges,
      transactions,
      transactionCategories,
      transactionCategoryMappings,
      userPreferences,
      transactionTemplates,
    };

    return { filename, data };
  }

  async overrideUserData(
    userId: string,
    {
      accounts = [],
      accountBalanceChanges = [],
      transactions = [],
      transactionCategories = [],
      transactionCategoryMappings = [],
      userPreferences = [],
      transactionTemplates = [],
    }: ImportUserDataDto,
  ) {
    await Promise.all([
      this.accountsService.removeAllByUser(userId),
      this.accountBalanceChangesService.removeAllByUser(userId),
      this.transactionService.removeAllByUser(userId),
      this.transactionCategoriesService.removeAllByUser(userId),
      this.transactionCategoryMappingService.removeAllByUser(userId),
      this.userPreferencesService.removeAllByUser(userId),
      this.transactionTemplateService.removeAllByUser(userId),
    ]);

    const parsedAccountBalanceChanges = accountBalanceChanges.map(
      (accountBalanceChange) => ({
        ...accountBalanceChange,
        userId,
      }),
    );

    await Promise.all([
      this.accountsService.createMany(accounts, userId),
      this.accountBalanceChangesService.createMany(parsedAccountBalanceChanges),
      this.transactionService.createMany(userId, transactions),
      this.transactionCategoriesService.createMany(
        userId,
        transactionCategories,
      ),
      this.transactionCategoryMappingService.createMany(
        userId,
        transactionCategoryMappings,
      ),
      this.userPreferencesService.createMany(userPreferences, userId),
      this.transactionTemplateService.createMany(userId, transactionTemplates),
    ]);

    return { payload: 'Successfully overrided data.' };
  }
}
