/** Web3Forms client (static site: the form posts straight from the browser). */
export const WEB3FORMS_ENDPOINT = 'https://api.web3forms.com/submit';
export const WEB3FORMS_KEY = process.env.NEXT_PUBLIC_WEB3FORMS_KEY ?? '';

export interface ContactPayload {
  name: string;
  email: string;
  message: string;
  subject: string;
  /** Honeypot: must stay empty; Web3Forms also rejects a truthy botcheck. */
  botcheck: boolean;
}

export async function sendContact(payload: ContactPayload): Promise<boolean> {
  const res = await fetch(WEB3FORMS_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      access_key: WEB3FORMS_KEY,
      from_name: 'benyahiailyas.com',
      replyto: payload.email,
      ...payload,
    }),
  });
  const json = (await res.json().catch(() => null)) as { success?: boolean } | null;
  return res.ok && json?.success === true;
}

export type FieldErrorKey =
  'nameRequired' | 'emailRequired' | 'emailInvalid' | 'messageRequired' | 'messageShort';

export type FieldErrors = Partial<Record<'name' | 'email' | 'message', FieldErrorKey>>;

/** Returns translation keys (ContactForm.errors.*) for invalid fields. */
export function validateContact(v: { name: string; email: string; message: string }): FieldErrors {
  const errors: FieldErrors = {};
  if (!v.name.trim()) errors.name = 'nameRequired';
  if (!v.email.trim()) errors.email = 'emailRequired';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.email.trim())) errors.email = 'emailInvalid';
  if (!v.message.trim()) errors.message = 'messageRequired';
  else if (v.message.trim().length < 10) errors.message = 'messageShort';
  return errors;
}
