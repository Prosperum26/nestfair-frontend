import { useParams } from 'react-router';
import { PageHeader } from '@/components/ui/PageHeader.tsx';

/** Trang công khai /r/:slug, nằm ngoài ProtectedRoute và AppShell. Bản khung: nội dung làm ở F7. */
export function PublicListingPage() {
  const { slug } = useParams();
  return (
    <main className="mx-auto min-h-dvh max-w-[1200px] bg-paper px-4 py-8">
      <PageHeader overline="Tìm người ở ghép" title="Tin tìm bạn ở ghép" description={`Mã tin: ${slug ?? ''}`} />
    </main>
  );
}
