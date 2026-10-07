/* Every pairing the palette can produce, against WCAG 2.2 thresholds.
   4.5 normal text, 3.0 large text (>=24px, or >=18.66px bold) and UI/graphics. */
const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
const lin = c => { c /= 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
const L = h => { const [r, g, b] = hex(h); return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b); };
export const ratio = (a, b) => { const [x, y] = [L(a), L(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
const mix = (a, b, t) => '#' + hex(a).map((c, i) => Math.round(c * t + hex(b)[i] * (1 - t)).toString(16).padStart(2, '0')).join('').toUpperCase();

const P = { blauw: '#1E3A5F', goud: '#D4AF37', grijs: '#E9ECEF', wit: '#FFFFFF' };
const verdict = r => r >= 7 ? 'AAA' : r >= 4.5 ? 'AA' : r >= 3 ? 'AA-large/UI only' : 'FAIL';
if (process.argv[1].endsWith('contrast.mjs')) {
  console.log('Given palette, every pairing:');
  const k = Object.keys(P);
  for (const a of k) for (const b of k) if (a < b) {
    const r = ratio(P[a], P[b]);
    console.log(`  ${a.padEnd(6)} / ${b.padEnd(6)} ${r.toFixed(2).padStart(5)}  ${verdict(r)}`);
  }
  console.log('\nNavy tints for secondary text on white and on grijs (need >= 4.5):');
  for (const t of [0.6, 0.7, 0.75, 0.8, 0.85]) {
    const c = mix(P.blauw, '#FFFFFF', t);
    console.log(`  ${t}  ${c}  on wit ${ratio(c, P.wit).toFixed(2)}  on grijs ${ratio(c, P.grijs).toFixed(2)}`);
  }
  console.log('\nGold darkened toward navy, for a text-safe gold on white:');
  for (const t of [0.7, 0.6, 0.5, 0.45, 0.4]) {
    const c = mix(P.goud, '#000000', t);
    console.log(`  goud x${t} -> ${c}  on wit ${ratio(c, P.wit).toFixed(2)}`);
  }
}
