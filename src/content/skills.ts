import type { SkillGroup } from './types';

/**
 * The Design → Develop → Grow triptych. Also the source of the skill icons
 * collected in the "Ship It!" game (phase 5): the game shows nothing that is
 * not listed here.
 */
export const skillGroups: SkillGroup[] = [
  {
    pillar: 'design',
    items: [
      'UI/UX design',
      'Figma',
      'Adobe XD',
      'Photoshop',
      'Illustrator',
      'InDesign',
      'After Effects',
      'Premiere Pro',
      { fr: 'Illustration 2D', en: '2D illustration' },
      { fr: 'Animation 2D', en: '2D animation' },
    ],
  },
  {
    pillar: 'develop',
    items: [
      'HTML',
      'CSS',
      'JavaScript',
      'TypeScript',
      'React',
      'Next.js',
      'WordPress (Bricks, Elementor)',
      'Shopify',
      'Git (GitHub, GitLab)',
      'Unity',
      'C#',
      { fr: 'Jeux web en JavaScript / React', en: 'Web games in JavaScript / React' },
    ],
  },
  {
    pillar: 'grow',
    items: [
      { fr: 'SEO technique', en: 'Technical SEO' },
      { fr: 'SEO on-page', en: 'On-page SEO' },
      { fr: 'SEO off-page', en: 'Off-page SEO' },
      'Semrush',
      'Google Ads',
      'Facebook Ads',
      { fr: 'Marketing digital', en: 'Digital marketing' },
      { fr: 'Marketing stratégique', en: 'Strategic marketing' },
    ],
  },
];
