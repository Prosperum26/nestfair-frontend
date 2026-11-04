import { History, RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/Button.tsx';
import { IconTile } from '@/components/ui/IconTile.tsx';
import { Modal } from '@/components/ui/Modal.tsx';
import { Skeleton } from '@/components/ui/Skeleton.tsx';
import { CardEmpty } from '@/features/dashboard/DashCard.tsx';
import { useActivityHistory } from '../hooks.ts';
import { activityLine, activityTime } from '../text.ts';
import type { Activity } from '../types.ts';

/** Một dòng hoạt động: icon tile · câu · giờ (mono). */
export function ActivityRow({ activity, me }: { activity: Activity; me?: string }) {
  const { icon: Icon, text } = activityLine(activity, me);
  return (
    <li className="flex items-start gap-3 border-b border-line py-3 last:border-b-0">
      <IconTile icon={<Icon />} tone="neutral" size={32} />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-ink [overflow-wrap:anywhere]">{text}</p>
        <p className="mt-0.5 font-mono text-cap text-ink-2">{activityTime(activity.createdAt)}</p>
      </div>
    </li>
  );
}

/** Danh sách có đủ 3 trạng thái: đang tải (skeleton) / lỗi (thử lại) / trống. */
export function ActivityList({
  items,
  status,
  me,
  onRetry,
  limit,
}: {
  items: Activity[] | undefined;
  status: 'pending' | 'error' | 'success';
  me?: string;
  onRetry: () => void;
  limit?: number;
}) {
  if (status === 'pending') {
    return (
      <div className="flex flex-col gap-3" aria-busy="true" aria-label="Đang tải hoạt động">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-12" />
        ))}
      </div>
    );
  }
  if (status === 'error') {
    return (
      <CardEmpty icon={<History />}>
        Không tải được hoạt động.{' '}
        <button type="button" onClick={onRetry} className="inline-flex items-center gap-1 font-semibold text-ink underline underline-offset-2">
          <RotateCw className="size-3.5" aria-hidden />
          Thử lại
        </button>
      </CardEmpty>
    );
  }
  if (!items?.length) return <CardEmpty icon={<History />}>Chưa có hoạt động nào. Thử check-in ca đầu tiên nhé!</CardEmpty>;
  return (
    <ul className="-my-3">
      {items.slice(0, limit).map((a) => (
        <ActivityRow key={a.id} activity={a} me={me} />
      ))}
    </ul>
  );
}

/** Panel "Hoạt động gần đây": 20 mục một trang, nút tải thêm. */
export function ActivityPanel({ houseId, open, onClose, me }: { houseId: string | undefined; open: boolean; onClose: () => void; me?: string }) {
  const history = useActivityHistory(houseId, open);
  const items = history.data?.pages.flat();
  return (
    <Modal open={open} onClose={onClose} title="Hoạt động gần đây" description="Việc nhà, vòng quay và thành viên của cả nhà.">
      <ActivityList items={items} status={history.status} me={me} onRetry={() => void history.refetch()} />
      {history.hasNextPage && (
        <div className="mt-4 flex justify-center">
          <Button variant="secondary" size="sm" loading={history.isFetchingNextPage} onClick={() => void history.fetchNextPage()}>
            Tải thêm
          </Button>
        </div>
      )}
    </Modal>
  );
}
