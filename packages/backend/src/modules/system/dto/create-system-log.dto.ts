import { OmitType } from '@nestjs/mapped-types';

import { SystemLogDto } from './system-log.dto';

export class CreateSystemLogDto extends OmitType(SystemLogDto, [
  'id',
  'createdAt',
  'updatedAt',
] as const) {}
