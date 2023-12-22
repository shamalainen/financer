import {
  TransactionTemplate,
  TransactionTemplateType,
  TransactionType,
} from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@silte/nestjs-swagger';
import { Transform } from 'class-transformer';
import {
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

import { IsInstanceOfObjectId } from '../../../utils/is-instance-of-object-id.decorator';
import {
  objectIdArrayTransformer,
  objectIdTransformer,
} from '../../../utils/object-id-transformer';

export class TransactionTemplateDto implements TransactionTemplate {
  v: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ type: String })
  @IsMongoId()
  readonly id: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'Template name must not be empty.' })
  @IsString()
  readonly templateName: string;

  @ApiProperty({
    enum: TransactionTemplateType,
    enumName: 'TransactionTemplateType',
    type: TransactionTemplateType,
  })
  @IsEnum(TransactionTemplateType, {
    each: true,
    message: 'Type must defined.',
  })
  readonly templateType: TransactionTemplateType[];

  @ApiProperty({
    enum: TransactionType,
    enumName: 'TransactionType',
    type: TransactionType,
  })
  @IsEnum(TransactionType, {
    message: 'Visibility must defined.',
  })
  readonly templateVisibility: TransactionType;

  @ApiPropertyOptional()
  @Min(0.01, { message: 'Amount must be a positive number.' })
  @IsOptional()
  readonly amount: number = null;

  @ApiPropertyOptional()
  @IsString()
  readonly description: string = null;

  @ApiPropertyOptional()
  @IsOptional()
  @Min(1, { message: 'Day of month must be a positive number.' })
  @Max(31, { message: 'Day of month must not be greater than 31.' })
  readonly dayOfMonth: number = null;

  @ApiPropertyOptional()
  @IsOptional()
  @Min(1, {
    message: 'Day of month to create transaction must be a positive number.',
  })
  @Max(31, {
    message: 'Day of month to create transaction must not be greater than 31.',
  })
  readonly dayOfMonthToCreate: number = null;

  @ApiProperty({ type: String })
  @IsMongoId()
  readonly userId: string;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsInstanceOfObjectId({
    message: 'fromAccount must be formatted as objectId.',
  })
  @Transform(objectIdTransformer)
  readonly fromAccount: string = null;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsInstanceOfObjectId({ message: 'toAccount must be formatted as objectId.' })
  @Transform(objectIdTransformer)
  readonly toAccount: string = null;

  @ApiPropertyOptional({ type: String, isArray: true })
  @IsOptional()
  @Transform(objectIdArrayTransformer)
  @ValidateNested({ each: true })
  categories: string[] = null;
}
