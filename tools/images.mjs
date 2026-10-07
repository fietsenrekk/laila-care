/**
 * Image pipeline. Grades, crops and encodes the three supplied photographs.
 *
 * Provenance (recorded in docs/IMAGES.md): all three were generated for the
 * brand board and approved for use by the studio on 2026-10-07. They ship
 * with data-generated="true" and a visible "illustratief beeld" caption.
 *
 * Resolution: the sources are 1951-2000px wide. No credits were available for
 * an AI upscale, and lanczos upscaling adds pixels without adding detail, so the
 * ladder stops at native width and the layout never displays a photo wider than
 * the ladder can serve sharply (see docs/IMAGES.md).
 *
 * Grade (numeric targets, recorded in PROGRESS):
 *   black point untouched (a lift desaturated skin, measured below)
 *   highlights rolled 1 -> 0.985 (no clipped skin)
 *   no global saturation change: verified below that any pull drags skin
 *   white balance: the podiatry close-up runs cool (blue-white), warmed slightly
 *   to sit with the other two
 * Every output is re-encoded, which strips EXIF/XMP including any GPS.
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const ROOT = path.resolve(import.meta.dirname, '..');
const SRC = path.join(ROOT, 'assets/src-img');
const OUT = path.join(ROOT, 'assets/img');
fs.mkdirSync(OUT, { recursive: true });

// Black-point lift (0 -> 0.02) was tried and dropped: it pulled skin saturation
// -0.020 on the hero face. eq=saturation compensation rotated skin hue 2.84deg.
// Highlight roll alone: hue +0.13deg, sat -0.008. See PROGRESS.md.
const BASE = "curves=all='0/0 0.5/0.5 1/0.985'";
export const IMAGES = {
  'hero-caregiver': { src: 'hero-caregiver.webp', w: 1951, h: 806, grade: BASE,
    crops: { wide: null, tall: { x: 820, y: 0, w: 1000, h: 806 } } },
  'podologie-closeup': { src: 'podologie-closeup.webp', w: 2000, h: 693, grade: `${BASE},colortemperature=temperature=6200:mix=0.35`,
    crops: { wide: null, tall: { x: 760, y: 0, w: 1000, h: 693 } } },
  'interior': { src: 'interior.webp', w: 2000, h: 668, grade: BASE,
    crops: { wide: null, tall: { x: 1150, y: 0, w: 850, h: 668 } } },
};
const LADDER = [480, 768, 1200, 1600, 2000];

const ff = (args) => execFileSync('ffmpeg', ['-v', 'error', '-y', ...args], { maxBuffer: 256 * 1024 * 1024 });

/* ---------- skin check: grade must not move skin hue/saturation */
function rgbAt(file, x, y, w, h) {
  return ff(['-i', file, '-vf', `crop=${w}:${h}:${x}:${y}`, '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-']);
}
function hsl([r, g, b]) {
  r /= 255; g /= 255; b /= 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2, d = mx - mn;
  if (!d) return [0, 0, l];
  const s = d / (1 - Math.abs(2 * l - 1));
  let hh = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [(hh * 60 + 360) % 360, s, l];
}
function skinStats(buf) {
  // skin-ish pixels: warm hue, not near-black (hair, eyes), not near-white (teeth, sclera)
  const px = [];
  for (let i = 0; i < buf.length; i += 3) {
    const c = hsl([buf[i], buf[i + 1], buf[i + 2]]);
    if (c[0] >= 0 && c[0] <= 45 && c[2] > 0.12 && c[2] < 0.8 && c[1] > 0.15) px.push(c);
  }
  const m = k => px.reduce((a, p) => a + p[k], 0) / px.length;
  return { n: px.length, h: m(0), s: m(1), l: m(2) };
}

const report = [];
for (const [name, im] of Object.entries(IMAGES)) {
  const src = path.join(SRC, im.src);
  const graded = path.join(ROOT, 'tools/tmp', `${name}-graded.png`);
  fs.mkdirSync(path.dirname(graded), { recursive: true });
  ff(['-i', src, '-vf', `${im.grade},format=rgb24`, '-map_metadata', '-1', graded]);

  if (name === 'hero-caregiver') {
    // face + forearm regions of the darkest-skinned subject in the set
    const regions = [[1200, 60, 260, 260], [830, 640, 160, 120]];
    for (const r of regions) {
      const a = skinStats(rgbAt(src, ...r)), b = skinStats(rgbAt(graded, ...r));
      const line = `skin ${r.join(',')}: n=${a.n} hue ${a.h.toFixed(2)}->${b.h.toFixed(2)} (${(b.h - a.h).toFixed(2)}deg) sat ${a.s.toFixed(3)}->${b.s.toFixed(3)} (${(b.s - a.s).toFixed(3)}) lum ${a.l.toFixed(3)}->${b.l.toFixed(3)}`;
      console.log(line); report.push(line);
      if (Math.abs(b.h - a.h) > 1 || Math.abs(b.s - a.s) > 0.015) { console.error('SKIN DRIFT over limit'); process.exitCode = 1; }
    }
  }

  for (const [crop, c] of Object.entries(im.crops)) {
    const cw = c ? c.w : im.w;
    const cropF = c ? `crop=${c.w}:${c.h}:${c.x}:${c.y},` : '';
    for (const w of LADDER.filter(v => v < cw).concat(cw)) {
      const base = path.join(OUT, `${name}-${crop}-${w}`);
      const vf = `${cropF}scale=${w}:-2:flags=lanczos`;
      ff(['-i', graded, '-vf', vf, '-c:v', 'libaom-av1', '-still-picture', '1', '-crf', '30', '-cpu-used', '6', '-pix_fmt', 'yuv420p', '-map_metadata', '-1', '-f', 'avif', base + '.avif']);
      ff(['-i', graded, '-vf', vf, '-c:v', 'libwebp', '-quality', '80', '-map_metadata', '-1', base + '.webp']);
      ff(['-i', graded, '-vf', vf, '-q:v', '3', '-map_metadata', '-1', base + '.jpg']);
    }
  }
  console.log('encoded', name);
}
fs.writeFileSync(path.join(ROOT, 'tools/tmp/skin-report.txt'), report.join('\n'));
