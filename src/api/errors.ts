import type { ErrorEnvelope, FieldErrors } from '../types/api';

export class ApiError extends Error {
  readonly status: number;
  readonly fields: FieldErrors;

  constructor(status: number, body?: ErrorEnvelope) {
    super(body?.error?.message ?? 'Could not complete the request. Please try again.');
    this.name = 'ApiError';
    this.status = status;
    this.fields = body?.error?.payload ?? {};
  }
}
