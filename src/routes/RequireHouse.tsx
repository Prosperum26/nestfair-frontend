import { RotateCw } from 'lucide-react';
import { Navigate, Outlet } from 'react-router';
import { ShellSkeleton } from '@/components/ShellSkeleton.tsx';
import { Button } from '@/components/ui/Button.tsx';
import { EmptyState } from '@/components/ui/EmptyState.tsx';
import { TriangleAlert } from 'lucide-react';
import { useMyHouses } from '@/features/houses/hooks.ts';

function HousesError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex min-h-svh items-center justify-center bg-paper px-4">
      <EmptyState
        icon={<TriangleAlert />}
        tone="tom"
        title="Không tải được danh sách nhà"
        description="Kiểm tra kết nối mạng rồi thử lại nhé."
        action={
          <Button variant="secondary" leftIcon={<RotateCw />} onClick={onRetry}>
            Thử lại
          </Button>
        }
      />
    </div>
  );
}

/** Các màn trong app cần ít nhất một nhà; chưa có thì về /onboarding. */
export function RequireHouse() {
  const houses = useMyHouses();
  if (houses.isPending) return <ShellSkeleton label="Đang tải nhà của bạn" />;
  if (houses.isError) return <HousesError onRetry={() => void houses.refetch()} />;
  if (houses.data.length === 0) return <Navigate to="/onboarding" replace />;
  return <Outlet />;
}

/** "/": đã có nhà thì vào Tổng quan, chưa thì Onboarding. */
export function HomeRedirect() {
  const houses = useMyHouses();
  if (houses.isPending) return <ShellSkeleton label="Đang tải nhà của bạn" />;
  if (houses.isError) return <HousesError onRetry={() => void houses.refetch()} />;
  return <Navigate to={houses.data.length ? '/dashboard' : '/onboarding'} replace />;
}
