import { useEffect } from 'react';

const BASE = 'NestFair';

/** Đặt tiêu đề tab cho trang công khai: "Điều khoản sử dụng · NestFair". Không truyền thì chỉ có tên app. */
export function usePageTitle(title?: string): void {
  useEffect(() => {
    document.title = title ? `${title} · ${BASE}` : BASE;
  }, [title]);
}
