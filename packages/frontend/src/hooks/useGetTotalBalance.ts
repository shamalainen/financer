import { useMemo } from 'react';

import {
  AccountsFindAllByUserApiArg,
  useAccountsFindAllByUserQuery,
} from '$api/generated/financerApi';

export const useGetTotalBalance = (
  filterOptions: Pick<AccountsFindAllByUserApiArg, 'accountTypes'> = {
    accountTypes: [],
  },
) => {
  const { data: accounts, ...rest } =
    useAccountsFindAllByUserQuery(filterOptions);

  const totalBalance = useMemo(() => {
    if (!accounts?.data.length) {
      return NaN;
    }

    return accounts?.data.reduce(
      (currentTotal, { balance }) => currentTotal + balance,
      0,
    );
  }, [accounts]);

  return { ...rest, data: totalBalance };
};
