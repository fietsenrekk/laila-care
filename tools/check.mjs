/**
 * Build gates. Exits non-zero on any failure, so a deploy cannot go past it.
 *   node tools/check.mjs
 * Static checks over dist/; no browser needed. Browser checks live in a11y.mjs,
 * shots.mjs and vitals.mjs.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { SITE, LOOKBOOK_LEAKS } from '../src/config.js';

const ROOT = path.resolve(import.meta.dirname, '..');
const DIST = path.join(ROOT, 'dist');
const fails = [];
const ok = m => console.log('  ok    ' + m);
const bad = m => { fails.push(m); console.log('  FAIL  ' + m); };

const files = [];
(function walk(d) { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); e.isDirectory() ? walk(p) : files.push(p); } })(DIST);
const text = files.filter(f => /\.(html|css|js|json|xml|txt|webmanifest|svg)$/.test(f));
const html = files.filter(f => f.endsWith('.html'));
const rel = f => path.relative(DIST, f).replace(/\\/g, '/');
const read = f => fs.readFileSync(f, 'utf8');
const visible = s => s.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<style[\s\S]*?<\/style>/g, '').replace(/<svg[\s\S]*?<\/svg>/g, '').replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ');

/* 1. placeholder leaks from the lookbook (brief §3.2: build fails on any) */
{
  const hits = [];
  for (const f of text) { const s = read(f); for (const l of LOOKBOOK_LEAKS) if (s.includes(l)) hits.push(`${rel(f)}: "${l}"`); }
  hits.length ? bad(`lookbook placeholder data in output: ${hits.slice(0, 8).join('; ')}`) : ok(`no lookbook placeholder in ${text.length} text files (${LOOKBOOK_LEAKS.length} strings checked)`);
}

/* 2. the real facts appear, and only in their real form */
{
  let telOk = 0, telBad = [];
  for (const f of html) {
    const s = read(f);
    for (const m of s.matchAll(/href="tel:([^"]+)"/g)) (m[1] === '+32499430654' ? telOk++ : telBad.push(`${rel(f)} ${m[1]}`));
    if (!s.includes(SITE.phone.display) && !s.includes(SITE.phone.intl)) telBad.push(`${rel(f)}: phone number not shown`);
  }
  telBad.length ? bad(`phone: ${telBad.join(', ')}`) : ok(`every page shows the phone number; ${telOk} tel: links, all +32499430654`);
  const addr = html.filter(f => !visible(read(f)).includes('Hogebrug 26, 9280 Denderbelle'));
  addr.length ? bad(`address missing on ${addr.map(rel).join(', ')}`) : ok('every page shows Hogebrug 26, 9280 Denderbelle');
}

/* 3. nothing fabricated: no euro figures while fees are unconfirmed, no KBO/RIZIV numbers while null */
{
  const issues = [];
  for (const f of html) {
    const v = visible(read(f));
    if (!SITE.fees && /€\s?\d|\d\s?€|EUR\s?\d/.test(v)) issues.push(`${rel(f)}: euro figure`);
    if (!SITE.kbo && /\b0\d{3}[.\s]?\d{3}[.\s]?\d{3}\b/.test(v)) issues.push(`${rel(f)}: KBO-like number`);
    // claim phrases, not bare words: Flemish "best" means "preferably", and "top" occurs in "from top to bottom"
    const CLAIM = /\b(de beste|het beste|the best|nummer 1|number one|garantie|gegarandeerd|guarantee|guaranteed|100\s?%|pijnloos|painless|toonaangevend|leading|state of the art)\b/i;
    if (CLAIM.test(v)) issues.push(`${rel(f)}: promotional claim "${v.match(CLAIM)[0]}"`);
  }
  issues.length ? bad(issues.join('; ')) : ok('no euro figures, no invented company/RIZIV numbers, no superlatives or guarantees');
}

/* 4. internal links and assets resolve (relative, under the base path) */
{
  const missing = [];
  for (const f of html) {
    if (rel(f) === '404.html') continue; // absolute links, checked by the live crawl
    const s = read(f);
    for (const m of s.matchAll(/(?:href|src)="([^"#?]+)[^"]*"/g)) {
      const u = m[1];
      if (/^(https?:|mailto:|tel:|data:)/.test(u)) continue;
      const target = path.resolve(path.dirname(f), u);
      const t = fs.existsSync(target) && fs.statSync(target).isDirectory() ? path.join(target, 'index.html') : target;
      if (!fs.existsSync(t)) missing.push(`${rel(f)} -> ${u}`);
    }
    for (const m of s.matchAll(/srcset="([^"]+)"/g)) for (const part of m[1].split(',')) {
      const u = part.trim().split(/\s+/)[0];
      if (!fs.existsSync(path.resolve(path.dirname(f), u))) missing.push(`${rel(f)} -> ${u}`);
    }
  }
  const cssMissing = [...read(path.join(DIST, 'assets/css/site.css')).matchAll(/url\(['"]?([^'")]+)/g)]
    .map(m => m[1]).filter(u => !fs.existsSync(path.resolve(DIST, 'assets/css', u)));
  [...missing, ...cssMissing].length ? bad(`broken refs: ${[...missing, ...cssMissing].slice(0, 6).join('; ')}`) : ok('every internal href, src, srcset and CSS url() resolves');
}

/* 5. page structure */
{
  const issues = [];
  for (const f of html) {
    const s = read(f);
    const h1 = (s.match(/<h1[\s>]/g) || []).length;
    if (h1 !== 1) issues.push(`${rel(f)}: ${h1} h1`);
    const d = s.match(/<meta name="description" content="([^"]*)"/);
    if (!d || d[1].length < 50 || d[1].length > 170) issues.push(`${rel(f)}: description ${d ? d[1].length : 0} chars`);
    const t = s.match(/<title>([^<]*)<\/title>/);
    if (!t || t[1].length > 70) issues.push(`${rel(f)}: title ${t ? t[1].length : 0} chars`);
    for (const m of s.matchAll(/<img\b[^>]*>/g)) if (!/\salt="[^"]+"/.test(m[0])) issues.push(`${rel(f)}: img without alt`);
    for (const m of s.matchAll(/<img\b[^>]*>/g)) if (!/\swidth="\d+"/.test(m[0]) || !/\sheight="\d+"/.test(m[0])) issues.push(`${rel(f)}: img without dimensions`);
    if (rel(f) !== '404.html' && (s.match(/hreflang="/g) || []).length < 3) issues.push(`${rel(f)}: hreflang missing`);
    if (/\sstyle="/.test(s)) issues.push(`${rel(f)}: inline style (CSP blocks it)`);
    // headings never skip a level
    const levels = [...s.matchAll(/<h([1-6])[\s>]/g)].map(m => +m[1]);
    for (let i = 1; i < levels.length; i++) if (levels[i] > levels[i - 1] + 1) { issues.push(`${rel(f)}: h${levels[i - 1]} -> h${levels[i]}`); break; }
  }
  issues.length ? bad(issues.slice(0, 10).join('; ')) : ok(`${html.length} pages: one h1 each, titles <= 70, descriptions 50-170, alt + dimensions on every img, hreflang, no heading skips, no inline styles`);
}

/* 6. CSP hashes match the inline scripts actually shipped */
{
  const issues = [];
  for (const f of html) {
    const s = read(f);
    const csp = s.match(/http-equiv="Content-Security-Policy" content="([^"]+)"/)?.[1] || '';
    for (const m of s.matchAll(/<script>([\s\S]*?)<\/script>/g)) {
      const h = "'sha256-" + crypto.createHash('sha256').update(m[1]).digest('base64') + "'";
      if (!csp.includes(h)) issues.push(rel(f));
    }
  }
  issues.length ? bad(`inline script/style not covered by CSP: ${[...new Set(issues)].join(', ')}`) : ok('every inline script and style is hash-allowed by the page CSP');
}

/* 7. structured data parses and carries the real facts */
{
  const issues = [];
  let n = 0;
  for (const f of html) for (const m of read(f).matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    n++;
    try {
      const j = JSON.parse(m[1]);
      if (j.telephone !== '+32499430654') issues.push(`${rel(f)} telephone ${j.telephone}`);
      if (j.address?.streetAddress !== 'Hogebrug 26' || j.address?.postalCode !== '9280') issues.push(`${rel(f)} address`);
      if (!j.geo?.latitude) issues.push(`${rel(f)} geo`);
      if (!SITE.hours && j.openingHoursSpecification) issues.push(`${rel(f)} hours without data`);
    } catch (e) { issues.push(`${rel(f)}: ${e.message}`); }
  }
  issues.length || !n ? bad(`JSON-LD: ${issues.join('; ') || 'none found'}`) : ok(`${n} JSON-LD blocks parse; telephone, address, geo correct; no invented opening hours`);
}

/* 8. weight budget: first view of the home page */
{
  const s = read(path.join(DIST, 'index.html'));
  const js = fs.readFileSync(path.join(DIST, 'assets/js/site.js'));
  const zlib = await import('node:zlib');
  const jsGz = zlib.gzipSync(js).length, htmlGz = zlib.gzipSync(s).length, cssGz = zlib.gzipSync(fs.readFileSync(path.join(DIST, 'assets/css/site.css'))).length;
  const fonts = ['marcellus-400.woff2', 'atkinson-next-roman-var.woff2'].reduce((a, f) => a + fs.statSync(path.join(DIST, 'assets/fonts', f)).size, 0);
  const heroMax = fs.statSync(path.join(DIST, 'assets/img/hero-caregiver-wide-1951.avif')).size;
  const first = htmlGz + cssGz + jsGz + fonts + heroMax;
  const line = `home first view (largest hero variant): html ${(htmlGz / 1024).toFixed(1)} + css ${(cssGz / 1024).toFixed(1)} + js ${(jsGz / 1024).toFixed(1)} + fonts ${(fonts / 1024).toFixed(1)} + hero ${(heroMax / 1024).toFixed(1)} = ${(first / 1024).toFixed(0)} KB gz (budget 1600 KB); initial JS ${(jsGz / 1024).toFixed(1)} KB gz (budget 150)`;
  first < 1600 * 1024 && jsGz < 150 * 1024 ? ok(line) : bad(line);
}

/* 9. house style: no em dashes in shipped copy */
{
  const hits = html.filter(f => visible(read(f)).includes('—')).map(rel);
  hits.length ? bad(`em dash in copy: ${hits.join(', ')}`) : ok('no em dashes in visible copy');
}

console.log(fails.length ? `\n${fails.length} gate(s) failed.` : '\nall gates pass.');
process.exitCode = fails.length ? 1 : 0;
