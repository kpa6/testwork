import type { Webhook } from '../types/webhooks';
import type { DeviceToken, Session } from '../types/mocks';

export const credentials = { email: 'oleg@smartsender.test', password: 'Testwork123!' };
export const csrfToken = 'testwork-fixed-csrf-token';
export const sessionDurationMs = 30_000;
export const mockUser = {
  id: 'user-1',
  email: credentials.email,
  first_name: 'Demo',
  last_name: 'User',
  name: 'Demo User',
};

function createMockState() {
  const webhooks: Webhook[] = Array.from({ length: 28 }, (_, index) => ({
    id: String(index + 1),
    name: `Webhook ${String(index + 1).padStart(2, '0')}`,
    url: `https://example.com/webhooks/${index + 1}`,
    active: index % 4 !== 0,
    created_at: '2026-01-01T12:00:00.000Z',
  }));

  return {
    deviceToken: null as DeviceToken | null,
    session: null as Session | null,
    webhooks,
  };
}

export const mockState = createMockState();

export function resetMockState() {
  Object.assign(mockState, createMockState());
}
