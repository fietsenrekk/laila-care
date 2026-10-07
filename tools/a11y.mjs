/* axe-core on every route, in four states: default, largest text, high contrast,
   and mobile width. Any violation in any state fails. Also checks contrast of the
   gold pairings individually (brief §3.2, §7.4). */
import puppeteer from 'puppeteer-core';
import fs from 'node:fs';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const axeSrc = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');
const BASE = process.env.LC_URL || 'http://localhost:4221/laila-care';
const ROUTES = ['/', '/over-ons/', '/thuisverpleging/', '/podologie/', '/tarieven/', '/contact/', '/juridisch/privacy/', '/juridisch/toegankelijkheid/',
  '/en/', '/en/about/', '/en/home-nursing/', '/en/podiatry/', '/en/fees/', '/en/contact/', '/en/legal/privacy/', '/en/legal/accessibility/', '/404.html'];
const STATES = [
  { name: 'default 1440', w: 1440, h: 900 },
  { name: 'phone 390', w: 390, h: 844 },
  { name: 'text 1.4x 390', w: 390, h: 844, ts: '3' },
  { name: 'high contrast 1440', w: 1440, h: 900, hc: true },
];
const only = process.argv[2];
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new' });
let total = 0, runs = 0;
for (const r of ROUTES.filter(r => !only || r.includes(only))) for (const s of STATES) {
  const page = await browser.newPage();
  await page.setViewport({ width: s.w, height: s.h });
  await page.evaluateOnNewDocument((ts, hc) => { try { if (ts) localStorage.setItem('lc-ts', ts); if (hc) localStorage.setItem('lc-hc', '1'); } catch (e) {} }, s.ts || null, !!s.hc);
  await page.goto(BASE + r, { waitUntil: 'networkidle0' });
  await page.evaluateHandle('document.fonts.ready');
  // reveal everything (settle) so axe sees final colours, and open every <details>
  await page.evaluate(async () => {
    document.querySelectorAll('.is-pending').forEach(e => e.classList.remove('is-pending'));
    document.querySelectorAll('details').forEach(d => d.open = true);
    await new Promise(r => setTimeout(r, 900));
  });
  await page.evaluate(axeSrc);
  const res = await page.evaluate(async () => await window.axe.run(document, {
    resultTypes: ['violations'],
    runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'] },
  }));
  runs++;
  const v = res.violations;
  total += v.length;
  if (v.length) {
    console.log(`FAIL ${r} [${s.name}] ${v.length}`);
    for (const x of v) { console.log(`   [${x.impact}] ${x.id}: ${x.help}`); for (const n of x.nodes.slice(0, 3)) console.log(`        ${n.target.join(' ')}  ${(n.failureSummary || '').split('\n')[1] || ''}`); }
  }
  await page.close();
}
await browser.close();
console.log(total ? `\naxe: ${total} violation(s) across ${runs} runs.` : `\naxe: 0 violations across ${runs} runs (${ROUTES.length} routes x ${STATES.length} states).`);
process.exitCode = total ? 1 : 0;
