import { useEffect, useState } from 'react';
import type { HeadAnchor } from '../assets/headAnchors';

// ============================================================
// Per-FRAME head tracking for worn accessories.
//
// The static HEAD_ANCHORS (from each form's idle frame) are correct while the
// pet is idle, but animated states (sad droop, happy hop, eating, sick wobble)
// bake body movement INTO the sprite frames — so a fixed overlay detaches from
// the head and looks pasted-on / floating. Here we detect the head position of
// whatever frame is currently showing, so the accessory rides the head exactly.
//
// Each unique frame URL is analysed once (via canvas) and cached, so this costs
// a single small image scan per frame image over the whole session. Frames are
// same-origin bundled assets, so the canvas is never tainted.
// ============================================================

const cache = new Map<string, HeadAnchor>();
const pending = new Set<string>();
const A_MIN = 24;

function analyze(img: HTMLImageElement): HeadAnchor {
  const w = img.naturalWidth, h = img.naturalHeight;
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const ctx = c.getContext('2d', { willReadFrequently: true })!;
  ctx.drawImage(img, 0, 0);
  const data = ctx.getImageData(0, 0, w, h).data;

  const rowMin = new Array(h).fill(Infinity), rowMax = new Array(h).fill(-1);
  let top = h, bottom = -1, maxW = 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (data[(y * w + x) * 4 + 3] > A_MIN) {
        if (x < rowMin[y]) rowMin[y] = x;
        if (x > rowMax[y]) rowMax[y] = x;
      }
    }
    if (rowMax[y] >= 0) {
      if (y < top) top = y;
      if (y > bottom) bottom = y;
      const rw = rowMax[y] - rowMin[y] + 1;
      if (rw > maxW) maxW = rw;
    }
  }
  if (bottom < 0) throw new Error('empty frame');
  const rowW = (y: number) => (rowMax[y] >= 0 ? rowMax[y] - rowMin[y] + 1 : 0);
  // first row where the silhouette widens into the head dome (skips sprouts/ears)
  let headTop = top;
  for (let y = top; y <= bottom - 2; y++) {
    if (rowW(y) >= 0.42 * maxW && rowW(y + 1) >= 0.42 * maxW && rowW(y + 2) >= 0.42 * maxW) { headTop = y; break; }
  }
  const bandBottom = Math.min(bottom, headTop + Math.round(0.45 * (bottom - top)));
  let minX = Infinity, maxX = -1, headW = 0;
  for (let y = headTop; y <= bandBottom; y++) {
    if (rowMax[y] < 0) continue;
    minX = Math.min(minX, rowMin[y]);
    maxX = Math.max(maxX, rowMax[y]);
    headW = Math.max(headW, rowW(y));
  }
  return { top: headTop / h, cx: (minX + maxX) / 2 / w, w: headW / w };
}

/**
 * Head anchor for the currently displayed frame. Returns the precomputed static
 * `fallback` until the frame has been analysed (async, once per unique URL),
 * then the frame-accurate anchor so the accessory stays glued to the head.
 */
export function useFrameHeadAnchor(url: string | undefined, fallback: HeadAnchor): HeadAnchor {
  const [, bump] = useState(0);
  useEffect(() => {
    if (!url || cache.has(url) || pending.has(url)) return;
    pending.add(url);
    const im = new Image();
    im.decoding = 'async';
    im.onload = () => {
      try { cache.set(url, analyze(im)); bump((n) => n + 1); } catch { /* keep fallback */ }
      pending.delete(url);
    };
    im.onerror = () => pending.delete(url);
    im.src = url;
  }, [url]);
  return (url && cache.get(url)) || fallback;
}
