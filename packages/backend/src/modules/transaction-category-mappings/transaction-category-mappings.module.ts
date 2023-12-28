import { Module } from '@nestjs/common';

import { DatabaseModule } from '../../database/database.module';

import { TransactionCategoryMappingsService } from './transaction-category-mappings.service';

@Module({
  imports: [DatabaseModule],
  providers: [TransactionCategoryMappingsService],
  exports: [TransactionCategoryMappingsService],
})
export class TransactionCategoryMappingsModule {}
