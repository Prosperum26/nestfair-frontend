import { ArrowLeft } from 'lucide-react';
import { useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '@/components/ui/Button.tsx';
import { PageHeader } from '@/components/ui/PageHeader.tsx';
import { ExpenseFormModal, type ExpensePrefill } from '@/features/expenses/components/ExpenseFormModal.tsx';
import { ledgerErrorMessage } from '@/features/expenses/errors.ts';
import { prepareImage } from '@/features/expenses/image-upload.ts';
import type { UserBrief } from '@/features/expenses/types.ts';
import { useCurrentHouse, useHouseDetail } from '@/features/houses/hooks.ts';
import { ScanFailure } from '@/features/receipts/components/ScanFailure.tsx';
import { ScanningState } from '@/features/receipts/components/ScanningState.tsx';
import { ScanPicker } from '@/features/receipts/components/ScanPicker.tsx';
import { useScanReceipt } from '@/features/receipts/hooks.ts';
import { type Stage, scanFlowReducer } from '@/features/receipts/scan-flow.ts';
import { useAuthStore } from '@/stores/auth-store.ts';

const PICK: Stage = { kind: 'pick' };

/**
 * Quét hóa đơn (Issue #11): chọn ảnh → đang quét → xác nhận bản nháp, hoặc thất bại → nhập tay.
 * Mọi đường lỗi đều dẫn tới form nhập tay mở sẵn; không có đường nào ghi khoản chi mà người dùng chưa bấm Lưu.
 */
export function ScanReceiptPage() {
  const navigate = useNavigate();
  const { house } = useCurrentHouse();
  const detail = useHouseDetail(house?.id);
  const me = useAuthStore((s) => s.user);
  const scan = useScanReceipt(house?.id);
  const [stage, dispatch] = useReducer(scanFlowReducer, PICK);
  const requestId = useRef(0);
  const [pickError, setPickError] = useState<string | null>(null);
  const [manual, setManual] = useState<{ open: boolean; prefill?: ExpensePrefill }>({ open: false });

  /** Thành viên theo thứ tự vào nhà (backend trả joinedAt tăng dần), cùng cách ExpensesPage lấy. */
  const members: UserBrief[] = useMemo(
    () => (detail.data?.members ?? []).map((m) => ({ id: m.userId, fullName: m.fullName, avatarUrl: m.avatarUrl })),
    [detail.data],
  );

  // Thu hồi URL ảnh xem trước khi rời bước đó hoặc rời trang (tránh rò bộ nhớ).
  const previewUrl = stage.kind === 'pick' ? null : stage.previewUrl;
  useEffect(
    () => () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    },
    [previewUrl],
  );

  const onPick = async (file: File) => {
    if (!house) return;
    setPickError(null);
    let photo: File;
    try {
      photo = await prepareImage(file);
    } catch (e) {
      setPickError(e instanceof Error ? e.message : 'Không đọc được ảnh này, bạn chọn ảnh khác nhé.');
      return;
    }
    const id = ++requestId.current;
    dispatch({ type: 'started', requestId: id, previewUrl: URL.createObjectURL(photo), fileName: file.name, sizeBytes: photo.size });
    scan.mutate(
      { photo, filename: file.name },
      {
        onSuccess: (result) => dispatch({ type: 'succeeded', requestId: id, result }),
        onError: (error) => dispatch({ type: 'errored', requestId: id, message: ledgerErrorMessage(error) }),
      },
    );
  };

  const openManual = (prefill?: ExpensePrefill) => setManual({ open: true, prefill });

  return (
    <>
      <PageHeader
        overline="Chi tiêu · Quét hóa đơn"
        title="Quét hóa đơn"
        description="Chụp hóa đơn, mình đọc giúp rồi bạn kiểm tra trước khi ghi vào sổ."
        actions={
          <Button variant="secondary" leftIcon={<ArrowLeft />} onClick={() => navigate('/expenses')}>
            Về sổ chi
          </Button>
        }
      />

      <div className="mt-8">
        {stage.kind === 'pick' && <ScanPicker onPick={(f) => void onPick(f)} onManual={() => openManual()} error={pickError} />}
        {stage.kind === 'scanning' && (
          <ScanningState previewUrl={stage.previewUrl} fileName={stage.fileName} sizeBytes={stage.sizeBytes} onCancel={() => dispatch({ type: 'cancelled' })} />
        )}
        {stage.kind === 'failed' && (
          <ScanFailure
            previewUrl={stage.previewUrl}
            fileName={stage.fileName}
            sizeBytes={stage.sizeBytes}
            message={stage.message}
            onRetry={() => dispatch({ type: 'reset' })}
            onManual={() =>
              // Có ảnh đã tải lên (server đã trả scan) thì mở form kèm ảnh đó; lỗi chặn từ đầu (hết hạn mức…) thì form trống.
              openManual(stage.result ? { receiptImageUrl: stage.result.imageUrl, receiptScanId: stage.result.scanId } : undefined)
            }
          />
        )}
        {stage.kind === 'review' && (
          // Thay bằng màn xác nhận split-view ở task F5.
          <p className="text-sm text-ink-2" role="status">
            Đã đọc xong: {stage.result.draft.merchant}.
          </p>
        )}
      </div>

      {house && (
        <ExpenseFormModal
          open={manual.open}
          houseId={house.id}
          houseName={house.name}
          members={members}
          meId={me?.id}
          expense={null}
          prefill={manual.prefill}
          onClose={() => setManual((m) => ({ ...m, open: false }))}
          onSaved={() => navigate('/expenses')}
        />
      )}
    </>
  );
}
