import { toast } from 'sonner';
import { Chip } from '@/components/ui/Chip.tsx';
import { Switch } from '@/components/ui/Switch.tsx';
import type { PublicUser } from '@/features/auth/types.ts';
import { profileErrorMessage } from '../errors.ts';
import { useSetNotifications } from '../hooks.ts';
import { resolveNotificationPrefs } from '../notification-prefs.ts';
import { ProfileSection } from './ProfileSection.tsx';

function Row({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-line py-4 first:pt-0 last:border-b-0 last:pb-0">
      <div className="min-w-0">
        <p className="text-sm font-medium text-ink">{title}</p>
        <p className="mt-0.5 text-cap text-ink-2">{description}</p>
      </div>
      {children}
    </div>
  );
}

/**
 * Chỉ công tắc "bản tin việc nhà" đang điều khiển được hành vi thật (cron 08:00 bỏ qua người đã tắt).
 * Hai loại còn lại chưa có nơi gửi thông báo riêng nên hiện "Sắp có" thay vì một công tắc không làm gì.
 */
export function NotificationsSection({ user }: { user: PublicUser }) {
  const set = useSetNotifications();
  const prefs = resolveNotificationPrefs(user.notificationPrefs);

  return (
    <ProfileSection id="profile-notifications" title="Thông báo">
      <Row title="Bản tin việc nhà mỗi sáng" description="Lúc 08:00, Trợ lý gửi các ca trực của bạn trong ngày.">
        <Switch
          label="Bản tin việc nhà mỗi sáng"
          checked={prefs.choreDigest}
          disabled={set.isPending}
          onChange={(choreDigest) =>
            set.mutate(
              { choreDigest },
              {
                onSuccess: () => toast(choreDigest ? 'Đã bật bản tin việc nhà.' : 'Đã tắt bản tin việc nhà.'),
                onError: (e) => toast.error(profileErrorMessage(e)),
              },
            )
          }
        />
      </Row>
      <Row title="Khi có khoản chi mới" description="Ai đó thêm hóa đơn có tên bạn.">
        <Chip size="sm">Sắp có</Chip>
      </Row>
      <Row title="Khi có người trả nợ cho bạn" description="Kèm ảnh bill để bạn xác nhận.">
        <Chip size="sm">Sắp có</Chip>
      </Row>
    </ProfileSection>
  );
}
