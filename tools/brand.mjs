/**
 * Builds the reusable brand files from the traced layers in assets/brand/logo.json:
 *   mark.svg                 LC monogram + swoosh + footprint
 *   lockup-stacked.svg       mark over wordmark over sub-line (the board lockup)
 *   lockup-horizontal.svg    mark beside wordmark (the site header)
 *   footprint.svg            the foot alone (the step line's terminus)
 *   favicon.svg + PNG sizes  mark on a navy tile
 * Also exports the fragments the site build inlines (src/brand.js).
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import puppeteer from 'puppeteer-core';

const ROOT = path.resolve(import.meta.dirname, '..');
const { layers: Ly, bbox: B } = JSON.parse(fs.readFileSync(path.join(ROOT, 'assets/brand/logo.json'), 'utf8'));
const OUT = path.join(ROOT, 'assets/brand');
const C = { blauw: '#1E3A5F', goud: '#D4AF37', wit: '#FFFFFF' };
const r = n => Math.round(n);

/* -------- the mark, in its own coordinate space (origin at its bbox corner) */
const pad = 8;
const mx = B.mark.minx - pad, my = B.mark.miny - pad;
const mw = r(B.mark.maxx - B.mark.minx + pad * 2), mh = r(B.mark.maxy - B.mark.miny + pad * 2);
const markInner = (blue = 'var(--logo-blauw,#1E3A5F)', gold = 'var(--logo-goud,#D4AF37)') =>
  `<g transform="translate(${r(-mx)} ${r(-my)})"><path fill-rule="evenodd" fill="${blue}" d="${Ly.L}${Ly.C}"/><path fill-rule="evenodd" class="lc-swoosh" fill="${gold}" d="${Ly.swoosh}"/><path fill-rule="evenodd" class="lc-foot" fill="${gold}" d="${Ly.foot}"/></g>`;

/* -------- wordmark, origin at its bbox corner */
const wx = B.word.minx, wy = B.word.miny;
const ww = r(B.word.maxx - B.word.minx), wh = r(B.word.maxy - B.word.miny);
const wordInner = (fill = 'var(--logo-blauw,#1E3A5F)') =>
  `<path fill-rule="evenodd" fill="${fill}" transform="translate(${r(-wx)} ${r(-wy)})" d="${Ly.word}"/>`;

/* -------- stacked lockup: original geometry, cropped */
const sx = Math.min(B.mark.minx, B.word.minx, B.sub.minx) - 20, sy = B.mark.miny - 20;
const sw = r(Math.max(B.word.maxx, B.sub.maxx, B.mark.maxx) + 20 - sx), sh = r(B.sub.maxy + 20 - sy);
const stacked = (blue, gold) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${sw} ${sh}" role="img" aria-label="Laila Care, thuisverpleging en podologie">
<g transform="translate(${r(-sx)} ${r(-sy)})"><path fill-rule="evenodd" fill="${blue}" d="${Ly.L}${Ly.C}${Ly.word}${Ly.sub}"/><path fill-rule="evenodd" fill="${gold}" d="${Ly.swoosh}${Ly.foot}"/></g></svg>`;

/* -------- horizontal lockup: mark at 2.6x cap height, wordmark centred on it */
const capH = wh;
const markScale = (capH * 2.6) / mh;
const gap = capH * 0.55;
const hw = r(mw * markScale + gap + ww), hh = r(mh * markScale);
const horizontal = (blue, gold) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${hw} ${hh}" role="img" aria-label="Laila Care">
<g transform="scale(${markScale.toFixed(4)})">${markInner(blue, gold)}</g><g transform="translate(${r(mw * markScale + gap)} ${r((hh - wh) / 2)})">${wordInner(blue)}</g></svg>`;

/* -------- footprint alone */
const fx = B.foot.minx - 6, fy = B.foot.miny - 6, fw = r(B.foot.maxx - B.foot.minx + 12), fh = r(B.foot.maxy - B.foot.miny + 12);
const footprint = gold => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${fw} ${fh}"><path fill-rule="evenodd" fill="${gold}" transform="translate(${r(-fx)} ${r(-fy)})" d="${Ly.foot}"/></svg>`;

/* -------- favicon: mark on navy rounded tile, mark in white + gold */
const tile = Math.max(mw, mh) * 1.06;
const favicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${r(tile)} ${r(tile)}"><rect width="${r(tile)}" height="${r(tile)}" rx="${r(tile * 0.18)}" fill="${C.blauw}"/><g transform="translate(${r((tile - mw) / 2)} ${r((tile - mh) / 2)})">${markInner('#FFFFFF', C.goud)}</g></svg>`;

const files = {
  'mark.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${mw} ${mh}" role="img" aria-label="Laila Care">${markInner(C.blauw, C.goud)}</svg>`,
  'mark-reversed.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${mw} ${mh}" role="img" aria-label="Laila Care">${markInner(C.wit, C.goud)}</svg>`,
  'lockup-stacked.svg': stacked(C.blauw, C.goud),
  'lockup-stacked-reversed.svg': stacked(C.wit, C.goud),
  'lockup-horizontal.svg': horizontal(C.blauw, C.goud),
  'lockup-horizontal-reversed.svg': horizontal(C.wit, C.goud),
  'footprint.svg': footprint(C.goud),
  'favicon.svg': favicon,
};
for (const [n, s] of Object.entries(files)) fs.writeFileSync(path.join(OUT, n), s);

/* -------- fragments for the site build: currentColor-driven, tokenised */
const frag = {
  markViewBox: `0 0 ${mw} ${mh}`,
  markInner: markInner('var(--logo-blauw)', 'var(--logo-goud)'),
  horizViewBox: `0 0 ${hw} ${hh}`,
  horizInner: `<g transform="scale(${markScale.toFixed(4)})">${markInner('var(--logo-blauw)', 'var(--logo-goud)')}</g><g transform="translate(${r(mw * markScale + gap)} ${r((hh - wh) / 2)})">${wordInner('var(--logo-blauw)')}</g>`,
  stackedViewBox: `0 0 ${sw} ${sh}`,
  stackedInner: `<g transform="translate(${r(-sx)} ${r(-sy)})"><path fill-rule="evenodd" fill="var(--logo-blauw)" d="${Ly.L}${Ly.C}${Ly.word}${Ly.sub}"/><path fill-rule="evenodd" fill="var(--logo-goud)" d="${Ly.swoosh}${Ly.foot}"/></g>`,
  footViewBox: `0 0 ${fw} ${fh}`,
  footInner: `<path fill-rule="evenodd" transform="translate(${r(-fx)} ${r(-fy)})" d="${Ly.foot}"/>`,
  // The swoosh as a centreline would be ideal for the step line; its outline
  // is kept here so the hero can draw the real shape.
  swooshViewBox: `0 0 ${r(B.swoosh.maxx - B.swoosh.minx)} ${r(B.swoosh.maxy - B.swoosh.miny)}`,
  swooshInner: `<path fill-rule="evenodd" transform="translate(${r(-B.swoosh.minx)} ${r(-B.swoosh.miny)})" d="${Ly.swoosh}"/>`,
};
fs.writeFileSync(path.join(ROOT, 'src/brand.js'), '// generated by tools/brand.mjs, do not edit\nexport default ' + JSON.stringify(frag) + ';\n');

/* -------- raster favicons + proof sheet */
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new' });
const page = await browser.newPage();
for (const size of [16, 32, 180, 192, 512]) {
  await page.setViewport({ width: size, height: size });
  await page.setContent(`<body style="margin:0;background:transparent">${favicon.replace('<svg ', `<svg width="${size}" height="${size}" `)}</body>`);
  await page.screenshot({ path: path.join(OUT, `favicon-${size}.png`), omitBackground: true });
}
const proof = `<body style="margin:0;font:14px system-ui;background:#fff">
<div style="display:grid;grid-template-columns:1fr 1fr;gap:0">
<div style="padding:40px;background:#fff">${files['lockup-stacked.svg'].replace('<svg ', '<svg width="520" ')}</div>
<div style="padding:40px;background:#1E3A5F">${files['lockup-stacked-reversed.svg'].replace('<svg ', '<svg width="520" ')}</div>
<div style="padding:30px 40px;background:#fff">${files['lockup-horizontal.svg'].replace('<svg ', '<svg height="56" ')}<br><br>${files['lockup-horizontal.svg'].replace('<svg ', '<svg height="34" ')}</div>
<div style="padding:30px 40px;background:#1E3A5F">${files['lockup-horizontal-reversed.svg'].replace('<svg ', '<svg height="56" ')}</div>
<div style="padding:30px 40px;display:flex;gap:24px;align-items:end">${[16, 32, 64, 180].map(s => favicon.replace('<svg ', `<svg width="${s}" height="${s}" `)).join('')}</div>
<div style="padding:30px 40px;background:#E9ECEF">${files['footprint.svg'].replace('<svg ', '<svg height="120" ')}</div>
</div></body>`;
await page.setViewport({ width: 1240, height: 900 });
await page.setContent(proof);
await page.screenshot({ path: path.join(ROOT, 'docs/shots/brand-proof.png'), fullPage: true });
await browser.close();
// .ico from the 32px PNG
execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', path.join(OUT, 'favicon-32.png'), path.join(OUT, 'favicon.ico')]);
console.log('brand files:', Object.keys(files).join(', '));
console.log(`mark ${mw}x${mh}, horizontal ${hw}x${hh}, stacked ${sw}x${sh}`);
