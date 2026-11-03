import { ExclamationCircleIcon } from '@heroicons/react/24/solid';
import type { PropsWithChildren } from 'react';

export function Alert({ children, className = '' }: PropsWithChildren<{ className?: string }>) {
  return (
    <div
      className={`flex gap-3 rounded-md border border-red-200 bg-red-50 p-4 text-red-800 ${className}`}
      role="alert"
    >
      <ExclamationCircleIcon className="size-5 shrink-0 text-red-500" />
      <div className="min-w-0">{children}</div>
    </div>
  );
}
