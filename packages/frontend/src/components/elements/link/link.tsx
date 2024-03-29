import clsx from 'clsx';

import { isExternalLink } from '../button/button';

import { LinkViewTransition } from '$elements/link/link-view-transition';

interface LinkProps {
  className?: string;
  children: string;
  testId?: string;
  isAbsolute?: boolean;
  url: string;
}

export const Link = ({
  className = '',
  children,
  testId,
  isAbsolute,
  url,
}: LinkProps): JSX.Element => {
  const linkClasses = clsx('font-medium tracking-tight', {
    [className]: true,
  });
  const linkContent = (
    <>
      {isAbsolute && <span className="absolute inset-0" aria-hidden="true" />}
      {children}
    </>
  );

  if (isExternalLink(url)) {
    return (
      <a href={url} className={linkClasses} data-testid={testId}>
        {linkContent}
      </a>
    );
  }

  return (
    <LinkViewTransition href={url} className={linkClasses} data-testid={testId}>
      {linkContent}
    </LinkViewTransition>
  );
};
