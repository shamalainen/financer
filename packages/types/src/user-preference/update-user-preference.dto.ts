import { IsEnum, IsNotEmpty } from 'class-validator';

import { UserPreferenceProperty } from './user-preference-property';

export class UpdateUserPreferenceDto {
  @IsEnum(UserPreferenceProperty, {
    message: `User preference property must be one of following: ${Object.values(
      UserPreferenceProperty,
    ).join(', ')}.`,
  })
  readonly key: UserPreferenceProperty;

  @IsNotEmpty()
  readonly value: string;
}
