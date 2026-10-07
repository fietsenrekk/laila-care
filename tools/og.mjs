/**
 * Open Graph images, 1200x630, one per page per language, rendered in Chrome
 * from the real brand assets and the page's own heading. -> assets/og/{key}-{lang}.jpg
 */
import puppeteer from 'puppeteer-core';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { execFileSync } from 'node:child_process';
import BRAND from '../src/brand.js';
import { SITE } from '../src/config.js';
import * as NL from '../src/content/nl.js';
import * as EN from '../src/content/en.js';

const ROOT = path.resolve(import.meta.dirname, '..');
const OUT = path.join(ROOT, 'assets/og');
fs.mkdirSync(OUT, { recursive: true });
const f = p => pathToFileURL(path.join(ROOT, p)).href;
const PHOTO = { home: 'hero-caregiver-wide-1200', nursing: 'interior-wide-1200', podiatry: 'podologie-closeup-wide-1200' };
const use = (id, [w, h], cls) => `<svg class="${cls}" viewBox="0 0 ${w} ${h}"><use href="#${id}" width="${w}" height="${h}"/></svg>`;

const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--allow-file-access-from-files'] });
const page = await browser.newPage();
await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 1 });
for (const [lang, L] of [['nl', NL], ['en', EN]]) {
  for (const key of ['home', 'about', 'nursing', 'podiatry', 'fees', 'contact', 'privacy', 'a11y']) {
    const P = L.PAGES[key];
    const title = key === 'home' ? SITE.tagline[lang] : P.h1;
    const eyebrow = key === 'home' ? P.hero.eyebrow : (P.eyebrow || 'Laila Care');
    const photo = PHOTO[key];
    const html = `<!doctype html><html><head><style>
@font-face{font-family:M;src:url('${f('assets/fonts/marcellus-400.woff2')}')}
@font-face{font-family:A;src:url('${f('assets/fonts/atkinson-next-roman-var.woff2')}');font-weight:200 800}
*{margin:0;box-sizing:border-box} body{width:1200px;height:630px;background:#fff;font-family:A;color:#1E3A5F;position:relative;overflow:hidden}
.lc-b{fill:#1E3A5F}.lc-g{fill:#D4AF37}
.txt{position:absolute;left:72px;top:64px;width:${photo ? 560 : 900}px}
.logo{height:54px;width:auto;display:block;margin-bottom:56px}
.eb{font:700 17px/1.3 A;letter-spacing:.14em;text-transform:uppercase;color:#405877;margin-bottom:18px}
h1{font:400 ${title.length > 22 ? 64 : 76}px/1.05 M;color:#1E3A5F;margin-bottom:22px}
.sw{width:330px;height:auto;display:block}
.tel{position:absolute;left:72px;bottom:58px;font:700 30px/1 A;color:#1E3A5F}
.tel span{font-weight:400;color:#405877;font-size:22px;margin-left:14px}
.ph{position:absolute;right:0;top:0;width:520px;height:630px;object-fit:cover;object-position:${key === 'home' ? '74% 30%' : key === 'nursing' ? '82% 50%' : '70% 50%'}}
.cap{position:absolute;right:12px;bottom:10px;font:12px A;background:rgba(255,255,255,.9);padding:3px 7px;border-radius:2px}
.foot{position:absolute;right:90px;bottom:90px;width:150px;height:auto}
</style></head><body>
<svg width="0" height="0" style="position:absolute">${BRAND.sprite}</svg>
<div class="txt">${use('lc-horiz', BRAND.horiz, 'logo')}<p class="eb">${eyebrow}</p><h1>${title}</h1>${use('lc-swoosh', BRAND.swoosh, 'sw')}</div>
<p class="tel">${lang === 'en' ? SITE.phone.intl : SITE.phone.display}<span>${SITE.address.street}, ${SITE.address.postalCode} ${SITE.address.locality}</span></p>
${photo ? `<img class="ph" src="${f(`assets/img/${photo}.jpg`)}"><span class="cap">${SITE.imageCaption[lang]}</span>` : use('lc-foot', BRAND.foot, 'foot')}
</body></html>`;
    const tmp = path.join(ROOT, 'tools/tmp/og.html');
    fs.writeFileSync(tmp, html);
    await page.goto(pathToFileURL(tmp).href, { waitUntil: 'networkidle0' });
    await page.evaluateHandle('document.fonts.ready');
    const png = path.join(ROOT, 'tools/tmp/og.png');
    await page.screenshot({ path: png });
    execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', png, '-q:v', '3', '-map_metadata', '-1', path.join(OUT, `${key}-${lang}.jpg`)]);
  }
}
await browser.close();
console.log('og images:', fs.readdirSync(OUT).length);
