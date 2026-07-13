import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import { useImgRetry } from './useImgRetry';

// ============================================================
// Plays a sequence of image frames as a looping animation.
// Used for real PixelLab sprite frames (falls back gracefully
// if only one frame exists). Honors prefers-reduced-motion by
// showing a single frame.
// ============================================================

interface Props {
  frames: string[];
  fps?: number;
  size?: number;
  alt?: string;
  loop?: boolean;
  onComplete?: () => void;
  /** fired if a frame image fails to load (404 / decode error) so the caller can fall back */
  onError?: () => void;
  /** fired with the current frame's URL whenever it changes (used to track the head per frame) */
  onFrame?: (url: string) => void;
}

export function SpriteAnimation({ frames, fps = 6, size = 200, alt = '', loop = true, onComplete, onError, onFrame }: Props) {
  const [index, setIndex] = useState(0);
  const reduced = useReducedMotion();
  const raf = useRef(0);
  const last = useRef(0);

  // Report the currently shown frame URL so an overlay can track the head on it.
  const shownIndex = Math.min(index, frames.length - 1);
  const shownUrl = frames[shownIndex];
  useEffect(() => { if (shownUrl) onFrame?.(shownUrl); }, [shownUrl, onFrame]);

  useEffect(() => {
    setIndex(0);
    if (reduced || frames.length <= 1) return;
    const interval = 1000 / fps;

    const step = (t: number) => {
      if (!last.current) last.current = t;
      if (t - last.current >= interval) {
        last.current = t;
        setIndex((i) => {
          const next = i + 1;
          if (next >= frames.length) {
            if (loop) return 0;
            onComplete?.();
            return i;
          }
          return next;
        });
      }
      raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [frames, fps, loop, reduced]);

  // Self-heal a dropped frame (transient dev-server 503) by retrying it; only
  // after retries are exhausted do we tell the caller to fall back.
  const frameSrc = frames.length ? frames[Math.min(index, frames.length - 1)] : undefined;
  const retry = useImgRetry(frameSrc, 5, onError);

  if (!frames.length || !retry.src) return null;
  return (
    <img
      className="pixelated"
      src={retry.src}
      width={size}
      height={size}
      alt={alt}
      draggable={false}
      onError={retry.onError}
      style={{ display: 'block' }}
    />
  );
}
