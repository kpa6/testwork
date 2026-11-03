import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router';
import { webhookKeys, webhooksApi } from '../api/webhooks';
import { WebhooksSearch } from './WebhooksSearch';
import { WebhooksTable } from './WebhooksTable';
import { WebhooksPagination } from './WebhooksPagination';
import { Alert } from '../components/Alert';

export function WebhooksPage() {
  const [urlParams, setUrlParams] = useSearchParams();

  const pageNumberFromUrl = Number(urlParams.get('page') ?? 1);
  const pageNumber = (Number.isSafeInteger(pageNumberFromUrl) && pageNumberFromUrl > 0) ? pageNumberFromUrl : 1;
  const searchFromUrl = urlParams.get('search') ?? '';

  const { data: response, isPending, error, refetch } = useQuery({
    queryKey: webhookKeys.list({ page: pageNumber, search: searchFromUrl }),
    queryFn: ({ signal }) => webhooksApi.list({ page: pageNumber, search: searchFromUrl }, signal),
  });

  useEffect(() => {
    const lastPageNumber = response?.paging.pages.last ?? pageNumber;
    const correctedPageNumber = pageNumber > lastPageNumber ? lastPageNumber : pageNumber;

    if (pageNumberFromUrl !== correctedPageNumber) {
      setUrlParams(
        { page: String(correctedPageNumber), search: searchFromUrl },
        { replace: true },
      );
    }
  }, [response, pageNumber, pageNumberFromUrl, searchFromUrl, setUrlParams]);

  return (
    <section>
      <h1 className="mb-6 text-2xl font-semibold">Webhooks</h1>

      <div className="mb-6 flex items-center justify-between gap-4">
        <WebhooksSearch
          searchFromUrl={searchFromUrl}
          onSearch={searchInputText => setUrlParams({ page: '1', search: searchInputText })}
        />
        {response && <p className="shrink-0 text-slate-500">Total: {response.paging.results.total}</p>}
      </div>

      {isPending && (
        <p className="py-12 text-center text-slate-500" role="status">
          Loading webhooks…
        </p>
      )}

      {error && (
        <Alert className="mb-4">
          <p className="font-medium">Could not load webhooks</p>
          <p className="mt-1">{error.message}</p>
          <button className="mt-2 underline" onClick={() => refetch()}>
            Try again
          </button>
        </Alert>
      )}

      {response && (
        <>
          <WebhooksTable webhooks={response.data} />
          <WebhooksPagination
            pageNumber={pageNumber}
            lastPageNumber={response.paging.pages.last}
            onPageChange={nextPageNumber => setUrlParams({ page: String(nextPageNumber), search: searchFromUrl })}
          />
        </>
      )}
    </section>
  );
}
