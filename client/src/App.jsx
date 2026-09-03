import { AuthProvider } from './hooks/useAuth.jsx';
import AppRoutes from './routes/AppRoutes.jsx';
import { Toaster } from './components/ui/sonner.jsx';

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
      <Toaster />
    </AuthProvider>
  );
}