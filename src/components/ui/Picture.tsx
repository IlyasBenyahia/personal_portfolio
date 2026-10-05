import { getImage } from '@/lib/images';

interface Props {
  /** Path relative to src/assets/images, e.g. "projects/x/home.png". */
  image: string;
  alt: string;
  /** Layout width hint for the browser, e.g. "(min-width: 1024px) 66vw, 100vw". */
  sizes: string;
  /** Above-the-fold image: load eagerly with high priority (LCP). */
  priority?: boolean;
  className?: string;
}

/** AVIF + WebP <picture> with intrinsic width/height (no layout shift). */
export function Picture({ image, alt, sizes, priority = false, className }: Props) {
  const img = getImage(image);
  const srcSet = (format: 'avif' | 'webp') =>
    img.sources[format].map((s) => `${s.src} ${s.width}w`).join(', ');
  const fallback = img.sources.webp.at(-1)!;

  return (
    <picture>
      <source type="image/avif" srcSet={srcSet('avif')} sizes={sizes} />
      <source type="image/webp" srcSet={srcSet('webp')} sizes={sizes} />
      <img
        src={fallback.src}
        alt={alt}
        width={img.width}
        height={img.height}
        sizes={sizes}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
        decoding="async"
        className={className}
      />
    </picture>
  );
}
