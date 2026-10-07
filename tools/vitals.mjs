/* Real Core Web Vitals under Lighthouse-equivalent mobile throttling:
   1.6 Mbps down, 750 Kbps up, 150ms RTT, 4x CPU. Reports LCP, CLS and the
   worst long task, plus the 95th-percentile frame time during a scripted
   scroll. Measured, not simulated. */
import puppeteer from 'puppeteer-core';

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const BASE = process.env.LC_URL || 'http://localhost:4221/laila-care';
const ROUTES = (process.env.LC_ROUTES || '/,/thuisverpleging/,/podologie/,/contact/').split(',');
const RUNS = Number(process.env.LC_RUNS || 3);

const browser = await puppeteer.launch({
  executablePath: CHROME, headless: 'new',
  args: ['--no-sandbox', '--hide-scrollbars'],
});

async function once(URL) {
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const cdp = await page.createCDPSession();
  await cdp.send('Network.enable');
  await cdp.send('Network.emulateNetworkConditions', {
    offline: false, downloadThroughput: 1.6 * 1024 * 1024 / 8,
    uploadThroughput: 750 * 1024 / 8, latency: 150,
  });
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });

  await page.evaluateOnNewDocument(() => {
    window.__v = { lcp: 0, cls: 0, longest: 0, frames: [] };
    new PerformanceObserver(l => { for (const e of l.getEntries()) window.__v.lcp = e.startTime; })
      .observe({ type: 'largest-contentful-paint', buffered: true });
    new PerformanceObserver(l => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__v.cls += e.value; })
      .observe({ type: 'layout-shift', buffered: true });
    new PerformanceObserver(l => { for (const e of l.getEntries()) window.__v.longest = Math.max(window.__v.longest, e.duration); })
      .observe({ type: 'longtask', buffered: true });
  });

  await page.goto(URL, { waitUntil: 'load' });
  await new Promise(r => setTimeout(r, 4000));
  const load = await page.evaluate(() => ({ ...window.__v, frames: undefined }));

  /* frame cost while scrolling the whole page, still at 4x CPU throttle */
  const frames = await page.evaluate(async () => {
    const times = [];
    let last = performance.now();
    let raf = true;
    const tick = () => { const n = performance.now(); times.push(n - last); last = n; if (raf) requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
    const h = document.documentElement.scrollHeight;
    for (let y = 0; y < h; y += 90) { window.scrollTo(0, y); await new Promise(r => requestAnimationFrame(r)); }
    raf = false;
    times.sort((a, b) => a - b);
    return { p50: times[Math.floor(times.length * 0.5)], p95: times[Math.floor(times.length * 0.95)], n: times.length };
  });

  const cls = await page.evaluate(() => window.__v.cls);
  await page.close();
  return { lcp: load.lcp, cls, longest: load.longest, ...frames };
}

let failed = 0;
for (const r of ROUTES) {
  const runs = [];
  for (let i = 0; i < RUNS; i++) runs.push(await once(BASE + r));
  const med = k => { const v = runs.map(x => x[k]).sort((a, b) => a - b); return v[Math.floor(v.length / 2)]; };
  const f = (n, d = 0) => Number(n).toFixed(d);
  const g = [['LCP', med('lcp'), 1800, 'ms'], ['CLS', med('cls'), 0.05, ''], ['longest task', med('longest'), 200, 'ms'], ['frame p95', med('p95'), 16.7, 'ms']];
  console.log(`${r}  (median of ${RUNS}, 390x844, 1.6 Mbps / 150ms RTT / 4x CPU)`);
  for (const [k, v, gate, u] of g) { const pass = v < gate; if (!pass) failed++; console.log(`  ${k.padEnd(14)} ${f(v, k === 'CLS' ? 4 : 1).padStart(8)} ${u.padEnd(3)} gate < ${gate}  ${pass ? 'PASS' : 'FAIL'}`); }
}
await browser.close();
process.exitCode = failed ? 1 : 0;
