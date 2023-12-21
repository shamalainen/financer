import { TransactionTemplateType } from '@local/types';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types as MogooseTypes } from 'mongoose';

import { ObjectId } from '../../../types/objectId';
import { Transaction } from '../../transactions/schemas/transaction.schema';

import { TransactionTemplate } from './transaction-template.schema';

export type TransactionTemplateLogDocument = TransactionTemplateLog &
  Document<MogooseTypes.ObjectId>;

@Schema({ timestamps: true, collection: 'transaction-template-logs' })
export class TransactionTemplateLog {
  @Prop({
    required: true,
    index: true,
    type: MogooseTypes.ObjectId,
    // TODO: relation stuff  ref: User.name })
  })
  userId: ObjectId;

  @Prop({ required: true, type: String, index: true })
  eventType: TransactionTemplateType;

  @Prop({
    required: true,
    type: MogooseTypes.ObjectId,
    ref: Transaction.name,
    index: true,
  })
  transactionId: ObjectId;

  @Prop({
    required: true,
    type: MogooseTypes.ObjectId,
    ref: TransactionTemplate.name,
    index: true,
  })
  templateId: ObjectId;

  @Prop({ required: true, index: true })
  executed: Date;
}

export const TransactionTemplateLogSchema = SchemaFactory.createForClass(
  TransactionTemplateLog,
);
