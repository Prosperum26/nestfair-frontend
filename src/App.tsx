import { QueryClientProvider } from '@tanstack/react-query';
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router';
import { Toaster } from 'sonner';
import { queryClient } from '@/lib/query-client.ts';
import { LoginPage } from '@/pages/LoginPage.tsx';
import { OnboardingPage } from '@/pages/OnboardingPage.tsx';
import { RegisterPage } from '@/pages/RegisterPage.tsx';
import { ProtectedRoute } from '@/routes/ProtectedRoute.tsx';

const router = createBrowserRouter([
  { path: '/', element: <Navigate to="/login" replace /> },
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  {
    element: <ProtectedRoute />,
    children: [{ path: '/onboarding', element: <OnboardingPage /> }],
  },
  { path: '*', element: <Navigate to="/login" replace /> },
]);

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <Toaster position="top-center" />
    </QueryClientProvider>
  );
}
