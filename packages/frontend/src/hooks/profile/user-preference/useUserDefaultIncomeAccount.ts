import { UserPreferenceProperty } from '@local/types';
import { useCallback } from 'react';
import { useQueryClient, useQuery } from 'react-query';

import {
  getUserPreferenceByProperty,
  editUserPreference,
} from '../../../services/user-preference-service';

const targetUserPreference = UserPreferenceProperty.DEFAULT_INCOME_ACCOUNT;

export const useUserDefaultIncomeAccount = (): [
  defaultIncomeAccount: string | undefined,
  setDefaultIncomeAccount: (value: string) => Promise<void>
] => {
  const queryClient = useQueryClient();
  const { data, error } = useQuery(
    ['user-preferences', targetUserPreference],
    () => getUserPreferenceByProperty(targetUserPreference)
  );

  if (error) {
    throw new Error(
      `Failed to fetch user preference for ${targetUserPreference}`
    );
  }

  const updateDefaultMarketSettings = useCallback(
    async (value: string) => {
      const newUserPreferenceData = {
        key: targetUserPreference,
        value: value,
      };
      await editUserPreference(newUserPreferenceData);
      queryClient.invalidateQueries(['user-preferences', targetUserPreference]);
    },
    [queryClient]
  );

  return [data?.value, updateDefaultMarketSettings];
};
