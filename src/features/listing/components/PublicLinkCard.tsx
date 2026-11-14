import { Copy, Link as LinkIcon } from 'lucide-react';
import { Button } from '@/components/ui/Button.tsx';
import { copyText } from '@/lib/clipboard.ts';
import { publicUrlDisplay } from '../format.ts';

/** Thẻ "Link công khai": hiện liên kết trang /r/:slug và nút Sao chép. Chưa có tin thì chưa có link. */
export function PublicLinkCard({ publicUrl }: { publicUrl: string | null }) {
  return (
    <section aria-labelledby="listing-link-title" className="rounded-card border border-line bg-surface p-4 sm:p-6">
      <h2 id="listing-link-title" className="font-display text-ct text-ink">
        Link công khai
      </h2>
      {publicUrl ? (
        <div className="mt-4 flex items-center gap-2 rounded-btn border border-line-2 bg-paper p-1.5 pl-3.5">
          <LinkIcon className="size-[18px] shrink-0 text-ink-3" aria-hidden />
          <span className="min-w-0 flex-1 truncate font-mono text-ms text-ink" title={publicUrl}>
            {publicUrlDisplay(publicUrl)}
          </span>
          <Button variant="secondary" leftIcon={<Copy />} onClick={() => void copyText(publicUrl, 'Đã sao chép link tin.')}>
            Sao chép
          </Button>
        </div>
      ) : (
        <p className="mt-2 text-sm text-ink-2">Lưu nháp để có link công khai. Link chỉ mở được cho người xem khi tin đang đăng.</p>
      )}
    </section>
  );
}
