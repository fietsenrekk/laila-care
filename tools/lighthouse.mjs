/**
 * Lighthouse (mobile, default simulated throttling) on key routes.
 *   node tools/lighthouse.mjs [baseUrl]
 * Gates (brief §3.2): Performance >= 96, Accessibility 100, Best Practices 100, SEO 100.
 * Writes JSON reports to docs/lighthouse/.
 */
import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const BASE = process.argv[2] || process.env.LC_URL || 'http://localhost:4221/laila-care';
const ROUTES = (process.env.LC_ROUTES || '/,/thuisverpleging/,/podologie/,/tarieven/,/contact/,/en/').split(',');
const OUT = path.join(ROOT, 'docs/lighthouse');
fs.mkdirSync(OUT, { recursive: true });
const GATES = { performance: 96, accessibility: 100, 'best-practices': 100, seo: 100 };

const chrome = await chromeLauncher.launch({ chromePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', chromeFlags: ['--headless=new', '--no-sandbox'] });
let failed = 0;
const rows = [];
for (const r of ROUTES) {
  const res = await lighthouse(BASE + r, { port: chrome.port, output: 'json', logLevel: 'error', formFactor: 'mobile', onlyCategories: Object.keys(GATES) });
  const lhr = res.lhr;
  const sc = Object.fromEntries(Object.keys(GATES).map(k => [k, Math.round(lhr.categories[k].score * 100)]));
  const a = lhr.audits;
  const nv = id => a[id]?.numericValue ?? NaN;
  if (lhr.runtimeError) console.log('   runtime error:', lhr.runtimeError.code);
  const m = { LCP: nv('largest-contentful-paint'), TBT: nv('total-blocking-time'), CLS: nv('cumulative-layout-shift'), FCP: nv('first-contentful-paint'), SI: nv('speed-index') };
  const bad = Object.entries(GATES).filter(([k, g]) => sc[k] < g).map(([k]) => k);
  if (bad.length) failed++;
  rows.push({ r, ...sc, ...m });
  console.log(`${bad.length ? 'FAIL' : 'ok  '} ${r.padEnd(20)} perf ${sc.performance}  a11y ${sc.accessibility}  bp ${sc['best-practices']}  seo ${sc.seo}   LCP ${(m.LCP / 1000).toFixed(2)}s  TBT ${m.TBT.toFixed(0)}ms  CLS ${m.CLS.toFixed(3)}  FCP ${(m.FCP / 1000).toFixed(2)}s`);
  if (bad.length) for (const [id, au] of Object.entries(a)) if (au.score !== null && au.score < 0.9 && au.scoreDisplayMode !== 'informative' && au.scoreDisplayMode !== 'notApplicable' && au.scoreDisplayMode !== 'manual') console.log(`        ${id}: ${au.title} ${au.displayValue || ''}`);
  fs.writeFileSync(path.join(OUT, `${(r === '/' ? 'home' : r.replace(/\//g, '-').replace(/^-|-$/g, ''))}${/localhost/.test(BASE) ? '-local' : '-live'}.json`), JSON.stringify({ url: BASE + r, scores: sc, metrics: m, fetchTime: lhr.fetchTime }, null, 1));
}
await chrome.kill();
process.exitCode = failed ? 1 : 0;
