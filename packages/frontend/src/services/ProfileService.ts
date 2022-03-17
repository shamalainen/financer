import { IAccount, IApiResponse, ITransaction, IUser } from '@local/types';

export interface IOverrideProfileData {
  accounts: IAccount[];
  transactions: ITransaction[];
  user: IUser;
}

export const getProfileInformation = async (): Promise<IUser> => {
  const profile = await fetch('/api/users/my-user');
  return profile.json();
};

export const postOverrideProfileData = async (
  uploadedUserData: IOverrideProfileData
): Promise<IApiResponse<string>> => {
  const rawOverride = await fetch('/api/users/my-user/my-data', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(uploadedUserData),
  });

  return rawOverride.json();
};
