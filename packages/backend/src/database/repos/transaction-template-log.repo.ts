import { Injectable } from '@nestjs/common';
import { Prisma, TransactionTemplateLog } from '@prisma/client';

import { PrismaService } from '../prisma.service';

@Injectable()
export class TransactionTemplateLogRepo {
  constructor(private prisma: PrismaService) {}

  async findOne(
    transactionTemplateLogWhereUniqueInput: Prisma.TransactionTemplateLogWhereUniqueInput,
  ): Promise<TransactionTemplateLog | null> {
    return this.prisma.transactionTemplateLog.findUnique({
      where: transactionTemplateLogWhereUniqueInput,
    });
  }

  async findMany(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.TransactionTemplateLogWhereUniqueInput;
    where?: Prisma.TransactionTemplateLogWhereInput;
    orderBy?: Prisma.TransactionTemplateLogOrderByWithRelationInput;
  }): Promise<TransactionTemplateLog[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.transactionTemplateLog.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });
  }

  async getCount(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.TransactionTemplateLogWhereUniqueInput;
    where?: Prisma.TransactionTemplateLogWhereInput;
    orderBy?: Prisma.TransactionTemplateLogOrderByWithRelationInput;
  }): Promise<number> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.transactionTemplateLog.count({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });
  }

  async create(
    data: Prisma.TransactionTemplateLogUncheckedCreateInput,
  ): Promise<TransactionTemplateLog> {
    return this.prisma.transactionTemplateLog.create({
      data,
    });
  }

  async createMany(
    data: Prisma.TransactionTemplateLogUncheckedCreateInput[],
  ): Promise<void> {
    await this.prisma.transactionTemplateLog.createMany({
      data,
    });
  }

  async update(params: {
    where: Prisma.TransactionTemplateLogWhereUniqueInput;
    data: Prisma.TransactionTemplateLogUpdateInput;
  }): Promise<TransactionTemplateLog> {
    const { where, data } = params;
    return this.prisma.transactionTemplateLog.update({
      data,
      where,
    });
  }

  async delete(
    where: Prisma.TransactionTemplateLogWhereUniqueInput,
  ): Promise<TransactionTemplateLog> {
    return this.prisma.transactionTemplateLog.delete({
      where,
    });
  }

  async deleteMany(
    where: Prisma.TransactionTemplateLogWhereInput,
  ): Promise<void> {
    await this.prisma.transactionTemplateLog.deleteMany({
      where,
    });
  }
}
