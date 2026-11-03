import { useActionState } from 'react';
import { Navigate, useSearchParams } from 'react-router';
import { ApiError } from '../api/errors';
import { Alert } from '../components/Alert';
import { useAuth } from './context';

import type { LoginAction } from '../types/auth';

export function LoginPage() {
  const { authenticated } = useAuth();
  const [params] = useSearchParams();
  const returnTo = params.get('returnTo');
  const destination = returnTo?.startsWith('/webhooks') ? returnTo : '/webhooks';

  if (!authenticated) {
    return <LoginForm />;
  }

  return <Navigate to={destination} replace />;
}

function LoginForm() {
  const { login, sessionExpired } = useAuth();
  const handleLogin: LoginAction = async (_previousState, formData) => {
    const formValues = {
      email: String(formData.get('email') ?? ''),
      password: String(formData.get('password') ?? ''),
    };
  
    const errors = {
      email: formValues.email ? undefined : 'Enter your email address.',
      password: formValues.password ? undefined : 'Enter your password.',
    };

    if (errors.email || errors.password) {
      return { values: formValues, errors };
    }

    try {
      await login(formValues);
    } catch (error) {
      if (error instanceof ApiError && error.status === 422) {
        const errors = { email: error.fields.email?.[0], password: error.fields.password?.[0] };

        if (errors.email || errors.password) {
          return { values: formValues, errors };
        }
      }

      return {
        values: formValues,
        errors: { root: error instanceof Error ? error.message : 'Could not sign in.' },
      };
    }

    return { values: formValues, errors: {} };
  };

  const [{ values, errors }, loginAction, isPending] = useActionState(handleLogin, {
    values: { email: '', password: '' },
    errors: {},
  });

  return (
    <section className="mx-auto mt-8 max-w-sm">
      <h1 className="text-2xl font-semibold">Sign in</h1>

      {sessionExpired && (
        <Alert className="mt-6">Your session has ended. Please sign in again.</Alert>
      )}

      <form className="mt-8" action={loginAction} noValidate>
        <label className="block font-medium" htmlFor="email">Email</label>
        <input
          className="mt-2 block w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 aria-invalid:border-red-500 aria-invalid:focus:outline-red-500"
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          aria-invalid={!!errors.email}
          defaultValue={values.email}
          disabled={isPending}
        />
        {errors.email && (
          <p className="mt-2 text-red-700" role="alert">{errors.email}</p>
        )}

        <label className="mt-5 block font-medium" htmlFor="password">Password</label>
        <input
          className="mt-2 block w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 aria-invalid:border-red-500 aria-invalid:focus:outline-red-500"
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          aria-invalid={!!errors.password}
          defaultValue={values.password}
          disabled={isPending}
        />
        {errors.password && (
          <p className="mt-2 text-red-700" role="alert">
            {errors.password}
          </p>
        )}

        {errors.root && (
          <Alert className="mt-4">{errors.root}</Alert>
        )}

        <button
          className="mt-6 w-full rounded-md bg-blue-600 px-4 py-2.5 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          type="submit"
          disabled={isPending}
        >
          {isPending ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <p className="mt-6 text-slate-500">
        Demo: <code>oleg@smartsender.test</code> / <code>Testwork123!</code>
      </p>
    </section>
  );
}
