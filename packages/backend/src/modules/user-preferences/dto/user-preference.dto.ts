import { UserPreferenceProperty, UserPreferences } from '@prisma/client';
import { ApiProperty } from '@silte/nestjs-swagger';
import { IsMongoId, IsEnum, IsNotEmpty } from 'class-validator';

export class UserPreferenceDto implements UserPreferences {
  v: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @IsMongoId()
  @ApiProperty({ type: String })
  readonly id: string;

  @IsMongoId()
  @ApiProperty({ type: String })
  readonly userId: string;

  @IsEnum(UserPreferenceProperty, {
    message: `User preference property must be one of following: ${Object.values(
      UserPreferenceProperty,
    ).join(', ')}.`,
  })
  @ApiProperty({
    enum: UserPreferenceProperty,
    enumName: 'UserPreferenceProperty',
  })
  readonly key: UserPreferenceProperty;

  @IsNotEmpty()
  @ApiProperty()
  readonly value: string;
}
