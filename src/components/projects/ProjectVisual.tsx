import { useLocale, useTranslations } from 'next-intl';
import type { ProjectVisual as Visual } from '@/content/types';
import { SiteZellige } from '@/components/zellige/SiteZellige';
import { Picture } from '@/components/ui/Picture';
import { TodoText } from '@/components/ui/TodoText';

/**
 * A project screenshot with fixed dimensions (no layout shift). While the
 * capture is missing, a TODO frame of the same size is shown.
 */
export function ProjectVisual({
  visual,
  priority = false,
  sizes = '(min-width: 1152px) 1120px, 100vw',
  className,
}: {
  visual: Visual;
  priority?: boolean;
  sizes?: string;
  className?: string;
}) {
  const locale = useLocale();
  const t = useTranslations('CaseStudy');
  const alt = visual.alt[locale];
  const ratio = { aspectRatio: `${visual.width} / ${visual.height}` };

  if (visual.src) {
    return (
      <Picture
        image={visual.src}
        alt={alt}
        sizes={sizes}
        priority={priority}
        className={`h-auto w-full rounded-xl border border-line object-cover ${className ?? ''}`}
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
