import { useCallback, useMemo } from 'react';

import {
  AccountType,
  UserPreferenceProperty,
  useUserPreferencesFindOneQuery,
  useUserPreferencesUpdateMutation,
} from '$api/generated/financerApi';

type UserStatisticsSettings = {
  accountTypes: AccountType[];
};

const userPreferenceProperty = UserPreferenceProperty.StatisticsSettings;

export const useUserStatisticsSettings = () => {
  const data = useUserPreferencesFindOneQuery({
    userPreferenceProperty,
  });

  const parsedData = useMemo(
    () =>
      data.data?.value
        ? (JSON.parse(data.data.value) as UserStatisticsSettings)
        : undefined,
    [data?.data?.value],
  );

  return {
    ...data,
    data: parsedData,
  };
};

export const useUpdateUserStatisticsSettings = (): [
  (newValue: UserStatisticsSettings) => Promise<void>,
  ReturnType<typeof useUserPreferencesUpdateMutation>[1],
] => {
  const [updateMutation, data] = useUserPreferencesUpdateMutation();

  const updateUserPreference = useCallback(
    async (newValue: UserStatisticsSettings) => {
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
