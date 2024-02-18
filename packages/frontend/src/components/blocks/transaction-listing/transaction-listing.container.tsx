import { useEffect, useMemo } from 'react';

import { usePager } from '../../../hooks/usePager';

import { TransactionListing } from './transaction-listing';

import {
  useTransactionsFindAllByUserQuery,
  useIncomesFindAllByUserQuery,
  useExpensesFindAllByUserQuery,
  useTransfersFindAllByUserQuery,
  useTransactionsFindAllByAccountQuery,
} from '$api/generated/financerApi';
import { DataHandler } from '$blocks/data-handler/data-handler';
import { useConvertTransactionToTransactionListingItem } from '$hooks/transaction/useConvertTransactionToTransactionListingItem';
import { useGetTransactionCategoryNameById } from '$hooks/transactionCategories/useGetTransactionCategoryNameById';

export interface TransactionListingContainerProps {
  isPagerHidden?: boolean;
  // filterOptions?:
  //   | TransactionsFindAllByUserApiArg
  //   | TransactionsFindAllByAccountApiArg;
  // @todo: fix above typing for filterOptions...
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  filterOptions?: any;
  className?: string;
  useDataHook?:
    | typeof useTransactionsFindAllByUserQuery
    | typeof useIncomesFindAllByUserQuery
    | typeof useExpensesFindAllByUserQuery
    | typeof useTransfersFindAllByUserQuery
    | typeof useTransactionsFindAllByAccountQuery;
  onPageChange?: (page: number) => void;
  initialPage?: number;
}

export const TransactionListingContainer = ({
  isPagerHidden,
  filterOptions = {
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
  },
  className,
  useDataHook = useTransactionsFindAllByUserQuery,
  onPageChange,
  initialPage = 1,
}: TransactionListingContainerProps): JSX.Element | null => {
  const getCategoryName = useGetTransactionCategoryNameById();
  const convertTransactionToTransactionListingItem =
    useConvertTransactionToTransactionListingItem();

  const { page, getPagerOptions } = usePager(initialPage);
  const transactionData = useDataHook({ ...filterOptions, page });
  const { data } = transactionData;

  useEffect(() => {
    if (onPageChange) {
      onPageChange(data?.currentPage ?? 1);
    }
  }, [onPageChange, data?.currentPage]);

  const rows = useMemo(() => {
    return (
      data?.data.map((transaction) =>
        convertTransactionToTransactionListingItem(
          transaction,
          getCategoryName,
        ),
      ) || []
    );
  }, [convertTransactionToTransactionListingItem, data?.data, getCategoryName]);

  return (
    <>
      <DataHandler {...transactionData} />
      {data && (
        <TransactionListing
          rows={rows}
          pagerOptions={{ ...getPagerOptions(data) }}
          className={className}
          isPagerHidden={isPagerHidden}
        />
      )}
    </>
  );
};
