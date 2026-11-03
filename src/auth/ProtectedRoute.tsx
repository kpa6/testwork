import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuth } from './context';

export function ProtectedRoute() {
  const { authenticated } = useAuth();
  const { pathname, search } = useLocation();

  if (!authenticated) {
    const params = new URLSearchParams({ returnTo: pathname + search });

    return <Navigate to={`/login?${params}`} replace />;
  }

  return <Outlet />;
}
