import type { ReactNode } from 'react';

export function Badge({
  children,
  tone = 'neutral',
}: {
  children: ReactNode;
  tone?: 'neutral' | 'todo';
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[11px] tracking-wide uppercase ${
        tone === 'todo'
          ? 'border-dashed border-accent/60 text-accent'
          : 'border-line bg-bg text-muted'
      }`}
    >
      {children}
    </span>
  );
}

export function LockIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-3"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  );
}
