import clsx from 'clsx';

import { Heading } from '../heading/heading';
import { Icon, IconName } from '../icon/icon';
import { Paragraph } from '../paragraph/paragraph';

interface DialogTextProps {
  children?: string;
  className?: string;
  label: string;
  iconName?: IconName;
}

export const DialogText = ({
  children,
  className = '',
  label,
  iconName,
}: DialogTextProps) => {
  return (
    <section className={clsx('grid', { [className]: true })}>
      {iconName && (
        <span
          className={clsx(
            'inline-flex items-center justify-center bg-charcoal rounded-full h-11 w-11 mb-6',
          )}
        >
          <Icon
            type={iconName}
            className={clsx(
              'flex-shrink-0 pointer-events-none stroke-white',
              {},
            )}
          />
        </span>
      )}
      <Heading>{label}</Heading>
      {children && <Paragraph className="mt-2">{children}</Paragraph>}
    </section>
  );
};
