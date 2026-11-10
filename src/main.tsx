import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App.tsx';
import { MotionProvider } from './components/MotionProvider.tsx';
import { refreshSession } from './lib/api.ts';
import './index.css';

// Khôi phục phiên từ cookie refresh token đúng một lần khi mở app.
// Gọi ngoài React để StrictMode (chạy effect 2 lần) không gửi 2 request refresh.
void refreshSession();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MotionProvider>
      <App />
    </MotionProvider>
  </StrictMode>,
);
