import { useLocale, useTranslations } from 'next-intl';
import type { ProjectVisual as Visual } from '@/content/types';
import { SiteZellige } from '@/components/zellige/SiteZellige';
import { TodoText } from '@/components/ui/TodoText';

/**
 * A project screenshot with fixed dimensions (no layout shift). While the
 * capture is missing, a TODO frame of the same size is shown.
 * TODO(phase 4): serve build-optimised AVIF/WebP sizes.
 */
export function ProjectVisual({
  visual,
  priority = false,
  className,
}: {
  visual: Visual;
  priority?: boolean;
  className?: string;
}) {
  const locale = useLocale();
  const t = useTranslations('CaseStudy');
  const alt = visual.alt[locale];
  const ratio = { aspectRatio: `${visual.width} / ${visual.height}` };

  if (visual.src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- static export, optimised at build (phase 4)
      <img
        src={visual.src}
        alt={alt}
        width={visual.width}
        height={visual.height}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        className={`h-auto w-full rounded-xl border border-line object-cover ${className ?? ''}`}
        style={ratio}
      />
    );
  }

  return (
    <div
      role="img"
      aria-label={alt}
      style={ratio}
      className={`relative isolate grid w-full place-items-center overflow-hidden rounded-xl border border-dashed border-line bg-surface p-4 text-center ${className ?? ''}`}
    >
      <SiteZellige
        variant="line"
        cols={8}
        rows={5}
        fit="slice"
        className="absolute inset-0 -z-10 h-full text-fg opacity-10"
      />
      <span className="grid gap-2">
        <span className="font-mono text-xs text-muted">{t('visualTodo')}</span>
        <TodoText value={alt} className="text-xs" />
      </span>
    </div>
  );
}
