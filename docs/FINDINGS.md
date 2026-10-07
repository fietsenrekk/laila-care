# Findings

Two series. **F** covers the business, brand and assets. **B** covers the build brief
itself: places where the brief was wrong, could not be followed, or was followed
differently, with the reason. Every F item records how it was verified.

---

## F: the business, the brand, the assets

**F-001 · The e-mail domain does not exist.**
`lailacare.be` returned NXDOMAIN on the ISP resolver, 8.8.8.8 and 1.1.1.1, with no MX record
(2026-10-07). `info@lailacare.be` cannot receive mail today. The site keeps phone as the
primary action everywhere and shows the address as secondary (studio decision).
→ CLIENT_ACTIONS #1.

**F-002 · The lookbook's contact data is placeholder, and its phone number is not even valid.**
The brand board's contact page shows `+32 46 54 37 073`, which has 10 digits after +32.
Belgian mobile numbers have 9 (`+32 4xx xx xx xx`), so this number cannot exist. The
address shown, Lange Minnestraat 57, 9280 Lebbeke, is not the practice's. The footer BTW
number `BE 0756.123.456` follows a 123-456 pattern. All three are on the leak list in
`src/config.js`, and the build fails if any of them appears (`tools/check.mjs` gate 1).

**F-003 · The real address exists.**
OpenStreetMap has a building at Hogebrug 26, 9280 Denderbelle (deelgemeente of Lebbeke),
way 1441917366. Its centroid (51.0053464, 4.0900093) is used for the map and structured data.

**F-004 · No company number has been supplied.**
The site therefore shows none. A business website in Belgium is required to show one.
→ CLIENT_ACTIONS #2.

**F-005 · The supplied logo file reads "LAILA-CARE"; everything else reads "LAILA CARE".**
That includes the brand board, business cards, embroidery, e-mail address and brief.
Studio decision: no hyphen. The real letterforms were traced, the hyphen glyph removed,
and "CARE" re-spaced to a word space of 2.4× the median letter gap (242 units against a
median of 101).

**F-006 · The logo file's colours are not the palette's colours.**
Measured medians of the raster: blue `#3C6795`, gold `#DDB553`. The brand board specifies
`#1E3A5F` and `#D4AF37`, and the embroidery matches the board. The vector logo is drawn in
the board's values. Worth confirming with whoever holds the master file.

**F-007 · Gold on white fails contrast, and the lookbook's buttons are built on it.**
Gold `#D4AF37` on white is **2.10:1**, and on the light grey 1.77:1. Both are below even the
3:1 bar for large text and UI components. The lookbook's CTA (white text on gold) is
2.10:1. The site's gold buttons carry navy text (5.47:1) and appear only on the navy band.
Gold is otherwise decorative (the line, the swoosh, the footprint). A real instance of
this bug was caught in the build: `.band--deep a` outranked `.btn--gold` and painted white
on gold. axe now reports 0 violations across 17 routes × 4 states.

**F-008 · The supplied photographs are generated.**
They appear to be AI-generated, as the brand board is (the board's map contains garbled
pseudo-text). The studio confirmed this and approved shipping them, captioned. The home
image shows a person in an embroidered Laila Care uniform, which a visitor will read as
staff. → CLIENT_ACTIONS "Photography", SHOOT_LIST #1.

**F-009 · The photographs are 1951–2000 px wide; the brief asks for at least 3840.**
The Higgsfield workspace has 0 credits (free plan). A lanczos upscale adds pixels, not
detail. So the ladder stops at native width, and the layout never displays a photo
larger than it can serve sharply: on desktop the hero sits inside the 78rem column.
→ B-005.

**F-010 · The reimbursement rules changed on 1 November 2025, and the brief predates that.**
Home nurses no longer need a doctor's prescription for most acts (wound care,
injections); medication still needs one. This is the single most useful fact for a
visitor wondering "do I need to see the GP first?", and many care sites still state the
old rule. It is on the home-nursing page, the fees page and in the glossary. → CLIENT_ACTIONS #4.

**F-011 · Diabetic podiatry reimbursement is narrower than "diabetics get podiatry reimbursed".**
RIZIV: two sessions of 45 minutes a year, only within a type 2 care trajectory, start
trajectory or programme, only with a raised foot risk (risk groups 1–3), with a
prescription, and only from a podiatrist with a RIZIV number. The site states the rule;
it does not claim Laila Care's podiatrist qualifies until `SITE.rizivPodiatry` is set.

**F-012 · The lookbook's three-icon trust row ("Betrouwbaar, Deskundig, Persoonlijk") was not used.**
These are adjectives any practice could claim (brief §8.1). They are on the leak list. The
site carries facts instead: two disciplines in one practice, the 2025 prescription change,
the diabetes rule, and professional secrecy.

**F-013 · The lookbook shows a contact form and social icons; neither ships.**
There is no backend in this phase (brief), and a form that posts nowhere is worse than none.
No social accounts were supplied.

---

## B: the brief itself

**B-001 · "Inter Tight or Geist" (brief §7.3) → Atkinson Hyperlegible Next.**
It was designed by the Braille Institute for readers with low vision, which is this
site's audience. It has open licence (OFL) and full Dutch diacritics. It renders the zero
slashed by design, to tell 0 from O. I kept that, so the phone number looks the same
everywhere it appears.

**B-002 · "The wordmark's own face (or its closest open match)" → Marcellus.**
No source file was supplied, so the face cannot be confirmed. The traced wordmark stays
as vector paths. Marcellus (OFL) was chosen against Literata and Fraunces by setting all
three next to the traced lockup (`docs/shots/type-specimen.png`): its flared Roman capitals
are the closest kin.

**B-003 · GSAP + ScrollTrigger + DrawSVG + Lenis (brief §12.1) → about 4 KB of plain JavaScript.**
The motion vocabulary is two things: a one-time settle and the line. Neither needs a
library.
- Lenis was left out on purpose: on an earlier build in this series, its scroll smoothing
  was reported as input lag, and this audience is older.
- The line was first drawn with `stroke-dashoffset` (the DrawSVG technique). That added
  3–5 ms to the p95 frame time at 4× CPU, because a dash change re-rasterises the path. It
  is now revealed with a downward-growing `clip-path`, which does not. The route only ever
  moves down the page, so a downward reveal still reads as drawing.
- The brief's claim that GSAP plugins are free since 2025 was not needed and was not checked.

**B-004 · `openingHoursSpecification` is required by brief §3.2, but no hours exist.**
Brief §17 forbids inventing them. Structured data carries `MedicalBusiness`, address, geo,
`medicalSpecialty` Nursing and Podiatric, and the two services. Opening hours are added
automatically once `SITE.hours` is set. A build gate fails if hours appear without data.
"HomeHealthCareService" and "Podiatrist" (named in the brief) are not schema.org types.

**B-005 · "Every full-bleed ≥ 3840px" (brief §9.2) is not met.** See F-009. No credits; no upscale.

**B-006 · Submission technologies (brief §14) listed Next.js/Astro, GSAP, Lenis and Tailwind; none are used.**
The submission package lists what was actually used.

**B-007 · The Awwwards figures in the brief were not verified.**
These are Halo Dental at 7.41, and the Senior Care and Life Care Nominee dates. They
calibrate ambition and appear nowhere on the site or in the submission text.

**B-008 · The brief assumed the logo reads "LAILA CARE".** The file reads "LAILA-CARE". See F-005.

**B-009 · Brief §6 asks for seven parallel agents.**
The work was done in one thread instead, because every stream depended on the same few
facts: the palette contrast, the traced logo and the confirmed business data. A wrong
fact in a parallel stream is exactly what this brief is designed to prevent.
