import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types as MogooseTypes } from 'mongoose';

import { ObjectId } from '../../../types/objectId';
import { Account } from '../../accounts/schemas/account.schema';

export type AccountBalanceChangeDocument = AccountBalanceChange &
  Document<MogooseTypes.ObjectId>;

@Schema({ timestamps: true, collection: 'account-balance-changes' })
export class AccountBalanceChange {
  @Prop({ default: new Date(), required: true })
  date: Date;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true, type: MogooseTypes.ObjectId }) // TODO: relation stuff  ref: User.name })
  userId: ObjectId;

  @Prop({ required: true, type: MogooseTypes.ObjectId, ref: Account.name })
  accountId: ObjectId;
}

export const AccountBalanceChangeSchema =
  SchemaFactory.createForClass(AccountBalanceChange);
