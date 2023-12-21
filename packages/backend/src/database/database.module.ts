import { Module } from '@nestjs/common';

import { PrismaService } from './prisma.service';
import { AccountBalanceChangeRepo } from './repos/account-balance-change.repo';
import { AccountRepo } from './repos/account.repo';
import { SystemLogRepo } from './repos/system-log.repo';
import { UserRepo } from './repos/user.repo';

@Module({
  providers: [
    PrismaService,
    UserRepo,
    AccountBalanceChangeRepo,
    AccountRepo,
    SystemLogRepo,
  ],
  exports: [UserRepo, AccountBalanceChangeRepo, AccountRepo, SystemLogRepo],
})
export class DatabaseModule {}
