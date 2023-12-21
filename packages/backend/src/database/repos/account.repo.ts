import { Injectable } from '@nestjs/common';
import { Prisma, Account } from '@prisma/client';

import { PrismaService } from '../prisma.service';

@Injectable()
export class AccountRepo {
  constructor(private prisma: PrismaService) {}

  async findOne(
    accountWhereUniqueInput: Prisma.AccountWhereUniqueInput,
  ): Promise<Account | null> {
    return this.prisma.account.findUnique({
      where: accountWhereUniqueInput,
    });
  }

  async findMany(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.AccountWhereUniqueInput;
    where?: Prisma.AccountWhereInput;
    orderBy?: Prisma.AccountOrderByWithRelationInput;
  }): Promise<Account[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.account.findMany({
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
    cursor?: Prisma.AccountWhereUniqueInput;
    where?: Prisma.AccountWhereInput;
    orderBy?: Prisma.AccountOrderByWithRelationInput;
  }): Promise<number> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.account.count({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });
  }

  async create(data: Prisma.AccountUncheckedCreateInput): Promise<Account> {
    return this.prisma.account.create({
      data,
    });
  }

  async createMany(data: Prisma.AccountUncheckedCreateInput[]): Promise<void> {
    await this.prisma.account.createMany({
      data,
    });
  }

  async update(params: {
    where: Prisma.AccountWhereUniqueInput;
    data: Prisma.AccountUpdateInput;
  }): Promise<Account> {
    const { where, data } = params;
    return this.prisma.account.update({
      data,
      where,
    });
  }

  async delete(where: Prisma.AccountWhereUniqueInput): Promise<Account> {
    return this.prisma.account.delete({
      where,
    });
  }

  async deleteMany(where: Prisma.AccountWhereInput): Promise<void> {
    await this.prisma.account.deleteMany({
      where,
    });
  }
}
