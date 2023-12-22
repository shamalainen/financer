import { Test, TestingModule } from '@nestjs/testing';

import { rootMongooseTestModule } from '../../../test/rootMongooseTest.module';

import { UserPreferencesService } from './user-preferences.service';

describe('UserPreferencesService', () => {
  let service: UserPreferencesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [rootMongooseTestModule()],
      providers: [UserPreferencesService],
    }).compile();

    service = module.get<UserPreferencesService>(UserPreferencesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
