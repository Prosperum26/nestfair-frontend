import { Archive, ChevronDown, RotateCcw, Trash2, TriangleAlert } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button.tsx';
import { Chip } from '@/components/ui/Chip.tsx';
import { EmptyState } from '@/components/ui/EmptyState.tsx';
import { Modal } from '@/components/ui/Modal.tsx';
import { Skeleton } from '@/components/ui/Skeleton.tsx';
import { describeChore } from '../chore-text.ts';
import { messageForError } from '../errors.ts';
import { useArchivedChores, usePurgeChore, useRestoreChore } from '../hooks.ts';
import type { Chore } from '../types.ts';

export interface ArchivedChoresViewProps {
  status: 'loading' | 'error' | 'ready';
  error?: string;
  chores: Chore[];
  /** Id việc đang chạy thao tác (khôi phục / xóa) để khóa nút của đúng dòng đó. */
  busyId: string | null;
  onRetry: () => void;
  onRestore: (chore: Chore) => void;
  onPurge: (chore: Chore) => void;
}

/** Phần hiển thị thuần của mục "Đã lưu trữ": đủ 3 trạng thái loading / lỗi / trống, không gọi mạng. */
export function ArchivedChoresView({ status, error, chores, busyId, onRetry, onRestore, onPurge }: ArchivedChoresViewProps) {
  if (status === 'loading') {
    return (
      <div className="mt-3 flex flex-col gap-3" role="status" aria-busy="true" aria-label="Đang tải việc đã lưu trữ">
        <Skeleton className="h-12" />
        <Skeleton className="h-12" />
      </div>
    );
  }
  if (status === 'error') {
    return (
      <EmptyState
        icon={<TriangleAlert />}
        tone="tom"
        title="Không tải được việc đã lưu trữ"
        description={error}
        action={
          <Button variant="secondary" onClick={onRetry}>
            Thử lại
          </Button>
        }
      />
    );
  }
  if (chores.length === 0) {
    return <EmptyState icon={<Archive />} title="Chưa có việc nào được lưu trữ" description="Việc bạn lưu trữ sẽ nằm ở đây, khôi phục lại được bất cứ lúc nào." />;
  }
  return (
    <ul className="mt-2 divide-y divide-line">
      {chores.map((c) => (
        <li key={c.id} className="flex flex-wrap items-center gap-3 py-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-ink-3">{c.title}</p>
            <p className="mt-0.5 text-cap text-ink-2">{describeChore(c)}</p>
          </div>
          <Chip tone="neutral" size="sm">
            Đã lưu trữ
          </Chip>
          <div className="flex gap-2">
            <Button size="sm" variant="secondary" leftIcon={<RotateCcw />} loading={busyId === c.id} disabled={busyId !== null} onClick={() => onRestore(c)}>
              Khôi phục
            </Button>
            {c.canPurge && (
              <Button size="sm" variant="dangerSoft" leftIcon={<Trash2 />} disabled={busyId !== null} onClick={() => onPurge(c)}>
                Xóa vĩnh viễn
              </Button>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}

/** Mục thu gọn "Đã lưu trữ" của trưởng phòng: khôi phục, hoặc xóa vĩnh viễn việc chưa từng có hoạt động. Chỉ tải khi mở. */
export function ArchivedChores({ houseId }: { houseId: string }) {
  const [open, setOpen] = useState(false);
  const list = useArchivedChores(houseId, open);
  const restore = useRestoreChore(houseId);
  const purge = usePurgeChore(houseId);
  const [confirm, setConfirm] = useState<Chore | null>(null);
  const [error, setError] = useState<string | null>(null);

  const busyId = restore.isPending ? (restore.variables ?? null) : null;
  const closeConfirm = () => {
    setConfirm(null);
    setError(null);
  };

  const onRestore = (chore: Chore) =>
    restore.mutate(chore.id, {
      onSuccess: () => toast(`Đã khôi phục "${chore.title}". Việc đang tạm ngưng, bấm Bật lại để dùng.`),
      onError: (e) => toast(messageForError(e)),
    });

  const onConfirmPurge = () => {
    if (!confirm) return;
    setError(null);
    purge.mutate(confirm.id, {
      onSuccess: () => {
        toast(`Đã xóa vĩnh viễn "${confirm.title}".`);
        closeConfirm();
      },
      onError: (e) => setError(messageForError(e)),
    });
  };

  return (
    <div className="mt-4 border-t border-line pt-3">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="archived-chores"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 rounded-btn-sm py-2 text-left text-sm font-semibold text-ink-2 hover:text-ink"
      >
        <span className="flex items-center gap-2">
          <Archive className="size-4" aria-hidden />
          Đã lưu trữ
        </span>
        <ChevronDown className={open ? 'size-4 rotate-180' : 'size-4'} aria-hidden />
      </button>

      {open && (
        <div id="archived-chores">
          <ArchivedChoresView
            status={list.isPending ? 'loading' : list.isError ? 'error' : 'ready'}
            error={list.isError ? messageForError(list.error) : undefined}
            chores={list.data ?? []}
            busyId={busyId}
            onRetry={() => void list.refetch()}
            onRestore={onRestore}
            onPurge={setConfirm}
          />
        </div>
      )}

      <Modal
        open={!!confirm}
        onClose={closeConfirm}
        title={`Xóa vĩnh viễn "${confirm?.title ?? ''}"?`}
        description="Việc này chưa từng có lịch sử nên được xóa hẳn khỏi hệ thống. Không hoàn tác được."
      >
        {error && (
          <p role="alert" className="mb-4 rounded-btn-sm bg-tom-bg px-3 py-2 text-sm text-tom">
            {error}
          </p>
        )}
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={closeConfirm}>
            Giữ lại
          </Button>
          <Button variant="danger" loading={purge.isPending} onClick={onConfirmPurge}>
            Xóa vĩnh viễn
          </Button>
        </div>
      </Modal>
    </div>
  );
}
