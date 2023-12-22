import { ApiProperty } from '@silte/nestjs-swagger';
import { Transform } from 'class-transformer';
import { Allow } from 'class-validator';

import { IsInstanceOfObjectId } from '../../../utils/is-instance-of-object-id.decorator';
import { IsNotEqual } from '../../../utils/is-not-equal.decorator';
import { objectIdTransformer } from '../../../utils/object-id-transformer';
import { TransactionDto } from '../../transactions/dto/transaction.dto';
export class TransferDto extends TransactionDto {
  @ApiProperty({ type: String })
  @Allow()
  @IsNotEqual('toAccount', {
    message: "Target and source accounts can't be the same account.",
  })
  @IsInstanceOfObjectId({ message: 'fromAccount must not be empty.' })
  @Transform(objectIdTransformer)
  fromAccount: string;
}
