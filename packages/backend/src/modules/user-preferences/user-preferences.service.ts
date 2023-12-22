import { Injectable } from '@nestjs/common';
import { UserPreferenceProperty, UserPreferences } from '@prisma/client';

import { UserPreferencesRepo } from '../../database/repos/user-preferences.repo';

import { CreateUserPreferenceDto } from './dto/create-user-preference.dto';
import { UpdateUserPreferenceDto } from './dto/update-user-preference.dto';

@Injectable()
export class UserPreferencesService {
  constructor(private readonly userPreferencesRepo: UserPreferencesRepo) {}

  async create(
    userId: string,
    createUserPreferenceDto: CreateUserPreferenceDto,
  ): Promise<UserPreferences> {
    return this.userPreferencesRepo.create({
      ...createUserPreferenceDto,
      userId,
    });
  }

  async createMany(
    createUserPreferenceDto: CreateUserPreferenceDto[],
    userId: string,
  ): Promise<void> {
    await this.userPreferencesRepo.createMany(
      createUserPreferenceDto.map((preference) => ({ ...preference, userId })),
    );
  }

  async findAll(userId: string): Promise<UserPreferences[]> {
    return this.userPreferencesRepo.findMany({ where: { userId } });
  }

  async findOneByUserAndProperty(
    userPreferenceProperty: UserPreferenceProperty,
    userId: string,
  ): Promise<UserPreferences> {
    return this.userPreferencesRepo.findOne({
      userId_key: { userId, key: userPreferenceProperty },
    });
  }

  async update(
    userId: string,
    updateUserPreferenceDto: UpdateUserPreferenceDto,
  ): Promise<UserPreferences> {
    const userPreferenceInDb = await this.findOneByUserAndProperty(
      updateUserPreferenceDto.key,
      userId,
    );

    if (!userPreferenceInDb) {
      return this.create(userId, updateUserPreferenceDto);
    }

    return this.userPreferencesRepo.update({
      where: {
        userId_key: { userId, key: userPreferenceInDb.key },
      },
      data: { value: updateUserPreferenceDto.value },
    });
  }

  async removeAllByUser(userId: string): Promise<void> {
    await this.userPreferencesRepo.deleteMany({ userId });
  }
}
