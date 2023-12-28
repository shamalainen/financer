import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseArrayPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { AccountType } from '@prisma/client';
import {
  ApiBody,
  ApiOkResponse,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@silte/nestjs-swagger';

import { ApiPaginatedDto } from '../../utils/pagination.decorator';
import { ValidateEntityId } from '../../utils/validate-entity-id.pipe';
import { LoggedIn } from '../auth/decorators/loggedIn.decorators';
import { TransactionMonthSummaryDto } from '../transactions/dto/transaction-month-summary.dto';
import { UserId } from '../users/users.decorators';

import { CreateIncomeDto } from './dto/create-income.dto';
import { IncomeDto } from './dto/income.dto';
import { UpdateIncomeDto } from './dto/update-income.dto';
import { IncomesService } from './incomes.service';

@Controller('api/incomes')
@ApiTags('Incomes')
@LoggedIn()
export class IncomesController {
  constructor(private readonly incomesService: IncomesService) {}

  @Get()
  @ApiPaginatedDto(IncomeDto)
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
    @UserId() userId: string,
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
    return this.incomesService.findAllByUser(
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
    return this.incomesService.findMonthlySummariesByUser(
      userId,
      year,
      month,
      accountTypes,
      transactionCategories,
      parentTransactionCategory,
    );
  }

  @Get(':id')
  @ApiOkResponse({
    type: IncomeDto,
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
    return this.incomesService.findOne(userId, id);
  }

  @Post()
  @ApiBody({ type: CreateIncomeDto })
  @ApiOkResponse({ type: IncomeDto })
  async create(
    @UserId() userId: string,
    @Body() createIncome: CreateIncomeDto,
  ) {
    return this.incomesService.create(userId, createIncome);
  }

  @Patch(':id')
  @ApiBody({ type: UpdateIncomeDto })
  @ApiOkResponse({ type: IncomeDto })
  @ApiParam({
    name: 'id',
    type: String,
  })
  update(
    @UserId() userId: string,
    @Param('id', ValidateEntityId) id: string,
    @Body() updateTransactionDto: UpdateIncomeDto,
  ) {
    return this.incomesService.update(userId, id, updateTransactionDto);
  }

  @Delete(':id')
  @ApiParam({
    name: 'id',
    type: String,
  })
  remove(@UserId() userId: string, @Param('id', ValidateEntityId) id: string) {
    return this.incomesService.remove(userId, id);
  }
}
