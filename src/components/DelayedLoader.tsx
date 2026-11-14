import { useEffect, useState } from 'react';
import { LOADER_DELAY_MS } from './delayed.ts';
import { SessionLoader } from './SessionLoader.tsx';

/** Màn chờ toàn trang chỉ hiện khi chờ quá 300ms; phiên khôi phục nhanh thì không nháy gì. */
export function DelayedLoader({ label }: { label?: string }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setShow(true), LOADER_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);
  return show ? <SessionLoader label={label} /> : null;
}
