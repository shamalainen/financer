import { TransactionTemplateType, TransactionType } from '@local/types';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types as MogooseTypes } from 'mongoose';

import { ObjectId } from '../../../types/objectId';
import { Transaction } from '../../transactions/schemas/transaction.schema';

export type TransactionTemplateDocument = TransactionTemplate &
  Document<MogooseTypes.ObjectId>;

@Schema({ timestamps: true, collection: 'transaction-templates' })
export class TransactionTemplate {
  @Prop({
    required: true,
    index: true,
    type: MogooseTypes.ObjectId,
    // TODO: relation stuff  ref: User.name })
  })
  userId: ObjectId;

  @Prop({ required: true })
  templateName: string;

  @Prop({ required: true, type: [String], index: true })
  templateType: TransactionTemplateType[];

  @Prop({ required: true, index: true })
  templateVisibility: TransactionType;

  @Prop({
    type: MogooseTypes.ObjectId,
    ref: Transaction.name,
    default: null,
  })
  fromAccount: ObjectId;

  @Prop({
    type: MogooseTypes.ObjectId,
    ref: Transaction.name,
    default: null,
  })
  toAccount: ObjectId;

  @Prop({ type: Number, default: null })
  amount: number;

  @Prop({
    default: null,
  })
  description: string;

  @Prop({
    type: Number,
    default: null,
  })
  dayOfMonth: number;

  @Prop({
    index: true,
    type: Number,
    default: null,
  })
  dayOfMonthToCreate: number;

  @Prop({ type: [String], default: [] })
  categories: ObjectId[];
}

export const TransactionTemplateSchema =
  SchemaFactory.createForClass(TransactionTemplate);
