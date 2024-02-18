import { OmitType } from '@silte/nestjs-swagger';

import { AccountDto } from './account.dto';

export class CreateAccountDto extends OmitType(AccountDto, [
  'id',
  'userId',
  'isDeleted',
  'createdAt',
  'updatedAt',
  'v',
] as const) {}
