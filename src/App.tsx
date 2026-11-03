import { QueryClientProvider } from '@tanstack/react-query';
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router';
import { Toaster } from 'sonner';
import { AppShell } from '@/components/layout/AppShell.tsx';
import { queryClient } from '@/lib/query-client.ts';
import { AuthCallbackPage } from '@/pages/AuthCallbackPage.tsx';
import { ChoresPage } from '@/pages/ChoresPage.tsx';
import { ComingSoonPage } from '@/pages/ComingSoonPage.tsx';
import { DashboardPage } from '@/pages/DashboardPage.tsx';
import { ExpensesPage } from '@/pages/ExpensesPage.tsx';
import { HouseSettingsPage } from '@/pages/HouseSettingsPage.tsx';
import { ListingPage } from '@/pages/ListingPage.tsx';
import { LoginPage } from '@/pages/LoginPage.tsx';
import { MembersPage } from '@/pages/MembersPage.tsx';
import { PaymentsPage } from '@/pages/PaymentsPage.tsx';
import { OnboardingInvitePage } from '@/pages/OnboardingInvitePage.tsx';
import { OnboardingPage } from '@/pages/OnboardingPage.tsx';
import { PublicListingPage } from '@/pages/PublicListingPage.tsx';
import { RegisterPage } from '@/pages/RegisterPage.tsx';
import { GuestRoute, ProtectedRoute } from '@/routes/ProtectedRoute.tsx';
import { HomeRedirect, RequireHouse } from '@/routes/RequireHouse.tsx';

const router = createBrowserRouter([
  // Backend chuyển về đây sau Google OAuth (không đặt trong GuestRoute để còn hiện lỗi).
  { path: '/auth/callback', element: <AuthCallbackPage /> },
  // Trang công khai cho khách: ngoài ProtectedRoute và AppShell.
  { path: '/r/:slug', element: <PublicListingPage /> },
  {
    element: <GuestRoute />,
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      { path: '/', element: <HomeRedirect /> },
      { path: '/onboarding', element: <OnboardingPage /> },
      { path: '/onboarding/invite/:houseId', element: <OnboardingInvitePage /> },
      {
        // Các màn trong nhà: cần ít nhất 1 nhà, dùng chung khung AppShell.
        element: <RequireHouse />,
        children: [
          {
            element: <AppShell />,
            children: [
              { path: '/dashboard', element: <DashboardPage /> },
              // Module chưa làm: thay ComingSoonPage bằng trang thật khi bắt đầu module.
              { path: '/chores', element: <ChoresPage /> },
              { path: '/settings', element: <HouseSettingsPage /> },
              { path: '/expenses', element: <ExpensesPage /> },
              { path: '/payments', element: <PaymentsPage /> },
              { path: '/members', element: <MembersPage /> },
              {
                path: '/assistant',
                element: (
                  <ComingSoonPage
                    overline="Trợ lý AI"
                    title="Trợ lý phòng trọ"
                    description="Hỏi mẹo vặt, xử lý sự cố, tạo nhắc nhở."
                  />
                ),
              },
              { path: '/house/listing', element: <ListingPage /> },
              { path: '/listing', element: <Navigate to="/house/listing" replace /> },
              {
                path: '/profile',
                element: (
                  <ComingSoonPage
                    overline="Tài khoản"
                    title="Hồ sơ"
                    description="Thông tin cá nhân và tài khoản nhận tiền."
                  />
                ),
              },
            ],
          },
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
]);

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <Toaster
        position="top-center"
        toastOptions={{
          unstyled: true,
          // Design.md 2.3: toast nền ink, bóng đặc 3/3 màu hl.
          classNames: {
            toast:
              'flex w-[356px] max-w-[calc(100vw-32px)] items-center gap-3 rounded-btn bg-ink px-4 py-3 text-sm text-white shadow-toast',
          },
        }}
      />
    </QueryClientProvider>
  );
}
