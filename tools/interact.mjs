/**
 * Behaviour tests in a real browser (brief §15 mandatory checks 3, 4, 6, 8).
 *   node tools/interact.mjs
 */
import puppeteer from 'puppeteer-core';

const BASE = process.env.LC_URL || 'http://localhost:4221/laila-care';
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new' });
const fails = [];
const check = (cond, msg) => { console.log(`  ${cond ? 'ok  ' : 'FAIL'}  ${msg}`); if (!cond) fails.push(msg); };
const sleep = ms => new Promise(r => setTimeout(r, ms));
const rootPx = p => p.evaluate(() => parseFloat(getComputedStyle(document.documentElement).fontSize));
const inkOf = p => p.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--ink').trim());

/* 1. JavaScript off: text size, contrast and menu still work (§11, check 4 + 8) */
{
  const p = await browser.newPage();
  await p.setJavaScriptEnabled(false);
  await p.setViewport({ width: 390, height: 844 });
  await p.goto(BASE + '/', { waitUntil: 'networkidle0' });
  check(await rootPx(p) === 16, 'no-JS: default root 16px');
  await p.click('label.ctl__opt:nth-of-type(3)');
  check(await rootPx(p) === 22.4, `no-JS: largest text control sets root to 22.4px (got ${await rootPx(p)})`);
  await p.click('label.toggle');
  check((await inkOf(p)).toUpperCase() === '#0E1F35', `no-JS: contrast toggle switches ink to #0E1F35 (got ${await inkOf(p)})`);
  await p.click('.menu summary');
  check(await p.evaluate(() => document.querySelector('.menu').open && getComputedStyle(document.querySelector('.menu__panel')).display !== 'none'), 'no-JS: menu opens (native <details>)');
  const txt = await p.evaluate(() => document.body.innerText);
  check(txt.includes('0499 43 06 54') && txt.includes('Hogebrug 26'), 'no-JS: phone and address readable');
  check(await p.evaluate(() => [...document.querySelectorAll('[data-settle]')].every(e => getComputedStyle(e).opacity === '1')), 'no-JS: nothing hidden by reveal styles');
  await p.close();
}

/* 2. JavaScript on: choices persist across pages and paint before first frame */
{
  const p = await browser.newPage();
  await p.setViewport({ width: 1440, height: 900 });
  await p.goto(BASE + '/', { waitUntil: 'networkidle0' });
  await p.click('label.ctl__opt:nth-of-type(2)');
  await p.click('label.toggle');
  await p.goto(BASE + '/podologie/', { waitUntil: 'domcontentloaded' });
  const st = await p.evaluate(() => ({ ts: document.documentElement.dataset.ts, hc: document.documentElement.dataset.hc, r2: document.getElementById('ts-2').checked, hcb: document.getElementById('hc').checked }));
  check(st.ts === '2' && st.hc === '1' && st.r2 && st.hcb, `JS: text size 2 and contrast persist to the next page and the controls show it (${JSON.stringify(st)})`);
  check(await rootPx(p) === 19.2, `JS: root 19.2px on the next page (got ${await rootPx(p)})`);
  await p.click('label.ctl__opt:nth-of-type(1)'); await p.click('label.toggle');
  await p.goto(BASE + '/', { waitUntil: 'domcontentloaded' });
  check(await rootPx(p) === 16 && !(await p.evaluate(() => document.documentElement.dataset.hc === '1')), 'JS: resetting returns to normal on the next page');
  await p.close();
}

/* 3. Keyboard: skip link first, focus visible, reach the phone and a service page */
{
  const p = await browser.newPage();
  await p.setViewport({ width: 1440, height: 900 });
  await p.goto(BASE + '/', { waitUntil: 'networkidle0' });
  await p.keyboard.press('Tab');
  const first = await p.evaluate(() => ({ cls: document.activeElement.className, vis: document.activeElement.getBoundingClientRect().top >= 0 }));
  check(first.cls === 'skip' && first.vis, 'keyboard: first Tab lands on the visible skip link');
  await p.keyboard.press('Enter');
  check(await p.evaluate(() => document.activeElement.id === 'main'), 'keyboard: skip link moves focus to <main>');
  const order = [];
  await p.goto(BASE + '/', { waitUntil: 'networkidle0' });
  for (let i = 0; i < 16; i++) {
    await p.keyboard.press('Tab');
    order.push(await p.evaluate(() => {
      const a = document.activeElement; const cs = getComputedStyle(a);
      const ring = cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) >= 2;
      const viaSibling = a.matches('input') && a.nextElementSibling && getComputedStyle(a.nextElementSibling).outlineStyle !== 'none';
      return { t: (a.textContent || a.id || a.tagName).trim().slice(0, 24), ring: ring || viaSibling, href: a.getAttribute('href') };
    }));
  }
  check(order.every(o => o.ring), `keyboard: focus ring on all of the first 16 stops (${order.filter(o => !o.ring).map(o => o.t).join(', ') || 'all visible'})`);
  check(order.some(o => (o.href || '').startsWith('tel:')), `keyboard: the phone link is within the first 16 Tab stops (${order.findIndex(o => (o.href || '').startsWith('tel:')) + 1})`);
  await p.close();
}

/* 4. Reduced motion: line fully drawn at load, nothing hidden, nothing animating (check 6) */
{
  const p = await browser.newPage();
  await p.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  await p.setViewport({ width: 1440, height: 900 });
  await p.goto(BASE + '/', { waitUntil: 'networkidle0' });
  await sleep(500);
  const s = await p.evaluate(() => {
    const path = document.querySelector('.thread path');
    return { off: getComputedStyle(document.querySelector('.thread')).clipPath, len: path.getTotalLength(), pending: document.querySelectorAll('.is-pending').length, motion: document.documentElement.classList.contains('motion') };
  });
  check(s.len > 500 && s.off === 'none' && s.pending === 0, `reduced motion: line fully drawn at load (${Math.round(s.len)}px, clip ${s.off}), no hidden content`);
  await p.close();
}

/* 5. Motion on: line draws forward with scroll, settle content ends visible */
{
  const p = await browser.newPage();
  await p.setViewport({ width: 1440, height: 900 });
  await p.goto(BASE + '/', { waitUntil: 'networkidle0' });
  await sleep(1200);
  const frac = () => p.evaluate(() => window.__lcThread.shown / window.__lcThread.total);
  const top = await frac();
  await p.evaluate(() => scrollTo(0, document.documentElement.scrollHeight)); await sleep(2500);
  const bottom = await frac();
  check(top > 0 && top < 0.6 && bottom > 0.98, `motion: line partly drawn at top (${top.toFixed(2)}), complete at the bottom (${bottom.toFixed(2)})`);
  check(await p.evaluate(() => document.querySelectorAll('.is-pending').length === 0), 'motion: every settle element is visible after scrolling');
  await p.close();
}

/* 6. Map: no request to OpenStreetMap until the visitor asks for it */
{
  const p = await browser.newPage();
  const osm = [];
  p.on('request', r => { if (/openstreetmap/.test(r.url())) osm.push(r.url()); });
  await p.setViewport({ width: 1440, height: 900 });
  await p.goto(BASE + '/contact/', { waitUntil: 'networkidle0' });
  check(osm.length === 0, 'map: zero requests to openstreetmap.org on page load');
  await p.click('.map__btn'); await sleep(2500);
  check(osm.length > 0 && await p.evaluate(() => !!document.querySelector('.map iframe[title]')), `map: loads after the click (${osm.length} requests), iframe has a title`);
  await p.close();
}

/* 7. Third parties: nothing but the site's own origin on every page load */
{
  const p = await browser.newPage();
  const ext = new Set();
  p.on('request', r => { const u = new URL(r.url()); if (u.hostname !== 'localhost' && !u.protocol.startsWith('data')) ext.add(u.hostname); });
  for (const r of ['/', '/thuisverpleging/', '/podologie/', '/tarieven/', '/contact/', '/en/']) await p.goto(BASE + r, { waitUntil: 'networkidle0' });
  check(ext.size === 0, `privacy: no third-party requests on 6 routes (${[...ext].join(', ') || 'none'})`);
  await p.close();
}

await browser.close();
console.log(fails.length ? `\n${fails.length} behaviour check(s) failed.` : '\nall behaviour checks pass.');
process.exitCode = fails.length ? 1 : 0;
