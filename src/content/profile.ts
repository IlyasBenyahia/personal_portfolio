import type { Localized, SocialLink } from './types';

export const profile = {
  name: 'Ilyas Benyahia',
  title: {
    fr: 'Front-end Developer & UI/UX Designer, futur Growth Engineer',
    en: 'Front-end Developer & UI/UX Designer, Growth Engineer in the making',
  } satisfies Localized,
  location: {
    fr: 'Rabat / Témara, Maroc',
    en: 'Rabat / Témara, Morocco',
  } satisfies Localized,
  email: 'contact@benyahiailyas.com',
  /** WhatsApp only: the number itself is never displayed. */
  whatsappUrl: 'https://wa.me/212607081487',
  languages: [
    { fr: 'Arabe', en: 'Arabic' },
    { fr: 'Français', en: 'French' },
    { fr: 'Anglais', en: 'English' },
  ] satisfies Localized[],
  socials: [
    { id: 'github', label: 'GitHub', url: 'https://github.com/IlyasBenyahia' },
    { id: 'linkedin', label: 'LinkedIn', url: 'https://www.linkedin.com/in/ilyasbenyahia' },
    { id: 'itch', label: 'itch.io', url: 'https://ilyassyahiya.itch.io/' },
    { id: 'behance', label: 'Behance', url: 'https://www.behance.net/ibgraphic2' },
  ] satisfies SocialLink[],
  /** Files to place in /public/cv (TODO: not provided yet). */
  cv: {
    fr: '/cv/cv-ilyas-benyahia-fr.pdf',
    en: '/cv/cv-ilyas-benyahia-en.pdf',
  } satisfies Localized,
  /** TODO: portrait photo, path in src/assets/images (e.g. 'ilyas-benyahia.jpg'). */
  photo: null as string | null,
};
