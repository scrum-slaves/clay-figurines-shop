import { useEffect, useState } from "react";

import { ImageWithFallback } from "../ui/ImageWithFallback";

type ProductGalleryProps = {
  images: string[];
  title: string;
};

export function ProductGallery({ images, title }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const galleryImages = images.length > 0 ? images : [""];
  const hasMultipleImages = galleryImages.length > 1;

  useEffect(() => {
    setActiveIndex(0);
  }, [images.join("|")]);

  return (
    <div className={hasMultipleImages ? "grid gap-4 xl:grid-cols-[92px_minmax(0,1fr)]" : "grid gap-4"}>
      {hasMultipleImages ? (
        <div className="order-2 flex gap-3 xl:order-none xl:flex-col">
          {galleryImages.map((image, index) => (
            <button
              className={`overflow-hidden rounded-[20px] border ${
                index === activeIndex
                  ? "border-[var(--text-primary)]"
                  : "border-[var(--line)]"
              } bg-white transition-colors`}
              key={`${image}-${index}`}
              onClick={() => setActiveIndex(index)}
              type="button"
            >
              <div className="h-20 w-20">
                <ImageWithFallback
                  alt={`${title} ${index + 1}`}
                  className="h-full w-full object-cover"
                  src={image}
                />
              </div>
            </button>
          ))}
        </div>
      ) : null}
      <div className="overflow-hidden rounded-[30px] border border-[var(--line)] bg-white p-4">
        <div className="aspect-[4/5] overflow-hidden rounded-[24px] bg-[var(--surface-secondary)]">
          <ImageWithFallback
            alt={title}
            className="h-full w-full object-cover"
            src={galleryImages[activeIndex]}
          />
        </div>
      </div>
    </div>
  );
}
