# Laila Care

Website for Laila Care, home nursing (thuisverpleging) and podiatry (podologie) under one
roof, Hogebrug 26, 9280 Denderbelle. Static, dependency-free, NL primary and EN mirror.

**Live:** https://fietsenrekk.github.io/laila-care/ · **Repo:** https://github.com/fietsenrekk/laila-care

Read first: [`CLIENT_ACTIONS.md`](CLIENT_ACTIONS.md) (what blocks launch),
[`docs/FINDINGS.md`](docs/FINDINGS.md) (what was found, including where the brief was wrong).

## Commands

```bash
npm install                 # QA tooling only (puppeteer-core, axe-core, lighthouse); the site has no runtime deps
npm run build               # src/ -> dist/
npm run dev                 # http://localhost:4221/laila-care/ (mirrors the GitHub Pages sub-path)
npm run check               # 10 static gates over dist/ (placeholder leaks, facts, links, CSP, budget…)
npm run a11y                # axe-core: 17 routes x 4 states (default, phone, largest text, high contrast)
node tools/interact.mjs     # behaviour: no-JS controls, persistence, keyboard, reduced motion, map, third parties
node tools/shots.mjs        # screenshots + overflow at any width/state: --widths=360,1440 --ts=3 --hc --rm --nojs
node tools/vitals.mjs       # LCP / CLS / longest task / scroll frame p95 at 1.6 Mbps, 150 ms RTT, 4x CPU
node tools/lighthouse.mjs [url]   # mobile Lighthouse; gates perf >= 96, a11y/bp/seo 100
npm run deploy              # build, then publish dist/ to the gh-pages branch
```

Windows Git Bash: prefix env vars that start with `/` with `MSYS_NO_PATHCONV=1`
(`LC_ROUTES=/` otherwise becomes `C:/Program Files/Git/`).

## Structure

```
src/
  config.js          the single source of business facts; unconfirmed values are null
                     and render nothing. Also the lookbook leak list.
  content/nl.js      all Dutch copy (primary)
  content/en.js      all English copy
  styles.css         one stylesheet; tokens, a11y controls, layout
  site.js            ~4 KB: preferences, menu, map facade, settle, the step line
  brand.js           generated logo sprite (tools/brand.mjs)
  swoosh-line.js     generated swoosh centreline (tools/swoosh-line.mjs)
assets/
  src-img/           supplied originals (never shipped as-is)
  img/               graded ladders (tools/images.mjs)
  brand/             vector logo set + favicons (reusable outside the site)
  fonts/             Marcellus, Atkinson Hyperlegible Next (OFL, self-hosted)
  og/                1200x630 share images per page and language (tools/og.mjs)
tools/               build, gates, tracers, image pipeline, QA
docs/                findings, image report, content sources, progress log, Lighthouse JSON
submission/          Awwwards package
```

## How it is built

- **Pages.** `tools/build.mjs` renders 17 routes (8 NL, 8 EN, 404) from the content
  modules. All internal links are relative, so the output works under any base path. The
  exception is `404.html`, which GitHub Pages serves at any depth and which therefore uses
  absolute links from `BASE_PATH`.
- **CSS** is inlined (5 KB gz) and hash-allowed by a strict CSP meta; inline scripts are
  hashed too. No `unsafe-inline`, no third-party requests on any page load.
- **Accessibility controls.** Text size (×1, ×1.2, ×1.4) and high contrast are real form
  controls. With JavaScript off they work through `:has()` on the radios and checkbox; with
  JavaScript a two-line head script restores the stored choice before first paint.
  Breakpoints are duplicated per text-size step, because media queries resolve `em`
  against 16 px, not the scaled root.
- **The step line.** The logo's swoosh is drawn under every H1. From its left tip, one
  thin gold line runs down the margin. On the home page it crosses into the gap between
  Thuisverpleging and Podologie, and on every page it ends in the logo's footprint beside
  the contact details. Anchors are declared in markup (`data-thread`), and the path is
  rebuilt inside a ResizeObserver callback, so it follows text-size changes. It is
  revealed by a downward `clip-path` as the visitor reads, never animated on load, and
  fully drawn under `prefers-reduced-motion`. Slower on the two service pages.
- **Logo.** `tools/trace-logo.mjs` traces the supplied raster per colour with potrace;
  `tools/verify-trace.mjs` rasterises it back and diffs it against the source (monogram
  IoU 99.25% blue, 98.92% gold). The hyphen in the source wordmark is removed (FINDINGS F-005).

## Changing facts

Edit `src/config.js`, then `npm run build && npm run check`. Setting `kbo`, `hours`,
`rizivPodiatry`, `staff` or `fees` makes the matching content appear: the footer and
contact page, structured data, the diabetes section, a staff section on `/over-ons`, and a
fees table on `/tarieven`.

## Custom domain

When lailacare.be is registered: add `dist/CNAME` (one line, `lailacare.be`) in the build,
set `SITE.origin = 'https://lailacare.be'` and `SITE.basePath = ''`, rebuild, deploy, then
set the domain in the repository's Pages settings and add the DNS records GitHub shows.
