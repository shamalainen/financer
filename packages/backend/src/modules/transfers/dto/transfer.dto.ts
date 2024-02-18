import { ApiProperty } from '@silte/nestjs-swagger';
import { Allow, IsMongoId } from 'class-validator';

import { IsNotEqual } from '../../../utils/is-not-equal.decorator';
import { TransactionDto } from '../../transactions/dto/transaction.dto';
export class TransferDto extends TransactionDto {
  @ApiProperty({ type: String })
  @Allow()
  @IsNotEqual('toAccount', {
    message: "Target and source accounts can't be the same account.",
  })
  @IsMongoId({ message: 'fromAccount must not be empty.' })
  fromAccount: string;
}
