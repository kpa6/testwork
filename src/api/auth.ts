import { request } from './client';
import { getFingerprint } from './fingerprint';

import type { LoginInput, User } from '../types/auth';

let pendingLogoutRequest: Promise<void> | undefined;

export const authApi = {
  async login(input: LoginInput) {
    if (pendingLogoutRequest) {
      await pendingLogoutRequest.catch(() => undefined);
    }

    const fingerprint = getFingerprint();
    const { device_session_token } = await request<{ device_session_token: string }>(
      '/auth/login',
      {
        method: 'POST',
        headers: { 'X-Captcha-Token': 'testwork' },
        body: { ...input, fingerprint },
      },
    );

    await request('/auth/token/issue', {
      method: 'POST',
      body: { device_session_token, fingerprint },
    });
  },

  getCurrentUser: () => request<User>('/v1/me', { authenticated: true }),

  async logout() {
    const pending = request('/auth/token/revoke', {
      method: 'POST',
      body: { fingerprint: getFingerprint() },
    });
    pendingLogoutRequest = pending;

    try {
      await pending;
    } finally {
      if (pendingLogoutRequest === pending) {
        pendingLogoutRequest = undefined;
      }
    }
  },
};
