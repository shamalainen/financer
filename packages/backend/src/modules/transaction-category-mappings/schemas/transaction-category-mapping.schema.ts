import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types as MogooseTypes } from 'mongoose';

import { ObjectId } from '../../../types/objectId';
import { TransactionCategory } from '../../transaction-categories/schemas/transaction-category.schema';
import { Transaction } from '../../transactions/schemas/transaction.schema';

export type TransactionCategoryMappingDocument = TransactionCategoryMapping &
  Document<MogooseTypes.ObjectId>;

@Schema({ timestamps: true, collection: 'transaction-category-mappings' })
export class TransactionCategoryMapping {
  @Prop({
    required: true,
    index: true,
    type: MogooseTypes.ObjectId,
    // TODO: relation stuff  ref: User.name })
  })
  owner: ObjectId;

  @Prop({ default: '' })
  description: string;

  @Prop({
    type: MogooseTypes.ObjectId,
    ref: TransactionCategory.name,
    required: true,
  })
  category_id: ObjectId;

  @Prop({
    type: MogooseTypes.ObjectId,
    index: true,
    ref: Transaction.name,
    required: true,
  })
  transaction_id: ObjectId;

  @Prop({ required: true })
  amount: number;
}

export const TransactionCategoryMappingSchema = SchemaFactory.createForClass(
  TransactionCategoryMapping,
);
