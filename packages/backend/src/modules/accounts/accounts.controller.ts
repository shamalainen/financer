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
import { AccountType } from '@prisma/client';
import {
  ApiBody,
  ApiExtraModels,
  ApiOkResponse,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@silte/nestjs-swagger';

import { ApiPaginatedDto } from '../../utils/pagination.decorator';
import { ValidateEntityId } from '../../utils/validate-entity-id.pipe';
import { LoggedIn } from '../auth/decorators/loggedIn.decorators';
import { UserId } from '../users/users.decorators';

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
    @UserId() userId: string,
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
    @UserId() userId: string,
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
    @UserId() userId: string,
    @Param('id', ValidateEntityId) id: string,
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
    @UserId() userId: string,
    @Param('id', ValidateEntityId) id: string,
    @Body() updateAccountDto: UpdateAccountDto,
  ) {
    return this.accountsService.update(userId, id, updateAccountDto);
  }

  @Delete(':id')
  @ApiParam({
    name: 'id',
    type: String,
  })
  remove(@UserId() userId: string, @Param('id') id: string) {
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
    @UserId() userId: string,
    @Param('id', ValidateEntityId) id: string,
  ) {
    return this.accountsService.getAccountBalanceHistory(userId, id);
  }
}
