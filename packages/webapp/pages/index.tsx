import type { ReactElement } from 'react';
import React from 'react';
import type { NextSeoProps } from 'next-seo/lib/types';
import { SiteLinksSearchBoxJsonLd } from 'next-seo';
import {
  getMainFeedLayout,
  mainFeedLayoutProps,
} from '../components/layouts/MainFeedPage';
import { defaultOpenGraph, defaultSeo, defaultSeoTitle } from '../next-seo';

const seo: NextSeoProps = {
  title: defaultSeoTitle,
  openGraph: { ...defaultOpenGraph },
  ...defaultSeo,
};

const Home = (): ReactElement => (
  <>
    <SiteLinksSearchBoxJsonLd
      url="https://app.daily.dev"
      potentialActions={[
        {
          target: 'https://app.daily.dev/search?q',
          queryInput: 'search_term_string',
        },
      ]}
    />
    <div className="flex min-h-screen items-center justify-center bg-background-default">
      <div className="text-center">
        <h1 className="mb-4 text-6xl font-bold text-text-primary">
          ☕ CoffeeBreak
        </h1>
        <h2 className="mb-4 text-2xl font-semibold text-text-secondary">
          Where developers grow together
        </h2>
        <p className="mb-6 text-text-tertiary max-w-md mx-auto">
          Stay updated with the latest programming news and unlock more time to code.
        </p>
        <div className="space-x-4">
          <button className="rounded-lg bg-accent-cabbage-default px-6 py-3 text-white hover:bg-accent-cabbage-hover">
            Get Started
          </button>
          <button className="rounded-lg border border-accent-cabbage-default px-6 py-3 text-accent-cabbage-default hover:bg-accent-cabbage-default hover:text-white">
            Learn More
          </button>
        </div>
      </div>
    </div>
  </>
);

Home.getLayout = getMainFeedLayout;
Home.layoutProps = { ...mainFeedLayoutProps, seo };

export default Home;
