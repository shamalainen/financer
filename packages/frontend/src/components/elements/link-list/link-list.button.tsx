import clsx from 'clsx';

import { IconName, Icon } from '../icon/icon';

interface LinkListButtonProps {
  icon?: IconName;
  children: string;
  handleClick(): void;
  testId?: string;
}

export const LinkListButton = ({
  icon,
  children,
  handleClick,
  testId,
}: LinkListButtonProps): JSX.Element => {
  return (
    <button
      className={clsx(
        'relative flex w-full gap-4 items-center focus-within:bg-gray-dark hover:bg-gray-dark overflow-hidden pl-4 lg:rounded-md',
      )}
      onClick={handleClick}
      data-testid={testId}
    >
      {icon && (
        <span className="inline-flex items-center justify-center border rounded-full bg-gray border-gray-dark h-11 w-11">
          <Icon
            type={icon}
            className="flex-shrink-0 pointer-events-none stroke-charcoal"
          />
        </span>
      )}
      <span className="text-base items-center flex justify-between font-medium tracking-tight py-5 pr-4 after:h-[1px] after:w-full after:absolute after:bg-gray-dark after:bottom-0 flex-1 overflow-hidden">
        <span className="truncate">{children}</span>
        <Icon
          type={IconName.chevronRight}
          className="flex-shrink-0 pointer-events-none stroke-gray-darkest"
        />
      </span>
    </button>
  );
};
