import { Fraunces, Inter, JetBrains_Mono } from 'next/font/google';

const fraunces = Fraunces({
  subsets: ['latin'],
  // Optical size only: the SOFT axis doubled the file size for a barely visible effect.
  axes: ['opsz'],
  variable: '--font-fraunces',
  display: 'swap',
});
const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
  // Small labels only: not worth competing with the critical fonts.
  preload: false,
});

export const fontVariables = `${fraunces.variable} ${inter.variable} ${jetbrains.variable}`;
