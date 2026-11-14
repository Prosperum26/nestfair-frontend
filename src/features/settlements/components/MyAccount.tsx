import { Copy, Landmark } from 'lucide-react';
import { Link } from 'react-router';
import { Button } from '@/components/ui/Button.tsx';
import { Modal } from '@/components/ui/Modal.tsx';
import type { PublicUser } from '@/features/auth/types.ts';
import { copyText } from '@/lib/clipboard.ts';
import { groupAccount, toBankAccountName } from '@/lib/text.ts';
import { buildVietQrPayload } from '@/lib/vietqr.ts';
import { bankName } from '@/lib/banks.ts';
import { AccountRows, VietQrCode } from './VietQrCode.tsx';

/** QR tĩnh (không số tiền) của tài khoản mình; null nếu chưa có tài khoản hoặc STK không hợp lệ. */
function staticPayload(me: PublicUser | null): string | null {
  if (!me?.bankBin || !me.bankAccount) return null;
  try {
    return buildVietQrPayload({ bin: me.bankBin, account: me.bankAccount });
  } catch {
    return null;
  }
}

function MissingAccount() {
  return (
    <div className="flex flex-col items-start gap-3">
      <p className="text-sm text-ink-2">Bạn chưa thêm tài khoản nhận tiền nên bạn cùng phòng chưa quét QR trả bạn được.</p>
      <Link to="/profile" className="text-sm font-semibold text-ink underline decoration-[1.5px] underline-offset-[3px]">
        Thêm tài khoản ở Hồ sơ
      </Link>
    </div>
  );
}

/** "Tài khoản nhận tiền của bạn" (ảnh 09): QR nhỏ + ngân hàng, STK, tên chủ tài khoản. */
export function MyAccountCard({ me }: { me: PublicUser | null }) {
  const payload = staticPayload(me);
  return (
    <section className="rounded-card border border-line bg-surface p-4 sm:p-6">
      <h2 className="font-display text-ct text-ink">Tài khoản nhận tiền của bạn</h2>
      <div className="mt-4">
        {!me?.bankBin || !me.bankAccount ? (
          <MissingAccount />
        ) : (
          <div className="flex items-center gap-4">
            {payload && <VietQrCode payload={payload} size={76} caption={false} />}
            <div className="min-w-0">
              <p className="flex items-center gap-1.5 font-semibold text-ink">
                <Landmark className="size-4 text-ink-2" aria-hidden />
                {bankName(me.bankBin)}
              </p>
              <p className="mt-1 font-mono text-ms text-ink">{groupAccount(me.bankAccount)}</p>
              <p className="text-cap text-ink-2">{toBankAccountName(me.fullName)}</p>
              <Button size="sm" variant="secondary" leftIcon={<Copy />} className="mt-3" onClick={() => void copyText(me.bankAccount!, 'Đã sao chép số tài khoản.')}>
                Sao chép STK
              </Button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

/** "Mã nhận tiền của tôi": QR tĩnh lớn, người trả tự nhập số tiền. */
export function ReceiveQrModal({ open, onClose, me }: { open: boolean; onClose: () => void; me: PublicUser | null }) {
  const payload = staticPayload(me);
  return (
    <Modal open={open} onClose={onClose} overline="VietQR · Napas 247" title="Mã nhận tiền của tôi" description="Bạn cùng phòng quét mã này rồi tự nhập số tiền.">
      {!me?.bankBin || !me.bankAccount ? (
        <MissingAccount />
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex justify-center rounded-card bg-paper-2 px-4 py-6">{payload && <VietQrCode payload={payload} />}</div>
          <div>
            <AccountRows bin={me.bankBin} account={me.bankAccount} accountName={toBankAccountName(me.fullName)} />
          </div>
        </div>
      )}
    </Modal>
  );
}
