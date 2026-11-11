import { Bell } from 'lucide-react';
import { useNavigate } from 'react-router';
import { IconButton } from '@/components/ui/IconButton.tsx';
import { Menu } from '@/components/ui/Menu.tsx';
import { useMarkAllNotificationsRead, useMarkNotificationRead, useNotifications } from '../hooks.ts';
import { NotificationPanel } from './NotificationPanel.tsx';

/**
 * Chuông ở thanh trên: chấm đỏ khi còn thông báo chưa đọc của nhà đang xem, bấm mở bảng thông báo. Bấm một
 * dòng thì đánh dấu đã đọc và sang trang liên quan.
 */
export function NotificationBell({ houseId }: { houseId: string | undefined }) {
  const navigate = useNavigate();
  const query = useNotifications(houseId);
  const markRead = useMarkNotificationRead(houseId ?? '');
  const markAll = useMarkAllNotificationsRead(houseId ?? '');
  const unread = query.data?.unreadCount ?? 0;

  return (
    <Menu
      align="right"
      role="dialog"
      label="Thông báo"
      className="w-[360px] max-w-[calc(100vw-32px)] p-0"
      trigger={({ 'aria-expanded': expanded, onClick }) => (
        <IconButton
          icon={<Bell />}
          label={unread > 0 ? `Thông báo, ${unread} chưa đọc` : 'Thông báo'}
          dot={unread > 0}
          aria-expanded={expanded}
          aria-haspopup="dialog"
          onClick={onClick}
        />
      )}
    >
      {(close) => (
        <NotificationPanel
          status={query.isPending ? 'loading' : query.isError ? 'error' : 'ready'}
          items={query.data?.items ?? []}
          unreadCount={unread}
          now={new Date()}
          onRetry={() => void query.refetch()}
          onReadAll={() => markAll.mutate()}
          onOpen={(n, view) => {
            if (n.readAt === null) markRead.mutate(n.id);
            close();
            navigate(view.to);
          }}
        />
      )}
    </Menu>
  );
}
