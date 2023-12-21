import { useState } from 'react';

import { PaginationDto } from '$api/generated/financerApi';

export type PagerOptions = {
  nextPage: {
    load(): void;
    isAvailable: boolean;
  };
  previousPage: {
    load(): void;
    isAvailable: boolean;
  };
  pageCount?: number;
  currentPage?: number;
};

type UsePageReturn = {
  page: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  getPagerOptions(pageData?: PaginationDto): PagerOptions;
};

export const usePager = (initialPage = 1): UsePageReturn => {
  const [page, setPage] = useState(initialPage);

  return {
    page,
    setPage,
    getPagerOptions: (pageData) => ({
      nextPage: {
        load: () =>
          pageData?.hasNextPage && setPage((prevPage) => prevPage + 1),
        isAvailable: !!pageData?.hasNextPage,
      },
      previousPage: {
        load: () =>
          pageData?.hasPreviousPage && setPage((prevPage) => prevPage - 1),
        isAvailable: !!pageData?.hasPreviousPage,
      },
      pageCount: pageData?.totalPageCount,
      currentPage: pageData?.currentPage,
    }),
  };
};
