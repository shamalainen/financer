import { useExpensesFindAllByUserQuery } from '$api/generated/financerApi';
import { TransactionListingWithMonthlyPager } from '$blocks/transaction-listing-with-monthly-pager/transaction-listing.with.monthly-pager';
import { ButtonInternal } from '$elements/button/button.internal';
import { Icon, IconName } from '$elements/icon/icon';
import { UpdatePageInfo } from '$renderers/seo/updatePageInfo';

interface ExpenseListingContainerProps {
  date?: string;
  page?: number;
}

export const ExpenseListingContainer = ({
  date,
  page,
}: ExpenseListingContainerProps) => {
  return (
    <>
      <UpdatePageInfo
        title="Expenses"
        backLink="/statistics"
        headerAction={
          <ButtonInternal
            link="/statistics/expenses/add"
            className="inline-flex items-center justify-center -mr-3 h-11 w-11"
            testId="add-expense"
          >
            <span className="sr-only">Add expense</span>
            <Icon type={IconName.plus} />
          </ButtonInternal>
        }
      />
      <TransactionListingWithMonthlyPager
        initialDate={date}
        initialPage={page}
        useDataHook={useExpensesFindAllByUserQuery}
      />
    </>
  );
};
