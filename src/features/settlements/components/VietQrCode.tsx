import { Camera, Copy } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import type { ReactNode } from 'react';
import { bankName } from '@/lib/banks.ts';
import { copyText } from '@/lib/clipboard.ts';
import { cn } from '@/lib/cn.ts';
import { groupAccount } from '@/lib/text.ts';

/** Logo NestFair (ô ink + mái nhà hl, Design.md mục 4) dạng data URI để đặt giữa mã QR. */
const LOGO_SRC = `data:image/svg+xml;utf8,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="9" fill="#1C2333"/>' +
    '<path d="M8 15.5 16 8.5l8 7" fill="none" stroke="#F5D547" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>' +
    '<rect x="10" y="18" width="12" height="2.6" rx="1.3" fill="#F5D547"/><rect x="10" y="22.6" width="12" height="2.6" rx="1.3" fill="#F5D547"/></svg>',
)}`;

/**
 * Ô QR (Design.md mục 4, VietQR): khung trắng r8 viền ink, logo NestFair ở giữa. Mức sửa lỗi H (30%)
 * để logo che giữa mà app ngân hàng vẫn đọc được.
 */
export function VietQrCode({ payload, size = 184, caption = true }: { payload: string; size?: number; caption?: boolean }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="rounded-[14px] border-[1.5px] border-ink bg-surface p-3">
        <QRCodeSVG
          value={payload}
          size={size}
          level="H"
          marginSize={0}
          fgColor="#1C2333"
          bgColor="#FFFFFF"
          title="Mã VietQR chuyển khoản"
          imageSettings={{ src: LOGO_SRC, height: size * 0.2, width: size * 0.2, excavate: true }}
        />
      </div>
      {caption && (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-line-2 bg-surface px-3 py-1 text-cap font-semibold text-ink">
          <Camera className="size-3.5" aria-hidden />
          Quét bằng app ngân hàng bất kỳ
        </span>
      )}
    </div>
  );
}

/** Một dòng thông tin: nhãn trái, giá trị phải (mono nếu là số), nút sao chép tùy chọn. */
export function InfoRow({ label, value, mono, copy }: { label: string; value: ReactNode; mono?: boolean; copy?: { text: string; toast: string } }) {
  return (
    <div className="flex min-h-12 items-center gap-3 border-b border-line py-2 last:border-b-0">
      <span className="shrink-0 text-sm text-ink-2">{label}</span>
      <span className={cn('min-w-0 flex-1 text-right text-sm font-medium break-words text-ink', mono && 'font-mono text-ms')}>{value}</span>
      {copy ? (
        <button
          type="button"
          aria-label={`Sao chép ${label.toLowerCase()}`}
          onClick={() => void copyText(copy.text, copy.toast)}
          className="flex size-8 shrink-0 items-center justify-center rounded-btn-sm border border-line text-ink-2 hover:bg-paper focus-visible:outline-none focus-visible:shadow-focus"
        >
          <Copy className="size-4" aria-hidden />
        </button>
      ) : (
        <span className="size-8 shrink-0" aria-hidden />
      )}
    </div>
  );
}

/** Khối thông tin tài khoản nhận (dùng chung cho modal trả tiền và mã nhận tiền của tôi). */
export function AccountRows({ bin, account, accountName }: { bin: string; account: string; accountName: string }) {
  return (
    <>
      <InfoRow label="Ngân hàng" value={bankName(bin)} />
      <InfoRow label="Số tài khoản" value={groupAccount(account)} mono copy={{ text: account, toast: 'Đã sao chép số tài khoản.' }} />
      <InfoRow label="Chủ tài khoản" value={accountName} />
    </>
  );
}
