// import { Transaction, TransactionSchema } from './schemas/transaction.schema';
import { TransactionsController } from './transactions.controller';

describe('TransactionsController', () => {
  let controller: TransactionsController;

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
  //     controllers: [TransactionsController],
  //     providers: [TransactionsService],
  //   }).compile();

  //   controller = module.get<TransactionsController>(TransactionsController);
  // });

  it.skip('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
