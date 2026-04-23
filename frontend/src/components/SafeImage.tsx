"use client";

import Image from "next/image";
import { useState } from "react";

export function SafeImage({
  src,
  fallback,
  alt,
  className,
  fill,
  width,
  height,
  unoptimized = true,
}: {
  src: string;
  fallback: string;
  alt: string;
  className?: string;
  fill?: boolean;
  width?: number;
  height?: number;
  unoptimized?: boolean;
}) {
  const [currentSrc, setCurrentSrc] = useState(src || fallback);

  return (
    <Image
      src={currentSrc || fallback}
      alt={alt}
      fill={fill}
      width={width}
      height={height}
      unoptimized={unoptimized}
      className={className}
      onError={() => {
        if (currentSrc !== fallback) {
          setCurrentSrc(fallback);
        }
      }}
    />
  );
}
