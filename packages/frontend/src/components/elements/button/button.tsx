import clsx from 'clsx';

import { ButtonExternal } from './button.external';
import { ButtonInternal } from './button.internal';
import { ButtonPlain } from './button.plain';

import { ViewTransition } from '$hooks/useViewTransitionRouter';

export type ButtonAccentColor = 'blue' | 'plain' | 'black' | 'red';
interface ButtonProps {
  accentColor?: ButtonAccentColor;
  children: React.ReactNode;
  className?: string;
  link?: string;
  transition?: ViewTransition;
  onClick?(): void;
  type?: 'button' | 'submit' | 'reset' | undefined;
  testId?: string;
  isDisabled?: boolean;
}

export const isExternalLink = (link: string): boolean =>
  link.substring(0, 8) === 'https://' ||
  link.substring(0, 7) === 'http://' ||
  link.substring(0, 2) === '//' ||
  link.substring(0, 5) === 'blob:' ||
  link.substring(0, 5) === '/api/' ||
  link.substring(0, 6) === '/auth/';

export const Button = ({
  accentColor = 'black',
  children,
  className = '',
  link,
  transition,
  onClick = () => {},
  type = 'button',
  testId,
  isDisabled,
}: ButtonProps): JSX.Element => {
  const buttonClasses = clsx(
    'inline-flex justify-center w-full sm:w-auto rounded-md items-center py-3 px-6 focus:ring-2 focus:ring-offset-2 focus:outline-none transition ease-in-out duration-150 tracking-tight font-normal text-base hover:opacity-75 focus:opacity-75',
    {
      ['bg-charcoal text-white focus:ring-charcoal']: accentColor === 'black',
      ['bg-blue text-white focus:ring-blue']: accentColor === 'blue',
      ['bg-red text-white focus:ring-red']: accentColor === 'red',
      ['bg-gray text-black focus:ring-charcoal hover:bg-gray-dark border border-gray-dark focus:opacity-100 hover:opacity-100']:
        accentColor === 'plain',
      [className]: true,
    },
  );

  if (typeof link === 'string' && link.length > 0 && !isDisabled) {
    if (isExternalLink(link)) {
      return (
        <ButtonExternal
          link={link}
          className={buttonClasses}
          onClick={onClick}
          testId={testId}
        >
          {children}
        </ButtonExternal>
      );
    }

    return (
      <ButtonInternal
        link={link}
        className={buttonClasses}
        onClick={onClick}
        testId={testId}
        transition={transition}
      >
        {children}
      </ButtonInternal>
    );
  }

  return (
    <ButtonPlain
      type={type}
      onClick={onClick}
      className={buttonClasses}
      testId={testId}
      isDisabled={isDisabled}
    >
      {children}
    </ButtonPlain>
  );
};
