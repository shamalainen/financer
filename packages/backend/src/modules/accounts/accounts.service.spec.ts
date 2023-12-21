import { forwardRef } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { rootMongooseTestModule } from '../../../test/rootMongooseTest.module';
import { AccountBalanceChangesModule } from '../account-balance-changes/account-balance-changes.module';
import { TransactionsModule } from '../transactions/transactions.module';

import { AccountsService } from './accounts.service';

describe('AccountsService', () => {
  let service: AccountsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        rootMongooseTestModule(),
        AccountBalanceChangesModule,
        forwardRef(() => TransactionsModule),
      ],
      providers: [AccountsService],
    }).compile();

    service = module.get<AccountsService>(AccountsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
