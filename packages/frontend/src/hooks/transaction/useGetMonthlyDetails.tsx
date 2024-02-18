import { useMemo } from 'react';

import {
  useIncomesFindMonthlySummariesByuserQuery,
  useExpensesFindMonthlySummariesByuserQuery,
} from '$api/generated/financerApi';
import { IconName } from '$elements/icon/icon';
import { useUserStatisticsSettings } from '$hooks/settings/user-preference/useStatisticsSettings';
import { formatCurrency } from '$utils/formatCurrency';

const emptyTotalAmount = { totalAmount: 0 };

// @todo: create filterOptions type
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const useGetMonthlyDetails = (filterOptions: any) => {
  const { data: statisticsSettings } = useUserStatisticsSettings();
  const accountTypeFilter = { accountTypes: statisticsSettings?.accountTypes };

  const incomeMonthSummaryData = useIncomesFindMonthlySummariesByuserQuery({
    ...filterOptions,
    ...accountTypeFilter,
  });

  const expenseMonthSummary = useExpensesFindMonthlySummariesByuserQuery({
    ...filterOptions,
    ...accountTypeFilter,
  });

  const { data: incomeSummaries } = incomeMonthSummaryData;
  const { data: expenseSummaries } = expenseMonthSummary;

  const { totalAmount: totalIncomes } =
    incomeSummaries?.at(-1) ?? emptyTotalAmount;
  const { totalAmount: totalExpenses } =
    expenseSummaries?.at(-1) ?? emptyTotalAmount;

  const monthlyDetails = useMemo(
    () => [
      {
        icon: IconName.download,
        label: 'Incomes',
        description: (
          <span className="text-green">
            {formatCurrency(totalIncomes) ?? '-'}
          </span>
        ),
      },
      {
        icon: IconName.upload,
        label: 'Expenses',
        description: (
          <span className="text-red">
            {formatCurrency(totalExpenses) ?? '-'}
          </span>
        ),
      },
      {
        icon: IconName.plus,
        label: 'Net Total',
        description: formatCurrency(totalIncomes - totalExpenses) ?? '-',
      },
    ],
    [totalExpenses, totalIncomes],
  );

  return monthlyDetails;
};
