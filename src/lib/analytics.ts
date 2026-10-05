/**
 * Single entry point for analytics. Components call `track()` (or use
 * `data-track` attributes, see <Analytics>) and never talk to a vendor
 * directly: switching tool means editing this file only.
 *
 * Today: Umami Cloud (custom events) + Cloudflare Web Analytics (traffic,
 * Core Web Vitals). Both are cookieless, so no consent banner is needed.
 */

export type AnalyticsEvent =
  | { name: 'cv_download'; data: { lang: 'fr' | 'en' } }
  | { name: 'game_play' }
  | { name: 'game_complete'; data: { score: number } }
  | { name: 'game_skip' }
  | { name: 'contact_submit'; data: { status: 'success' | 'error' } }
  | {
      name: 'outbound_click';
      data: { target: 'github' | 'linkedin' | 'itch' | 'behance' | 'whatsapp' };
    }
  | { name: 'locale_switch'; data: { to: 'fr' | 'en' } }
  | { name: 'case_study_open'; data: { slug: string } };

export type AnalyticsEventName = AnalyticsEvent['name'];

interface UmamiTracker {
  track: (event: string, data?: Record<string, string | number>) => void;
}

declare global {
  interface Window {
    umami?: UmamiTracker;
  }
}

/** Events sent before Umami has loaded (it is deliberately loaded late). */
const queue: AnalyticsEvent[] = [];

function send(event: AnalyticsEvent) {
  const data = 'data' in event ? (event.data as Record<string, string | number>) : undefined;
  window.umami?.track(event.name, data);
}

export function track(event: AnalyticsEvent): void {
  if (typeof window === 'undefined') return;
  if (process.env.NODE_ENV !== 'production') {
    console.debug('[analytics]', event.name, 'data' in event ? event.data : '');
  }
  if (window.umami) send(event);
  else if (queue.length < 50) queue.push(event);
}

/** Called once Umami is ready: replays queued events. */
export function flushQueue(): void {
  while (queue.length > 0) send(queue.shift()!);
}

/**
 * Builds the `data-track` attributes for server components, e.g.
 * <a {...trackAttrs('cv_download', { lang: 'fr' })}>. Read by <Analytics>.
 */
export function trackAttrs<N extends AnalyticsEventName>(
  name: N,
  ...[data]: Extract<AnalyticsEvent, { name: N }> extends { data: infer D } ? [D] : []
): Record<string, string> {
  return {
    'data-track': name,
    ...(data ? { 'data-track-props': JSON.stringify(data) } : {}),
  };
}

export const EVENT_NAMES: ReadonlySet<string> = new Set<AnalyticsEventName>([
  'cv_download',
  'game_play',
  'game_complete',
  'game_skip',
  'contact_submit',
  'outbound_click',
  'locale_switch',
  'case_study_open',
]);

export const ANALYTICS_CONFIG = {
  /** Only these hosts send data (no stats from localhost or previews). */
  domains: 'benyahiailyas.com,www.benyahiailyas.com',
  umamiWebsiteId: process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID ?? '',
  umamiSrc: 'https://cloud.umami.is/script.js',
  cloudflareToken: process.env.NEXT_PUBLIC_CF_ANALYTICS_TOKEN ?? '',
  cloudflareSrc: 'https://static.cloudflareinsights.com/beacon.min.js',
};
