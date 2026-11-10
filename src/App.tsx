import { QueryClientProvider } from '@tanstack/react-query';
import { Suspense, lazy } from 'react';
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router';
import { Toaster } from 'sonner';
import { AppShell } from '@/components/layout/AppShell.tsx';
import { Skeleton } from '@/components/ui/Skeleton.tsx';
import { queryClient } from '@/lib/query-client.ts';
import { AuthCallbackPage } from '@/pages/AuthCallbackPage.tsx';
import { ChoresPage } from '@/pages/ChoresPage.tsx';
import { ContactPage } from '@/pages/ContactPage.tsx';
import { DashboardPage } from '@/pages/DashboardPage.tsx';
import { ExpensesPage } from '@/pages/ExpensesPage.tsx';
import { HouseManagePage } from '@/pages/HouseManagePage.tsx';
import { ListingPage } from '@/pages/ListingPage.tsx';
import { LoginPage } from '@/pages/LoginPage.tsx';
import { MembersPage } from '@/pages/MembersPage.tsx';
import { ProfilePage } from '@/pages/ProfilePage.tsx';
import { PaymentsPage } from '@/pages/PaymentsPage.tsx';
import { PrivacyPage } from '@/pages/PrivacyPage.tsx';
import { ScanReceiptPage } from '@/pages/ScanReceiptPage.tsx';
import { OnboardingInvitePage } from '@/pages/OnboardingInvitePage.tsx';
import { OnboardingPage } from '@/pages/OnboardingPage.tsx';
import { PublicListingPage } from '@/pages/PublicListingPage.tsx';
import { RegisterPage } from '@/pages/RegisterPage.tsx';
import { TermsPage } from '@/pages/TermsPage.tsx';
import { LandingRoute } from '@/routes/LandingRoute.tsx';
import { GuestRoute, ProtectedRoute } from '@/routes/ProtectedRoute.tsx';
import { RequireHouse } from '@/routes/RequireHouse.tsx';

// Màn chat Trợ lý là màn nặng nhất (markdown + form chi tiêu) nên tách chunk, nạp khi vào trang.
const AssistantPage = lazy(() => import('@/pages/AssistantPage.tsx').then((m) => ({ default: m.AssistantPage })));

const router = createBrowserRouter([
  // Backend chuyển về đây sau Google OAuth (không đặt trong GuestRoute để còn hiện lỗi).
  { path: '/auth/callback', element: <AuthCallbackPage /> },
  // Trang công khai cho khách: ngoài ProtectedRoute và AppShell.
  { path: '/r/:slug', element: <PublicListingPage /> },
  // Trang công khai: ai cũng xem được, kể cả khi chưa đăng nhập.
  { path: '/', element: <LandingRoute /> },
  { path: '/terms', element: <TermsPage /> },
  { path: '/privacy', element: <PrivacyPage /> },
  { path: '/contact', element: <ContactPage /> },
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
              { path: '/chores', element: <ChoresPage /> },
              { path: '/house', element: <HouseManagePage /> },
              // Cài đặt việc nhà đã gộp vào tab của /house; giữ đường cũ để link và dấu trang không chết.
              { path: '/settings', element: <Navigate to="/house?tab=chores" replace /> },
              { path: '/expenses', element: <ExpensesPage /> },
              { path: '/expenses/scan', element: <ScanReceiptPage /> },
              { path: '/payments', element: <PaymentsPage /> },
              { path: '/members', element: <MembersPage /> },
              {
                path: '/assistant',
                element: (
                  <Suspense
                    fallback={
                      <div className="flex flex-col gap-4" aria-busy="true" aria-label="Đang tải trợ lý">
                        <Skeleton className="h-10 w-64" />
                        <Skeleton className="h-[480px] w-full rounded-card" />
                      </div>
                    }
                  >
                    <AssistantPage />
                  </Suspense>
                ),
              },
              { path: '/house/listing', element: <ListingPage /> },
              { path: '/listing', element: <Navigate to="/house/listing" replace /> },
              { path: '/profile', element: <ProfilePage /> },
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
