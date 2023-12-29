import { IsOptional, IsString, IsMongoId, Min } from 'class-validator';

export class CreateTransactionCategoryMappingDto<ObjectIdType = string> {
  @IsOptional()
  @IsString({ message: 'Description must not be empty.' })
  description?: string;

  @IsMongoId()
  category_id: ObjectIdType;

  @IsMongoId()
  transaction_id: ObjectIdType;

  @Min(0.01, { message: 'Amount must be a positive number.' })
  amount: number;
}

export class CreateTransactionCategoryMappingDtoWithoutTransaction<
  ObjectIdType = string,
> {
  @IsOptional()
  @IsString({ message: 'Description must not be empty.' })
  description?: string;

  @IsMongoId()
  category_id: ObjectIdType;

  @Min(0.01, { message: 'Amount must be a positive number.' })
  amount: number;
}
