import { http, HttpResponse } from 'msw';
import { csrfToken, mockState, mockUser, sessionDurationMs } from './state';
import {
  failure,
  checkHeaders,
  checkSession,
  getValidDeviceToken,
  checkBody,
  checkWebhookBody,
  readBody,
} from './helpers';

export const handlers = [
  http.all(/\/(csrf|auth|v1)(\/|\?|$)/, ({ request }) => checkHeaders(request)),

  http.get('*/csrf', () => {
    return new HttpResponse(null, {
      status: 204,
      headers: { 'X-CSRF-TOKEN': csrfToken },
    });
  }),

  http.post('*/auth/login', async ({ request }) => {
    if (!request.headers.get('X-Captcha-Token')?.trim()) {
      return failure(422, { captcha: ['Captcha token is required.'] });
    }

    const body = await readBody(request);
    const { error, fingerprint } = checkBody(body);
    if (error) {
      return error;
    }

    const token = crypto.randomUUID();
    mockState.deviceToken = { token, fingerprint };
    return HttpResponse.json({ device_session_token: token });
  }),

  http.post('*/auth/token/issue', async ({ request }) => {
    const body = await readBody(request);
    const deviceToken = getValidDeviceToken(body);

    if (!deviceToken) {
      return failure(422, { device_session_token: ['Invalid device session token.'] });
    }

    mockState.session = {
      fingerprint: deviceToken.fingerprint,
      expiresAt: Date.now() + sessionDurationMs,
    };

    mockState.deviceToken = null;
    return new HttpResponse(null, { status: 200 });
  }),

  http.post('*/auth/token/rotate', async ({ request }) => {
    const body = await readBody(request);

    if (!mockState.session || body.fingerprint !== mockState.session.fingerprint) {
      return failure(400);
    }

    mockState.session.expiresAt = Date.now() + sessionDurationMs;
    return new HttpResponse(null, { status: 200 });
  }),

  http.post('*/auth/token/revoke', async ({ request }) => {
    const body = await readBody(request);

    if (mockState.session?.fingerprint === body.fingerprint) {
      mockState.session = null;
      mockState.deviceToken = null;
    }

    return new HttpResponse(null, { status: 204 });
  }),

  http.get('*/v1/me', () => checkSession() ?? HttpResponse.json(mockUser)),

  http.get('*/v1/webhooks', ({ request }) => {
    const authError = checkSession();
    if (authError) {
      return authError;
    }

    const params = new URL(request.url).searchParams;
    const limit = 10;

    const pageNumberFromUrl = Number(params.get('page') ?? 1);
    const pageNumber = Number.isSafeInteger(pageNumberFromUrl) && pageNumberFromUrl > 0 ? pageNumberFromUrl : 1;

    const search = (params.get('search') ?? '').toLowerCase();
    const filtered = mockState.webhooks.filter(webhook => webhook.name.toLowerCase().includes(search));


    return HttpResponse.json({
      data: filtered.slice((pageNumber - 1) * limit, pageNumber * limit),
      paging: {
        pages: { current: pageNumber, last: Math.max(1, Math.ceil(filtered.length / limit)) },
        results: { total: filtered.length, limitation: limit },
      },
    });
  }),

  http.get('*/v1/webhooks/:id', ({ params }) => {
    const authError = checkSession();
    if (authError) {
      return authError;
    }

    const webhook = mockState.webhooks.find(item => item.id === params.id);
    return webhook ? HttpResponse.json(webhook) : failure(404);
  }),

  http.put('*/v1/webhooks/:id', async ({ request, params }) => {
    const authError = checkSession();
    if (authError) {
      return authError;
    }

    const webhook = mockState.webhooks.find(item => item.id === params.id);
    if (!webhook) {
      return failure(404);
    }

    const body = await readBody(request);
    const { error, name, url } = checkWebhookBody(body);
    if (error) {
      return error;
    }

    Object.assign(webhook, { name, url });
    return HttpResponse.json(webhook);
  }),
];
