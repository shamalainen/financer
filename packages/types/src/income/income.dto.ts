import {
  IsMongoId,
  Min,
  IsNotEmpty,
  IsString,
  IsDateString,
  ValidateNested,
} from 'class-validator';

import { TransactionCategoryMappingDto } from '../transaction-category-mapping/transaction-category-mapping.dto';

export class IncomeDto<
  ObjectIdType = string,
  CategoriesType = TransactionCategoryMappingDto,
> {
  @IsMongoId()
  readonly _id: ObjectIdType;

  @IsMongoId()
  readonly toAccount: ObjectIdType;

  @Min(0.01, { message: 'Amount must be a positive number.' })
  readonly amount: number;

  @IsNotEmpty({ message: 'Description must not be empty.' })
  @IsString()
  readonly description: string;

  @IsDateString({}, { message: 'Date must not be empty.' })
  readonly date: Date;

  @IsMongoId()
  readonly user: ObjectIdType;

  @ValidateNested({ each: true })
  categories: CategoriesType[];
}
