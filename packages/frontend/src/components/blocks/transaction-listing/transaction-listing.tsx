import { PagerOptions } from '../../../hooks/usePager';
import { Pager } from '../pager/pager';

import {
  TransactionListingItem,
  TransactionListingItemProps,
} from './transaction-listing.item';

interface TransactionListingProps {
  title?: string;
  rows: TransactionListingItemProps[];
  pagerOptions: PagerOptions;
  className?: string;
  isPagerHidden?: boolean;
}

export const TransactionListing = ({
  title,
  rows,
  className = '',
  pagerOptions,
  isPagerHidden,
}: TransactionListingProps): JSX.Element | null => {
  if (!rows.length) {
    return (
      <section className={`${className}`}>
        <p className="text-gray-700">No transactions to show</p>
      </section>
    );
  }

  return (
    <section className={`${className}`}>
      {title && <h2 className="sr-only">{title}</h2>}
      <ul className="-mx-4" data-testid="transaction-stacked-list-container">
        {rows.map(
          ({
            transactionCategories,
            transactionAmount,
            date,
            label,
            link,
            transactionType,
            id,
          }) => (
            <TransactionListingItem
              key={id}
              transactionAmount={transactionAmount}
              transactionCategories={transactionCategories}
              date={date}
              label={label}
              link={link}
              transactionType={transactionType}
              id={id}
            />
          ),
        )}
      </ul>
      {pagerOptions.pageCount &&
        pagerOptions.pageCount > 1 &&
        !isPagerHidden && (
          <Pager className="mt-4" pagerOptions={pagerOptions} />
        )}
    </section>
  );
};
