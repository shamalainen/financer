import { ITransactionCategoryMapping } from '@local/types/src/transaction-category-mapping';
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { Alert } from '../../components/alert/alert';
import { Banner } from '../../components/banner/banner';
import { BannerText } from '../../components/banner/banner.text';
import { Button } from '../../components/button/button';
import { ButtonGroup } from '../../components/button/button.group';
import { Heading } from '../../components/heading/heading';
import { Loader } from '../../components/loader/loader';
import { SEO } from '../../components/seo/seo';
import { TransactionStackedList } from '../../components/transaction-stacked-list/transaction-stacked-list';
import { ITransactionStackedListRowProps } from '../../components/transaction-stacked-list/transaction-stacked-list.row';
import { useAccountById } from '../../hooks/account/useAccountById';
import { useDeleteAccount } from '../../hooks/account/useDeleteAccount';
import { useAddExpense } from '../../hooks/expense/useAddExpense';
import { useAddIncome } from '../../hooks/income/useAddIncome';
import { useUserDefaultMarketUpdateSettings } from '../../hooks/profile/user-preference/useDefaultMarketUpdateSettings';
import { useTransactionsByAccountId } from '../../hooks/transaction/useTransactionsByAccountId';
import { useAllTransactionCategories } from '../../hooks/transactionCategories/useAllTransactionCategories';
import { useAllTransactionCategoryMappings } from '../../hooks/transactionCategoryMapping/useAllTransactionCategoryMappings';
import { parseErrorMessagesToArray } from '../../utils/apiHelper';
import { capitalize } from '../../utils/capitalize';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';
import {
  getTransactionType,
  mapTransactionTypeToUrlPrefix,
} from '../statistics/Statistics';

import { AccountDeleteModal } from './account-modals/AccountDeleteModal';
import { AccountUpdateMarketValueModal } from './account-modals/AccountUpdateMarketValueModal';
import { AccountBalanceHistoryChart } from './AccountBalanceHistoryChart';

export const Account = (): JSX.Element => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const deleteAccount = useDeleteAccount();
  const [account] = useAccountById(id);
  const [transactions, setTransactions] = useState<
    ITransactionStackedListRowProps[]
  >([]);
  const [rawTransactions] = useTransactionsByAccountId(id);
  const transactionCategoryMappings = useAllTransactionCategoryMappings();
  const transactionCategories = useAllTransactionCategories();
  const [marketSettings] = useUserDefaultMarketUpdateSettings();

  const [errors, setErrors] = useState<string[]>([]);
  const addIncome = useAddIncome();
  const addExpense = useAddExpense();

  useEffect(() => {
    if (!rawTransactions) return;
    setTransactions(
      rawTransactions
        .map(
          ({
            date: dateRaw,
            fromAccount,
            toAccount,
            description = 'Unknown',
            amount,
            _id,
          }): ITransactionStackedListRowProps => {
            const date = new Date(dateRaw);
            const transactionType = getTransactionType(toAccount, fromAccount);

            const categoryMappings = transactionCategoryMappings
              ?.filter(({ transaction_id }) => transaction_id === _id)
              .map(
                ({ category_id }) =>
                  transactionCategories.find(
                    ({ _id: categoryId }) => category_id === categoryId
                  )?.name
              )
              .filter((categoryName) => typeof categoryName !== 'undefined');

            return {
              transactionCategories: categoryMappings.join(', '),
              transactionAmount: formatCurrency(amount),
              date: formatDate(date),
              label: description,
              link: `/statistics/${mapTransactionTypeToUrlPrefix[transactionType]}/${_id}`,
              transactionType,
              id: _id,
            } as ITransactionStackedListRowProps;
          }
        )
        .sort((a, b) =>
          new Date(b.date).getTime() > new Date(a.date).getTime() ? 1 : -1
        )
    );
  }, [id, rawTransactions, transactionCategories, transactionCategoryMappings]);

  const handleDelete = async () => {
    if (!id) {
      console.error('Failure to delete account: no id');
      return;
    }
    await deleteAccount(id);
    navigate('/accounts');
  };

  const handleMarketValueUpdate = async (
    newMarketValue: number,
    date: Date
  ) => {
    if (!id) {
      console.error('Failure to update market value: no id');
      return;
    }

    if (!account) {
      console.error(
        'Failure to update market value: no account data available'
      );
      return;
    }

    const transactionDescription =
      marketSettings?.transactionDescription ?? 'Market value change';
    const marketValueChangeAmount = newMarketValue - account.balance;

    const mappedCategory: ITransactionCategoryMapping = {
      amount: Math.abs(marketValueChangeAmount),
      description: transactionDescription,
      category_id:
        marketSettings?.category !== undefined ? marketSettings.category : '',
    };

    if (marketValueChangeAmount > 0) {
      try {
        const newIncomeJson = await addIncome({
          toAccount: id,
          amount: marketValueChangeAmount,
          description: transactionDescription,
          date: date ?? new Date(),
          categories: marketSettings?.category ? [mappedCategory] : undefined,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any);

        if ('message' in newIncomeJson) {
          setErrors(parseErrorMessagesToArray(newIncomeJson.message));
          return;
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.log(error);
      }
    } else if (marketValueChangeAmount < 0) {
      try {
        const newExpenseJson = await addExpense({
          fromAccount: id,
          amount: Math.abs(marketValueChangeAmount),
          description: transactionDescription,
          date: new Date(),
          categories: marketSettings?.category ? [mappedCategory] : undefined,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any);

        if ('message' in newExpenseJson) {
          setErrors(parseErrorMessagesToArray(newExpenseJson.message));
          return;
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.log(error);
      }
    } else {
      console.log('Current value is same as previous no update needed.');
    }
  };

  return !account || !transactions ? (
    <Loader loaderColor="blue" />
  ) : (
    <>
      <SEO title={`${account.name}`} />
      {errors.length > 0 && (
        <Alert additionalInformation={errors} testId="account-page-errors">
          There were {errors.length} errors with your submission
        </Alert>
      )}
      <Banner
        title={account.name}
        headindType="h1"
        testId="account-banner"
        className="mb-4 lg:mb-6"
      >
        <BannerText>
          Manage your account information and review your account transaction
          history.
        </BannerText>
        <ButtonGroup className="mt-6">
          {account.type === 'investment' && (
            <AccountUpdateMarketValueModal
              currentValue={account.balance}
              handleUpdate={(newMarketValue, newDate) =>
                handleMarketValueUpdate(newMarketValue, newDate)
              }
            />
          )}
          <Button
            accentColor="blue"
            link={`/accounts/${id}/edit`}
            testId="edit-account"
          >
            Edit account
          </Button>
          <AccountDeleteModal handleDelete={handleDelete} />
        </ButtonGroup>
      </Banner>
      <section className={`bg-white border rounded-lg mb-4 lg:mb-6`}>
        <dl className="relative px-6 pt-10 pb-6 border-b">
          <dt className="absolute text-sm font-medium text-gray-700 truncate lg:text-base top-4 left-6">
            Balance
          </dt>
          <dd
            className="text-3xl font-bold tracking-tight"
            data-testid="account-balance"
          >
            {formatCurrency(account.balance)}
          </dd>
        </dl>
        <section className="grid grid-cols-2 divide-x">
          <dl className="py-4 pl-6 pr-4">
            <dt className="text-xs font-medium text-gray-700 truncate lg:text-sm">
              Type
            </dt>
            <dd
              className="text-xl font-bold tracking-tight"
              data-testid="account-type"
            >
              {capitalize(account.type)}
            </dd>
          </dl>
          <dl className="py-4 pl-6 pr-4">
            <dt className="text-xs font-medium text-gray-700 truncate lg:text-sm">
              Transactions
            </dt>
            <dd className="text-xl font-bold tracking-tight">
              {transactions.length}
            </dd>
          </dl>
        </section>
      </section>
      <AccountBalanceHistoryChart accountId={id} />
      <section className="mt-4 lg:mt-6">
        <Heading>History</Heading>
        <TransactionStackedList className="mt-4" rows={transactions} />
      </section>
    </>
  );
};
