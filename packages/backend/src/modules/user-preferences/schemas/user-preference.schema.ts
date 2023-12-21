import { UserPreferenceProperty } from '@local/types';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types as MogooseTypes } from 'mongoose';

import { ObjectId } from '../../../types/objectId';

export type UserPreferenceDocument = UserPreference &
  Document<MogooseTypes.ObjectId>;

@Schema({ timestamps: true })
export class UserPreference {
  @Prop({ required: true })
  key: UserPreferenceProperty;

  @Prop({ required: true })
  value: string;

  @Prop({
    required: true,
    index: true,
    type: MogooseTypes.ObjectId,
    // TODO: relation stuff  ref: User.name })
  })
  userId: ObjectId;
}

export const UserPreferenceSchema =
  SchemaFactory.createForClass(UserPreference);
