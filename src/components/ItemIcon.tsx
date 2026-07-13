import candyPng from '../assets/sprites/icons/candy.png';
import medicinePng from '../assets/sprites/icons/medicine.png';
import { useImgRetry } from './useImgRetry';

// ============================================================
// Item icon lookup. Shop/food-item sprites live in
// assets/sprites/items/<key>.png and are discovered at build
// time; candy & medicine reuse the existing UI icons. Missing
// icons fall back to a neutral pixel chip so the UI never breaks
// while art is still being generated.
//
// The item art is HIGH-RESOLUTION (200×200 PixelLab renders), so
// it's downscaled with smooth (`auto`) rendering — nearest-neighbour
// (`pixelated`) would alias badly when shrinking a large source. This
// gives clean, detailed market icons at every display size.
// ============================================================

const itemGlob = import.meta.glob('../assets/sprites/items/*.png', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;

const ITEM_SRC: Record<string, string> = { candy: candyPng, medicine: medicinePng };
for (const [path, url] of Object.entries(itemGlob)) {
  const key = path.match(/\/([^/]+)\.png$/)?.[1];
  if (key) ITEM_SRC[key] = url;
}

/** Resolve an item/cosmetic sprite URL by key (used by ItemIcon and the pet's worn accessory overlay). */
export function getItemSrc(key: string): string | undefined {
  return ITEM_SRC[key];
}

export function ItemIcon({ icon, size = 32 }: { icon: string; size?: number }) {
  const { src, onError } = useImgRetry(ITEM_SRC[icon]);
  if (!src) {
    return (
      <div style={{ width: size, height: size, borderRadius: 4, border: '2px solid var(--ink)', background: 'var(--cream)' }} />
    );
  }
  return (
    <img src={src} onError={onError} width={size} height={size} draggable={false}
      style={{ imageRendering: 'auto', objectFit: 'contain', display: 'block' }} />
  );
}
