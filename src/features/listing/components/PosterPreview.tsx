import { useEffect, useRef, useState } from 'react';
import { Poster, POSTER_HEIGHT, POSTER_WIDTH, type PosterProps } from './Poster.tsx';

/**
 * Xem trước poster: dựng Poster thật (1080×1350) rồi thu nhỏ bằng `transform: scale` theo bề rộng khung (tỷ lệ 4:5).
 * Chỉ để xem. Xuất PNG phải dựng một Poster riêng đúng cỡ (F6), không dùng nút đã bị scale này.
 */
export function PosterPreview(props: PosterProps) {
  const frame = useRef<HTMLDivElement>(null);
  // 0.3 chỉ là giá trị khởi tạo: ResizeObserver đo lại ngay khi gắn vào DOM.
  const [scale, setScale] = useState(0.3);

  useEffect(() => {
    const el = frame.current;
    if (!el) return;
    const update = () => setScale(el.clientWidth / POSTER_WIDTH);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={frame}
      role="img"
      aria-label={`Xem trước poster ${POSTER_WIDTH}×${POSTER_HEIGHT}`}
      style={{ aspectRatio: `${POSTER_WIDTH} / ${POSTER_HEIGHT}` }}
      className="relative w-full overflow-hidden rounded-card border border-line bg-ink"
    >
      <div aria-hidden className="absolute top-0 left-0" style={{ width: `${POSTER_WIDTH}px`, height: `${POSTER_HEIGHT}px`, transform: `scale(${scale})`, transformOrigin: 'top left' }}>
        <Poster {...props} />
      </div>
    </div>
  );
}
