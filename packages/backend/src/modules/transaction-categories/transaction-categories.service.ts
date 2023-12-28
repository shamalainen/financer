import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { TransactionCategory, TransactionType } from '@prisma/client';

import { TransactionCategoryRepo } from '../../database/repos/transaction-category.repo';
import { TransactionCategoryMappingsService } from '../transaction-category-mappings/transaction-category-mappings.service';

import { CreateTransactionCategoryDto } from './dto/create-transaction-category.dto';
import { CategoryMonthlySummaryDto } from './dto/transaction-month-summary.dto';
import { UpdateTransactionCategoryDto } from './dto/update-transaction-category.dto';

@Injectable()
export class TransactionCategoriesService {
  constructor(
    private readonly transactionCategoryRepo: TransactionCategoryRepo,
    private readonly transactionCategoryMappingsService: TransactionCategoryMappingsService,
  ) {}

  private async isParentIdInChildHierarchy(
    categoryId: string,
    newParentId: string,
  ): Promise<boolean> {
    const categories = await this.findAllChildrensById([categoryId]);
    const ids = categories.map(({ id }) => id);

    return ids.includes(newParentId);
  }

  async create(
    userId: string,
    createTransactionCategoryDto: CreateTransactionCategoryDto,
  ): Promise<TransactionCategory> {
    const newCategory = {
      ...createTransactionCategoryDto,
      userId,
    };

    if (newCategory.parentCategoryId) {
      await this.findOne(userId, newCategory.parentCategoryId);
    }

    return this.transactionCategoryRepo.create(newCategory);
  }

  async createMany(
    userId: string,
    createTransactionCategoryDto: CreateTransactionCategoryDto[],
  ) {
    return this.transactionCategoryRepo.createMany(
      createTransactionCategoryDto.map((category) => ({ ...category, userId })),
    );
  }

  findAll() {
    return `This action returns all transactionCategories`;
  }

  async findOne(userId: string, id: string): Promise<TransactionCategory> {
    const category = await this.transactionCategoryRepo.findOne({ id, userId });

    if (!category) {
      throw new NotFoundException('Category not found.');
    }

    return category;
  }

  async findAllChildrensById(parentIds: string[], depth = 0) {
    if (depth > 10) {
      throw new InternalServerErrorException(
        'Too many levels of nesting, probably infite loop on hierarchy?',
      );
    }

    const categories = await this.transactionCategoryRepo.findMany({
      where: {
        parentCategoryId: { in: parentIds },
      },
    });

    const ids = categories.map((category) => category.id);

    if (ids.length === 0) {
      return categories;
    }

    const childCategories = await this.findAllChildrensById(ids, depth + 1);

    return [...categories, ...childCategories];
  }

  async findAllByUser(
    userId: string,
    visibilityType?: TransactionType,
  ): Promise<TransactionCategory[]> {
    return this.transactionCategoryRepo.findMany({
      where: {
        userId,
        deleted: { not: true },
        visibility: {
          has: visibilityType,
        },
      },
    });
  }

  async findMonthlySummariesByUserAndId(
    userId: string,
    parentCategoryId: string,
    year?: number,
    month?: number,
  ): Promise<CategoryMonthlySummaryDto[]> {
    const childrenIds = await this.findAllChildrensById([parentCategoryId]);
    const targetIds = [parentCategoryId, ...childrenIds];

    return this.transactionCategoryMappingsService.findMonthlySummariesByUserAndId(
      userId,
      targetIds,
      year,
      month,
    );
  }

  async update(
    userId: string,
    id: string,
    updateTransactionCategoryDto: UpdateTransactionCategoryDto,
  ) {
    await this.findOne(userId, id);

    if (updateTransactionCategoryDto.parentCategoryId) {
      const parentId = updateTransactionCategoryDto.parentCategoryId;

      if (await this.isParentIdInChildHierarchy(id, parentId)) {
        throw new BadRequestException(
          'Parent category cannot be child category of current item.',
        );
      }
    }

    return this.transactionCategoryRepo.update({
      where: { id, userId },
      data: updateTransactionCategoryDto,
    });
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);

    await this.transactionCategoryRepo.update({
      where: { id, userId },
      data: { deleted: true },
    });
  }

  async removeAllByUser(userId: string) {
    await this.transactionCategoryRepo.deleteMany({ userId });
  }

  async ensureCategoriesExist(ids: string[]) {
    const categories = await this.transactionCategoryRepo.findMany({
      where: {
        id: {
          in: ids,
        },
      },
    });

    const hasMatchingCategoryIds = ids.every((id) =>
      categories.some((category) => category.id === id),
    );

    if (!hasMatchingCategoryIds) {
      throw new BadRequestException('One or more categories does not exist.');
    }
  }
}
