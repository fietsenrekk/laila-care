/**
 * The single source of business facts. Every page, the structured data and the
 * placeholder-leak gate read from here. A value that is not confirmed is null,
 * and the templates render nothing for it. Nothing here is guessed.
 *
 * Confirmed (brief §4.1, supplied by the client):
 *   name, legal form, address, phone, e-mail, tagline.
 * Verified independently:
 *   address: OpenStreetMap has a building at Hogebrug 26, 9280 Denderbelle
 *   (way 1441917366), geo below is that building's centroid. 2026-10-07.
 * Known problem:
 *   lailacare.be does not resolve (NXDOMAIN on three resolvers, no MX record,
 *   2026-10-07). Mail to info@lailacare.be bounces until the domain is
 *   registered. Shown anyway at the studio's decision, phone is primary.
 */
export const SITE = {
  name: 'Laila Care',
  legalName: 'Laila Care V.O.F.',
  legalForm: 'V.O.F.',
  tagline: { nl: 'Samen voor gezonde stappen', en: 'Together, for healthy steps' },

  phone: { display: '0499 43 06 54', intl: '+32 499 43 06 54', href: 'tel:+32499430654' },
  email: { address: 'info@lailacare.be', href: 'mailto:info@lailacare.be', show: true, domainLive: false },
  address: {
    street: 'Hogebrug 26', postalCode: '9280', locality: 'Denderbelle', municipality: 'Lebbeke',
    region: 'Oost-Vlaanderen', country: 'BE',
    geo: { lat: 51.0053464, lon: 4.0900093 },
  },

  // Not supplied. Collect, do not invent (CLIENT_ACTIONS.md).
  kbo: null,            // ondernemingsnummer / BTW, legally required on the site
  hours: null,          // [{ days: ['Mo',...], opens: '09:00', closes: '17:00' }]
  rizivNursing: null,   // RIZIV-nummer verpleegkundige(n)
  rizivPodiatry: null,  // RIZIV-nummer podoloog
  staff: [],            // [{ name, role, credentials, bio, photo }]
  serviceArea: null,    // ['Denderbelle', 'Lebbeke', ...]
  fees: null,           // set only when the client confirms real figures
  social: [],           // the lookbook shows Facebook/Instagram icons; no accounts supplied

  // Imagery is generated (studio decision, 2026-10-07). Caption shown on every photo.
  imageCaption: { nl: 'Illustratief beeld, digitaal gemaakt', en: 'Illustrative image, digitally created' },

  // Deploy target. Canonical points here until lailacare.be exists.
  origin: 'https://fietsenrekk.github.io',
  basePath: '/laila-care',
};

/**
 * Strings that exist only in the lookbook mockup. Any of these in dist/ fails
 * the build (brief §3.2). Phone and BTW are invalid placeholders; the address
 * is not the practice's; the sentences are mockup filler.
 */
export const LOOKBOOK_LEAKS = [
  '46 54 37 073', '465437073', '+32 46 54', 'Minnestraat', '0756', '123.456', '0756.123.456',
  'Afspraak maken', 'Maak een afspraak', 'Verzenden', 'Stuur ons een bericht',
  'Uw gezondheid en comfort zijn onze prioriteit', 'Zorg met hart en expertise',
  'Professionele zorg dicht bij u', 'Alles voor uw gezondheid', 'Mensgerichte zorg',
  'Wij nemen de tijd, luisteren naar uw noden', 'met oog voor uw comfort en welzijn',
  'met de grootste zorg voor uw gezondheid', 'waarbij u centraal staat',
  'Betrouwbaar', 'Deskundig', 'Wij helpen u graag verder', 'Alle rechten voorbehouden',
];
