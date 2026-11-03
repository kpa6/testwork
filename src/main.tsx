import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router';
import { App } from './app/App';
import { AuthProvider } from './auth/AuthProvider';
import './styles.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
});

await (await import('./mocks/browser')).worker.start();

createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>,
);
