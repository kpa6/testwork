import { useActionState, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  CheckIcon,
  PencilSquareIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';
import { ApiError } from '../api/errors';
import { webhookKeys, webhooksApi } from '../api/webhooks';
import { Alert } from '../components/Alert';

import type {
  SaveWebhookAction,
  Webhook,
  WebhookEditRowProps,
  WebhookEditButtonProps,
  WebhookInputProps,
  WebhookEditFormProps,
} from '../types/webhooks';

function WebhookEditRow({ webhook, onFinishEditing }: WebhookEditRowProps) {
  const queryClient = useQueryClient();

  const handleSave: SaveWebhookAction = async (_previousState, formData) => {
    const formValues = {
      name: String(formData.get('name') ?? ''),
      url: String(formData.get('url') ?? ''),
    };

    const errors = {
      name: formValues.name ? undefined : 'Enter a name.',
      url: formValues.url ? undefined : 'Enter a URL.',
    };

    if (errors.name || errors.url) {
      return { values: formValues, errors };
    }

    try {
      await webhooksApi.update(webhook.id, formValues);
      await queryClient.invalidateQueries({ queryKey: webhookKeys.lists });

      onFinishEditing();
    } catch (error) {
      if (error instanceof ApiError && error.status === 422) {
        const errors = { name: error.fields.name?.[0], url: error.fields.url?.[0] };

        if (errors.name || errors.url) {
          return { values: formValues, errors };
        }
      }

      return {
        values: formValues,
        errors: { root: error instanceof Error ? error.message : 'Could not save the webhook.' },
      };
    }

    return { values: formValues, errors: {} };
  };

  const [formState, saveAction, isPending] = useActionState(handleSave, {
    values: { name: webhook.name, url: webhook.url },
    errors: {},
  });

  const errors = Object.entries(formState.errors).filter(([, message]) => message);

  const formData = {
    ...formState,
    id: `webhook-${webhook.id}`,
    webhookName: webhook.name,
    action: saveAction,
    isPending,
    onCancel: onFinishEditing,
  };

  return (
    <>
      <tr>
        <td className="px-4 py-2 font-medium">
          <WebhookInput name="name" label="Name" form={formData} />
        </td>
        <td className="break-all px-4 py-2 text-slate-500">
          <WebhookInput name="url" type="url" label="URL" form={formData} />
        </td>
        <td className="px-2 py-2">
          <WebhookStatusIcon active={webhook.active} />
        </td>
        <td className="px-1 py-2 text-center">
          <WebhookEditForm form={formData} />
        </td>
      </tr>

      {errors.length ? (
        <tr>
          <td className="px-4 py-3" colSpan={4}>
            <Alert>
              {errors.map(([field, message]) => <p key={field}>{message}</p>)}
            </Alert>
          </td>
        </tr>
      ) : null}
    </>
  );
}

function WebhookInput({ name, form, type = 'text', label }: WebhookInputProps) {
  return (
    <input
      className="w-full min-w-0 rounded border border-dashed border-slate-400 px-2 py-1 aria-invalid:border-red-500 aria-invalid:focus:outline-red-500"
      name={name}
      type={type}
      aria-label={label}
      aria-invalid={!!form.errors[name]}
      defaultValue={form.values[name]}
      form={form.id}
      disabled={form.isPending}
    />
  );
}

function WebhookEditForm({ form }: WebhookEditFormProps) {
  return (
    <form id={form.id} action={form.action} noValidate>
      <div className="flex justify-center gap-1">
        <button
          className="rounded p-1.5 text-emerald-600 hover:bg-emerald-50 disabled:opacity-40"
          type="submit"
          aria-label={`Save ${form.webhookName}`}
          disabled={form.isPending}
        >
          <CheckIcon className="size-5" />
        </button>
        <button
          className="rounded p-1.5 text-red-600 hover:bg-red-50 disabled:opacity-40"
          type="button"
          aria-label={`Cancel editing ${form.webhookName}`}
          onClick={form.onCancel}
          disabled={form.isPending}
        >
          <XMarkIcon className="size-5" />
        </button>
      </div>
    </form>
  );
}

function WebhookStatusIcon({ active }: { active: boolean }) {
  return active ? (
    <CheckCircleIcon className="mx-auto size-5 text-emerald-700" title="Active" role="img" aria-hidden={false} />
  ) : (
    <XCircleIcon className="mx-auto size-5 text-red-600" title="Inactive" role="img" aria-hidden={false} />
  );
}

function WebhookEditButton({ webhookName, onClick }: WebhookEditButtonProps) {
  return (
    <button
      className="rounded p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
      aria-label={`Edit ${webhookName}`}
      onClick={onClick}
    >
      <PencilSquareIcon className="size-5" />
    </button>
  );
}

export function WebhookRow({ webhook }: { webhook: Webhook }) {
  const [isEditing, setIsEditing] = useState(false);

  if (isEditing) {
    return <WebhookEditRow webhook={webhook} onFinishEditing={() => setIsEditing(false)} />;
  }

  return (
    <tr>
      <td className="px-4 py-2 font-medium">{webhook.name}</td>
      <td className="break-all px-4 py-2 text-slate-500">{webhook.url}</td>
      <td className="px-2 py-2"><WebhookStatusIcon active={webhook.active} /></td>
      <td className="px-1 py-2 text-center">
        <WebhookEditButton webhookName={webhook.name} onClick={() => setIsEditing(true)} />
      </td>
    </tr>
  );
}
