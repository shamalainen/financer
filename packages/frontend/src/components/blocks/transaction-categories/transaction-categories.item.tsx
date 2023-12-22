import { useFormContext } from 'react-hook-form';

import { FieldArrayFields } from './transaction-categories';

import { Icon, IconName } from '$elements/icon/icon';

type TransactionCategoriesItemProps = {
  index: number;
  onClick: () => void;
  getCategoryNameById: (categoryId: string) => string;
};

export const TransactionCategoriesItem = ({
  index,
  onClick,
  getCategoryNameById,
}: TransactionCategoriesItemProps) => {
  const { watch, getValues } = useFormContext<FieldArrayFields>();
  const values = watch(`categories.${index}`);

  const transactionCategory = getCategoryNameById(
    getValues(`categories.${index}.categoryId`),
  );

  const { description, amount } = getValues(`categories.${index}`);

  const isEmptyCategory = isNaN(parseInt(`${values.amount}`));

  const categoryAmount = isEmptyCategory ? '-' : amount;

  const testId = `transaction-categories-item`;

  return (
    <li
      className="grid grid-cols-[1fr,auto] items-center relative py-2"
      data-testid={testId}
    >
      <span className="grid">
        <span className="font-medium truncate" data-testid={`${testId}-name`}>
          {transactionCategory}
        </span>
        <span className="truncate">
          <span>
            <span className="sr-only">Amount: </span>
            <span data-testid={`${testId}-amount`}>{categoryAmount}</span> €
          </span>
          {description && (
            <>
              {' - '}
              <span>
                <span className="sr-only">Description: </span>
                <span data-testid={`${testId}-description`}>{description}</span>
              </span>
            </>
          )}
        </span>
      </span>
      <button
        onClick={onClick}
        type="button"
        className="inline-flex items-center justify-center -mr-3 h-11 w-11"
        data-testid={`${testId}-edit`}
      >
        <span className="sr-only">Edit category</span>
        <span className="absolute inset-0" aria-hidden="true" />
        <Icon type={IconName.pencilSquare} />
      </button>
    </li>
  );
};
