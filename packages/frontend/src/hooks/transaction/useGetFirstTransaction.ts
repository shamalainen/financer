import {
  SortOrder,
  TransactionsFindAllByUserApiArg,
  useTransactionsFindAllByUserQuery,
} from '$api/generated/financerApi';

export const useGetFirstTransaction = (
  args: Omit<
    TransactionsFindAllByUserApiArg,
    'limit' | 'page' | 'sortOrder'
  > = {},
) => {
  const transactionData = useTransactionsFindAllByUserQuery({
    ...args,
    limit: 1,
    page: 1,
    sortOrder: SortOrder.Asc,
  });

  return { ...transactionData, data: transactionData.data?.data[0] };
};
