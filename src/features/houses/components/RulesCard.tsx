import { ScrollText } from 'lucide-react';
import { rulesLines } from '../rules.ts';

/** Thẻ nội quy chỉ đọc cho mọi thành viên (trang Thành viên). Không có nội quy thì không hiện. */
export function RulesCard({ rules }: { rules: string | null }) {
  const lines = rulesLines(rules);
  if (lines.length === 0) return null;
  return (
    <section aria-labelledby="rules-card-title" className="rounded-card border border-line bg-surface p-5 sm:p-6">
      <p className="flex items-center gap-2 font-mono text-over uppercase text-ink-2">
        <ScrollText className="size-4" aria-hidden />
        Nội quy nhà
      </p>
      <h2 id="rules-card-title" className="mt-1 font-display text-ct text-ink">
        Cả nhà cùng giữ nhé
      </h2>
      <ol className="mt-4 flex flex-col gap-2.5">
        {lines.map((line, i) => (
          <li key={i} className="flex gap-3 text-sm text-ink">
            <span className="w-5 shrink-0 font-mono text-ink-2">{String(i + 1).padStart(2, '0')}</span>
            <span className="min-w-0 break-words">{line}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
