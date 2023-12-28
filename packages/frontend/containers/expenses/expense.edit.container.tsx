import { useCallback, useMemo } from 'react';
import { useDispatch } from 'react-redux';

import {
  UpdateExpenseDto,
  useExpensesFindOneQuery,
  useExpensesRemoveMutation,
  useExpensesUpdateMutation,
} from '$api/generated/financerApi';
import { DataHandler } from '$blocks/data-handler/data-handler';
import { ToastMessageTypes } from '$blocks/toast/toast';
import { TransactionDelete } from '$blocks/transaction-delete/transaction-delete';
import { TransactionForm } from '$blocks/transaction-form/transaction-form';
import { useViewTransitionRouter } from '$hooks/useViewTransitionRouter';
import { addToastMessage } from '$reducer/notifications.reducer';
import { UpdatePageInfo } from '$renderers/seo/updatePageInfo';
import { parseErrorMessagesToArray } from '$utils/apiHelper';
import { DateFormat, formatDate } from '$utils/formatDate';

interface EditExpenseContainerProps {
  id: string;
}

export const EditExpenseContainer = ({ id }: EditExpenseContainerProps) => {
  const { push } = useViewTransitionRouter();
  const expenseData = useExpensesFindOneQuery({ id });
  const { data: expense } = expenseData;
  const [editExpense] = useExpensesUpdateMutation();
  const [deleteExpense] = useExpensesRemoveMutation();
  const dispatch = useDispatch();

  const handleSubmit = async (updateExpenseDto: UpdateExpenseDto) => {
    if (!id) {
      console.error('Failed to edit expense: no id');
      return;
    }
    try {
      await editExpense({
        updateExpenseDto,
        id,
      }).unwrap();

      push(`/statistics/expenses/${expense?.id}`);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      if (error.status === 400 || error.status === 404) {
        dispatch(
          addToastMessage({
            type: ToastMessageTypes.ERROR,
            message: 'Submission failed',
            additionalInformation: parseErrorMessagesToArray(
              error?.data?.message,
            ),
          }),
        );
        return;
      }

      // eslint-disable-next-line no-console
      console.error(error);
    }
  };

  const handleDelete = useCallback(async () => {
    if (!id) {
      console.error('Failed to delete expense: no id');
      return;
    }
    await deleteExpense({ id }).unwrap();
    push('/statistics');
  }, [deleteExpense, id, push]);

  const initialValues = useMemo(() => {
    if (!expense) return undefined;

    return {
      ...expense,
      date: formatDate(new Date(expense.date), DateFormat.input),
    };
  }, [expense]);

  return (
    <>
      <DataHandler {...expenseData} />
      <UpdatePageInfo
        title={`Edit ${expense?.description}`}
        backLink={`/statistics/expenses/${expense?.id}`}
        headerAction={<TransactionDelete onDelete={handleDelete} />}
      />
      {expense && (
        <TransactionForm
          initialValues={initialValues}
          onSubmit={handleSubmit}
          hasFromAccountField
        />
      )}
    </>
  );
};
