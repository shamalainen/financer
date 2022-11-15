import { useState } from 'react';

import { LoaderFullScreen } from '../../components/elements/loader/loader.fullscreen';
import { UpdatePageInfo } from '../../components/renderers/seo/updatePageInfo';

import { LoginActions } from './login.actions';
import { LoginFooter } from './login.footer';
import { LoginHeader } from './login.header';

const { REACT_APP_IS_GITHUB_OAUTH_ENABLED, REACT_APP_IS_AUTH0_OAUTH_ENABLED } =
  process.env;

const checkIsEnabled = (stringBoolean: string | undefined) =>
  stringBoolean && stringBoolean.toLocaleLowerCase() !== 'false';

export const Login = (): JSX.Element => {
  const [isLoadingOAuthPage, setIsLoadingOAuthPage] = useState(false);

  const startAuthLoading = () => setTimeout(setIsLoadingOAuthPage, 500, true);

  return (
    <>
      <UpdatePageInfo title="Login" />
      {isLoadingOAuthPage && <LoaderFullScreen />}
      <div className="fixed inset-0 z-10 overflow-y-auto">
        <div className="flex items-end justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
          <div className="fixed inset-0 transition-opacity">
            <div className="absolute inset-0 bg-gray-500 opacity-75" />
          </div>
          <span className="hidden sm:inline-block sm:align-middle sm:h-screen" />
          &#8203;
          <div
            className="inline-block overflow-hidden align-bottom transition-all transform sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-headline"
          >
            <div className="overflow-hidden">
              <LoginHeader label="Financer">
                Please login to manage your accounts, expenses and incomes.
              </LoginHeader>
              {checkIsEnabled(REACT_APP_IS_GITHUB_OAUTH_ENABLED) && (
                <LoginActions
                  submitButtonLabel="Login with Github"
                  loginUrl="/auth/github"
                  onClick={startAuthLoading}
                />
              )}
              {checkIsEnabled(REACT_APP_IS_AUTH0_OAUTH_ENABLED) && (
                <LoginActions
                  submitButtonLabel="Login with Auth0"
                  loginUrl="/auth/auth0"
                  onClick={startAuthLoading}
                />
              )}
            </div>
            <LoginFooter className="mt-2 overflow-hidden" />
          </div>
        </div>
      </div>
    </>
  );
};
