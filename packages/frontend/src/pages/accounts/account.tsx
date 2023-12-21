import { useMemo } from 'react';

import { AccountBalanceHistoryChart } from './account.balance-history-chart';

import {
  AccountDto,
  AccountType,
  useTransactionsFindAllByAccountQuery,
} from '$api/generated/financerApi';
import { BalanceDisplay } from '$blocks/balance-display/balance-display';
import { DetailsList } from '$blocks/details-list/details-list';
import { TransactionListingWithMonthlyPager } from '$blocks/transaction-listing-with-monthly-pager/transaction-listing.with.monthly-pager';
import { accountTypeIconMapping } from '$constants/account/accountTypeIconMapping';
import { AccountUpdateMarketValueContainer } from '$container/accounts/account.update-market-value.container';
import { ButtonInternal } from '$elements/button/button.internal';
import { Icon, IconName } from '$elements/icon/icon';
import { LoaderSuspense } from '$elements/loader/loader-suspense';
import { UpdatePageInfo } from '$renderers/seo/updatePageInfo';
import { capitalize } from '$utils/capitalize';

interface AccountProps {
  account: AccountDto;
}

export const Account = ({ account }: AccountProps): JSX.Element | null => {
  const accountDetails = useMemo(
    () => [
      {
        icon: IconName.informationCircle,
        label: 'Type',
        description: capitalize(account.type),
      },
    ],
    [account.type],
  );

  return (
    <>
      <UpdatePageInfo
        title={`Account Details`}
        backLink="/accounts"
        headerAction={
          <ButtonInternal
            link={`/accounts/${account.id}/edit`}
            className="inline-flex items-center justify-center -mr-3 h-11 w-11"
            testId="edit-account"
          >
            <span className="sr-only">Edit</span>
            <Icon type={IconName.pencilSquare} />
          </ButtonInternal>
        }
      />
      <section>
        <section className="mb-8">
          <BalanceDisplay
            amount={account.balance}
            iconName={accountTypeIconMapping[account.type]}
            testId={'account-balance'}
            childTestId={'account-name'}
          >
            {account.name}
          </BalanceDisplay>
          <DetailsList
            testId="account-details"
            items={accountDetails}
            className="py-4 border-t border-b border-gray-dark mt-6"
          />
        </section>
        <LoaderSuspense>
          <AccountBalanceHistoryChart accountId={account.id} />
        </LoaderSuspense>
        <div className="grid gap-2 my-6">
          {account.type === AccountType.Investment && (
            <AccountUpdateMarketValueContainer account={account} />
          )}
        </div>
        <TransactionListingWithMonthlyPager
          additionalFilterOptions={{ id: account.id }}
          useDataHook={useTransactionsFindAllByAccountQuery}
        />
      </section>
    </>
  );
};
