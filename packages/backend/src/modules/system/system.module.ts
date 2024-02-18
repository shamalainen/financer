import { Module } from '@nestjs/common';

import { DatabaseModule } from '../../database/database.module';

import { SystemController } from './system.controller';
import { SystemService } from './system.service';

@Module({
  imports: [DatabaseModule],
  controllers: [SystemController],
  providers: [SystemService],
  exports: [SystemService],
})
export class SystemModule {}
