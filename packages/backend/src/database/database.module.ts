import { Module } from '@nestjs/common';

import { PrismaService } from './prisma.service';
import { AccountBalanceChangeRepo } from './repos/account-balance-change.repo';
import { AccountRepo } from './repos/account.repo';
import { SystemLogRepo } from './repos/system-log.repo';
import { TransactionCategoryMappingRepo } from './repos/transaction-category-mapping.repo';
import { TransactionCategoryRepo } from './repos/transaction-category.repo';
import { UserPreferencesRepo } from './repos/user-preferences.repo';
import { UserRepo } from './repos/user.repo';

@Module({
  providers: [
    PrismaService,
    UserRepo,
    AccountBalanceChangeRepo,
    AccountRepo,
    SystemLogRepo,
    UserPreferencesRepo,
    TransactionCategoryRepo,
    TransactionCategoryMappingRepo,
  ],
  exports: [
    UserRepo,
    AccountBalanceChangeRepo,
    AccountRepo,
    SystemLogRepo,
    UserPreferencesRepo,
    TransactionCategoryRepo,
    TransactionCategoryMappingRepo,
  ],
})
export class DatabaseModule {}
