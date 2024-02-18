import { useDispatch } from 'react-redux';

import {
  CreateTransactionCategoryDto,
  useTransactionCategoriesCreateMutation,
} from '$api/generated/financerApi';
import { ToastMessageTypes } from '$blocks/toast/toast';
import { settingsPaths } from '$constants/settings-paths';
import { useViewTransitionRouter } from '$hooks/useViewTransitionRouter';
import { CategoryAdd } from '$pages/settings/categories/category.add';
import { addToastMessage } from '$reducer/notifications.reducer';
import { parseErrorMessagesToArray } from '$utils/apiHelper';

export const CategoryAddContainer = () => {
  const { push } = useViewTransitionRouter();
  const [addTransactionCategory] = useTransactionCategoriesCreateMutation();
  const dispatch = useDispatch();

  const handleSubmit = async (
    newTransactionCategoryData: CreateTransactionCategoryDto,
  ) => {
    try {
      await addTransactionCategory({
        createTransactionCategoryDto: {
          ...newTransactionCategoryData,
          visibility: newTransactionCategoryData.visibility || [],
          parentCategoryId: newTransactionCategoryData.parentCategoryId || null,
        },
      }).unwrap();

      push(settingsPaths.categories);
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
  return <CategoryAdd onSubmit={handleSubmit} />;
};
