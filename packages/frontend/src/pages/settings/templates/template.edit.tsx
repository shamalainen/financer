import { useMemo } from 'react';

import { TemplateDelete } from './template.delete';
import { TemplateForm } from './template.form';

import {
  TransactionTemplateDto,
  UpdateTransactionTemplateDto,
} from '$api/generated/financerApi';
import { TransactionCategoriesFormFields } from '$blocks/transaction-categories/transaction-categories';
import { settingsPaths } from '$constants/settings-paths';
import { UpdatePageInfo } from '$renderers/seo/updatePageInfo';

export type UpdateTransactionTemplateDtoWithCategory = Omit<
  UpdateTransactionTemplateDto,
  'categories'
> & {
  categories?: TransactionCategoriesFormFields[];
};

interface TemplateEditProps {
  template: TransactionTemplateDto;
  onSubmit: (data: UpdateTransactionTemplateDtoWithCategory) => void;
  onDelete: () => void;
}

export const TemplateEdit = ({
  template,
  onSubmit,
  onDelete,
}: TemplateEditProps): JSX.Element => {
  const initialValues = useMemo(
    () => ({
      ...template,
      categories: template?.categories?.map((categoryId) => ({
        categoryId: categoryId,
        amount: NaN,
      })),
    }),
    [template],
  );

  return (
    <>
      <UpdatePageInfo
        title="Edit template"
        backLink={settingsPaths.templates}
        headerAction={<TemplateDelete onSubmit={onDelete} />}
      />
      <TemplateForm
        onSubmit={onSubmit}
        submitLabel="Update"
        initialValues={initialValues}
      />
    </>
  );
};
