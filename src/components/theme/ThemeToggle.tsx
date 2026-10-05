'use client';

import { useEffect, useState } from 'react';

type Theme = 'system' | 'light' | 'dark';
const LABELS: Record<Theme, string> = { system: 'Système', light: 'Clair', dark: 'Sombre' };

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

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('system');

  useEffect(() => {
    const t = document.documentElement.dataset.theme;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sync with the pre-paint script
    if (t === 'light' || t === 'dark') setTheme(t);
  }, []);

  const choose = (t: Theme) => {
    setTheme(t);
    applyTheme(t);
  };

  return (
    <fieldset className="border-line flex items-center gap-1 rounded-full border p-1 font-mono text-xs">
      <legend className="sr-only">Thème</legend>
      {(Object.keys(LABELS) as Theme[]).map((t) => (
        <button
          key={t}
          type="button"
          aria-pressed={theme === t}
          onClick={() => choose(t)}
          className="text-muted hover:text-fg aria-pressed:bg-fg aria-pressed:text-bg rounded-full px-3 py-1.5 transition-colors"
        >
          {LABELS[t]}
        </button>
      ))}
    </fieldset>
  );
}
