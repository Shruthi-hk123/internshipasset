import {StrictMode, type ComponentType} from 'react';
import {createRoot} from 'react-dom/client';
import { ThemeProvider, type ThemeProviderProps } from 'next-themes';
import App from './App.tsx';
import './index.css';

const AppThemeProvider = ThemeProvider as ComponentType<ThemeProviderProps>;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppThemeProvider attribute="class" defaultTheme="light" storageKey="assetflow-theme">
      <App />
    </AppThemeProvider>
  </StrictMode>,
);
