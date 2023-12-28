import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';

import { isNodeEnvInTest } from '../../config/configuration';
import { DUMMY_TEST_USER } from '../../config/mockAuthenticationMiddleware';
import { UserRepo } from '../../database/repos/user.repo';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly userRepo: UserRepo) {}

  async findAll(): Promise<User[]> {
    return this.userRepo.findMany({});
  }

  async findOne(id: string): Promise<User> {
    return !isNodeEnvInTest()
      ? this.userRepo.findOne({ id })
      : (DUMMY_TEST_USER as User);
  }

  async findOneByGithubId(githubId: string): Promise<User> {
    return this.userRepo.findOne({ githubId });
  }

  async findOneByAuth0Id(auth0Id: string): Promise<User> {
    return this.userRepo.findOne({ auth0Id });
  }

  async create(createUserDto: CreateUserDto) {
    return this.userRepo.create(createUserDto);
  }

  update(id: string, updateUserDto: UpdateUserDto) {
    return this.userRepo.update({
      where: { id },
      data: updateUserDto,
    });
  }

  remove(id: string) {
    return `This action removes a #${id} user`;
  }
}
