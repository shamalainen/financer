import { useCallback, useMemo } from 'react';

import {
  AccountType,
  UserPreferenceProperty,
  useUserPreferencesFindOneQuery,
  useUserPreferencesUpdateMutation,
} from '$api/generated/financerApi';

const userPreferenceProperty = UserPreferenceProperty.DashboardSettings;

type UserDashboardSettings = {
  accountTypes: AccountType[];
};

export const useUserDashboardSettings = () => {
  const data = useUserPreferencesFindOneQuery({
    userPreferenceProperty,
  });

  const parsedData = useMemo(
    () =>
      data.data?.value
        ? (JSON.parse(data.data.value) as UserDashboardSettings)
        : undefined,
    [data?.data?.value],
  );

  return {
    ...data,
    data: parsedData,
  };
};

export const useUpdateUserDashboardSettings = (): [
  (newValue: UserDashboardSettings) => Promise<void>,
  ReturnType<typeof useUserPreferencesUpdateMutation>[1],
] => {
  const [updateMutation, data] = useUserPreferencesUpdateMutation();

  const updateUserPreference = useCallback(
    async (newValue: UserDashboardSettings) => {
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
