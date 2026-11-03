import { Gift, Hourglass, Send, UserRound } from 'lucide-react';
import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button.tsx';
import { Input } from '@/components/ui/Input.tsx';
import { messageForSwapError } from '../copy.ts';
import { ESCALATE_NOTE, escalateBody, escalateButtons, type EscalateBlocks, recordEscalateError } from '../escalation.ts';
import { useEscalateSwap } from '../hooks.ts';
import { slotLabel } from '../swap-format.ts';
import type { EscalateAction, Swap } from '../types.ts';

const BUTTON_ICON = { ADD_REWARD: Gift, RESEND: Send, SELF: UserRound } as const;

/**
 * Thẻ "Chưa ai nhận ca của bạn" (preview 15 mobile): yêu cầu của bạn đã hết hạn mà chưa ai nhận. Ba lựa chọn:
 * thêm quà và đăng lại, gửi người khác, tự làm. Không chọn gì thì ca vẫn là của bạn.
 * Phần đang gõ dở (số tiền, lời nhắn) nằm trong state của thẻ nên không mất khi danh sách tải lại.
 */
export function ExpiredCard({ houseId, swap }: { houseId: string; swap: Swap }) {
  const escalate = useEscalateSwap(houseId);
  const [blocks, setBlocks] = useState<EscalateBlocks>({});
  const [rewarding, setRewarding] = useState(false);
  const [amountText, setAmountText] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);
  // Mỗi lần thử một lựa chọn giữ cùng key; đổi lựa chọn hoặc nội dung thì key mới.
  const keyRef = useRef<{ id: string; sig: string } | null>(null);
  const slot = swap.fromAssignment;

  const keyFor = (sig: string) => {
    if (!keyRef.current || keyRef.current.sig !== sig) keyRef.current = { id: crypto.randomUUID(), sig };
    return keyRef.current.id;
  };

  const run = (action: EscalateAction) => {
    const built = escalateBody(action, { amountText, note });
    if (!built.ok) {
      setError(built.error);
      return;
    }
    setError(null);
    escalate.mutate(
      { swapId: swap.id, body: built.body, key: keyFor(JSON.stringify(built.body)) },
      {
        onSuccess: (res) => {
          keyRef.current = null;
          toast.success(action === 'SELF' ? 'Ca vẫn là của bạn.' : res.newSwap?.market ? 'Đã đăng lại lên Chợ ca.' : 'Đã gửi cho người khác.');
        },
        onError: (e) => {
          setBlocks((cur) => recordEscalateError(cur, e));
          setError(messageForSwapError(e));
        },
      },
    );
  };

  const buttons = escalateButtons(blocks, escalate.isPending);
  const reason = buttons.find((b) => b.reason)?.reason;
  return (
    <section aria-label="Chưa ai nhận ca của bạn" className="rounded-card border border-tom bg-tom-bg p-4">
      <h2 className="flex items-center gap-2 text-h4 text-tom">
        <Hourglass className="size-4 shrink-0" aria-hidden />
        Chưa ai nhận ca của bạn
      </h2>
      {slot && <p className="mt-1 text-cap text-tom">{slotLabel(slot)} · {swap.market ? 'Chợ ca đã hết hạn' : 'Yêu cầu đã hết hạn'}</p>}

      {rewarding && (
        <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_140px]">
          <Input aria-label="Lời nhắn quà mới" value={note} maxLength={100} placeholder="Lời nhắn quà (ví dụ: Bao ly cà phê)" onChange={(e) => setNote(e.target.value)} />
          <Input
            aria-label="Số tiền quà"
            inputMode="numeric"
            value={amountText}
            placeholder="50.000"
            className="font-mono"
            rightSlot={<span className="font-mono text-ink-2">đ</span>}
            onChange={(e) => setAmountText(e.target.value)}
          />
        </div>
      )}

      <div className="mt-3 flex flex-col gap-2">
        {buttons.map((b) => {
          const Icon = BUTTON_ICON[b.action];
          const isReward = b.action === 'ADD_REWARD';
          return (
            <Button
              key={b.action}
              variant={isReward ? 'accent' : 'secondary'}
              fullWidth
              leftIcon={<Icon />}
              disabled={b.disabled}
              loading={escalate.isPending && escalate.variables?.body.action === b.action}
              onClick={() => (isReward && !rewarding ? setRewarding(true) : run(b.action))}
            >
              {isReward && rewarding ? 'Đăng lại với quà này' : b.label}
            </Button>
          );
        })}
      </div>

      {(error || reason) && (
        <p role="alert" className="mt-2 text-cap text-tom">
          {error ?? reason}
        </p>
      )}
      <p className="mt-2 text-cap text-tom">{ESCALATE_NOTE}</p>
    </section>
  );
}
