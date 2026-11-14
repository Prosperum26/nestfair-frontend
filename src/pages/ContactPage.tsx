import { Bug, Copy, Mail, ShieldCheck } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { Button } from '@/components/ui/Button.tsx';
import { buttonClass } from '@/components/ui/button-class.ts';
import { IconTile } from '@/components/ui/IconTile.tsx';
import type { Tone } from '@/components/ui/tones.ts';
import { CONTACT_EMAIL, contactMailto } from '@/features/legal/contact.ts';
import { PublicPageShell } from '@/features/legal/components/PublicPageShell.tsx';
import { copyText } from '@/lib/clipboard.ts';
import { usePageTitle } from '@/lib/use-page-title.ts';

function InfoCard({ icon, tone, title, children }: { icon: ReactNode; tone: Tone; title: string; children: ReactNode }) {
  return (
    <section className="rounded-card border border-line bg-surface p-6">
      <IconTile icon={icon} tone={tone} size={40} />
      <h2 className="mt-4 text-h4 text-ink">{title}</h2>
      <div className="mt-2 flex flex-col gap-3 text-sm text-ink-2">{children}</div>
    </section>
  );
}

const linkCls = 'font-semibold text-ink underline decoration-[1.5px] underline-offset-[3px] rounded-btn-sm focus-visible:outline-none focus-visible:shadow-focus';

/** Trang Liên hệ: một địa chỉ email duy nhất, kèm gợi ý nên viết gì để được trả lời nhanh. */
export function ContactPage() {
  usePageTitle('Liên hệ');
  return (
    <PublicPageShell
      current="/contact"
      overline="Liên hệ"
      title="Nói chuyện với nhóm phát triển"
      intro="Gặp lỗi, có góp ý hoặc muốn hỏi về dữ liệu của bạn? Gửi email cho chúng tôi, nhóm sinh viên đang làm NestFair sẽ đọc và trả lời."
    >
      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr] lg:gap-8">
        <section aria-labelledby="mail-title" className="rounded-card border-[1.5px] border-ink bg-surface p-6 shadow-hard sm:p-8">
          <div className="flex items-center gap-3">
            <IconTile icon={<Mail />} tone="yellow" size={44} />
            <div>
              <h2 id="mail-title" className="font-display text-ct text-ink">
                Gửi email cho chúng tôi
              </h2>
              <p className="text-cap text-ink-2">Thường trả lời trong 1–3 ngày làm việc</p>
            </div>
          </div>
          <p className="mt-6 font-mono text-[15px] font-medium break-all text-ink sm:text-[18px]">{CONTACT_EMAIL}</p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <a href={contactMailto('Góp ý / hỏi đáp về NestFair')} className={buttonClass({ variant: 'accent', size: 'lg' })}>
              <Mail aria-hidden />
              Mở ứng dụng thư
            </a>
            <Button
              variant="secondary"
              size="lg"
              leftIcon={<Copy />}
              onClick={() => void copyText(CONTACT_EMAIL, 'Đã sao chép địa chỉ email.')}
            >
              Sao chép địa chỉ
            </Button>
          </div>
        </section>

        <section aria-labelledby="tips-title" className="rounded-card border border-line bg-surface p-6 sm:p-8">
          <h2 id="tips-title" className="font-display text-ct text-ink">
            Viết gì để được giúp nhanh hơn
          </h2>
          <ul className="mt-4 flex flex-col gap-3 text-sm text-ink">
            {[
              'Bạn đang ở màn nào và định làm gì.',
              'Điều gì đã xảy ra so với điều bạn mong đợi.',
              'Ảnh chụp màn hình (nếu có). Hãy che số tài khoản và thông tin cá nhân.',
              'Trình duyệt và điện thoại hoặc máy tính bạn dùng.',
            ].map((t) => (
              <li key={t} className="flex gap-3 leading-6">
                <span aria-hidden className="mt-[9px] size-2 shrink-0 rounded-[2px] bg-hl ring-1 ring-ink" />
                {t}
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2 lg:mt-8 lg:gap-8">
        <InfoCard icon={<Bug />} tone="tom" title="Báo lỗi hoặc góp ý">
          <p>Ghi tiêu đề email rõ ràng, ví dụ “Lỗi chia tiền theo món” để chúng tôi tìm lại dễ hơn.</p>
        </InfoCard>
        <InfoCard icon={<ShieldCheck />} tone="mint" title="Dữ liệu và quyền riêng tư">
          <p>
            Muốn xem, xuất hoặc xóa dữ liệu cá nhân? Gửi email từ địa chỉ bạn đã đăng ký. Chi tiết trong{' '}
            <Link to="/privacy" className={linkCls}>
              Chính sách quyền riêng tư
            </Link>
            , và các quy tắc sử dụng ở{' '}
            <Link to="/terms" className={linkCls}>
              Điều khoản
            </Link>
            .
          </p>
        </InfoCard>
      </div>
    </PublicPageShell>
  );
}
