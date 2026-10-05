import type { ReactNode } from 'react';

/** A home section anchored by `id` (nav target) and labelled by its h2. */
export function Section({
  id,
  children,
  className,
}: {
  id: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className={`mx-auto max-w-6xl scroll-mt-20 px-4 py-20 sm:px-6 sm:py-28 ${className ?? ''}`}
    >
      {children}
    </section>
  );
}
