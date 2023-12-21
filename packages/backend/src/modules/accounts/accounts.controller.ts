import { AccountType } from '@local/types';
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseArrayPipe,
} from '@nestjs/common';
import {
  ApiBody,
  ApiExtraModels,
  ApiOkResponse,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@silte/nestjs-swagger';

import { ObjectId } from '../../types/objectId';
import { ApiPaginatedDto } from '../../utils/pagination.decorator';
import { ValidateEntityIdOld } from '../../utils/validate-entity-id.pipe';
import { LoggedIn } from '../auth/decorators/loggedIn.decorators';
import { UserIdOld } from '../users/users.decorators';

import { AccountsService } from './accounts.service';
import { AccountBalanceHistoryDto } from './dto/account-balance-history.dto';
import { AccountDto } from './dto/account.dto';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';

@Controller('api/accounts')
@ApiTags('Accounts')
@ApiExtraModels(AccountDto)
@LoggedIn()
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Post()
  @ApiBody({ type: CreateAccountDto })
  @ApiOkResponse({ schema: { properties: { payload: { type: 'string' } } } })
  async create(
    @UserIdOld() userId: ObjectId,
    @Body() createAccountDto: CreateAccountDto,
  ) {
    return this.accountsService.create(userId, createAccountDto);
  }

  @Get()
  @ApiPaginatedDto(AccountDto)
  @ApiQuery({
    name: 'limit',
    required: false,
  })
  @ApiQuery({
    name: 'page',
    required: false,
  })
  @ApiQuery({
    name: 'accountTypes',
    required: false,
  })
  async findAllByUser(
    @UserIdOld() userId: string,
    @Query('limit') limit?: number,
    @Query('page') page?: number,
    @Query(
      'accountTypes',
      new ParseArrayPipe({ separator: '|', optional: true }),
    )
    accountTypes?: AccountType[],
  ) {
    return this.accountsService.findAllByUser(
      userId,
      accountTypes,
      limit || undefined,
      page || undefined,
    );
  }

  @Get(':id')
  @ApiOkResponse({
    type: AccountDto,
    description: 'Return account by id',
  })
  @ApiParam({
    name: 'id',
    type: String,
  })
  async findOneById(
    @UserIdOld() userId: ObjectId,
    @Param('id', ValidateEntityIdOld) id: ObjectId,
  ) {
    return this.accountsService.findOne(userId, id);
  }

  @Patch(':id')
  @ApiBody({ type: UpdateAccountDto })
  @ApiOkResponse({ type: AccountDto })
  @ApiParam({
    name: 'id',
    type: String,
  })
  async update(
    @UserIdOld() userId: ObjectId,
    @Param('id', ValidateEntityIdOld) id: ObjectId,
    @Body() updateAccountDto: UpdateAccountDto,
  ) {
    return this.accountsService.update(userId, id, updateAccountDto);
  }

  @Delete(':id')
  @ApiParam({
    name: 'id',
    type: String,
  })
  remove(@UserIdOld() userId: ObjectId, @Param('id') id: ObjectId) {
    return this.accountsService.remove(id, userId);
  }

  @Get(':id/balance-history')
  @ApiOkResponse({
    type: AccountBalanceHistoryDto,
    isArray: true,
    description: 'Return account balance history by id',
  })
  @ApiParam({
    name: 'id',
    type: String,
  })
  async getAccountBalanceHistory(
    @UserIdOld() userId: ObjectId,
    @Param('id', ValidateEntityIdOld) id: ObjectId,
  ) {
    return this.accountsService.getAccountBalanceHistory(userId, id);
  }
}
