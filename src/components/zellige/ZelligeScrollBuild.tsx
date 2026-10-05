'use client';

import { useEffect, useRef, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  /** Scroll distance over which the build runs, in viewport heights. */
  length?: number;
  className?: string;
}

/**
 * Pins its content while the visitor scrolls, and feeds the scroll progress
 * to CSS as `--p` (0→1). Each tile of an animated <Zellige> appears when
 * `--p` passes its build order: one style variable per frame, no React render.
 * Under prefers-reduced-motion the CSS shows the finished pattern and this is inert.
 */
export function ZelligeScrollBuild({ children, length = 1.5, className }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = el.getBoundingClientRect();
      const travel = rect.height - window.innerHeight;
      const p = travel > 0 ? -rect.top / travel : rect.top < window.innerHeight / 2 ? 1 : 0;
      el.style.setProperty('--p', Math.min(1, Math.max(0, p)).toFixed(3));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return (
    <div
      ref={ref}
      className={['zellige-build', className].filter(Boolean).join(' ')}
      style={{ height: `${100 + length * 100}svh` }}
    >
      <div className="zellige-build__stage">{children}</div>
    </div>
  );
}
