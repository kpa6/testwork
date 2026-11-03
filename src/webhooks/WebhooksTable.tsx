import { WebhookRow } from './WebhookRow';
import type { WebhooksTableProps } from '../types/webhooks';

export function WebhooksTable({ webhooks }: WebhooksTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
      {webhooks.length ? (
        <table className="w-full min-w-[640px] table-fixed text-left">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs text-slate-500">
            <tr>
              <th className="w-1/3 px-4 py-3" scope="col">Name</th>
              <th className="px-4 py-3" scope="col">URL</th>
              <th className="w-16 px-2 py-3 text-center" scope="col">Status</th>
              <th className="w-20 px-1 py-3 text-center" scope="col">Edit</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {webhooks.map(webhook => <WebhookRow key={webhook.id} webhook={webhook} />)}
          </tbody>
        </table>
      ) : (
        <p className="px-5 py-12 text-center text-slate-500">
          No webhooks match your search.
        </p>
      )}
    </div>
  );
}
