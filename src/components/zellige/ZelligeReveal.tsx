'use client';

import { useEffect, useRef, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  className?: string;
}

/**
 * Reveals an animated <Zellige> as a wave from its centre, once, when it
 * scrolls into view. The motion itself is pure CSS (zellige.css); without JS
 * or with prefers-reduced-motion the pattern is simply shown.
 */
export function ZelligeReveal({ children, className }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          el.dataset.revealed = '';
          observer.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={['zellige-reveal', className].filter(Boolean).join(' ')}>
      {children}
    </div>
  );
}
