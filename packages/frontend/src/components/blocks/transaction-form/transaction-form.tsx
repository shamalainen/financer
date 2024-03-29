import { useEffect, useMemo, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';

import {
  VisibilityType2Enum,
  VisibilityTypeEnum,
  useAccountsFindAllByUserQuery,
} from '$api/generated/financerApi';
import { Form } from '$blocks/form/form';
import {
  TransactionCategories,
  TransactionCategoriesFormFields,
} from '$blocks/transaction-categories/transaction-categories';
import { Input } from '$elements/input/input';
import { Option, Select } from '$elements/select/select';
import { useGetAllTransactionCategoriesWithCategoryTree } from '$hooks/transactionCategories/useGetAllTransactionCategoriesWithCategoryTree';
import { DateFormat, formatDate } from '$utils/formatDate';

interface TransactionFormProps {
  hasFromAccountField?: boolean;
  hasToAccountField?: boolean;
  initialValues?: Partial<TransactionFormFields>;
  onSubmit: SubmitHandler<TransactionFormFields>;
}
export interface TransactionFormFields {
  amount: number;
  description: string;
  date: string;
  categories: TransactionCategoriesFormFields[];
  toAccount: string;
  fromAccount: string;
}

export const TransactionForm = ({
  hasFromAccountField,
  hasToAccountField,
  initialValues,
  onSubmit,
}: TransactionFormProps) => {
  const defaultValues = useMemo(
    () => ({
      date: formatDate(new Date(), DateFormat.input),
      ...initialValues,
      toAccount: initialValues?.toAccount || '',
      fromAccount: initialValues?.fromAccount || '',
    }),
    [initialValues]
  );

  const methods = useForm<TransactionFormFields>({
    defaultValues,
  });

  const { reset } = methods;

  const { data: accounts } = useAccountsFindAllByUserQuery({});

  const accountOptions = useMemo(() => {
    if (!accounts) return [];
    return accounts.data.map(({ _id, name }) => ({
      value: _id,
      label: name,
    }));
  }, [accounts]);

  const visibilityType = useMemo(() => {
    if (hasToAccountField && hasFromAccountField) {
      return VisibilityTypeEnum.Transfer;
    }

    if (hasToAccountField && !hasFromAccountField) {
      return VisibilityTypeEnum.Income;
    }

    if (hasFromAccountField && !hasToAccountField) {
      return VisibilityTypeEnum.Expense;
    }
  }, [
    hasFromAccountField,
    hasToAccountField,
  ]) as unknown as VisibilityType2Enum;

  const { data: transactionCategoriesRaw } =
    useGetAllTransactionCategoriesWithCategoryTree({
      visibilityType,
    });

  const [transactionCategories, setTransactionCategories] = useState<Option[]>(
    []
  );

  useEffect(() => {
    if (!transactionCategoriesRaw) return;

    setTransactionCategories(
      transactionCategoriesRaw.map(({ _id, categoryTree }) => ({
        value: _id,
        label: categoryTree,
      }))
    );
  }, [transactionCategoriesRaw]);

  useEffect(() => {
    if (!initialValues) return;

    reset((previousValues) => ({
      ...previousValues,
      ...defaultValues,
    }));
  }, [defaultValues, initialValues, reset]);

  if (!accounts) return null;

  return (
    <Form
      methods={methods}
      submitLabel={'Submit'}
      onSubmit={onSubmit}
      formFooterBackLink="/"
    >
      <section>
        <div className="grid gap-y-4 gap-x-4 sm:grid-cols-2">
          {hasFromAccountField && (
            <Select
              id="fromAccount"
              options={accountOptions}
              isRequired
              placeholder="Select account"
            >
              From Account
            </Select>
          )}
          {hasToAccountField && (
            <Select
              id="toAccount"
              options={accountOptions}
              isRequired
              placeholder="Select account"
            >
              To Account
            </Select>
          )}
          <Input id="amount" type="number" min={0.01} step={0.01} isRequired>
            Amount
          </Input>
          <Input id="description" isRequired>
            Description
          </Input>
          <Input id="date" type="datetime-local">
            Date
          </Input>
        </div>
      </section>
      {transactionCategories.length > 0 && (
        <section className="mt-8">
          <h2 className="sr-only">Categories</h2>
          <TransactionCategories
            className="my-8 space-y-8"
            transactionCategories={transactionCategories}
          />
        </section>
      )}
    </Form>
  );
};
