import { ArrowRight, Info, KeyRound, TriangleAlert } from 'lucide-react';
import { type FormEvent, useState } from 'react';
import { useSearchParams } from 'react-router';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button.tsx';
import { CodeInput } from '@/components/ui/CodeInput.tsx';
import { IconTile } from '@/components/ui/IconTile.tsx';
import { ApiError } from '@/lib/api.ts';
import { useJoinHouse } from '../hooks.ts';
import { INVITE_CODE_LENGTH, sanitizeInviteCode } from '../invite-code.ts';
import type { HouseDetail } from '../types.ts';

/** Thẻ "Vào nhà có sẵn" (preview 04): viền ink + bóng đặc 8/8, CTA accent. */
export function JoinHouseCard({ onJoined }: { onJoined: (house: HouseDetail) => void }) {
  // Mở từ link mời (/onboarding?code=K7M2QZ) thì điền sẵn mã.
  const [params] = useSearchParams();
  const [code, setCode] = useState(() => sanitizeInviteCode(params.get('code') ?? ''));
  const [error, setError] = useState<string | null>(null);
  const join = useJoinHouse();

  const submit = (e?: FormEvent) => {
    e?.preventDefault();
    if (code.length < INVITE_CODE_LENGTH) {
      setError('Mã mời gồm 6 ký tự chữ và số.');
      return;
    }
    join.mutate(code, {
      onSuccess: onJoined,
      onError: (err) => {
        // 404 mã sai/hết hạn, 409 đã ở nhà/đủ người, 400 sai định dạng: hiện ngay dưới ô mã.
        if (err instanceof ApiError && [400, 404, 409].includes(err.statusCode)) {
          setError(err.message);
        } else {
          toast(err.message);
        }
      },
    });
  };

  return (
    <section
      aria-labelledby="join-house-title"
      className="flex h-full flex-col rounded-card border-[1.5px] border-ink bg-surface p-5 shadow-hard-lg sm:p-7"
    >
      <IconTile icon={<KeyRound />} tone="lil" size={48} />
      <h2 id="join-house-title" className="mt-5 font-display text-h1m text-ink">
        Vào nhà có sẵn
      </h2>
      <p className="mt-2 text-sm text-ink-2">
        Nhập mã mời gồm 6 ký tự mà trưởng phòng gửi cho bạn.
      </p>

      <form className="mt-6 flex flex-1 flex-col" noValidate onSubmit={submit}>
        <CodeInput
          id="invite-code"
          label="Mã mời 6 ký tự"
          value={code}
          sanitize={sanitizeInviteCode}
          onChange={(v) => {
            setCode(v);
            setError(null);
          }}
          invalid={!!error}
          describedBy={error ? 'invite-code-error' : 'invite-code-hint'}
        />
        {error ? (
          <p
            id="invite-code-error"
            role="alert"
            className="mt-4 flex items-start gap-2 rounded-btn bg-tom-bg px-3.5 py-3 text-sm text-tom"
          >
            <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
            {error}
          </p>
        ) : (
          <p id="invite-code-hint" className="mt-4 flex items-center gap-1.5 text-cap text-ink-2">
            <Info className="size-3.5 shrink-0" aria-hidden />
            Không phân biệt hoa thường · mã hết hạn sau 7 ngày
          </p>
        )}

        <Button
          type="submit"
          variant="accent"
          size="lg"
          fullWidth
          className="mt-8 lg:mt-auto"
          loading={join.isPending}
        >
          Vào nhà
          <ArrowRight aria-hidden />
        </Button>
      </form>
    </section>
  );
}
