let token: string | undefined;
let pending: Promise<string> | undefined;

async function fetchCsrfToken() {
  const response = await fetch('/csrf', {
    headers: { 'X-Requested-With': 'XMLHttpRequest', Accept: 'application/json' },
  });
  const nextToken = response.headers.get('X-CSRF-TOKEN');

  if (!response.ok || !nextToken) {
    throw new Error('Could not obtain the CSRF token.');
  }

  token = nextToken;
  return nextToken;
}

export async function ensureCsrf(refresh = false): Promise<string> {
  if (refresh) {
    token = undefined;
  }

  if (pending) return pending;
  if (token) return token;

  pending = fetchCsrfToken().catch(() => {
    throw new Error('Could not verify the request. Reload the page and try again.');
  });

  try {
    return await pending;
  } finally {
    pending = undefined;
  }
}
