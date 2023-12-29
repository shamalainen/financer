import { createContext, useContext, useState } from 'react';

interface PageInfoProps {
  children: React.ReactNode;
}

export type PageInfoData = {
  title: string;
  toolbarColor?: 'white' | 'brand' | 'black';
  backLink?: string;
  headerAction?: React.ReactNode;
};

type PageInfoContextType = [
  PageInfoData,
  React.Dispatch<React.SetStateAction<PageInfoData>>,
];

export const PageInfoContext = createContext<PageInfoContextType>([
  { title: '' },
  () => {},
]);

export const usePageInfoContext = (): PageInfoContextType =>
  useContext(PageInfoContext);

export const PageInfoProvider = ({ children }: PageInfoProps): JSX.Element => {
  const [pageInfo, setPageInfo] = useState<PageInfoData>({ title: '' });

  return (
    <PageInfoContext.Provider value={[pageInfo, setPageInfo]}>
      {children}
    </PageInfoContext.Provider>
  );
};
