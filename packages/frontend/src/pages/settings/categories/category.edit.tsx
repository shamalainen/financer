import { CategoryDelete } from './category.delete';
import { CategoryForm } from './category.form';

import {
  TransactionCategoryDto,
  UpdateTransactionCategoryDto,
} from '$api/generated/financerApi';
import { settingsPaths } from '$constants/settings-paths';
import { Container } from '$layouts/container/container';
import { UpdatePageInfo } from '$renderers/seo/updatePageInfo';

interface CategoryEditProps {
  category: TransactionCategoryDto;
  onSubmit: (newTransactionCategoryData: UpdateTransactionCategoryDto) => void;
  onDelete: () => void;
}

export const CategoryEdit = ({
  category,
  onSubmit,
  onDelete,
}: CategoryEditProps): JSX.Element => {
  return (
    <Container>
      <UpdatePageInfo
        title={`Edit ${category.name}`}
        backLink={`${settingsPaths.categories}/${category.id}`}
        headerAction={<CategoryDelete onDelete={onDelete} />}
      />
      <CategoryForm
        onSubmit={onSubmit}
        submitLabel="Update"
        currentCategoryId={category.id}
        initialValues={category}
      />
    </Container>
  );
};
