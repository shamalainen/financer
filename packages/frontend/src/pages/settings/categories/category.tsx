import { ChartData, ChartOptions } from 'chart.js';
import { isAfter } from 'date-fns';
import { useMemo } from 'react';
import { Chart } from 'react-chartjs-2';

import {
  TransactionCategoryDto,
  TransactionsFindMonthlySummariesByUserApiResponse,
} from '$api/generated/financerApi';
import { DetailsList } from '$blocks/details-list/details-list';
import { TransactionListingWithMonthlyPager } from '$blocks/transaction-listing-with-monthly-pager/transaction-listing.with.monthly-pager';
import { colorPalette } from '$constants/colorPalette';
import { baseChartOptions } from '$constants/graph/graph.settings';
import { monthAgoDate } from '$constants/months';
import { settingsPaths } from '$constants/settings-paths';
import { ButtonInternal } from '$elements/button/button.internal';
import { ChartWrapperDynamic } from '$elements/chart/chart-wrapper.dynamic';
import { Icon, IconName } from '$elements/icon/icon';
import { Container } from '$layouts/container/container';
import { UpdatePageInfo } from '$renderers/seo/updatePageInfo';
import { capitalize } from '$utils/capitalize';
import { formatDate } from '$utils/formatDate';
import { generateDateFromYearAndMonth } from '$utils/generateDateFromYearAndMonth';
import { setGradientLineGraphBackground } from '$utils/graph/setGradientLineGraphBackground';
import { parseParentCategoryPath } from 'src/services/TransactionCategoriesService';

interface CategoryHistory {
  dateStr: string;
  date: Date;
  balance: number;
}

interface CategoryProps {
  transactionsMonthlySummaries?: TransactionsFindMonthlySummariesByUserApiResponse;
  category: TransactionCategoryDto;
  categories: TransactionCategoryDto[];
  parentTransactionCategoryId: string;
}

export const Category = ({
  transactionsMonthlySummaries,
  category,
  categories,
  parentTransactionCategoryId,
}: CategoryProps): JSX.Element => {
  const categoryHistory: CategoryHistory[] = useMemo(() => {
    if (!category || !transactionsMonthlySummaries) return [];

    const transactionCategoryTransactionHistoryStack =
      transactionsMonthlySummaries
        .map(({ totalAmount, _id: { year, month } }) => ({
          date: generateDateFromYearAndMonth(year, month),
          amount: totalAmount,
        }))
        .map(({ date, amount }) => ({
          date: new Date(date),
          balance: amount,
          dateStr: formatDate(new Date(date)),
        }))
        .sort((a, b) => a.date.getTime() - b.date.getTime());

    return transactionCategoryTransactionHistoryStack;
  }, [category, transactionsMonthlySummaries]);

  const labels = categoryHistory.map(({ dateStr }) => {
    return dateStr;
  });

  const monthAgoIndex = categoryHistory.indexOf(
    categoryHistory.find((tick) => isAfter(tick.date, monthAgoDate)) ||
      categoryHistory[0],
  );

  const startIndex =
    categoryHistory.length - monthAgoIndex > 12
      ? monthAgoIndex
      : categoryHistory.length - 12;

  const chartOptions = useMemo(() => {
    const customChartOptions = {
      ...baseChartOptions,
      scales: {
        ...baseChartOptions?.scales,
        x: {
          ...baseChartOptions?.scales?.x,
          min: startIndex,
        },
      },
    } as ChartOptions;

    return customChartOptions;
  }, [startIndex]);

  const chartData = useMemo(
    () =>
      ({
        labels,
        datasets: [
          {
            label: 'Balance',
            fill: true,
            borderColor: colorPalette.blue,
            backgroundColor: setGradientLineGraphBackground,
            data: categoryHistory.map(({ balance }) => balance),
            tension: 0.25,
          },
        ],
      }) as ChartData,
    [categoryHistory, labels],
  );

  const categoryDetails = useMemo(() => {
    const categoryVisibilityCapitalized = category.visibility.map((item) =>
      capitalize(item),
    );

    const formatter = new Intl.ListFormat('en', {
      style: 'long',
      type: 'conjunction',
    });

    return [
      {
        icon: IconName.tag,
        label: 'Name',
        description: category.name,
      },
      ...(category.parentCategoryId
        ? [
            {
              icon: IconName.viewGrid,
              label: 'Parent Category',
              description:
                parseParentCategoryPath(
                  categories,
                  category.parentCategoryId,
                ) ?? '-',
            },
          ]
        : []),
      {
        icon: IconName.informationCircle,
        label: 'Type',
        description: formatter.format(categoryVisibilityCapitalized),
      },
    ];
  }, [
    categories,
    category.name,
    category.parentCategoryId,
    category.visibility,
  ]);

  return (
    <Container>
      <UpdatePageInfo
        title={'Category Details'}
        backLink={settingsPaths.categories}
        headerAction={
          <ButtonInternal
            link={`${settingsPaths.categories}/${category.id}/edit`}
            className="inline-flex items-center justify-center -mr-3 h-11 w-11"
            testId="edit-category"
          >
            <span className="sr-only">Edit</span>
            <Icon type={IconName.pencilSquare} />
          </ButtonInternal>
        }
      />
      <section>
        <DetailsList items={categoryDetails} className="mb-8" />
        {!categoryHistory?.length || categoryHistory.length === 1 ? null : (
          <div className="min-h-[300px] h-[20vh] md:h-auto md:min-h-0 md:aspect-video -mx-4 md:-mx-0">
            <ChartWrapperDynamic>
              <Chart type="line" data={chartData} options={chartOptions} />
            </ChartWrapperDynamic>
          </div>
        )}
        <TransactionListingWithMonthlyPager
          className="mt-6"
          additionalFilterOptions={{
            parentTransactionCategory: parentTransactionCategoryId,
          }}
        />
      </section>
    </Container>
  );
};
