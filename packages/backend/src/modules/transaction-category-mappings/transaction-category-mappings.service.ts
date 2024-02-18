import { BadRequestException, Injectable } from '@nestjs/common';
import {
  TransactionCategoryMapping,
  TransactionType,
  Prisma,
} from '@prisma/client';

import { TransactionCategoryMappingRepo } from '../../database/repos/transaction-category-mapping.repo';
import { CategoryMonthlySummaryDto } from '../transaction-categories/dto/transaction-month-summary.dto';

import { CreateTransactionCategoryMappingDto } from './dto/create-transaction-category-mapping.dto';

@Injectable()
export class TransactionCategoryMappingsService {
  constructor(
    private readonly transactionCategoryMappingRepo: TransactionCategoryMappingRepo,
  ) {}

  async createMany(
    userId: string,
    createTransactionCategoryMappingDto: CreateTransactionCategoryMappingDto[],
  ) {
    return this.transactionCategoryMappingRepo.createMany(
      createTransactionCategoryMappingDto.map((category) => ({
        ...category,
        userId,
      })),
    );
  }

  findAll() {
    return `This action returns all transactionCategoryMappings`;
  }

  findOne(id: number) {
    return `This action returns a #${id} transactionCategoryMapping`;
  }

  async findAllByUser(userId: string): Promise<TransactionCategoryMapping[]> {
    return this.transactionCategoryMappingRepo.findMany({ where: { userId } });
  }

  async findAllByUserAndCategoryIds(
    userId: string,
    categoryIds: string[],
  ): Promise<TransactionCategoryMapping[]> {
    return this.transactionCategoryMappingRepo.findMany({
      where: {
        userId,
        categoryId: {
          in: categoryIds,
        },
      },
    });
  }

  async findAllByUserAndTransaction(
    userId: string,
    transactionId: string,
  ): Promise<TransactionCategoryMapping[]> {
    return this.transactionCategoryMappingRepo.findMany({
      where: { userId, transactionId },
    });
  }

  async findMonthlySummariesByUserAndId(
    userId: string,
    categoryIds: string[],
    year?: number,
    month?: number,
  ): Promise<CategoryMonthlySummaryDto[]> {
    return this.transactionCategoryMappingRepo.aggregateRaw([
      {
        $match: {
          owner: userId,
          category_id: { $in: categoryIds },
          ...this.filterRawMongoYearAndMonthFilter(year, month, 'laterThan'),
        },
      },
      {
        $lookup: {
          from: 'transactions',
          localField: 'transaction_id',
          foreignField: '_id',
          as: 'transaction',
        },
      },
      {
        $project: {
          date: {
            $arrayElemAt: ['$transaction.date', 0],
          },
          amount: '$amount',
          transactionAmount: {
            $arrayElemAt: ['$transaction.amount', 0],
          },
          fromAccount: {
            $arrayElemAt: ['$transaction.fromAccount', 0],
          },
          toAccount: {
            $arrayElemAt: ['$transaction.toAccount', 0],
          },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
          },
          totalCount: {
            $sum: this.filterRawMongoMonthlySummaryCondition(userId, 1, null),
          },
          incomeCount: {
            $sum: this.filterRawMongoMonthlySummaryCondition(
              userId,
              1,
              TransactionType.INCOME,
            ),
          },
          expenseCount: {
            $sum: this.filterRawMongoMonthlySummaryCondition(
              userId,
              1,
              TransactionType.EXPENSE,
            ),
          },
          transferCount: {
            $sum: this.filterRawMongoMonthlySummaryCondition(
              userId,
              1,
              TransactionType.TRANSFER,
            ),
          },
          totalAmount: {
            $sum: this.filterRawMongoMonthlySummaryCondition(
              userId,
              '$amount',
              null,
            ),
          },
          totalTransactionAmount: {
            $sum: this.filterRawMongoMonthlySummaryCondition(
              userId,
              '$transactionAmount',
              null,
            ),
          },
          incomeAmount: {
            $sum: this.filterRawMongoMonthlySummaryCondition(
              userId,
              '$amount',
              TransactionType.INCOME,
            ),
          },
          incomeTransactionAmount: {
            $sum: this.filterRawMongoMonthlySummaryCondition(
              userId,
              '$transactionAmount',
              TransactionType.INCOME,
            ),
          },
          expenseAmount: {
            $sum: this.filterRawMongoMonthlySummaryCondition(
              userId,
              '$amount',
              TransactionType.EXPENSE,
            ),
          },
          expenseTransactionAmount: {
            $sum: this.filterRawMongoMonthlySummaryCondition(
              userId,
              '$transactionAmount',
              TransactionType.EXPENSE,
            ),
          },
          transferAmount: {
            $sum: this.filterRawMongoMonthlySummaryCondition(
              userId,
              '$amount',
              TransactionType.TRANSFER,
            ),
          },
          transferTransactionAmount: {
            $sum: this.filterRawMongoMonthlySummaryCondition(
              userId,
              '$transactionAmount',
              TransactionType.TRANSFER,
            ),
          },
        },
      },
      {
        $sort: {
          _id: -1,
        },
      },
      {
        $project: {
          'total.count': '$totalCount',
          'total.amount': '$totalAmount',
          'total.transactionAmount': '$totalTransactionAmount',
          'income.count': '$incomeCount',
          'income.amount': '$incomeAmount',
          'income.transactionAmount': '$incomeTransactionAmount',
          'expense.count': '$expenseCount',
          'expense.amount': '$expenseAmount',
          'expense.transactionAmount': '$expenseTransactionAmount',
          'transfer.count': '$transferCount',
          'transfer.amount': '$transferAmount',
          'transfer.transactionAmount': '$transferTransactionAmount',
        },
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ]) as any;
  }

  private filterRawMongoYearAndMonthFilter(
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

  private filterRawMongoMonthlySummaryCondition(
    userId: string,
    operator: '$amount' | '$transactionAmount' | 1 | 0,
    transactionType: TransactionType,
  ): Prisma.InputJsonValue {
    const selectedQuery =
      this.filterRawMongoAggregationTransactionTypeFilter(transactionType);

    if (transactionType !== null || typeof operator !== 'string') {
      return { $cond: [{ $and: selectedQuery }, operator, 0] };
    }

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

  private filterRawMongoAggregationTransactionTypeFilter(
    transactionType: TransactionType,
  ): Prisma.InputJsonObject[] {
    const isEmpty = (fieldName: string) => ({ $eq: [fieldName, undefined] });
    const isNotEmpty = (fieldName: string) => ({ $ne: [fieldName, undefined] });

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

  update(id: number) {
    return `This action updates a #${id} transactionCategoryMapping`;
  }

  remove(id: number) {
    return `This action removes a #${id} transactionCategoryMapping`;
  }

  async removeAllByUserAndTransaction(userId: string, transactionId: string) {
    await this.transactionCategoryMappingRepo.deleteMany({
      userId,
      transactionId,
    });
  }

  async removeAllByUser(userId: string) {
    await this.transactionCategoryMappingRepo.deleteMany({
      userId,
    });
  }
}
