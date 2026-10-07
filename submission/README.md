# Awwwards submission: Laila Care

**URL:** https://fietsenrekk.github.io/laila-care/ (switch to https://lailacare.be once the
domain exists; see CLIENT_ACTIONS #1)

## Images (captured from the live build by `tools/submission.mjs`)

| File | Use |
|---|---|
| `desktop-1200x900.jpg` | Desktop thumbnail: the gold line mid-draw, crossing into the gap between Thuisverpleging and Podologie |
| `mobile-750x1624.jpg` | Mobile thumbnail, purpose-built at phone width |
| `hero-1600x1200.jpg` | Gallery: the opening statement, tagline over the logo's own swoosh |
| `a11y-1200x900.jpg` | Gallery / element: the same practice at the largest text size in high contrast |

## Description

> A home nursing and podiatry practice in a Flemish village, two disciplines under one
> roof. The site is told through a single gold line taken from the practice's own logo: it
> leaves the swoosh under each headline, runs between the two services and ends in the
> logo's footprint beside the phone number. Built for older readers first, with text size
> and contrast controls that work even without JavaScript.

## Categories (honest)

Health & Wellness · Business & Corporate · Typography

Animation is left off: the motion is deliberately minimal (one settle, one line) for this
audience.

## Technologies (what was actually used)

HTML · CSS (`:has()`, `clip-path`, `text-wrap`) · vanilla JavaScript (~4 KB) · SVG ·
potrace (logo vectorisation) · ffmpeg / AVIF · Node build script.
No framework, no GSAP, no Lenis, no Tailwind (FINDINGS B-003, B-006).

## Elements to submit separately

1. **The step line.** The logo's swoosh, continued as one thread through every page.
   Anchors live in the markup and the route rebuilds on resize and text-size change.
   Revealed with the reader's scroll, fully drawn under reduced motion.
2. **The accessibility bar.** Three-step text size and high contrast as real form controls.
   They work with JavaScript off (`:has()`), persist with it, scale the breakpoints, swap
   to a mark-only logo when large text meets a narrow screen, and recolour the brand (the
   navy band turns white so the navy line stays visible).

## Measured (local, see docs/lighthouse and docs/PROGRESS.md; live numbers in the final report)

Lighthouse mobile: Performance 96–100, Accessibility 100, Best Practices 100, SEO 100 ·
axe 0 violations (17 routes × 4 states) · CLS 0 · LCP 1.5–1.7 s (simulated mobile) ·
JS 3.5 KB gz · home first view 107 KB gz.

## Before submitting (brief §15)

Run `tools/check.mjs`, `tools/a11y.mjs`, `tools/interact.mjs` and
`tools/lighthouse.mjs https://fietsenrekk.github.io/laila-care` against the live URL.
Clear CLIENT_ACTIONS #1–#4 first. Submitting a site whose e-mail bounces, or whose photos
are generated, invites exactly the trust question the jury will ask.
