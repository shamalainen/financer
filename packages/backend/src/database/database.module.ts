import { Module } from '@nestjs/common';

import { PrismaService } from './prisma.service';
import { AccountBalanceChangeRepo } from './repos/account-balance-change.repo';
import { AccountRepo } from './repos/account.repo';
import { UserRepo } from './repos/user.repo';

@Module({
  providers: [PrismaService, UserRepo, AccountBalanceChangeRepo, AccountRepo],
  exports: [UserRepo, AccountBalanceChangeRepo, AccountRepo],
})
export class DatabaseModule {}
