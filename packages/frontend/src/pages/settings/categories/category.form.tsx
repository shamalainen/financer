import React, { useEffect, useMemo, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';

import { getAllChildCategoryIds } from '../../../services/TransactionCategoriesService';

import { VisibilityType } from '$api/generated/financerApi';
import { Form } from '$blocks/form/form';
import { settingsPaths } from '$constants/settings-paths';
import { Checkbox } from '$elements/checkbox/checkbox';
import { CheckboxGroup } from '$elements/checkbox/checkbox.group';
import { Input } from '$elements/input/input';
import { Select, Option } from '$elements/select/select';
import { useGetAllTransactionCategoriesWithCategoryTree } from '$hooks/transactionCategories/useGetAllTransactionCategoriesWithCategoryTree';

interface CategoryFormProps {
  onSubmit: SubmitHandler<TransactionCategoryFormFields>;
  submitLabel: string;
  optionalFooterComponent?: React.ReactNode;
  currentCategoryId?: string;
  initialValues?: Partial<TransactionCategoryFormFields>;
}

export interface TransactionCategoryFormFields {
  name: string;
  visibility: VisibilityType[];
  parent_category_id: string | null;
}

export const CategoryForm = ({
  onSubmit,
  submitLabel,
  optionalFooterComponent,
  currentCategoryId,
  initialValues,
}: CategoryFormProps): JSX.Element | null => {
  const defaultValues = useMemo(() => {
    return {
      ...initialValues,
      parent_category_id: initialValues?.parent_category_id ?? '',
    };
  }, [initialValues]);

  const methods = useForm<TransactionCategoryFormFields>({
    defaultValues,
  });

  const { reset } = methods;

  const { data: transactionCategoriesRaw } =
    useGetAllTransactionCategoriesWithCategoryTree();
  const [transactionCategories, setTransactionCategories] =
    useState<Option[]>();

  useEffect(() => {
    if (!transactionCategoriesRaw) return;

    const forbiddenIds = currentCategoryId
      ? getAllChildCategoryIds(
          currentCategoryId,
          transactionCategoriesRaw,
        ).concat(currentCategoryId)
      : [];

    setTransactionCategories([
      ...transactionCategoriesRaw
        .filter(({ _id }) => !forbiddenIds.includes(_id))
        .map(({ _id, categoryTree: transactionCategoryName }) => ({
          value: _id,
          label: transactionCategoryName,
        })),
    ]);
  }, [currentCategoryId, transactionCategoriesRaw]);

  useEffect(() => {
    if (!initialValues) return;

    reset((previousValues) => ({
      ...previousValues,
      ...defaultValues,
    }));
  }, [defaultValues, initialValues, reset]);

  if (!transactionCategories) return null;

  return (
    <Form
      methods={methods}
      submitLabel={submitLabel}
      onSubmit={onSubmit}
      formFooterBackLink={settingsPaths.categories}
      optionalFooterComponent={optionalFooterComponent}
    >
      <div className="grid gap-4">
        <Input id="name" isRequired>
          Name
        </Input>
        <CheckboxGroup testId="visibility-checkboxes" className="-mx-4">
          <Checkbox
            id="incomeVisible"
            name="visibility"
            label="Income"
            value={VisibilityType.Income}
          />
          <Checkbox
            id="expenseVisible"
            name="visibility"
            label="Expense"
            value={VisibilityType.Expense}
          />
          <Checkbox
            id="transferVisible"
            name="visibility"
            label="Transfer"
            value={VisibilityType.Transfer}
          />
        </CheckboxGroup>
        <Select
          id="parent_category_id"
          options={transactionCategories}
          placeholder="None"
        >
          Parent transaction category
        </Select>
      </div>
    </Form>
  );
};
