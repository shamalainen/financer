import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

import { isValidObjectId } from '../types/objectId';

@Injectable()
export class ValidateEntityId implements PipeTransform<string> {
  async transform(value: string) {
    if (!value) return null;
    const isValid = isValidObjectId(value);
    if (!isValid) {
      throw new BadRequestException('Invalid entity ID provided!');
    }

    return value;
  }
}
