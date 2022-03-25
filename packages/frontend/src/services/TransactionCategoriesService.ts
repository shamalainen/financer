import { ApiResponse, ITransactionCategory } from '@local/types';

import { parseApiResponse } from '../utils/apiHelper';

export interface ITransactionCategoryWithCategoryTree
  extends ITransactionCategory {
  categoryTree: string;
}

export const parseParentCategoryPath = (
  allCategories: ITransactionCategory[],
  categoryId: string
): string => {
  const targetCategory = allCategories.find(({ _id }) => _id === categoryId);

  if (!targetCategory?.parent_category_id) {
    return `${targetCategory?.name}`;
  }
  const parentPath = parseParentCategoryPath(
    allCategories,
    targetCategory.parent_category_id
  );
  return `${parentPath} > ${targetCategory?.name}`;
};

export const getAllTransactionCategories = async (): Promise<
  ITransactionCategory[]
> => {
  const transactionCategories = await fetch('/api/transaction-categories');
  return (await transactionCategories.json()) as ITransactionCategory[];
};

export const getAllTransactionCategoriesWithCategoryTree = async (): Promise<
  ITransactionCategoryWithCategoryTree[]
> => {
  const transactionCategoriesRaw = await fetch('/api/transaction-categories');
  const transactionCategories =
    (await transactionCategoriesRaw.json()) as ITransactionCategory[];

  return transactionCategories
    .map((transactionCategory) => ({
      ...transactionCategory,
      categoryTree: parseParentCategoryPath(
        transactionCategories,
        transactionCategory._id
      ),
    }))
    .sort((a, b) =>
      // eslint-disable-next-line no-nested-ternary
      a.categoryTree > b.categoryTree
        ? 1
        : b.categoryTree > a.categoryTree
        ? -1
        : 0
    );
};

export const getTransactionCategoryById = async (
  id: string
): Promise<ITransactionCategory> => {
  const transactionCategory = await fetch(`/api/transaction-categories/${id}`);
  return transactionCategory.json();
};

export const addTransactionCategory = async (
  newTransactionCategoryData: ITransactionCategory
): Promise<ApiResponse<ITransactionCategory>> => {
  const newTransactionCategory = await fetch('/api/transaction-categories', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(newTransactionCategoryData),
  });

  return parseApiResponse(newTransactionCategory);
};

export const editTransactionCategory = async (
  id: string,
  targetTransactionCategoryData: ITransactionCategory
): Promise<ApiResponse<ITransactionCategory>> => {
  const targetTransactionCategory = await fetch(
    `/api/transaction-categories/${id}`,
    {
      method: 'PATCH',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(targetTransactionCategoryData),
    }
  );

  return parseApiResponse(targetTransactionCategory);
};

export const deleteTransactionCategory = async (id: string): Promise<void> => {
  await fetch(`/api/transaction-categories/${id}`, {
    method: 'DELETE',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });
};
