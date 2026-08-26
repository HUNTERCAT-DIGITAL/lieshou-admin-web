import { BrowserRouter } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary';
import { routes } from './routes';

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>{routes}</BrowserRouter>
    </ErrorBoundary>
  );
}
