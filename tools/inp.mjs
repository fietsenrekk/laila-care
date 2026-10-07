/* Interaction latency (the INP gate, brief §3.2 < 200ms), measured with the Event
   Timing API on real clicks at 4x CPU, phone viewport. Heaviest interactions on the site:
   text size (reflows every page element and rebuilds the line), contrast, menu, FAQ. */
import puppeteer from 'puppeteer-core';
const BASE = process.env.LC_URL || 'http://localhost:4221/laila-care';
const b = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new' });
const sleep = ms => new Promise(r => setTimeout(r, ms));
const results = [];
async function measure(route, label, sel, w = 390) {
  const p = await b.newPage();
  await p.setViewport({ width: w, height: 844, isMobile: w < 600, hasTouch: w < 600 });
  await p.evaluateOnNewDocument(() => {
    try { localStorage.clear(); } catch (e) {}
    window.__ev = [];
    new PerformanceObserver(l => { for (const e of l.getEntries()) if (e.interactionId) window.__ev.push(e.duration); })
      .observe({ type: 'event', durationThreshold: 16, buffered: true });
  });
  await p.goto(BASE + route, { waitUntil: 'networkidle0' });
  await sleep(800);
  const c = await p.createCDPSession(); await c.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  await p.click(sel); await sleep(1500);
  const d = await p.evaluate(() => Math.max(0, ...window.__ev));
  results.push(d);
  console.log(`  ${d < 200 ? 'ok  ' : 'FAIL'}  ${String(Math.round(d)).padStart(4)} ms  ${label} (${route})`);
  await p.close();
}
await measure('/', 'text size -> largest', 'label.ctl__opt:nth-of-type(3)');
await measure('/', 'contrast on', 'label.toggle');
await measure('/', 'open menu', '.menu summary');
await measure('/thuisverpleging/', 'open FAQ item', '.faq summary');
await measure('/tarieven/', 'text size -> larger', 'label.ctl__opt:nth-of-type(2)');
await measure('/', 'text size -> largest (desktop)', 'label.ctl__opt:nth-of-type(3)', 1440);
await b.close();
const worst = Math.max(...results);
console.log(`worst interaction ${Math.round(worst)} ms (gate < 200)`);
process.exitCode = worst < 200 ? 0 : 1;
