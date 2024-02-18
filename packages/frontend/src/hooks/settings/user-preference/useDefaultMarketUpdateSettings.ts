import { useCallback, useMemo } from 'react';

import {
  UserPreferenceProperty,
  useUserPreferencesFindOneQuery,
  useUserPreferencesUpdateMutation,
} from '$api/generated/financerApi';

export type UserDefaultMarketUpdateSettings = {
  transactionDescription: string;
  category?: string;
};

const userPreferenceProperty =
  UserPreferenceProperty.UpdateInvestmentMarketValue;

export const useUserDefaultMarketUpdateSettings = () => {
  const data = useUserPreferencesFindOneQuery({
    userPreferenceProperty,
  });

  const parsedData = useMemo(
    () =>
      data.data?.value
        ? (JSON.parse(data.data.value) as UserDefaultMarketUpdateSettings)
        : undefined,
    [data?.data?.value],
  );

  return {
    ...data,
    data: parsedData,
  };
};

export const useUpdateUserDefaultMarketUpdateSettings = (): [
  (newValue: UserDefaultMarketUpdateSettings) => Promise<void>,
  ReturnType<typeof useUserPreferencesUpdateMutation>[1],
] => {
  const [updateMutation, data] = useUserPreferencesUpdateMutation();

  const updateUserPreference = useCallback(
    async (newValue: UserDefaultMarketUpdateSettings) => {
      await updateMutation({
        updateUserPreferenceDto: {
          key: userPreferenceProperty,
          value: JSON.stringify(newValue),
        },
      }).unwrap();
    },
    [updateMutation],
  );

  return [updateUserPreference, data];
};
