import { useCallback, useMemo } from 'react';
import { useDispatch } from 'react-redux';

import {
  UpdateIncomeDto,
  useIncomesFindOneQuery,
  useIncomesRemoveMutation,
  useIncomesUpdateMutation,
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

interface IncomeEditContainerProps {
  id: string;
}

export const IncomeEditContainer = ({ id }: IncomeEditContainerProps) => {
  const { push } = useViewTransitionRouter();
  const [deleteIncome] = useIncomesRemoveMutation();
  const incomeData = useIncomesFindOneQuery({ id });
  const { data: income } = incomeData;
  const [editIncome] = useIncomesUpdateMutation();
  const dispatch = useDispatch();

  const handleSubmit = async (updateIncomeDto: UpdateIncomeDto) => {
    if (!id) {
      console.error('Failed to edit income: no id');
      return;
    }
    try {
      await editIncome({
        updateIncomeDto,
        id,
      }).unwrap();

      push(`/statistics/incomes/${income?.id}`);
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
      console.error('Failed to delete income: no id');
      return;
    }
    await deleteIncome({ id }).unwrap();
    push('/statistics');
  }, [deleteIncome, id, push]);

  const initialValues = useMemo(() => {
    if (!income) return undefined;
    return {
      ...income,
      date: formatDate(new Date(income.date), DateFormat.input),
    };
  }, [income]);

  return (
    <>
      <DataHandler {...incomeData} />
      <UpdatePageInfo
        title={`Edit ${income?.description}`}
        backLink={`/statistics/incomes/${income?.id}`}
        headerAction={<TransactionDelete onDelete={handleDelete} />}
      />
      {income && (
        <TransactionForm
          initialValues={initialValues}
          onSubmit={handleSubmit}
          hasToAccountField
        />
      )}
    </>
  );
};
