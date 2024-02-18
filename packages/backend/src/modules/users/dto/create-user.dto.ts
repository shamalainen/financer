import { OmitType } from '@silte/nestjs-swagger';

import { UserDto } from './user.dto';

export class CreateUserDto extends OmitType(UserDto, [
  'id',
  'createdAt',
  'updatedAt',
  'v',
] as const) {}
