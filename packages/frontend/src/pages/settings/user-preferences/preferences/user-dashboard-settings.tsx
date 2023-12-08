import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { AccountTypeEnum } from '$api/generated/financerApi';
import { Form } from '$blocks/form/form';
import { settingsPaths } from '$constants/settings-paths';
import { Checkbox } from '$elements/checkbox/checkbox';
import { CheckboxGroup } from '$elements/checkbox/checkbox.group';
import { Heading } from '$elements/heading/heading';
import { Loader } from '$elements/loader/loader';
import { LoaderFullScreen } from '$elements/loader/loader.fullscreen';
import { UpdatePageInfo } from '$renderers/seo/updatePageInfo';
import { capitalize } from '$utils/capitalize';

const allAccountTypes = Object.values(AccountTypeEnum);

export interface UserDashboardSettingsFormFields {
  accountTypes: AccountTypeEnum[];
}

interface UserDashboardSettingsProps {
  data?: UserDashboardSettingsFormFields;
  isLoading: boolean;
  isUpdating: boolean;
  onSave: (data: UserDashboardSettingsFormFields) => Promise<void>;
}

export const UserDashboardSettings = ({
  data,
  isLoading,
  isUpdating,
  onSave,
}: UserDashboardSettingsProps): JSX.Element | null => {
  const methods = useForm<UserDashboardSettingsFormFields>();

  useEffect(() => {
    methods.reset(data);
  }, [data, methods]);

  return (
    <>
      {isUpdating && <LoaderFullScreen />}
      <UpdatePageInfo
        title="Dashboard settings"
        backLink={settingsPaths.userPreferences}
      />
      {isLoading ? (
        <Loader />
      ) : (
        <Form
          methods={methods}
          onSubmit={onSave}
          submitLabel="Save"
          formFooterBackLink={settingsPaths.userPreferences}
        >
          <Heading className="mb-4">Account types for stats and graph</Heading>
          <CheckboxGroup testId="dashboard-account-checkboxes">
            {allAccountTypes.map((type) => (
              <Checkbox
                key={type}
                id={type}
                value={type}
                label={capitalize(type)}
                name={'accountTypes'}
              />
            ))}
          </CheckboxGroup>
        </Form>
      )}
    </>
  );
};
