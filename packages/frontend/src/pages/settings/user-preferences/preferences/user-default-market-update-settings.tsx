import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { Form } from '$blocks/form/form';
import { settingsPaths } from '$constants/settings-paths';
import { Input } from '$elements/input/input';
import { Select } from '$elements/select/select';
import { UserDefaultMarketUpdateSettings as UserDefaultMarketUpdateSettingsType } from '$hooks/settings/user-preference/useDefaultMarketUpdateSettings';
import { TransactionCategoryDtoWithCategoryTree } from '$hooks/transactionCategories/useGetAllTransactionCategoriesWithCategoryTree';
import { UpdatePageInfo } from '$renderers/seo/updatePageInfo';

export interface UserDefaultMarketUpdateSettingsFormFields {
  transactionDescription: string;
  category: string;
}

interface UserDefaultMarketUpdateSettingsProps {
  categories: TransactionCategoryDtoWithCategoryTree[];
  data?: UserDefaultMarketUpdateSettingsType;
  onSave: (data: UserDefaultMarketUpdateSettingsFormFields) => void;
}

export const UserDefaultMarketUpdateSettings = ({
  categories,
  data,
  onSave,
}: UserDefaultMarketUpdateSettingsProps): JSX.Element | null => {
  const methods = useForm<UserDefaultMarketUpdateSettingsFormFields>();

  useEffect(() => {
    methods.reset(data);
  }, [data, methods]);

  return (
    <>
      <UpdatePageInfo
        title="Market update settings"
        backLink={settingsPaths.userPreferences}
      />
      <Form
        methods={methods}
        onSubmit={onSave}
        submitLabel="Save"
        formFooterBackLink={settingsPaths.userPreferences}
      >
        <div className="grid gap-y-4 gap-x-4 sm:grid-cols-2">
          <Input id="transactionDescription" isRequired>
            Transaction description
          </Input>
          <Select
            id="category"
            options={[{ name: 'None', id: '' }, ...categories].map(
              ({ name, id }) => ({
                label: name,
                value: id,
              }),
            )}
            isRequired
          >
            Category
          </Select>
        </div>
      </Form>
    </>
  );
};
