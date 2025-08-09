import { postWindowMessage } from '@dailydotdev/shared/src/lib/func';
import { AuthEvent } from '@dailydotdev/shared/src/lib/kratos';
import type { ReactElement } from 'react';
import { useEffect } from 'react';

function ErrorPage(): ReactElement {
  useEffect(() => {
    const urlSearchParams = new URLSearchParams(globalThis?.window?.location.search);
    const params = Object.fromEntries(urlSearchParams.entries());
    postWindowMessage(AuthEvent.Error, params);
    globalThis?.window?.close();
  }, []);

  return null;
}

export default ErrorPage;
