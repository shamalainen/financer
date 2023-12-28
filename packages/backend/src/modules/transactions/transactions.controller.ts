import {
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  ParseArrayPipe,
  ParseEnumPipe,
  Query,
} from '@nestjs/common';
import { AccountType, Prisma } from '@prisma/client';
import {
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
    enum: Prisma.SortOrder,
    enumName: 'SortOrder',
  })
  @ApiQuery({
    name: 'parentTransactionCategory',
    required: false,
    type: String,
  })
  async findAllByUser(
    @UserId() userId: string,
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
      new DefaultValuePipe(Prisma.SortOrder.desc),
      new ParseEnumPipe(Prisma.SortOrder),
    )
    sortOrder?: Prisma.SortOrder,
    @Query('parentTransactionCategory', ValidateEntityId)
    parentTransactionCategory?: string,
  ) {
    return this.transactionsService.findAllByUser(
      userId,
      null,
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
    @UserId() userId: string,
    @Query('month') month?: number,
    @Query('year') year?: number,
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
    @Query('parentTransactionCategory', ValidateEntityId)
    parentTransactionCategory?: string,
  ) {
    return this.transactionsService.findMonthlySummariesByUser(
      userId,
      null,
      year,
      month,
      accountTypes,
      transactionCategories,
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
  async findAllByAccount(
    @UserId() userId: string,
    @Param('id', ValidateEntityId) accountId: string,
    @Query('month') month: number,
    @Query('year') year: number,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
    return this.transactionsService.findAllByUser(
      userId,
      null,
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
    @UserId() userId: string,
    @Param('id', ValidateEntityId) id: string,
  ) {
    return this.transactionsService.findOne(userId, id);
  }
}
