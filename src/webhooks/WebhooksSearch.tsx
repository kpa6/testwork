import type { WebhooksSearchProps } from '../types/webhooks';

export function WebhooksSearch({ searchFromUrl, onSearch }: WebhooksSearchProps) {
  return (
    <input
      className="min-w-0 w-full max-w-lg rounded-md border border-slate-300 bg-white px-3 py-2.5"
      aria-label="Search by name"
      type="search"
      value={searchFromUrl}
      onChange={event => onSearch(event.target.value)}
      placeholder="Search by name"
    />
  );
}
