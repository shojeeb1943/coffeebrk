import { useContext, useEffect } from 'react';
import { useRouter } from 'next/router';
import type { Roles } from '../lib/user';
import AuthContext from '../contexts/AuthContext';

export default function useRequirePermissions(role: Roles): void {
  const router = useRouter();
  const authContext = useContext(AuthContext);
  const { user, tokenRefreshed  } = authContext || {};

  useEffect(() => {
    if (tokenRefreshed) {
      if (!(user?.roles.indexOf(role) >= 0)) {
        router.replace('/');
      }
    }
    // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokenRefreshed, user]);
}
