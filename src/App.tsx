import { QueryClientProvider } from '@tanstack/react-query';
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router';
import { Toaster } from 'sonner';
import { queryClient } from '@/lib/query-client.ts';
import { LoginPage } from '@/pages/LoginPage.tsx';
import { OnboardingPage } from '@/pages/OnboardingPage.tsx';
import { RegisterPage } from '@/pages/RegisterPage.tsx';
import { GuestRoute, ProtectedRoute } from '@/routes/ProtectedRoute.tsx';

const router = createBrowserRouter([
  { path: '/', element: <Navigate to="/onboarding" replace /> },
  {
    element: <GuestRoute />,
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [{ path: '/onboarding', element: <OnboardingPage /> }],
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
