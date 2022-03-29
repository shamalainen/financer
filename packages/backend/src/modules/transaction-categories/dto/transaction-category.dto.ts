import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';

import { ObjectId } from '../../../types/objectId';
import { objectIdTransformer } from '../../../utils/object-id-transformer';
import { VisibilityType } from '../schemas/transaction-category.schema';

export class TransactionCategoryDto {
  @IsMongoId()
  _id: ObjectId;

  @IsMongoId()
  owner: ObjectId;

  @IsNotEmpty({ message: 'Name must not be empty.' })
  name: string;

  @IsOptional()
  @IsEnum(VisibilityType, {
    each: true,
    message:
      'Visibility must be one of the following: income, expense, transfer.',
  })
  visibility: VisibilityType[];

  @IsOptional()
  @Transform(objectIdTransformer)
  parent_category_id: ObjectId | null;

  @IsOptional()
  @IsBoolean()
  deleted: boolean;
}
