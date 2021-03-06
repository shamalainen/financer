import React from "react";
import Form from "../../components/form/form";
import Input from "../../components/input/input";
import Select, { IOption } from "../../components/select/select";
import Alert from "../../components/alert/alert";

interface IProps {
  errors: string[];
  name?: string;
  balance?: number;
  type?: string;
  onSubmit(account: IAccount): void;
  formHeading: string;
  submitLabel: string;
}

const AccountForm = ({
  errors,
  name = "",
  balance = NaN,
  type = "savings",
  onSubmit,
  formHeading,
  submitLabel,
}: IProps): JSX.Element => {
  const accountTypes: IOption[] = [
    {
      value: "cash",
      label: "Cash",
    },
    {
      value: "savings",
      label: "Savings",
    },
    {
      value: "investment",
      label: "Investment",
    },
    {
      value: "credit",
      label: "Credit",
    },
    {
      value: "loan",
      label: "Loan",
    },
  ];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSubmit = async (event: any) => {
    event.preventDefault();
    const { account, amount, type: newType } = event.target;
    const newAccountData: IAccount = {
      balance: parseFloat((amount.value as string).replace(",", ".")),
      name: account.value,
      type: newType.value,
    };

    onSubmit(newAccountData);
  };

  return (
    <>
      {errors.length > 0 && (
        <Alert additionalInformation={errors}>
          There were {errors.length} errors with your submission
        </Alert>
      )}
      <Form
        submitLabel={submitLabel}
        formHeading={formHeading}
        handleSubmit={handleSubmit}
        accentColor="blue"
      >
        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
          <Input
            id="account"
            help="Name of account, e.g. bank account."
            isRequired
            value={name}
          >
            Account
          </Input>
          <Input
            id="amount"
            help="Amount of savings in the account."
            isCurrency
            isRequired
            value={Number.isNaN(balance) ? "" : balance}
          >
            Amount
          </Input>
          <Select
            id="type"
            options={accountTypes}
            defaultValue={type}
            isRequired
          >
            Account type
          </Select>
        </div>
      </Form>
    </>
  );
};

export default AccountForm;
