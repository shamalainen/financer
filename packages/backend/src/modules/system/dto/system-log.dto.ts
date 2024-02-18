import { SystemLog, SystemLogLevel } from '@prisma/client';
import { Allow, IsEnum, IsMongoId, IsString } from 'class-validator';

export class SystemLogDto implements SystemLog {
  @IsMongoId()
  readonly id: string;

  @IsString()
  readonly module: string;

  @IsString()
  readonly service: string;

  @IsString()
  readonly message: string;

  @IsEnum(SystemLogLevel)
  readonly level: SystemLogLevel;

  @Allow()
  readonly createdAt: Date;

  @Allow()
  readonly updatedAt: Date;
}
