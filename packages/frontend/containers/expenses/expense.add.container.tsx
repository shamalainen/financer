import { useMemo } from 'react';
import { useDispatch } from 'react-redux';

import {
  CreateExpenseDto,
  TransactionType,
  useExpensesCreateMutation,
  useTransactionTemplatesFindOneQuery,
} from '$api/generated/financerApi';
import { DataHandler } from '$blocks/data-handler/data-handler';
import { ToastMessageTypes } from '$blocks/toast/toast';
import { TransactionForm } from '$blocks/transaction-form/transaction-form';
import { TransactionTemplateSwitcher } from '$blocks/transaction-template-switcher/transaction-template-switcher';
import { useUserDefaultExpenseAccount } from '$hooks/settings/user-preference/useUserDefaultExpenseAccount';
import { useViewTransitionRouter } from '$hooks/useViewTransitionRouter';
import { addToastMessage } from '$reducer/notifications.reducer';
import { UpdatePageInfo } from '$renderers/seo/updatePageInfo';
import { parseErrorMessagesToArray } from '$utils/apiHelper';

interface ExpenseAddContainerProps {
  templateId?: string;
}

export const ExpenseAddContainer = ({
  templateId,
}: ExpenseAddContainerProps) => {
  const { push } = useViewTransitionRouter();
  const [addExpense] = useExpensesCreateMutation();
  const { data: defaultExpenseAccount } = useUserDefaultExpenseAccount({
    skip: !!templateId,
  });
  const dispatch = useDispatch();

  const templateData = useTransactionTemplatesFindOneQuery(
    { id: templateId as string },
    { skip: !templateId },
  );

  const { currentData: transactionTemplate } = templateData;

  const handleSubmit = async (createExpenseDto: CreateExpenseDto) => {
    try {
      const { _id: id } = await addExpense({
        createExpenseDto,
      }).unwrap();

      push(`/statistics/expenses/${id}`);
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
      return { fromAccount: defaultExpenseAccount };
    }
    const categories = transactionTemplate?.categories?.map((categoryId) => ({
      categoryId,
      amount: NaN,
    }));

    return {
      ...transactionTemplate,
      categories,
    };
  }, [defaultExpenseAccount, transactionTemplate]);

  return (
    <>
      <DataHandler skipNotFound {...templateData} />
      <UpdatePageInfo
        title="Add Expense"
        headerAction={
          <TransactionTemplateSwitcher
            selectedTemplate={templateId}
            templateType={TransactionType.Expense}
          />
        }
      />
      {(!templateId || transactionTemplate) && (
        <TransactionForm
          initialValues={initialValues}
          onSubmit={handleSubmit}
          hasFromAccountField
        />
      )}
    </>
  );
};
