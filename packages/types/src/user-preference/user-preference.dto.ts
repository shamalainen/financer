import { IsMongoId, IsEnum, IsNotEmpty } from 'class-validator';

import { UserPreferenceProperty } from './user-preference-property';

export class UserPreferenceDto<ObjectIdType = string> {
  @IsMongoId()
  readonly _id: ObjectIdType;

  @IsMongoId()
  readonly userId: ObjectIdType;

  @IsEnum(UserPreferenceProperty, {
    message: `User preference property must be one of following: ${Object.values(
      UserPreferenceProperty,
    ).join(', ')}.`,
  })
  readonly key: UserPreferenceProperty;

  @IsNotEmpty()
  readonly value: string;
}
