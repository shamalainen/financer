import { useMemo } from 'react';

import {
  useAccountsFindAllByUserQuery,
  AccountTypeEnum,
} from '$api/generated/financerApi';
import {
  AccountListing,
  AccountListingItem,
} from '$blocks/account-listing/accounts-listing';
import { ButtonInternal } from '$elements/button/button.internal';
import { Icon, IconName } from '$elements/icon/icon';
import { UpdatePageInfo } from '$renderers/seo/updatePageInfo';
import { formatCurrency } from '$utils/formatCurrency';

export const AccountListingContainer = () => {
  const { data: accountsRaw } = useAccountsFindAllByUserQuery({});

  const accounts = useMemo(() => {
    if (!accountsRaw) {
      return {
        savings: [],
        investments: [],
        loans: [],
      };
    }

    const formattedAccounts = accountsRaw.data.map(
      ({ _id, balance, name, type }) => ({
        label: name,
        link: `/accounts/${_id}`,
        balanceAmount: formatCurrency(balance),
        type: type as AccountTypeEnum,
        accountType: type.charAt(0).toUpperCase() + type.slice(1),
        id: _id,
      })
    ) as AccountListingItem[];

    const savings = formattedAccounts.filter(
      ({ type }) =>
        type !== AccountTypeEnum.Loan &&
        type !== AccountTypeEnum.Investment &&
        type !== AccountTypeEnum.Credit
    );

    const investments = formattedAccounts.filter(
      ({ type }) => type === AccountTypeEnum.Investment
    );

    const loans = formattedAccounts.filter(
      ({ type }) =>
        type === AccountTypeEnum.Loan || type === AccountTypeEnum.Credit
    );

    return {
      savings,
      investments,
      loans,
    };
  }, [accountsRaw]);

  return (
    <>
      <UpdatePageInfo
        title="Accounts"
        headerAction={
          <ButtonInternal
            link="/accounts/add"
            className="inline-flex items-center justify-center -mr-3 h-11 w-11"
            testId="add-account"
          >
            <span className="sr-only">Add account</span>
            <Icon type={IconName.viewGridAdd} />
          </ButtonInternal>
        }
      />
      <section className="grid gap-8">
        <AccountListing label="Savings" items={accounts.savings} />
        <AccountListing label="Investments" items={accounts.investments} />
        <AccountListing label="Credits and Loans" items={accounts.loans} />
      </section>
    </>
  );
};
