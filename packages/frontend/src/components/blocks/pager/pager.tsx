import clsx from 'clsx';

import { PagerOptions } from '../../../hooks/usePager';
import { Icon, IconName } from '../../elements/icon/icon';

interface PagerProps {
  className?: string;
  pagerOptions: PagerOptions;
  children?: string;
}

interface PagerButtonProps {
  handleClick(): void;
  children: string;
  isNext?: boolean;
  className?: string;
  isDisabled?: boolean;
}

const PagerButton = ({
  handleClick,
  children,
  isNext,
  className = '',
  isDisabled,
}: PagerButtonProps) => {
  return (
    <button
      className={clsx(
        'h-11 w-11 inline-flex justify-center items-center group disabled:hover:cursor-not-allowed',
        {
          [className]: true,
        },
      )}
      onClick={handleClick}
      disabled={isDisabled}
      title={children}
    >
      <span className="sr-only">{children}</span>
      <Icon
        type={isNext ? IconName.chevronRight : IconName.chevronLeft}
        className="stroke-black group-disabled:opacity-50"
      />
    </button>
  );
};

export const Pager = ({
  className = '',
  pagerOptions,
  children,
}: PagerProps): JSX.Element => {
  const { nextPage, previousPage, pageCount, currentPage } = pagerOptions;
  return (
    <section
      className={clsx({
        [className]: true,
      })}
    >
      <div className="grid grid-cols-[auto,1fr,auto] gap-2 items-center text-center">
        <PagerButton
          handleClick={previousPage.load}
          isDisabled={!previousPage.isAvailable}
          className="-ml-4"
        >
          Previous page
        </PagerButton>
        {children && <p>{children}</p>}
        {currentPage && pageCount && (
          <p className="mx-4 font-medium tracking-tight text-charcoal">
            <span className="sr-only">
              Current page: {currentPage} of {pageCount}
            </span>
            <span aria-hidden="true">
              {currentPage} / {pageCount}
            </span>
          </p>
        )}
        <PagerButton
          isDisabled={!nextPage.isAvailable}
          handleClick={nextPage.load}
          isNext
          className="col-[3] -mr-4"
        >
          Next page
        </PagerButton>
      </div>
    </section>
  );
};
