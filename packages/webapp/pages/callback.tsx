import {
  broadcastMessage,
  postWindowMessage,
} from '@dailydotdev/shared/src/lib/func';
import { AuthEvent } from '@dailydotdev/shared/src/lib/kratos';
import type { ReactElement } from 'react';
import { useContext, useEffect } from 'react';
import LogContext from '@dailydotdev/shared/src/contexts/LogContext';
import {
  AUTH_REDIRECT_KEY,
  shouldRedirectAuth,
} from '@dailydotdev/shared/src/features/onboarding/shared';

const checkShouldSendBroadcast = () => {
  const ua = globalThis?.navigator?.userAgent;
  const isFromFacebook = globalThis?.document?.referrer === 'https://www.facebook.com/';
  const isInstagramWebview = /Instagram/i.test(ua);
  const postMessageUndefined = !globalThis?.window?.opener?.postMessage;
  const conditions = [isFromFacebook, isInstagramWebview, postMessageUndefined];

  return conditions.some(Boolean);
};

const handleRedirectAuth = (params: URLSearchParams) => {
  const href = globalThis?.window?.sessionStorage.getItem(AUTH_REDIRECT_KEY);

  if (href) {
    const [redirect, hrefParams] = href.split('?');
    const redirectParams = new URLSearchParams(hrefParams);

    Object.entries(redirectParams).forEach(([key, value]) =>
      params.set(key, value),
    );

    globalThis?.window?.location.replace(`${redirect}?${params}`);
  }
};

function CallbackPage(): ReactElement {
  const { logEvent } = useContext(LogContext);
  useEffect(() => {
    const urlSearchParams = new URLSearchParams(globalThis?.window?.location.search);
    const params = Object.fromEntries(urlSearchParams.entries());
    const eventKey = params.login
      ? AuthEvent.Login
      : AuthEvent.SocialRegistration;
    logEvent({
      event_name: 'registration callback',
      extra: JSON.stringify(params),
    });
    const search = new URLSearchParams(params);
    try {
      if (!globalThis?.window?.opener && params.flow && params.settings) {
        globalThis?.window?.location.replace(`/reset-password?${search}`);
        return;
      }

      if (shouldRedirectAuth()) {
        handleRedirectAuth(urlSearchParams);
        return;
      }

      if (checkShouldSendBroadcast()) {
        broadcastMessage({ ...params, eventKey });
      } else {
        postWindowMessage(eventKey, params);
      }

      globalThis?.window?.close();
    } catch (err) {
      const url = `${process.env.NEXT_PUBLIC_WEBAPP_URL}?${search}`;
      globalThis?.window?.location.replace(url);
    }
    // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}

export default CallbackPage;
