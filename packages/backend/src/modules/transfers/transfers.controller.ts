import { AccountType } from '@local/types';
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
import {
  ApiBody,
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
import { TransactionMonthSummaryDto } from '../transactions/dto/transaction-month-summary.dto';
import { UserIdOld } from '../users/users.decorators';

import { CreateTransferDto } from './dto/create-transfer.dto';
import { TransferDto } from './dto/transfer.dto';
import { UpdateTransferDto } from './dto/update-transfer.dto';
import { TransfersService } from './transfers.service';

@Controller('api/transfers')
@ApiTags('Transfers')
@ApiExtraModels(TransferDto, TransactionMonthSummaryDto)
@LoggedIn()
export class TransfersController {
  constructor(private readonly transfersService: TransfersService) {}

  @Get()
  @ApiPaginatedDto(TransferDto)
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
    return this.transfersService.findAllByUser(
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
    return this.transfersService.findMonthlySummariesByUser(
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
    type: TransferDto,
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
    return this.transfersService.findOne(userId, id);
  }

  @Post()
  @ApiBody({ type: CreateTransferDto })
  @ApiOkResponse({ type: TransferDto })
  async create(
    @UserIdOld() userId: ObjectId,
    @Body() createTransfer: CreateTransferDto,
  ) {
    return this.transfersService.create(userId, createTransfer);
  }

  @Patch(':id')
  @ApiBody({ type: UpdateTransferDto })
  @ApiOkResponse({ type: TransferDto })
  @ApiParam({
    name: 'id',
    type: String,
  })
  update(
    @UserIdOld() userId: ObjectId,
    @Param('id', ValidateEntityIdOld) id: ObjectId,
    @Body() updateTransactionDto: UpdateTransferDto,
  ) {
    return this.transfersService.update(userId, id, updateTransactionDto);
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
    return this.transfersService.remove(userId, id);
  }
}
