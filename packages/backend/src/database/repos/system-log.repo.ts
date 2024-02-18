import { Injectable } from '@nestjs/common';
import { Prisma, SystemLog } from '@prisma/client';

import { PrismaService } from '../prisma.service';

@Injectable()
export class SystemLogRepo {
  constructor(private prisma: PrismaService) {}

  async findMany(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.SystemLogWhereUniqueInput;
    where?: Prisma.SystemLogWhereInput;
    orderBy?: Prisma.SystemLogOrderByWithRelationInput;
  }): Promise<SystemLog[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.systemLog.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });
  }

  async create(data: Prisma.SystemLogCreateInput): Promise<SystemLog> {
    return this.prisma.systemLog.create({
      data,
    });
  }
}
