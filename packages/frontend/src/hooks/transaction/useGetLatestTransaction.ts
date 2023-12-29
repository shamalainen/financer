import {
  TransfersFindAllByUserApiArg,
  useTransfersFindAllByUserQuery,
} from '$api/generated/financerApi';

export const useGetLatestTransaction = (
  args: Omit<TransfersFindAllByUserApiArg, 'limit' | 'page' | 'sortOrder'> = {},
) => {
  const transactionData = useTransfersFindAllByUserQuery({
    ...args,
    limit: 1,
    page: 1,
  });

  return { ...transactionData, data: transactionData.data?.data[0] };
};
