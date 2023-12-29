import clsx from 'clsx';

import { useIsActiveLink } from '../../../hooks/useIsActiveLink';
import { isExternalLink } from '../../elements/button/button';
import { Icon } from '../../elements/icon/icon';

import { NavigationItem } from './navigation';

import { LinkViewTransition } from '$elements/link/link-view-transition';

export const NavigationDesktopItem = ({
  url,
  iconName,
  label,
  onClick = () => {},
  ariaLabel,
  isExact = false,
  disallowedPathEndings = [],
}: NavigationItem): JSX.Element => {
  const isActive = useIsActiveLink({
    url,
    isExact,
    disallowedPathEndings,
  });

  const linkClasses = clsx(
    'flex items-center p-4 hover:bg-gray-dark rounded-md tracking-tight font-medium',
    {
      ['bg-gray-dark']: isActive,
    },
  );

  const linkContent = (
    <>
      <Icon type={iconName} isSolid={isActive} />
      <span className={clsx('ml-4 text-base')}>{label}</span>
    </>
  );

  if (isExternalLink(url)) {
    return (
      <li>
        <a href={url} className={linkClasses} aria-label={ariaLabel}>
          {linkContent}
        </a>
      </li>
    );
  }

  return (
    <li>
      <LinkViewTransition
        href={url}
        className={linkClasses}
        onClick={onClick}
        aria-label={ariaLabel}
      >
        {linkContent}
      </LinkViewTransition>
    </li>
  );
};
