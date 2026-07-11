import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { UserProvider } from './Context/ContextApt';
import './index.css'
import App from './App.jsx'
import { ThemeProvider } from './Context/ThemeContext.jsx';
import { ToastProvider } from './Context/ToastContext.jsx';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <UserProvider>
          <ToastProvider>
            <App />
          </ToastProvider>
        </UserProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </StrictMode>,
)
