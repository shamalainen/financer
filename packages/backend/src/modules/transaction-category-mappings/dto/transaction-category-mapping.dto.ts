import { TransactionCategoryMapping } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@silte/nestjs-swagger';
import { Transform } from 'class-transformer';
import { IsMongoId, IsOptional, IsString, Min } from 'class-validator';

import { IsInstanceOfObjectId } from '../../../utils/is-instance-of-object-id.decorator';
import { objectIdTransformer } from '../../../utils/object-id-transformer';

export class TransactionCategoryMappingDto
  implements TransactionCategoryMapping
{
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

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description: string = null;

  @ApiProperty({ type: String })
  @IsInstanceOfObjectId({ message: 'categoryId must not be empty.' })
  @Transform(objectIdTransformer)
  categoryId: string;

  @ApiProperty({ type: String })
  @IsInstanceOfObjectId({ message: 'transactionId must not be empty.' })
  @Transform(objectIdTransformer)
  transactionId: string;

  @ApiProperty()
  @Min(0.01, { message: 'Amount must be a positive number.' })
  amount: number;
}
