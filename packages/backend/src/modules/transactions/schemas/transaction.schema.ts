import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types as MogooseTypes } from 'mongoose';

import { ObjectId } from '../../../types/objectId';

export type TransactionDocument = Transaction & Document<MogooseTypes.ObjectId>;

@Schema({ timestamps: true })
export class Transaction {
  @Prop({
    index: true,
    type: MogooseTypes.ObjectId,
    default: null,
  })
  fromAccount: ObjectId;

  @Prop({
    index: true,
    type: MogooseTypes.ObjectId,
    default: null,
  })
  toAccount: ObjectId;

  @Prop({ required: true })
  amount: number;

  @Prop({ default: '' })
  description: string;

  @Prop({ default: '', index: true })
  date: Date;

  @Prop({
    required: true,
    index: true,
    type: MogooseTypes.ObjectId,
    // TODO: relation stuff  ref: User.name })
  })
  user: ObjectId;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);
