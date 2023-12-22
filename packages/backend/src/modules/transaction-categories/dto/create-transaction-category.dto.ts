import { OmitType } from '@silte/nestjs-swagger';

import { TransactionCategoryDto } from './transaction-category.dto';

export class CreateTransactionCategoryDto extends OmitType(
  TransactionCategoryDto,
  ['id', 'userId', 'deleted', 'createdAt', 'updatedAt', 'v'] as const,
) {}
