import { settingsPaths } from '$constants/settings-paths';
import {
  useUserTransactionListChunkSize,
  useUpdateUserTransactionListChunkSize,
} from '$hooks/settings/user-preference/useUserTransactionListChunkSize';
import { useViewTransitionRouter } from '$hooks/useViewTransitionRouter';
import {
  UserTransactionListChunkSize,
  UserTransactionListChunkSizeFormFields,
} from '$pages/settings/user-preferences/preferences/user-transaction-list-chunk-size';

export const MaximumItemsPerPageContainer = () => {
  const { push } = useViewTransitionRouter();
  const { data: defaultChunkSize, isLoading: isLoadingDefault } =
    useUserTransactionListChunkSize();

  const [setDefaultChunkSize, { isLoading: isUpdating }] =
    useUpdateUserTransactionListChunkSize();

  const handleSave = async (
    newUserTransactionListChunkSizeData: UserTransactionListChunkSizeFormFields
  ) => {
    const { chunkSize } = newUserTransactionListChunkSizeData;

    await setDefaultChunkSize(chunkSize);

    push(settingsPaths.userPreferences);
  };

  return (
    <UserTransactionListChunkSize
      defaultChunkSize={defaultChunkSize}
      isLoading={isLoadingDefault}
      isUpdating={isUpdating}
      onSave={handleSave}
    />
  );
};
