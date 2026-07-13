// Trim transparent padding from item sprites and re-center them on a square
// canvas so each subject fills its frame — this makes the shop/feed icons read
// crisp and large instead of small-and-soft (the padding was eating ~40% of the
// box). Originals are backed up to items/_original/ before writing in place.
import { PNG } from 'pngjs';
import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync, copyFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIR = join(__dirname, '..', 'src', 'assets', 'sprites', 'items');
const BACKUP = join(DIR, '_original');
if (!existsSync(BACKUP)) mkdirSync(BACKUP, { recursive: true });

const ALPHA_MIN = 12;      // treat pixels below this alpha as empty
const MARGIN_RATIO = 0.08; // breathing room around the subject

for (const file of readdirSync(DIR)) {
  if (!file.endsWith('.png')) continue;
  const srcPath = join(DIR, file);
  const png = PNG.sync.read(readFileSync(srcPath));
  const { width: w, height: h, data } = png;

  // alpha bounding box
  let minX = w, minY = h, maxX = -1, maxY = -1;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const a = data[(y * w + x) * 4 + 3];
      if (a > ALPHA_MIN) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (maxX < 0) { console.log(`skip (empty): ${file}`); continue; }

  const cw = maxX - minX + 1;
  const ch = maxY - minY + 1;
  const side = Math.max(cw, ch);
  const margin = Math.round(side * MARGIN_RATIO);
  const out = side + margin * 2;
  const dst = new PNG({ width: out, height: out });
  dst.data.fill(0);

  const offX = Math.floor((out - cw) / 2);
  const offY = Math.floor((out - ch) / 2);
  for (let y = 0; y < ch; y++) {
    for (let x = 0; x < cw; x++) {
      const si = ((minY + y) * w + (minX + x)) * 4;
      const di = ((offY + y) * out + (offX + x)) * 4;
      dst.data[di] = data[si];
      dst.data[di + 1] = data[si + 1];
      dst.data[di + 2] = data[si + 2];
      dst.data[di + 3] = data[si + 3];
    }
  }

  // Already tight (subject fills >85% of the frame)? leave it — re-trimming a
  // trimmed file is a no-op, and this keeps the script safe to re-run.
  const fill = (cw * ch) / (w * h);
  if (fill > 0.85) { console.log(`skip (already tight): ${file}`); continue; }

  const backupPath = join(BACKUP, file);
  if (!existsSync(backupPath)) copyFileSync(srcPath, backupPath); // preserve the true original only
  writeFileSync(srcPath, PNG.sync.write(dst));
  console.log(`${file}: ${w}x${h} -> ${out}x${out}  (was ${Math.round(fill * 100)}% filled)`);
}
console.log('done.');
