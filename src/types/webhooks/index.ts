import type { HTMLInputTypeAttribute } from 'react';
import type { FormState } from '../forms';

export type Webhook = {
  id: string;
  name: string;
  url: string;
  active: boolean;
  created_at: string;
};

export type WebhookList = {
  data: Webhook[];
  paging: {
    pages: { current: number; last: number };
    results: { total: number; limitation: number };
  };
};

export type ListParams = {
  page: number;
  search: string;
};

export type UpdateWebhookInput = Pick<Webhook, 'name' | 'url'>;

export type WebhookFormState = FormState<UpdateWebhookInput>;

export type SaveWebhookAction = (
  previousState: WebhookFormState,
  formData: FormData,
) => Promise<WebhookFormState>;

export type WebhookEditRowProps = {
  webhook: Webhook;
  onFinishEditing: () => void;
};

export type WebhookEditButtonProps = {
  webhookName: string;
  onClick: () => void;
};

export type WebhookForm = WebhookFormState & {
  id: string;
  webhookName: string;
  action: (formData: FormData) => void;
  isPending: boolean;
  onCancel: () => void;
};

export type WebhookEditFormProps = {
  form: WebhookForm;
};

export type WebhookInputProps = WebhookEditFormProps & {
  name: keyof UpdateWebhookInput;
  type?: HTMLInputTypeAttribute;
  label: string;
};

export type WebhooksSearchProps = {
  searchFromUrl: string;
  onSearch: (searchInputText: string) => void;
};

export type WebhooksTableProps = {
  webhooks: Webhook[];
};

export type WebhooksPaginationProps = {
  pageNumber: number;
  lastPageNumber: number;
  onPageChange: (nextPageNumber: number) => void;
};
