import { Module } from '@nestjs/common';

import { PrismaService } from './prisma.service';
import { AccountBalanceChangeRepo } from './repos/account-balance-change.repo';
import { UserRepo } from './repos/user.repo';

@Module({
  providers: [PrismaService, UserRepo, AccountBalanceChangeRepo],
  exports: [UserRepo, AccountBalanceChangeRepo],
})
export class DatabaseModule {}
