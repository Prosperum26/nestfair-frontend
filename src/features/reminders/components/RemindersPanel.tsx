import { Bell, Plus, TriangleAlert, Trash2 } from 'lucide-react';
import { AnimatePresence } from 'motion/react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button.tsx';
import { EmptyState } from '@/components/ui/EmptyState.tsx';
import { Modal } from '@/components/ui/Modal.tsx';
import { Skeleton } from '@/components/ui/Skeleton.tsx';
import { assistantErrorMessage } from '@/features/assistant/errors.ts';
import { cn } from '@/lib/cn.ts';
import { useDeleteReminder, useReminders } from '../hooks.ts';
import type { ReminderDto } from '../types.ts';
import { ReminderFormModal } from './ReminderFormModal.tsx';
import { ReminderRow } from './ReminderRow.tsx';

/** Khối xám nhấp nháy cùng hình dạng một dòng nhắc (ô giờ + tiêu đề + chip). */
export function RemindersSkeleton({ rows = 3, className }: { rows?: number; className?: string }) {
  return (
    <div className={cn('divide-y divide-line', className)} aria-busy="true" aria-label="Đang tải nhắc nhở">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex items-center gap-3 py-4">
          <Skeleton className="h-[52px] w-16 shrink-0 rounded-btn-sm" />
          <div className="flex flex-1 flex-col items-start gap-2">
            <Skeleton className="h-4 w-3/5" />
            <Skeleton className="h-[22px] w-24 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Panel "Nhắc nhở của tôi" (cột phải màn Trợ lý, ảnh 19): overline + tiêu đề + nút Thêm,
 * danh sách dòng nhắc có divider, đủ 3 trạng thái loading / trống / lỗi (thử lại).
 * Xóa có bước xác nhận; sửa / tạo dùng chung ReminderFormModal.
 */
export function RemindersPanel({ className }: { className?: string }) {
  const reminders = useReminders('upcoming');
  const remove = useDeleteReminder();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ReminderDto | null>(null);
  const [deleting, setDeleting] = useState<ReminderDto | null>(null);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (reminder: ReminderDto) => {
    setEditing(reminder);
    setFormOpen(true);
  };
  const closeForm = () => setFormOpen(false);

  // mutateAsync: nhắc vừa xóa biến khỏi danh sách nên dòng này có thể bị gỡ trước khi callback chạy.
  const doDelete = () => {
    if (!deleting) return;
    remove.mutateAsync(deleting.id).then(
      () => {
        toast(`Đã xóa "${deleting.title}".`);
        setDeleting(null);
      },
      (e: unknown) => toast(assistantErrorMessage(e)),
    );
  };

  return (
    <section className={cn('flex flex-col rounded-card border border-line bg-surface p-4 sm:p-6', className)}>
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-mono text-over uppercase text-ink-2">Gửi qua thông báo</p>
          <h2 className="mt-1 font-display text-ct text-ink">Nhắc nhở của tôi</h2>
        </div>
        <Button variant="secondary" size="sm" leftIcon={<Plus />} onClick={openCreate}>
          Thêm
        </Button>
      </header>

      <div className="mt-4 flex flex-1 flex-col">
        {reminders.isPending ? (
          <RemindersSkeleton />
        ) : reminders.isError ? (
          <EmptyState
            icon={<TriangleAlert />}
            tone="tom"
            title="Chưa tải được nhắc nhở"
            description="Kiểm tra kết nối mạng rồi thử lại nhé."
            action={
              <Button variant="secondary" onClick={() => void reminders.refetch()}>
                Thử lại
              </Button>
            }
          />
        ) : reminders.data.length === 0 ? (
          <EmptyState
            icon={<Bell />}
            title="Chưa có nhắc nào"
            description="Thêm mới hoặc nhờ Trợ lý tạo giúp bạn."
            action={
              <Button variant="accent" leftIcon={<Plus />} onClick={openCreate}>
                Thêm nhắc
              </Button>
            }
          />
        ) : (
          <ul className="divide-y divide-line">
            <AnimatePresence initial={false}>
              {reminders.data.map((reminder) => (
                <ReminderRow key={reminder.id} reminder={reminder} className="py-4" onEdit={openEdit} onDelete={setDeleting} />
              ))}
            </AnimatePresence>
          </ul>
        )}
      </div>

      <ReminderFormModal open={formOpen} reminder={editing} onClose={closeForm} />

      <Modal
        open={!!deleting}
        onClose={() => setDeleting(null)}
        title="Xóa nhắc này?"
        description={deleting ? `"${deleting.title}" sẽ bị xóa, bạn sẽ không nhận được thông báo nhắc này nữa.` : undefined}
      >
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setDeleting(null)}>
            Giữ lại
          </Button>
          <Button variant="danger" leftIcon={<Trash2 />} loading={remove.isPending} onClick={doDelete}>
            Xóa nhắc
          </Button>
        </div>
      </Modal>
    </section>
  );
}
