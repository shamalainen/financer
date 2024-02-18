import { Role, User } from '@prisma/client';
import { ApiProperty } from '@silte/nestjs-swagger';
import { IsMongoId, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';

export class UserDto implements User {
  @IsMongoId()
  @ApiProperty({ type: 'string' })
  id: string;

  v: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @IsNotEmpty()
  @ApiProperty()
  name: string;

  @IsNotEmpty()
  @ApiProperty()
  nickname: string;

  @IsOptional()
  @IsNotEmpty()
  @ApiProperty()
  githubId: string;

  @IsOptional()
  @IsNotEmpty()
  @ApiProperty()
  auth0Id: string;

  @IsOptional()
  @IsNotEmpty()
  @ApiProperty()
  profileImageUrl: string;

  @IsOptional()
  @IsEnum(Role, {
    each: true,
    message: `Role must be one of followings: ${Object.values(Role).join(
      ', ',
    )}.`,
  })
  @ApiProperty({ enum: Role, enumName: 'Role', type: [Role] })
  roles: Role[];
}
