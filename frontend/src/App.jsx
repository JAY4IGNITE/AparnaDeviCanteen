import { Suspense } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { CartProvider } from './context/CartContext';
import LoadingState from './components/ui/LoadingState';
import ScrollToTop from './components/ui/ScrollToTop';
import ClickSpark from './components/ClickSpark';
import ErrorBoundary from './components/ErrorBoundary';
import AppRoutes from './AppRoutes';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <CartProvider>
            <ClickSpark
            sparkColor="#f97316"
            sparkSize={10}
            sparkRadius={18}
            sparkCount={8}
            duration={450}
          >
            <Router>
              <ScrollToTop />
              <ErrorBoundary>
                <Suspense fallback={<LoadingState />}>
                  <AppRoutes />
                </Suspense>
              </ErrorBoundary>
            </Router>
            </ClickSpark>
          </CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
