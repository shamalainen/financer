import { useMemo } from 'react';
import { useDispatch } from 'react-redux';

import {
  CreateTransferDto,
  useTransfersCreateMutation,
  useTransactionTemplatesFindOneQuery,
  TransactionType,
} from '$api/generated/financerApi';
import { DataHandler } from '$blocks/data-handler/data-handler';
import { ToastMessageTypes } from '$blocks/toast/toast';
import { TransactionForm } from '$blocks/transaction-form/transaction-form';
import { TransactionTemplateSwitcher } from '$blocks/transaction-template-switcher/transaction-template-switcher';
import { useUserDefaultTransferSourceAccount } from '$hooks/settings/user-preference/useUserDefaultTransferSourceAccount';
import { useUserDefaultTransferTargetAccount } from '$hooks/settings/user-preference/useUserDefaultTransferTargetAccount';
import { useViewTransitionRouter } from '$hooks/useViewTransitionRouter';
import { addToastMessage } from '$reducer/notifications.reducer';
import { UpdatePageInfo } from '$renderers/seo/updatePageInfo';
import { parseErrorMessagesToArray } from '$utils/apiHelper';

interface TransferAddContainerProps {
  templateId?: string;
}

export const TransferAddContainer = ({
  templateId,
}: TransferAddContainerProps) => {
  const { push } = useViewTransitionRouter();
  const [addTransfer] = useTransfersCreateMutation();
  const { data: defaultTransferSourceAccount } =
    useUserDefaultTransferSourceAccount({ skip: !!templateId });
  const { data: defaultTransferTargetAccount } =
    useUserDefaultTransferTargetAccount({ skip: !!templateId });

  const dispatch = useDispatch();

  const templateData = useTransactionTemplatesFindOneQuery(
    { id: templateId as string },
    { skip: !templateId },
  );

  const { data: transactionTemplate } = templateData;

  const handleSubmit = async (createTransferDto: CreateTransferDto) => {
    try {
      const { id } = await addTransfer({
        createTransferDto,
      }).unwrap();

      push(`/statistics/transfers/${id}`);
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

  const initialValues = useMemo(() => {
    if (!transactionTemplate) {
      return {
        fromAccount: defaultTransferSourceAccount,
        toAccount: defaultTransferTargetAccount,
      };
    }
    const categories = transactionTemplate?.categories?.map((categoryId) => ({
      categoryId: categoryId,
      amount: NaN,
    }));

    return {
      ...transactionTemplate,
      categories,
    };
  }, [
    defaultTransferSourceAccount,
    defaultTransferTargetAccount,
    transactionTemplate,
  ]);

  return (
    <>
      <DataHandler skipNotFound {...templateData} />
      <UpdatePageInfo
        title="Add Transfer"
        headerAction={
          <TransactionTemplateSwitcher
            selectedTemplate={templateId}
            templateType={TransactionType.Transfer}
          />
        }
      />
      {(!templateId || transactionTemplate) && (
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
