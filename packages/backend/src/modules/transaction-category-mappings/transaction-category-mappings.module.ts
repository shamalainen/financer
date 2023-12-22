import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { DatabaseModule } from '../../database/database.module';

import {
  TransactionCategoryMapping,
  TransactionCategoryMappingSchema,
} from './schemas/transaction-category-mapping.schema';
import { TransactionCategoryMappingsService } from './transaction-category-mappings.service';

@Module({
  imports: [
    DatabaseModule,
    MongooseModule.forFeature([
      {
        name: TransactionCategoryMapping.name,
        schema: TransactionCategoryMappingSchema,
      },
    ]),
  ],
  providers: [TransactionCategoryMappingsService],
  exports: [TransactionCategoryMappingsService],
})
export class TransactionCategoryMappingsModule {}
