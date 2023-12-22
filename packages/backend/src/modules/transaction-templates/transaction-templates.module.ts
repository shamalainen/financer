import { Module } from '@nestjs/common';

import { DatabaseModule } from '../../database/database.module';

import { TransactionTemplatesController } from './transaction-templates.controller';
import { TransactionTemplatesService } from './transaction-templates.service';

@Module({
  imports: [DatabaseModule],
  controllers: [TransactionTemplatesController],
  providers: [TransactionTemplatesService],
  exports: [TransactionTemplatesService],
})
export class TransactionTemplateModule {}
