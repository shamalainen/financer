import { TransactionsService } from './transactions.service';

describe('TransactionsService', () => {
  let service: TransactionsService;

  // beforeEach(async () => {
  //   const module: TestingModule = await Test.createTestingModule({
  //     imports: [
  //       rootMongooseTestModule(),
  //       MongooseModule.forFeature([
  //         { name: Transaction.name, schema: TransactionSchema },
  //       ]),
  //       AccountsModule,
  //       TransactionCategoriesModule,
  //       TransactionCategoryMappingsModule,
  //     ],
  //     providers: [TransactionsService],
  //   }).compile();

  //   service = module.get<TransactionsService>(TransactionsService);
  // });

  it.skip('should be defined', () => {
    expect(service).toBeDefined();
  });
});

// private transactionModel: Model<TransactionDocument>,
// private accountService: AccountsService,
// private transactionCategoriesService: TransactionCategoriesService,
// private transactionCategoryMappingsService: TransactionCategoryMappingsService,
