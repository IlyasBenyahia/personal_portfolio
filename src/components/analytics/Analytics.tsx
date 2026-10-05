'use client';

import { useEffect } from 'react';
import {
  ANALYTICS_CONFIG,
  EVENT_NAMES,
  flushQueue,
  track,
  type AnalyticsEvent,
} from '@/lib/analytics';

function loadScript(src: string, attrs: Record<string, string>, onLoad?: () => void) {
  if (document.querySelector(`script[src="${src}"]`)) return;
  const s = document.createElement('script');
  s.src = src;
  s.defer = true;
  for (const [k, v] of Object.entries(attrs)) s.setAttribute(k, v);
  if (onLoad) s.addEventListener('load', onLoad);
  document.head.appendChild(s);
}

/**
 * Loads the analytics scripts only after the page is loaded and the main
 * thread is idle (no impact on LCP/INP), and turns clicks on elements with
 * `data-track` into events (see trackAttrs in lib/analytics.ts).
 */
export function Analytics() {
  useEffect(() => {
    const { umamiWebsiteId, umamiSrc, cloudflareToken, cloudflareSrc, domains } = ANALYTICS_CONFIG;

    const start = () => {
      if (umamiWebsiteId) {
        loadScript(umamiSrc, { 'data-website-id': umamiWebsiteId, 'data-domains': domains }, () => {
          // umami defines window.umami synchronously when its script runs.
          flushQueue();
        });
      }
      if (cloudflareToken) {
        loadScript(cloudflareSrc, {
          'data-cf-beacon': JSON.stringify({ token: cloudflareToken }),
        });
      }
    };

    let idle = 0;
    const schedule = () => {
      // requestIdleCallback is missing in older Safari.
      idle =
        typeof window.requestIdleCallback === 'function'
          ? window.requestIdleCallback(start, { timeout: 4000 })
          : window.setTimeout(start, 1500);
    };
    if (document.readyState === 'complete') schedule();
    else window.addEventListener('load', schedule, { once: true });

    const onClick = (e: MouseEvent) => {
      const el = (e.target as Element | null)?.closest<HTMLElement>('[data-track]');
      const name = el?.dataset.track;
      if (!el || !name || !EVENT_NAMES.has(name)) return;
      let data: unknown;
      try {
        data = el.dataset.trackProps ? JSON.parse(el.dataset.trackProps) : undefined;
      } catch {
        data = undefined;
      }
      track((data ? { name, data } : { name }) as AnalyticsEvent);
    };
    document.addEventListener('click', onClick, { capture: true });

    return () => {
      window.removeEventListener('load', schedule);
      if (typeof window.cancelIdleCallback === 'function') window.cancelIdleCallback(idle);
      window.clearTimeout(idle);
      document.removeEventListener('click', onClick, { capture: true });
    };
  }, []);

  return null;
}
