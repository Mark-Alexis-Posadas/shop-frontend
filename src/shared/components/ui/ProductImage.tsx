import { useState, type ImgHTMLAttributes } from "react";
export function ProductImage({
  src,
  alt = "Product",
  className = "",
  ...props
}: Omit<ImgHTMLAttributes<HTMLImageElement>, "onError">) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  if (!src || src === failedSrc)
    return (
      <span
        role="img"
        aria-label={alt + " image unavailable"}
        className={
          className +
          " flex items-center justify-center bg-slate-50 text-center text-xs text-slate-400"
        }
      >
        Image unavailable
      </span>
    );
  return (
    <img
      {...props}
      src={src}
      alt={alt}
      className={className}
      onError={() => setFailedSrc(src)}
    />
  );
}
