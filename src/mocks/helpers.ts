import { HttpResponse } from 'msw';
import { credentials, csrfToken, mockState } from './state';

import type { FieldErrors } from '../types/api';

const errorTypes: Record<number, string> = {
  400: 'BadRequestException',
  401: 'AuthenticationException',
  404: 'NotFoundException',
  419: 'TokenMismatchException',
  422: 'ValidationException',
};

export function failure(status: number, payload?: FieldErrors) {
  return HttpResponse.json(
    {
      error: {
        type: errorTypes[status],
        message: status === 422 ? 'The given data was invalid.' : `Request failed (${status}).`,
        ...(payload ? { payload } : {}),
      },
    },
    { status },
  );
}

export function checkHeaders({headers, method}: Request) {
  if (headers.get('X-Requested-With') !== 'XMLHttpRequest') {
    return failure(400);
  }

  if (['POST', 'PUT'].includes(method) && headers.get('X-CSRF-TOKEN') !== csrfToken ) {
    return failure(419);
  }
}

export function checkSession() {
  if (!mockState.session || mockState.session.expiresAt <= Date.now()) {
    return failure(401);
  }
}

function validFingerprint(value: string): boolean {
  return /^[a-f0-9]{32}$/.test(value);
}

export function getValidDeviceToken(body: Record<string, unknown>) {
  const deviceToken = mockState.deviceToken;

  if (
    !deviceToken ||
    body.device_session_token !== deviceToken.token ||
    body.fingerprint !== deviceToken.fingerprint
  ) {
    return;
  }

  return deviceToken;
}

function validHttpUrl(value: string): boolean {
  try {
    return ['http:', 'https:'].includes(new URL(value).protocol);
  } catch {
    return false;
  }
}

export function checkBody(body: Record<string, unknown>) {
  if (typeof body.fingerprint !== 'string' || !validFingerprint(body.fingerprint)) {
    return { error: failure(422, { fingerprint: ['Invalid fingerprint.'] }) };
  }

  if (body.email !== credentials.email) {
    return { error: failure(422, { email: ['Unknown email address.'] }) };
  }

  if (body.password !== credentials.password) {
    return { error: failure(422, { password: ['The password is incorrect.'] }) };
  }

  return { fingerprint: body.fingerprint };
}

export function checkWebhookBody(body: Record<string, unknown>) {
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const url = typeof body.url === 'string' ? body.url : '';
  const errors: FieldErrors = {};

  if (!name) {
    errors.name = ['The name field is required.'];
  }

  if (!validHttpUrl(url)) {
    errors.url = ['The url must be a valid HTTP/HTTPS URL.'];
  }

  if (Object.keys(errors).length) {
    return { error: failure(422, errors) };
  }

  return { name, url };
}

export async function readBody(request: Request): Promise<Record<string, unknown>> {
  const body: unknown = await request.json().catch(() => null);

  return body !== null && typeof body === 'object' && !Array.isArray(body)
    ? (body as Record<string, unknown>)
    : {};
}
