import { Lock, TriangleAlert } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar.tsx';
import { Chip } from '@/components/ui/Chip.tsx';
import { avatarToneFor } from '@/components/ui/tones.ts';
import { cn } from '@/lib/cn.ts';
import { firstName } from '@/lib/date.ts';
import { pointsLabel, slotLabel } from '../swap-format.ts';
import type { SwapOption } from '../types.ts';

/** Lý do thuộc nhóm "ca đang bị khóa": hiện ổ khóa thay vì cảnh báo. */
const LOCK_CODES = new Set(['SLOT_LOCKED', 'SLOT_NOT_SWAPPABLE']);

/**
 * Một lựa chọn trong modal Đổi ca: ca đích (đổi với bạn) hoặc một thành viên (nhờ trực dùm). Ca không hợp lệ hiện mờ,
 * không chọn được, kèm câu lý do tiếng Việt của backend (không có mã quy tắc).
 * `selfWeight` là độ nặng ca của bạn, để ghi "cùng độ nặng / nặng hơn / nhẹ hơn".
 */
export function SwapOptionCard({
  option,
  name,
  selected,
  onSelect,
  selfWeight,
}: {
  option: SwapOption;
  /** Tên nhóm radio. */
  name: string;
  selected: boolean;
  onSelect: () => void;
  selfWeight?: number;
}) {
  const disabled = !option.valid;
  // EXCHANGE: một thành viên có thể có nhiều ca ứng viên, id phải theo ca để không trùng.
  const whyKey = option.assignmentId ?? option.memberId;
  const title = option.choreTitle && option.occurrenceDate ? slotLabel({ choreTitle: option.choreTitle, occurrenceDate: option.occurrenceDate }) : option.memberName;
  const diff = option.weight !== undefined && selfWeight !== undefined ? option.weight - selfWeight : null;
  const Icon = LOCK_CODES.has(option.reasonCode ?? '') ? Lock : TriangleAlert;
  return (
    <label
      className={cn(
        'flex cursor-pointer items-start gap-3 rounded-card border p-3 transition-colors',
        selected ? 'border-[1.5px] border-ink bg-hl-soft' : 'border-line bg-surface hover:bg-paper',
        disabled && 'cursor-not-allowed opacity-60 hover:bg-surface',
      )}
    >
      <input
        type="radio"
        name={name}
        checked={selected}
        disabled={disabled}
        onChange={onSelect}
        className="mt-1 size-4 shrink-0 accent-ink"
        aria-describedby={disabled ? `${name}-${whyKey}-why` : undefined}
      />
      <Avatar name={option.memberName} tone={avatarToneFor(option.memberId)} size={32} />
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="min-w-0 truncate text-h4 text-ink">{title}</span>
          {diff !== null && !disabled && (
            <Chip tone={diff === 0 ? 'mint' : 'yellow'} size="sm">
              {diff === 0 ? 'Cùng độ nặng' : diff > 0 ? 'Nặng hơn' : 'Nhẹ hơn'}
            </Chip>
          )}
        </span>
        <span className="mt-0.5 block text-cap text-ink-2">
          {option.choreTitle ? `${firstName(option.memberName)} · ` : ''}
          {option.weight !== undefined && <span className="font-mono">{pointsLabel(option.weight)}</span>}
        </span>
        {disabled && option.reasonText && (
          <span id={`${name}-${whyKey}-why`} className="mt-1.5 flex items-start gap-1.5 text-cap text-tom">
            <Icon className="mt-px size-3.5 shrink-0" aria-hidden />
            {option.reasonText}
          </span>
        )}
      </span>
    </label>
  );
}
