import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';

import { isNodeEnvInTest } from '../../config/configuration';
import { DUMMY_TEST_USER } from '../../config/mockAuthenticationMiddleware';
import { UserDbService } from '../../database/user.db.service';
import { ObjectId } from '../../types/objectId';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly userDbService: UserDbService) {}

  async findAll(): Promise<User[]> {
    return this.userDbService.users({});
  }

  async findOne(id: string): Promise<User> {
    return !isNodeEnvInTest()
      ? this.userDbService.user({ id })
      : (DUMMY_TEST_USER as User);
  }

  async findOneByGithubId(githubId: string): Promise<User> {
    return this.userDbService.user({ githubId });
  }

  async findOneByAuth0Id(auth0Id: string): Promise<User> {
    return this.userDbService.user({ auth0Id });
  }

  async create(createUserDto: CreateUserDto) {
    return this.userDbService.createUser(createUserDto);
  }

  update(id: string, updateUserDto: UpdateUserDto) {
    return this.userDbService.updateUser({
      where: { id },
      data: updateUserDto,
    });
  }

  remove(id: ObjectId) {
    return `This action removes a #${id} user`;
  }
}
