import {
  ApiPropertyOptional,
  IntersectionType,
  OmitType,
  PartialType,
  PickType,
} from '@silte/nestjs-swagger';
import { Type } from 'class-transformer';
import { IsOptional, ValidateNested } from 'class-validator';

import { CreateTransactionCategoryMappingWithoutTransactionDto } from '../../transaction-category-mappings/dto/create-transaction-category-mapping.dto';

import { TransactionDto } from './transaction.dto';

export class CreateTransactionDto extends IntersectionType(
  OmitType(TransactionDto, [
    'id',
    'userId',
    'categories',
    'fromAccount',
    'toAccount',
    'updatedAt',
    'createdAt',
    'v',
  ] as const),
  PartialType(PickType(TransactionDto, ['fromAccount', 'toAccount'] as const)),
) {
  @ApiPropertyOptional()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateTransactionCategoryMappingWithoutTransactionDto)
  categories?: CreateTransactionCategoryMappingWithoutTransactionDto[];
}
