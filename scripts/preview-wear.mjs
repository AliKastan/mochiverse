// Composite a worn accessory over a pet sprite using the EXACT head-relative
// geometry MonsterView now applies (accessory sized/placed off the creature's
// detected head), so we can eyeball placement without running the app.
import { PNG } from 'pngjs';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const SIZE = 150;
const A_MIN = 24;

// --- head detection: identical logic to compute-head-anchors.mjs ---
function headAnchor(png) {
  const { width: w, height: h, data } = png;
  const rowMin = new Array(h).fill(Infinity), rowMax = new Array(h).fill(-1);
  let top = h, bottom = -1, maxW = 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++)
      if (data[(y * w + x) * 4 + 3] > A_MIN) { if (x < rowMin[y]) rowMin[y] = x; if (x > rowMax[y]) rowMax[y] = x; }
    if (rowMax[y] >= 0) { if (y < top) top = y; if (y > bottom) bottom = y; const rw = rowMax[y]-rowMin[y]+1; if (rw>maxW) maxW=rw; }
  }
  const rowW = (y) => (rowMax[y] >= 0 ? rowMax[y] - rowMin[y] + 1 : 0);
  let headTop = top;
  for (let y = top; y <= bottom - 2; y++)
    if (rowW(y) >= 0.42*maxW && rowW(y+1) >= 0.42*maxW && rowW(y+2) >= 0.42*maxW) { headTop = y; break; }
  const bandBottom = Math.min(bottom, headTop + Math.round(0.45 * (bottom - top)));
  let minX = Infinity, maxX = -1, headW = 0;
  for (let y = headTop; y <= bandBottom; y++) { if (rowMax[y]<0) continue; minX=Math.min(minX,rowMin[y]); maxX=Math.max(maxX,rowMax[y]); headW=Math.max(headW,rowW(y)); }
  return { top: headTop / h, cx: (minX + maxX) / 2 / w, w: headW / w };
}
// tight content box of an accessory PNG, fractions of the file (matches ITEM_BOX)
function contentBox(png) {
  const { width: w, height: h, data } = png;
  let minX=w,maxX=-1,minY=h,maxY=-1;
  for (let y=0;y<h;y++) for (let x=0;x<w;x++) if (data[(y*w+x)*4+3]>A_MIN){ if(x<minX)minX=x;if(x>maxX)maxX=x;if(y<minY)minY=y;if(y>maxY)maxY=y; }
  return { fa:h/w, w:(maxX-minX+1)/w, cx:((minX+maxX+1)/2)/w, cy:((minY+maxY+1)/2)/h, bottom:(maxY+1)/h };
}
function resize(png, w, h) {
  const out = new PNG({ width: w, height: h });
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const sx = Math.min(png.width-1, Math.floor((x/w)*png.width)), sy = Math.min(png.height-1, Math.floor((y/h)*png.height));
    const si=(sy*png.width+sx)*4, di=(y*w+x)*4;
    out.data[di]=png.data[si]; out.data[di+1]=png.data[si+1]; out.data[di+2]=png.data[si+2]; out.data[di+3]=png.data[si+3];
  }
  return out;
}
function blit(dst, src, ox, oy) {
  for (let y=0;y<src.height;y++) for (let x=0;x<src.width;x++) {
    const dx=ox+x, dy=oy+y; if (dx<0||dy<0||dx>=dst.width||dy>=dst.height) continue;
    const si=(y*src.width+x)*4, di=(dy*dst.width+dx)*4, a=src.data[si+3]/255; if (a===0) continue;
    for (let c=0;c<3;c++) dst.data[di+c]=Math.round(src.data[si+c]*a + dst.data[di+c]*(1-a));
    dst.data[di+3]=Math.max(dst.data[di+3], src.data[si+3]);
  }
}

const items = join(ROOT, 'src/assets/sprites/items');
// [petSpritePath, key, anchorType, scale, y]  (scale/y head-relative, matching constants)
// mirror constants.ts wear geometry [scale, y] so the preview matches the app
const WEAR = {
  bow:['head',0.72,0.30], crown:['head',1.0,0.35], top_hat:['head',1.0,0.20],
  party_hat:['head',0.82,0.14], flower_crown:['head',1.15,0.22], wizard_hat:['head',1.0,0.16],
  cap:['head',1.05,0.30], halo:['head',1.0,-0.04], glasses:['face',1.0,0.52],
  sunglasses:['face',1.0,0.52], headphones:['head',1.2,0.5], scarf:['neck',1.05,0.4],
  cat_ears:['head',1.1,0.10], devil_horns:['head',1.05,0.14], tiara:['head',0.95,0.28],
  heart_glasses:['face',1.0,0.52], bowtie:['neck',0.55,0.35],
};
// pets to exercise placement on (mochi/teen is the one in the screenshot)
const PETS = [
  'src/assets/sprites/mochi/teen/idle_0.png',
  'src/assets/sprites/tree/puff/idle_0.png',
  'src/assets/sprites/_blob/idle_0.png',
  'src/assets/sprites/tree/faerie/idle_0.png',
];

// build a contact sheet: rows = pets, cols = accessories
const keys = Object.keys(WEAR);
const CELL = SIZE, PAD = 8;
const cols = keys.length, rows = PETS.length;
const sheetW = cols*CELL + (cols+1)*PAD, sheetH = rows*CELL + (rows+1)*PAD;
const sheet = new PNG({ width: sheetW, height: sheetH }); sheet.data.fill(0);
// light backdrop so transparent floats are visible
for (let i=0;i<sheet.data.length;i+=4){ sheet.data[i]=250; sheet.data[i+1]=245; sheet.data[i+2]=250; sheet.data[i+3]=255; }

PETS.forEach((petRel, r) => {
  const petPng = PNG.sync.read(readFileSync(join(ROOT, petRel)));
  const ha = headAnchor(petPng);
  const pet = resize(petPng, SIZE, SIZE);
  const headTop = SIZE*ha.top, headW = SIZE*ha.w, cx = SIZE*ha.cx;
  keys.forEach((key, c) => {
    const [anchor, scale, y] = WEAR[key];
    const accRaw = PNG.sync.read(readFileSync(join(items, `${key}.png`)));
    const box = contentBox(accRaw);
    const visW = headW*scale;
    const w = Math.round(visW / box.w);
    const h = Math.round(w * box.fa);
    const acc = resize(accRaw, w, h);
    const left = Math.round(cx - w*box.cx);
    const top = Math.round(anchor==='head' ? headTop + headW*y - h*box.bottom : headTop + headW*y - h*box.cy);
    const ox = PAD + c*(CELL+PAD), oy = PAD + r*(CELL+PAD);
    blit(sheet, pet, ox, oy); blit(sheet, acc, ox+left, oy+top);
  });
});
const outPath = join(ROOT, 'scripts/_preview_sheet.png');
writeFileSync(outPath, PNG.sync.write(sheet));
console.log(`wrote ${outPath}  (${rows} pets × ${cols} accessories)`);
