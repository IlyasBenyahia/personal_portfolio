import { getSiteTile } from './site-tile';
import { Zellige, type ZelligeProps } from './Zellige';

/** <Zellige> bound to the site-wide tile from src/zellige/config.ts. */
export async function SiteZellige(props: Omit<ZelligeProps, 'tile'>) {
  return <Zellige {...props} tile={await getSiteTile()} />;
}
