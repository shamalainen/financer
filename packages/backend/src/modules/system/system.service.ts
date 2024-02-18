import { Injectable } from '@nestjs/common';
import { SystemLog } from '@prisma/client';

import { SystemLogRepo } from '../../database/repos/system-log.repo';

import { CreateSystemLogDto } from './dto/create-system-log.dto';

@Injectable()
export class SystemService {
  constructor(private readonly systemLogRepo: SystemLogRepo) {}

  async getLogs(startDate: Date, endDate: Date): Promise<SystemLog[]> {
    const start =
      startDate.toString() !== 'Invalid Date'
        ? startDate
        : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days

    const end = endDate.toString() !== 'Invalid Date' ? endDate : new Date();

    return this.systemLogRepo.findMany({
      where: {
        createdAt: { gte: start, lte: end },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createSystemLogEntry(logEntry: CreateSystemLogDto) {
    return this.systemLogRepo.create(logEntry);
  }
}
