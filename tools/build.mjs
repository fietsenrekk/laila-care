/**
 * Static build. src/ -> dist/. No dependencies.
 *
 *   node tools/build.mjs            BASE_PATH defaults to /laila-care (GitHub Pages)
 *   BASE_PATH=/ node tools/build.mjs  for a root deploy (e.g. lailacare.be)
 *
 * Every internal link is relative, so the same output works under any base path,
 * except 404.html, which GitHub Pages serves at arbitrary depths and therefore
 * uses absolute links built from BASE_PATH.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { SITE } from '../src/config.js';
import BRAND from '../src/brand.js';
import * as NL from '../src/content/nl.js';
import * as EN from '../src/content/en.js';

const ROOT = path.resolve(import.meta.dirname, '..');
const DIST = path.join(ROOT, 'dist');
const BASE = (process.env.BASE_PATH ?? SITE.basePath).replace(/\/$/, '');
const ORIGIN = SITE.origin;
const LANGS = { nl: NL, en: EN };
const VERSION = Date.now().toString(36);

fs.rmSync(DIST, { recursive: true, force: true });
fs.mkdirSync(DIST, { recursive: true });

/* ---------------------------------------------------------------- helpers */
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const depthOf = route => route === '/404.html' ? -1 : route.split('/').filter(Boolean).length;
/** link from page `from` to site path `to` (both site-absolute, e.g. '/en/fees/') */
function rel(from, to) {
  if (depthOf(from) < 0) return BASE + to;
  const up = '../'.repeat(depthOf(from));
  const t = to.replace(/^\//, '');
  return (up + t) || './';
}
const asset = (from, p) => rel(from, '/assets/' + p);
const abs = route => ORIGIN + BASE + route;
const sub = (s, L, from) => s.replace(/\{(\w+)\}/g, (m, k) => L.ROUTES[k] ? rel(from, L.ROUTES[k]) : m);

/* ---------------------------------------------------------------- icons (drawn to the logo's weight) */
const ICON = {
  phone: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M5 3.5h3.2l1.6 4.2-2.1 1.5a12 12 0 0 0 7.1 7.1l1.5-2.1 4.2 1.6V19a1.6 1.6 0 0 1-1.7 1.6A16.6 16.6 0 0 1 3.4 5.2 1.6 1.6 0 0 1 5 3.5Z"/></svg>',
  mail: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" d="M3.5 6h17v12h-17zM3.8 6.4 12 13l8.2-6.6"/></svg>',
};

/* ---------------------------------------------------------------- brand fragments */
const logoHorizontal = label => `<svg viewBox="${BRAND.horizViewBox}" role="img" aria-label="${esc(label)}">${BRAND.horizInner}</svg>`;
const logoStacked = label => `<svg viewBox="${BRAND.stackedViewBox}" role="img" aria-label="${esc(label)}">${BRAND.stackedInner}</svg>`;
// The swoosh's left tip, normalised to its own bbox (from src/swoosh-line.js): the thread leaves from here.
const swoosh = (cls) => `<svg class="${cls}" viewBox="${BRAND.swooshViewBox}" aria-hidden="true" focusable="false" data-thread="0.004 0.86">${BRAND.swooshInner}</svg>`;
const footprint = () => `<svg class="reach__foot" viewBox="${BRAND.footViewBox}" aria-hidden="true" focusable="false" data-thread="0.02 0.62" data-thread-end>${BRAND.footInner}</svg>`;

/* ---------------------------------------------------------------- images */
const IMG = {
  'hero-caregiver': { wide: [480, 768, 1200, 1600, 1951], tall: [480, 768, 1000], wh: [1951, 806], th: [1000, 806] },
  'podologie-closeup': { wide: [480, 768, 1200, 1600, 2000], tall: [480, 768, 1000], wh: [2000, 693], th: [1000, 693] },
  'interior': { wide: [480, 768, 1200, 1600, 2000], tall: [480, 768, 850], wh: [2000, 668], th: [850, 668] },
};
const usedImages = new Set();
function picture(from, name, alt, { eager = false, cls = 'photo--band', caption } = {}) {
  const m = IMG[name];
  const set = (crop, ws, ext) => ws.map(w => `${asset(from, `img/${name}-${crop}-${w}.${ext}`)} ${w}w`).join(', ');
  for (const c of ['wide', 'tall']) for (const w of m[c]) for (const e of ['avif', 'webp', 'jpg']) usedImages.add(`${name}-${c}-${w}.${e}`);
  const sizesWide = '(min-width: 82em) 78rem, calc(100vw - 2 * max(1rem, min(5vw, 3.5rem)))';
  return `<figure class="photo ${cls}" data-generated="true">
  <div class="photo__frame"><picture>
    <source media="(min-width: 48em)" type="image/avif" srcset="${set('wide', m.wide, 'avif')}" sizes="${sizesWide}">
    <source media="(min-width: 48em)" type="image/webp" srcset="${set('wide', m.wide, 'webp')}" sizes="${sizesWide}">
    <source type="image/avif" srcset="${set('tall', m.tall, 'avif')}" sizes="100vw">
    <source type="image/webp" srcset="${set('tall', m.tall, 'webp')}" sizes="100vw">
    <img src="${asset(from, `img/${name}-tall-${m.tall.at(-1)}.jpg`)}" srcset="${set('tall', m.tall, 'jpg')}" sizes="100vw" width="${m.th[0]}" height="${m.th[1]}" alt="${esc(alt)}"${eager ? ' fetchpriority="high" decoding="async"' : ' loading="lazy" decoding="async"'}>
  </picture></div>
  <figcaption>${esc(caption)}</figcaption>
</figure>`;
}

/* ---------------------------------------------------------------- shared chrome */
const INLINE_HEAD = `(function(){var d=document.documentElement;d.className+=' js';try{var s=localStorage.getItem('lc-ts'),c=localStorage.getItem('lc-hc');if(s==='2'||s==='3')d.setAttribute('data-ts',s);if(c==='1')d.setAttribute('data-hc','1');if(c==='0')d.setAttribute('data-hc','0')}catch(e){}})();`;
// Runs right after the controls are parsed, so the radios match the stored choice before first paint.
const INLINE_SYNC = `(function(){var d=document.documentElement,s=d.getAttribute('data-ts')||'1',r=document.getElementById('ts-'+s),c=document.getElementById('hc');if(r)r.checked=true;if(c)c.checked=d.getAttribute('data-hc')==='1';})();`;
const sha = s => "'sha256-" + crypto.createHash('sha256').update(s).digest('base64') + "'";
const CSP = [
  "default-src 'self'",
  `script-src 'self' ${sha(INLINE_HEAD)} ${sha(INLINE_SYNC)}`,
  "style-src 'self'",
  "img-src 'self' data:",
  "font-src 'self'",
  "frame-src https://www.openstreetmap.org",
  "connect-src 'self'",
  "base-uri 'none'",
  "form-action 'none'",
].join('; ');

function accessBar(L, route, alt) {
  const U = L.UI;
  return `<div class="access">
  <div class="wrap">
    <div class="access__controls">
      <fieldset class="ctl">
        <legend><span class="ctl__long">${U.textSize}</span><span class="ctl__short">${U.textSizeShort}</span></legend>
        ${[1, 2, 3].map(i => `<label class="ctl__opt"><input type="radio" name="ts" id="ts-${i}" value="${i}"${i === 1 ? ' checked' : ''}><span aria-hidden="true">A</span><span class="vh">${U.sizes[i - 1]}</span></label>`).join('')}
      </fieldset>
      <label class="toggle"><input type="checkbox" id="hc" role="switch"><span class="toggle__track" aria-hidden="true"></span><span class="ctl__long">${U.contrast}</span><span class="ctl__short">${U.contrastShort}</span></label>
    </div>
    <script>${INLINE_SYNC}</script>
    <div class="access__right">
      <a class="access__lang" href="${rel(route, alt)}" hreflang="${U.lang === 'nl' ? 'en' : 'nl'}" lang="${U.lang === 'nl' ? 'en' : 'nl'}"><span aria-hidden="true">${U.otherLangShort}</span><span class="vh">${U.otherLangLabel}</span></a>
    </div>
  </div>
</div>`;
}

function masthead(L, route, key, alt) {
  const U = L.UI;
  const items = L.NAV.map(([k, label]) => `<li><a href="${rel(route, L.ROUTES[k])}"${k === key ? ' aria-current="page"' : ''}>${label}</a></li>`).join('');
  const tel = U.lang === 'en' ? SITE.phone.intl : SITE.phone.display;
  return `<header class="masthead">
  <div class="wrap">
    <a class="brand" href="${rel(route, L.ROUTES.home)}">${logoHorizontal(`${SITE.name}, ${U.lang === 'nl' ? 'naar de startpagina' : 'home page'}`)}</a>
    <nav class="nav" aria-label="${U.mainNav}"><ul>${items}</ul></nav>
    <a class="btn masthead__call" href="${SITE.phone.href}">${ICON.phone}<span class="label-short">${U.call}</span><span class="label-long">${U.callLong} <span class="tel">${tel}</span></span></a>
    <details class="menu">
      <summary>${'<span class="menu__icon" aria-hidden="true"></span>'}<span class="menu__label">${U.menu}</span></summary>
      <nav class="menu__panel" aria-label="${U.mainNav}"><ul>${items}<li class="menu__lang"><a href="${rel(route, alt)}" hreflang="${U.lang === 'nl' ? 'en' : 'nl'}" lang="${U.lang === 'nl' ? 'en' : 'nl'}">${U.otherLang}</a></li></ul></nav>
    </details>
  </div>
</header>`;
}

function reach(L, route) {
  const U = L.UI;
  const tel = U.lang === 'en' ? SITE.phone.intl : SITE.phone.display;
  const a = SITE.address;
  return `<section class="band band--deep" aria-labelledby="reach-title">
  <div class="wrap reach lift">
    <div data-settle>
      ${footprint()}
      <p class="eyebrow">${U.reachEyebrow}</p>
      <h2 id="reach-title">${U.reachTitle}</h2>
    </div>
    <div data-settle>
      <p>${U.reachText}</p>
      <ul class="reach__list">
        <li><span class="reach__label">${U.phone}</span><span class="reach__value"><a class="tel" href="${SITE.phone.href}">${tel}</a></span></li>
        ${SITE.email.show ? `<li><span class="reach__label">${U.email}</span><span class="reach__value"><a href="${SITE.email.href}">${SITE.email.address}</a></span></li>` : ''}
        <li><span class="reach__label">${U.address}</span><span class="reach__value">${a.street}, ${a.postalCode} ${a.locality}</span></li>
      </ul>
      <a class="btn btn--gold" href="${SITE.phone.href}">${ICON.phone}${U.call} <span class="tel">${tel}</span></a>
    </div>
  </div>
</section>`;
}

function footer(L, route, alt) {
  const U = L.UI;
  const a = SITE.address;
  const items = L.NAV.map(([k, label]) => `<li><a href="${rel(route, L.ROUTES[k])}">${label}</a></li>`).join('');
  return `<footer class="site-foot">
  <div class="wrap">
    <div class="site-foot__grid">
      <a href="${rel(route, L.ROUTES.home)}">${logoStacked(SITE.name)}</a>
      <nav aria-label="${U.footNav}"><ul>${items}</ul></nav>
      <ul aria-label="${U.legal}"><li><a href="${rel(route, L.ROUTES.privacy)}">${U.privacy}</a></li><li><a href="${rel(route, L.ROUTES.a11y)}">${U.a11y}</a></li><li><a href="${rel(route, alt)}" hreflang="${U.lang === 'nl' ? 'en' : 'nl'}" lang="${U.lang === 'nl' ? 'en' : 'nl'}">${U.otherLang}</a></li></ul>
    </div>
    <div class="site-foot__legal">
      <p>${SITE.legalName} · ${a.street}, ${a.postalCode} ${a.locality}${SITE.kbo ? ` · ${U.lang === 'nl' ? 'Ondernemingsnummer' : 'Company number'} ${SITE.kbo}` : ''}</p>
      <p>${U.imageNote}</p>
    </div>
  </div>
</footer>`;
}

function jsonLd(L, route) {
  const a = SITE.address;
  const org = {
    '@context': 'https://schema.org',
    '@type': 'MedicalBusiness',
    '@id': abs('/') + '#business',
    name: SITE.name,
    legalName: SITE.legalName,
    url: abs('/'),
    logo: abs('/assets/brand/favicon-512.png'),
    image: abs('/assets/img/hero-caregiver-wide-1951.jpg'),
    telephone: SITE.phone.intl.replace(/\s/g, ''),
    ...(SITE.email.show ? { email: SITE.email.address } : {}),
    slogan: SITE.tagline.nl,
    address: { '@type': 'PostalAddress', streetAddress: a.street, postalCode: a.postalCode, addressLocality: a.locality, addressRegion: a.region, addressCountry: a.country },
    geo: { '@type': 'GeoCoordinates', latitude: a.geo.lat, longitude: a.geo.lon },
    medicalSpecialty: ['https://schema.org/Nursing', 'https://schema.org/Podiatric'],
    availableLanguage: ['nl', 'en'],
    ...(SITE.kbo ? { vatID: SITE.kbo } : {}),
    ...(SITE.hours ? { openingHoursSpecification: SITE.hours.map(h => ({ '@type': 'OpeningHoursSpecification', dayOfWeek: h.days, opens: h.opens, closes: h.closes })) } : {}),
    makesOffer: [
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: L.UI.lang === 'nl' ? 'Thuisverpleging' : 'Home nursing', url: abs(L.ROUTES.nursing) } },
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: L.UI.lang === 'nl' ? 'Podologie' : 'Podiatry', url: abs(L.ROUTES.podiatry) } },
    ],
  };
  return `<script type="application/ld+json">${JSON.stringify(org)}</script>`;
}

function layout({ L, key, route, alt, page, body, calm = false }) {
  const U = L.UI;
  const altLang = U.lang === 'nl' ? 'en' : 'nl';
  const hreflang = alt ? `<link rel="alternate" hreflang="${U.lang}" href="${abs(route)}">
<link rel="alternate" hreflang="${altLang}" href="${abs(alt)}">
<link rel="alternate" hreflang="x-default" href="${abs(U.lang === 'nl' ? route : alt)}">` : '';
  const ogImage = abs(`/assets/og/${key}-${U.lang}.jpg`);
  return `<!doctype html>
<html lang="${U.lang === 'nl' ? 'nl-BE' : 'en'}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="${CSP}">
<title>${esc(page.title)}</title>
<meta name="description" content="${esc(page.description)}">
<link rel="canonical" href="${abs(route)}">
${hreflang}
<meta name="theme-color" content="#1E3A5F">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${SITE.name}">
<meta property="og:locale" content="${U.locale}">
<meta property="og:title" content="${esc(page.title)}">
<meta property="og:description" content="${esc(page.description)}">
<meta property="og:url" content="${abs(route)}">
<meta property="og:image" content="${ogImage}">
<meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="${asset(route, 'brand/favicon.svg')}" type="image/svg+xml">
<link rel="icon" href="${asset(route, 'brand/favicon-32.png')}" sizes="32x32" type="image/png">
<link rel="apple-touch-icon" href="${asset(route, 'brand/favicon-180.png')}">
<link rel="manifest" href="${rel(route, '/manifest.webmanifest')}">
<link rel="preload" href="${asset(route, 'fonts/marcellus-400.woff2')}" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="${asset(route, 'fonts/atkinson-next-roman-var.woff2')}" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="${asset(route, 'css/site.css')}?v=${VERSION}">
<script>${INLINE_HEAD}</script>
<script src="${asset(route, 'js/site.js')}?v=${VERSION}" defer></script>
${key === 'home' || key === 'contact' ? jsonLd(L, route) : ''}
</head>
<body${calm ? ' data-calm' : ''}>
<a class="skip" href="#main">${U.skip}</a>
${accessBar(L, route, alt || L.ROUTES.home)}
${masthead(L, route, key, alt || L.ROUTES.home)}
<div class="page">
<svg class="thread" aria-hidden="true" focusable="false"><path d=""/></svg>
<main id="main" tabindex="-1">
${body}
</main>
${reach(L, route)}
</div>
${footer(L, route, alt || L.ROUTES.home)}
</body>
</html>
`;
}

/* ---------------------------------------------------------------- page bodies */
const callButtons = (L, route, mailPrefix) => {
  const tel = L.UI.lang === 'en' ? SITE.phone.intl : SITE.phone.display;
  return `<div class="hero__actions">
    <a class="btn" href="${SITE.phone.href}">${ICON.phone}${L.UI.call} <span class="tel">${tel}</span></a>
    ${SITE.email.show ? `<span>${mailPrefix ?? ''} <a class="hero__mail" href="${SITE.email.href}">${SITE.email.address}</a></span>` : ''}
  </div>`;
};
const actsList = acts => `<ul class="acts">${acts.map(([t, d]) => `<li><strong>${t}</strong><span>${d}</span></li>`).join('')}</ul>`;
const defs = acts => `<dl class="defs">${acts.map(([t, d]) => `<div><dt>${t}</dt><dd><p>${d}</p></dd></div>`).join('')}</dl>`;
const faq = (items, L, route) => `<div class="faq">${items.map(([q, a]) => `<details><summary>${q}</summary><div><p>${sub(a, L, route)}</p></div></details>`).join('')}</div>`;

function pagehead(L, route, P, extra = '') {
  return `<section class="pagehead">
  <div class="wrap lift">
    <p class="eyebrow">${P.eyebrow}</p>
    <h1>${P.h1}</h1>
    ${swoosh('hero__swoosh')}
    <p class="lead">${P.lead}</p>
    ${extra}
  </div>
</section>`;
}

const BODIES = {
  home(L, route) {
    const P = L.PAGES.home, H = P.hero, D = P.duo, C = P.call;
    const tel = L.UI.lang === 'en' ? SITE.phone.intl : SITE.phone.display;
    return `<section class="hero">
  <div class="wrap hero__grid lift">
    <div>
      <p class="eyebrow">${H.eyebrow}</p>
      <h1>${SITE.tagline[L.UI.lang === 'nl' ? 'nl' : 'en']}</h1>
      ${swoosh('hero__swoosh')}
      <p class="lead">${H.lead}</p>
      ${callButtons(L, route, H.mailPrefix)}
    </div>
    <aside class="facts" aria-label="${H.factsLabel}">
      <dl>${H.facts.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}
        <div><dt>${L.UI.phone}</dt><dd><a class="tel" href="${SITE.phone.href}">${tel}</a></dd></div>
      </dl>
    </aside>
  </div>
  <div class="photo-lane lift">${picture(route, 'hero-caregiver', H.photoAlt, { eager: true, caption: SITE.imageCaption[L.UI.lang] })}</div>
</section>

<section class="band band--plane" aria-labelledby="duo-title">
  <div class="wrap">
    <div class="duo__head lift" data-settle>
      <div><p class="eyebrow">${D.eyebrow}</p><h2 id="duo-title">${D.title}</h2></div>
      <p>${D.text}</p>
    </div>
    <div class="duo" data-thread="gap 0; gap 1">
      <article class="discipline lift" data-settle>
        <h3>${L.NAV.find(n => n[0] === 'nursing')[1]}</h3>
        <p class="discipline__what">${D.nursing.what}</p>
        ${actsList(D.nursing.acts)}
        <a class="link-arrow" href="${rel(route, L.ROUTES.nursing)}">${D.nursing.more}</a>
      </article>
      <article class="discipline lift" data-settle>
        <h3>${L.NAV.find(n => n[0] === 'podiatry')[1]}</h3>
        <p class="discipline__what">${D.podiatry.what}</p>
        ${actsList(D.podiatry.acts)}
        <a class="link-arrow" href="${rel(route, L.ROUTES.podiatry)}">${D.podiatry.more}</a>
      </article>
    </div>
  </div>
</section>

<section class="band" aria-labelledby="call-title">
  <div class="wrap call lift">
    <div data-settle>
      <p class="eyebrow">${C.eyebrow}</p>
      <h2 id="call-title">${C.title}</h2>
      <a class="bignum tel" href="${SITE.phone.href}">${tel}</a>
      <p>${C.text}</p>
    </div>
    <div data-settle>
      <h3 class="minor">${C.listTitle}</h3>
      <ul class="checklist">${C.list.map(i => `<li>${i}</li>`).join('')}</ul>
      <p class="after-list"><a class="link-arrow" href="${rel(route, L.ROUTES.fees)}">${C.feesLink}</a></p>
    </div>
  </div>
</section>`;
  },

  nursing(L, route) {
    const P = L.PAGES.nursing;
    return `${pagehead(L, route, P, callButtons(L, route, L.PAGES.home.hero.mailPrefix))}
<div class="photo-lane lift">${picture(route, 'interior', P.photoAlt, { eager: true, cls: 'photo--interior', caption: SITE.imageCaption[L.UI.lang] })}</div>
<section class="band" aria-labelledby="acts-title">
  <div class="wrap split lift">
    <h2 id="acts-title" data-settle>${P.actsTitle}</h2>
    <div data-settle>${defs(P.acts)}</div>
  </div>
</section>
<section class="band band--plane" aria-labelledby="pay-title">
  <div class="wrap split lift">
    <h2 id="pay-title" data-settle>${P.payTitle}</h2>
    <div data-settle>
      <div class="panel prose">${P.pay.map(p => `<p>${sub(p, L, route)}</p>`).join('')}</div>
      <details class="term"><summary>${P.termTitle}</summary><div><p>${P.term}</p></div></details>
    </div>
  </div>
</section>
<section class="band" aria-labelledby="faq-title">
  <div class="wrap split lift">
    <h2 id="faq-title" data-settle>${P.faqTitle}</h2>
    <div data-settle>${faq(P.faq, L, route)}</div>
  </div>
</section>`;
  },

  podiatry(L, route) {
    const P = L.PAGES.podiatry;
    return `${pagehead(L, route, P, callButtons(L, route, L.PAGES.home.hero.mailPrefix))}
<div class="photo-lane lift">${picture(route, 'podologie-closeup', P.photoAlt, { eager: true, cls: 'photo--wide', caption: SITE.imageCaption[L.UI.lang] })}</div>
<section class="band" aria-labelledby="acts-title">
  <div class="wrap split lift">
    <h2 id="acts-title" data-settle>${P.actsTitle}</h2>
    <div data-settle>${defs(P.acts)}</div>
  </div>
</section>
<section class="band band--plane" aria-labelledby="dia-title">
  <div class="wrap split lift">
    <h2 id="dia-title" data-settle>${P.diabetesTitle}</h2>
    <div data-settle>
      <div class="prose">${P.diabetes.map(p => `<p>${p}</p>`).join('')}</div>
      <div class="panel prose">
        <h3 class="minor">${P.refundTitle}</h3>
        ${P.refund.map(p => `<p>${p}</p>`).join('')}
        ${SITE.rizivPodiatry ? `<p>${P.refundRiziv.replace('{riziv}', SITE.rizivPodiatry)}</p>` : ''}
        <p class="source">${P.refundSource}</p>
      </div>
    </div>
  </div>
</section>
<section class="band" aria-labelledby="faq-title">
  <div class="wrap split lift">
    <h2 id="faq-title" data-settle>${P.faqTitle}</h2>
    <div data-settle>${faq(P.faq, L, route)}</div>
  </div>
</section>`;
  },

  fees(L, route) {
    const P = L.PAGES.fees;
    const table = SITE.fees ? `<section class="band" aria-labelledby="table-title"><div class="wrap lift"><h2 id="table-title">${P.tableTitle}</h2>
      <table><tbody>${SITE.fees.map(f => `<tr><th scope="row">${f.label[L.UI.lang]}</th><td class="tel">${f.price}</td></tr>`).join('')}</tbody></table></div></section>` : '';
    return `${pagehead(L, route, P, callButtons(L, route, L.PAGES.home.hero.mailPrefix))}
<section class="band band--plane" aria-label="${P.nursingTitle}, ${P.podiatryTitle}">
  <div class="wrap lift">
    <div class="panels">
      <div class="panel" data-settle><h3>${P.nursingTitle}</h3><ul>${P.nursing.map(i => `<li>${i}</li>`).join('')}</ul><a class="link-arrow" href="${rel(route, L.ROUTES.nursing)}">${L.PAGES.home.duo.nursing.more}</a></div>
      <div class="panel" data-settle><h3>${P.podiatryTitle}</h3><ul>${P.podiatry.map(i => `<li>${i}</li>`).join('')}</ul><a class="link-arrow" href="${rel(route, L.ROUTES.podiatry)}">${L.PAGES.home.duo.podiatry.more}</a></div>
    </div>
  </div>
</section>
${table}
<section class="band" aria-labelledby="gloss-title">
  <div class="wrap split lift">
    <div data-settle><h2 id="gloss-title">${P.glossaryTitle}</h2><p class="after-title">${P.glossaryIntro}</p></div>
    <dl class="defs glossary" data-settle>${P.glossary.map(([id, t, d]) => `<div><dt id="${id}">${t}</dt><dd><p>${d}</p></dd></div>`).join('')}</dl>
  </div>
</section>`;
  },

  about(L, route) {
    const P = L.PAGES.about;
    const staff = SITE.staff.length ? `<section class="band" aria-labelledby="staff-title"><div class="wrap split lift"><h2 id="staff-title">${P.staffTitle}</h2><div>${SITE.staff.map(s => `<h3>${esc(s.name)}</h3><p>${esc(s.role)}${s.credentials ? ', ' + esc(s.credentials) : ''}</p>${s.bio ? `<p>${esc(s.bio)}</p>` : ''}`).join('')}</div></div></section>` : '';
    const block = (id, title, paras, plane) => `<section class="band${plane ? ' band--plane' : ''}" aria-labelledby="${id}">
  <div class="wrap split lift"><h2 id="${id}" data-settle>${title}</h2><div class="prose" data-settle>${paras.map(p => `<p>${p}</p>`).join('')}</div></div>
</section>`;
    return `${pagehead(L, route, P)}
${block('why-title', P.whyTitle, P.why, true)}
${block('mark-title', P.markTitle, P.mark, false)}
${staff}
${block('trust-title', P.trustTitle, P.trust, true)}`;
  },

  contact(L, route) {
    const P = L.PAGES.contact, U = L.UI, a = SITE.address;
    const tel = U.lang === 'en' ? SITE.phone.intl : SITE.phone.display;
    const osm = `https://www.openstreetmap.org/?mlat=${a.geo.lat}&mlon=${a.geo.lon}#map=17/${a.geo.lat}/${a.geo.lon}`;
    const d = 0.004;
    const embed = `https://www.openstreetmap.org/export/embed.html?bbox=${a.geo.lon - d}%2C${a.geo.lat - d / 1.6}%2C${a.geo.lon + d}%2C${a.geo.lat + d / 1.6}&layer=mapnik&marker=${a.geo.lat}%2C${a.geo.lon}`;
    const C = L.PAGES.home.call;
    return `<section class="pagehead">
  <div class="wrap lift">
    <p class="eyebrow">${P.eyebrow}</p>
    <h1>${P.h1}</h1>
    ${swoosh('hero__swoosh')}
    <p class="lead">${P.lead}</p>
  </div>
</section>
<section class="band band--flush" aria-label="${P.h1}">
  <div class="wrap contact-grid lift">
    <div>
      <ul class="contact-list">
        <li><span class="reach__label">${U.phone}</span><a class="big tel" href="${SITE.phone.href}">${tel}</a></li>
        ${SITE.email.show ? `<li><span class="reach__label">${U.email}</span><a class="big" href="${SITE.email.href}">${SITE.email.address}</a></li>` : ''}
        <li><span class="reach__label">${U.address}</span><span class="big">${a.street}<br>${a.postalCode} ${a.locality}</span><a class="link-arrow" href="${osm}" rel="noopener">${U.route}</a></li>
      </ul>
      <h2 class="minor minor--spaced">${C.listTitle}</h2>
      <ul class="checklist">${C.list.map(i => `<li>${i}</li>`).join('')}</ul>
      <h2 class="minor minor--spaced">${P.company}</h2>
      <p class="quiet">${SITE.legalName}<br>${a.street}, ${a.postalCode} ${a.locality}${SITE.kbo ? `<br>${P.kbo}: ${SITE.kbo}` : ''}</p>
    </div>
    <div class="map" data-map="${esc(embed)}" data-map-title="${esc(U.mapTitle)}">
      <div class="map__facade">
        <svg viewBox="${BRAND.footViewBox}" aria-hidden="true" focusable="false">${BRAND.footInner}</svg>
        <p><strong>${a.street}, ${a.postalCode} ${a.locality}</strong></p>
        <a class="btn btn--ghost map__btn" href="${osm}" rel="noopener">${U.mapButton}</a>
        <p>${U.mapNote}</p>
      </div>
    </div>
  </div>
</section>`;
  },

  privacy(L, route) {
    const P = L.PAGES.privacy;
    return `<section class="pagehead"><div class="wrap lift"><h1>${P.h1}</h1>${swoosh('hero__swoosh')}</div></section>
<section class="band band--flush"><div class="wrap lift"><div class="prose">${P.body.map(([h, t]) => `<h2 class="sub">${h}</h2><p>${t}</p>`).join('')}
<p class="after-list">${SITE.legalName}, ${SITE.address.street}, ${SITE.address.postalCode} ${SITE.address.locality} · <a class="tel" href="${SITE.phone.href}">${L.UI.lang === 'en' ? SITE.phone.intl : SITE.phone.display}</a>${SITE.email.show ? ` · <a href="${SITE.email.href}">${SITE.email.address}</a>` : ''}</p></div></div></section>`;
  },
};
BODIES.a11y = (L, route) => {
  const P = L.PAGES.a11y;
  return `<section class="pagehead"><div class="wrap lift"><h1>${P.h1}</h1>${swoosh('hero__swoosh')}</div></section>
<section class="band band--flush"><div class="wrap lift"><div class="prose">${P.body.map(([h, t]) => `<h2 class="sub">${h}</h2><p>${t}</p>`).join('')}</div></div></section>`;
};

/* ---------------------------------------------------------------- render */
const PAGE_KEYS = ['home', 'about', 'nursing', 'podiatry', 'fees', 'contact', 'privacy', 'a11y'];
const CALM = new Set(['nursing', 'podiatry']);
const written = [];
for (const [lang, L] of Object.entries(LANGS)) {
  const other = LANGS[lang === 'nl' ? 'en' : 'nl'];
  for (const key of PAGE_KEYS) {
    const route = L.ROUTES[key];
    const html = layout({ L, key, route, alt: other.ROUTES[key], page: L.PAGES[key], body: BODIES[key](L, route), calm: CALM.has(key) });
    const file = path.join(DIST, route, 'index.html');
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, html);
    written.push({ route, lang, key });
  }
}
// 404: Dutch primary with the way back in both languages; absolute links.
{
  const L = NL, P = NL.PAGES.notFound, route = '/404.html';
  const body = `<section class="pagehead"><div class="wrap lift"><h1>${P.h1}</h1>${swoosh('hero__swoosh')}<p class="lead">${P.lead}</p>
  <div class="hero__actions"><a class="btn" href="${rel(route, '/')}">${P.home}</a><a class="link-arrow" href="${rel(route, '/en/')}" lang="en">${EN.PAGES.notFound.home}</a></div></div></section>`;
  fs.writeFileSync(path.join(DIST, '404.html'), layout({ L, key: 'notFound', route, alt: null, page: { ...P }, body }).replace('<meta name="description"', '<meta name="robots" content="noindex">\n<meta name="description"'));
}

/* ---------------------------------------------------------------- assets */
const copy = (from, to) => { fs.mkdirSync(path.dirname(to), { recursive: true }); fs.copyFileSync(from, to); };
for (const f of fs.readdirSync(path.join(ROOT, 'assets/fonts'))) copy(path.join(ROOT, 'assets/fonts', f), path.join(DIST, 'assets/fonts', f));
for (const f of usedImages) copy(path.join(ROOT, 'assets/img', f), path.join(DIST, 'assets/img', f));
for (const f of ['favicon.svg', 'favicon-32.png', 'favicon-180.png', 'favicon-192.png', 'favicon-512.png', 'favicon.ico'])
  copy(path.join(ROOT, 'assets/brand', f), path.join(DIST, 'assets/brand', f));
fs.copyFileSync(path.join(DIST, 'assets/brand/favicon.ico'), path.join(DIST, 'favicon.ico'));
if (fs.existsSync(path.join(ROOT, 'assets/og')))
  for (const f of fs.readdirSync(path.join(ROOT, 'assets/og'))) copy(path.join(ROOT, 'assets/og', f), path.join(DIST, 'assets/og', f));

// CSS: strip comments and collapse whitespace. Font URLs are relative to the CSS file.
const css = fs.readFileSync(path.join(ROOT, 'src/styles.css'), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ').replace(/\s*([{};,>])\s*/g, '$1').replace(/;}/g, '}').trim();
fs.mkdirSync(path.join(DIST, 'assets/css'), { recursive: true });
fs.writeFileSync(path.join(DIST, 'assets/css/site.css'), css);

// JS: the site script plus the swoosh centreline it draws from.
const line = (await import('../src/swoosh-line.js')).default;
const js = fs.readFileSync(path.join(ROOT, 'src/site.js'), 'utf8').replace('/*SWOOSH*/[]', JSON.stringify(line));
fs.mkdirSync(path.join(DIST, 'assets/js'), { recursive: true });
fs.writeFileSync(path.join(DIST, 'assets/js/site.js'), js);

/* ---------------------------------------------------------------- SEO files */
const today = new Date().toISOString().slice(0, 10);
fs.writeFileSync(path.join(DIST, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${written.map(w => {
  const other = LANGS[w.lang === 'nl' ? 'en' : 'nl'].ROUTES[w.key];
  return `<url><loc>${abs(w.route)}</loc><lastmod>${today}</lastmod><xhtml:link rel="alternate" hreflang="${w.lang}" href="${abs(w.route)}"/><xhtml:link rel="alternate" hreflang="${w.lang === 'nl' ? 'en' : 'nl'}" href="${abs(other)}"/></url>`;
}).join('\n')}
</urlset>
`);
fs.writeFileSync(path.join(DIST, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${abs('/sitemap.xml')}\n`);
fs.writeFileSync(path.join(DIST, 'manifest.webmanifest'), JSON.stringify({
  name: SITE.name, short_name: SITE.name, lang: 'nl-BE', start_url: './', display: 'browser',
  background_color: '#FFFFFF', theme_color: '#1E3A5F',
  icons: [{ src: 'assets/brand/favicon-192.png', sizes: '192x192', type: 'image/png' }, { src: 'assets/brand/favicon-512.png', sizes: '512x512', type: 'image/png' }],
}));
fs.writeFileSync(path.join(DIST, '.nojekyll'), '');

const size = dir => fs.readdirSync(dir, { withFileTypes: true }).reduce((a, e) => a + (e.isDirectory() ? size(path.join(dir, e.name)) : fs.statSync(path.join(dir, e.name)).size), 0);
console.log(`built ${written.length + 1} pages to dist/ (base ${BASE || '/'}), ${(size(DIST) / 1024).toFixed(0)} KB total, css ${(css.length / 1024).toFixed(1)} KB, js ${(js.length / 1024).toFixed(1)} KB`);
