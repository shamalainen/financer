import { ApiProperty } from '@silte/nestjs-swagger';

class TransactionMonthSummaryIdDto {
  @ApiProperty()
  year: number;

  @ApiProperty()
  month: number;
}

export class TransactionMonthSummaryDto {
  @ApiProperty({ type: TransactionMonthSummaryIdDto })
  readonly id: TransactionMonthSummaryIdDto;

  @ApiProperty()
  readonly count: number;

  @ApiProperty()
  readonly totalAmount: number;
}
