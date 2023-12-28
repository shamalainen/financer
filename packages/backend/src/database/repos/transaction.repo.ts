import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma, Transaction, TransactionType } from '@prisma/client';

import { PrismaService } from '../prisma.service';

@Injectable()
export class TransactionRepo {
  constructor(private prisma: PrismaService) {}

  async findOne(
    transactionWhereUniqueInput: Prisma.TransactionWhereUniqueInput,
  ): Promise<Transaction | null> {
    return this.prisma.transaction.findUnique({
      where: transactionWhereUniqueInput,
    });
  }

  async findMany(
    params: Prisma.TransactionFindManyArgs,
  ): Promise<Transaction[]> {
    return this.prisma.transaction.findMany(params);
  }

  async aggregateRaw(pipeline: Prisma.InputJsonValue[]) {
    return this.prisma.transaction.aggregateRaw({ pipeline });
  }

  async getCount(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.TransactionWhereUniqueInput;
    where?: Prisma.TransactionWhereInput;
    orderBy?: Prisma.TransactionOrderByWithRelationInput;
  }): Promise<number> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.transaction.count({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });
  }

  async create(
    data: Prisma.TransactionUncheckedCreateInput,
  ): Promise<Transaction> {
    return this.prisma.transaction.create({
      data,
    });
  }

  async createMany(
    data: Prisma.TransactionUncheckedCreateInput[],
  ): Promise<void> {
    await this.prisma.transaction.createMany({
      data,
    });
  }

  async update(params: {
    where: Prisma.TransactionWhereUniqueInput;
    data: Prisma.TransactionUpdateInput;
  }): Promise<Transaction> {
    const { where, data } = params;
    return this.prisma.transaction.update({
      data,
      where,
    });
  }

  async delete(
    where: Prisma.TransactionWhereUniqueInput,
  ): Promise<Transaction> {
    return this.prisma.transaction.delete({
      where,
    });
  }

  async deleteMany(where: Prisma.TransactionWhereInput): Promise<void> {
    await this.prisma.transaction.deleteMany({
      where,
    });
  }

  static filterByType(
    transactionType: TransactionType | null,
  ): Prisma.TransactionWhereInput {
    switch (transactionType) {
      case TransactionType.INCOME:
        return {
          fromAccount: { equals: null },
          toAccount: { not: null },
        };
      case TransactionType.EXPENSE:
        return {
          fromAccount: { not: null },
          toAccount: { equals: null },
        };
      case TransactionType.TRANSFER:
        return {
          fromAccount: { not: null },
          toAccount: { not: null },
        };
      case null:
        return {};
      default:
        throw new Error(`Invalid transaction type: ${transactionType}`);
    }
  }

  static filterByYearAndMonth(
    year?: number,
    month?: number,
    filterMode: 'targetMonth' | 'laterThan' = 'targetMonth',
  ): Prisma.TransactionWhereInput {
    if (!year && month) {
      throw new BadRequestException('Year is required when month is provided');
    }

    if (!year && !month) {
      return {};
    }

    if (filterMode === 'laterThan') {
      return {
        date: {
          gte: new Date(year, month - 1 || 0, 1),
        },
      };
    }

    return {
      date: {
        gte: new Date(year, month - 1 || 0, 1),
        lt: new Date(year, month || 12, 1),
      },
    };
  }

  static filterByAccount(
    accountId?: string | string[],
  ): Prisma.TransactionWhereInput {
    if (!accountId) {
      return {};
    }

    if (Array.isArray(accountId)) {
      return {
        OR: [
          {
            toAccount: { in: accountId },
          },
          {
            fromAccount: { in: accountId },
          },
        ],
      };
    }

    return {
      OR: [
        {
          toAccount: accountId,
        },
        {
          fromAccount: accountId,
        },
      ],
    };
  }

  static filterById(ids?: string[]): Prisma.TransactionWhereInput {
    return {
      id: {
        in: ids,
      },
    };
  }
}
