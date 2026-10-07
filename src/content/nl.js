/* Dutch (primary). Register: u, plain words, no superlatives, no outcome claims
   (Belgian advertising rules for regulated care professions, brief §13.3).
   Every reimbursement statement is sourced; sources are listed in docs/CONTENT-SOURCES.md.
   Anything unconfirmed renders only when its config value is set. */

export const UI = {
  lang: 'nl', locale: 'nl_BE', displaySettings: 'Weergave', skip: 'Naar de inhoud',
  textSize: 'Tekstgrootte', textSizeShort: 'Tekst', contrastShort: 'Contrast', sizes: ['Normale tekst', 'Grotere tekst', 'Grootste tekst'],
  contrast: 'Hoog contrast', on: 'aan', off: 'uit',
  menu: 'Menu', close: 'Sluiten', mainNav: 'Hoofdnavigatie', footNav: 'Voettekst',
  call: 'Bel', callLong: 'Bel', mail: 'Mail', otherLang: 'English', otherLangShort: 'EN',
  otherLangLabel: 'This page in English',
  reachEyebrow: 'Contact',
  reachTitle: 'Bel of mail Laila Care',
  reachText: 'Bellen is de snelste weg. U mag ook bellen voor iemand anders: een ouder, een partner, een buur.',
  phone: 'Telefoon', email: 'E-mail', address: 'Adres', route: 'Route plannen',
  legal: 'Juridisch', privacy: 'Privacy', a11y: 'Toegankelijkheid',
  imageNote: 'Foto’s op deze website zijn illustratieve beelden, digitaal gemaakt.',
  mapButton: 'Toon de kaart',
  mapNote: 'De kaart komt van OpenStreetMap en wordt pas geladen als u op de knop drukt.',
  mapTitle: 'Kaart: Hogebrug 26, Denderbelle',
};

export const NAV = [
  ['home', 'Home'], ['about', 'Over ons'], ['nursing', 'Thuisverpleging'],
  ['podiatry', 'Podologie'], ['fees', 'Tarieven'], ['contact', 'Contact'],
];

export const ROUTES = {
  home: '/', about: '/over-ons/', nursing: '/thuisverpleging/', podiatry: '/podologie/',
  fees: '/tarieven/', contact: '/contact/', privacy: '/juridisch/privacy/',
  a11y: '/juridisch/toegankelijkheid/', notFound: '/404.html',
};

/* acts shared by the home overview and the service pages */
const NURSING_ACTS = [
  ['Wondzorg', 'Verzorgen en opvolgen van wonden: na een operatie, na een val, of wonden die traag genezen.'],
  ['Injecties en medicatie', 'Inspuitingen geven, medicatie klaarzetten en mee opvolgen.'],
  ['Persoonlijke verzorging', 'Hulp bij wassen en aankleden, op de dagen dat het nodig is.'],
  ['Begeleiding en ondersteuning', 'Uitleg bij uw verzorging, en een vast aanspreekpunt voor u en uw familie.'],
];
const PODIATRY_ACTS = [
  ['Voetonderzoek', 'Nagaan waar pijn of klachten vandaan komen: uw voeten, uw stand, uw schoenen.'],
  ['Nagelproblemen', 'Ingegroeide, verdikte of broze nagels, en nagels die u zelf niet meer goed kunt knippen.'],
  ['Eelt en likdoorns', 'Verwijderen van eelt en likdoorns, en zoeken waar de druk vandaan komt.'],
  ['Steunzolen en 3D-zolen', 'Zolen op maat die de druk onder uw voet anders verdelen.'],
];

export const PAGES = {
  home: {
    title: 'Laila Care · Thuisverpleging en podologie in Denderbelle',
    description: 'Laila Care brengt thuisverpleging en podologie onder één dak, vanuit Denderbelle (9280 Lebbeke). Bel 0499 43 06 54.',
    hero: {
      eyebrow: 'Thuisverpleging · Podologie · Denderbelle',
      lead: 'Laila Care brengt thuisverpleging en podologie onder één dak: verzorging bij u thuis, en zorg voor uw voeten. Eén telefoonnummer voor allebei.',
      mailPrefix: 'of mail',
      factsLabel: 'In het kort',
      facts: [['Wat', 'Thuisverpleging en podologie'], ['Waar', 'Hogebrug 26, 9280 Denderbelle']],
      photoAlt: 'Een zorgverlener in een donkerblauw uniform met het Laila Care-logo verzorgt glimlachend de voet van een patiënt.',
    },
    duo: {
      eyebrow: 'Onder één dak',
      title: 'Twee vakken die elkaar vaak nodig hebben',
      text: 'Wie thuis verzorgd wordt, kan vaak zelf niet meer goed bij de voeten. Bij diabetes vragen voeten bovendien extra aandacht. Bij Laila Care zitten thuisverpleging en podologie in één praktijk, dus u hoeft geen tweede adres te zoeken.',
      nursing: { what: 'Verpleegkundige zorg bij u thuis.', acts: NURSING_ACTS, more: 'Alles over thuisverpleging' },
      podiatry: { what: 'Onderzoek, behandeling en preventie van voetklachten.', acts: PODIATRY_ACTS, more: 'Alles over podologie' },
    },
    call: {
      eyebrow: 'Hulp vragen',
      title: 'Het begint met één telefoontje',
      text: 'U belt voor uzelf, of voor uw vader, moeder of partner. Vertel wat er nodig is. We zeggen u wat we kunnen doen en hoe de terugbetaling werkt.',
      listTitle: 'Handig om bij de hand te hebben',
      list: [
        'Naam en adres van wie de zorg nodig heeft',
        'De naam van de huisarts',
        'Een medicatielijst, als die er is',
        'Bij diabetes: of er een zorgtraject of opstarttraject loopt',
      ],
      feesLink: 'Wat kost het? Zo werkt de terugbetaling',
    },
  },

  nursing: {
    title: 'Thuisverpleging in Denderbelle · Laila Care',
    description: 'Wondzorg, injecties, medicatie en persoonlijke verzorging bij u thuis, vanuit Denderbelle. Hoe de terugbetaling via uw ziekenfonds werkt.',
    eyebrow: 'Thuisverpleging',
    h1: 'Verpleging bij u thuis',
    lead: 'U blijft in uw vertrouwde omgeving, de zorg komt naar u. Vanuit Denderbelle.',
    photoAlt: 'Een lichte woonkamer met planten bij het raam en een zetel.',
    acts: NURSING_ACTS,
    actsTitle: 'Wat we bij u thuis doen',
    payTitle: 'Hoe de terugbetaling werkt',
    pay: [
      'Verpleegkundige zorg aan huis wordt terugbetaald door uw <a href="{fees}#ziekenfonds">ziekenfonds</a>, volgens de regels van het <a href="{fees}#riziv">RIZIV</a>.',
      'Sinds 1 november 2025 hebt u voor de meeste verpleegkundige handelingen, zoals wondzorg en inspuitingen, geen voorschrift van de arts meer nodig. Voor medicatie blijft een voorschrift nodig.',
      'Voor hulp bij wassen en aankleden kijkt de verpleegkundige met een vaste schaal, de <a href="{fees}#katz">Katz-schaal</a>, hoeveel hulp u nodig hebt. Daarvan hangt af hoe vaak die verzorging terugbetaald wordt.',
      'Wat u zelf betaalt, hangt af van uw situatie. Aan de telefoon overlopen we het samen.',
    ],
    termTitle: 'Wat is het RIZIV?',
    term: 'Het Rijksinstituut voor ziekte- en invaliditeitsverzekering. Het legt vast welke zorg terugbetaald wordt en hoeveel. Uw ziekenfonds (mutualiteit) betaalt dat bedrag dan uit. In het Frans heet het INAMI.',
    faqTitle: 'Goed om te weten',
    faq: [
      ['Moet ik eerst naar de huisarts?', 'Voor de meeste verpleegkundige zorg niet meer: sinds 1 november 2025 is voor handelingen zoals wondzorg en inspuitingen geen voorschrift nodig. Gaat het om medicatie, dan schrijft uw arts die voor.'],
      ['Mag ik bellen voor iemand anders?', 'Ja. Veel mensen bellen voor een ouder of partner. Zeg erbij wie de zorg nodig heeft en wie we best contacteren.'],
      ['Komen jullie ook bij mij in de buurt?', 'Laila Care werkt vanuit Denderbelle. Geef ons uw adres aan de telefoon, dan weet u meteen of we bij u langs kunnen komen.'],
      ['Ik heb ook last van mijn voeten.', 'Dan hoeft u niet verder te zoeken: Laila Care doet ook <a href="{podiatry}">podologie</a>.'],
    ],
  },

  podiatry: {
    title: 'Podologie in Denderbelle · Laila Care',
    description: 'Voetonderzoek, nagelproblemen, eelt en likdoorns, steunzolen. Voetzorg bij diabetes en hoe de RIZIV-terugbetaling daarvoor werkt.',
    eyebrow: 'Podologie',
    h1: 'Zorg voor uw voeten',
    lead: 'Voor pijnlijke voeten, lastige nagels, eelt en likdoorns. En voor wie met diabetes extra op zijn voeten moet letten.',
    photoAlt: 'Close-up: een hand in een blauwe handschoen verzorgt met een frees de teennagel van een voet.',
    acts: PODIATRY_ACTS,
    actsTitle: 'Wat de podoloog doet',
    diabetesTitle: 'Diabetes en uw voeten',
    diabetes: [
      'Diabetes kan het gevoel in uw voeten verminderen en de doorbloeding verzwakken. Een wondje of een drukplek valt dan minder snel op. Een podoloog kijkt uw voeten regelmatig na, zodat problemen vroeg gezien worden.',
    ],
    refundTitle: 'Terugbetaling bij diabetes',
    refund: [
      'Volgt u een zorgtraject of opstarttraject diabetes type 2, of een diabetesprogramma, en hebt u een verhoogd risico op voetproblemen? Dan voorziet het RIZIV twee terugbetaalde sessies podologie per jaar, van elk 45 minuten.',
      'Daarvoor hebt u een voorschrift van uw arts nodig, en de podoloog moet een RIZIV-nummer hebben.',
      'Vraag ons gerust hoe dat voor u zit.',
    ],
    refundRiziv: 'De podoloog van Laila Care heeft RIZIV-nummer {riziv}.',
    refundSource: 'Bron: RIZIV, “Diabetes: terugbetaling van uw diëtetiek- en podologische sessies”.',
    faqTitle: 'Goed om te weten',
    faq: [
      ['Is een podoloog hetzelfde als een pedicure?', 'Nee. Podoloog is in België een erkend paramedisch beroep, met een bacheloropleiding. Een pedicure verzorgt voeten; een podoloog onderzoekt en behandelt voetklachten.'],
      ['Betaalt het ziekenfonds podologie terug?', 'Buiten de diabetesregeling hierboven betaalt u podologie in principe zelf. Sommige ziekenfondsen geven via hun aanvullende verzekering een tegemoetkoming. Vraag het na bij uw ziekenfonds.'],
      ['Wordt u ook thuis verzorgd?', 'Laila Care doet ook <a href="{nursing}">thuisverpleging</a>. Zeg het gerust als u belt.'],
    ],
  },

  fees: {
    title: 'Tarieven en terugbetaling · Laila Care',
    description: 'Hoe de terugbetaling werkt voor thuisverpleging en podologie in België, in gewone woorden: RIZIV, ziekenfonds, derdebetalersregeling, Katz-schaal.',
    eyebrow: 'Tarieven',
    h1: 'Wat kost het?',
    lead: 'Dat hangt af van uw situatie en van wat uw ziekenfonds terugbetaalt. Hieronder staat hoe dat werkt. De kosten voor u bespreken we aan de telefoon.',
    nursingTitle: 'Thuisverpleging',
    nursing: [
      'Wordt terugbetaald door uw ziekenfonds, volgens de regels van het RIZIV.',
      'Sinds 1 november 2025 is voor de meeste verpleegkundige handelingen geen voorschrift meer nodig. Voor medicatie wel.',
      'Hoe vaak hulp bij wassen en aankleden terugbetaald wordt, hangt af van de Katz-schaal.',
    ],
    podiatryTitle: 'Podologie',
    podiatry: [
      'Betaalt u in principe zelf.',
      'Bij diabetes, in een zorgtraject, opstarttraject of diabetesprogramma en met een verhoogd voetrisico: twee terugbetaalde sessies per jaar, op voorschrift.',
      'Sommige ziekenfondsen geven via hun aanvullende verzekering een tegemoetkoming.',
    ],
    tableTitle: 'Tarieven',
    glossaryTitle: 'Woorden die u zult horen',
    glossaryIntro: 'Zorg en terugbetaling hebben hun eigen woorden. Dit is wat ze betekenen.',
    glossary: [
      ['riziv', 'RIZIV', 'Het Rijksinstituut voor ziekte- en invaliditeitsverzekering. Het legt vast welke zorg terugbetaald wordt en hoeveel. In het Frans: INAMI.'],
      ['ziekenfonds', 'Ziekenfonds (mutualiteit)', 'Uw ziekenfonds betaalt het deel van de zorg terug dat het RIZIV vastlegt, aan u of rechtstreeks aan de zorgverlener.'],
      ['derdebetaler', 'Derdebetalersregeling', 'De zorgverlener rekent het terugbetaalde deel rechtstreeks af met uw ziekenfonds. U betaalt dan alleen wat niet terugbetaald wordt, en u hoeft niets voor te schieten.'],
      ['remgeld', 'Remgeld', 'Het deel van de prijs dat u zelf betaalt, ook na de terugbetaling.'],
      ['katz', 'Katz-schaal', 'Een vaste schaal waarmee de verpleegkundige inschat hoeveel hulp u nodig hebt, bijvoorbeeld bij wassen, aankleden en eten. Ze bepaalt hoe vaak verzorging terugbetaald wordt.'],
      ['voorschrift', 'Voorschrift', 'Een schriftelijke opdracht van uw arts. Sinds 1 november 2025 is die voor de meeste verpleegkundige handelingen aan huis niet meer nodig; voor medicatie wel.'],
      ['zorgtraject', 'Zorgtraject diabetes', 'Een afspraak tussen u, uw huisarts en een specialist om diabetes type 2 op te volgen. Het geeft onder voorwaarden recht op terugbetaalde sessies bij onder meer de podoloog.'],
    ],
  },

  about: {
    title: 'Over Laila Care · Thuisverpleging en podologie',
    description: 'Laila Care is een V.O.F. uit Denderbelle die thuisverpleging en podologie samenbrengt. Waarom die twee samen horen.',
    eyebrow: 'Over ons',
    h1: 'Over Laila Care',
    lead: 'Laila Care is een vennootschap onder firma (V.O.F.) uit Denderbelle die thuisverpleging en podologie samenbrengt.',
    whyTitle: 'Waarom die twee samen',
    why: [
      'Thuisverpleging en podologie lijken twee aparte vakken. In de praktijk raken ze elkaar vaak. Wie thuis verzorgd wordt, kan zelf vaak niet meer bij de voeten. Een wonde aan de voet is zowel wondzorg als voetzorg. En bij diabetes zijn regelmatige voetcontroles deel van de opvolging.',
      'Daarom horen ze bij Laila Care samen: één praktijk, één telefoonnummer.',
    ],
    markTitle: 'Het teken',
    mark: [
      'In het logo van Laila Care staat een voetafdruk op een golvende lijn, onder de letters L en C. Die lijn loopt op deze website door, van boven tot onderaan elke pagina, en eindigt bij de voetafdruk naast onze contactgegevens.',
      '“Samen voor gezonde stappen” zegt hetzelfde in woorden.',
    ],
    trustTitle: 'Zorg die geregeld is',
    trust: [
      'Verpleegkundigen en podologen oefenen in België een wettelijk erkend zorgberoep uit. Wat u met hen deelt over uw gezondheid, valt onder het beroepsgeheim.',
    ],
    staffTitle: 'Wie u zult zien',
  },

  contact: {
    title: 'Contact · Laila Care, Denderbelle',
    description: 'Bel Laila Care op 0499 43 06 54 of mail info@lailacare.be. Hogebrug 26, 9280 Denderbelle.',
    eyebrow: 'Contact',
    h1: 'Contact',
    lead: 'Bellen is de snelste weg. U mag ook mailen.',
    company: 'Ondernemingsgegevens',
    kbo: 'Ondernemingsnummer',
  },

  privacy: {
    title: 'Privacy · Laila Care',
    description: 'Welke gegevens deze website verwerkt: bijna geen. Geen cookies, geen analytics, geen formulieren.',
    h1: 'Privacy',
    body: [
      ['Kort', 'Deze website verzamelt geen persoonsgegevens. Er zijn geen cookies, geen bezoekersstatistieken, geen formulieren en geen advertenties.'],
      ['Uw instellingen', 'Kiest u een grotere tekst of hoog contrast, dan onthoudt uw eigen browser die keuze (in de lokale opslag). Die keuze verlaat uw toestel niet.'],
      ['De kaart', 'Op de contactpagina staat een kaart van OpenStreetMap. Die wordt pas geladen als u op de knop drukt. Pas dan maakt uw browser verbinding met OpenStreetMap, dat dan uw IP-adres ziet. Zie het privacybeleid van de OpenStreetMap Foundation.'],
      ['Hosting', 'De website staat op GitHub Pages. Zoals elke webserver registreert GitHub technische gegevens zoals uw IP-adres om de dienst te laten werken en te beveiligen.'],
      ['Als u ons contacteert', 'Belt of mailt u ons, dan gebruiken we uw gegevens alleen om u te helpen. Gezondheidsgegevens vallen onder het beroepsgeheim.'],
      ['Vragen', 'Over uw gegevens kunt u ons altijd bellen of mailen.'],
    ],
  },

  a11y: {
    title: 'Toegankelijkheid · Laila Care',
    description: 'Hoe deze website toegankelijk gemaakt is: tekstgrootte, hoog contrast, toetsenbord, schermlezers.',
    h1: 'Toegankelijkheid',
    body: [
      ['Wat u zelf kunt instellen', 'Bovenaan elke pagina kiest u de tekstgrootte (drie stappen) en hoog contrast. Dat werkt ook zonder JavaScript; met JavaScript onthoudt uw browser de keuze. Hoog contrast gaat ook vanzelf aan als u dat in uw toestel hebt ingesteld.'],
      ['Wat we nastreven', 'Deze website volgt de richtlijnen WCAG 2.2 op niveau AA. Elke pagina wordt automatisch getest met axe-core. Alle teksten halen een kleurcontrast van minstens 4,5 tot 1.'],
      ['Toetsenbord en schermlezer', 'Alles werkt met het toetsenbord, met een zichtbare focus. Er is een link om meteen naar de inhoud te springen. Afbeeldingen hebben een beschrijving.'],
      ['Beweging', 'De gouden lijn die over de pagina loopt, tekent zich mee terwijl u scrolt. Hebt u in uw toestel “minder beweging” gekozen, dan staat de lijn er meteen helemaal en beweegt er niets.'],
      ['Iets werkt niet?', 'Laat het ons weten via telefoon of e-mail, dan bekijken we het.'],
    ],
  },

  notFound: {
    title: 'Pagina niet gevonden · Laila Care',
    description: 'Deze pagina bestaat niet. Vind de weg terug naar Laila Care, thuisverpleging en podologie in Denderbelle.',
    h1: 'Deze pagina bestaat niet',
    lead: 'Misschien is het adres veranderd. Hieronder vindt u de weg terug, of bel ons meteen.',
    home: 'Naar de startpagina',
  },
};
