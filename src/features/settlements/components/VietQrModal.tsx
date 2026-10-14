import { Check, Info, LoaderCircle, Upload, X } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button.tsx';
import { Modal } from '@/components/ui/Modal.tsx';
import { Skeleton } from '@/components/ui/Skeleton.tsx';
import { isLedgerStale, ledgerErrorMessage } from '@/features/expenses/errors.ts';
import { usePaymentInfo, useReportTransfer } from '@/features/expenses/hooks.ts';
import { IMAGE_ACCEPT, prepareImage } from '@/features/expenses/image-upload.ts';
import { ApiError } from '@/lib/api.ts';
import { firstName } from '@/lib/date.ts';
import { formatVnd } from '@/lib/format.ts';
import { buildTransferContent, buildVietQrPayload } from '@/lib/vietqr.ts';
import { settlementsApi } from '../api.ts';
import type { PlanTransfer } from '../types.ts';
import { AccountRows, InfoRow, VietQrCode } from './VietQrCode.tsx';

interface PayProps {
  houseId: string;
  houseName: string;
  transfer: PlanTransfer;
  fromName: string;
  toName: string;
  onClose: () => void;
}

function PayBody({ houseId, houseName, transfer, fromName, toName, onClose }: PayProps) {
  const info = usePaymentInfo(houseId, transfer.toUserId);
  const report = useReportTransfer(houseId);
  const [proof, setProof] = useState<{ url: string | null; name: string | null; busy: boolean }>({ url: null, name: null, busy: false });
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const toFirst = firstName(toName);

  const content = buildTransferContent({ houseName, fromName, toName, month: new Date().getMonth() + 1 });
  /** Payload chỉ dựng được khi có tài khoản hợp lệ; lỗi thì vẫn hiện thông tin để chuyển tay. */
  const payload = useMemo(() => {
    if (!info.data) return null;
    try {
      return buildVietQrPayload({ bin: info.data.bankBin, account: info.data.bankAccount, amount: transfer.amount, content });
    } catch {
      return null;
    }
  }, [info.data, transfer.amount, content]);
  const missingAccount = info.error instanceof ApiError && info.error.code === 'PAYMENT_INFO_MISSING';

  const pickProof = async (file: File | undefined) => {
    if (!file) return;
    setError(null);
    setProof({ url: null, name: file.name, busy: true });
    try {
      const photo = await prepareImage(file);
      const { url } = await settlementsApi.uploadProof(houseId, photo, file.name);
      setProof({ url, name: file.name, busy: false });
    } catch (e) {
      setProof({ url: null, name: null, busy: false });
      setError(ledgerErrorMessage(e));
    } finally {
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const submit = () => {
    setError(null);
    report.mutate(
      { toUserId: transfer.toUserId, amount: transfer.amount, ...(proof.url ? { proofUrl: proof.url } : {}) },
      {
        onSuccess: () => {
          toast(`Đã báo chuyển ${formatVnd(transfer.amount)}. Chờ ${toFirst} xác nhận nhé.`);
          onClose();
        },
        onError: (e) => {
          if (isLedgerStale(e)) {
            toast(ledgerErrorMessage(e));
            onClose();
          } else setError(ledgerErrorMessage(e));
        },
      },
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-center rounded-card bg-paper-2 px-4 py-6">
        {info.isPending ? (
          <Skeleton className="size-[210px] rounded-[14px]" />
        ) : payload ? (
          <VietQrCode payload={payload} />
        ) : (
          <p className="max-w-[300px] py-8 text-center text-sm text-ink-2">
            {missingAccount
              ? `${toFirst} chưa cập nhật tài khoản nhận tiền nên chưa tạo được mã QR. Bạn có thể trả tiền mặt rồi báo đã chuyển.`
              : 'Chưa tạo được mã QR. Bạn vẫn có thể chuyển khoản theo thông tin bên dưới.'}
          </p>
        )}
      </div>

      <div>
        {info.data && <AccountRows bin={info.data.bankBin} account={info.data.bankAccount} accountName={info.data.accountName} />}
        <InfoRow label="Số tiền" value={formatVnd(transfer.amount)} mono copy={{ text: String(transfer.amount), toast: 'Đã sao chép số tiền.' }} />
        <InfoRow label="Nội dung" value={content} mono copy={{ text: content, toast: 'Đã sao chép nội dung chuyển khoản.' }} />
      </div>

      <p className="flex items-start gap-2 rounded-btn bg-sky-bg px-4 py-3 text-cap text-sky">
        <Info className="mt-px size-4 shrink-0" aria-hidden />
        <span>
          Kiểm tra đúng tên người nhận trước khi chuyển. Sau đó bấm "Tôi đã chuyển khoản" để {toFirst} xác nhận.
        </span>
      </p>

      {error && (
        <p role="alert" className="rounded-btn bg-tom-bg px-3 py-2.5 text-sm text-tom">
          {error}
        </p>
      )}

      <input ref={fileRef} type="file" accept={IMAGE_ACCEPT} className="hidden" onChange={(e) => void pickProof(e.target.files?.[0])} />
      <div className="grid gap-3 sm:grid-cols-2">
        {proof.name ? (
          <span className="inline-flex h-11 min-w-0 items-center gap-2 rounded-btn border border-line-2 bg-surface px-3 text-sm text-ink max-sm:order-2">
            {proof.busy ? <LoaderCircle className="size-4 shrink-0 animate-spin" aria-hidden /> : <Check className="size-4 shrink-0 text-mint" aria-hidden />}
            <span className="min-w-0 flex-1 truncate">{proof.busy ? 'Đang tải bill…' : proof.name}</span>
            {!proof.busy && (
              <button
                type="button"
                aria-label="Bỏ bill"
                onClick={() => setProof({ url: null, name: null, busy: false })}
                className="flex size-7 shrink-0 items-center justify-center rounded-full text-ink-2 hover:bg-paper-2"
              >
                <X className="size-4" aria-hidden />
              </button>
            )}
          </span>
        ) : (
          <Button variant="secondary" leftIcon={<Upload />} onClick={() => fileRef.current?.click()} className="max-sm:order-2">
            Đính kèm bill
          </Button>
        )}
        <Button leftIcon={<Check />} loading={report.isPending} disabled={proof.busy} onClick={submit}>
          Tôi đã chuyển khoản
        </Button>
      </div>
    </div>
  );
}

/** Trả nợ bằng VietQR (ảnh 10): QR động đúng STK, số tiền, nội dung; báo "đã chuyển" để người nhận xác nhận. */
export function VietQrModal({ open, ...props }: Omit<PayProps, 'transfer'> & { open: boolean; transfer: PlanTransfer | null }) {
  const { transfer } = props;
  return (
    <Modal
      open={open && !!transfer}
      onClose={props.onClose}
      overline="VietQR · Napas 247"
      title={transfer ? `Trả ${formatVnd(transfer.amount)} cho ${firstName(props.toName)}` : 'Trả bằng VietQR'}
    >
      {open && transfer && <PayBody key={`${transfer.fromUserId}-${transfer.toUserId}`} {...props} transfer={transfer} />}
    </Modal>
  );
}
