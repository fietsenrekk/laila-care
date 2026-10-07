/**
 * Awwwards submission images, captured from the real site (brief §14).
 *   node tools/submission.mjs [baseUrl]
 * desktop-1200x900.jpg  the line mid-draw, crossing into the gap between the two disciplines
 * mobile-750x1624.jpg   phone view at the same moment
 * hero-1600x1200.jpg    the opening statement
 * a11y-1200x900.jpg     the accessibility controls at the largest text in high contrast
 */
import puppeteer from 'puppeteer-core';
import path from 'node:path';
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

const ROOT = path.resolve(import.meta.dirname, '..');
const OUT = path.join(ROOT, 'submission');
const BASE = process.argv[2] || 'http://localhost:4221/laila-care';
fs.mkdirSync(OUT, { recursive: true });
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--hide-scrollbars'] });
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function shot(name, { w, h, dpr = 1, url = '/', scrollTo, ts, hc, outW, outH }) {
  const p = await browser.newPage();
  await p.setViewport({ width: w, height: h, deviceScaleFactor: dpr });
  await p.evaluateOnNewDocument((ts, hc) => { try { localStorage.clear(); if (ts) localStorage.setItem('lc-ts', ts); if (hc) localStorage.setItem('lc-hc', '1'); } catch (e) {} }, ts || null, !!hc);
  await p.goto(BASE + url, { waitUntil: 'networkidle0' });
  await p.evaluateHandle('document.fonts.ready');
  if (scrollTo) {
    // scroll in steps, as a reader would, so the line draws up to this point
    await p.evaluate(async sel => {
      const el = document.querySelector(sel);
      const y = el.getBoundingClientRect().top + scrollY - innerHeight * 0.18;
      for (let s = 0; s <= y; s += 120) { scrollTo(0, s); await new Promise(r => setTimeout(r, 40)); }
      scrollTo(0, y);
    }, scrollTo);
    await sleep(2200);
  }
  const png = path.join(ROOT, 'tools/tmp', name + '.png');
  await p.screenshot({ path: png });
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', png, '-vf', `scale=${outW || w * dpr}:${outH || h * dpr}:flags=lanczos`, '-q:v', '2', path.join(OUT, name + '.jpg')]);
  await p.close();
  console.log('  ' + name);
}
await shot('desktop-1200x900', { w: 1200, h: 900, scrollTo: '.duo' });
await shot('mobile-750x1624', { w: 375, h: 812, dpr: 2, scrollTo: '.duo__head' });
await shot('hero-1600x1200', { w: 1600, h: 1200 });
await shot('a11y-1200x900', { w: 1200, h: 900, ts: '3', hc: true, url: '/thuisverpleging/' });
await browser.close();
