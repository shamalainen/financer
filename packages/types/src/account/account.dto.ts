import {
  IsBoolean,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';

import { AccountType } from './account-type';

export class AccountDto<ObjectIdType = string> {
  @IsMongoId()
  readonly _id: ObjectIdType;

  @IsNotEmpty({ message: 'Name must not be empty.' })
  @IsString()
  readonly name: string;

  @IsEnum(AccountType, {
    message:
      'Type must be one of the following: cash, savings, investment, credit, loan.',
  })
  readonly type: AccountType;

  @IsNumber({}, { message: 'Balance must be a number.' })
  readonly balance: number;

  @IsMongoId()
  readonly owner: ObjectIdType;

  @IsBoolean()
  isDeleted?: boolean;
}
