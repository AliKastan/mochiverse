import { useEffect, useRef, useState } from 'react';

// ============================================================
// Self-healing <img> loading.
//
// The Vite DEV server can transiently 503 / drop an asset request when several
// load at once, which used to leave icons broken and the pet's sprite blank.
// This hook retries a failed image a few times (cache-busted, with a small
// backoff) so images fill themselves in instead of staying broken. It's a
// no-op once the image loads, and costs nothing in production (images just
// load first try).
// ============================================================

export function useImgRetry(src: string | undefined, maxRetries = 5, onGiveUp?: () => void): {
  src: string | undefined;
  onError: () => void;
} {
  const [attempt, setAttempt] = useState(0);
  const timer = useRef<number | undefined>(undefined);
  const giveUp = useRef(onGiveUp);
  giveUp.current = onGiveUp;

  // reset when the underlying source changes
  useEffect(() => {
    setAttempt(0);
    return () => { if (timer.current) window.clearTimeout(timer.current); };
  }, [src]);

  // once we've exhausted retries, let the caller fall back (e.g. to the blob)
  useEffect(() => {
    if (attempt >= maxRetries) giveUp.current?.();
  }, [attempt, maxRetries]);

  const onError = () => {
    if (timer.current) window.clearTimeout(timer.current);
    // small backoff gives a flooded dev server a moment to recover
    timer.current = window.setTimeout(() => {
      setAttempt((a) => Math.min(a + 1, maxRetries));
    }, 140);
  };

  // append a cache-busting param ONLY on retries so the browser re-requests
  const resolved = !src || attempt === 0 ? src : `${src}${src.includes('?') ? '&' : '?'}r=${attempt}`;
  return { src: resolved, onError };
}
