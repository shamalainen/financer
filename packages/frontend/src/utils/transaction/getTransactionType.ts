import { TransactionType } from '$blocks/transaction-listing/transaction-listing.item';

export const getTransactionType = (
  toAccount: string | null | undefined,
  fromAccount: string | null | undefined,
): TransactionType => {
  if (toAccount && !fromAccount) {
    return TransactionType.INCOME;
  }

  if (!toAccount && fromAccount) {
    return TransactionType.EXPENSE;
  }

  return TransactionType.TRANSFER;
};
