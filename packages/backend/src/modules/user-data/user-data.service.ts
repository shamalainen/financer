import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { User } from '@prisma/client';

import { ObjectId, parseObjectId } from '../../types/objectId';
import { AccountBalanceChangesService } from '../account-balance-changes/account-balance-changes.service';
import { AccountBalanceChangeDocument } from '../account-balance-changes/schemas/account-balance-change.schema';
import { AccountsService } from '../accounts/accounts.service';
import { AccountDocument } from '../accounts/schemas/account.schema';
import { TransactionCategoryDocument } from '../transaction-categories/schemas/transaction-category.schema';
import { TransactionCategoriesService } from '../transaction-categories/transaction-categories.service';
import { TransactionCategoryMappingDocument } from '../transaction-category-mappings/schemas/transaction-category-mapping.schema';
import { TransactionCategoryMappingsService } from '../transaction-category-mappings/transaction-category-mappings.service';
import { TransactionTemplateDocument } from '../transaction-templates/schemas/transaction-template.schema';
import { TransactionTemplatesService } from '../transaction-templates/transaction-templates.service';
import { TransactionDocument } from '../transactions/schemas/transaction.schema';
import { TransactionsService } from '../transactions/transactions.service';
import { UserPreferenceDocument } from '../user-preferences/schemas/user-preference.schema';
import { UserPreferencesService } from '../user-preferences/user-preferences.service';
import { UsersService } from '../users/users.service';

export type ImportUserDataDto = {
  transactions: TransactionDocument[];
  accounts: AccountDocument[];
  accountBalanceChanges: AccountBalanceChangeDocument[];
  transactionCategories: TransactionCategoryDocument[];
  transactionCategoryMappings: TransactionCategoryMappingDocument[];
  userPreferences: UserPreferenceDocument[];
  transactionTemplates: TransactionTemplateDocument[];
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
    const parsedUserId = parseObjectId(userId);
    const user = await this.usersService.findOne(userId);
    const accounts = await this.accountsService.findAllIncludeDeletedByUser(
      parsedUserId,
    );
    const accountBalanceChanges =
      await this.accountBalanceChangesService.findAllByUser(parsedUserId);
    const transactions = await this.transactionService.findAllByUserForExport(
      parsedUserId,
    );
    const transactionCategories =
      await this.transactionCategoriesService.findAllByUser(parsedUserId);
    const transactionCategoryMappings =
      await this.transactionCategoryMappingService.findAllByUser(parsedUserId);
    const userPreferences = await this.userPreferencesService.findAll(
      parsedUserId,
    );
    const transactionTemplates =
      await this.transactionTemplateService.findAllByUser(parsedUserId);

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
    userId: ObjectId,
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

    const parsedAccounts = accounts.map((account) => ({
      ...account,
      owner: userId,
    }));

    const parsedAccountBalanceChanges = accountBalanceChanges.map(
      ({ accountId, ...accountBalanceChange }) => ({
        ...accountBalanceChange,
        accountId: parseObjectId(accountId),
        userId: userId,
      }),
    );

    const parsedTransactions = transactions.map(
      ({ toAccount, fromAccount, ...transaction }) => ({
        ...transaction,
        toAccount: parseObjectId(toAccount),
        fromAccount: parseObjectId(fromAccount),
        user: userId,
        categories: [],
      }),
    );

    const parsedTransactionCategories = transactionCategories.map(
      ({ parent_category_id, ...transactionCategory }) => ({
        ...transactionCategory,
        parent_category_id: parseObjectId(parent_category_id),
        owner: userId,
      }),
    );

    const parsedTransactionCategoryMappings = transactionCategoryMappings.map(
      ({ category_id, transaction_id, ...transactionCategoryMapping }) => ({
        ...transactionCategoryMapping,
        category_id: parseObjectId(category_id),
        transaction_id: parseObjectId(transaction_id),
        owner: userId,
      }),
    );

    const parsedUserPreferences = userPreferences.map((userPreference) => ({
      ...userPreference,
      userId,
    }));

    const parsedTransactionTemplates = transactionTemplates.map(
      ({ toAccount, fromAccount, categories = [], ...template }) => ({
        ...template,
        toAccount: parseObjectId(toAccount),
        fromAccount: parseObjectId(fromAccount),
        categories: categories.map((category) => parseObjectId(category)),
        userId,
      }),
    );

    await Promise.all([
      this.accountsService.createMany(parsedAccounts),
      this.accountBalanceChangesService.createMany(parsedAccountBalanceChanges),
      this.transactionService.createMany(parsedTransactions),
      this.transactionCategoriesService.createMany(parsedTransactionCategories),
      this.transactionCategoryMappingService.createMany(
        parsedTransactionCategoryMappings,
      ),
      this.userPreferencesService.createMany(parsedUserPreferences),
      this.transactionTemplateService.createMany(parsedTransactionTemplates),
    ]);

    return { payload: 'Successfully overrided data.' };
  }
}
