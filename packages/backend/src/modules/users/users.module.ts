import { forwardRef, Module } from '@nestjs/common';

import { DatabaseModule } from '../../database/prisma.module';
import { UserDataModule } from '../user-data/user-data.module';

import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [DatabaseModule, forwardRef(() => UserDataModule)],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
