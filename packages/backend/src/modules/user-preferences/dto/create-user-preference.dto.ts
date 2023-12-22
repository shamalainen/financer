import { OmitType } from '@silte/nestjs-swagger';

import { UserPreferenceDto } from './user-preference.dto';

export class CreateUserPreferenceDto extends OmitType(UserPreferenceDto, [
  'id',
  'userId',
  'v',
  'createdAt',
  'updatedAt',
] as const) {}
