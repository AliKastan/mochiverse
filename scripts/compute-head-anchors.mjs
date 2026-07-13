// Detect where each creature's HEAD actually is, from its sprite pixels, so
// worn accessories can be anchored to the real head instead of a fixed guess
// (which floated / looked pasted-on across the 30+ differently-proportioned
// forms). For each form's idle frame we find:
//   - headTop:  the row where the silhouette first widens into the head dome
//               (skips thin antennae / ear tips / leaf sprouts sticking up)
//   - headCx:   horizontal centre of the head band
//   - headW:    head width
// all as fractions of the (square) frame. Written to src/assets/headAnchors.ts.
import { PNG } from 'pngjs';
import { readFileSync, writeFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SPR = join(__dirname, '..', 'src', 'assets', 'sprites');
const A_MIN = 24;

function firstIdle(dir) {
  if (!existsSync(dir)) return null;
  const files = readdirSync(dir).filter((f) => /^idle_\d+\.png$/.test(f))
    .sort((a, b) => Number(a.match(/\d+/)) - Number(b.match(/\d+/)));
  return files.length ? join(dir, files[0]) : null;
}

function analyze(path) {
  const png = PNG.sync.read(readFileSync(path));
  const { width: w, height: h, data } = png;
  const rowMin = new Array(h).fill(Infinity);
  const rowMax = new Array(h).fill(-1);
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
  if (bottom < 0) return null;
  const rowW = (y) => (rowMax[y] >= 0 ? rowMax[y] - rowMin[y] + 1 : 0);

  // Head dome = first row (from the top of the subject) whose width reaches
  // 42% of the sprite's widest row AND stays that wide a few rows down — this
  // steps past thin sprouts/ears/antennae and lands on the rounded head top.
  let headTop = top;
  for (let y = top; y <= bottom - 2; y++) {
    if (rowW(y) >= 0.42 * maxW && rowW(y + 1) >= 0.42 * maxW && rowW(y + 2) >= 0.42 * maxW) {
      headTop = y;
      break;
    }
  }
  // Head band: from headTop down ~45% of the subject height; the head is the
  // widest thing here for these chibi creatures.
  const bandBottom = Math.min(bottom, headTop + Math.round(0.45 * (bottom - top)));
  let bandMinX = Infinity, bandMaxX = -1, headW = 0;
  for (let y = headTop; y <= bandBottom; y++) {
    if (rowMax[y] < 0) continue;
    bandMinX = Math.min(bandMinX, rowMin[y]);
    bandMaxX = Math.max(bandMaxX, rowMax[y]);
    headW = Math.max(headW, rowW(y));
  }
  const headCx = (bandMinX + bandMaxX) / 2;
  return {
    top: +(headTop / h).toFixed(4),
    cx: +(headCx / w).toFixed(4),
    w: +(headW / w).toFixed(4),
  };
}

const anchors = {};
// blob (species-agnostic hatchling) → key 'cell'
{
  const p = firstIdle(join(SPR, '_blob'));
  if (p) anchors['cell'] = analyze(p);
}
// branching-tree forms → key by form id
{
  const treeDir = join(SPR, 'tree');
  if (existsSync(treeDir)) for (const form of readdirSync(treeDir)) {
    const p = firstIdle(join(treeDir, form));
    if (p) { const a = analyze(p); if (a) anchors[form] = a; }
  }
}
// species/stage fallbacks → key '<species>/<stage>'
for (const species of readdirSync(SPR)) {
  const sp = join(SPR, species);
  if (species.startsWith('_') || species === 'tree' || species === 'egg' || species === 'bg' ||
      species === 'icons' || species === 'items' || species === 'bed') continue;
  if (!statSync(sp).isDirectory()) continue;
  for (const stage of readdirSync(sp)) {
    const p = firstIdle(join(sp, stage));
    if (p) { const a = analyze(p); if (a) anchors[`${species}/${stage}`] = a; }
  }
}

// Accessory geometry. Every item PNG is a square canvas with a LOT of
// transparent padding around the actual art (e.g. the crown fills only the
// middle ~86%×66% of its file). Positioning the whole padded box makes the
// visible art float above the head and mis-scales it. So for each item we
// measure the TIGHT content bounding box (the real pixels) as fractions of the
// file, and MonsterView places the overlay by that box instead of the padding.
//   fa     = file aspect (H/W of the PNG canvas)
//   w      = content width  / file width   (how much of the box the art fills)
//   cx     = content centre-X / file width (art is not always dead-centre)
//   cy     = content centre-Y / file height
//   bottom = content bottom  / file height (lowest opaque row)
const aspect = {};
const box = {};
const itemsDir = join(SPR, 'items');
for (const f of readdirSync(itemsDir)) {
  if (!f.endsWith('.png')) continue;
  const key = f.replace('.png', '');
  const png = PNG.sync.read(readFileSync(join(itemsDir, f)));
  const { width: w, height: h, data } = png;
  aspect[key] = +(h / w).toFixed(4);
  let minX = w, maxX = -1, minY = h, maxY = -1;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    if (data[(y * w + x) * 4 + 3] > A_MIN) {
      if (x < minX) minX = x; if (x > maxX) maxX = x;
      if (y < minY) minY = y; if (y > maxY) maxY = y;
    }
  }
  if (maxX < 0) { box[key] = { fa: 1, w: 1, cx: 0.5, cy: 0.5, bottom: 1 }; continue; }
  box[key] = {
    fa: +(h / w).toFixed(4),
    w: +((maxX - minX + 1) / w).toFixed(4),
    cx: +(((minX + maxX + 1) / 2) / w).toFixed(4),
    cy: +(((minY + maxY + 1) / 2) / h).toFixed(4),
    bottom: +((maxY + 1) / h).toFixed(4),
  };
}

const body = `// AUTO-GENERATED by scripts/compute-head-anchors.mjs — do not edit by hand.
// Per-creature head anchor (fractions of the square sprite frame): where the
// head dome starts (top), its horizontal centre (cx) and width (w). Used to pin
// worn accessories onto the actual head of each form.
export interface HeadAnchor { top: number; cx: number; w: number; }
export const HEAD_ANCHORS: Record<string, HeadAnchor> = ${JSON.stringify(anchors, null, 2)};
export const DEFAULT_HEAD_ANCHOR: HeadAnchor = { top: 0.28, cx: 0.5, w: 0.44 };
/** accessory image aspect ratio = height / width (of the padded square file) */
export const ITEM_ASPECT: Record<string, number> = ${JSON.stringify(aspect, null, 2)};
/**
 * Tight content box of each accessory within its padded square PNG, as fractions
 * of the file. Lets the overlay be placed by the VISIBLE art (no float, correct
 * size) instead of the transparent padding. fa=file aspect, w=content width,
 * cx/cy=content centre, bottom=content bottom edge.
 */
export interface ItemBox { fa: number; w: number; cx: number; cy: number; bottom: number; }
export const ITEM_BOX: Record<string, ItemBox> = ${JSON.stringify(box, null, 2)};
export const DEFAULT_ITEM_BOX: ItemBox = { fa: 1, w: 0.86, cx: 0.5, cy: 0.5, bottom: 0.93 };
`;
writeFileSync(join(__dirname, '..', 'src', 'assets', 'headAnchors.ts'), body);
console.log(`wrote ${Object.keys(anchors).length} anchors, ${Object.keys(aspect).length} aspects`);
for (const [k, v] of Object.entries(anchors)) console.log(`  ${k.padEnd(20)} top=${v.top} cx=${v.cx} w=${v.w}`);
