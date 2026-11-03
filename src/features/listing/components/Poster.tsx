import { Bed, MapPin, Users } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useId } from 'react';
import { formatVnd } from '@/lib/format.ts';
import { genderPosterLine, listingHeadline } from '../format.ts';
import type { GenderWanted } from '../types.ts';

export interface PosterProps {
  slotsOpen: number;
  memberCount: number;
  locationText: string;
  genderWanted: GenderWanted;
  pricePerPerson: number;
  utilitiesIncluded: boolean;
  coverUrl: string | null;
  qrValue: string;
  displayUrl: string;
}

/** Kích thước xuất ra (px). Poster luôn dựng đúng cỡ này; xem trước chỉ thu nhỏ bằng transform. */
export const POSTER_WIDTH = 1080;
export const POSTER_HEIGHT = 1350;
/** QR trên poster: >= 240px vì Zalo/Facebook nén ảnh (R4). */
export const POSTER_QR_SIZE = 260;

/** Logo NestFair nhỏ đặt giữa QR (data URI để QR xuất ra PNG không phải tải thêm tài nguyên). */
const QR_LOGO =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="9" fill="#1C2333"/>` +
      `<path d="M8 15.5 16 8.5l8 7" fill="none" stroke="#F5D547" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>` +
      `<rect x="10" y="18" width="12" height="2.6" rx="1.3" fill="#F5D547"/><rect x="10" y="22.6" width="12" height="2.6" rx="1.3" fill="#F5D547"/></svg>`,
  );
/** Cạnh logo giữa QR: 52px / 260px = 20% cạnh (4% diện tích), mức sửa lỗi H chịu được. */
const QR_LOGO_SIZE = 52;

/**
 * Lưới giấy kẻ ô và logo của poster dùng thuộc tính `fill`/`stroke` trực tiếp (không dùng class Tailwind như GridPaper và Logo):
 * `html-to-image` làm mất fill/stroke đặt bằng class trên phần tử con của SVG, nên PNG xuất ra sẽ mất lưới và logo bị đen.
 */
function PosterGrid() {
  const id = `poster-grid-${useId().replace(/\W/g, '')}`;
  return (
    <svg className="pointer-events-none absolute inset-0 size-full" aria-hidden>
      <defs>
        <pattern id={id} width="32" height="32" patternUnits="userSpaceOnUse">
          <path d="M32 0V32M0 32H32" fill="none" stroke="#3A4459" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} opacity="0.45" />
    </svg>
  );
}

function PosterLogo() {
  return (
    <span className="inline-flex items-center gap-5">
      <svg viewBox="0 0 32 32" width="76" height="76" aria-hidden>
        <rect width="32" height="32" rx="9" fill="#F5D547" />
        <path d="M8 15.5 16 8.5l8 7" fill="none" stroke="#1C2333" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="10" y="18" width="12" height="2.6" rx="1.3" fill="#1C2333" />
        <rect x="10" y="22.6" width="12" height="2.6" rx="1.3" fill="#1C2333" />
      </svg>
      <span className="font-display text-[64px] leading-[76px] font-bold tracking-[-1.5px] text-white">NestFair</span>
    </span>
  );
}

/** Hình minh họa khi chưa có ảnh bìa: đường núi + giường (ảnh 20_Poster). */
function CoverPlaceholder() {
  return (
    <div data-cover-placeholder className="relative size-full bg-ink-soft">
      <svg viewBox="0 0 948 300" className="absolute inset-0 size-full" aria-hidden>
        <path d="M48 262 L340 140 L560 220 L760 160 L900 224" fill="none" stroke="#6E7482" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <Bed className="absolute top-[88px] left-1/2 size-[96px] -translate-x-1/2 text-ink-on2" strokeWidth={2} aria-hidden />
    </div>
  );
}

/**
 * Poster tin tìm người ở ghép, đúng 1080×1350 (ảnh 20_Poster). Chỉ dùng màu đặc, không gradient,
 * blur, filter hay mask vì `html-to-image` xuất sai các thuộc tính đó. Nút gốc cố định kích thước bằng inline style.
 */
export function Poster({
  slotsOpen,
  memberCount,
  locationText,
  genderWanted,
  pricePerPerson,
  utilitiesIncluded,
  coverUrl,
  qrValue,
  displayUrl,
}: PosterProps) {
  const genderLine = genderPosterLine(genderWanted);
  return (
    <div
      style={{ width: `${POSTER_WIDTH}px`, height: `${POSTER_HEIGHT}px` }}
      className="relative flex flex-col overflow-hidden bg-ink px-[65px] py-[65px] font-sans text-white"
    >
      <PosterGrid />

      <div className="relative flex items-center justify-between">
        <PosterLogo />
        <p className="font-mono text-[30px] font-medium tracking-[6px] text-hl">TÌM BẠN Ở GHÉP</p>
      </div>

      <div className="relative mt-[44px]">
        <h2 className="font-display text-[84px] leading-[92px] font-bold tracking-[-1.6px]">{listingHeadline(slotsOpen)}</h2>
        {genderLine && <p className="mt-2 font-display text-[44px] leading-[52px] font-semibold text-hl">{genderLine}</p>}
      </div>

      <div className="relative mt-[36px] min-h-[240px] flex-1 overflow-hidden rounded-[28px] bg-ink-soft">
        {coverUrl ? (
          <img src={coverUrl} alt="" crossOrigin="anonymous" className="size-full object-cover" />
        ) : (
          <CoverPlaceholder />
        )}
      </div>

      <div className="relative mt-[36px] flex items-end gap-6">
        <p className="font-mono text-[96px] leading-[100px] font-bold tracking-[-2px] text-hl">{formatVnd(pricePerPerson)}</p>
        <p className="pb-2 text-[30px] leading-[38px] text-ink-on2">
          /người/tháng · {utilitiesIncluded ? 'đã gồm điện nước' : 'chưa gồm điện nước'}
        </p>
      </div>

      <div className="relative mt-[28px] flex items-center gap-4">
        <div className="flex min-h-[76px] min-w-0 items-center gap-3 rounded-[40px] border border-ink-line bg-ink-soft px-8 py-2 text-[32px] leading-[38px] font-medium">
          <MapPin className="size-[36px] shrink-0 text-hl" aria-hidden />
          <span className="line-clamp-2">{locationText}</span>
        </div>
        <div className="flex h-[76px] shrink-0 items-center gap-3 rounded-[40px] border border-ink-line bg-ink-soft px-8 text-[32px] font-medium whitespace-nowrap">
          <Users className="size-[36px] shrink-0 text-hl" aria-hidden />
          Đang có {memberCount} người
        </div>
      </div>

      <div className="relative mt-[32px] flex items-center gap-[40px] rounded-[28px] bg-white p-[40px] text-ink">
        <QRCodeSVG
          value={qrValue}
          size={POSTER_QR_SIZE}
          level="H"
          marginSize={4}
          bgColor="#FFFFFF"
          fgColor="#1C2333"
          imageSettings={{ src: QR_LOGO, width: QR_LOGO_SIZE, height: QR_LOGO_SIZE, excavate: true }}
          className="shrink-0"
        />
        <div className="min-w-0">
          <p className="text-[38px] leading-[50px] font-semibold">Quét để xem ảnh, chi phí và lịch trực</p>
          <p className="mt-3 font-mono text-[30px] leading-[38px] font-medium break-all text-ink-2">{displayUrl}</p>
        </div>
      </div>
    </div>
  );
}
