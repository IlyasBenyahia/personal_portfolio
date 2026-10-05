import type { Education } from './types';

/** Most recent first. School names exactly as provided by Ilyas. */
export const education: Education[] = [
  {
    id: 'master-marketing',
    degree: {
      fr: 'Master 2 Marketing stratégique et Management des organisations',
      en: 'Master’s degree (M2) in Strategic Marketing and Organisational Management',
    },
    school: 'UM5 Rabat',
    date: '2027-06',
    inProgress: true,
  },
  {
    id: 'licence-communication',
    degree: {
      fr: 'Licence professionnelle en Communication digitale',
      en: 'Professional bachelor’s degree in Digital Communication',
    },
    school: 'UM5 Rabat',
    date: '2023',
  },
  {
    id: 'ts-infographie',
    degree: {
      fr: 'Diplôme de Technicien Spécialisé en Infographie',
      en: 'Specialised Technician diploma in Computer Graphics',
    },
    school: 'ISTA',
    date: null, // TODO: year not provided
  },
  {
    id: 'licence-gestion',
    degree: {
      fr: 'Licence en Gestion des entreprises',
      en: 'Bachelor’s degree in Business Management',
    },
    school: 'UM5 Rabat',
    date: '2018',
  },
];
