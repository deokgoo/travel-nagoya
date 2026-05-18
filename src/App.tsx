import { AppProvider } from '@/state/AppContext';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { AppContent } from '@/components/AppContent';

function App() {
  return (
    <AppProvider>
      <ErrorBoundary>
        <AppContent />
      </ErrorBoundary>
    </AppProvider>
  );
}

export default App;
