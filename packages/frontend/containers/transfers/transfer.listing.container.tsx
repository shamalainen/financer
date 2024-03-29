import { useTransfersFindAllByUserQuery } from '$api/generated/financerApi';
import { TransactionListingWithMonthlyPager } from '$blocks/transaction-listing-with-monthly-pager/transaction-listing.with.monthly-pager';
import { ButtonInternal } from '$elements/button/button.internal';
import { Icon, IconName } from '$elements/icon/icon';
import { UpdatePageInfo } from '$renderers/seo/updatePageInfo';

interface TransferListingContainerProps {
  date?: string;
  page?: number;
}

export const TransferListingContainer = ({
  date,
  page,
}: TransferListingContainerProps) => {
  return (
    <>
      <UpdatePageInfo
        title="Transfers"
        backLink="/statistics"
        headerAction={
          <ButtonInternal
            link="/statistics/transfers/add"
            className="inline-flex items-center justify-center -mr-3 h-11 w-11"
            testId="add-transfer"
          >
            <span className="sr-only">Add transfer</span>
            <Icon type={IconName.plus} />
          </ButtonInternal>
        }
      />
      <TransactionListingWithMonthlyPager
        initialDate={date}
        initialPage={page}
        useDataHook={useTransfersFindAllByUserQuery}
      />
    </>
  );
};
