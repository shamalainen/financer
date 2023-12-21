import { forwardRef, Module } from '@nestjs/common';

import { DatabaseModule } from '../../database/prisma.module';
import { UserDataModule } from '../user-data/user-data.module';

import { UserController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [DatabaseModule, forwardRef(() => UserDataModule)],
  controllers: [UserController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
