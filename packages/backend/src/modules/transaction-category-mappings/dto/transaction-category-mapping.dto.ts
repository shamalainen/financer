import { TransactionCategoryMapping } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@silte/nestjs-swagger';
import { IsMongoId, IsOptional, IsString, Min } from 'class-validator';

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
  @IsMongoId({ message: 'categoryId must not be empty.' })
  categoryId: string;

  @ApiProperty({ type: String })
  @IsMongoId({ message: 'transactionId must not be empty.' })
  transactionId: string;

  @ApiProperty()
  @Min(0.01, { message: 'Amount must be a positive number.' })
  amount: number;
}
