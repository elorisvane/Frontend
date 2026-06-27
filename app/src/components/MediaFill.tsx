import Image from "next/image";
import type { MediaSlot } from "../data/home";

/**
 * Fills its (position: relative) parent with an admin-managed image or video,
 * falling back to a bundled image when no media is set. Videos autoplay muted
 * and looping, like a background panel.
 */
export function MediaFill({
  media,
  fallbackSrc,
  alt,
  priority,
  sizes,
  className = "",
}: {
  media?: MediaSlot | null;
  fallbackSrc: string;
  alt: string;
  priority?: boolean;
  sizes?: string;
  className?: string;
}) {
  if (media?.mediaType === "video" && media.src) {
    return (
      <video
        src={media.src}
        poster={media.poster || undefined}
        autoPlay
        muted
        loop
        playsInline
        aria-label={alt}
        className={`absolute inset-0 h-full w-full object-cover ${className}`}
      />
    );
  }

  return (
    <Image
      src={media?.src || fallbackSrc}
      alt={media?.alt || alt}
      fill
      priority={priority}
      quality={90}
      sizes={sizes}
      className={`object-cover ${className}`}
    />
  );
}
