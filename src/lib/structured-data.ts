import { education } from '@/content/education';
import { profile } from '@/content/profile';
import { skillGroups } from '@/content/skills';
import { localize, type Project } from '@/content/types';
import type { Locale } from '@/i18n/routing';
import { localizedUrl } from './seo';
import { SITE_URL } from './site';

/** schema.org graph, serialised into a <script type="application/ld+json">. */
export type JsonLd = Record<string, unknown>;

const PERSON_ID = `${SITE_URL}/#person`;
const WEBSITE_ID = `${SITE_URL}/#website`;

export function personNode(locale: Locale): JsonLd {
  return {
    '@type': 'Person',
    '@id': PERSON_ID,
    name: profile.name,
    url: SITE_URL,
    email: `mailto:${profile.email}`,
    jobTitle: profile.title[locale],
    description: profile.title[locale],
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Rabat',
      addressCountry: 'MA',
    },
    knowsLanguage: ['ar', 'fr', 'en'],
    knowsAbout: skillGroups.flatMap((g) => g.items.map((i) => localize(i, locale))),
    alumniOf: [...new Set(education.map((e) => e.school))].map((name) => ({
      '@type': 'EducationalOrganization',
      name,
    })),
    sameAs: profile.socials.map((s) => s.url),
  };
}

export function websiteNode(description: string): JsonLd {
  return {
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    url: SITE_URL,
    name: profile.name,
    description,
    inLanguage: ['fr', 'en'],
    publisher: { '@id': PERSON_ID },
    author: { '@id': PERSON_ID },
  };
}

export function homeGraph(locale: Locale, title: string, description: string): JsonLd {
  const url = localizedUrl(locale);
  return {
    '@context': 'https://schema.org',
    '@graph': [
      personNode(locale),
      websiteNode(description),
      {
        '@type': 'ProfilePage',
        '@id': `${url}#profile`,
        url,
        name: title,
        description,
        inLanguage: locale,
        isPartOf: { '@id': WEBSITE_ID },
        mainEntity: { '@id': PERSON_ID },
        about: { '@id': PERSON_ID },
      },
    ],
  };
}

export function caseStudyGraph(
  locale: Locale,
  project: Project,
  labels: { home: string; projects: string },
): JsonLd {
  const url = localizedUrl(locale, `/projects/${project.slug}`);
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CreativeWork',
        '@id': `${url}#work`,
        url,
        name: project.title[locale],
        description: project.summary[locale],
        inLanguage: locale,
        creator: { '@id': PERSON_ID },
        isPartOf: { '@id': WEBSITE_ID },
        ...(project.year ? { dateCreated: project.year } : {}),
        keywords: project.technologies.join(', '),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: labels.home, item: localizedUrl(locale) },
          {
            '@type': 'ListItem',
            position: 2,
            name: labels.projects,
            item: `${localizedUrl(locale)}#projects`,
          },
          { '@type': 'ListItem', position: 3, name: project.title[locale], item: url },
        ],
      },
    ],
  };
}

export function blogPostingGraph(
  locale: Locale,
  post: {
    slug: string;
    title: string;
    description: string;
    date: string;
    updated?: string;
    tags: string[];
  },
): JsonLd {
  const url = localizedUrl(locale, `/blog/${post.slug}`);
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    '@id': `${url}#post`,
    mainEntityOfPage: url,
    url,
    headline: post.title,
    description: post.description,
    inLanguage: locale,
    datePublished: post.date,
    dateModified: post.updated ?? post.date,
    keywords: post.tags.join(', '),
    image: `${localizedUrl(locale)}/opengraph-image`,
    author: { '@id': PERSON_ID },
    publisher: { '@id': PERSON_ID },
    isPartOf: { '@id': WEBSITE_ID },
  };
}
