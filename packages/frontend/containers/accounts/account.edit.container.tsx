import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import {
  useAccountsUpdateMutation,
  useAccountsFindOneByIdQuery,
} from '$api/generated/financerApi';
import { DataHandler } from '$blocks/data-handler/data-handler';
import { ToastMessageTypes } from '$blocks/toast/toast';
import { useViewTransitionRouter } from '$hooks/useViewTransitionRouter';
import { AccountEdit } from '$pages/accounts/account.edit';
import { AccountFormFields } from '$pages/accounts/account.form';
import { addToastMessage } from '$reducer/notifications.reducer';

interface AccountEditContainerProps {
  id: string;
}

export const AccountEditContainer = ({ id }: AccountEditContainerProps) => {
  const { push } = useViewTransitionRouter();
  const [editAccount] = useAccountsUpdateMutation();

  const data = useAccountsFindOneByIdQuery({ id });
  const account = data.data;
  const dispatch = useDispatch();

  const handleSubmit = useCallback(
    async (newAccountData: AccountFormFields) => {
      if (!account?.id) {
        dispatch(
          addToastMessage({
            type: ToastMessageTypes.ERROR,
            message: 'Submission failed',
            additionalInformation: 'Account not found',
          }),
        );
        return;
      }

      try {
        const newAccount = await editAccount({
          id: account.id,
          updateAccountDto: newAccountData,
        });

        if ('message' in newAccount) {
          dispatch(
            addToastMessage({
              type: ToastMessageTypes.ERROR,
              message: 'Submission failed',
              additionalInformation: newAccount?.message as string,
            }),
          );
          return;
        }

        push(`/accounts/${id}`);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error);
      }
    },
    [account?.id, dispatch, editAccount, id, push],
  );

  return (
    <>
      <DataHandler {...data} />
      {account && <AccountEdit account={account} onSave={handleSubmit} />}
    </>
  );
};
