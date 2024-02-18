import { clsx } from 'clsx';

import { usePageInfoContext } from '$context/pageInfoContext';
import { Heading } from '$elements/heading/heading';
import { Icon, IconName } from '$elements/icon/icon';
import { LinkViewTransition } from '$elements/link/link-view-transition';
import { useAppSelector } from '$store/*';

export const HeaderMobile = (): JSX.Element => {
  const [{ title, backLink, headerAction, toolbarColor }] =
    usePageInfoContext();

  const { isHeaderActionActive } = useAppSelector((state) => state.app);

  const hasBackLinkAndOrAction = !!backLink || !!headerAction;

  return (
    <div
      className={clsx(
        'text-center fixed top-0 left-0 right-0 px-4 grid items-center h-16 border-b grid-cols-[44px,1fr,44px] vt-name-[mobile-header]',
        {
          ['border-b-transparent']: !hasBackLinkAndOrAction,
          ['border-b-gray-dark']: hasBackLinkAndOrAction,
          ['bg-white']: !toolbarColor || toolbarColor === 'white',
          ['bg-neutral-900']: toolbarColor === 'black',
          ['z-[101]']: isHeaderActionActive,
        },
      )}
    >
      {backLink && (
        <LinkViewTransition
          href={backLink}
          className="inline-flex items-center justify-center -ml-3 h-11 w-11"
          data-testid="header-back-link"
          transition="close-to-right"
        >
          <span className="sr-only">Go back</span>
          <Icon type={IconName.arrowLeft} />
        </LinkViewTransition>
      )}
      <Heading
        variant="h1"
        className="justify-center col-[2]"
        titleClassName={clsx('truncate', {
          ['text-white']: toolbarColor === 'black',
        })}
        testId="page-main-heading"
      >
        {title ?? '-'}
      </Heading>
      {headerAction && (
        <div className="inline-flex items-center justify-end h-11 w-11 col-[3]">
          {headerAction}
        </div>
      )}
    </div>
  );
};
