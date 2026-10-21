import { TriangleAlert } from 'lucide-react';
import { Checkbox } from '@/components/ui/Checkbox.tsx';
import { WARNING_TEXT } from '../swap-form.ts';
import type { SwapWarning } from '../types.ts';

/** Cảnh báo mềm: không chặn, nhưng người gửi phải tick đã đọc trước khi gửi (acknowledgedWarnings). */
export function WarningChecks({
  warnings,
  acked,
  onToggle,
  idPrefix,
}: {
  warnings: SwapWarning[];
  acked: readonly SwapWarning[];
  onToggle: (w: SwapWarning) => void;
  idPrefix: string;
}) {
  if (warnings.length === 0) return null;
  return (
    <fieldset className="rounded-card border border-line-2 bg-hl-soft/40 p-3">
      <legend className="flex items-center gap-1.5 px-1 text-cap font-semibold text-hl-ink">
        <TriangleAlert className="size-3.5" aria-hidden />
        Lưu ý trước khi gửi
      </legend>
      <div className="flex flex-col gap-2">
        {warnings.map((w) => (
          <Checkbox key={w} id={`${idPrefix}-${w}`} checked={acked.includes(w)} onChange={() => onToggle(w)} label={`${WARNING_TEXT[w]} Mình đã đọc.`} />
        ))}
      </div>
    </fieldset>
  );
}
