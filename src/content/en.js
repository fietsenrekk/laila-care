/* English (secondary). Same facts, same restraint as nl.js. Belgian terms keep
   their Dutch names with an English explanation, because those are the words a
   visitor will hear on the phone and see on paperwork. */

export const UI = {
  lang: 'en', locale: 'en_GB', displaySettings: 'Display settings', skip: 'Skip to content',
  textSize: 'Text size', textSizeShort: 'Text', contrastShort: 'Contrast', sizes: ['Normal text', 'Larger text', 'Largest text'],
  contrast: 'High contrast', on: 'on', off: 'off',
  menu: 'Menu', close: 'Close', mainNav: 'Main navigation', footNav: 'Footer',
  call: 'Call', callLong: 'Call', mail: 'Email', otherLang: 'Nederlands', otherLangShort: 'NL',
  otherLangLabel: 'Deze pagina in het Nederlands',
  reachEyebrow: 'Contact',
  reachTitle: 'Call or email Laila Care',
  reachText: 'Calling is the quickest way. You are welcome to call for someone else: a parent, a partner, a neighbour.',
  phone: 'Phone', email: 'Email', address: 'Address', route: 'Get directions',
  legal: 'Legal', privacy: 'Privacy', a11y: 'Accessibility',
  imageNote: 'Photographs on this website are illustrative images, digitally created.',
  mapButton: 'Show the map',
  mapNote: 'The map comes from OpenStreetMap and only loads when you press the button.',
  mapTitle: 'Map: Hogebrug 26, Denderbelle',
};

export const NAV = [
  ['home', 'Home'], ['about', 'About'], ['nursing', 'Home nursing'],
  ['podiatry', 'Podiatry'], ['fees', 'Fees'], ['contact', 'Contact'],
];

export const ROUTES = {
  home: '/en/', about: '/en/about/', nursing: '/en/home-nursing/', podiatry: '/en/podiatry/',
  fees: '/en/fees/', contact: '/en/contact/', privacy: '/en/legal/privacy/',
  a11y: '/en/legal/accessibility/', notFound: '/404.html',
};

const NURSING_ACTS = [
  ['Wound care', 'Dressing and following up wounds: after surgery, after a fall, or wounds that are slow to heal.'],
  ['Injections and medication', 'Giving injections, preparing medication and helping keep track of it.'],
  ['Personal care', 'Help with washing and dressing, on the days it is needed.'],
  ['Guidance and support', 'Explaining your care, and one point of contact for you and your family.'],
];
const PODIATRY_ACTS = [
  ['Foot examination', 'Finding where pain or problems come from: your feet, your posture, your shoes.'],
  ['Nail problems', 'Ingrown, thickened or brittle nails, and nails you can no longer cut well yourself.'],
  ['Calluses and corns', 'Removing calluses and corns, and finding where the pressure comes from.'],
  ['Insoles and 3D-printed insoles', 'Made-to-measure insoles that spread the pressure under your foot differently.'],
];

export const PAGES = {
  home: {
    title: 'Laila Care · Home nursing and podiatry in Denderbelle',
    description: 'Laila Care brings home nursing and podiatry under one roof, from Denderbelle, Belgium (9280 Lebbeke). Call +32 499 43 06 54.',
    hero: {
      eyebrow: 'Home nursing · Podiatry · Denderbelle',
      lead: 'Laila Care brings home nursing and podiatry under one roof: care in your own home, and care for your feet. One phone number for both.',
      mailPrefix: 'or email',
      factsLabel: 'In short',
      facts: [['What', 'Home nursing and podiatry'], ['Where', 'Hogebrug 26, 9280 Denderbelle, Belgium']],
      photoAlt: 'A carer in a dark blue uniform with the Laila Care logo smiles while treating a patient’s foot.',
    },
    duo: {
      eyebrow: 'Under one roof',
      title: 'Two kinds of care that often go together',
      text: 'People who are cared for at home often can no longer reach their own feet. With diabetes, feet need extra attention too. At Laila Care, home nursing and podiatry are one practice, so there is no second address to find.',
      nursing: { what: 'Nursing care in your own home.', acts: NURSING_ACTS, more: 'All about home nursing' },
      podiatry: { what: 'Examining, treating and preventing foot problems.', acts: PODIATRY_ACTS, more: 'All about podiatry' },
    },
    call: {
      eyebrow: 'Asking for help',
      title: 'It starts with one phone call',
      text: 'You call for yourself, or for your father, mother or partner. Tell us what is needed. We will tell you what we can do and how reimbursement works.',
      listTitle: 'Useful to have at hand',
      list: [
        'Name and address of the person who needs care',
        'The name of their GP',
        'A list of medication, if there is one',
        'With diabetes: whether a care or start trajectory is in place',
      ],
      feesLink: 'What does it cost? How reimbursement works',
    },
  },

  nursing: {
    title: 'Home nursing in Denderbelle · Laila Care',
    description: 'Wound care, injections, medication and personal care in your own home, from Denderbelle. How reimbursement through your health insurer works.',
    eyebrow: 'Home nursing',
    h1: 'Nursing in your own home',
    lead: 'You stay where you feel at home, and the care comes to you. From Denderbelle.',
    photoAlt: 'A bright living room with plants by the window and an armchair.',
    acts: NURSING_ACTS,
    actsTitle: 'What we do in your home',
    payTitle: 'How reimbursement works',
    pay: [
      'Nursing care at home is reimbursed by your <a href="{fees}#ziekenfonds">health insurer (ziekenfonds)</a>, under the rules of the <a href="{fees}#riziv">RIZIV</a>.',
      'Since 1 November 2025 you no longer need a doctor’s prescription for most nursing procedures, such as wound care and injections. Medication still needs a prescription.',
      'For help with washing and dressing, the nurse uses a fixed scale, the <a href="{fees}#katz">Katz scale</a>, to assess how much help you need. That determines how often this care is reimbursed.',
      'What you pay yourself depends on your situation. We go through it together on the phone.',
    ],
    termTitle: 'What is the RIZIV?',
    term: 'The Belgian National Institute for Health and Disability Insurance. It sets which care is reimbursed and by how much; your health insurer (ziekenfonds or mutualiteit) then pays it out. In French it is called INAMI.',
    faqTitle: 'Good to know',
    faq: [
      ['Do I need to see my GP first?', 'For most nursing care, no longer: since 1 November 2025 procedures such as wound care and injections need no prescription. Medication is still prescribed by your doctor.'],
      ['Can I call on behalf of someone else?', 'Yes. Many people call for a parent or partner. Tell us who needs the care and who we should contact.'],
      ['Do you come to my area?', 'Laila Care works from Denderbelle. Give us your address on the phone and you will know straight away whether we can visit you.'],
      ['My feet are troubling me too.', 'Then there is no need to look further: Laila Care also offers <a href="{podiatry}">podiatry</a>.'],
    ],
  },

  podiatry: {
    title: 'Podiatry in Denderbelle · Laila Care',
    description: 'Foot examination, nail problems, calluses and corns, insoles. Foot care with diabetes and how RIZIV reimbursement for it works.',
    eyebrow: 'Podiatry',
    h1: 'Care for your feet',
    lead: 'For painful feet, troublesome nails, calluses and corns. And for anyone with diabetes who needs to watch their feet more closely.',
    photoAlt: 'Close-up: a hand in a blue glove treats a toenail with a rotary file.',
    acts: PODIATRY_ACTS,
    actsTitle: 'What the podiatrist does',
    diabetesTitle: 'Diabetes and your feet',
    diabetes: [
      'Diabetes can reduce the feeling in your feet and weaken circulation. A small wound or a pressure spot is then noticed later. A podiatrist checks your feet regularly, so problems are seen early.',
    ],
    refundTitle: 'Reimbursement with diabetes',
    refund: [
      'Are you in a type 2 diabetes care trajectory (zorgtraject) or start trajectory (opstarttraject), or a diabetes programme, with a raised risk of foot problems? Then the RIZIV provides two reimbursed podiatry sessions a year, of 45 minutes each.',
      'You need a prescription from your doctor, and the podiatrist must have a RIZIV number.',
      'Feel free to ask us how this applies to you.',
    ],
    refundRiziv: 'Laila Care’s podiatrist has RIZIV number {riziv}.',
    refundSource: 'Source: RIZIV, “Diabetes: terugbetaling van uw diëtetiek- en podologische sessies”.',
    faqTitle: 'Good to know',
    faq: [
      ['Is a podiatrist the same as a pedicurist?', 'No. In Belgium, podiatry (podologie) is a recognised paramedical profession with a bachelor’s degree. A pedicurist cares for feet; a podiatrist examines and treats foot problems.'],
      ['Does my health insurer pay for podiatry?', 'Outside the diabetes arrangement above, you normally pay for podiatry yourself. Some health insurers contribute through their supplementary insurance. Ask your health insurer.'],
      ['Are you also cared for at home?', 'Laila Care also offers <a href="{nursing}">home nursing</a>. Just mention it when you call.'],
    ],
  },

  fees: {
    title: 'Fees and reimbursement · Laila Care',
    description: 'How reimbursement works for home nursing and podiatry in Belgium, in plain words: RIZIV, ziekenfonds, third-party payment, Katz scale.',
    eyebrow: 'Fees',
    h1: 'What does it cost?',
    lead: 'That depends on your situation and on what your health insurer reimburses. Below is how it works. We discuss your costs on the phone.',
    nursingTitle: 'Home nursing',
    nursing: [
      'Reimbursed by your health insurer, under the rules of the RIZIV.',
      'Since 1 November 2025 most nursing procedures need no prescription. Medication does.',
      'How often help with washing and dressing is reimbursed depends on the Katz scale.',
    ],
    podiatryTitle: 'Podiatry',
    podiatry: [
      'Normally paid by you.',
      'With diabetes, in a care trajectory, start trajectory or diabetes programme and with a raised foot risk: two reimbursed sessions a year, on prescription.',
      'Some health insurers contribute through their supplementary insurance.',
    ],
    tableTitle: 'Fees',
    glossaryTitle: 'Words you will hear',
    glossaryIntro: 'Care and reimbursement in Belgium come with their own words, mostly in Dutch. This is what they mean.',
    glossary: [
      ['riziv', 'RIZIV', 'The National Institute for Health and Disability Insurance. It sets which care is reimbursed and by how much. In French: INAMI.'],
      ['ziekenfonds', 'Ziekenfonds (mutualiteit)', 'Your health insurer. It pays back the part of the cost the RIZIV sets, to you or directly to the care provider.'],
      ['derdebetaler', 'Derdebetalersregeling', 'Third-party payment. The care provider bills the reimbursed part directly to your health insurer. You then only pay what is not reimbursed, and do not have to advance anything.'],
      ['remgeld', 'Remgeld', 'The part of the price you pay yourself, even after reimbursement.'],
      ['katz', 'Katz-schaal', 'The Katz scale. A fixed scale the nurse uses to assess how much help you need, for example with washing, dressing and eating. It determines how often care is reimbursed.'],
      ['voorschrift', 'Voorschrift', 'A prescription from your doctor. Since 1 November 2025 it is no longer needed for most nursing procedures at home; it still is for medication.'],
      ['zorgtraject', 'Zorgtraject diabetes', 'A care trajectory: an agreement between you, your GP and a specialist to follow up type 2 diabetes. Under conditions it gives the right to reimbursed sessions with, among others, the podiatrist.'],
    ],
  },

  about: {
    title: 'About Laila Care · Home nursing and podiatry',
    description: 'Laila Care is a partnership (V.O.F.) from Denderbelle that brings home nursing and podiatry together. Why the two belong together.',
    eyebrow: 'About',
    h1: 'About Laila Care',
    lead: 'Laila Care is a general partnership (V.O.F.) from Denderbelle that brings home nursing and podiatry together.',
    whyTitle: 'Why the two together',
    why: [
      'Home nursing and podiatry look like two separate fields. In practice they meet often. People cared for at home often can no longer reach their own feet. A wound on the foot is both wound care and foot care. And with diabetes, regular foot checks are part of the follow-up.',
      'That is why they belong together at Laila Care: one practice, one phone number.',
    ],
    markTitle: 'The mark',
    mark: [
      'The Laila Care logo has a footprint on a wave-shaped line, beneath the letters L and C. That line continues on this website, from the top to the bottom of every page, and ends at the footprint next to our contact details.',
      '“Samen voor gezonde stappen” (together, for healthy steps) says the same in words.',
    ],
    trustTitle: 'Care that is regulated',
    trust: [
      'In Belgium, nurses and podiatrists practise a legally recognised healthcare profession. What you share with them about your health is covered by professional secrecy.',
    ],
    staffTitle: 'Who you will see',
  },

  contact: {
    title: 'Contact · Laila Care, Denderbelle',
    description: 'Call Laila Care on +32 499 43 06 54 or email info@lailacare.be. Hogebrug 26, 9280 Denderbelle, Belgium.',
    eyebrow: 'Contact',
    h1: 'Contact',
    lead: 'Calling is the quickest way. You can also email.',
    company: 'Company details',
    kbo: 'Company number',
  },

  privacy: {
    title: 'Privacy · Laila Care',
    description: 'What data this website processes: almost none. No cookies, no analytics, no forms.',
    h1: 'Privacy',
    body: [
      ['In short', 'This website collects no personal data. There are no cookies, no visitor statistics, no forms and no advertising.'],
      ['Your settings', 'If you choose larger text or high contrast, your own browser remembers that choice (in local storage). It never leaves your device.'],
      ['The map', 'The contact page has a map from OpenStreetMap. It only loads when you press the button. Only then does your browser connect to OpenStreetMap, which then sees your IP address. See the OpenStreetMap Foundation’s privacy policy.'],
      ['Hosting', 'The website is hosted on GitHub Pages. Like any web server, GitHub records technical data such as your IP address to run and secure the service.'],
      ['If you contact us', 'If you call or email us, we use your details only to help you. Health information is covered by professional secrecy.'],
      ['Questions', 'You can always call or email us about your data.'],
    ],
  },

  a11y: {
    title: 'Accessibility · Laila Care',
    description: 'How this website is made accessible: text size, high contrast, keyboard, screen readers.',
    h1: 'Accessibility',
    body: [
      ['What you can set yourself', 'At the top of every page you can choose the text size (three steps) and high contrast. This works without JavaScript too; with JavaScript your browser remembers the choice. High contrast also switches on by itself if you have set it on your device.'],
      ['What we aim for', 'This website follows the WCAG 2.2 guidelines at level AA. Every page is tested automatically with axe-core. All text reaches a colour contrast of at least 4.5 to 1.'],
      ['Keyboard and screen reader', 'Everything works with the keyboard, with a visible focus. There is a link to jump straight to the content. Images have a description.'],
      ['Motion', 'The gold line running down the page draws itself as you scroll. If you have chosen “reduce motion” on your device, the line is there in full straight away and nothing moves.'],
      ['Something not working?', 'Let us know by phone or email and we will look into it.'],
    ],
  },

  notFound: {
    title: 'Page not found · Laila Care',
    description: 'This page does not exist.',
    h1: 'This page does not exist',
    lead: 'The address may have changed. You can find your way back below, or call us straight away.',
    home: 'To the home page',
  },
};
