import { useState, useEffect, useCallback, useMemo } from 'react';

import { Pager } from '../pager/pager';

import { TransactionListingWithMonthlyPagerSummary } from './transaction-listing.with.monthly-pager.summary';

import {
  TransactionsFindAllByUserApiArg,
  useTransactionsFindAllByUserQuery,
} from '$api/generated/financerApi';
import {
  TransactionListingContainer,
  TransactionListingContainerProps,
} from '$blocks/transaction-listing/transaction-listing.container';
import { monthNames } from '$constants/months';
import { LoaderSuspense } from '$elements/loader/loader-suspense';
import { useGetFirstTransaction } from '$hooks/transaction/useGetFirstTransaction';
import { useViewTransitionRouter } from '$hooks/useViewTransitionRouter';

export const initialMonthFilterOptions = {
  year: new Date().getFullYear(),
  month: new Date().getMonth() + 1,
} satisfies TransactionsFindAllByUserApiArg;

interface TransactionListingWithMonthlyPagerProps {
  className?: string;
  initialDate?: string;
  initialPage?: number;
  isSummaryVisible?: boolean;
  // @todo: create filter type
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  additionalFilterOptions?: any;
  useDataHook?: TransactionListingContainerProps['useDataHook'];
}

const parseYearMonthFromString = (initialDate?: string) => {
  const [year, month] = initialDate?.split('-') || [];

  if (!year || !month) {
    return undefined;
  }

  if (year.length !== 4 || (month.length !== 2 && month.length !== 1)) {
    return undefined;
  }

  return {
    year: parseInt(year),
    month: parseInt(month),
  };
};

export const TransactionListingWithMonthlyPager = ({
  className = '',
  initialDate,
  initialPage = 1,
  isSummaryVisible,
  additionalFilterOptions,
  useDataHook = useTransactionsFindAllByUserQuery,
}: TransactionListingWithMonthlyPagerProps): JSX.Element | null => {
  const { push } = useViewTransitionRouter();

  const [selectedPage, setSelectedPage] = useState(initialPage);

  const baseFilterOptions = {
    ...initialMonthFilterOptions,
    ...additionalFilterOptions,
  };

  const [filterOptions, setFilterOptions] = useState(
    !parseYearMonthFromString(initialDate)
      ? baseFilterOptions
      : {
          ...baseFilterOptions,
          ...parseYearMonthFromString(initialDate),
          page: selectedPage,
        },
  );
  const { data: transaction } = useGetFirstTransaction();

  const [initialPageToLoad, setInitialPage] = useState(selectedPage);

  useEffect(() => {
    const year = filterOptions.year;
    const month = filterOptions.month.toString().padStart(2, '0');

    const params = new URLSearchParams(window.location.search);
    params.set('date', `${year}-${month}`);
    params.set('page', selectedPage.toString());

    window.history.replaceState(
      {},
      '',
      `${window.location.pathname}?${params}`,
    );

    setInitialPage(1);
  }, [filterOptions.year, filterOptions.month, push, selectedPage]);

  const handleMonthOptionChange = useCallback(
    (direction: 'next' | 'previous') => {
      const { month, year } = filterOptions;
      const monthWithTwoDigits = month.toString().padStart(2, '0');
      const selectedMonth = new Date(`${year}-${monthWithTwoDigits}-01`);

      selectedMonth.setMonth(
        selectedMonth.getMonth() + (direction === 'next' ? 1 : -1),
      );

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setFilterOptions((prev: any) => ({
        ...prev,
        month: selectedMonth.getMonth() + 1,
        year: selectedMonth.getFullYear(),
      }));
    },
    [filterOptions],
  );

  const pagerOptions = useMemo(() => {
    const firstAvailableTransaction = new Date(transaction?.date || new Date());

    return {
      nextPage: {
        isAvailable: !(
          filterOptions.month === initialMonthFilterOptions.month &&
          filterOptions.year === initialMonthFilterOptions.year
        ),
        load: () => handleMonthOptionChange('next'),
      },
      previousPage: {
        isAvailable: !(
          filterOptions.month === firstAvailableTransaction.getMonth() + 1 &&
          filterOptions.year === firstAvailableTransaction.getFullYear()
        ),
        load: () => handleMonthOptionChange('previous'),
      },
    };
  }, [
    filterOptions.month,
    filterOptions.year,
    handleMonthOptionChange,
    transaction?.date,
  ]);

  const pageVisibleYear = filterOptions.year;
  const pageVisibleMonth = monthNames[filterOptions.month - 1];
  const pagerLabel = `${pageVisibleMonth} ${pageVisibleYear}`;

  return (
    <section className={className}>
      <Pager className="mb-4" pagerOptions={pagerOptions}>
        {pagerLabel}
      </Pager>
      <LoaderSuspense>
        {isSummaryVisible && (
          <TransactionListingWithMonthlyPagerSummary
            filterOptions={filterOptions}
          />
        )}
        <TransactionListingContainer
          filterOptions={filterOptions}
          className="mt-4"
          useDataHook={useDataHook}
          onPageChange={setSelectedPage}
          initialPage={initialPageToLoad}
        />
      </LoaderSuspense>
    </section>
  );
};
