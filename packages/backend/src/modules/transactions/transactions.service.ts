import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  AccountType,
  Prisma,
  Transaction,
  TransactionType,
} from '@prisma/client';

import { TransactionRepo } from '../../database/repos/transaction.repo';
import { PaginationDto } from '../../types/pagination.dto';
import { AccountsService } from '../accounts/accounts.service';
import { TransactionCategoriesService } from '../transaction-categories/transaction-categories.service';
import { CreateTransactionCategoryMappingDto } from '../transaction-category-mappings/dto/create-transaction-category-mapping.dto';
import { TransactionCategoryMappingDto } from '../transaction-category-mappings/dto/transaction-category-mapping.dto';
import { UpdateTransactionCategoryMappingDto } from '../transaction-category-mappings/dto/update-transaction-category-mapping.dto';
import { TransactionCategoryMappingsService } from '../transaction-category-mappings/transaction-category-mappings.service';

import { CreateTransactionDto } from './dto/create-transaction.dto';
import { TransactionMonthSummaryDto } from './dto/transaction-month-summary.dto';
import { TransactionDto } from './dto/transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';

@Injectable()
export class TransactionsService {
  constructor(
    private readonly transactionRepo: TransactionRepo,
    @Inject(forwardRef(() => AccountsService))
    private accountService: AccountsService,
    private transactionCategoriesService: TransactionCategoriesService,
    private transactionCategoryMappingsService: TransactionCategoryMappingsService,
  ) {}

  async create(
    userId: string,
    createTransactionDto: CreateTransactionDto,
  ): Promise<Transaction> {
    const { categories: rawCategories, ...transactionRawData } =
      createTransactionDto;

    await this.verifyTransactionAccountOwnership(userId, transactionRawData);
    await this.verifyCategoriesExists(rawCategories);

    const transactionData = { ...transactionRawData, userId };
    const transaction = await this.transactionRepo.create(transactionData);

    await this.createCategories(userId, transaction.id, rawCategories);
    await this.updateRelatedAccountBalance(
      userId,
      transaction,
      transaction.amount,
      'add',
    );

    return transaction;
  }

  async createMany(
    userId: string,
    createTransactionDto: CreateTransactionDto[],
  ): Promise<void> {
    await this.transactionRepo.createMany(
      createTransactionDto.map((transaction) => ({
        ...transaction,
        userId,
        categories: undefined,
      })),
    );
  }

  async findOne(userId: string, id: string): Promise<TransactionDto> {
    const transaction = await this.transactionRepo.findOne({ id, userId });

    if (!transaction) {
      throw new NotFoundException('Transaction not found.');
    }

    const categories =
      (await this.transactionCategoryMappingsService.findAllByUserAndTransaction(
        userId.toString(),
        transaction.id,
      )) as TransactionCategoryMappingDto[];

    return {
      ...transaction,
      categories,
    };
  }

  async findAllByUser(
    userId: string,
    transactionType: TransactionType,
    page?: number,
    limit = 10,
    year?: number,
    month?: number,
    linkedAccount?: string,
    accountTypes?: AccountType[],
    sortOrder: Prisma.SortOrder = Prisma.SortOrder.desc,
    transactionCategories?: string[],
    parentTransactionCategory?: string,
  ): Promise<PaginationDto<TransactionDto[]>> {
    const targetCategoryIds =
      transactionCategories ||
      (await this.findChildrenCategoryIds(parentTransactionCategory));

    const transactionWhere: Prisma.TransactionWhereInput = {
      userId,
      ...TransactionRepo.filterByType(transactionType),
      ...TransactionRepo.filterByYearAndMonth(year, month),
      ...TransactionRepo.filterByAccount(linkedAccount),
      ...(await this.filterTransactionsByCategory(userId, targetCategoryIds)),
      ...(await this.filterTransactionsByAccountType(userId, accountTypes)),
    };

    const totalCount = await this.transactionRepo.getCount({
      where: transactionWhere,
    });

    const lastPage = page ? Math.ceil(totalCount / limit) : 1;

    if (page && (page < 1 || page > lastPage) && page !== 1) {
      throw new NotFoundException(
        `Page "${page}" not found. First page is "1" and last page is "${lastPage}"`,
      );
    }

    const transactions = await this.transactionRepo.findMany({
      where: transactionWhere,
      orderBy: { date: sortOrder },
      skip: page ? (page - 1) * limit : 0,
      take: page ? limit : 0,
      include: {
        categories: true,
      },
    });

    return {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: transactions as any,
      currentPage: page ?? 1,
      limit: page ? limit : totalCount,
      totalPageCount: lastPage,
      hasNextPage: (page ?? 1) < lastPage,
      hasPreviousPage: (page ?? 1) > 1,
      totalRowCount: totalCount,
    };
  }

  async findAllByUserForExport(userId: string): Promise<Transaction[]> {
    return this.transactionRepo.findMany({
      where: {
        userId,
      },
    });
  }

  async findMonthlySummariesByUser(
    userId: string,
    transactionType: TransactionType,
    year?: number,
    month?: number,
    accountTypes?: AccountType[],
    transactionCategories?: string[],
    parentTransactionCategory?: string,
  ): Promise<TransactionMonthSummaryDto[]> {
    const targetCategoryIds =
      transactionCategories ||
      (await this.findChildrenCategoryIds(parentTransactionCategory));

    return this.transactionRepo.aggregateRaw(
      [
        {
          $match: {
            user: userId,
            ...this.filterRawMongoByYearAndMonth(year, month, 'laterThan'),
            ...(await this.filterRawMongoTransactionsByCategory(
              userId,
              targetCategoryIds,
            )),
          },
        },
        {
          $group: {
            _id: {
              year: { $year: '$date' },
              month: { $month: '$date' },
            },
            count: {
              $sum: await this.filterRawMongoMonthlySummaryCondition(
                userId,
                1,
                transactionType,
                accountTypes,
              ),
            },
          },
        },
        {
          totalCount: {
            $sum: await this.filterRawMongoMonthlySummaryCondition(
              userId,
              1,
              transactionType,
              accountTypes,
            ),
          },
          incomesCount: {
            $sum: await this.filterRawMongoMonthlySummaryCondition(
              userId,
              1,
              TransactionType.INCOME,
              accountTypes,
            ),
          },
          expensesCount: {
            $sum: await this.filterRawMongoMonthlySummaryCondition(
              userId,
              1,
              TransactionType.EXPENSE,
              accountTypes,
            ),
          },
          transferCount: {
            $sum: await this.filterRawMongoMonthlySummaryCondition(
              userId,
              1,
              TransactionType.TRANSFER,
              accountTypes,
            ),
          },
          totalAmount: {
            $sum: await this.filterRawMongoMonthlySummaryCondition(
              userId,
              '$amount',
              transactionType,
              accountTypes,
            ),
          },
          incomeAmount: {
            $sum: await this.filterRawMongoMonthlySummaryCondition(
              userId,
              '$amount',
              TransactionType.INCOME,
              accountTypes,
            ),
          },
          expenseAmount: {
            $sum: await this.filterRawMongoMonthlySummaryCondition(
              userId,
              '$amount',
              TransactionType.EXPENSE,
              accountTypes,
            ),
          },
          transferAmount: {
            $sum: await this.filterRawMongoMonthlySummaryCondition(
              userId,
              '$amount',
              TransactionType.TRANSFER,
              accountTypes,
            ),
          },
        },
        {
          $sort: {
            _id: -1,
          },
        },
      ],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ) as any;
  }

  async update(
    userId: string,
    id: string,
    updateTransactionDto: UpdateTransactionDto,
  ): Promise<Transaction> {
    const { categories: rawCategories, ...transactionData } =
      updateTransactionDto;

    const transactionBefore = await this.findOne(userId, id);
    await this.verifyTransactionAccountOwnership(userId, transactionData);
    await this.verifyCategoriesExists(rawCategories);
    await this.updateRelatedAccountBalance(
      userId,
      transactionBefore,
      transactionBefore.amount,
      'remove',
    );

    const transaction = await this.transactionRepo.update({
      where: { id, userId },
      data: transactionData,
    });

    await this.transactionCategoryMappingsService.removeAllByUserAndTransaction(
      userId.toString(),
      id.toString(),
    );
    await this.createCategories(userId, id, rawCategories);
    await this.updateRelatedAccountBalance(
      userId,
      transaction,
      transaction.amount,
      'add',
    );

    return transaction;
  }

  async remove(
    transaction: Partial<TransactionDto>,
    userId: string,
  ): Promise<void> {
    await this.updateRelatedAccountBalance(
      userId,
      transaction,
      transaction.amount,
      'remove',
    );

    await this.transactionRepo.delete({ id: transaction.id });
  }

  async removeAllByUser(userId: string): Promise<void> {
    await this.transactionRepo.deleteMany({ userId });
  }

  private async updateRelatedAccountBalance(
    userId: string,
    transaction: Partial<Transaction>,
    amount: number,
    type: 'add' | 'remove',
  ): Promise<void> {
    const amountToApply = type === 'add' ? amount : -amount;

    if (transaction.toAccount) {
      await this.accountService.updateBalance(
        userId.toString(),
        transaction.toAccount.toString(),
        amountToApply,
      );
    }
    if (transaction.fromAccount) {
      await this.accountService.updateBalance(
        userId.toString(),
        transaction.fromAccount.toString(),
        -amountToApply,
      );
    }
  }

  private async verifyTransactionAccountOwnership(
    userId: string,
    transaction: Partial<Transaction>,
  ) {
    if (transaction.toAccount) {
      await this.accountService.findOne(
        userId.toString(),
        transaction.toAccount.toString(),
      );
    }
    if (transaction.fromAccount) {
      await this.accountService.findOne(
        userId.toString(),
        transaction.fromAccount.toString(),
      );
    }
  }

  private async verifyCategoriesExists(
    categories?:
      | CreateTransactionCategoryMappingDto[]
      | UpdateTransactionCategoryMappingDto[],
  ) {
    if (!categories) {
      return;
    }

    await this.transactionCategoriesService.ensureCategoriesExist(
      categories.map((category) => category.category_id),
    );
  }

  private async createCategories(
    userId: string,
    transactionId: string,
    categories?:
      | CreateTransactionCategoryMappingDto[]
      | UpdateTransactionCategoryMappingDto[],
  ) {
    if (!categories) {
      return;
    }

    const categoriesWithAllFields = categories.map((category) => ({
      ...category,
      transaction_id: transactionId,
      owner: userId,
    }));

    await this.transactionCategoryMappingsService.createMany(
      userId.toString(),
      categoriesWithAllFields,
    );
  }

  private getAggregationTransactionTypeFilter(
    transactionType: TransactionType | null,
  ): Prisma.InputJsonObject[] {
    const isEmpty = (fieldName) => ({ $eq: [fieldName, undefined] });
    const isNotEmpty = (fieldName) => ({ $ne: [fieldName, undefined] });

    switch (transactionType) {
      case TransactionType.INCOME:
        return [isNotEmpty('$toAccount'), isEmpty('$fromAccount')];
      case TransactionType.EXPENSE:
        return [isNotEmpty('$fromAccount'), isEmpty('$toAccount')];
      case TransactionType.TRANSFER:
        return [isNotEmpty('$fromAccount'), isNotEmpty('$toAccount')];
      case null:
        return [];
      default:
        throw new Error(`Invalid transaction type: ${transactionType}`);
    }
  }

  private async filterTransactionsByCategory(
    userId: string,
    categoryIds?: string[],
  ) {
    if (!categoryIds) {
      return {};
    }

    const transactionIds = (
      await this.transactionCategoryMappingsService.findAllByUserAndCategoryIds(
        userId.toString(),
        categoryIds.map((id) => id.toString()),
      )
    ).map(({ transactionId }) => transactionId);

    return TransactionRepo.filterById(transactionIds);
  }

  private async getAccountIdsByType(
    userId: string,
    accountTypes?: AccountType[],
  ) {
    if (!accountTypes?.length) return [];

    const accounts = await this.accountService.findAllByUser(
      userId.toString(),
      accountTypes,
    );

    return accounts.data.map(({ id }) => id);
  }

  private async filterTransactionsByAccountType(
    userId: string,
    accountTypes?: AccountType[],
  ) {
    if (!accountTypes?.length) return {};

    const accountIds = await this.getAccountIdsByType(userId, accountTypes);

    return TransactionRepo.filterByAccount(accountIds);
  }

  private async getAggregateAccountTypesFilter(
    userId: string,
    accountTypes?: AccountType[],
    operator: '$in' | '$nin' = '$in',
  ): Promise<Prisma.InputJsonObject> {
    if (!accountTypes?.length) return {};

    const accountIds = await this.getAccountIdsByType(
      userId.toString(),
      accountTypes,
    );

    return {
      $or: [
        {
          [operator]: ['$toAccount', accountIds],
        },
        {
          [operator]: ['$fromAccount', accountIds],
        },
      ],
    };
  }

  private async findChildrenCategoryIds(parentId: string) {
    if (!parentId) {
      return null;
    }

    const a = (
      await this.transactionCategoriesService.findAllChildrensById([
        parentId.toString(),
      ])
    ).map(({ _id }) => _id);

    return [parentId, ...a];
  }

  private filterRawMongoByYearAndMonth(
    year?: number,
    month?: number,
    filterMode: 'targetMonth' | 'laterThan' = 'targetMonth',
  ): Prisma.InputJsonObject {
    if (!year && month) {
      throw new BadRequestException('Year is required when month is provided');
    }

    if (!year && !month) {
      return {};
    }

    if (filterMode === 'laterThan') {
      return {
        date: {
          $gte: new Date(year, month - 1 || 0, 1),
        },
      };
    }

    return {
      date: {
        $gte: new Date(year, month - 1 || 0, 1),
        $lt: new Date(year, month || 12, 1),
      },
    };
  }

  private async filterRawMongoTransactionsByCategory(
    userId: string,
    categoryIds?: string[],
  ): Promise<Prisma.InputJsonObject> {
    if (!categoryIds) {
      return {};
    }

    const transactionIds = (
      await this.transactionCategoryMappingsService.findAllByUserAndCategoryIds(
        userId.toString(),
        categoryIds.map((id) => id.toString()),
      )
    ).map(({ transactionId }) => transactionId);

    return {
      _id: {
        $in: transactionIds,
      },
    };
  }

  private async filterRawMongoMonthlySummaryCondition(
    userId: string,
    operator: '$amount' | 1 | 0,
    transactionType: TransactionType | null,
    accountTypes?: AccountType[],
  ): Promise<Prisma.InputJsonValue> {
    const accountIds = await this.getAccountIdsByType(userId, accountTypes);

    const accountTypeFilter = accountIds.length
      ? await this.getAggregateAccountTypesFilter(userId, accountTypes)
      : {};

    const selectedQuery = [
      ...this.getAggregationTransactionTypeFilter(transactionType),
      accountTypeFilter,
    ];

    if (
      !accountIds?.length &&
      (transactionType !== null || typeof operator !== 'string')
    ) {
      return { $cond: [{ $and: selectedQuery }, operator, 0] };
    }

    if (!accountIds?.length) {
      return {
        $cond: [
          { $and: [...selectedQuery, { $eq: ['$fromAccount', null] }] },
          operator,
          {
            $cond: [
              { $and: [...selectedQuery, { $eq: ['$toAccount', null] }] },
              { $multiply: [operator, -1] },
              0,
            ],
          },
        ],
      };
    }

    if (transactionType === TransactionType.TRANSFER) {
      return {
        $cond: [
          {
            $and: [
              ...selectedQuery,
              {
                $in: ['$toAccount', accountIds],
              },
              {
                $in: ['$fromAccount', accountIds],
              },
            ],
          },
          1,
          0,
        ],
      };
    }

    if (transactionType === null) {
      return {
        $cond: [
          {
            $and: [
              ...selectedQuery,
              {
                $in: ['$toAccount', accountIds],
                $and: [
                  { $not: { $in: ['$fromAccount', accountIds] } },
                  { $ne: ['$fromAccount', ''] },
                ],
              },
            ],
          },
          operator,
          {
            $cond: [
              {
                $and: [
                  ...selectedQuery,
                  {
                    $in: ['$fromAccount', accountIds],
                    $and: [
                      { $not: { $in: ['$toAccount', accountIds] } },
                      { $ne: ['$toAccount', ''] },
                    ],
                  },
                ],
              },
              { $multiply: [operator, -1] },
              0,
            ],
          },
        ],
      };
    }

    const inAccount =
      transactionType === TransactionType.EXPENSE
        ? '$fromAccount'
        : '$toAccount';

    const notInAccount =
      transactionType === TransactionType.EXPENSE
        ? '$toAccount'
        : '$fromAccount';

    return {
      $cond: [
        {
          $or: [
            { $and: selectedQuery },
            {
              $and: [
                {
                  $in: [inAccount, accountIds],
                },
                {
                  $not: { $in: [notInAccount, accountIds] },
                },
              ],
            },
          ],
        },
        operator,
        0,
      ],
    };
  }
}
