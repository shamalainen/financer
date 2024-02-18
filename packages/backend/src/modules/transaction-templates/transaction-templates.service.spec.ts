import { Test, TestingModule } from '@nestjs/testing';

import { rootMongooseTestModule } from '../../../test/rootMongooseTest.module';

import { TransactionTemplatesService as TransactionTemplatesService } from './transaction-templates.service';

describe('TransactionTemplatesService', () => {
  let service: TransactionTemplatesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [rootMongooseTestModule()],
      providers: [TransactionTemplatesService],
    }).compile();

    service = module.get<TransactionTemplatesService>(
      TransactionTemplatesService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
