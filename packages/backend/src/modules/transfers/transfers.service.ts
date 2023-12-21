import { TransactionType } from '@local/types';
import { Injectable } from '@nestjs/common';
import { AccountType } from '@prisma/client';

import { ObjectId } from '../../types/objectId';
import { PaginationDto } from '../../types/pagination.dto';
import { TransactionMonthSummaryDto } from '../transactions/dto/transaction-month-summary.dto';
import { TransactionsService } from '../transactions/transactions.service';

import { CreateTransferDto } from './dto/create-transfer.dto';
import { TransferDto } from './dto/transfer.dto';
import { UpdateTransferDto } from './dto/update-transfer.dto';

@Injectable()
export class TransfersService {
  constructor(private transactionService: TransactionsService) {}

  async findAllByUser(
    userId: ObjectId,
    page: number,
    limit: number,
    year: number,
    month: number,
    accountTypes: AccountType[],
  ): Promise<PaginationDto<TransferDto[]>> {
    return this.transactionService.findAllByUser(
      userId,
      TransactionType.TRANSFER,
      page || undefined,
      limit || undefined,
      year || undefined,
      month || undefined,
      undefined,
      accountTypes || undefined,
    );
  }

  async findMonthlySummariesByUser(
    userId: ObjectId,
    limit: number,
    year: number,
    month: number,
    accountTypes: AccountType[],
    transactionCategories?: ObjectId[],
    parentTransactionCategory?: ObjectId,
  ): Promise<TransactionMonthSummaryDto[]> {
    return this.transactionService.findMonthlySummariesByUser(
      userId,
      TransactionType.TRANSFER,
      limit || undefined,
      year || undefined,
      month || undefined,
      accountTypes || undefined,
      transactionCategories || undefined,
      parentTransactionCategory || undefined,
    );
  }

  async findOne(userId: ObjectId, id: ObjectId): Promise<TransferDto> {
    return this.transactionService.findOne(userId, id);
  }

  async create(userId: ObjectId, createTransfer: CreateTransferDto) {
    return this.transactionService.create(userId, createTransfer);
  }

  async update(
    userId: ObjectId,
    id: ObjectId,
    updateTransactionDto: UpdateTransferDto,
  ) {
    await this.findOne(userId, id);

    return this.transactionService.update(userId, id, updateTransactionDto);
  }

  async remove(userId: ObjectId, id: ObjectId) {
    const transaction = await this.findOne(userId, id);
    await this.transactionService.remove(transaction, userId);
  }
}
