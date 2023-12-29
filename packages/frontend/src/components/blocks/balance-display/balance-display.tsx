import clsx from 'clsx';

import { TransactionType } from '$blocks/transaction-listing/transaction-listing.item';
import { Icon, IconName } from '$elements/icon/icon';
import { formatCurrency } from '$utils/formatCurrency';

interface BalanceDisplayProps {
  className?: string;
  type?: TransactionType;
  children?: string;
  amount: number;
  iconName?: IconName;
  testId?: string;
  childTestId?: string;
}

export const BalanceDisplay = ({
  className = '',
  type,
  children,
  amount,
  iconName,
  testId,
  childTestId,
}: BalanceDisplayProps) => {
  const formattedAmount = formatCurrency(amount);

  const defaultValues = {
    balance: formattedAmount,
    icon: iconName,
    color: 'text-black',
  };

  const typeMapping = {
    [TransactionType.INCOME]: {
      balance: `+ ${formattedAmount}`,
      icon: IconName.download,
      color: 'text-green',
    },
    [TransactionType.EXPENSE]: {
      balance: `- ${formattedAmount}`,
      icon: IconName.upload,
      color: 'text-red',
    },
    [TransactionType.TRANSFER]: {
      icon: IconName.switchHorizontal,
    },
  };

  const { balance, icon, color } = {
    ...defaultValues,
    ...(type ? typeMapping[type] : {}),
  };

  return (
    <div
      className={clsx(
        'flex flex-col items-center justify-center text-center gap-4',
        {
          [className]: true,
        },
      )}
    >
      {icon && (
        <span
          className={clsx(
            'inline-flex items-center justify-center bg-gray rounded-full h-11 w-11',
          )}
        >
          <Icon
            type={icon}
            className={clsx(
              'flex-shrink-0 pointer-events-none stroke-black/75',
            )}
          />
        </span>
      )}
      <div>
        <p
          className={clsx('text-4xl font-semibold break-all', {
            [color]: color,
          })}
        >
          <span className="sr-only">Amount:</span>
          <span data-testid={testId}>{balance}</span>
        </p>
        {children && (
          <p className="text-lg">
            <span className="sr-only">Description:</span>
            <span data-testid={childTestId}>{children}</span>
          </p>
        )}
      </div>
    </div>
  );
};
