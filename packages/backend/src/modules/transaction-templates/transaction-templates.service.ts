import { TransactionTemplateType } from '@local/types';
import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { ObjectId } from '../../types/objectId';
import { getLastDayOfMonth } from '../../utils/date-utils';
import { CreateTransactionDto } from '../transactions/dto/create-transaction.dto';

import { CreateTransactionTemplateLogDto } from './dto/create-transaction-template-log.dto';
import { CreateTransactionTemplateDto } from './dto/create-transaction-template.dto';
import { TransactionTemplateDto } from './dto/transaction-template.dto';
import { UpdateTransactionTemplateDto } from './dto/update-transaction-template.dto';
import {
  TransactionTemplateLog,
  TransactionTemplateLogDocument,
} from './schemas/transaction-template-log.schema';
import {
  TransactionTemplate,
  TransactionTemplateDocument,
} from './schemas/transaction-template.schema';

@Injectable()
export class TransactionTemplatesService {
  constructor(
    @InjectModel(TransactionTemplate.name)
    private transactionTemplateModel: Model<TransactionTemplateDocument>,
    @InjectModel(TransactionTemplateLog.name)
    private transactionTemplateLogModel: Model<TransactionTemplateLogDocument>,
  ) {}

  async create(
    createTransactionTemplateDto: CreateTransactionTemplateDto,
    userId: ObjectId,
  ) {
    return this.transactionTemplateModel.create({
      ...createTransactionTemplateDto,
      userId,
    });
  }

  async createMany(
    createTransactionTemplateDto: CreateTransactionTemplateDto[],
  ) {
    return this.transactionTemplateModel.insertMany(
      createTransactionTemplateDto,
    );
  }

  async findAllByUser(userId: ObjectId) {
    return this.transactionTemplateModel.find({ userId });
  }

  async findAllByUserAndType(
    userId: ObjectId,
    templateType: TransactionTemplateType,
  ) {
    return this.transactionTemplateModel.find({
      userId,
      templateType,
    });
  }

  async findOne(id: ObjectId, userId: ObjectId) {
    const template = await this.transactionTemplateModel.findOne({ _id: id });

    if (!template) {
      throw new NotFoundException('Transaction template not found.');
    } else if (!template.userId.equals(userId)) {
      throw new UnauthorizedException(
        'Unauthorized to access this transaction template.',
      );
    }

    return template;
  }

  async update(
    id: ObjectId,
    updateTransactionTemplateDto: UpdateTransactionTemplateDto,
    userId: ObjectId,
  ) {
    await this.findOne(id, userId);
    return this.transactionTemplateModel.updateOne(
      { _id: id },
      updateTransactionTemplateDto,
      {
        new: true,
      },
    );
  }

  async findAutomatedTemplatesWithCreationDateBefore(
    dayOfMonth: number,
    dateOperator: '$eq' | '$gte' = '$eq',
  ) {
    return this.transactionTemplateModel.find({
      templateType: TransactionTemplateType.AUTO,
      dayOfMonthToCreate: { [dateOperator]: dayOfMonth },
    });
  }

  async remove(id: ObjectId, userId: ObjectId) {
    await this.findOne(id, userId);
    return this.transactionTemplateModel.deleteOne({ _id: id });
  }

  async removeAllByUser(userId: ObjectId) {
    await this.transactionTemplateModel.deleteMany({ userId }).exec();
  }

  getTransactionFromTemplate(
    template: TransactionTemplateDto,
  ): CreateTransactionDto {
    const date = new Date();

    // Set the date to the first day of the month so when we add month it won't skip month e.g. 31.01 + 1 month = 03.03
    date.setDate(1);

    if (template.dayOfMonth < template.dayOfMonthToCreate) {
      date.setMonth(date.getMonth() + 1);
    }

    if (getLastDayOfMonth(date) < template.dayOfMonth) {
      date.setDate(getLastDayOfMonth(date));
    } else {
      date.setDate(template.dayOfMonth);
    }

    const categoryAmount = template.amount / template.categories.length;

    const categories = template.categories.map((category) => ({
      categoryId: category.toString(),
      amount: categoryAmount,
      description: null,
    }));

    return {
      fromAccount: template.fromAccount,
      toAccount: template.toAccount,
      amount: template.amount,
      description: template.description,
      date,
      categories,
    };
  }

  async createTemplateLogEntry(
    logItem: CreateTransactionTemplateLogDto,
  ): Promise<void> {
    await this.transactionTemplateLogModel.create(logItem);
  }

  async findTemplateLogEntriesByTemplateIdsAndType(
    templateIds: ObjectId[],
    templateType: TransactionTemplateType,
  ): Promise<TransactionTemplateLog[]> {
    return this.transactionTemplateLogModel.find({
      templateId: { $in: templateIds },
      eventType: templateType,
      executed: { $gt: new Date(Date.now() - 1000 * 60 * 60 * 60) }, // 2 months
    });
  }
}
