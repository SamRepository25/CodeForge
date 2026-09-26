import { type ImgHTMLAttributes } from "react";

/**
 * ProtectedImage
 *
 * Wraps a portfolio/blog image with:
 *  - a subtle, accessible copyright watermark
 *  - right-click and drag deterrence scoped to THIS image only
 *
 * This is a deterrence layer, not a security control. It does not and
 * cannot prevent screenshots, OS-level capture, or a determined user
 * with dev tools open. See PrivacyNotice.tsx for the user-facing copy
 * that describes this honestly.
 *
 * Deliberately NOT applied globally — normal site text, code blocks,
 * and form fields remain selectable and copyable as usual.
 */
type ProtectedImageProps = ImgHTMLAttributes<HTMLImageElement> & {
  watermarkText?: string;
  className?: string;
  containerClassName?: string;
};

const DEFAULT_WATERMARK = "CodeForge © 2026 — All Rights Reserved";

export function ProtectedImage({
  watermarkText = DEFAULT_WATERMARK,
  className,
  containerClassName,
  draggable,
  onContextMenu,
  onDragStart,
  alt,
  ...imgProps
}: ProtectedImageProps) {
  return (
    <div className={`protected-image relative overflow-hidden ${containerClassName ?? ""}`}>
      <img
        {...imgProps}
        alt={alt}
        draggable={draggable ?? false}
        onContextMenu={(event) => {
          event.preventDefault();
          onContextMenu?.(event);
        }}
        onDragStart={(event) => {
          event.preventDefault();
          onDragStart?.(event);
        }}
        className={className}
      />
      <span
        aria-hidden="true"
        className="protected-image-watermark pointer-events-none absolute inset-0 flex select-none items-end justify-end p-2 text-[11px] font-medium tracking-wide text-white/70"
      >
        {watermarkText}
      </span>
    </div>
  );
}
