import { useEffect, useState } from 'react';

/** Giờ hiện tại, cập nhật mỗi `intervalMs` (mặc định 30 giây) để đồng hồ đếm ngược "còn 46 giờ" tự chạy. */
export function useNow(intervalMs = 30_000): Date {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}
