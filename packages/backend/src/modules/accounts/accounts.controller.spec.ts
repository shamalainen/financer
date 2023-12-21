import { forwardRef, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import supertest from 'supertest';

import { rootMongooseTestModule } from '../../../test/rootMongooseTest.module';
import { setupTestNestApp } from '../../setup-test-nest-app';
import { AccountBalanceChangesModule } from '../account-balance-changes/account-balance-changes.module';
import { TransactionsModule } from '../transactions/transactions.module';

import { AccountsController } from './accounts.controller';
import { AccountsService } from './accounts.service';

describe('AccountsController', () => {
  let app: INestApplication;
  let controller: AccountsController;
  let service: AccountsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        rootMongooseTestModule(),
        AccountBalanceChangesModule,
        forwardRef(() => TransactionsModule),
      ],
      controllers: [AccountsController],
      providers: [AccountsService],
    }).compile();

    service = module.get<AccountsService>(AccountsService);
    controller = module.get<AccountsController>(AccountsController);
    app = module.createNestApplication();
    setupTestNestApp(app);
    await app.init();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('Check create account validations', async () => {
    const createMock = jest
      .spyOn(service, 'create')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .mockImplementation(() => Promise.resolve({} as any));

    await supertest(app.getHttpServer())
      .post('/api/accounts')
      .send({
        name: '',
        type: 'cash',
        balance: 0,
      })
      .expect(400)
      .expect({
        statusCode: 400,
        message: ['Name must not be empty.'],
        error: 'Bad Request',
      });
    expect(createMock).not.toHaveBeenCalled();

    await supertest(app.getHttpServer())
      .post('/api/accounts')
      .send({
        name: 'test',
        type: 'cash',
      })
      .expect(400)
      .expect({
        statusCode: 400,
        message: ['Balance must be a number.'],
        error: 'Bad Request',
      });
    expect(createMock).not.toHaveBeenCalled();

    await supertest(app.getHttpServer())
      .post('/api/accounts')
      .send({
        name: 'test',
        type: 'cash',
        balance: '',
      })
      .expect(400)
      .expect({
        statusCode: 400,
        message: ['Balance must be a number.'],
        error: 'Bad Request',
      });
    expect(createMock).not.toHaveBeenCalled();

    await supertest(app.getHttpServer())
      .post('/api/accounts')
      .send({
        name: 'test',
        type: 'cash',
        balance: 10,
      })
      .expect(201);
    // expect(createMock).toHaveBeenCalled();

    await supertest(app.getHttpServer())
      .post('/api/accounts')
      .send({
        name: 'test',
        type: 'cash',
        balance: -10,
      })
      .expect(201);
    // expect(createMock).toHaveBeenCalled();

    await supertest(app.getHttpServer())
      .post('/api/accounts')
      .send({
        name: 'test',
        type: 'cash',
        balance: 0,
      })
      .expect(201);
    // expect(createMock).toHaveBeenCalled();

    await supertest(app.getHttpServer())
      .post('/api/accounts')
      .send({
        name: 'test',
        balance: 0,
      })
      .expect(400)
      .expect({
        statusCode: 400,
        message: [
          'Type must be one of the following: cash, savings, investment, credit, loan.',
        ],
        error: 'Bad Request',
      });
    expect(createMock).not.toHaveBeenCalled();

    await supertest(app.getHttpServer())
      .post('/api/accounts')
      .send({
        name: 'test',
        type: 'fake-account-type',
        balance: 0,
      })
      .expect(400)
      .expect({
        statusCode: 400,
        message: [
          'Type must be one of the following: cash, savings, investment, credit, loan.',
        ],
        error: 'Bad Request',
      });
    expect(createMock).not.toHaveBeenCalled();

    await supertest(app.getHttpServer())
      .post('/api/accounts')
      .send({})
      .expect(400)
      .expect({
        statusCode: 400,
        message: [
          'name must be a string',
          'Name must not be empty.',
          'Type must be one of the following: cash, savings, investment, credit, loan.',
          'Balance must be a number.',
        ],
        error: 'Bad Request',
      });
    expect(createMock).not.toHaveBeenCalled();
  });
});
