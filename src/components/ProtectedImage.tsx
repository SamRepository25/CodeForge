import type { ImgHTMLAttributes } from "react";

type ProtectedImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, "draggable"> & {
  watermark?: string;
};

export function ProtectedImage({ watermark = "© CodeForge", className, alt = "", ...props }: ProtectedImageProps) {
  return (
    <span
      className="protected-image relative block overflow-hidden rounded-xl"
      onContextMenu={(event) => event.preventDefault()}
      onDragStart={(event) => event.preventDefault()}
    >
      <img
        {...props}
        alt={alt}
        draggable={false}
        className={className ? `protected-image__asset ${className}` : "protected-image__asset"}
      />
      <span className="protected-image__watermark" aria-hidden="true">
        {watermark}
      </span>
    </span>
  );
}
