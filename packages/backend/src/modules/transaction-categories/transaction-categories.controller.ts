import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { TransactionType } from '@prisma/client';
import {
  ApiBody,
  ApiExtraModels,
  ApiOkResponse,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@silte/nestjs-swagger';

import { ValidateEntityId } from '../../utils/validate-entity-id.pipe';
import { LoggedIn } from '../auth/decorators/loggedIn.decorators';
import { UserId } from '../users/users.decorators';

import { CreateTransactionCategoryDto } from './dto/create-transaction-category.dto';
import { TransactionCategoryDto } from './dto/transaction-category.dto';
import { CategoryMonthlySummaryDto } from './dto/transaction-month-summary.dto';
import { UpdateTransactionCategoryDto } from './dto/update-transaction-category.dto';
import { TransactionCategoriesService } from './transaction-categories.service';

@Controller('api/transaction-categories')
@ApiTags('Transaction categories')
@ApiExtraModels(TransactionCategoryDto, CategoryMonthlySummaryDto)
@LoggedIn()
export class TransactionCategoriesController {
  constructor(
    private readonly transactionCategoriesService: TransactionCategoriesService,
  ) {}

  @Post()
  @ApiBody({ type: CreateTransactionCategoryDto })
  @ApiOkResponse({ schema: { properties: { payload: { type: 'string' } } } })
  async create(
    @UserId() userId: string,
    @Body() createTransactionCategoryDto: CreateTransactionCategoryDto,
  ) {
    return this.transactionCategoriesService.create(
      userId,
      createTransactionCategoryDto,
    );
  }

  @Get()
  @ApiOkResponse({
    type: [TransactionCategoryDto],
    description: 'Return transaction category by id',
  })
  @ApiQuery({
    name: 'visibilityType',
    required: false,
    enum: TransactionType,
    enumName: 'visibilityType',
  })
  findAllByUser(
    @UserId() userId: string,
    @Query('visibilityType') visibilityType?: TransactionType,
  ) {
    return this.transactionCategoriesService.findAllByUser(
      userId,
      visibilityType,
    );
  }

  @Get(':id')
  @ApiOkResponse({
    type: TransactionCategoryDto,
  })
  @ApiParam({
    name: 'id',
    type: String,
  })
  findOne(@UserId() userId: string, @Param('id', ValidateEntityId) id: string) {
    return this.transactionCategoriesService.findOne(userId, id);
  }

  @Get(':id/summary')
  @ApiOkResponse({
    type: [CategoryMonthlySummaryDto],
  })
  @ApiParam({
    name: 'id',
    type: String,
  })
  getCategorySummary(
    @UserId() userId: string,
    @Param('id', ValidateEntityId) id: string,
  ) {
    return this.transactionCategoriesService.findMonthlySummariesByUserAndId(
      userId,
      id,
    );
  }

  @Patch(':id')
  @ApiBody({ type: UpdateTransactionCategoryDto })
  @ApiOkResponse({ type: TransactionCategoryDto })
  @ApiParam({
    name: 'id',
    type: String,
  })
  update(
    @UserId() userId: string,
    @Param('id', ValidateEntityId) id: string,
    @Body() updateTransactionCategoryDto: UpdateTransactionCategoryDto,
  ) {
    return this.transactionCategoriesService.update(
      userId,
      id,
      updateTransactionCategoryDto,
    );
  }

  @Delete(':id')
  @ApiParam({
    name: 'id',
    type: String,
  })
  remove(@UserId() userId: string, @Param('id', ValidateEntityId) id: string) {
    return this.transactionCategoriesService.remove(userId, id);
  }
}
