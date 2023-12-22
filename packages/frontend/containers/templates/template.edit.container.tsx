import { useDispatch } from 'react-redux';

import {
  useTransactionTemplatesUpdateMutation,
  useTransactionTemplatesRemoveMutation,
  useTransactionTemplatesFindOneQuery,
} from '$api/generated/financerApi';
import { DataHandler } from '$blocks/data-handler/data-handler';
import { ToastMessageTypes } from '$blocks/toast/toast';
import { settingsPaths } from '$constants/settings-paths';
import { useViewTransitionRouter } from '$hooks/useViewTransitionRouter';
import {
  TemplateEdit,
  UpdateTransactionTemplateDtoWithCategory,
} from '$pages/settings/templates/template.edit';
import { addToastMessage } from '$reducer/notifications.reducer';
import { parseErrorMessagesToArray } from '$utils/apiHelper';

interface TemplateEditContainerProps {
  id: string;
}

export const TemplateEditContainer = ({ id }: TemplateEditContainerProps) => {
  const { push } = useViewTransitionRouter();

  const [editTransactionTemplate] = useTransactionTemplatesUpdateMutation();
  const [deleteTransactionTemplate] = useTransactionTemplatesRemoveMutation();
  const templateData = useTransactionTemplatesFindOneQuery({ id });
  const { data: template } = templateData;
  const dispatch = useDispatch();

  const handleSubmit = async (
    newTransactionTemplateData: UpdateTransactionTemplateDtoWithCategory,
  ) => {
    if (!template?._id) {
      console.error('transactionTemplate is not defined');
      return;
    }

    const data = {
      ...newTransactionTemplateData,
      categories: newTransactionTemplateData.categories?.map(
        ({ categoryId }) => categoryId,
      ),
    };

    try {
      await editTransactionTemplate({
        id: template._id,
        updateTransactionTemplateDto: data,
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

  const handleDelete = async () => {
    if (!id) {
      console.error('Failed to delete template: no id');
      return;
    }
    deleteTransactionTemplate({ id });
    push(settingsPaths.templates);
  };
  return (
    <>
      <DataHandler {...templateData} />
      {template && (
        <TemplateEdit
          template={template}
          onSubmit={handleSubmit}
          onDelete={handleDelete}
        />
      )}
    </>
  );
};
