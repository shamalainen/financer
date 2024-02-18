import {
  TransactionTemplateLog,
  TransactionTemplateType,
} from '@prisma/client';
import { IsMongoId, IsEnum, IsDateString } from 'class-validator';

export class TransactionTemplateLogDto implements TransactionTemplateLog {
  @IsMongoId()
  readonly id: string;

  @IsMongoId()
  readonly userId: string;

  @IsEnum(TransactionTemplateType, {
    each: true,
    message: 'Type must defined.',
  })
  readonly eventType: TransactionTemplateType;

  @IsMongoId()
  readonly transactionId: string = null;

  @IsMongoId()
  readonly templateId: string = null;

  @IsDateString({}, { message: 'Date must not be empty.' })
  readonly executed: Date;
}
