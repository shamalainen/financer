import { useEffect, useMemo } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';

import { AccountType } from '$api/generated/financerApi';
import { Form } from '$blocks/form/form';
import { Input } from '$elements/input/input';
import { Select, Option } from '$elements/select/select';
import { capitalize } from '$utils/capitalize';

interface AccountFormProps {
  onSubmit: SubmitHandler<AccountFormFields>;
  submitLabel: string;
  initialValues?: Partial<AccountFormFields>;
}

export interface AccountFormFields {
  name: string;
  balance: number;
  type: AccountType;
}

export const AccountForm = ({
  onSubmit,
  submitLabel,
  initialValues,
}: AccountFormProps): JSX.Element => {
  const defaultValues = useMemo(() => {
    return { type: AccountType.Savings, ...initialValues };
  }, [initialValues]);

  const methods = useForm<AccountFormFields>({
    defaultValues,
  });

  const { reset } = methods;

  const accountTypes: Option[] = Object.values(AccountType).map((value) => ({
    value,
    label: capitalize(value),
  }));

  useEffect(() => {
    if (!initialValues) return;

    reset((previousValues) => ({
      ...previousValues,
      ...defaultValues,
    }));
  }, [defaultValues, initialValues, reset]);

  return (
    <Form
      methods={methods}
      submitLabel={submitLabel}
      onSubmit={onSubmit}
      formFooterBackLink="/accounts"
    >
      <section>
        <div className="grid gap-y-4 gap-x-4 sm:grid-cols-2">
          <Input id="name" isRequired>
            Account
          </Input>
          <Input id="balance" type="number" step={0.01} isRequired>
            Balance
          </Input>
          <Select id="type" options={accountTypes} isRequired>
            Type
          </Select>
        </div>
      </section>
    </Form>
  );
};
