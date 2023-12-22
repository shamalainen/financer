import { TransactionType } from '$api/generated/financerApi';

export const transactionTypeLabelMapping: {
  [key in TransactionType]: { default: string; plural: string };
} = {
  [TransactionType.Income]: { default: 'income', plural: 'incomes' },
  [TransactionType.Expense]: { default: 'expense', plural: 'expenses' },
  [TransactionType.Transfer]: { default: 'transfer', plural: 'transfers' },
};
