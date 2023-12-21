import {
  Body,
  Controller,
  Get,
  Post,
  Param,
  Patch,
  Delete,
  Query,
  ParseArrayPipe,
} from '@nestjs/common';
import { AccountType } from '@prisma/client';
import {
  ApiBody,
  ApiOkResponse,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@silte/nestjs-swagger';

import { ObjectId, parseObjectId } from '../../types/objectId';
import { ApiPaginatedDto } from '../../utils/pagination.decorator';
import { ValidateEntityIdOld } from '../../utils/validate-entity-id.pipe';
import { LoggedIn } from '../auth/decorators/loggedIn.decorators';
import { TransactionMonthSummaryDto } from '../transactions/dto/transaction-month-summary.dto';
import { UserIdOld } from '../users/users.decorators';

import { CreateExpenseDto } from './dto/create-expense.dto';
import { ExpenseDto } from './dto/expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { ExpensesService } from './expenses.service';

@Controller('api/expenses')
@ApiTags('Expenses')
@LoggedIn()
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Get()
  @ApiPaginatedDto(ExpenseDto)
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
  async findAllByUser(
    @UserIdOld() userId: ObjectId,
    @Query('month') month: number,
    @Query('year') year: number,
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query(
      'accountTypes',
      new ParseArrayPipe({ separator: '|', optional: true }),
    )
    accountTypes?: AccountType[],
  ) {
    return this.expensesService.findAllByUser(
      userId,
      page,
      limit,
      year,
      month,
      accountTypes,
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
  async findMonthlySummariesByuser(
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
    return this.expensesService.findMonthlySummariesByUser(
      userId,
      limit,
      year,
      month,
      accountTypes,
      transactionCategories?.map((id) => parseObjectId(id)),
      parentTransactionCategory,
    );
  }

  @Get(':id')
  @ApiOkResponse({
    type: ExpenseDto,
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
    return this.expensesService.findOne(userId, id);
  }

  @Post()
  @ApiBody({ type: CreateExpenseDto })
  @ApiOkResponse({ type: ExpenseDto })
  async create(
    @UserIdOld() userId: ObjectId,
    @Body() createExpense: CreateExpenseDto,
  ) {
    return this.expensesService.create(userId, createExpense);
  }

  @Patch(':id')
  @ApiBody({ type: UpdateExpenseDto })
  @ApiOkResponse({ type: ExpenseDto })
  @ApiParam({
    name: 'id',
    type: String,
  })
  update(
    @UserIdOld() userId: ObjectId,
    @Param('id', ValidateEntityIdOld) id: ObjectId,
    @Body() updateTransactionDto: UpdateExpenseDto,
  ) {
    return this.expensesService.update(userId, id, updateTransactionDto);
  }

  @Delete(':id')
  @ApiParam({
    name: 'id',
    type: String,
  })
  remove(
    @UserIdOld() userId: ObjectId,
    @Param('id', ValidateEntityIdOld) id: ObjectId,
  ) {
    return this.expensesService.remove(userId, id);
  }
}
