import {
  IsMongoId,
  Min,
  IsNotEmpty,
  IsString,
  IsDateString,
  IsOptional,
  ValidateNested,
} from 'class-validator';

import { CreateTransactionCategoryMappingDto } from '../transaction-category-mapping/create-transaction-category-mapping.dto';

export class CreateIncomeDto<
  ObjectIdType = string,
  CategoriesType = CreateTransactionCategoryMappingDto,
> {
  @IsMongoId()
  readonly toAccount: ObjectIdType;

  @Min(0.01, { message: 'Amount must be a positive number.' })
  readonly amount: number;

  @IsNotEmpty({ message: 'Description must not be empty.' })
  @IsString()
  readonly description: string;

  @IsDateString({}, { message: 'Date must not be empty.' })
  readonly date: Date;

  @IsOptional()
  @ValidateNested({ each: true })
  categories?: Omit<CategoriesType, 'transaction_id'>[];
}
