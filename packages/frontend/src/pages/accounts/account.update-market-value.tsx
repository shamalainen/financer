import { useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';

import { Input } from '../../components/elements/input/input';

import { Drawer } from '$blocks/drawer/drawer';
import { Form } from '$blocks/form/form';
import { Button } from '$elements/button/button';
import { DateFormat, formatDate } from '$utils/formatDate';

interface AccountUpdateMarketValueProps {
  onUpdate: (
    closeDrawer: () => void,
  ) => SubmitHandler<AccountUpdateMarketValueFormFields>;
  currentValue: number;
}

export interface AccountUpdateMarketValueFormFields {
  currentMarketValue: number;
  date: string;
}

export const AccountUpdateMarketValue = ({
  onUpdate,
  currentValue,
}: AccountUpdateMarketValueProps) => {
  const methods = useForm<AccountUpdateMarketValueFormFields>({
    defaultValues: {
      currentMarketValue: currentValue,
      date: formatDate(new Date(), DateFormat.input),
    },
  });
  const [isOpen, setIsOpen] = useState(false);

  const handleToggleOpen = () => setIsOpen(!isOpen);

  return (
    <>
      <Button testId="update-market-value" onClick={handleToggleOpen}>
        Update market value
      </Button>
      <Drawer
        isOpen={isOpen}
        onClose={handleToggleOpen}
        heading="Update Market Value"
      >
        <Form
          methods={methods}
          onSubmit={onUpdate(() => setIsOpen(false))}
          submitLabel="Update"
        >
          <div className="space-y-4">
            <Input id="currentMarketValue" type="number" isRequired>
              Current Market Value
            </Input>
            <Input id="date" type="datetime-local">
              Date
            </Input>
          </div>
        </Form>
      </Drawer>
    </>
  );
};
