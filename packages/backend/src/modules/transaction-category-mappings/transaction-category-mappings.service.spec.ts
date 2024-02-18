import { TransactionCategoryMappingsService } from './transaction-category-mappings.service';

describe('TransactionCategoryMappingsService', () => {
  let service: TransactionCategoryMappingsService;

  // beforeEach(async () => {
  //   const module: TestingModule = await Test.createTestingModule({
  //     imports: [
  //       rootMongooseTestModule(),
  //       MongooseModule.forFeature([
  //         {
  //           name: TransactionCategoryMapping.name,
  //           schema: TransactionCategoryMappingSchema,
  //         },
  //       ]),
  //     ],
  //     providers: [TransactionCategoryMappingsService],
  //   }).compile();

  //   service = module.get<TransactionCategoryMappingsService>(
  //     TransactionCategoryMappingsService,
  //   );
  // });

  it.skip('should be defined', () => {
    expect(service).toBeDefined();
  });
});
