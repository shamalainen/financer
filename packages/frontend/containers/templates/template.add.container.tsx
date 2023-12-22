import { useDispatch } from 'react-redux';

import { useTransactionTemplatesCreateMutation } from '$api/generated/financerApi';
import { ToastMessageTypes } from '$blocks/toast/toast';
import { settingsPaths } from '$constants/settings-paths';
import { useViewTransitionRouter } from '$hooks/useViewTransitionRouter';
import {
  TemplateAdd,
  CreateTransactionTemplateDtoWithCategory,
} from '$pages/settings/templates/template.add';
import { addToastMessage } from '$reducer/notifications.reducer';
import { parseErrorMessagesToArray } from '$utils/apiHelper';

export const TemplateAddContainer = () => {
  const { push } = useViewTransitionRouter();

  const [addTransactionTemplate] = useTransactionTemplatesCreateMutation();
  const dispatch = useDispatch();

  const handleSubmit = async (
    newTransactionTemplateData: CreateTransactionTemplateDtoWithCategory,
  ) => {
    const data = {
      ...newTransactionTemplateData,
      categories: newTransactionTemplateData.categories?.map(
        ({ categoryId }) => categoryId,
      ),
    };

    try {
      await addTransactionTemplate({
        createTransactionTemplateDto: data,
      }).unwrap();

      push(settingsPaths.templates);
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

  return <TemplateAdd onSubmit={handleSubmit} />;
};
