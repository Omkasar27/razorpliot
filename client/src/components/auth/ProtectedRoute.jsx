import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.jsx';

export default function ProtectedRoute({ role }) {
  const { firebaseUser, appUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-[var(--color-ink)]/50">
        Loading…
      </div>
    );
  }

  if (!firebaseUser || !appUser) {
    return <Navigate to="/login" replace />;
  }

  if (role && appUser.role !== role) {
    return <Navigate to={appUser.role === 'merchant' ? '/merchant' : '/shop'} replace />;
  }

  return <Outlet />;
}