import React, { Suspense, useEffect, useState } from "react";
import { DataOrModifiedFn, useAsyncResource } from "use-async-resource";
import { getAllTransferTranscations } from "../../services/TransactionService";
import { formatDate } from "../../utils/formatDate";
import formatCurrency from "../../utils/formatCurrency";
import { getAllAccounts } from "./AccountService";
import StackedList from "../../components/stacked-list/stacked-list";
import { ICustomStackedListRowProps } from "../../components/stacked-list/stacked-list.row";
import Loader from "../../components/loader/loader";

interface ITransferListContainerProps {
  className?: string;
}

interface ITransferListProps {
  className?: string;
  transfersReader: DataOrModifiedFn<IApiResponse<ITransaction[]>>;
  accountsReader: DataOrModifiedFn<IAccount[]>;
}

const TransferList = ({
  transfersReader,
  accountsReader,
  className = "",
}: ITransferListProps): JSX.Element => {
  const [transfers, setTransfers] = useState<ICustomStackedListRowProps[]>([]);
  const transferRaw = transfersReader().payload;
  const accounts = accountsReader();

  useEffect(() => {
    setTransfers(
      transferRaw
        .map(
          ({
            date: dateStr,
            amount,
            fromAccount,
            toAccount,
            _id,
          }): ICustomStackedListRowProps => {
            const date = new Date(dateStr);
            const fromAccountName =
              accounts.find(
                ({ _id: targetAccountId }) => targetAccountId === fromAccount
              )?.name || "unknown";
            const toAccountName =
              accounts.find(
                ({ _id: targetAccountId }) => targetAccountId === toAccount
              )?.name || "unknown";

            return {
              label: `${fromAccountName} --> ${toAccountName}`,
              additionalLabel: formatCurrency(amount),
              additionalInformation: [formatDate(date)],
              id: _id,
              date,
              tags: [
                {
                  label: "Transfer",
                  color: "blue",
                },
              ],
            };
          }
        )
        .sort((a, b) => (a.date > b.date ? -1 : 1))
    );
  }, [transferRaw, accounts]);

  return (
    <div className={className}>
      <StackedList label="Your transfers" rows={transfers} />
    </div>
  );
};

const TransferListContainer = ({
  className,
}: ITransferListContainerProps): JSX.Element => {
  const [transfersReader] = useAsyncResource(getAllTransferTranscations, []);
  const [accountsReader] = useAsyncResource(getAllAccounts, []);

  return (
    <Suspense fallback={<Loader loaderColor="blue" />}>
      <TransferList
        className={className}
        transfersReader={transfersReader}
        accountsReader={accountsReader}
      />
    </Suspense>
  );
};

export default TransferListContainer;
