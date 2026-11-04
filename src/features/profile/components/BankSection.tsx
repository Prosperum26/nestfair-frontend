import { zodResolver } from '@hookform/resolvers/zod';
import { Landmark } from 'lucide-react';
import { useMemo } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';
import { Button } from '@/components/ui/Button.tsx';
import { Chip } from '@/components/ui/Chip.tsx';
import { Field } from '@/components/ui/Field.tsx';
import { Input } from '@/components/ui/Input.tsx';
import type { PublicUser } from '@/features/auth/types.ts';
import { VietQrCode } from '@/features/settlements/components/VietQrCode.tsx';
import { BANKS } from '@/lib/banks.ts';
import { buildVietQrPayload } from '@/lib/vietqr.ts';
import { toBankAccountName } from '@/lib/text.ts';
import { profileErrorMessage } from '../errors.ts';
import { useUpdateProfile } from '../hooks.ts';
import { type BankFormValues, bankSchema, toProfilePayload } from '../schemas.ts';
import { ProfileSection } from './ProfileSection.tsx';

type BankInput = z.input<typeof bankSchema>;

const selectCls =
  'h-12 w-full rounded-btn border border-line-2 bg-surface px-3.5 text-b text-ink focus:border-[1.5px] focus:border-ink focus:shadow-focus focus:outline-none aria-[invalid=true]:border-[1.5px] aria-[invalid=true]:border-tom';

/** Tài khoản nhận tiền: dùng để tạo VietQR khi bạn được trả nợ. Xem trước mã QR ngay khi nhập. */
export function BankSection({ user }: { user: PublicUser }) {
  const update = useUpdateProfile();
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isDirty },
  } = useForm<BankInput, unknown, BankFormValues>({
    resolver: zodResolver(bankSchema),
    mode: 'onTouched',
    values: { bankBin: user.bankBin ?? '', bankAccount: user.bankAccount ?? '' },
  });
  const bin = useWatch({ control, name: 'bankBin' });
  const account = useWatch({ control, name: 'bankAccount' });
  const hasSaved = !!user.bankBin && !!user.bankAccount;
  // BIN lạ (không có trong danh sách) vẫn phải hiện được để không mất lựa chọn đã lưu.
  const unknownBin = bin && !BANKS.some((b) => b.bin === bin) ? bin : null;

  const payload = useMemo(() => {
    const parsed = bankSchema.safeParse({ bankBin: bin, bankAccount: account });
    if (!parsed.success || !parsed.data.bankBin) return null;
    try {
      return buildVietQrPayload({ bin: parsed.data.bankBin, account: parsed.data.bankAccount });
    } catch {
      return null;
    }
  }, [bin, account]);

  const save = (values: BankFormValues, message: string) =>
    update.mutate(toProfilePayload(values), {
      onSuccess: () => toast(message),
      onError: (e) => toast.error(profileErrorMessage(e)),
    });

  return (
    <ProfileSection
      id="profile-bank"
      overline="Dùng để tạo VietQR khi bạn được trả nợ"
      title="Tài khoản nhận tiền"
      aside={hasSaved ? <Chip tone="mint">Đã lưu</Chip> : <Chip>Chưa có</Chip>}
    >
      <form noValidate onSubmit={handleSubmit((v) => save(v, 'Đã lưu tài khoản nhận tiền.'))} className="grid gap-6 lg:grid-cols-[1fr_220px]">
        <div className="flex flex-col gap-5">
          <Field label="Ngân hàng" htmlFor="profile-bank-bin" error={errors.bankBin?.message}>
            <select id="profile-bank-bin" className={selectCls} aria-invalid={!!errors.bankBin} {...register('bankBin')}>
              <option value="">Chọn ngân hàng</option>
              {unknownBin && <option value={unknownBin}>Ngân hàng {unknownBin}</option>}
              {BANKS.map((b) => (
                <option key={b.bin} value={b.bin}>
                  {b.name} · BIN {b.bin}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Số tài khoản" htmlFor="profile-bank-account" error={errors.bankAccount?.message}>
            <Input
              id="profile-bank-account"
              inputMode="numeric"
              autoComplete="off"
              placeholder="1903 6688 0123"
              className="font-mono"
              leftIcon={<Landmark />}
              invalid={!!errors.bankAccount}
              {...register('bankAccount')}
            />
          </Field>
          <Field label="Tên chủ tài khoản" htmlFor="profile-bank-owner" hint="Tự viết hoa, không dấu, lấy từ họ tên của bạn. Cần khớp với tên trong ngân hàng.">
            <Input id="profile-bank-owner" value={toBankAccountName(user.fullName)} readOnly disabled />
          </Field>
          <div className="flex flex-wrap justify-end gap-3">
            {hasSaved && (
              <Button variant="ghost" loading={update.isPending} onClick={() => save({ bankBin: '', bankAccount: '' }, 'Đã xóa tài khoản nhận tiền.')}>
                Xóa tài khoản
              </Button>
            )}
            <Button type="submit" loading={update.isPending} disabled={!isDirty}>
              Lưu tài khoản
            </Button>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center rounded-card bg-paper-2 p-4">
          {payload ? (
            <VietQrCode payload={payload} size={156} caption={false} />
          ) : (
            <p className="px-2 py-10 text-center text-sm text-ink-2">Chọn ngân hàng và nhập số tài khoản để xem trước mã nhận tiền.</p>
          )}
          {payload && <p className="mt-3 text-center text-cap text-ink-2">Xem trước mã nhận tiền của bạn</p>}
        </div>
      </form>
    </ProfileSection>
  );
}
