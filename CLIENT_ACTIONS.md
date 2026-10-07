# Laila Care: actions for the client

What only Laila Care can answer or do. Ordered by what blocks launch first.
Every item maps to a `null` in `src/config.js`. Fill the value, rebuild, and the site
shows it; until then the site says nothing rather than guessing.

---

## Blocking before a real launch

### 1. Register lailacare.be and set up the mailbox
**Status: the domain does not exist.** On 2026-10-07, `lailacare.be` returned NXDOMAIN on
three resolvers (the Telenet ISP resolver, 8.8.8.8, 1.1.1.1), with no MX record. Mail to
`info@lailacare.be` will bounce until the domain is registered and mail is configured.

The site shows the address anyway, as the studio decided, and phone is the primary action
everywhere. To hide the address until mail works: set `email.show: false` in `src/config.js`
and rebuild. Once the domain is live, point it at the hosting and change `SITE.origin` and
`SITE.basePath` (see README, "Custom domain").

### 2. Confirm the company number (KBO/BTW)
Belgian law requires a business website to show its enterprise number. Confirm the exact
legal requirement with your accountant. The lookbook footer shows `BE 0756.123.456`, a
placeholder in the right format, not a real number. The site shows no number until one is
supplied. → `SITE.kbo`

### 3. Confirm the advertising rules for both professions
Home nursing and podiatry are regulated healthcare professions in Belgium, and advertising
rules apply. The copy was written to be factual and non-promotional: no superlatives, no
outcome claims, no comparisons. A build gate fails on words like "beste", "garantie" or
"pijnloos". Have the professional bodies (or your federation) confirm that the current
copy is acceptable before you promote the site.

### 4. Sign off the clinical and reimbursement statements
These are on the site and were checked against public sources (`docs/CONTENT-SOURCES.md`).
They are not specific to Laila Care, so please confirm they apply to you:
- Since 1 November 2025, most nursing acts at home (wound care, injections) no longer need a
  doctor's prescription; medication still does. *(VRT NWS, 29 Oct 2025)*
- Help with washing and dressing is assessed on the Katz scale.
- People with diabetes in a care trajectory, start trajectory or programme, with a raised
  foot risk, get **two reimbursed podiatry sessions of 45 minutes a year**, with a
  prescription, from a podiatrist with a RIZIV number. *(RIZIV)*

---

## Photography (studio decision recorded 2026-10-07)

The three supplied photographs were generated for the brand board. The studio approved
shipping them. On the site:
- every photo carries a visible caption, "Illustratief beeld, digitaal gemaakt", and the
  footer repeats it;
- every photo is marked `data-generated="true"`;
- no caption, name or alt text presents the person as a named staff member.

**Remaining risk.** The home photo shows a woman in an embroidered Laila Care uniform. A
visitor will reasonably read her as Laila Care staff, and the caption is the only thing
saying otherwise. The brief (§0.3, §8.3) names this as a trust problem on a site where
people decide whether to let a stranger into a parent's home. The fix is real photography
(`SHOOT_LIST.md`). Until then, keep the caption. My understanding is that EU AI Act
transparency duties for realistic generated images of people apply from August 2026;
please confirm this with a lawyer rather than rely on it.

---

## Open questions (brief §4.4): collect, do not invent

| # | Question | Where it goes | Why it matters |
|---|---|---|---|
| Q1 | Opening hours. Is home nursing on call (7/7, 24h) or office hours? Podiatry consult hours? | `SITE.hours` → shown on contact page + structured data | "Can I call at 9 pm?" is the first question of the anxious visitor |
| Q2 | Who provides the care: names, qualification, one human detail, a real photo | `SITE.staff` → `/over-ons` gets a "Wie u zult zien" section automatically | The single highest-value trust content (brief §13.4) |
| Q3 | RIZIV number(s) for the nurse(s) | `SITE.rizivNursing` | Shows the care is recognised and reimbursable |
| Q4 | Podiatrist: diploma, RIZIV number, diabetic foot care experience | `SITE.rizivPodiatry` → the diabetes section then states it | Without the number, the site can only explain the rule, not say "we qualify" |
| Q5 | Confirmed BTW/KBO number | `SITE.kbo` | See item 2 |
| Q6 | Service area: which towns/postcodes does home nursing cover? | `SITE.serviceArea` | Currently the site says "call us with your address" |
| Q7 | Where do podiatry consults happen: at Hogebrug 26, at home, or both? | podiatry page copy | Materially changes how the page should read |
| Q8 | Is the nursing service conventioned, and does it use the third-party payment scheme (derdebetalersregeling)? | fees page | The glossary explains the term; the site does not yet claim you use it |
| Q9 | Confirm every listed service, especially "3D-zolen" (from the brand board) | `src/content/*.js` | Nothing may be offered that is not offered |
| Q10 | Real fees, if you want them published | `SITE.fees` → a table appears on `/tarieven` | Until then the page explains how coverage works (brief §13.5) |
| Q11 | Social accounts (the lookbook shows Facebook and Instagram icons) | `SITE.social` | Not linked: no accounts were supplied |
| Q12 | Is Hogebrug 26 a practice address or a home address? | contact page wording | Currently labelled neutrally as "Adres" |

---

## Later phases (production to-do)

- **Booking.** Phase 1 is `tel:` and `mailto:` by design. When scheduling arrives, a
  Google-Meet-native scheduler fits the client's existing toolkit; keep the phone primary
  for this audience.
- **Analytics.** None today, so no cookie banner. If added, use an EU-hosted, cookieless
  tool, and update `/juridisch/privacy`.
- **CMS.** If you want to edit the copy yourself, the content is already separated in
  `src/content/nl.js` and `en.js`; a headless CMS can feed the same structure.
- **Custom domain.** See item 1.
