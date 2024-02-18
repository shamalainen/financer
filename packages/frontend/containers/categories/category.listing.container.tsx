import { useMemo } from 'react';

import { settingsPaths } from '$constants/settings-paths';
import { ButtonInternal } from '$elements/button/button.internal';
import { Icon, IconName } from '$elements/icon/icon';
import { LinkList } from '$elements/link-list/link-list';
import { LinkListLink } from '$elements/link-list/link-list.link';
import { useGetAllTransactionCategoriesWithCategoryTree } from '$hooks/transactionCategories/useGetAllTransactionCategoriesWithCategoryTree';
import { UpdatePageInfo } from '$renderers/seo/updatePageInfo';

const generateCategoryGroupChild = (
  childName: CategoryItem['label'],
  childId: CategoryItem['id'],
  tree: CategoryItem['tree'],
  showTree = true,
) => ({
  id: childId,
  label: childName,
  tree: showTree ? tree : '',
  link: `${settingsPaths.categories}/${childId}`,
});

interface CategoryParentItem {
  label: string;
  items: CategoryItem[];
  link?: string;
}

interface CategoryItem {
  label: string;
  link: string;
  tree: string;
  id: string;
}

export const CategoryListingContainer = () => {
  const { data: categories } = useGetAllTransactionCategoriesWithCategoryTree();

  const categoryRows = useMemo<CategoryParentItem[]>(() => {
    if (!categories) return [];

    const allParentIds = categories.map(
      ({ parentCategoryId }) => parentCategoryId,
    );

    const categoriesWithChildren = categories
      .filter(
        ({ id, parentCategoryId }) =>
          allParentIds.includes(id) || !!parentCategoryId,
      )
      .reduce((prev, { name, id, parentCategoryId, categoryTree }) => {
        if (!parentCategoryId) {
          prev.push({
            ...generateCategoryGroupChild(name, id, categoryTree, false),
            items: [],
          });
        } else {
          prev[prev.length - 1].items.push(
            generateCategoryGroupChild(name, id, categoryTree),
          );
        }

        return prev;
      }, [] as CategoryParentItem[]);

    const generalCategoryGroup = {
      label: 'General',
      items: categories
        .filter(
          ({ id, parentCategoryId }) =>
            !allParentIds.includes(id) && !parentCategoryId,
        )
        .map(({ id, name, categoryTree }) =>
          generateCategoryGroupChild(name, id, categoryTree, false),
        ),
    };

    return [generalCategoryGroup, ...categoriesWithChildren];
  }, [categories]);

  return (
    <>
      <UpdatePageInfo
        title="Categories"
        backLink={settingsPaths.default}
        headerAction={
          <ButtonInternal
            link={`${settingsPaths.categories}/add`}
            className="inline-flex items-center justify-center -mr-3 h-11 w-11"
            testId="add-category-button"
          >
            <span className="sr-only">Add category</span>
            <Icon type={IconName.plus} />
          </ButtonInternal>
        }
      />
      <section className="grid gap-8">
        {categoryRows.map(({ label: parentLabel, items, link: parentLink }) => (
          <LinkList
            key={parentLabel}
            label={parentLabel}
            testId="category-list"
          >
            {parentLink && (
              <LinkListLink link={parentLink} icon={IconName.tag}>
                {parentLabel}
              </LinkListLink>
            )}
            {items.map(({ id, link, label }) => (
              <LinkListLink key={id} link={link} icon={IconName.tag}>
                {label}
              </LinkListLink>
            ))}
          </LinkList>
        ))}
      </section>
    </>
  );
};
