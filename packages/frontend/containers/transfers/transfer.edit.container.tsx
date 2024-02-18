import { useCallback, useMemo } from 'react';
import { useDispatch } from 'react-redux';

import {
  UpdateTransferDto,
  useTransfersFindOneQuery,
  useTransfersRemoveMutation,
  useTransfersUpdateMutation,
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

interface TransferEditContainerProps {
  id: string;
}

export const TransferEditContainer = ({ id }: TransferEditContainerProps) => {
  const { push } = useViewTransitionRouter();

  const transferData = useTransfersFindOneQuery({ id });
  const { data: transfer } = transferData;
  const [editTransfer] = useTransfersUpdateMutation();
  const [deleteTransfer] = useTransfersRemoveMutation();
  const dispatch = useDispatch();

  const handleSubmit = async (updateTransferDto: UpdateTransferDto) => {
    if (!id) {
      console.error('Failed to edit transfer: no id');
      return;
    }
    try {
      await editTransfer({
        updateTransferDto,
        id,
      }).unwrap();

      push(`/statistics/transfers/${transfer?.id}`);
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
      console.error('Failed to delete transfer: no id');
      return;
    }
    await deleteTransfer({ id }).unwrap();
    push('/statistics/transfers');
  }, [deleteTransfer, id, push]);

  const initialValues = useMemo(() => {
    if (!transfer) return undefined;
    return {
      ...transfer,
      date: formatDate(new Date(transfer.date), DateFormat.input),
    };
  }, [transfer]);

  return (
    <>
      <DataHandler {...transferData} />
      <UpdatePageInfo
        title={`Edit ${transfer?.description}`}
        backLink={`/statistics/transfer/${transfer?.id}`}
        headerAction={<TransactionDelete onDelete={handleDelete} />}
      />
      {transfer && (
        <TransactionForm
          initialValues={initialValues}
          onSubmit={handleSubmit}
          hasToAccountField
          hasFromAccountField
        />
      )}
    </>
  );
};
