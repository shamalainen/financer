import { useMemo } from 'react';
import { useDispatch } from 'react-redux';

import {
  CreateIncomeDto,
  TransactionType,
  useIncomesCreateMutation,
  useTransactionTemplatesFindOneQuery,
} from '$api/generated/financerApi';
import { DataHandler } from '$blocks/data-handler/data-handler';
import { ToastMessageTypes } from '$blocks/toast/toast';
import { TransactionForm } from '$blocks/transaction-form/transaction-form';
import { TransactionTemplateSwitcher } from '$blocks/transaction-template-switcher/transaction-template-switcher';
import { useUserDefaultIncomeAccount } from '$hooks/settings/user-preference/useUserDefaultIncomeAccount';
import { useViewTransitionRouter } from '$hooks/useViewTransitionRouter';
import { addToastMessage } from '$reducer/notifications.reducer';
import { UpdatePageInfo } from '$renderers/seo/updatePageInfo';
import { parseErrorMessagesToArray } from '$utils/apiHelper';

interface IncomeAddContainerProps {
  templateId?: string;
}

export const IncomeAddContainer = ({ templateId }: IncomeAddContainerProps) => {
  const { push } = useViewTransitionRouter();
  const [addIncome] = useIncomesCreateMutation();
  const { data: defaultIncomeAccount } = useUserDefaultIncomeAccount({
    skip: !!templateId,
  });
  const dispatch = useDispatch();

  const templateData = useTransactionTemplatesFindOneQuery(
    { id: templateId as string },
    { skip: !templateId },
  );

  const { data: transactionTemplate } = templateData;

  const handleSubmit = async (createIncomeDto: CreateIncomeDto) => {
    try {
      const { _id: id } = await addIncome({ createIncomeDto }).unwrap();

      push(`/statistics/incomes/${id}`);
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
      return { toAccount: defaultIncomeAccount };
    }
    const categories = transactionTemplate?.categories?.map((categoryId) => ({
      category_id: categoryId,
      amount: NaN,
    }));

    return {
      ...transactionTemplate,
      categories,
    };
  }, [defaultIncomeAccount, transactionTemplate]);

  return (
    <>
      <DataHandler skipNotFound {...templateData} />
      <UpdatePageInfo
        title="Add Income"
        headerAction={
          <TransactionTemplateSwitcher
            selectedTemplate={templateId}
            templateType={TransactionType.Income}
          />
        }
      />
      {(!templateId || transactionTemplate) && (
        <TransactionForm
          initialValues={initialValues}
          onSubmit={handleSubmit}
          hasToAccountField
        />
      )}
    </>
  );
};
