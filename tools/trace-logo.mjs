/**
 * Traces the supplied raster logo (assets/src-img/logo-source.webp) into
 * addressable vector layers: L, C, swoosh, footprint, the wordmark letters and
 * the sub-line.
 *
 * The source is a 1549x1015 raster with a lighter blue (#3C6795) than the
 * brand board's navy (#1E3A5F), and its wordmark reads "LAILA-CARE". The client
 * collateral reads "LAILA CARE", so the hyphen is dropped here and "CARE" is
 * re-spaced onto the rhythm of "LAILA". Colour is applied by the site, not baked in.
 *
 * Pipeline: 3x lanczos upscale -> per-colour ink masks (blue, gold) -> potrace
 * (curve fitting, not a lattice walk: everything in this mark is curved) ->
 * split into closed subpaths -> classify by position -> write brand/logo.json.
 *
 * Run: node tools/trace-logo.mjs   (needs ffmpeg on PATH)
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import potrace from 'potrace';

const ROOT = path.resolve(import.meta.dirname, '..');
const TMP = path.join(ROOT, 'tools/tmp');
const SRC = path.join(ROOT, 'assets/src-img/logo-source.webp');
const S = 3; // upscale factor before tracing
fs.mkdirSync(TMP, { recursive: true });

/* ---------------------------------------------------------- 1. masks */
const W0 = 1549, H0 = 1015, W = W0 * S, H = H0 * S;
execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', SRC, '-vf', `scale=${W}:${H}:flags=lanczos`,
  '-f', 'rawvideo', '-pix_fmt', 'rgb24', path.join(TMP, 'logo3x.rgb')]);
const rgb = fs.readFileSync(path.join(TMP, 'logo3x.rgb'));
const blue = Buffer.alloc(W * H), gold = Buffer.alloc(W * H);
for (let i = 0; i < W * H; i++) {
  const r = rgb[i * 3], b = rgb[i * 3 + 2];
  // ink fraction against the black ground, per hue family
  const fb = b > r ? Math.min(1, Math.max(0, (b - r * 0.6) / 149)) : 0;
  const fg = r > b + 15 ? Math.min(1, Math.max(0, (r - b * 0.5) / 180)) : 0;
  blue[i] = 255 - Math.round(fb * 255);
  gold[i] = 255 - Math.round(fg * 255);
}
const toPng = (name, buf) => {
  const pgm = path.join(TMP, name + '.pgm');
  fs.writeFileSync(pgm, Buffer.concat([Buffer.from(`P5\n${W} ${H}\n255\n`), buf]));
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', pgm, path.join(TMP, name + '.png')]);
  return path.join(TMP, name + '.png');
};

/* ---------------------------------------------------------- 2. trace */
const traceT = (file, threshold, turd = 60) => new Promise((res, rej) => {
  const t = new potrace.Potrace();
  t.setParameters({ threshold, turdSize: turd, optCurve: true, optTolerance: 0.25, alphaMax: 1.0, blackOnWhite: true });
  t.loadImage(file, (err) => err ? rej(err) : res(t.getPathTag().match(/ d="([^"]+)"/)[1]));
});

/** Splits one potrace path into closed subpaths with numeric bboxes. */
function subpaths(d) {
  return d.split(/(?=M)/).map(s => s.trim()).filter(Boolean).map(s => {
    const n = s.match(/-?\d*\.?\d+/g).map(Number);
    const xs = n.filter((_, i) => i % 2 === 0), ys = n.filter((_, i) => i % 2 === 1);
    return { d: s, minx: Math.min(...xs), maxx: Math.max(...xs), miny: Math.min(...ys), maxy: Math.max(...ys) };
  });
}
const contains = (a, b) => b.minx >= a.minx && b.maxx <= a.maxx && b.miny >= a.miny && b.maxy <= a.maxy;
/** Folds counters (subpaths inside another subpath's bbox) into their outer shape. */
function group(list) {
  const sorted = list.slice().sort((a, b) => (b.maxx - b.minx) * (b.maxy - b.miny) - (a.maxx - a.minx) * (a.maxy - a.miny));
  const out = [];
  for (const p of sorted) {
    const host = out.find(o => contains(o, p));
    if (host) host.d += p.d; else out.push({ ...p });
  }
  return out.sort((a, b) => a.minx - b.minx);
}

const blueD = subpaths(await traceT(toPng("blue", blue), 150));
const goldD = subpaths(await traceT(toPng("gold", gold), 128, 8));
console.log(`blue subpaths ${blueD.length}, gold subpaths ${goldD.length}`);

/* ---------------------------------------------------------- 3. classify */
// Bands by y (in 3x pixels): monogram above ~1880, wordmark ~2000-2500, sub-line below.
const ys = blueD.map(p => p.miny).sort((a, b) => a - b);
const mono = group(blueD.filter(p => p.maxy < 1900 * 1));
const word = group(blueD.filter(p => p.miny >= 1900 && p.maxy < 2560));
const sub = group(blueD.filter(p => p.miny >= 2560));
console.log(`monogram parts ${mono.length}, wordmark parts ${word.length}, sub-line parts ${sub.length}`);
for (const [n, g] of [['mono', mono], ['word', word], ['sub', sub]])
  console.log(n, g.map(p => `${Math.round(p.minx)}-${Math.round(p.maxx)}x${Math.round(p.miny)}-${Math.round(p.maxy)}`).join(' | '));

const goldG = group(goldD);
console.log('gold', goldG.map(p => `${Math.round(p.minx)}-${Math.round(p.maxx)}x${Math.round(p.miny)}-${Math.round(p.maxy)}`).join(' | '));

fs.writeFileSync(path.join(TMP, 'trace-raw.json'), JSON.stringify({ W, H, mono, word, sub, gold: goldG }, null, 1));

/* ---------------------------------------------------------- 4. assemble */
// Wordmark: drop the hyphen (the one part far shorter than cap height) and
// close "CARE" up onto a word space. Letter gaps in LAILA measure 96-140; a
// spaced-caps word space reads right at ~2.4x the median letter gap.
const capH = Math.max(...word.map(p => p.maxy - p.miny));
const hyphenIdx = word.findIndex(p => (p.maxy - p.miny) < capH * 0.3);
if (hyphenIdx < 0) throw new Error('hyphen not found');
const letters = word.filter((_, i) => i !== hyphenIdx);
const gaps = letters.slice(1).map((p, i) => p.minx - letters[i].maxx).sort((a, b) => a - b);
const medGap = gaps[Math.floor(gaps.length / 2) - 1]; // excludes the old hyphen gap (largest)
const wordSpace = Math.round(medGap * 2.4);
const aEnd = letters[4].maxx, cStart = letters[5].minx;
const shift = cStart - aEnd - wordSpace;
console.log(`hyphen dropped; median letter gap ${medGap}, word space ${wordSpace}, CARE shifted ${-shift}`);
const tx = (d, dx, dy = 0) => d.replace(/(-?\d*\.?\d+)[ ,](-?\d*\.?\d+)/g, (_, x, y) => `${+(+x + dx).toFixed(2)} ${+(+y + dy).toFixed(2)}`);
const wordParts = letters.map((p, i) => i >= 5
  ? { ...p, d: tx(p.d, -shift), minx: p.minx - shift, maxx: p.maxx - shift } : p);

const bbox = parts => ({
  minx: Math.min(...parts.map(p => p.minx)), maxx: Math.max(...parts.map(p => p.maxx)),
  miny: Math.min(...parts.map(p => p.miny)), maxy: Math.max(...parts.map(p => p.maxy)),
});
// Names, so the site can address each layer.
const [Lupper, Lfoot, C, Ctail] = [...mono].sort((a, b) => a.minx - b.minx || a.miny - b.miny);
const swoosh = goldG.reduce((a, b) => (b.maxx - b.minx > a.maxx - a.minx ? b : a));
const foot = goldG.filter(p => p !== swoosh);

const layers = {
  L: [mono.find(p => p.miny < 400), mono.find(p => p.miny > 1400 && p.minx < 1500)].map(p => p.d).join(''),
  C: [mono.find(p => p.minx > 1900 && p.miny < 600), mono.find(p => p.miny > 1700 && p.minx > 2200)].map(p => p.d).join(''),
  swoosh: swoosh.d,
  foot: foot.map(p => p.d).join(''),
  word: wordParts.map(p => p.d).join(''),
  sub: sub.map(p => p.d).join(''),
};
const B = {
  mark: bbox([...mono, ...goldG]),
  word: bbox(wordParts),
  sub: bbox(sub),
  foot: bbox(foot),
  swoosh: bbox([swoosh]),
};
// Re-centre the sub-line under the new (narrower) wordmark.
const subDx = Math.round(((B.word.minx + B.word.maxx) - (B.sub.minx + B.sub.maxx)) / 2);
layers.sub = tx(layers.sub, subDx);
B.sub = { ...B.sub, minx: B.sub.minx + subDx, maxx: B.sub.maxx + subDx };

const out = { source: 'assets/src-img/logo-source.webp', scale: S, capH, layers, bbox: B };
fs.mkdirSync(path.join(ROOT, 'assets/brand'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'assets/brand/logo.json'), JSON.stringify(out));
console.log('bboxes', JSON.stringify(B));
