import type { NextPageContext } from 'next';
import type { ReactElement } from 'react';
import React from 'react';
import { NextSeo } from 'next-seo';

interface ErrorProps {
  statusCode?: number;
  hasGetInitialPropsRun?: boolean;
  err?: Error;
}

function ErrorPage({ statusCode }: ErrorProps): ReactElement {
  const title = statusCode === 404 
    ? 'Page Not Found' 
    : statusCode 
    ? `Server Error ${statusCode}` 
    : 'Client Error';

  const description = statusCode === 404
    ? "The page you're looking for doesn't exist."
    : statusCode
    ? 'A server error occurred. Please try again later.'
    : 'An error occurred. Please try again.';

  return (
    <>
      <NextSeo
        title={title}
        description={description}
        noindex
        nofollow
      />
      <div className="flex min-h-screen items-center justify-center bg-background-default">
        <div className="text-center">
          <h1 className="mb-4 text-6xl font-bold text-text-primary">
            {statusCode || 'Error'}
          </h1>
          <h2 className="mb-4 text-2xl font-semibold text-text-primary">
            {title}
          </h2>
          <p className="mb-6 text-text-secondary max-w-md">
            {description}
          </p>
          <div className="space-x-4">
            <button
              onClick={() => globalThis?.window?.history?.back?.()}
              className="rounded-lg bg-accent-cabbage-default px-4 py-2 text-white hover:bg-accent-cabbage-hover"
            >
              Go Back
            </button>
            <button
              onClick={() => globalThis?.window?.location?.assign?.('/')}
              className="rounded-lg border border-accent-cabbage-default px-4 py-2 text-accent-cabbage-default hover:bg-accent-cabbage-default hover:text-white"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

ErrorPage.getInitialProps = async ({ res, err }: NextPageContext) => {
  const statusCode = res?.statusCode ?? err?.statusCode ?? 404;
  
  // Log error in development
  if (process.env.NODE_ENV === 'development' && err) {
    console.error('Error page:', err);
  }

  return { statusCode };
};

export default ErrorPage;
