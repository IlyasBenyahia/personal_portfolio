import { getSiteTile } from '@/components/zellige/site-tile';
import { skillGroups } from '@/content/skills';
import { GameLauncher } from './GameLauncher';

/** Server wrapper: hands the site tile and the skills (the game's only content) to the launcher. */
export async function PlayButton({ label, className }: { label: string; className?: string }) {
  const tile = await getSiteTile();
  return <GameLauncher tile={tile} skills={skillGroups} label={label} className={className} />;
}
