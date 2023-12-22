import { SortOrder, TransactionType } from '@local/types';
import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { AccountType } from '@prisma/client';
import { Model } from 'mongoose';

import { ObjectId } from '../../types/objectId';
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
import { Transaction, TransactionDocument } from './schemas/transaction.schema';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectModel(Transaction.name)
    private transactionModel: Model<TransactionDocument>,
    @Inject(forwardRef(() => AccountsService))
    private accountService: AccountsService,
    private transactionCategoriesService: TransactionCategoriesService,
    private transactionCategoryMappingsService: TransactionCategoryMappingsService,
  ) {}

  async create(
    userId: ObjectId,
    createTransactionDto: CreateTransactionDto,
  ): Promise<TransactionDocument> {
    const { categories: rawCategories, ...transactionRawData } =
      createTransactionDto;

    await this.verifyTransactionAccountOwnership(userId, transactionRawData);
    await this.verifyCategoriesExists(rawCategories);

    const transactionData = { ...transactionRawData, user: userId };
    const transaction = await this.transactionModel.create(transactionData);

    await this.createCategories(userId, transaction._id, rawCategories);
    await this.updateRelatedAccountBalance(
      userId,
      transaction,
      transaction.amount,
      'add',
    );

    return transaction;
  }

  async createMany(
    createTransactionDto: CreateTransactionDto[],
  ): Promise<TransactionDocument[]> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return this.transactionModel.insertMany(createTransactionDto) as any;
  }

  async findOne(userId: ObjectId, id: ObjectId): Promise<TransactionDto> {
    const transaction = await this.transactionModel.findOne({ _id: id });

    if (!transaction) {
      throw new NotFoundException('Transaction not found.');
    } else if (!transaction.user.equals(userId)) {
      throw new UnauthorizedException(
        'Unauthorized to access this transaction.',
      );
    }

    const categories =
      (await this.transactionCategoryMappingsService.findAllByUserAndTransaction(
        userId.toString(),
        transaction._id.toString(),
      )) as TransactionCategoryMappingDto[];

    return {
      ...transaction.toObject(),
      categories,
    };
  }

  async findAllByUser(
    userId: ObjectId,
    transactionType: TransactionType,
    page?: number,
    limit = 10,
    year?: number,
    month?: number,
    linkedAccount?: ObjectId,
    accountTypes?: AccountType[],
    sortOrder: SortOrder = SortOrder.DESC,
    transactionCategories?: string[],
    parentTransactionCategory?: ObjectId,
  ): Promise<PaginationDto<TransactionDto[]>> {
    const targetCategoryIds =
      transactionCategories ||
      (await this.findChildrenCategoryIds(parentTransactionCategory));

    const query = {
      user: userId,
      ...this.getTransactionTypeFilter(transactionType),
      ...this.getYearAndMonthFilter(year, month),
      ...(await this.getTransactionsByCategoryFilter(
        userId,
        targetCategoryIds,
      )),
      ...this.getLinkedAccountFilter(linkedAccount),
      ...(await this.getAccountTypesFilter(userId, accountTypes)),
    };
    const totalCount = await this.transactionModel
      .find(query)
      .countDocuments()
      .exec();
    const lastPage = page ? Math.ceil(totalCount / limit) : 1;

    if (page && (page < 1 || page > lastPage) && page !== 1) {
      throw new NotFoundException(
        `Page "${page}" not found. First page is "1" and last page is "${lastPage}"`,
      );
    }

    const transactions = await this.transactionModel
      .find(query)
      .sort({ date: sortOrder })
      .skip(page ? (page - 1) * limit : 0)
      .limit(page ? limit : 0)
      .exec();

    const data = await Promise.all(
      transactions.map(async (transaction) => {
        const categories =
          (await this.transactionCategoryMappingsService.findAllByUserAndTransaction(
            userId.toString(),
            transaction._id.toString(),
          )) as TransactionCategoryMappingDto[];
        return { ...transaction.toObject(), categories };
      }),
    );

    return {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: data as any,
      currentPage: page ?? 1,
      limit: page ? limit : totalCount,
      totalPageCount: lastPage,
      hasNextPage: (page ?? 1) < lastPage,
      hasPreviousPage: (page ?? 1) > 1,
      totalRowCount: totalCount,
    };
  }

  async findAllByUserForExport(
    userId: ObjectId,
  ): Promise<TransactionDocument[]> {
    return this.transactionModel.find({ user: userId });
  }

  async findMonthlySummariesByUser(
    userId: ObjectId,
    transactionType: TransactionType,
    limit?: number,
    year?: number,
    month?: number,
    accountTypes?: AccountType[],
    transactionCategories?: ObjectId[],
    parentTransactionCategory?: ObjectId,
  ): Promise<TransactionMonthSummaryDto[]> {
    const targetCategoryIds =
      transactionCategories ||
      (await this.findChildrenCategoryIds(parentTransactionCategory));

    return this.transactionModel
      .aggregate([
        {
          $match: {
            user: userId,
            ...this.getYearAndMonthFilter(year, month, 'laterThan'),
            ...(await this.getTransactionsByCategoryFilter(
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
              $sum: await this.getMonthlySummaryCondition(
                userId,
                1,
                transactionType,
                accountTypes,
              ),
            },
            totalCount: {
              $sum: await this.getMonthlySummaryCondition(
                userId,
                1,
                transactionType,
                accountTypes,
              ),
            },
            incomesCount: {
              $sum: await this.getMonthlySummaryCondition(
                userId,
                1,
                TransactionType.INCOME,
                accountTypes,
              ),
            },
            expensesCount: {
              $sum: await this.getMonthlySummaryCondition(
                userId,
                1,
                TransactionType.EXPENSE,
                accountTypes,
              ),
            },
            transferCount: {
              $sum: await this.getMonthlySummaryCondition(
                userId,
                1,
                TransactionType.TRANSFER,
                accountTypes,
              ),
            },
            totalAmount: {
              $sum: await this.getMonthlySummaryCondition(
                userId,
                '$amount',
                transactionType,
                accountTypes,
              ),
            },
            incomeAmount: {
              $sum: await this.getMonthlySummaryCondition(
                userId,
                '$amount',
                TransactionType.INCOME,
                accountTypes,
              ),
            },
            expenseAmount: {
              $sum: await this.getMonthlySummaryCondition(
                userId,
                '$amount',
                TransactionType.EXPENSE,
                accountTypes,
              ),
            },
            transferAmount: {
              $sum: await this.getMonthlySummaryCondition(
                userId,
                '$amount',
                TransactionType.TRANSFER,
                accountTypes,
              ),
            },
          },
        },
        {
          $sort: {
            _id: -1,
          },
        },
      ])
      .limit(limit || 1000)
      .exec();
  }

  async update(
    userId: ObjectId,
    id: ObjectId,
    updateTransactionDto: UpdateTransactionDto,
  ): Promise<TransactionDocument> {
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

    const transaction = await this.transactionModel
      .findByIdAndUpdate(id, transactionData, { new: true })
      .exec();

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
    userId: ObjectId,
  ): Promise<void> {
    await this.updateRelatedAccountBalance(
      userId,
      transaction,
      transaction.amount,
      'remove',
    );
    await this.transactionModel.findByIdAndDelete(transaction._id).exec();
  }

  async removeAllByUser(userId: ObjectId): Promise<void> {
    await this.transactionModel.deleteMany({ user: userId }).exec();
  }

  private async updateRelatedAccountBalance(
    userId: ObjectId,
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
    userId: ObjectId,
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
    userId: ObjectId,
    transactionId: ObjectId,
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

  private getTransactionTypeFilter(transactionType: TransactionType): {
    [key: string]: unknown;
  } {
    const isEmpty = { $eq: undefined };
    const isNotEmpty = { $ne: undefined };

    switch (transactionType) {
      case TransactionType.INCOME:
        return {
          toAccount: isNotEmpty,
          fromAccount: isEmpty,
        };
      case TransactionType.EXPENSE:
        return {
          fromAccount: isNotEmpty,
          toAccount: isEmpty,
        };
      case TransactionType.TRANSFER:
        return {
          fromAccount: isNotEmpty,
          toAccount: isNotEmpty,
        };
      case TransactionType.ANY:
        return {};
      default:
        throw new Error(`Invalid transaction type: ${transactionType}`);
    }
  }

  private getAggregationTransactionTypeFilter(
    transactionType: TransactionType,
  ): { [key in string]: unknown }[] {
    const isEmpty = (fieldName) => ({ $eq: [fieldName, undefined] });
    const isNotEmpty = (fieldName) => ({ $ne: [fieldName, undefined] });

    switch (transactionType) {
      case TransactionType.INCOME:
        return [isNotEmpty('$toAccount'), isEmpty('$fromAccount')];
      case TransactionType.EXPENSE:
        return [isNotEmpty('$fromAccount'), isEmpty('$toAccount')];
      case TransactionType.TRANSFER:
        return [isNotEmpty('$fromAccount'), isNotEmpty('$toAccount')];
      case TransactionType.ANY:
        return [];
      default:
        throw new Error(`Invalid transaction type: ${transactionType}`);
    }
  }

  private getYearAndMonthFilter(
    year?: number,
    month?: number,
    filterMode: 'targetMonth' | 'laterThan' = 'targetMonth',
  ) {
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

  private async getTransactionsByCategoryFilter(
    userId: ObjectId,
    categoryIds?: ObjectId[],
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

    return {
      _id: {
        $in: transactionIds,
      },
    };
  }

  private getLinkedAccountFilter(accountId?: ObjectId) {
    if (!accountId) {
      return {};
    }

    return {
      $or: [
        {
          toAccount: accountId,
        },
        {
          fromAccount: accountId,
        },
      ],
    };
  }

  private async getAccountIdsByType(
    userId: ObjectId,
    accountTypes?: AccountType[],
  ) {
    if (!accountTypes?.length) return [];

    const accounts = await this.accountService.findAllByUser(
      userId.toString(),
      accountTypes,
    );

    return accounts.data.map(({ id }) => id);
  }

  private async getAccountTypesFilter(
    userId: ObjectId,
    accountTypes?: AccountType[],
  ) {
    if (!accountTypes?.length) return {};

    const accountIds = await this.getAccountIdsByType(userId, accountTypes);

    return {
      $or: [
        {
          toAccount: { $in: accountIds },
        },
        {
          fromAccount: { $in: accountIds },
        },
      ],
    };
  }

  private async getAggregateAccountTypesFilter(
    userId: ObjectId,
    accountTypes?: AccountType[],
    operator: '$in' | '$nin' = '$in',
  ) {
    if (!accountTypes?.length) return {};

    const accountIds = await this.getAccountIdsByType(userId, accountTypes);

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

  private async getMonthlySummaryCondition(
    userId: ObjectId,
    operator: '$amount' | 1 | 0,
    transactionType: TransactionType,
    accountTypes?: AccountType[],
  ) {
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
      (transactionType !== TransactionType.ANY || typeof operator !== 'string')
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

    if (transactionType === TransactionType.ANY) {
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

  private async findChildrenCategoryIds(parentId: ObjectId) {
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
}
