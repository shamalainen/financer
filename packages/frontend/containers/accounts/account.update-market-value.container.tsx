import { CreateTransactionCategoryMappingDtoWithoutTransaction } from '@local/types';
import { useDispatch } from 'react-redux';

import { AccountDto } from '$api/generated/financerApi';
import {
  useIncomesCreateMutation,
  useExpensesCreateMutation,
} from '$api/generated/financerApi';
import { ToastMessageTypes } from '$blocks/toast/toast';
import { useUserDefaultMarketUpdateSettings } from '$hooks/settings/user-preference/useDefaultMarketUpdateSettings';
import {
  AccountUpdateMarketValue,
  AccountUpdateMarketValueFormFields,
} from '$pages/accounts/account.update-market-value';
import { addToastMessage } from '$reducer/notifications.reducer';
import { parseErrorMessagesToArray } from '$utils/apiHelper';

interface AccountUpdateMarketValueContainerProps {
  account: AccountDto;
}

export const AccountUpdateMarketValueContainer = ({
  account,
}: AccountUpdateMarketValueContainerProps) => {
  const { data: marketSettings } = useUserDefaultMarketUpdateSettings();
  const [addIncome] = useIncomesCreateMutation();
  const [addExpense] = useExpensesCreateMutation();

  const dispatch = useDispatch();

  const { id, balance } = account;

  const handleUpdate =
    (closeDrawer: () => void) =>
    async (
      newAccountUpdateMarketValueData: AccountUpdateMarketValueFormFields,
    ) => {
      if (!id) {
        console.error('Failure to update market value: no id');
        return;
      }

      if (!account) {
        console.error(
          'Failure to update market value: no account data available',
        );
        return;
      }

      const { currentMarketValue, date } = newAccountUpdateMarketValueData;

      const transactionDescription =
        marketSettings?.transactionDescription ?? 'Market value change';
      const marketValueChangeAmount = currentMarketValue - account.balance;

      const mappedCategory: CreateTransactionCategoryMappingDtoWithoutTransaction =
        {
          amount: Math.abs(marketValueChangeAmount),
          description: transactionDescription,
          category_id:
            marketSettings?.category !== undefined
              ? marketSettings.category
              : '',
        };

      if (marketValueChangeAmount > 0) {
        try {
          const newIncomeJson = await addIncome({
            createIncomeDto: {
              toAccount: id,
              amount: marketValueChangeAmount,
              description: transactionDescription,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              date: (date ?? new Date()) as any,
              categories: (marketSettings?.category
                ? [mappedCategory]
                : // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  undefined) as any,
            },
          }).unwrap();

          if ('message' in newIncomeJson) {
            dispatch(
              addToastMessage({
                type: ToastMessageTypes.ERROR,
                message: 'Submission failed',
                additionalInformation: parseErrorMessagesToArray(
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  (newIncomeJson as any).message,
                ),
              }),
            );
            return;
          }
        } catch (transactionError) {
          // eslint-disable-next-line no-console
          console.error(transactionError);
        }
      } else if (marketValueChangeAmount < 0) {
        try {
          const newExpenseJson = await addExpense({
            createExpenseDto: {
              fromAccount: id,
              amount: Math.abs(marketValueChangeAmount),
              description: transactionDescription,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              date: (date ?? new Date()) as any,
              categories: (marketSettings?.category
                ? [mappedCategory]
                : // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  undefined) as any,
            },
          }).unwrap();

          if ('message' in newExpenseJson) {
            dispatch(
              addToastMessage({
                type: ToastMessageTypes.ERROR,
                message: 'Submission failed',
                additionalInformation: parseErrorMessagesToArray(
                  (newExpenseJson as any).message,
                ),
              }),
            );
            return;
          }
        } catch (transactionError) {
          // eslint-disable-next-line no-console
          console.error(transactionError);
        }
      } else {
        console.log('Current value is same as previous, no update needed.');
      }

      closeDrawer();
    };

  return (
    <AccountUpdateMarketValue currentValue={balance} onUpdate={handleUpdate} />
  );
};
