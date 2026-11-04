import { useEffect } from 'react';

/** Trang công khai: đặt tiêu đề tab và `noindex` (tin có SĐT, không để công cụ tìm kiếm lập chỉ mục). Rời trang thì trả lại như cũ. */
export function usePublicMeta(title: string) {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = title;
    return () => {
      document.title = previousTitle;
    };
  }, [title]);

  useEffect(() => {
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex';
    document.head.appendChild(meta);
    return () => {
      meta.remove();
    };
  }, []);
}
