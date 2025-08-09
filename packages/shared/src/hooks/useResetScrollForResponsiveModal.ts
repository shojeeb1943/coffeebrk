import { useEffect } from 'react';
import { mobileL } from '../styles/media';

export const responsiveModalBreakpoint = mobileL;

export function useResetScrollForResponsiveModal(): void {
  useEffect(() => {
    if (globalThis?.window?.matchMedia) {
      const mediaQuery = globalThis?.window?.matchMedia(
        responsiveModalBreakpoint.replace('@media ', ''),
      );
      if (!mediaQuery.matches) {
        globalThis?.window?.scroll(0, 0);
        globalThis?.document?.querySelector('[role="dialog"]')?.scroll?.(0, 0);
      }
    }
  }, []);
}
