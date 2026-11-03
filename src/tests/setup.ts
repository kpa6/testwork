import { afterAll, afterEach, beforeAll, beforeEach, vi } from 'vitest';
import { setupServer } from 'msw/node';
import { handlers } from '../mocks/handlers';
import { resetMockState } from '../mocks/state';

export const server = setupServer(...handlers);
export const fingerprint = 'a'.repeat(32);

beforeAll(() => server.listen());

beforeEach(() => {
  vi.stubGlobal('localStorage', { getItem: () => fingerprint });

  const fetch = globalThis.fetch;
  vi.stubGlobal('fetch', (input: RequestInfo | URL, options?: RequestInit) => {
    const url = typeof input === 'string' ? new URL(input, 'http://testwork.test') : input;
    return fetch(url, options);
  });
});

afterEach(() => {
  server.resetHandlers();
  server.events.removeAllListeners();
  vi.unstubAllGlobals();
  resetMockState();
});
afterAll(() => server.close());
