import { AccountType } from '@local/types';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types as MogooseTypes } from 'mongoose';

import { ObjectId } from '../../../types/objectId';

export type AccountDocument = Account & Document<MogooseTypes.ObjectId>;

@Schema({ timestamps: true })
export class Account {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, index: true })
  type: AccountType;

  @Prop({ required: true })
  balance: number;

  @Prop({
    required: true,
    index: true,
    type: MogooseTypes.ObjectId,
  }) // TODO: relation stuff    ref: User.name,
  owner: ObjectId;

  @Prop({ default: false, index: true })
  isDeleted: boolean;
}

export const AccountSchema = SchemaFactory.createForClass(Account);
