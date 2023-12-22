import { Controller, Get, Body, Patch, Param } from '@nestjs/common';
import { UserPreferenceProperty } from '@prisma/client';
import {
  ApiBody,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from '@silte/nestjs-swagger';

import { LoggedIn } from '../auth/decorators/loggedIn.decorators';
import { UserIdOld as UserId } from '../users/users.decorators';

import { UpdateUserPreferenceDto } from './dto/update-user-preference.dto';
import { UserPreferenceDto } from './dto/user-preference.dto';
import { UserPreferencesService } from './user-preferences.service';

@Controller('api/user-preferences')
@LoggedIn()
@ApiTags('User preferences')
export class UserPreferencesController {
  constructor(
    private readonly userPreferencesService: UserPreferencesService,
  ) {}

  @Get()
  @ApiOkResponse({ type: [UserPreferenceDto] })
  async findAll(@UserId() userId: string) {
    return this.userPreferencesService.findAll(userId);
  }

  @Get(':userPreferenceProperty')
  @ApiOkResponse({ type: UserPreferenceDto })
  @ApiParam({
    name: 'userPreferenceProperty',
    enum: UserPreferenceProperty,
    enumName: 'UserPreferenceProperty',
  })
  async findOne(
    @Param('userPreferenceProperty')
    userPreferenceProperty: UserPreferenceProperty,
    @UserId() userId: string,
  ) {
    return (
      (await this.userPreferencesService.findOneByUserAndProperty(
        userPreferenceProperty,
        userId,
      )) || {
        key: userPreferenceProperty,
        value: '',
        userId,
      }
    );
  }

  @Patch()
  @ApiOkResponse({ type: UserPreferenceDto })
  @ApiBody({ type: UpdateUserPreferenceDto })
  async update(
    @UserId() userId: string,
    @Body() updateUserPreferenceDto: UpdateUserPreferenceDto,
  ) {
    return this.userPreferencesService.update(userId, updateUserPreferenceDto);
  }
}
