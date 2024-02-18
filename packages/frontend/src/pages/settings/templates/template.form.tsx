import { useEffect, useMemo } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';

import {
  TransactionTemplateType,
  TransactionType,
  useAccountsFindAllByUserQuery,
  VisibilityType,
} from '$api/generated/financerApi';
import { Form } from '$blocks/form/form';
import {
  TransactionCategories,
  TransactionCategoriesFormFields,
} from '$blocks/transaction-categories/transaction-categories';
import { Input } from '$elements/input/input';
import { Select, Option } from '$elements/select/select';
import { useGetAllTransactionCategoriesWithCategoryTree } from '$hooks/transactionCategories/useGetAllTransactionCategoriesWithCategoryTree';
import { capitalize } from '$utils/capitalize';

interface TemplateFormProps {
  onSubmit: SubmitHandler<TemplateFormFields>;
  submitLabel: string;
  optionalFooterComponent?: React.ReactNode;
  initialValues?: Partial<TemplateFormFields>;
}

export interface TemplateFormFields {
  templateName: string;
  templateType: TransactionTemplateType;
  templateVisibility: TransactionType;
  description: string;
  amount: number;
  fromAccount?: string;
  toAccount?: string;
  dayOfMonth?: number;
  dayOfMonthToCreate?: number;
  categories: TransactionCategoriesFormFields[];
}

const TransactionCategoriesFormWrapper = ({
  type,
}: {
  type: VisibilityType;
}): JSX.Element | null => {
  const { data: transactionCategoriesRaw } =
    useGetAllTransactionCategoriesWithCategoryTree({
      visibilityType: type as unknown as VisibilityType,
    });

  const transactionCategories: Option[] = useMemo(() => {
    if (!transactionCategoriesRaw) return [];

    return transactionCategoriesRaw.map(({ id, categoryTree }) => ({
      value: id,
      label: categoryTree,
    }));
  }, [transactionCategoriesRaw]);

  return (
    <TransactionCategories
      className="my-8 space-y-8"
      categorySelectOnly
      transactionCategories={transactionCategories}
    />
  );
};

export const TemplateForm = ({
  onSubmit,
  submitLabel,
  optionalFooterComponent,
  initialValues,
}: TemplateFormProps): JSX.Element | null => {
  const methods = useForm<TemplateFormFields>({
    defaultValues: initialValues,
  });

  const { watch, reset } = methods;

  const templateType = watch('templateType');
  const templateVisibility = watch('templateVisibility');

  const initialTemplateType =
    TransactionTemplateType[
      capitalize(
        initialValues?.templateType?.[0] ?? 'manual',
      ) as keyof typeof TransactionTemplateType
    ];

  const { data: accounts } = useAccountsFindAllByUserQuery({});

  const accountOptions = useMemo(() => {
    if (!accounts) return [];
    return accounts.data.map(({ id, name }) => ({
      value: id,
      label: name,
    }));
  }, [accounts]);

  const handleSubmit = async (data: TemplateFormFields) => {
    onSubmit(data);
  };

  const selectedTransactionType = useMemo(() => {
    if (templateVisibility === TransactionType.Income)
      return VisibilityType.Income;
    if (templateVisibility === TransactionType.Expense)
      return VisibilityType.Expense;

    return VisibilityType.Transfer;
  }, [templateVisibility]);

  const templateTypes = (
    Object.keys(
      TransactionTemplateType,
    ) as (keyof typeof TransactionTemplateType)[]
  ).map((type) => ({
    value: TransactionTemplateType[type],
    label: capitalize(TransactionTemplateType[type]),
  }));

  const transactionTypes = (
    Object.keys(TransactionType) as (keyof typeof TransactionType)[]
  ).map((type) => ({
    value: TransactionType[type],
    label: capitalize(TransactionType[type]),
  }));

  useEffect(() => {
    if (!initialValues) return;

    reset((previousValues) => ({
      ...previousValues,
      ...initialValues,
      templateType: initialTemplateType,
    }));
  }, [initialTemplateType, initialValues, reset]);

  return (
    <Form
      methods={methods}
      submitLabel={submitLabel}
      onSubmit={handleSubmit}
      formFooterBackLink="/"
      optionalFooterComponent={optionalFooterComponent}
    >
      <section>
        <div className="grid gap-4 sm:grid-cols-2">
          <Select id="templateType" options={templateTypes} isRequired>
            Template type
          </Select>
          <Select id="templateVisibility" options={transactionTypes} isRequired>
            Transaction type
          </Select>
          <Input id="templateName" isRequired>
            Template name
          </Input>
          <Input id="description">Description</Input>
          <Input id="amount" type="number" min={0.01} step={0.01}>
            Amount
          </Input>
          {(templateVisibility === TransactionType.Expense ||
            templateVisibility === TransactionType.Transfer) && (
            <Select id="fromAccount" options={accountOptions} isRequired>
              From Account
            </Select>
          )}
          {(templateVisibility === TransactionType.Income ||
            templateVisibility === TransactionType.Transfer) && (
            <Select id="toAccount" options={accountOptions} isRequired>
              To Account
            </Select>
          )}
          {templateType === TransactionTemplateType.Auto && (
            <>
              <Input id="dayOfMonth" type="number" min={1} max={31}>
                Day of month for transaction
              </Input>
              <Input id="dayOfMonthToCreate" type="number" min={1} max={31}>
                Day of month to create
              </Input>
            </>
          )}
        </div>
      </section>
      <section className="mt-8">
        <h2 className="sr-only">Categories</h2>
        <TransactionCategoriesFormWrapper type={selectedTransactionType} />
      </section>
    </Form>
  );
};
