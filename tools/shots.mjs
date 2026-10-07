/**
 * Screenshots + layout facts, per route and width.
 *   node tools/shots.mjs [routeFilter] [--widths=390,1440] [--ts=3] [--hc] [--rm] [--nojs]
 * Walks the page top to bottom first (so the thread draws and settle fires),
 * then captures full page. Reports console errors, horizontal overflow, and
 * the thread's length and drawn fraction. Output: docs/shots/tmp/.
 */
import puppeteer from 'puppeteer-core';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const OUT = path.join(ROOT, 'docs/shots/tmp');
fs.mkdirSync(OUT, { recursive: true });
const BASE = process.env.LC_URL || 'http://localhost:4221/laila-care';
const args = process.argv.slice(2);
const opt = k => { const a = args.find(x => x.startsWith(`--${k}`)); return a ? (a.split('=')[1] ?? true) : null; };
const filter = args.find(a => !a.startsWith('--'));
const widths = (opt('widths') || '390,1440').split(',').map(Number);
const ROUTES = ['/', '/over-ons/', '/thuisverpleging/', '/podologie/', '/tarieven/', '/contact/', '/juridisch/privacy/', '/juridisch/toegankelijkheid/',
  '/en/', '/en/about/', '/en/home-nursing/', '/en/podiatry/', '/en/fees/', '/en/contact/', '/en/legal/privacy/', '/en/legal/accessibility/', '/404.html'];

const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new',
  args: ['--no-sandbox', '--hide-scrollbars', '--force-color-profile=srgb'],
});
let problems = 0;
for (const r of ROUTES.filter(r => !filter || r.includes(filter) || (filter === 'home' && r === '/'))) {
  for (const w of widths) {
    const page = await browser.newPage();
    const errs = [];
    page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') errs.push(m.text().slice(0, 160)); });
    page.on('pageerror', e => errs.push('pageerror ' + String(e).slice(0, 160)));
    page.on('requestfailed', q => errs.push('failed ' + q.url()));
    await page.setViewport({ width: w, height: w < 600 ? 844 : 900, deviceScaleFactor: 1 });
    if (opt('nojs')) await page.setJavaScriptEnabled(false);
    if (opt('rm')) await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
    if (opt('ts') || opt('hc')) {
      await page.evaluateOnNewDocument((ts, hc) => {
        try { if (ts) localStorage.setItem('lc-ts', ts); if (hc) localStorage.setItem('lc-hc', '1'); } catch (e) {}
      }, opt('ts') || null, !!opt('hc'));
    }
    const res = await page.goto(BASE + r, { waitUntil: 'networkidle0' });
    await page.evaluateHandle('document.fonts.ready');
    if (!opt('nojs')) {
      await page.evaluate(async () => {
        const h = document.documentElement.scrollHeight;
        for (let y = 0; y <= h; y += 300) { scrollTo(0, y); await new Promise(r => setTimeout(r, 60)); }
        scrollTo(0, h); await new Promise(r => setTimeout(r, 1800));
        scrollTo(0, 0); await new Promise(r => setTimeout(r, 300));
      });
    }
    const facts = await page.evaluate(() => {
      const de = document.documentElement;
      const over = [...document.querySelectorAll('body *')].filter(el => { const b = el.getBoundingClientRect(); return b.right > de.clientWidth + 1 && b.width > 0 && getComputedStyle(el).position !== 'fixed'; })
        .slice(0, 4).map(el => el.tagName.toLowerCase() + '.' + [...el.classList].join('.') + ' ' + Math.round(el.getBoundingClientRect().right));
      const p = document.querySelector('.thread path');
      let thread = null;
      if (p && p.getAttribute('d')) { const st = window.__lcThread || { shown: 1, total: 1 }; thread = { len: Math.round(p.getTotalLength()), drawn: +(st.shown / st.total).toFixed(2) }; }
      return { sw: de.scrollWidth, cw: de.clientWidth, h: de.scrollHeight, over, thread, fs: getComputedStyle(de).fontSize };
    });
    const name = `${(r === '/' ? 'home' : r.replace(/^\/|\/$/g, '').replace(/[\/.]/g, '-'))}-${w}${opt('ts') ? '-ts' + opt('ts') : ''}${opt('hc') ? '-hc' : ''}${opt('rm') ? '-rm' : ''}${opt('nojs') ? '-nojs' : ''}.png`;
    await page.screenshot({ path: path.join(OUT, name), fullPage: true });
    const bad = facts.sw > facts.cw || errs.length || (res.status() !== 200 && r !== '/404.html');
    if (bad) problems++;
    console.log(`${bad ? 'FAIL' : 'ok  '} ${String(res.status())} ${r.padEnd(32)} ${String(w).padStart(4)}  h=${facts.h} root=${facts.fs} overflow=${facts.sw - facts.cw}${facts.over.length ? ' ' + facts.over.join(', ') : ''}  thread=${facts.thread ? facts.thread.len + 'px drawn ' + facts.thread.drawn : 'none'}${errs.length ? '\n      ' + errs.join('\n      ') : ''}`);
    await page.close();
  }
}
await browser.close();
process.exitCode = problems ? 1 : 0;
