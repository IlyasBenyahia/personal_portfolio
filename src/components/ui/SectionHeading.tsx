interface Props {
  id: string;
  index: number;
  title: string;
  intro?: string;
}

/** h2 of a home section, with its number in the page (01, 02…). */
export function SectionHeading({ id, index, title, intro }: Props) {
  return (
    <header className="max-w-2xl">
      <p aria-hidden="true" className="font-mono text-xs tracking-widest text-accent">
        {String(index).padStart(2, '0')}
      </p>
      <h2
        id={id}
        className="mt-3 font-display text-4xl font-semibold tracking-tight [font-variation-settings:'opsz'_96] sm:text-5xl"
      >
        {title}
      </h2>
      {intro && <p className="mt-4 text-lg leading-relaxed text-muted">{intro}</p>}
    </header>
  );
}
