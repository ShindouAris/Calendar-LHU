import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register';
import { Analytics } from "@vercel/analytics/react"
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
      <Analytics />
      <Toaster position='top-center' />
    </BrowserRouter>
  </StrictMode>
);

// Đăng ký Service Worker cho PWA (vite-plugin-pwa)
registerSW({ immediate: true });
