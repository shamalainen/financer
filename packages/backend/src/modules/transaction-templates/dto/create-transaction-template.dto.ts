import { OmitType } from '@silte/nestjs-swagger';

import { TransactionTemplateDto } from './transaction-template.dto';

export class CreateTransactionTemplateDto extends OmitType(
  TransactionTemplateDto,
  ['id', 'userId', 'createdAt', 'updatedAt', 'v'] as const,
) {}
