import { TransactionCategory, TransactionType } from '@prisma/client';
import { ApiProperty } from '@silte/nestjs-swagger';
import {
  IsBoolean,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';

export class TransactionCategoryDto implements TransactionCategory {
  v: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ type: String })
  @IsMongoId()
  id: string;

  @ApiProperty({ type: String })
  @IsMongoId()
  userId: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'Name must not be empty.' })
  name: string;

  @ApiProperty({
    enum: TransactionType,
    enumName: 'TransactionType',
    type: TransactionType,
    isArray: true,
  })
  @IsOptional()
  @IsEnum(TransactionType, {
    each: true,
    message:
      'Visibility must be one of the following: income, expense, transfer.',
  })
  visibility: TransactionType[];

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  deleted: boolean;

  @ApiProperty({ type: String, nullable: true })
  @IsOptional()
  @IsMongoId({ message: 'parentCategoryId must not be empty.' })
  parentCategoryId: string | null;
}
