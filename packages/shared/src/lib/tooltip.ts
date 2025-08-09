export const isTouchDevice = (): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }

  return 'ontouchstart' in window || globalThis?.navigator?.maxTouchPoints > 0;
};
