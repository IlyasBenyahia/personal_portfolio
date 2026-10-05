import { isTodo } from '@/content/types';

/**
 * Renders content text; values starting with "TODO" are shown as a visible,
 * dashed placeholder so missing information is never mistaken for real content.
 */
export function TodoText({ value, className }: { value: string; className?: string }) {
  if (!isTodo(value)) return <span className={className}>{value}</span>;
  return (
    <span
      className={`rounded border border-dashed border-accent/60 px-1.5 py-0.5 font-mono text-[0.85em] text-accent ${className ?? ''}`}
    >
      {value}
    </span>
  );
}
