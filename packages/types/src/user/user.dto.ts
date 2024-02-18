import { IsMongoId, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';

import { Role } from './role';

export class UserDto<ObjectIdType = string> {
  @IsMongoId()
  _id: ObjectIdType;

  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  nickname: string;

  @IsOptional()
  @IsNotEmpty()
  githubId: string;

  @IsOptional()
  @IsNotEmpty()
  auth0Id: string;

  @IsOptional()
  @IsNotEmpty()
  profileImageUrl: string;

  @IsOptional()
  @IsEnum(Role, {
    each: true,
    message: `Role must be one of followings: ${Object.values(Role).join(
      ', ',
    )}.`,
  })
  roles: Role[];
}
