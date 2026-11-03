import { useCallback, useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { endSession, isCurrentSession, onUnauthorized, startSession } from '../api/client';
import { authApi } from '../api/auth';
import { AuthContext } from './context';

import type { PropsWithChildren } from 'react';
import type { AuthUser, LoginInput } from '../types/auth';

export function AuthProvider({ children }: PropsWithChildren) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<AuthUser>();
  const [sessionExpired, setSessionExpired] = useState(false);

  const clearSession = useCallback(() => {
    endSession();
    setUser(undefined);
    void queryClient.cancelQueries();
    queryClient.clear();
  }, [queryClient]);

  async function login(input: LoginInput) {
    await authApi.login(input);
    const sessionId = startSession();
    const currentUser = await authApi.getCurrentUser();

    if (isCurrentSession(sessionId)) {
      setSessionExpired(false);
      setUser(currentUser);
    }
  }

  async function logout() {
    setSessionExpired(false);
    clearSession();
    await authApi.logout();
  }

  useEffect(
    () =>
      onUnauthorized(() => {
        setSessionExpired(true);
        clearSession();
      }),
    [clearSession],
  );

  return (
    <AuthContext.Provider value={{ user, authenticated: !!user, sessionExpired, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
