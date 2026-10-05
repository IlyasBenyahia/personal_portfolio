'use client';

import { useId, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { Link } from '@/i18n/navigation';
import { track } from '@/lib/analytics';
import {
  sendContact,
  validateContact,
  WEB3FORMS_KEY,
  type FieldErrorKey,
  type FieldErrors,
} from '@/lib/web3forms';

type Status = 'idle' | 'sending' | 'success' | 'error' | 'config';
type Field = 'name' | 'email' | 'message';

const inputClass =
  'mt-2 block w-full rounded-xl border border-line bg-bg px-4 py-3 text-base text-fg transition-colors placeholder:text-muted focus:border-fg focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent aria-[invalid=true]:border-accent';

/** All texts, already translated (and formatted) on the server. */
export interface ContactFormLabels {
  name: string;
  email: string;
  message: string;
  required: string;
  submit: string;
  sending: string;
  success: string;
  error: string;
  configError: string;
  honeypot: string;
  privacy: string;
  privacyLink: string;
  subject: string;
  errors: Record<FieldErrorKey, string>;
  /** Error summary for 1, 2 and 3 invalid fields (plural forms). */
  summary: [string, string, string];
}

export function ContactForm({ labels: l }: { labels: ContactFormLabels }) {
  const id = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const statusRef = useRef<HTMLParagraphElement>(null);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<Status>('idle');

  const fieldId = (f: Field) => `${id}-${f}`;
  const errorId = (f: Field) => `${id}-${f}-error`;

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const values = {
      name: String(data.get('name') ?? ''),
      email: String(data.get('email') ?? ''),
      message: String(data.get('message') ?? ''),
    };

    const found = validateContact(values);
    setErrors(found);
    const firstInvalid = (['name', 'email', 'message'] as const).find((f) => found[f]);
    if (firstInvalid) {
      form.querySelector<HTMLElement>(`#${CSS.escape(fieldId(firstInvalid))}`)?.focus();
      return;
    }

    // Honeypot filled in: a bot. Pretend it worked, send nothing.
    if (data.get('botcheck')) {
      setStatus('success');
      form.reset();
      return;
    }
    if (!WEB3FORMS_KEY) {
      setStatus('config');
      return;
    }

    setStatus('sending');
    try {
      const ok = await sendContact({ ...values, subject: l.subject, botcheck: false });
      setStatus(ok ? 'success' : 'error');
      track({ name: 'contact_submit', data: { status: ok ? 'success' : 'error' } });
      if (ok) form.reset();
    } catch {
      setStatus('error');
      track({ name: 'contact_submit', data: { status: 'error' } });
    }
    statusRef.current?.focus();
  }

  const errorCount = Object.keys(errors).length;
  const field = (f: Field, label: string, input: ReactNode) => (
    <div>
      <label htmlFor={fieldId(f)} className="font-medium">
        {label} <span className="font-mono text-xs text-muted">({l.required})</span>
      </label>
      {input}
      {errors[f] && (
        <p id={errorId(f)} className="mt-2 text-sm text-accent">
          {l.errors[errors[f]!]}
        </p>
      )}
    </div>
  );
  const aria = (f: Field) => ({
    id: fieldId(f),
    name: f,
    required: true,
    'aria-invalid': errors[f] ? true : undefined,
    'aria-describedby': errors[f] ? errorId(f) : undefined,
  });

  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate className="grid gap-5">
      {field(
        'name',
        l.name,
        <input
          {...aria('name')}
          type="text"
          autoComplete="name"
          maxLength={100}
          className={inputClass}
        />,
      )}
      {field(
        'email',
        l.email,
        <input
          {...aria('email')}
          type="email"
          autoComplete="email"
          inputMode="email"
          maxLength={200}
          className={inputClass}
        />,
      )}
      {field(
        'message',
        l.message,
        <textarea
          {...aria('message')}
          rows={6}
          maxLength={5000}
          className={`${inputClass} resize-y`}
        />,
      )}

      {/* Honeypot: hidden from people and assistive tech, filled in by naive bots. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor={`${id}-botcheck`}>{l.honeypot}</label>
        <input
          id={`${id}-botcheck`}
          type="checkbox"
          name="botcheck"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={status === 'sending'}
          className="rounded-full bg-accent-strong px-6 py-3 font-medium text-on-accent transition hover:brightness-110 disabled:cursor-wait disabled:opacity-70"
        >
          {status === 'sending' ? l.sending : l.submit}
        </button>
        <p className="text-sm text-muted">
          {l.privacy}{' '}
          <Link href="/legal" className="underline underline-offset-4 hover:text-fg">
            {l.privacyLink}
          </Link>
        </p>
      </div>

      <div aria-live="polite" role="status">
        {errorCount > 0 && <p className="text-sm text-accent">{l.summary[errorCount - 1]}</p>}
        {status !== 'idle' && status !== 'sending' && (
          <p
            ref={statusRef}
            tabIndex={-1}
            className={`rounded-xl border px-4 py-3 focus:outline-none ${
              status === 'success' ? 'border-teal text-teal' : 'border-accent text-accent'
            }`}
          >
            {status === 'success' ? l.success : status === 'config' ? l.configError : l.error}
          </p>
        )}
      </div>
    </form>
  );
}
