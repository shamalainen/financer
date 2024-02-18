import { AccountForm, AccountFormFields } from './account.form';

import { AccountDto } from '$api/generated/financerApi';
import { DeleteAccountContainer } from '$container/accounts/account.delete.container';
import { UpdatePageInfo } from '$renderers/seo/updatePageInfo';

interface EditAccountParams {
  account: AccountDto;
  onSave: (newAccountData: AccountFormFields) => Promise<void>;
}

export const AccountEdit = ({
  account,
  onSave,
}: EditAccountParams): JSX.Element => {
  return (
    <>
      <UpdatePageInfo
        title={`Edit ${account.name}`}
        backLink={`/accounts/${account.id}`}
        headerAction={<DeleteAccountContainer id={account.id} />}
      />
      <AccountForm
        onSubmit={onSave}
        submitLabel="Update"
        initialValues={account}
      />
    </>
  );
};
