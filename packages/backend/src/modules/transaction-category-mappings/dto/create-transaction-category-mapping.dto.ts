import { OmitType } from '@silte/nestjs-swagger';

import { TransactionCategoryMappingDto } from './transaction-category-mapping.dto';

export class CreateTransactionCategoryMappingDto extends OmitType(
  TransactionCategoryMappingDto,
  ['id', 'userId', 'createdAt', 'updatedAt', 'v'] as const,
) {}

export class CreateTransactionCategoryMappingWithoutTransactionDto extends OmitType(
  CreateTransactionCategoryMappingDto,
  ['transactionId'] as const,
) {}
