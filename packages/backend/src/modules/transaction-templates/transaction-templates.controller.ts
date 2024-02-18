import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { TransactionTemplateType } from '@prisma/client';
import {
  ApiBody,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from '@silte/nestjs-swagger';

import { ValidateEntityId } from '../../utils/validate-entity-id.pipe';
import { LoggedIn } from '../auth/decorators/loggedIn.decorators';
import { UserId } from '../users/users.decorators';

import { CreateTransactionTemplateDto } from './dto/create-transaction-template.dto';
import { TransactionTemplateDto } from './dto/transaction-template.dto';
import { UpdateTransactionTemplateDto } from './dto/update-transaction-template.dto';
import { TransactionTemplatesService as TransactionTemplatesService } from './transaction-templates.service';

@Controller('api/transaction-templates')
@ApiTags('Transaction templates')
@LoggedIn()
export class TransactionTemplatesController {
  constructor(
    private readonly transactionTemplatesService: TransactionTemplatesService,
  ) {}

  @Post()
  @ApiBody({ type: CreateTransactionTemplateDto })
  @ApiOkResponse({ schema: { properties: { payload: { type: 'string' } } } })
  create(
    @UserId() userId: string,
    @Body() createTransactionTemplateDto: CreateTransactionTemplateDto,
  ) {
    return this.transactionTemplatesService.create(
      createTransactionTemplateDto,
      userId,
    );
  }

  @Get()
  @ApiOkResponse({
    type: [TransactionTemplateDto],
    description: 'Return all transaction templates',
  })
  findAllByUser(@UserId() userId: string) {
    return this.transactionTemplatesService.findAllByUser(userId);
  }

  @Get('/manual')
  @ApiOkResponse({
    type: [TransactionTemplateDto],
    description: 'Return all transaction templates of type manual',
  })
  findAllManualTypeByUser(@UserId() userId: string) {
    return this.transactionTemplatesService.findAllByUserAndType(
      userId,
      TransactionTemplateType.MANUAL,
    );
  }

  @Get(':id')
  @ApiOkResponse({
    type: TransactionTemplateDto,
    description: 'Return transaction template by id',
  })
  @ApiParam({
    name: 'id',
    type: String,
  })
  findOne(@UserId() userId: string, @Param('id', ValidateEntityId) id: string) {
    return this.transactionTemplatesService.findOne(id, userId);
  }

  @Patch(':id')
  @ApiBody({ type: UpdateTransactionTemplateDto })
  @ApiOkResponse({ type: TransactionTemplateDto })
  @ApiParam({
    name: 'id',
    type: String,
  })
  update(
    @UserId() userId: string,
    @Param('id', ValidateEntityId) id: string,
    @Body() updateTransactionTemplateDto: UpdateTransactionTemplateDto,
  ) {
    return this.transactionTemplatesService.update(
      id,
      updateTransactionTemplateDto,
      userId,
    );
  }

  @Delete(':id')
  @ApiParam({
    name: 'id',
    type: String,
  })
  remove(@UserId() userId: string, @Param('id', ValidateEntityId) id: string) {
    return this.transactionTemplatesService.remove(id, userId);
  }
}
