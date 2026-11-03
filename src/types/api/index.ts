export type FieldErrors = Record<string, string[]>;

export type ErrorEnvelope = {
  error: { type: string; message: string; payload?: FieldErrors };
};

export type RequestOptions = Omit<RequestInit, 'body' | 'method'> & {
  method?: 'GET' | 'POST' | 'PUT';
  body?: unknown;
  authenticated?: boolean;
};

export type RequestState = {
  sessionId: number;
  authenticated: boolean;
  sessionRetried: boolean;
  csrfRetried: boolean;
};
