import Image from 'next/image';
import { useState, useEffect } from 'react';

import { ErrorBoundaryHandler } from '../../blocks/error-boundary/error-boundary';
import { LoaderSuspense } from '../../elements/loader/loader-suspense';
import { Container } from '../container/container';

import { Navigation } from '$blocks/navigation/navigation';
import { ToastContainer } from '$blocks/toast/toast.container';
import { LinkViewTransition } from '$elements/link/link-view-transition';
import { Loader } from '$elements/loader/loader';
import { useIsQueryLoading } from '$hooks/useIsQueryLoading';
import { Header } from '$layouts/header/header';

type ChildrenWithErrorBoundaryProps = {
  children: React.ReactNode;
};

const ChildrenWithErrorBoundary = ({
  children,
}: ChildrenWithErrorBoundaryProps): JSX.Element => (
  <ErrorBoundaryHandler errorPage="in-app">
    <LoaderSuspense>{children}</LoaderSuspense>
  </ErrorBoundaryHandler>
);

type LayoutProps = {
  children: React.ReactNode;
};

export const Layout = ({ children }: LayoutProps): JSX.Element => {
  const [currentWindowWidth, setCurrentWindowWidth] = useState(
    window.outerWidth,
  );

  const isLoading = useIsQueryLoading();

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    const loadInitialWidth = (times = 0) => {
      if (window?.outerWidth) {
        setCurrentWindowWidth(window.outerWidth);
        return;
      } else if (times < 10) {
        timeout = setTimeout(loadInitialWidth, 50, times + 1);
      }
    };

    loadInitialWidth();

    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    const action = () => setCurrentWindowWidth(window.outerWidth);
    let timeout: NodeJS.Timeout;

    window.addEventListener('resize', () => {
      if (timeout) {
        clearTimeout(timeout);
      }
      timeout = setTimeout(action, 50);
    });

    return () => window.removeEventListener('resize', () => action);
  }, []);

  const childrenContent = (
    <Loader isLoading={isLoading}>
      <ChildrenWithErrorBoundary>{children}</ChildrenWithErrorBoundary>
    </Loader>
  );

  if (currentWindowWidth >= 1024) {
    return (
      <div className="bg-white">
        <Container className="grid grid-cols-[300px,1fr] min-h-screen px-0">
          <aside className="after:bg-gray after:ml-[-100vw] after:pr-[100vw] after:absolute after:top-0 after:bottom-0 after:right-0 relative border-r border-gray-dark vt-name-[desktop-navigation]">
            <div className="sticky top-0 z-10 min-h-screen pt-12 pb-12 pl-8 pr-4 bottom-12">
              <header>
                <LinkViewTransition
                  href="/"
                  className="inline-flex items-center gap-3 mb-8"
                >
                  <Image
                    src="/logo.svg"
                    alt="Financer logo"
                    className="w-12 h-12"
                    width={48}
                    height={48}
                  />

                  <h2 className="text-xl font-extrabold tracking-tighter text-black uppercase">
                    Financer
                  </h2>
                </LinkViewTransition>
                <Navigation variant="desktop" />
              </header>
            </div>
          </aside>
          <main>
            <div className="px-8 py-12" data-testid="layout-root">
              <Header variant="desktop" />
              <ToastContainer className="mb-8 -mt-2" />
              {childrenContent}
            </div>
          </main>
        </Container>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-screen overflow-y-scroll lg:hidden">
      <main className="flex-grow bg-white lg:pb-24 min-h-screen-safe pb-safe">
        <div className={`px-4 mt-[64px] pt-8 pb-24`} data-testid="layout-root">
          <ToastContainer className="mb-8 -mt-2" />
          {childrenContent}
        </div>
      </main>
      <header>
        <Header variant="mobile" />
        <Navigation variant="mobile" />
      </header>
    </div>
  );
};
