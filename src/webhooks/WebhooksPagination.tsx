import { ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import type { WebhooksPaginationProps } from '../types/webhooks';

export function WebhooksPagination({ pageNumber, lastPageNumber, onPageChange }: WebhooksPaginationProps) {
  return (
    <nav className="mt-4 flex items-center justify-between" aria-label="Webhook pages">
      <button
        className="flex items-center gap-2 rounded-md border border-slate-300 px-3 py-2 font-medium disabled:opacity-40"
        disabled={pageNumber <= 1}
        onClick={() => onPageChange(pageNumber - 1)}
      >
        <ArrowLeftIcon className="size-4" />
        Previous
      </button>
      <span className="text-slate-500">
        Page {pageNumber} of {lastPageNumber}
      </span>
      <button
        className="flex items-center gap-2 rounded-md border border-slate-300 px-3 py-2 font-medium disabled:opacity-40"
        disabled={pageNumber >= lastPageNumber}
        onClick={() => onPageChange(pageNumber + 1)}
      >
        Next
        <ArrowRightIcon className="size-4" />
      </button>
    </nav>
  );
}
