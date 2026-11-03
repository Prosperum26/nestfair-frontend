import { ListOrdered } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/cn.ts';
import { type LegalDoc, tocOf } from '../types.ts';

/** Mục đang đọc: mục cuối cùng đã cuộn qua mép trên khung nhìn (dưới header). Không có IntersectionObserver thì giữ mục đầu. */
function useActiveSection(ids: string[]): string {
  const [active, setActive] = useState(ids[0] ?? '');
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    const seen = new Map<string, boolean>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) seen.set(e.target.id, e.isIntersecting || e.boundingClientRect.top < 0);
        const current = [...ids].reverse().find((id) => seen.get(id));
        if (current) setActive(current);
      },
      { rootMargin: '-96px 0px -60% 0px' },
    );
    for (const id of ids) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [ids]);
  return active;
}

function TocList({ doc, active, onPick }: { doc: LegalDoc; active: string; onPick?: () => void }) {
  return (
    <ol className="flex flex-col gap-0.5">
      {tocOf(doc).map((t) => (
        <li key={t.id}>
          <a
            href={`#${t.id}`}
            onClick={onPick}
            aria-current={active === t.id ? 'location' : undefined}
            className={cn(
              'flex items-baseline gap-2.5 rounded-btn-sm px-2.5 py-1.5 text-sm focus-visible:outline-none focus-visible:shadow-focus',
              active === t.id ? 'bg-hl-soft font-semibold text-ink' : 'text-ink-2 hover:bg-paper-2 hover:text-ink',
            )}
          >
            <span className="w-5 shrink-0 font-mono text-cap text-ink-3">{String(t.number).padStart(2, '0')}</span>
            {t.title}
          </a>
        </li>
      ))}
    </ol>
  );
}

/**
 * Văn bản pháp lý dễ đọc: mục lục dính bên trái trên desktop (gập lại thành "Mục lục" trên mobile),
 * mỗi mục có số thứ tự, tiêu đề, đoạn văn tối đa ~68 ký tự một dòng và gạch đầu dòng vuông màu highlight.
 */
export function LegalDocument({ doc }: { doc: LegalDoc }) {
  const ids = doc.sections.map((s) => s.id);
  const active = useActiveSection(ids);

  return (
    <div className="grid gap-8 lg:grid-cols-[280px_1fr] lg:gap-14">
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <details className="group rounded-card border border-line bg-surface lg:hidden">
          <summary className="flex h-12 cursor-pointer list-none items-center gap-2 px-4 text-btns text-ink focus-visible:outline-none focus-visible:shadow-focus [&::-webkit-details-marker]:hidden">
            <ListOrdered className="size-4" aria-hidden />
            Mục lục
          </summary>
          <div className="border-t border-line p-2">
            <TocList doc={doc} active={active} />
          </div>
        </details>
        <nav aria-label="Mục lục" className="hidden rounded-card border border-line bg-surface p-3 lg:block">
          <p className="px-2.5 pt-1 pb-2 font-mono text-over uppercase text-ink-2">Mục lục</p>
          <TocList doc={doc} active={active} />
        </nav>
      </aside>

      <article className="min-w-0 rounded-card border border-line bg-surface px-5 py-8 sm:px-8 lg:px-12 lg:py-12">
        <p className="font-mono text-cap text-ink-2">Cập nhật lần cuối {doc.updated}</p>
        <div className="mt-6 flex flex-col gap-10 lg:gap-12">
          {doc.sections.map((s, i) => (
            <section key={s.id} id={s.id} aria-labelledby={`${s.id}-title`} className="scroll-mt-24">
              <h2 id={`${s.id}-title`} className="flex items-baseline gap-3 font-display text-ct text-ink lg:text-h1m">
                <span className="font-mono text-cap font-medium text-ink-3" aria-hidden>
                  {String(i + 1).padStart(2, '0')}
                </span>
                {s.title}
              </h2>
              <div className="mt-4 flex max-w-[68ch] flex-col gap-4 text-b text-ink">
                {s.paragraphs?.map((p) => (
                  <p key={p} className="leading-7 text-pretty">
                    {p}
                  </p>
                ))}
                {s.items && (
                  <ul className="flex flex-col gap-2.5">
                    {s.items.map((it) => (
                      <li key={it} className="flex gap-3 leading-7 text-pretty">
                        <span aria-hidden className="mt-[11px] size-2 shrink-0 rounded-[2px] bg-hl ring-1 ring-ink" />
                        <span>{it}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>
          ))}
        </div>
      </article>
    </div>
  );
}
