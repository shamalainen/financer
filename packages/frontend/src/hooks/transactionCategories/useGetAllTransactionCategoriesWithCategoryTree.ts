import { useMemo } from 'react';

import { parseParentCategoryPath } from '../../services/TransactionCategoriesService';

import {
  TransactionCategoriesFindAllByUserApiArg,
  TransactionCategoryDto,
  useTransactionCategoriesFindAllByUserQuery,
} from '$api/generated/financerApi';

export type TransactionCategoryDtoWithCategoryTree = TransactionCategoryDto & {
  categoryTree: string;
};

export const useGetAllTransactionCategoriesWithCategoryTree = (
  args: TransactionCategoriesFindAllByUserApiArg = {},
) => {
  const categoryData = useTransactionCategoriesFindAllByUserQuery(args);
  const categoryAllData = useTransactionCategoriesFindAllByUserQuery({});

  return useMemo(() => {
    const { currentData: categories } = categoryData;
    const allCategories = categoryAllData.data ?? [];

    const categoriesWithTree:
      | TransactionCategoryDtoWithCategoryTree[]
      | undefined = categories
      ?.map((category) => ({
        ...category,
        categoryTree: parseParentCategoryPath(allCategories, category.id),
      }))
      .sort((a, b) =>
        // eslint-disable-next-line no-nested-ternary
        a.categoryTree > b.categoryTree
          ? 1
          : b.categoryTree > a.categoryTree
            ? -1
            : 0,
      );

    return { ...categoryData, data: categoriesWithTree };
  }, [categoryData, categoryAllData]);
};
