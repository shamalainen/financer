import { Injectable } from '@nestjs/common';
import { Prisma, UserPreferences } from '@prisma/client';

import { PrismaService } from '../prisma.service';

@Injectable()
export class UserPreferencesRepo {
  constructor(private prisma: PrismaService) {}

  async findOne(
    userPreferencesWhereUniqueInput: Prisma.UserPreferencesWhereUniqueInput,
  ): Promise<UserPreferences | null> {
    return this.prisma.userPreferences.findUnique({
      where: userPreferencesWhereUniqueInput,
    });
  }

  async findMany(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.UserPreferencesWhereUniqueInput;
    where?: Prisma.UserPreferencesWhereInput;
    orderBy?: Prisma.UserPreferencesOrderByWithRelationInput;
  }): Promise<UserPreferences[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.userPreferences.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });
  }

  async create(
    data: Prisma.UserPreferencesUncheckedCreateInput,
  ): Promise<UserPreferences> {
    return this.prisma.userPreferences.create({
      data,
    });
  }

  async createMany(
    data: Prisma.UserPreferencesUncheckedCreateInput[],
  ): Promise<void> {
    await this.prisma.userPreferences.createMany({
      data,
    });
  }

  async update(params: {
    where: Prisma.UserPreferencesWhereUniqueInput;
    data: Prisma.UserPreferencesUpdateInput;
  }): Promise<UserPreferences> {
    const { where, data } = params;
    return this.prisma.userPreferences.update({
      data,
      where,
    });
  }

  async delete(
    where: Prisma.UserPreferencesWhereUniqueInput,
  ): Promise<UserPreferences> {
    return this.prisma.userPreferences.delete({
      where,
    });
  }

  async deleteMany(where: Prisma.UserPreferencesWhereInput): Promise<void> {
    await this.prisma.userPreferences.deleteMany({
      where,
    });
  }
}
