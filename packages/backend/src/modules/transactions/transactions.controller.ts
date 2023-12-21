import { AccountType, SortOrder, TransactionType } from '@local/types';
import {
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  ParseArrayPipe,
  ParseEnumPipe,
  Query,
} from '@nestjs/common';
import {
  ApiExtraModels,
  ApiOkResponse,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@silte/nestjs-swagger';

import { ObjectId, parseObjectId } from '../../types/objectId';
import { ApiPaginatedDto } from '../../utils/pagination.decorator';
import { ValidateEntityIdOld } from '../../utils/validate-entity-id.pipe';
import { LoggedIn } from '../auth/decorators/loggedIn.decorators';
import { UserIdOld } from '../users/users.decorators';

import { TransactionMonthSummaryDto } from './dto/transaction-month-summary.dto';
import { TransactionDto } from './dto/transaction.dto';
import { TransactionsService } from './transactions.service';

@Controller('api/transactions')
@ApiTags('Transactions')
@ApiExtraModels(TransactionDto, TransactionMonthSummaryDto)
@LoggedIn()
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get()
  @ApiPaginatedDto(TransactionDto)
  @ApiQuery({
    name: 'month',
    required: false,
  })
  @ApiQuery({
    name: 'year',
    required: false,
  })
  @ApiQuery({
    name: 'page',
    required: false,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
  })
  @ApiQuery({
    name: 'accountTypes',
    required: false,
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    enum: SortOrder,
    enumName: 'SortOrder',
  })
  @ApiQuery({
    name: 'parentTransactionCategory',
    required: false,
    type: String,
  })
  async findAllByUser(
    @UserIdOld() userId: ObjectId,
    @Query('month') month?: number,
    @Query('year') year?: number,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query(
      'accountTypes',
      new ParseArrayPipe({ separator: '|', optional: true }),
    )
    accountTypes?: AccountType[],
    @Query(
      'sortOrder',
      new DefaultValuePipe(SortOrder.DESC),
      new ParseEnumPipe(SortOrder),
    )
    sortOrder?: SortOrder,
    @Query('parentTransactionCategory', ValidateEntityIdOld)
    parentTransactionCategory?: ObjectId,
  ) {
    return this.transactionsService.findAllByUser(
      userId,
      TransactionType.ANY,
      page || undefined,
      limit || undefined,
      year || undefined,
      month || undefined,
      undefined,
      accountTypes || undefined,
      sortOrder || undefined,
      undefined,
      parentTransactionCategory,
    );
  }

  @Get('monthly-summaries')
  @ApiOkResponse({
    type: TransactionMonthSummaryDto,
    isArray: true,
  })
  @ApiQuery({
    name: 'month',
    required: false,
  })
  @ApiQuery({
    name: 'year',
    required: false,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
  })
  @ApiQuery({
    name: 'accountTypes',
    required: false,
  })
  @ApiQuery({
    name: 'transactionCategories',
    required: false,
  })
  @ApiQuery({
    name: 'parentTransactionCategory',
    required: false,
    type: String,
  })
  async findMonthlySummariesByUser(
    @UserIdOld() userId: ObjectId,
    @Query('month') month?: number,
    @Query('year') year?: number,
    @Query('limit') limit?: number,
    @Query(
      'accountTypes',
      new ParseArrayPipe({ separator: '|', optional: true }),
    )
    accountTypes?: AccountType[],
    @Query(
      'transactionCategories',
      new ParseArrayPipe({
        separator: '|',
        optional: true,
      }),
    )
    transactionCategories?: string[],
    @Query('parentTransactionCategory', ValidateEntityIdOld)
    parentTransactionCategory?: ObjectId,
  ) {
    return this.transactionsService.findMonthlySummariesByUser(
      userId,
      TransactionType.ANY,
      limit,
      year,
      month,
      accountTypes,
      transactionCategories?.map((id) => parseObjectId(id)),
      parentTransactionCategory,
    );
  }

  @Get('/account/:id')
  @ApiPaginatedDto(TransactionDto)
  @ApiParam({
    name: 'id',
    type: String,
  })
  @ApiQuery({
    name: 'month',
    required: false,
  })
  @ApiQuery({
    name: 'year',
    required: false,
  })
  @ApiQuery({
    name: 'page',
    required: false,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
  })
  async findAllByAccount(
    @UserIdOld() userId: ObjectId,
    @Param('id', ValidateEntityIdOld) accountId: ObjectId,
    @Query('month') month: number,
    @Query('year') year: number,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
    return this.transactionsService.findAllByUser(
      userId,
      TransactionType.ANY,
      page || undefined,
      limit || undefined,
      year || undefined,
      month || undefined,
      accountId,
    );
  }

  @Get(':id')
  @ApiOkResponse({
    type: TransactionDto,
    description: 'Return transaction by id',
  })
  @ApiParam({
    name: 'id',
    type: String,
  })
  async findOne(
    @UserIdOld() userId: ObjectId,
    @Param('id', ValidateEntityIdOld) id: ObjectId,
  ) {
    return this.transactionsService.findOne(userId, id);
  }
}
