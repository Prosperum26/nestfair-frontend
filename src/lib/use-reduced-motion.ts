import { useSyncExternalStore } from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';

function subscribe(cb: () => void) {
  const mql = window.matchMedia?.(QUERY);
  mql?.addEventListener('change', cb);
  return () => mql?.removeEventListener('change', cb);
}

/** Người dùng bật "giảm chuyển động" trong hệ điều hành. */
export function useReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia?.(QUERY).matches ?? false,
    () => false,
  );
}
