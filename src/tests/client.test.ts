import { expect, it, vi } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server, fingerprint } from './setup';
import { authApi } from '../api/auth';
import { request, startSession } from '../api/client';
import { mockState, mockUser, sessionDurationMs } from '../mocks/state';

it('shares one rotate between two parallel 401 responses and retries both requests', async () => {
  let unauthorizedCount = 0;
  
  mockState.session = { fingerprint, expiresAt: Date.now() - 1 };
  startSession();

  const unauthorizedResponses = new Promise<void>(resolve => {
    server.events.on('response:mocked', ({ response }) => {
      if (response.status !== 401) return;

      unauthorizedCount += 1;

      if (unauthorizedCount === 2) {
        resolve();
      }
    });
  });

  const rotate = vi.fn(async () => {
    await unauthorizedResponses;

    mockState.session!.expiresAt = Date.now() + sessionDurationMs;
    return new HttpResponse(null, { status: 200 });
  });

  server.use(http.post('*/auth/token/rotate', rotate));

  const [user, webhooks] = await Promise.all([
    authApi.getCurrentUser(),
    request<{ data: unknown[] }>('/v1/webhooks?page=1&limit=10', { authenticated: true }),
  ]);

  expect(unauthorizedCount).toBe(2);
  expect(rotate).toHaveBeenCalledTimes(1);
  expect(user).toEqual(mockUser);
  expect(webhooks.data).toHaveLength(10);
});
