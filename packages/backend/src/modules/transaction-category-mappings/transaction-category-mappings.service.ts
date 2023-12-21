import { TransactionType } from '@local/types';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { ObjectId } from '../../types/objectId';
import { CategoryMonthlySummaryDto } from '../transaction-categories/dto/transaction-month-summary.dto';

import { CreateTransactionCategoryMappingDto } from './dto/create-transaction-category-mapping.dto';
import { UpdateTransactionCategoryMappingDto } from './dto/update-transaction-category-mapping.dto';
import {
  TransactionCategoryMapping,
  TransactionCategoryMappingDocument,
} from './schemas/transaction-category-mapping.schema';

@Injectable()
export class TransactionCategoryMappingsService {
  constructor(
    @InjectModel(TransactionCategoryMapping.name)
    private transactionCategoryMappingModel: Model<TransactionCategoryMappingDocument>,
  ) {}

  async createMany(
    createTransactionCategoryMappingDto: CreateTransactionCategoryMappingDto[],
  ) {
    return this.transactionCategoryMappingModel.insertMany(
      createTransactionCategoryMappingDto,
    );
  }

  findAll() {
    return `This action returns all transactionCategoryMappings`;
  }

  findOne(id: number) {
    return `This action returns a #${id} transactionCategoryMapping`;
  }

  async findAllByUser(
    userId: ObjectId,
  ): Promise<TransactionCategoryMappingDocument[]> {
    return this.transactionCategoryMappingModel.find({ owner: userId }).exec();
  }

  async findAllByUserAndCategoryIds(
    userId: string,
    categoryIds: ObjectId[],
  ): Promise<TransactionCategoryMappingDocument[]> {
    return this.transactionCategoryMappingModel
      .find({
        owner: userId,
        category_id: { $in: categoryIds },
      })
      .exec();
  }

  async findAllByUserAndTransaction(
    userId: ObjectId,
    transactionId: ObjectId,
  ): Promise<TransactionCategoryMappingDocument[]> {
    return this.transactionCategoryMappingModel
      .find({ owner: userId, transaction_id: transactionId })
      .exec();
  }

  async findMonthlySummariesByUserAndId(
    userId: ObjectId,
    categoryIds: ObjectId[],
    limit?: number,
    year?: number,
    month?: number,
  ): Promise<CategoryMonthlySummaryDto[]> {
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
              $sum: await this.getMonthlySummaryCondition(
                userId,
                1,
                TransactionType.ANY,
              ),
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
                TransactionType.ANY,
              ),
            },
            totalTransactionAmount: {
              $sum: await this.getMonthlySummaryCondition(
                userId,
                '$transactionAmount',
                TransactionType.ANY,
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

    if (
      transactionType !== TransactionType.ANY ||
      typeof operator !== 'string'
    ) {
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
      case TransactionType.ANY:
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

  async removeAllByUserAndTransaction(
    userId: ObjectId,
    transactionId: ObjectId,
  ) {
    await this.transactionCategoryMappingModel
      .deleteMany({
        owner: userId,
        transaction_id: transactionId,
      })
      .exec();
  }

  async removeAllByUser(userId: ObjectId) {
    await this.transactionCategoryMappingModel
      .deleteMany({
        owner: userId,
      })
      .exec();
  }
}
