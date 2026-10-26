/** 4 chip gợi ý nhanh theo ảnh 19; bấm là gửi ngay (đi qua cùng luồng gửi ở trang, gồm cổng đồng ý D5). */
const QUICK_PROMPTS = ['WC có mùi', 'Bồn rửa bị nghẹt', 'Mẹo tiết kiệm điện', 'Nói sao để bạn bớt ồn?'];

/** Chip pill viền line-2, nền surface, chữ cap — bấm gửi ngay. */
export function QuickChips({ disabled, onPick }: { disabled?: boolean; onPick: (text: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Gợi ý nhanh">
      {QUICK_PROMPTS.map((prompt) => (
        <button
          key={prompt}
          type="button"
          disabled={disabled}
          onClick={() => onPick(prompt)}
          className="inline-flex h-8 items-center rounded-full border border-line-2 bg-surface px-3.5 text-cap text-ink transition-colors hover:bg-paper focus-visible:outline-none focus-visible:shadow-focus disabled:pointer-events-none disabled:opacity-[0.38]"
        >
          {prompt}
        </button>
      ))}
    </div>
  );
}
