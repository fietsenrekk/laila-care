# Progress log

Each entry: what changed, what was measured, what was decided. Newest last.

## 2026-10-07

**Facts first.** Address verified on OpenStreetMap (building way 1441917366). lailacare.be
returns NXDOMAIN on three resolvers, with no MX record. Web search finds no existing
presence for the business. Lookbook placeholders read off the board: an invalid
10-digit phone, an address that is not the practice's, and a `123.456`-pattern BTW
number. Three decisions taken by the studio: ship the generated photos (captioned),
show the e-mail but keep phone primary, and drop the hyphen from the wordmark.

**Logo.** 3x lanczos → per-colour ink masks → potrace. Monogram IoU against the source:
blue 99.25%, gold 98.92% (`tools/verify-trace.mjs`). The first proof had filled counters
(P, O, D); fixed with `fill-rule="evenodd"`. The swoosh centreline was extracted from the
gold mask, 24 points.

**Type.** Marcellus set against Literata and Fraunces next to the traced lockup; Marcellus
is the closest kin to the wordmark. Body face: Atkinson Hyperlegible Next (B-001).

**Contrast.** Gold/white 2.10, gold/grey 1.77, navy/gold 5.47, navy/white 11.50. Derived
tokens: text `#2E4869` (9.35 on white), muted `#405877` (7.29), on-navy muted `#C9D3DF` (7.60).

**Images.** The black-point lift moved skin saturation −0.020 on the hero face, and
`eq=saturation` compensation rotated hue +2.84°; both dropped. Final grade: highlight
roll only. Drift +0.13° hue, −0.008 saturation. PSNR against the master: WebP 45.9 dB,
AVIF 44.4 dB. Higgsfield balance 0 credits; no upscale (F-009).

**Facts verified for copy.** RIZIV page for diabetic podiatry (two sessions of 45 min,
conditions). VRT for the 1 Nov 2025 prescription change.

**Build.** 17 routes. Bugs the tools caught:
- my own CSP blocked inline `style=""` attributes (moved to classes);
- a regex lost its backslash through a heredoc, so the line path was NaN;
- the 390px masthead overflowed by 4px;
- the English big number overflowed by 7px at 360px;
- **at the largest text size the masthead overflowed by 99px (phone) and 108px (1440).**
  Media queries resolve `em` against 16px, so breakpoints did not move with the text
  control. Fixed with per-step breakpoints, px gutters and a mark-only logo.

**Accessibility.**
- In high contrast the navy line and footprint vanished on the navy band, and the gold
  button went white on white. The deep band now flips to white in high contrast.
- Found while fixing that: `.band--deep a` outranked `.btn--gold`, so the normal-mode gold
  button had white text on gold (2.10:1). Fixed.
- axe flagged the access bar outside any landmark; it is now a labelled region.
- Result: axe 0 violations across 17 routes × 4 states.

**Weight.** Inline logo paths carried potrace's 3-decimal precision three times over:
home HTML 75.5 KB gz. Rounded coordinates plus one sprite per page: 24.4 KB gz.

**Behaviour.**
- 19 checks in `tools/interact.mjs`. One real failure: jumping to the bottom (End key, an
  anchor) left sections hidden, because IntersectionObserver only reports what intersects
  now. Fixed with a scroll sweep.

**Performance (4x CPU, 1.6 Mbps, 150 ms RTT).**
- First measurement: LCP 0.8–1.0 s, CLS 0, but home had a 340 ms long task and scroll frame
  p95 was 17–19 ms.
- Isolation showed the line's `stroke-dashoffset` repaint was the scroll cost, so the reveal
  moved to `clip-path` (no re-raster). The length table with ~330 `getPointAtLength` calls
  went too.
- `will-change` on the page-tall SVG created a ~780×10,700 device-pixel layer. Removed:
  scroll p95 18.0 → 11.5 ms, longest task 258 → 154 ms.
- Lighthouse home LCP was 1.82 s (gate 1.8): the 5 KB gz CSS is now inlined and
  hash-allowed, giving LCP 1.51–1.67 s.
- Speed Index was stuck at 3.8 s. In a fresh profile on Windows the `local()` fallback
  faces delayed first paint by 300–400 ms (912 vs 536, 1128 vs 720, 944 vs 688 ms FCP).
  Removed them; CLS stayed 0.
- Settle setup read every element's position and toggled a class on `<html>`: a 219 ms
  task under Lighthouse. Moved to IntersectionObserver's first callback, with the class on
  the element only. Home Lighthouse: 95 → 98–100.
- The line's build moved into the ResizeObserver callback (layout already clean) instead
  of a timer, which removed the last forced reflow.

**Live verification and two fixes found there.**
- Deployed to https://fietsenrekk.github.io/laila-care/. Live: Lighthouse 100/100/100/100 on
  6 routes; axe 0 across 68 runs; 19/19 behaviour checks; no console errors on 17 routes ×
  2 widths; deep 404 renders with fonts and a working way home.
- The schema.org validator rejected `medicalSpecialty` and `availableLanguage` on
  `MedicalBusiness`. Fixed: the entity is typed `MedicalBusiness` + `MedicalOrganization`,
  and the languages sit on a `ContactPoint`. 0 errors.
- INP measured on real clicks at 4x CPU (`tools/inp.mjs`): the text-size click took
  264–416 ms. A trace showed 240 ms of layout: every text run reflowing at the new size.
  Removing text-wrap, hyphenation or the sprite made no difference. Fix: with JS, size
  follows `html[data-ts]`, set one task after the click (yield), so the selected state
  paints at once. The no-JS `:has()` rules are gated off once `site.js` attaches
  (`html.prefs-js`). Text-size click 48–72 ms; worst interaction 96–112 ms.
