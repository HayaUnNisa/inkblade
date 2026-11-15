import React from 'react';
import { Analytics } from '@vercel/analytics/react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { MotionConfig } from 'framer-motion';
import App from './App';
import { ThemeProvider } from './context/ThemeContext';
import { LibraryProvider } from './context/LibraryContext';
import { ToastProvider } from './context/ToastContext';
import { CommandProvider } from './components/CommandPalette';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <MotionConfig reducedMotion="user">
        <ThemeProvider>
          <LibraryProvider>
            <ToastProvider>
              <CommandProvider>
                <App />
                <Analytics />
              </CommandProvider>
            </ToastProvider>
          </LibraryProvider>
        </ThemeProvider>
      </MotionConfig>
    </BrowserRouter>
  </React.StrictMode>,
);
