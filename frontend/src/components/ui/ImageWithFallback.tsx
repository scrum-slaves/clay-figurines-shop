import { ImgHTMLAttributes, useEffect, useState } from "react";

type ImageWithFallbackProps = ImgHTMLAttributes<HTMLImageElement> & {
  label?: string;
};

export function ImageWithFallback({
  src,
  alt,
  className = "",
  label = "Нет фото",
  ...props
}: ImageWithFallbackProps) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [src]);

  if (!src || hasError) {
    return (
      <div
        className={`flex h-full w-full items-center justify-center bg-[var(--surface-secondary)] px-4 text-center text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)] ${className}`}
      >
        {label}
      </div>
    );
  }

  return <img alt={alt} className={className} onError={() => setHasError(true)} src={src} {...props} />;
}
