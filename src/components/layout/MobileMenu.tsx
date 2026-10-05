'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { Link } from '@/i18n/navigation';

interface Props {
  items: { id: string; label: string }[];
  labels: { open: string; close: string; nav: string };
}

/** Disclosure menu below the lg breakpoint. Escape closes it and returns focus. */
export function MobileMenu({ items, labels }: Props) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        className="grid size-10 place-items-center rounded-full border border-line"
      >
        <span className="sr-only">{open ? labels.close : labels.open}</span>
        <svg
          viewBox="0 0 24 24"
          className="size-5"
          aria-hidden="true"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        >
          <path d={open ? 'M6 6l12 12M18 6L6 18' : 'M4 7h16M4 12h16M4 17h16'} />
        </svg>
      </button>

      <div
        id={panelId}
        hidden={!open}
        className="absolute inset-x-0 top-16 border-b border-line bg-bg px-4 pt-2 pb-6 shadow-lg sm:px-6"
      >
        <nav aria-label={labels.nav}>
          <ul className="grid gap-1">
            {items.map((item) => (
              <li key={item.id}>
                <Link
                  href={{ pathname: '/', hash: item.id }}
                  onClick={() => setOpen(false)}
                  className="block rounded-md py-3 font-display text-2xl"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="mt-4">
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
}
