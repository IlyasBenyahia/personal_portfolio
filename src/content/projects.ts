import type { Project } from './types';

/**
 * Case studies. Many real projects are private: set `privateSource: true` and
 * present them with captures, a demo link and a description instead of code.
 *
 * TODO: the three entries below are placeholders to be replaced by Ilyas.
 * Never fill them with invented clients, figures or results.
 */
const placeholder = (n: number): Project => ({
  slug: `project-${n}`,
  title: { fr: `TODO: titre du projet ${n}`, en: `TODO: project ${n} title` },
  summary: {
    fr: 'TODO: résumé en une phrase (problème, solution).',
    en: 'TODO: one-sentence summary (problem, solution).',
  },
  year: null,
  pillars: ['design', 'develop', 'grow'],
  privateSource: true,
  context: {
    fr: 'TODO: contexte du projet, client ou produit, objectif.',
    en: 'TODO: project context, client or product, goal.',
  },
  role: {
    fr: 'TODO: votre rôle et votre périmètre (conception, développement, croissance).',
    en: 'TODO: your role and scope (design, development, growth).',
  },
  technologies: ['TODO'],
  result: {
    fr: 'TODO: résultat mesurable et vérifiable (ne rien inventer).',
    en: 'TODO: measurable, verifiable outcome (nothing invented).',
  },
  visuals: [
    {
      src: null,
      alt: { fr: 'TODO: capture principale du projet', en: 'TODO: main project screenshot' },
      width: 1600,
      height: 1000,
    },
    {
      src: null,
      alt: { fr: 'TODO: capture secondaire', en: 'TODO: secondary screenshot' },
      width: 1600,
      height: 1000,
    },
  ],
  links: {},
  placeholder: true,
});

export const projects: Project[] = [placeholder(1), placeholder(2), placeholder(3)];

export const getProject = (slug: string) => projects.find((p) => p.slug === slug);
