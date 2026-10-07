# Shoot list: real photography to replace the generated images

The site ships three generated images, captioned as such (`CLIENT_ACTIONS.md`). Each one
below has a slot already built at the right aspect ratio, so a real photo drops in by
replacing the source file and running `node tools/images.mjs && npm run build`.

Consent: written consent from everyone pictured, for use on the public website. No real
patient may be identifiable without explicit, informed consent. Use a family member or a
staff member as the "patient" (feet and hands only is fine).

| # | Slot | Shows | Aspect / min size | Light and grade notes | Why |
|---|---|---|---|---|---|
| 1 | Home hero (`hero-caregiver`) | The real podiatrist or nurse at work, face visible, in the navy uniform | 2.42:1 (desktop) and 1.24:1 crop (phone) · ≥ 3840 px long edge | Soft window light from the left, white or light-grey wall, plant allowed. Expose for skin. The darkest-skinned subject sets the exposure. | Replaces a generated person in Laila Care uniform. The biggest trust gain on the site |
| 2 | Podiatry band (`podologie-closeup`) | Gloved hands treating a nail, real instruments | 2.9:1 and 1.44:1 crop · ≥ 2560 px | Clinical but warm. Avoid blue-cast LED; daylight-balanced | Real equipment, real room |
| 3 | Home nursing band (`interior`) | A real patient's home or a staged living room in the region, no people, or hands only | 3:1 and 1.27:1 crop · ≥ 2560 px | Late-morning daylight; keep it lived-in, not a showroom | "The care comes to you" |
| 4 | Over ons, staff portraits (new slot) | Each care provider, head and shoulders, plain background | 4:5 · ≥ 2560 px | Same background and light for everyone | Unlocks the "Wie u zult zien" section (`SITE.staff`) |
| 5 | Contact (optional) | The front of Hogebrug 26, if it is where consults happen | 3:2 · ≥ 2560 px | Overcast daylight, no cars | Helps people recognise the address on arrival |

Delivery: original files (RAW or highest-quality JPEG). The pipeline grades them, strips
EXIF/GPS, and checks skin-tone drift numerically before anything is published
(`tools/images.mjs`).
