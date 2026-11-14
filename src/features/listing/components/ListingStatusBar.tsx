import { EyeOff } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button.tsx';
import { Chip } from '@/components/ui/Chip.tsx';
import { Modal } from '@/components/ui/Modal.tsx';
import { messageForListingError } from '../errors.ts';
import { useSetListingStatus } from '../hooks.ts';
import type { Listing, ListingStatus } from '../types.ts';

const STATUS_CHIP: Record<ListingStatus, { label: string; tone: 'mint' | 'neutral' | 'tom' }> = {
  OPEN: { label: 'Đang đăng', tone: 'mint' },
  DRAFT: { label: 'Bản nháp', tone: 'neutral' },
  CLOSED: { label: 'Đã đóng', tone: 'tom' },
};

/** Chip trạng thái; chưa có tin thì chưa hiện gì. */
export function ListingStatusChip({ status }: { status: ListingStatus }) {
  const { label, tone } = STATUS_CHIP[status];
  return (
    <Chip tone={tone} icon={status === 'OPEN' ? <span className="size-1.5 rounded-full bg-mint-v" aria-hidden /> : undefined}>
      {label}
    </Chip>
  );
}

/**
 * Cụm điều khiển trạng thái ở đầu trang (ảnh 20): chip, "Tạm ẩn" (đang đăng), "Đóng tin" (nháp hoặc đang đăng).
 * Đăng và mở lại nằm ở nút chính của form vì cần lưu nội dung trước.
 */
export function ListingStatusBar({ houseId, listing, canEdit }: { houseId: string; listing: Listing | null; canEdit: boolean }) {
  const setStatus = useSetListingStatus(houseId);
  const [confirmClose, setConfirmClose] = useState(false);
  if (!listing) return null;

  const change = (status: ListingStatus, done: string) =>
    setStatus.mutate(status, {
      onSuccess: () => {
        setConfirmClose(false);
        toast(done);
      },
      onError: (e) => {
        setConfirmClose(false);
        toast(messageForListingError(e));
      },
    });

  return (
    <div className="flex flex-wrap items-center gap-3">
      <ListingStatusChip status={listing.status} />
      {canEdit && listing.status === 'OPEN' && (
        <Button
          variant="secondary"
          leftIcon={<EyeOff />}
          loading={setStatus.isPending && setStatus.variables === 'DRAFT'}
          disabled={setStatus.isPending}
          onClick={() => change('DRAFT', 'Đã tạm ẩn tin. Link công khai sẽ báo không tìm thấy cho tới khi bạn đăng lại.')}
        >
          Tạm ẩn
        </Button>
      )}
      {canEdit && listing.status !== 'CLOSED' && (
        <Button variant="dangerSoft" disabled={setStatus.isPending} onClick={() => setConfirmClose(true)}>
          Đóng tin
        </Button>
      )}
      <Modal
        open={confirmClose}
        onClose={() => setConfirmClose(false)}
        title="Đóng tin này?"
        description="Trang công khai sẽ báo tin đã đóng và ẩn thông tin liên hệ. Bạn mở lại được bất cứ lúc nào, link và QR giữ nguyên."
      >
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={() => setConfirmClose(false)} disabled={setStatus.isPending}>
            Để sau
          </Button>
          <Button variant="danger" loading={setStatus.isPending} onClick={() => change('CLOSED', 'Đã đóng tin.')}>
            Đóng tin
          </Button>
        </div>
      </Modal>
    </div>
  );
}
