import { Hammer } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState.tsx';
import { PageHeader } from '@/components/ui/PageHeader.tsx';

/**
 * Trang tạm cho module chưa làm. Người làm module thay route trong App.tsx
 * bằng trang thật (vd. ChoresPage) và xóa dòng dùng ComingSoonPage.
 */
export function ComingSoonPage({
  overline,
  title,
  description,
}: {
  overline: string;
  title: string;
  description: string;
}) {
  return (
    <>
      <PageHeader overline={overline} title={title} description={description} />
      <div className="mt-8 rounded-card border border-line bg-surface">
        <EmptyState
          icon={<Hammer />}
          tone="yellow"
          title="Đang phát triển"
          description="Phần này sẽ có trong các bản cập nhật tới."
        />
      </div>
    </>
  );
}
