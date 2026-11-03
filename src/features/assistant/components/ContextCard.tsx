import { FileText, ListChecks, Lock, MessagesSquare } from 'lucide-react';
import { IconTile } from '@/components/ui/IconTile.tsx';
import { useCurrentHouse } from '@/features/houses/hooks.ts';

/**
 * Thẻ "Trợ lý dựa vào" (cột phải ảnh 19): 3 dòng icon tile 24 + chữ sm, ngăn bằng line —
 * mô tả dữ liệu tối thiểu trợ lý được xem (D13), không phải nút bấm. Dòng riêng tư dưới cùng
 * có icon khóa: bạn cùng phòng không xem được, trợ lý chỉ gợi ý.
 */
export function ContextCard({ className }: { className?: string }) {
  const { house } = useCurrentHouse();
  const rows = [
    { icon: <ListChecks />, text: 'Ca trực tuần này của bạn' },
    { icon: <FileText />, text: house ? `Nội quy ${house.name}` : 'Nội quy nhà' },
    { icon: <MessagesSquare />, text: '10 tin nhắn gần nhất' },
  ];

  return (
    <section className={`flex flex-col rounded-card border border-line bg-surface p-4 sm:p-6 ${className ?? ''}`}>
      <h2 className="font-display text-ct text-ink">Trợ lý dựa vào</h2>
      <ul className="mt-3 divide-y divide-line">
        {rows.map((row) => (
          <li key={row.text} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
            <IconTile size={24} icon={row.icon} />
            <p className="text-sm text-ink">{row.text}</p>
          </li>
        ))}
      </ul>
      <p className="mt-4 flex items-start gap-2 text-cap text-ink-2">
        <Lock className="mt-0.5 size-3.5 shrink-0" aria-hidden />
        <span>Bạn cùng phòng không xem được cuộc trò chuyện này. Trợ lý chỉ dùng số liệu, mọi hành động đều là nút bấm.</span>
      </p>
    </section>
  );
}
