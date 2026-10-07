# Content sources

Every factual statement on the site and where it comes from. Anything not listed here is
either plain description of the client's own supplied facts or a general statement a
reader can check.

| Statement on the site | Source | Checked |
|---|---|---|
| Name, legal form (V.O.F.), address, phone, e-mail, tagline | Supplied by the client (brief §4.1) | Address verified on OpenStreetMap (way 1441917366); phone format valid; e-mail domain **not live** (FINDINGS F-001) |
| Services: wondzorg, injecties en medicatie, persoonlijke verzorging, begeleiding; voetonderzoek, nagelproblemen, eelt en likdoorns, 3D-zolen en steunzolen | Client brand board (lookbook) | Not independently verifiable → CLIENT_ACTIONS Q9 |
| Since 1 Nov 2025, most nursing acts at home (wound care, injections) need no doctor's prescription; medication still does | VRT NWS, "Nieuw op 1 november", 29 Oct 2025, https://www.vrt.be/vrtnws/nl/2025/10/29/nieuw-op-1-november-thuisverpleging-euthanasie/ | 2026-10-07 |
| Hygienic care is assessed on the Katz scale, which sets how often it is reimbursed | RIZIV/INAMI nursing nomenclature; Wit-Gele Kruis, "Hygiënische zorg" | 2026-10-07 |
| Diabetes: 2 reimbursed podiatry sessions/year of 45 min, in a type 2 care trajectory, start trajectory or diabetes programme, with raised foot risk, on prescription, by a podiatrist with a RIZIV number | RIZIV, "Diabetes: terugbetaling van uw diëtetiek- en podologische sessies", https://www.inami.fgov.be/nl/thema-s/verzorging-kosten-en-terugbetaling/ziekten/diabetes-terugbetaling-van-verschillende-begeleidingen/diabetes-terugbetaling-van-uw-dietetiek-en-podologische-sessies | 2026-10-07 |
| Podiatry is a recognised paramedical profession in Belgium with a bachelor's programme | General knowledge (Belgian paramedical professions framework); not specific to the client | Stable fact, not re-fetched |
| Some health insurers contribute to podiatry via supplementary insurance | General, phrased as "sommige" and "vraag het na" | Not specific to any insurer |
| Diabetes can reduce sensation and circulation in the feet | General medical knowledge, non-promotional | Stable fact |
| Nurses and podiatrists are bound by professional secrecy | Belgian criminal code (beroepsgeheim) | Stable fact |
| RIZIV = Rijksinstituut voor ziekte- en invaliditeitsverzekering, INAMI in French | Institutional name | Stable fact |
| Derdebetalersregeling, remgeld: definitions | General Belgian health-insurance terms; the site does not claim Laila Care uses third-party payment | → CLIENT_ACTIONS Q8 |

Register: "u" throughout, plain words, no superlatives, no outcome claims, no comparisons.
`tools/check.mjs` gate 3 fails the build on claim phrases ("de beste", "garantie",
"pijnloos", "100%", "toonaangevend"…) and on any euro figure while `SITE.fees` is null.
