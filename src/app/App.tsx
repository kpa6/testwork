import { Link, Navigate, Outlet, Route, Routes } from 'react-router';
import { ArrowRightStartOnRectangleIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../auth/context';
import { LoginPage } from '../auth/LoginPage';
import { ProtectedRoute } from '../auth/ProtectedRoute';
import { WebhooksPage } from '../webhooks/WebhooksPage';

function Layout() {
  const { user, logout } = useAuth();

  async function handleLogout() {
    try {
      await logout();
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-sm text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-8">
          <Link className="shrink-0 text-lg font-semibold" to="/webhooks">Smart Sender</Link>

          {user && (
            <div className="flex min-w-0 items-center gap-3">
              <span className="truncate text-slate-500">{user.email}</span>
              <button
                className="shrink-0 rounded-md border border-slate-300 p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                aria-label="Sign out"
                title="Sign out"
                onClick={handleLogout}
              >
                <ArrowRightStartOnRectangleIcon className="size-5" />
              </button>
            </div>
          )}

        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-8">
        <Outlet />
      </main>
    </div>
  );
}

export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/login" element={<LoginPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/webhooks" element={<WebhooksPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/webhooks" replace />} />
      </Route>
    </Routes>
  );
}
