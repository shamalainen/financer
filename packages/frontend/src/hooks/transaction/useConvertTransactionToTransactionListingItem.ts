import { useCallback } from 'react';

import { getTransactionType } from '../../utils/transaction/getTransactionType';

import {
  TransactionCategoryMappingDto,
  TransactionDto,
} from '$api/generated/financerApi';
import {
  TransactionListingItemProps,
  TransactionType,
} from '$blocks/transaction-listing/transaction-listing.item';
import { formatCurrency } from '$utils/formatCurrency';
import { formatDate } from '$utils/formatDate';

type TransactionDtoForConvert = Omit<
  TransactionDto,
  'fromAccount' | 'toAccount'
> & {
  fromAccount?: string;
  toAccount?: string;
};

const mapTransactionTypeToUrlPrefix: {
  [key in TransactionType]: 'incomes' | 'expenses' | 'transfers';
} = {
  income: 'incomes',
  expense: 'expenses',
  transfer: 'transfers',
};

export const useConvertTransactionToTransactionListingItem = () => {
  return useCallback(
    (
      transaction: TransactionDtoForConvert,
      getCategoryName: (id: string) => string | undefined,
    ): TransactionListingItemProps => {
      const transactionType = getTransactionType(
        transaction.toAccount,
        transaction.fromAccount,
      );

      return {
        transactionCategories: (
          transaction.categories as unknown as TransactionCategoryMappingDto[]
        )
          .map(({ categoryId }) =>
            getCategoryName(categoryId as unknown as string),
          )
          .join(', '),
        transactionAmount: formatCurrency(transaction.amount),
        date: formatDate(new Date(transaction.date)),
        label: transaction.description,
        link: `/statistics/${mapTransactionTypeToUrlPrefix[transactionType]}/${transaction.id}`,
        transactionType,
        id: transaction.id,
      };
    },
    [],
  );
};
