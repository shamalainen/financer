import React, { Suspense, useEffect, useState } from "react";
import { DataOrModifiedFn, useAsyncResource } from "use-async-resource";
import Button from "../../components/button/button";
import ButtonGroup from "../../components/button/button.group";
import Hero from "../../components/hero/hero";
import Loader from "../../components/loader/loader";
import SEO from "../../components/seo/seo";
import StackedList from "../../components/stacked-list/stacked-list";
import { IStackedListRowProps } from "../../components/stacked-list/stacked-list.row";
import { TAddiotinalLabel } from "../../components/table/table.header";
import formatCurrency from "../../utils/formatCurrency";
import { getAllAccounts } from "./AccountService";
import TransferList from "./TransferList";

interface IAccountsProps {
  accountsReader: DataOrModifiedFn<IAccount[]>;
}

const Accounts = ({ accountsReader }: IAccountsProps): JSX.Element => {
  const [accounts, setAccounts] = useState<IStackedListRowProps[]>([]);
  const [totalBalance, setTotalBalance] = useState<number>(NaN);
  const accountsRaw = accountsReader();

  useEffect(() => {
    const total = accountsRaw.reduce(
      (currentTotal, { balance, type }) =>
        currentTotal + (type !== "loan" ? balance : 0),
      0
    );
    setTotalBalance(total);
    setAccounts(
      accountsRaw.map(({ _id, balance, name, type }) => ({
        label: name,
        link: `/accounts/${_id}`,
        additionalLabel: formatCurrency(balance),
        additionalInformation: [type.charAt(0).toUpperCase() + type.slice(1)],
        id: _id,
      }))
    );
  }, [accountsRaw]);

  const getAddiotinalLabel = (total: number): TAddiotinalLabel => ({
    label: `${Number.isNaN(total) ? "-" : formatCurrency(total)}`,
    accentLabel: "Total",
  });

  return (
    <>
      <SEO title="Accounts" />
      <Hero accent="Overview" accentColor="blue" label="Accounts">
        Below you are able to add your various accounts where you have your
        savings or investments to calculate total amount.
      </Hero>
      <div className="mt-12">
        <ButtonGroup>
          <Button link="/accounts/add" accentColor="blue">
            Add account
          </Button>
          <Button link="/accounts/transfer" accentColor="blue">
            Transfer
          </Button>
        </ButtonGroup>
      </div>
      <div className="mt-12">
        <StackedList
          addiotinalLabel={getAddiotinalLabel(totalBalance)}
          label="Your accounts"
          rows={accounts}
        />
        <TransferList className="md:mt-6" />
      </div>
    </>
  );
};

const AccountsContainer = (): JSX.Element => {
  const [accountsReader] = useAsyncResource(getAllAccounts, []);

  return (
    <Suspense fallback={<Loader loaderColor="blue" />}>
      <Accounts accountsReader={accountsReader} />
    </Suspense>
  );
};

export default AccountsContainer;
