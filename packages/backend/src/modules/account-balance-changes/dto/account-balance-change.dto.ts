import { AccountBalanceChange } from '@prisma/client';
import { ApiProperty } from '@silte/nestjs-swagger';
import { IsDateString, IsMongoId, IsNumber } from 'class-validator';

export class AccountBalanceChangeDto implements AccountBalanceChange {
  v: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty()
  @IsMongoId()
  readonly id: string;

  @ApiProperty()
  @IsDateString()
  readonly date: Date;

  @ApiProperty()
  @IsNumber()
  readonly amount: number;

  @ApiProperty()
  @IsMongoId()
  readonly userId: string;

  @ApiProperty()
  @IsMongoId()
  readonly accountId: string;
}
