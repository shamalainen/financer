import {
  IsMongoId,
  Min,
  IsNotEmpty,
  IsString,
  ValidateNested,
  IsEnum,
  Max,
  IsOptional,
} from 'class-validator';

import { TransactionType } from '../transaction/transaction-type';

import { TransactionTemplateType } from './transaction-template-type';

export class UpdateTransactionTemplateDto<ObjectIdType = string> {
  @IsNotEmpty({ message: 'Template name must not be empty.' })
  @IsString()
  readonly templateName: string;

  @IsEnum(TransactionTemplateType, {
    each: true,
    message: 'Type must defined.',
  })
  readonly templateType: TransactionTemplateType[];

  @IsEnum(TransactionType, {
    message: 'Type must defined.',
  })
  readonly templateVisibility: TransactionType;

  @IsMongoId()
  readonly fromAccount?: ObjectIdType;

  @IsMongoId()
  readonly toAccount?: ObjectIdType;

  @Min(0.01, { message: 'Amount must be a positive number.' })
  readonly amount?: number;

  @IsOptional()
  @IsString()
  readonly description?: string;

  @Min(1, { message: 'Day of month must be a positive number.' })
  @Max(31, { message: 'Day of month must not be greater than 31.' })
  readonly dayOfMonth?: number;

  @Min(1, {
    message: 'Day of month to create transaction must be a positive number.',
  })
  @Max(31, {
    message: 'Day of month to create transaction must not be greater than 31.',
  })
  readonly dayOfMonthToCreate?: number;

  @ValidateNested({ each: true })
  readonly categories?: ObjectIdType[];
}
