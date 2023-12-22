import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import supertest from 'supertest';

import { rootMongooseTestModule } from '../../../test/rootMongooseTest.module';
import { setupTestNestApp } from '../../setup-test-nest-app';
import { TransactionCategoryMappingsModule } from '../transaction-category-mappings/transaction-category-mappings.module';

import { TransactionCategoriesController } from './transaction-categories.controller';
import { TransactionCategoriesService } from './transaction-categories.service';

describe('TransactionCategoriesController', () => {
  let app: INestApplication;
  let controller: TransactionCategoriesController;
  let service: TransactionCategoriesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [rootMongooseTestModule(), TransactionCategoryMappingsModule],
      controllers: [TransactionCategoriesController],
      providers: [TransactionCategoriesService],
    }).compile();

    service = module.get<TransactionCategoriesService>(
      TransactionCategoriesService,
    );
    controller = module.get<TransactionCategoriesController>(
      TransactionCategoriesController,
    );
    app = module.createNestApplication();
    setupTestNestApp(app);
    await app.init();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('Check create income validations', async () => {
    const createMock = jest
      .spyOn(service, 'create')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .mockImplementation(() => Promise.resolve({} as any));

    await supertest(app.getHttpServer())
      .post('/api/transaction-categories')
      .send({
        name: '',
        visibility: 'income',
        parent_category_id: '',
      })
      .expect(400)
      .expect({
        statusCode: 400,
        message: ['Name must not be empty.'],
        error: 'Bad Request',
      });
    expect(createMock).not.toHaveBeenCalled();

    await supertest(app.getHttpServer())
      .post('/api/transaction-categories')
      .send({
        name: 'test',
        visibility: 'not-a-valid-visibility',
        parent_category_id: '',
      })
      .expect(400)
      .expect({
        statusCode: 400,
        message: [
          'Visibility must be one of the following: income, expense, transfer.',
        ],
        error: 'Bad Request',
      });
    expect(createMock).not.toHaveBeenCalled();

    await supertest(app.getHttpServer())
      .post('/api/transaction-categories')
      .send({
        name: 'test',
        visibility: ['income', 'expense', 'transfer'],
        parent_category_id: '',
      })
      .expect(201);
    expect(createMock).toHaveBeenCalledTimes(1);
    createMock.mockReset();

    await supertest(app.getHttpServer())
      .post('/api/transaction-categories')
      .send({})
      .expect(400)
      .expect({
        statusCode: 400,
        message: ['Name must not be empty.'],
        error: 'Bad Request',
      });
    expect(createMock).not.toHaveBeenCalled();
  });
});
