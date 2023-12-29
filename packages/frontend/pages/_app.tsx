import type { AppProps } from 'next/app';
import { useEffect } from 'react';
import { Provider, useDispatch } from 'react-redux';

import { useAuthGetAuthenticationStatusQuery } from '$api/generated/financerApi';
import { ErrorBoundaryHandler } from '$blocks/error-boundary/error-boundary';
import { ToastMessageTypes } from '$blocks/toast/toast';
import { TransitionProvider } from '$container/transition.provider';
import { Loader } from '$elements/loader/loader';
import { LoaderSuspense } from '$elements/loader/loader-suspense';
import { useViewTransitionRouter } from '$hooks/useViewTransitionRouter';
import { Layout } from '$layouts/layout/layout';
import { Login } from '$pages/login/login';
import {
  addToastMessage,
  removeToastMessage,
} from '$reducer/notifications.reducer';
import { ScrollToTop } from '$renderers/scroll-to-top/scroll-to-top';
import { SEO } from '$renderers/seo/seo';
import { PageInfoProvider } from 'src/context/pageInfoContext';
import { store } from 'src/redux/store';

import '../src/assets/tailwind.css';

const PUBLIC_ROUTES = ['/privacy-policy', '/issues-with-login'];

const App = ({ Component, pageProps }: AppProps) => {
  const { data: authenticationStatus, isLoading } =
    useAuthGetAuthenticationStatusQuery();
  const { push, pathname } = useViewTransitionRouter();
  const dispatch = useDispatch();

  useEffect(() => {
    if (
      !authenticationStatus?.authenticated ||
      authenticationStatus?.hasAccounts
    ) {
      dispatch(removeToastMessage('welcomeToFinancer'));
      return;
    }

    push('/accounts/add');
    dispatch(
      addToastMessage({
        id: 'welcomeToFinancer',
        type: ToastMessageTypes.GENERAL,
        message: 'Welcome to Financer!',
        additionalInformation:
          'You must add your first account before you start tracking finances with Financer',
      }),
    );
  }, [push, authenticationStatus, dispatch]);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const errors = authenticationStatus?.errors;

    if (!errors) return;

    dispatch(
      addToastMessage({
        id: 'authenticationStatusErrors',
        type: ToastMessageTypes.ERROR,
        message: 'Something went wrong!',
        additionalInformation: errors,
      }),
    );

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
  }, [authenticationStatus?.errors, dispatch]);

  if (isLoading) return <Loader />;

  const isAuthenticated = authenticationStatus?.authenticated;
  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

  return (
    <>
      {isPublicRoute && <Component {...pageProps} />}
      {isAuthenticated && !isPublicRoute && (
        <Layout>
          <Component {...pageProps} />
        </Layout>
      )}
      {!isPublicRoute && !isAuthenticated && <Login />}
    </>
  );
};

const AppWrapper = (props: AppProps) => {
  return (
    <Provider store={store}>
      <ErrorBoundaryHandler errorPage="full-app">
        <TransitionProvider>
          <LoaderSuspense>
            <PageInfoProvider>
              <SEO />
              <ScrollToTop />
              <App {...props} />
            </PageInfoProvider>
          </LoaderSuspense>
        </TransitionProvider>
      </ErrorBoundaryHandler>
    </Provider>
  );
};

export default AppWrapper;
