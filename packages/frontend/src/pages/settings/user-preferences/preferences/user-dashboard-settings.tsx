import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { AccountType } from '$api/generated/financerApi';
import { Form } from '$blocks/form/form';
import { settingsPaths } from '$constants/settings-paths';
import { Checkbox } from '$elements/checkbox/checkbox';
import { CheckboxGroup } from '$elements/checkbox/checkbox.group';
import { Heading } from '$elements/heading/heading';
import { Paragraph } from '$elements/paragraph/paragraph';
import { UpdatePageInfo } from '$renderers/seo/updatePageInfo';
import { capitalize } from '$utils/capitalize';

const allAccountTypes = Object.values(AccountType);

export interface UserDashboardSettingsFormFields {
  accountTypes: AccountType[];
}

interface UserDashboardSettingsProps {
  data?: UserDashboardSettingsFormFields;
  onSave: (data: UserDashboardSettingsFormFields) => Promise<void>;
}

export const UserDashboardSettings = ({
  data,
  onSave,
}: UserDashboardSettingsProps): JSX.Element | null => {
  const methods = useForm<UserDashboardSettingsFormFields>();

  useEffect(() => {
    methods.reset(data);
  }, [data, methods]);

  return (
    <>
      <UpdatePageInfo
        title="Dashboard settings"
        backLink={settingsPaths.userPreferences}
      />
      <Form
        methods={methods}
        onSubmit={onSave}
        submitLabel="Save"
        formFooterBackLink={settingsPaths.userPreferences}
      >
        <section className="mb-4">
          <Heading className="mb-2">Account types</Heading>
          <Paragraph>
            Selected types will be calculated into statistics and graphs on the
            dashboard.
          </Paragraph>
        </section>
        <CheckboxGroup testId="dashboard-account-checkboxes" className="-mx-4">
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
    </>
  );
};
