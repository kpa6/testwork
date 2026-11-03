import { ensureCsrf } from './csrf';
import { ApiError } from './errors';
import { getFingerprint } from './fingerprint';

import type { ErrorEnvelope, RequestOptions, RequestState } from '../types/api';

const logoutHandlers = new Set<() => void>();

let sessionId = 0;
let sessionActive = false;
let rotationVersion = 0;
let rotatePromise: Promise<void> | undefined;

export function startSession() {
  sessionId += 1;
  sessionActive = true;
  rotationVersion = 0;
  rotatePromise = undefined;

  return sessionId;
}

export function endSession() {
  if (!sessionActive) return;

  sessionActive = false;
  sessionId += 1;
  rotatePromise = undefined;
}

export function isCurrentSession(id: number) {
  return sessionActive && sessionId === id;
}

function checkSession(id: number) {
  if (!isCurrentSession(id)) {
    throw new DOMException('The session has ended.', 'AbortError');
  }
}

function checkRequestSession(state: RequestState) {
  if (state.authenticated) checkSession(state.sessionId);
}

function expireSession(id: number) {
  if (!isCurrentSession(id)) return;

  endSession();

  for (const handler of logoutHandlers) {
    handler();
  }
}

function rotateSession(id: number) {
  if (rotatePromise) return rotatePromise;

  rotatePromise = request('/auth/token/rotate', {
    method: 'POST',
    body: { fingerprint: getFingerprint() },
  }).then(() => {
    checkSession(id);
    rotationVersion += 1;
  }).finally(() => {
    if (sessionId === id) rotatePromise = undefined;
  });

  return rotatePromise;
}

export function onUnauthorized(handler: () => void): () => void {
  logoutHandlers.add(handler);

  return () => {
    logoutHandlers.delete(handler);
  };
}

async function prepareRequest(method: string, body: unknown, requestOptions: RequestInit) {
  requestOptions.signal?.throwIfAborted();
  const csrf = await ensureCsrf();
  requestOptions.signal?.throwIfAborted();

  const headers = new Headers(requestOptions.headers);
  headers.set('X-Requested-With', 'XMLHttpRequest');
  headers.set('Accept', 'application/json');

  if (body !== undefined) {
    headers.set('Content-Type', 'application/json');
  }

  if (method === 'POST' || method === 'PUT') {
    headers.set('X-CSRF-TOKEN', csrf);
  }

  return {
    ...requestOptions,
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  };
}

async function sendRequest(path: string, options: RequestInit) {
  try {
    return await fetch(path, options);
  } catch (error) {
    if (options.signal?.aborted) {
      throw error;
    }

    throw new Error('Could not connect to the server. Check your connection and try again.');
  }
}

async function recoverRequest(response: Response, state: RequestState, requestRotation: number) {
  checkRequestSession(state);

  if (response.status === 419 && !state.csrfRetried) {
    state.csrfRetried = true;
    await ensureCsrf(true);
    return true;
  }

  if (response.status !== 401 || !state.authenticated) return false;

  if (state.sessionRetried) {
    expireSession(state.sessionId);
    return false;
  }

  state.sessionRetried = true;

  try {
    if (requestRotation === rotationVersion) {
      await rotateSession(state.sessionId);
    }
  } catch (error) {
    expireSession(state.sessionId);
    throw error;
  }

  return true;
}

async function readResponse<T>(response: Response, method: string, state: RequestState): Promise<T> {
  if (!response.ok) {
    const errorBody = (await response.json().catch(() => undefined)) as ErrorEnvelope | undefined;
    throw new ApiError(response.status, errorBody);
  }

  try {
    const text = await response.text();

    if (!text && method !== 'GET') {
      return undefined as T;
    }

    return JSON.parse(text) as T;
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw error;
    }

    throw new Error('The server returned an unexpected response. Reload the page and try again.');
  } finally {
    checkRequestSession(state);
  }
}

async function executeRequest<T>(path: string, options: RequestOptions, state: RequestState): Promise<T> {
  const { body, method = 'GET', ...requestOptions } = options;
  const preparedRequest = await prepareRequest(method, body, requestOptions);
  checkRequestSession(state);

  const requestRotation = rotationVersion;
  const response = await sendRequest(path, preparedRequest);

  if (await recoverRequest(response, state, requestRotation)) {
    return executeRequest<T>(path, options, state);
  }

  return readResponse<T>(response, method, state);
}

export async function request<T = void>(path: string, options: RequestOptions = {}): Promise<T> {
  const { authenticated = false, ...requestOptions } = options;
  const state: RequestState = {
    sessionId,
    authenticated,
    sessionRetried: false,
    csrfRetried: false,
  };

  return executeRequest<T>(path, requestOptions, state);
}
