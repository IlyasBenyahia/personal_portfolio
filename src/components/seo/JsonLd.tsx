import type { JsonLd as Data } from '@/lib/structured-data';

/** Inline structured data. "<" is escaped so content can never close the script tag. */
export function JsonLd({ data }: { data: Data }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  );
}
