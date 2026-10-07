/**
 * Rasterises the traced logo back onto the source grid and diffs it against the
 * source ink, per colour. Eyeballing a trace catches nothing; a pixel diff does.
 * The wordmark is excluded from the diff (its hyphen was removed on purpose).
 * Writes docs/shots/logo-trace-diff.png: source | trace | difference.
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import puppeteer from 'puppeteer-core';

const ROOT = path.resolve(import.meta.dirname, '..');
const TMP = path.join(ROOT, 'tools/tmp');
const logo = JSON.parse(fs.readFileSync(path.join(ROOT, 'assets/brand/logo.json'), 'utf8'));
const W0 = 1549, H0 = 1015, S = logo.scale;

const svg = (fill) => `<svg xmlns="http://www.w3.org/2000/svg" width="${W0}" height="${H0}" viewBox="0 0 ${W0 * S} ${H0 * S}" style="display:block;background:#000">
  <path fill="${fill.blue}" d="${logo.layers.L}${logo.layers.C}"/>
  <path fill="${fill.gold}" d="${logo.layers.swoosh}${logo.layers.foot}"/></svg>`;
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new' });
const page = await browser.newPage();
await page.setViewport({ width: W0, height: H0 });
await page.setContent(`<body style="margin:0">${svg({ blue: '#3C6795', gold: '#DDB553' })}</body>`);
await page.screenshot({ path: path.join(TMP, 'trace-render.png') });
await browser.close();

const raw = (f) => execFileSync('ffmpeg', ['-v', 'error', '-i', f, '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], { maxBuffer: 64 * 1024 * 1024 });
const A = raw(path.join(ROOT, 'assets/src-img/logo-source.webp'));
const T = raw(path.join(TMP, 'trace-render.png'));
const cls = (b, i) => {
  const r = b[i * 3], bl = b[i * 3 + 2];
  if (bl > r + 40 && bl > 70) return 1;     // blue ink
  if (r > bl + 60 && r > 110) return 2;     // gold ink
  return 0;
};
// Only the monogram region (above the wordmark) is compared.
const yMax = (Math.floor(logo.bbox.word.miny / S) - 4) & ~1;
const stat = { 1: { i: 0, u: 0 }, 2: { i: 0, u: 0 } };
const diff = Buffer.alloc(W0 * H0 * 3);
for (let y = 0; y < yMax; y++) for (let x = 0; x < W0; x++) {
  const i = y * W0 + x, a = cls(A, i), t = cls(T, i);
  for (const c of [1, 2]) {
    if (a === c || t === c) stat[c].u++;
    if (a === c && t === c) stat[c].i++;
  }
  if (a !== t) { diff[i * 3] = 255; diff[i * 3 + 1] = 60; diff[i * 3 + 2] = 60; }
}
const iou = c => (stat[c].i / stat[c].u * 100).toFixed(2);
console.log(`monogram IoU  blue ${iou(1)}%   gold ${iou(2)}%`);
fs.writeFileSync(path.join(TMP, 'diff.rgb'), diff);
fs.mkdirSync(path.join(ROOT, 'docs/shots'), { recursive: true });
execFileSync('ffmpeg', ['-v', 'error', '-y',
  '-i', path.join(ROOT, 'assets/src-img/logo-source.webp'), '-i', path.join(TMP, 'trace-render.png'),
  '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', `${W0}x${H0}`, '-i', path.join(TMP, 'diff.rgb'),
  '-filter_complex', `[0]crop=${W0}:${yMax}:0:0,format=rgb24[a];[1]crop=${W0}:${yMax}:0:0,format=rgb24[b];[2]crop=${W0}:${yMax}:0:0[c];[a][b][c]hstack=3,scale=2400:-1`,
  path.join(ROOT, 'docs/shots/logo-trace-diff.png')]);
const ok = +iou(1) > 97 && +iou(2) > 96;
console.log(ok ? 'trace verified' : 'TRACE BELOW THRESHOLD');
process.exitCode = ok ? 0 : 1;
