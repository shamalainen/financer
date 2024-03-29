import { TransactionTemplateType } from '@local/types';
import { Injectable } from '@nestjs/common';

import { getLastDayOfMonth } from '../../utils/date-utils';
import { SystemLogLevel } from '../system/dto/system-log-level';
import { SystemService } from '../system/system.service';
import { TransactionTemplatesService } from '../transaction-templates/transaction-templates.service';
import { TransactionsService } from '../transactions/transactions.service';

@Injectable()
export class TasksService {
  constructor(
    private readonly templateService: TransactionTemplatesService,
    private readonly transactionsService: TransactionsService,
    private readonly systemService: SystemService,
  ) {}

  async generateTransactions() {
    const now = new Date();
    const dayOfMonth = now.getDate();

    const templates =
      await this.templateService.findAutomatedTemplatesWithCreationDateBefore(
        dayOfMonth,
        dayOfMonth < getLastDayOfMonth() ? '$eq' : '$gte',
      );

    const templateLogEntries =
      await this.templateService.findTemplateLogEntriesByTemplateIdsAndType(
        templates.map((template) => template._id),
        TransactionTemplateType.AUTO,
      );

    const result = await Promise.all(
      templates.map(async (template) => {
        if (!template.amount || !template.description) return 'missingData';

        const hasAddedTransactionThisMonth = templateLogEntries.some(
          (entry) => {
            if (!entry.templateId.equals(template._id)) return false;

            const entryDate = new Date(entry.executed);
            return (
              entryDate.getMonth() === now.getMonth() &&
              entryDate.getFullYear() === now.getFullYear()
            );
          },
        );

        if (hasAddedTransactionThisMonth) return 'skipped';

        const transactionData =
          this.templateService.getTransactionFromTemplate(template);
        const userId = template.userId;

        const transaction = await this.transactionsService.create(
          userId,
          transactionData,
        );

        await this.templateService.createTemplateLogEntry({
          templateId: template._id,
          transactionId: transaction._id,
          executed: now,
          userId,
          eventType: TransactionTemplateType.AUTO,
        });

        return 'added';
      }),
    );

    const output = result.reduce(
      (acc, curr) => {
        if (curr === 'skipped') {
          acc.skipped += 1;
        } else if (curr === 'missingData') {
          acc.missingData += 1;
        } else {
          acc.added += 1;
        }

        return acc;
      },
      { skipped: 0, added: 0, missingData: 0 },
    );

    await this.systemService.createSystemLogEntry({
      module: 'tasks',
      service: 'generateTransactions',
      message: `Added ${output.added} transactions, skipped ${output.skipped} and found ${output.missingData} templates with missing data`,
      level: SystemLogLevel.INFO,
    });

    return output;
  }
}
