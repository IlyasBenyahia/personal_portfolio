import type { Experience } from './types';

/** Most recent first. Never guess a job title or a mission: keep the TODO until confirmed. */
export const experiences: Experience[] = [
  {
    id: 'develop-upscale',
    company: 'DEVELOP UPSCALE',
    role: { fr: 'TODO: intitulé exact du poste', en: 'TODO: exact job title' },
    period: { start: '2025-07', end: null },
    missions: [{ fr: 'TODO: missions principales', en: 'TODO: main responsibilities' }],
    pillars: [],
  },
  {
    id: 'adliket',
    company: 'AdLikeT',
    role: { fr: 'TODO: intitulé exact du poste', en: 'TODO: exact job title' },
    period: { start: '2024-04', end: '2025-03' },
    missions: [
      { fr: 'Lancement de campagnes publicitaires.', en: 'Launching advertising campaigns.' },
      { fr: 'TODO: autres missions', en: 'TODO: other responsibilities' },
    ],
    pillars: ['grow'],
  },
  {
    id: 'freelance',
    company: 'Freelance',
    role: {
      fr: 'Développement web, design, SEO',
      en: 'Web development, design, SEO',
    },
    period: { start: '2023-04', end: null },
    missions: [
      {
        fr: 'TODO: types de missions et clients (sans les inventer)',
        en: 'TODO: kinds of assignments and clients',
      },
    ],
    pillars: ['design', 'develop', 'grow'],
  },
  {
    id: 'next-level',
    company: 'Next Level',
    role: { fr: 'Infographiste', en: 'Graphic designer' },
    period: { start: '2023' },
    missions: [{ fr: 'TODO: missions principales', en: 'TODO: main responsibilities' }],
    pillars: ['design'],
  },
  {
    id: '2c-solution',
    company: '2C Solution',
    role: { fr: 'Web designer', en: 'Web designer' },
    type: { fr: 'Stage rémunéré', en: 'Paid internship' },
    period: { start: '2021', end: '2022' },
    missions: [{ fr: 'TODO: missions principales', en: 'TODO: main responsibilities' }],
    pillars: ['design'],
  },
];
