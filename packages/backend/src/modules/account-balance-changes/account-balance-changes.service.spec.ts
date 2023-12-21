import { Test, TestingModule } from '@nestjs/testing';

import { rootMongooseTestModule } from '../../../test/rootMongooseTest.module';

import { AccountBalanceChangesModule } from './account-balance-changes.module';
import { AccountBalanceChangesService } from './account-balance-changes.service';

describe('AccountBalanceChangesService', () => {
  let service: AccountBalanceChangesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [rootMongooseTestModule(), AccountBalanceChangesModule],

      providers: [AccountBalanceChangesService],
    }).compile();

    service = module.get<AccountBalanceChangesService>(
      AccountBalanceChangesService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
