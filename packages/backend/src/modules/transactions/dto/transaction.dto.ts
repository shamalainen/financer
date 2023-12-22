import { ApiProperty } from '@silte/nestjs-swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsDateString,
  IsMongoId,
  IsNotEmpty,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

import { ObjectId } from '../../../types/objectId';
import { IsInstanceOfObjectId } from '../../../utils/is-instance-of-object-id.decorator';
import { objectIdTransformer } from '../../../utils/object-id-transformer';
import { CreateTransactionCategoryMappingWithoutTransactionDto } from '../../transaction-category-mappings/dto/create-transaction-category-mapping.dto';

export class TransactionDto {
  @ApiProperty({ type: String })
  @IsMongoId()
  readonly _id: ObjectId;

  @ApiProperty()
  @Min(0.01, { message: 'Amount must be a positive number.' })
  readonly amount: number;

  @ApiProperty()
  @IsNotEmpty({ message: 'Description must not be empty.' })
  @IsString()
  readonly description: string;

  @ApiProperty()
  @IsDateString({}, { message: 'Date must not be empty.' })
  readonly date: Date;

  @ApiProperty({ type: String })
  @IsMongoId()
  readonly user: ObjectId;

  @ApiProperty({ type: String })
  @IsInstanceOfObjectId({ message: 'fromAccount must not be empty.' })
  @Transform(objectIdTransformer)
  readonly fromAccount: string;

  @ApiProperty({ type: String })
  @IsInstanceOfObjectId({ message: 'toAccount must not be empty.' })
  @Transform(objectIdTransformer)
  readonly toAccount: string;

  @ApiProperty({
    type: CreateTransactionCategoryMappingWithoutTransactionDto,
    isArray: true,
  })
  @ValidateNested({ each: true })
  @Type(() => CreateTransactionCategoryMappingWithoutTransactionDto)
  categories: CreateTransactionCategoryMappingWithoutTransactionDto[];
}
