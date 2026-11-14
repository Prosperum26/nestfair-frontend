import { LoaderCircle, Send } from 'lucide-react';
import { type KeyboardEvent, useEffect, useRef } from 'react';

const MAX_TEXTAREA_HEIGHT = 120;

/**
 * Ô gửi (ảnh 19): viền ink 1.5, nút gửi vuông bo nền hl viền ink KHÔNG bóng đặc.
 * Enter gửi, Shift+Enter xuống dòng; nội dung do trang giữ (bản nháp) nên lỗi mạng
 * tự động GIỮ nguyên câu đã gõ — chỉ trang xóa khi gửi thành công.
 * Hết hạn mức 30 câu/ngày: `disabled` + `lockNote` "Hẹn bạn vào ngày mai".
 */
export function Composer({
  value,
  onChange,
  onSend,
  sending,
  disabled,
  lockNote,
}: {
  value: string;
  onChange: (value: string) => void;
  onSend: (value: string) => void;
  sending: boolean;
  disabled?: boolean;
  /** Hiện kèm ô khóa (vd. hết hạn mức). */
  lockNote?: string | null;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const canSend = !!value.trim() && !sending && !disabled;

  // Tự giãn theo nội dung, trần ~5 dòng để không chiếm hết thẻ chat.
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, MAX_TEXTAREA_HEIGHT)}px`;
  }, [value]);

  const trySend = () => {
    if (!canSend) return;
    onSend(value);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      trySend();
    }
  };

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-end gap-2 rounded-btn border-[1.5px] border-ink bg-surface p-1.5 pl-4 focus-within:shadow-focus">
        <textarea
          ref={textareaRef}
          rows={1}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          disabled={disabled}
          aria-label="Nhập câu hỏi cho trợ lý"
          placeholder={disabled ? 'Hẹn bạn vào ngày mai' : 'Hỏi trợ lý về chuyện phòng trọ…'}
          className="max-h-[120px] flex-1 resize-none bg-transparent py-2 text-b text-ink outline-none placeholder:text-ink-3 disabled:placeholder:text-ink-3"
        />
        <button
          type="button"
          onClick={trySend}
          disabled={!canSend}
          aria-busy={sending || undefined}
          aria-label={sending ? 'Đang gửi' : 'Gửi'}
          className="flex size-10 max-sm:size-11 shrink-0 items-center justify-center rounded-btn border-[1.5px] border-ink bg-hl text-ink transition-[background-color,translate] duration-[var(--dur-fast)] ease-[var(--ease-out)] hover:bg-hl-soft active:translate-y-px focus-visible:outline-none focus-visible:shadow-focus disabled:pointer-events-none disabled:opacity-[0.38]"
        >
          {sending ? <LoaderCircle className="size-[18px] animate-spin" aria-hidden /> : <Send className="size-[18px]" aria-hidden />}
        </button>
      </div>
      {disabled && lockNote && (
        <p className="text-cap text-ink-2">{lockNote}</p>
      )}
      {!disabled && !lockNote && <p className="sr-only">Enter để gửi, Shift và Enter để xuống dòng.</p>}
    </div>
  );
}
