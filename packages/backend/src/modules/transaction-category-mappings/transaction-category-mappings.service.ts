import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { TransactionCategoryMapping, TransactionType } from '@prisma/client';
import { Model } from 'mongoose';

import { TransactionCategoryMappingRepo } from '../../database/repos/transaction-category-mapping.repo';
import { ObjectId, parseObjectId } from '../../types/objectId';
import { CategoryMonthlySummaryDto } from '../transaction-categories/dto/transaction-month-summary.dto';

import { CreateTransactionCategoryMappingDto } from './dto/create-transaction-category-mapping.dto';
import {
  TransactionCategoryMapping as TransactionCategoryMappingOld,
  TransactionCategoryMappingDocument,
} from './schemas/transaction-category-mapping.schema';

@Injectable()
export class TransactionCategoryMappingsService {
  constructor(
    private readonly transactionCategoryMappingRepo: TransactionCategoryMappingRepo,
    @InjectModel(TransactionCategoryMappingOld.name)
    private transactionCategoryMappingModel: Model<TransactionCategoryMappingDocument>,
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
    userIdStr: string,
    categoryIds: string[],
    limit?: number,
    year?: number,
    month?: number,
  ): Promise<CategoryMonthlySummaryDto[]> {
    const userId = parseObjectId(userIdStr);

    return this.transactionCategoryMappingModel
      .aggregate([
        {
          $match: {
            owner: userId,
            category_id: { $in: categoryIds },
            ...this.getYearAndMonthFilter(year, month, 'laterThan'),
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
              $sum: await this.getMonthlySummaryCondition(userId, 1, null),
            },
            incomeCount: {
              $sum: await this.getMonthlySummaryCondition(
                userId,
                1,
                TransactionType.INCOME,
              ),
            },
            expenseCount: {
              $sum: await this.getMonthlySummaryCondition(
                userId,
                1,
                TransactionType.EXPENSE,
              ),
            },
            transferCount: {
              $sum: await this.getMonthlySummaryCondition(
                userId,
                1,
                TransactionType.TRANSFER,
              ),
            },
            totalAmount: {
              $sum: await this.getMonthlySummaryCondition(
                userId,
                '$amount',
                null,
              ),
            },
            totalTransactionAmount: {
              $sum: await this.getMonthlySummaryCondition(
                userId,
                '$transactionAmount',
                null,
              ),
            },
            incomeAmount: {
              $sum: await this.getMonthlySummaryCondition(
                userId,
                '$amount',
                TransactionType.INCOME,
              ),
            },
            incomeTransactionAmount: {
              $sum: await this.getMonthlySummaryCondition(
                userId,
                '$transactionAmount',
                TransactionType.INCOME,
              ),
            },
            expenseAmount: {
              $sum: await this.getMonthlySummaryCondition(
                userId,
                '$amount',
                TransactionType.EXPENSE,
              ),
            },
            expenseTransactionAmount: {
              $sum: await this.getMonthlySummaryCondition(
                userId,
                '$transactionAmount',
                TransactionType.EXPENSE,
              ),
            },
            transferAmount: {
              $sum: await this.getMonthlySummaryCondition(
                userId,
                '$amount',
                TransactionType.TRANSFER,
              ),
            },
            transferTransactionAmount: {
              $sum: await this.getMonthlySummaryCondition(
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
      ])
      .limit(limit || 1000)
      .exec();
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

  private async getMonthlySummaryCondition(
    userId: ObjectId,
    operator: '$amount' | '$transactionAmount' | 1 | 0,
    transactionType: TransactionType,
  ) {
    const selectedQuery =
      this.getAggregationTransactionTypeFilter(transactionType);

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
