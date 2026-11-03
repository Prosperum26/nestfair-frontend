import { Minus, Plus } from 'lucide-react';
import { useId, useState } from 'react';
import { Link } from 'react-router';
import { cn } from '@/lib/cn.ts';
import { FAQ_ITEMS, nextOpenIndex } from '../faq.ts';
import { SectionHeading } from './SectionHeading.tsx';

/** Hỏi đáp dạng accordion, mở một câu một lúc (câu đầu mở sẵn). Mở / đóng bằng bàn phím, có aria-expanded. */
export function FaqSection() {
  const [open, setOpen] = useState<number | null>(0);
  const baseId = useId();

  return (
    <section id="faq" aria-labelledby="faq-title" className="scroll-mt-16 mx-auto max-w-page px-4 pb-20 lg:px-6 lg:pb-28 xl:px-0">
      <div className="grid gap-10 lg:grid-cols-[320px_1fr] lg:gap-16">
        <SectionHeading
          id="faq-title"
          overline="Hỏi đáp"
          title="Những điều hay được hỏi"
          description={
            <>
              Chưa thấy câu bạn cần? Hỏi trưởng phòng của nhà bạn hoặc{' '}
              <Link to="/contact" className="font-semibold text-ink underline decoration-[1.5px] underline-offset-[3px]">
                nhóm phát triển
              </Link>
              .
            </>
          }
        />
        <ul className="flex flex-col gap-3">
          {FAQ_ITEMS.map((item, i) => {
            const isOpen = open === i;
            const panelId = `${baseId}-panel-${i}`;
            return (
              <li
                key={item.question}
                className={cn('rounded-card bg-surface', isOpen ? 'border-[1.5px] border-ink' : 'border border-line')}
              >
                <h3>
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => setOpen((cur) => nextOpenIndex(cur, i))}
                    className="flex min-h-14 w-full items-center justify-between gap-4 rounded-card px-5 py-4 text-left text-h4 text-ink focus-visible:outline-none focus-visible:shadow-focus"
                  >
                    {item.question}
                    <span
                      aria-hidden
                      className={cn(
                        'flex size-7 shrink-0 items-center justify-center rounded-full border',
                        isOpen ? 'border-ink bg-hl text-ink' : 'border-line-2 text-ink-2',
                      )}
                    >
                      {isOpen ? <Minus className="size-4" /> : <Plus className="size-4" />}
                    </span>
                  </button>
                </h3>
                {isOpen && (
                  <div id={panelId} role="region" aria-label={item.question} className="px-5 pb-5 text-sm text-ink-2">
                    {item.answer}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
