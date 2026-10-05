'use client';

import { useEffect, useState } from 'react';

type Theme = 'system' | 'light' | 'dark';
const THEMES: Theme[] = ['system', 'light', 'dark'];

const ICONS: Record<Theme, string> = {
  system: 'M4 5h16v11H4zM9 20h6M12 16v4',
  light:
    'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4',
  dark: 'M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z',
};

function applyTheme(t: Theme) {
  const root = document.documentElement;
  try {
    if (t === 'system') localStorage.removeItem('theme');
    else localStorage.setItem('theme', t);
  } catch {
    /* storage unavailable: the choice lasts for this page view */
  }
  if (t === 'system') delete root.dataset.theme;
  else root.dataset.theme = t;
}

export type ThemeLabels = Record<'label' | Theme, string>;

export function ThemeToggle({ labels }: { labels: ThemeLabels }) {
  const [theme, setTheme] = useState<Theme>('system');

  useEffect(() => {
    const stored = document.documentElement.dataset.theme;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sync with the pre-paint script
    if (stored === 'light' || stored === 'dark') setTheme(stored);
  }, []);

  return (
    <fieldset className="flex w-fit items-center rounded-full border border-line p-1">
      <legend className="sr-only">{labels.label}</legend>
      {THEMES.map((value) => (
        <button
          key={value}
          type="button"
          aria-pressed={theme === value}
          title={labels[value]}
          onClick={() => {
            setTheme(value);
            applyTheme(value);
          }}
          className="grid size-8 place-items-center rounded-full text-muted transition-colors hover:text-fg aria-pressed:bg-fg aria-pressed:text-bg"
        >
          <svg
            viewBox="0 0 24 24"
            className="size-4"
            aria-hidden="true"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d={ICONS[value]} />
          </svg>
          <span className="sr-only">{labels[value]}</span>
        </button>
      ))}
    </fieldset>
  );
}
