import type { Game } from './types';

export const games: Game[] = [
  {
    id: 'colors-recipe',
    title: 'Colors Recipe',
    description: {
      fr: 'Un jeu de puzzle où l’on aide Ray à retrouver la bonne recette de couleurs dans une forêt sombre.',
      en: 'A puzzle game where you help Ray find the right colour recipe in a dark forest.',
    },
    // TODO: direct URL of the game page on itch.io (profile link used meanwhile).
    url: 'https://ilyassyahiya.itch.io/',
    platform: 'itch.io',
    status: 'published',
  },
];
