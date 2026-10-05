import type { MetadataRoute } from 'next';
import { projects } from '@/content/projects';
import { routing } from '@/i18n/routing';
import { localizedUrl } from '@/lib/seo';

export const dynamic = 'force-static';

/** Every indexable page in both languages, with hreflang alternates. Blog: not published yet. */
export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    { path: '', priority: 1 },
    // Placeholder case studies are noindex, so they stay out of the sitemap.
    ...projects
      .filter((p) => !p.placeholder)
      .map((p) => ({ path: `/projects/${p.slug}`, priority: 0.8 })),
  ];

  return paths.flatMap(({ path, priority }) =>
    routing.locales.map((locale) => ({
      url: localizedUrl(locale, path),
      changeFrequency: 'monthly' as const,
      priority,
      alternates: {
        languages: Object.fromEntries([
          ...routing.locales.map((l) => [l, localizedUrl(l, path)]),
          ['x-default', localizedUrl(routing.defaultLocale, path)],
        ]),
      },
    })),
  );
}
