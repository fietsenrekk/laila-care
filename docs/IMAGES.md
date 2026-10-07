# Image report

## Provenance

| Asset | Source file | Provenance | Ships? | Marking on site |
|---|---|---|---|---|
| Home hero | `assets/src-img/hero-caregiver.webp` 1951×806 | Generated for the brand board (studio confirmed 2026-10-07) | Yes, studio decision | Caption "Illustratief beeld, digitaal gemaakt", `data-generated="true"`, footer note |
| Podiatry band | `assets/src-img/podologie-closeup.webp` 2000×693 | Generated (as above) | Yes | Same |
| Home-nursing band | `assets/src-img/interior.webp` 2000×668 | Generated (as above) | Yes | Same |
| Logo | `assets/src-img/logo-source.webp` 1549×1015 | Client brand asset (raster) | Traced to vector | n/a |
| Brand board | `assets/src-img/lookbook-board.jpg` | Pitch mockup | Reference only, never shipped | n/a |
| OG images ×16 | `assets/og/*.jpg` | Composed in Chrome from the logo, type and the images above | Yes | Caption carried into the OG image |

No image was generated in this build, and no Higgsfield credits were spent (the workspace
has 0). No person was generated, altered, extended or outpainted.

## Grade recipe (`tools/images.mjs`)

| Step | Value | Why |
|---|---|---|
| Highlight roll | `curves=all='0/0 0.5/0.5 1/0.985'` | Never clip skin highlights |
| Black point | **untouched** | A 0→0.02 lift was tried: skin saturation −0.020 on the hero face. Rejected |
| Saturation | **untouched** | `eq=saturation=1.04` to compensate rotated skin hue **+2.84°**. Rejected |
| White balance | podiatry close-up only: `colortemperature=6200, mix 0.35` | It runs blue-white next to the two warmer images |
| Sharpening | none | Sources are already crisp; no upscale was done |
| Metadata | `-map_metadata -1` on every output | Strips EXIF/XMP, including any GPS |

## Skin-tone verification (brief §9.5)

Measured on the darkest-skinned subject in the set (the only person). Pixels with warm
hue, mid luminance and non-trivial saturation; source vs graded:

| Region | Pixels | Hue drift | Saturation drift | Luminance drift | Verdict |
|---|---|---|---|---|---|
| Face (1200,60 260×260) | 58,872 | **+0.13°** | **−0.008** | −0.001 | pass (limits: 1°, 0.015) |
| Forearm (830,640 160×120) | 13,423 | **+0.14°** | **−0.003** | −0.001 | pass |

## Encoding and QA

- Ladder: 480 / 768 / 1200 / 1600 / native, AVIF (libaom CRF 30) → WebP (q80) → JPEG (q3).
  Two art-directed crops per image: `wide` from 48em up, `tall` below it.
- Faithfulness, hero at native width, against the graded master: PSNR **45.9 dB** (WebP),
  **44.4 dB** (AVIF).
- Weight: hero AVIF 20 KB (1951w), 19 KB (1000w tall). Home first view in total is 107 KB gz.
- Every `<img>` has width, height and alt; the LCP image is `fetchpriority="high"`, the
  rest `loading="lazy"`. `tools/check.mjs` gate 5 enforces this.

## Per-asset verdict

| Asset | Artefacts at 200% | Displayed larger than native? | Verdict |
|---|---|---|---|
| hero-caregiver | none beyond the source's own smoothness | no: capped at the 78rem column | ship, captioned; replace (SHOOT_LIST #1) |
| podologie-closeup | none | no | ship, captioned; replace (#2) |
| interior | none | no | ship, captioned; replace (#3) |
