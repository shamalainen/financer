import { useCallback, useMemo } from 'react';

import { ExpenseDto, IncomeDto, TransferDto } from '$api/generated/financerApi';
import { BalanceDisplay } from '$blocks/balance-display/balance-display';
import { DetailsList } from '$blocks/details-list/details-list';
import { TransactionType } from '$blocks/transaction-listing/transaction-listing.item';
import { ButtonInternal } from '$elements/button/button.internal';
import { Heading } from '$elements/heading/heading';
import { Icon, IconName } from '$elements/icon/icon';
import { useGetAllTransactionCategoriesWithCategoryTree } from '$hooks/transactionCategories/useGetAllTransactionCategoriesWithCategoryTree';
import { UpdatePageInfo } from '$renderers/seo/updatePageInfo';
import { capitalize } from '$utils/capitalize';
import { formatCurrency } from '$utils/formatCurrency';
import { DateFormat, formatDate } from '$utils/formatDate';
import { getTransactionType } from '$utils/transaction/getTransactionType';

interface TransactionProps {
  transaction: IncomeDto | ExpenseDto | TransferDto;
  toAccount?: string;
  fromAccount?: string;
}

export const Transaction = ({
  transaction,
  toAccount,
  fromAccount,
}: TransactionProps): JSX.Element => {
  const { data: transactionCategories } =
    useGetAllTransactionCategoriesWithCategoryTree();

  const getCategoryNameById = useCallback(
    (categoryId: string) =>
      transactionCategories?.find((category) => category.id === categoryId)
        ?.categoryTree || categoryId,
    [transactionCategories],
  );

  const transactionType = getTransactionType(toAccount, fromAccount);

  const transactionDetailsMapping = useMemo(() => {
    switch (transactionType) {
      case TransactionType.TRANSFER:
        return {
          type: 'transfer',
          url: 'transfers',
        };
      case TransactionType.INCOME:
        return {
          type: 'income',
          url: 'incomes',
        };
      case TransactionType.EXPENSE:
        return {
          type: 'expense',
          url: 'expenses',
        };
    }
  }, [transactionType]);

  const transactionDetails = useMemo(
    () => [
      ...(fromAccount
        ? [
            {
              icon: IconName.viewGrid,
              label: 'From Account',
              description: fromAccount,
            },
          ]
        : []),
      ...(toAccount
        ? [
            {
              icon: IconName.viewGrid,
              label: 'To Account',
              description: toAccount,
            },
          ]
        : []),
      {
        icon: IconName.calendar,
        label: 'Date',
        description: formatDate(new Date(transaction?.date), DateFormat.long),
      },
      {
        icon: IconName.informationCircle,
        label: 'Type',
        description: capitalize(transactionDetailsMapping.type ?? '-'),
      },
    ],
    [fromAccount, toAccount, transaction?.date, transactionDetailsMapping.type],
  );

  const categoryDetails = useMemo(() => {
    return transaction.categories.map(({ amount, categoryId, description }) => {
      return [
        {
          icon: IconName.tag,
          label: 'Category',
          description: getCategoryNameById(categoryId as unknown as string),
        },
        {
          icon: IconName.informationCircle,
          label: 'Amount',
          description: formatCurrency(amount),
        },
        ...(description
          ? [
              {
                icon: IconName.annotation,
                label: 'Description',
                description,
              },
            ]
          : []),
      ];
    });
  }, [transaction.categories, getCategoryNameById]);

  return (
    <>
      <UpdatePageInfo
        title={'Transaction Details'}
        backLink="/statistics"
        headerAction={
          <ButtonInternal
            link={`/statistics/${transactionDetailsMapping.url}/${transaction._id}/edit`}
            testId={`edit-${transactionDetailsMapping.type}-button`}
            transition="open-from-right"
            className="inline-flex items-center justify-center -mr-3 h-11 w-11"
          >
            <span className="sr-only">Edit</span>
            <Icon type={IconName.pencilSquare} />
          </ButtonInternal>
        }
      />
      <section>
        <BalanceDisplay
          className="mb-6"
          type={transactionType}
          amount={transaction?.amount}
        >
          {`${transaction?.description}`}
        </BalanceDisplay>
        <DetailsList
          items={transactionDetails}
          className="py-4 border-t border-b border-gray-dark"
        />
        {categoryDetails.length > 0 && (
          <section className="mt-8">
            <Heading className="mb-4">Categories</Heading>
            <div className="grid divide-y divide-gray-dark border-t border-b border-gray-dark">
              {categoryDetails.map((category) => (
                <DetailsList
                  testId="category-details"
                  key={category[0].label}
                  items={category}
                  className="py-4"
                />
              ))}
            </div>
          </section>
        )}
      </section>
    </>
  );
};
