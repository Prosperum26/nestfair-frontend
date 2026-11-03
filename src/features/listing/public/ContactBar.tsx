import { MessageCircle, Phone } from 'lucide-react';
import { displayPhone, telLink, zaloLink } from '../contact.ts';

const ZALO_CLASS =
  'inline-flex h-[52px] items-center justify-center gap-2 rounded-btn border-[1.5px] border-ink bg-hl px-6 text-btn font-semibold whitespace-nowrap text-ink shadow-hard transition-colors focus-visible:outline-none focus-visible:shadow-focus active:translate-x-[3px] active:translate-y-[3px] active:shadow-none [&_svg]:size-[18px]';
const CALL_CLASS =
  'inline-flex h-[52px] items-center justify-center gap-2 rounded-btn border border-line-2 bg-surface px-4 text-btn font-semibold whitespace-nowrap text-ink transition-colors hover:bg-paper focus-visible:outline-none focus-visible:shadow-focus [&_svg]:size-[18px]';

/**
 * Liên hệ trưởng phòng. `contact = null` (tin đã đóng hoặc đủ người) thì KHÔNG render gì, để số điện thoại
 * và link Zalo không nằm trong DOM. `bar`: thanh cố định ở đáy trên di động; `card`: khối trong cột phải ở desktop.
 */
export function ContactBar({ contact, variant = 'bar' }: { contact: { phone: string } | null; variant?: 'bar' | 'card' }) {
  if (!contact) return null;
  const { phone } = contact;
  const zalo = (
    <a href={zaloLink(phone)} target="_blank" rel="noopener noreferrer" className={ZALO_CLASS}>
      <MessageCircle aria-hidden />
      {variant === 'bar' ? 'Nhắn Zalo' : 'Nhắn Zalo cho trưởng phòng'}
    </a>
  );

  if (variant === 'card') {
    return (
      <div className="flex flex-col gap-3">
        {zalo}
        <a href={telLink(phone)} className={CALL_CLASS}>
          <Phone aria-hidden />
          Gọi {displayPhone(phone)}
        </a>
        <p className="text-cap text-ink-2">Liên hệ trực tiếp với trưởng phòng. NestFair không thu phí và không giữ tiền cọc.</p>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-30 flex gap-3 border-t border-line bg-paper px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:hidden"
      role="region"
      aria-label="Liên hệ trưởng phòng"
    >
      <span className="min-w-0 flex-1 [&>a]:w-full">{zalo}</span>
      <a href={telLink(phone)} className={CALL_CLASS} aria-label={`Gọi ${displayPhone(phone)}`}>
        <Phone aria-hidden />
      </a>
    </div>
  );
}
