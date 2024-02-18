import { Module } from '@nestjs/common';

import { DatabaseModule } from '../../database/database.module';
import { AccountBalanceChangesService } from '../account-balance-changes/account-balance-changes.service';
import { AccountsService } from '../accounts/accounts.service';
import { TransactionCategoriesService } from '../transaction-categories/transaction-categories.service';
import { TransactionCategoryMappingsService } from '../transaction-category-mappings/transaction-category-mappings.service';

import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';

@Module({
  imports: [DatabaseModule],
  controllers: [TransactionsController],
  providers: [
    TransactionsService,
    AccountsService,
    TransactionCategoriesService,
    TransactionCategoryMappingsService,
    AccountBalanceChangesService,
  ],
  exports: [TransactionsService],
})
export class TransactionsModule {}
