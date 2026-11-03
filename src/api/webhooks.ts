import { request } from './client';
import type { ListParams, UpdateWebhookInput, Webhook, WebhookList } from '../types/webhooks';

export const webhookKeys = {
  lists: ['webhooks', 'list'],
  list: (params: ListParams) => [...webhookKeys.lists, params],
};

export const webhooksApi = {
  async list(params: ListParams, signal?: AbortSignal) {
    const query = new URLSearchParams({
      page: String(params.page),
      limit: '10',
      search: params.search,
    });

    const response = await request<WebhookList>(`/v1/webhooks?${query}`, {
      authenticated: true,
      signal,
    });

    if (!isValidWebhookList(response)) {
      throw new Error('The server returned an unexpected response. Reload the page and try again.');
    }

    return response;
  },
  update: (id: string, body: UpdateWebhookInput) =>
    request<Webhook>(`/v1/webhooks/${encodeURIComponent(id)}`, {
      method: 'PUT',
      authenticated: true,
      body,
    }),
};

function isValidWebhookList(response: WebhookList) {
  return (
    Array.isArray(response?.data) &&
    response.data.every(
      (webhook) =>
        webhook &&
        typeof webhook.id === 'string' &&
        typeof webhook.name === 'string' &&
        typeof webhook.url === 'string' &&
        typeof webhook.active === 'boolean',
    ) &&
    Number.isSafeInteger(response?.paging?.pages?.last) &&
    response.paging.pages.last >= 1 &&
    Number.isSafeInteger(response?.paging?.results?.total) &&
    response.paging.results.total >= 0
  );
}
