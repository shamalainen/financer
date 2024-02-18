import { useCallback, useEffect, useState } from 'react';
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';

import { TransactionCategoriesForm } from './transaction-categories.form';
import { TransactionCategoriesItem } from './transaction-categories.item';

import { Drawer } from '$blocks/drawer/drawer';
import { Button } from '$elements/button/button';
import { Option } from '$elements/select/select';
import { useGetAllTransactionCategoriesWithCategoryTree } from '$hooks/transactionCategories/useGetAllTransactionCategoriesWithCategoryTree';

interface TransactionCategoriesProps {
  className?: string;
  transactionCategories: Option[];
  testId?: string;
  categorySelectOnly?: boolean;
}

export interface TransactionCategoriesFormFields {
  description?: string;
  categoryId: string;
  amount: number;
}

export interface FieldArrayFields {
  categories: TransactionCategoriesFormFields[];
}

const defaultSelectedIndex = -1;

export const TransactionCategories = ({
  transactionCategories,
  testId = 'transaction-categories',
  categorySelectOnly,
}: TransactionCategoriesProps): JSX.Element => {
  const [selectedIndex, setSelectedIndex] = useState(defaultSelectedIndex);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const { data: transactionCategoriesRaw } =
    useGetAllTransactionCategoriesWithCategoryTree();

  const getCategoryNameById = useCallback(
    (categoryId: string) =>
      transactionCategoriesRaw?.find((category) => category.id === categoryId)
        ?.categoryTree || categoryId,
    [transactionCategoriesRaw],
  );

  const { getValues, setValue, reset } = useFormContext<FieldArrayFields>();

  const { fields, remove, update } = useFieldArray<FieldArrayFields>({
    name: 'categories',
  });

  const transactionAmount = useWatch({ name: 'amount' });

  const isNewCategory = !fields[selectedIndex];

  const totalAllocatedAmount = fields
    .map(({ amount }) => amount || 0)
    .reduce((current, previous) => current + previous, 0);

  const addNewCategory = () => {
    setSelectedIndex(fields.length);
    setIsFormOpen(true);
  };

  const isEmptyCategory = (index: number) =>
    isNaN(parseInt(`${getValues(`categories.${index}`).amount}`));

  const setUnallocatedAmount = () => {
    const unallocatedAmount =
      transactionAmount - totalAllocatedAmount + (0 || 0);
    setValue(`categories.${selectedIndex}.amount`, unallocatedAmount);
  };

  const onClose = () => {
    if (isNewCategory) {
      remove(selectedIndex);
    }

    setIsFormOpen(false);
    setSelectedIndex(defaultSelectedIndex);
  };

  const handleDelete = async () => {
    setIsFormOpen(false);

    setTimeout(() => {
      remove(selectedIndex);
    }, 100);
  };

  const handleSubmit = () => {
    // @todo: some kind of input error needed.
    if (isEmptyCategory(selectedIndex) && !categorySelectOnly) {
      return;
    }

    const values = getValues(`categories.${selectedIndex}`);
    update(selectedIndex, values);
    setIsFormOpen(false);
  };

  const handleCategoryItemClick = (index: number) => {
    setSelectedIndex(index);
    setIsFormOpen(true);
  };

  useEffect(() => {
    if (!categorySelectOnly) return;

    setSelectedIndex(defaultSelectedIndex);
    reset((oldValues) => ({ ...oldValues, categories: [] }));
  }, [categorySelectOnly, reset, transactionCategories]);

  return (
    <>
      <Button
        onClick={addNewCategory}
        accentColor="plain"
        isDisabled={!transactionAmount || transactionAmount < 0}
        testId="add-category-button"
      >
        Add category
      </Button>
      <Drawer
        isOpen={isFormOpen}
        onClose={onClose}
        heading={!isNewCategory ? 'Edit category item' : 'Add category item'}
      >
        <TransactionCategoriesForm
          testId={testId}
          index={selectedIndex}
          categories={transactionCategories}
          categorySelectOnly={categorySelectOnly}
          maxAmount={transactionAmount}
          isNewCategory={isNewCategory}
          setUnallocatedAmount={setUnallocatedAmount}
          handleCancel={onClose}
          handleSubmit={handleSubmit}
          handleDelete={handleDelete}
        />
      </Drawer>
      {!!fields.length && (
        <ul className="mt-4 divide-y divide-gray-dark">
          {fields.map(({ id }, index) => (
            <TransactionCategoriesItem
              key={id}
              index={index}
              onClick={() => handleCategoryItemClick(index)}
              getCategoryNameById={getCategoryNameById}
            />
          ))}
        </ul>
      )}
    </>
  );
};
