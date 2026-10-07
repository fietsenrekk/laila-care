/* Laila Care, site script. ~4 KB, no dependencies.
   Everything here is enhancement: the text-size and contrast controls, the menu,
   the map and every word of content work with JavaScript off.

   1. preferences  remember text size + contrast across pages
   2. menu         Escape closes, links close
   3. map          click-to-load OpenStreetMap
   4. settle       below-the-fold content settles in once (y 16px -> 0, 0.8s)
   5. thread       the step line: the logo's swoosh, continued down the page */
(() => {
  const d = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const hasRO = 'ResizeObserver' in window; // read by relayout(), which handlers above section 5 call
  const store = (k, v) => { try { v == null ? localStorage.removeItem(k) : localStorage.setItem(k, v); } catch (e) {} };

  /* ------------------------------------------------ 1. preferences */
  document.querySelectorAll('input[name="ts"]').forEach(r => r.addEventListener('change', () => {
    if (r.value === '1') d.removeAttribute('data-ts'); else d.setAttribute('data-ts', r.value);
    store('lc-ts', r.value === '1' ? null : r.value);
    relayout();
  }));
  const hc = document.getElementById('hc');
  if (hc) hc.addEventListener('change', () => {
    d.setAttribute('data-hc', hc.checked ? '1' : '0');
    store('lc-hc', hc.checked ? '1' : '0');
  });

  /* ------------------------------------------------ 2. menu */
  const menu = document.querySelector('.menu');
  if (menu) {
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && menu.open) { menu.open = false; menu.querySelector('summary').focus(); }
    });
    menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => { menu.open = false; }));
  }

  /* ------------------------------------------------ 3. map: nothing loads before the click */
  const map = document.querySelector('[data-map]');
  if (map) {
    const btn = map.querySelector('.map__btn');
    btn.addEventListener('click', e => {
      e.preventDefault();
      const f = document.createElement('iframe');
      f.src = map.dataset.map;
      f.title = map.dataset.mapTitle;
      f.loading = 'lazy';
      f.referrerPolicy = 'no-referrer';
      map.replaceChildren(f);
      requestAnimationFrame(relayout);
    });
  }

  /* ------------------------------------------------ 4. settle */
  const motionOK = () => !reduce.matches;
  const settle = [...document.querySelectorAll('[data-settle]')];
  if (motionOK() && 'IntersectionObserver' in window) {
    // Only what starts below the fold is ever hidden; the answer paints first.
    // The observer's first callback says where each element is without forcing a
    // synchronous layout (reading getBoundingClientRect here cost a 200ms task at 4x CPU),
    // and the class lands on the element itself, never on <html>, so only it restyles.
    const pending = [];
    const seen = new WeakSet();
    const io = new IntersectionObserver(entries => {
      for (const en of entries) {
        const el = en.target;
        if (!seen.has(el)) {
          seen.add(el);
          if (!en.isIntersecting && en.boundingClientRect.top > (en.rootBounds ? en.rootBounds.height : innerHeight) * 0.92) {
            el.classList.add('is-pending'); pending.push(el);
          } else io.unobserve(el);
          continue;
        }
        if (en.isIntersecting) { el.classList.remove('is-pending'); io.unobserve(el); }
      }
    }, { rootMargin: '0px 0px -8% 0px' });
    settle.forEach(el => io.observe(el));
    // The observer only reports what intersects now: a jump (End key, an anchor
    // link) skips past sections it never sees. Anything at or above the reading
    // line is revealed on scroll too, so nothing can stay hidden behind the reader.
    let queued = false;
    const sweep = () => {
      queued = false;
      for (const el of pending) if (el.classList.contains('is-pending') && el.getBoundingClientRect().top < innerHeight * 0.92) {
        el.classList.remove('is-pending'); io.unobserve(el);
      }
    };
    addEventListener('scroll', () => { if (!queued) { queued = true; requestAnimationFrame(sweep); } }, { passive: true });
    addEventListener('hashchange', sweep);
    addEventListener('beforeprint', () => pending.forEach(el => el.classList.remove('is-pending')));
  }

  /* ------------------------------------------------ 5. the thread
     Anchors are declared in the markup: data-thread="X Y[; X Y]" where X and Y are
     fractions of that element's box, or X is "lane" (the left margin lane) or
     "gap" (the element's horizontal centre). The path leaves the swoosh's left
     tip, runs down the margin lane, crosses into the gap between the two
     disciplines, and ends at the footprint in the contact band. */
  const page = document.querySelector('.page');
  const svg = page && page.querySelector('.thread');
  const path = svg && svg.querySelector('path');
  if (!svg) return;

  let total = 0, shown = 0, target = 0, raf = 0;
  const calm = document.body.hasAttribute('data-calm');

  function anchors() {
    const box = page.getBoundingClientRect();
    const wrap = page.querySelector('.wrap');
    const ws = wrap.getBoundingClientRect(), pad = parseFloat(getComputedStyle(wrap).paddingLeft);
    const lane = Math.max(7, (ws.left + pad) / 2) - box.left;
    const pts = [];
    page.querySelectorAll('[data-thread]').forEach(el => {
      const r = el.getBoundingClientRect();
      if (!r.width && !r.height) return;
      // "gap" anchors only exist while the element really has two columns
      const cols = getComputedStyle(el).gridTemplateColumns.split(' ').filter(Boolean).length;
      el.dataset.thread.split(';').forEach(spec => {
        const [xs, ys] = spec.trim().split(/\s+/);
        if (xs === 'gap' && cols < 2) return;
        const y = r.top - box.top + parseFloat(ys) * r.height;
        const x = xs === 'lane' ? lane : xs === 'gap' ? r.left - box.left + r.width / 2 : r.left - box.left + parseFloat(xs) * r.width;
        pts.push({ x, y, end: el.hasAttribute('data-thread-end') });
      });
    });
    return { pts, lane };
  }

  /* One rule: vertical runs are straight; every change of x is a single soft S
     that finishes exactly at the next anchor, so the crossing happens in the
     whitespace just above it and never runs through a paragraph. */
  function route(pts) {
    let d = `M${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
    for (let i = 1; i < pts.length; i++) {
      const a = pts[i - 1], b = pts[i];
      if (Math.abs(b.x - a.x) < 1) { d += ` L${b.x.toFixed(1)} ${b.y.toFixed(1)}`; continue; }
      const run = Math.min(b.run || 110, Math.max(b.y - a.y, 1));
      const y0 = b.y - run;
      if (y0 > a.y + 0.5) d += ` L${a.x.toFixed(1)} ${y0.toFixed(1)}`;
      const k = run * 0.6;
      d += ` C${a.x.toFixed(1)} ${(y0 + k).toFixed(1)} ${b.x.toFixed(1)} ${(b.y - k).toFixed(1)} ${b.x.toFixed(1)} ${b.y.toFixed(1)}`;
    }
    return d;
  }

  function build() {
    // every layout read first, then the writes: one layout pass, not two
    const h = page.offsetHeight, w = page.offsetWidth;
    const { pts, lane } = anchors();
    svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
    svg.setAttribute('width', w); svg.setAttribute('height', h);
    if (pts.length < 2) { path.setAttribute('d', ''); return; }
    // tip -> lane -> [lane -> gap top, gap bottom -> lane]* -> footprint
    const seq = [pts[0], { x: lane, y: pts[0].y + Math.max(90, innerHeight * 0.14), run: 90 }];
    for (let i = 1; i < pts.length; i++) {
      const p = pts[i];
      if (p.end) { seq.push({ ...p, run: 150 }); break; }
      const prevOnLane = Math.abs(seq[seq.length - 1].x - lane) < 1;
      seq.push({ ...p, run: prevOnLane ? 90 : 0 });
      const next = pts[i + 1];
      // leaving a gap: rejoin the lane below it before the next anchor
      if (next && Math.abs(next.x - p.x) < 1) continue;
      if (Math.abs(p.x - lane) > 1) seq.push({ x: lane, y: p.y + 140, run: 140 });
    }
    path.setAttribute('d', route(seq));
    total = h;
    if (!motionOK()) { shown = target = h; paint(); return; }
    target = Math.max(target, readLine());
    // The first build lands already drawn to the reading position: the line only
    // animates in response to the visitor's scroll, never as a load-time effect.
    if (!built) { shown = target; built = true; paint(); return; }
    shown = Math.min(shown, target);
    paint();
    tick();
  }
  let built = false;

  /* The line is revealed by a clip that grows downward, not by stroke-dashoffset:
     a dash change re-rasterises the whole path every frame (measured +3-5ms p95 at
     4x CPU), a clip change does not. The route only ever moves down the page, so a
     downward reveal reads as drawing. */
  const readLine = () => scrollY + innerHeight * 0.8 - (page.getBoundingClientRect().top + scrollY);
  const paint = () => {
    svg.style.clipPath = shown >= total ? 'none' : `inset(0 0 ${Math.max(0, total - shown).toFixed(0)}px 0)`;
    window.__lcThread = { shown, total };
  };
  function tick() {
    cancelAnimationFrame(raf);
    const k = calm ? 0.06 : 0.11;
    const loop = () => {
      const diff = target - shown;
      if (Math.abs(diff) < 0.5) { shown = target; paint(); return; }
      shown += diff * k;
      paint();
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
  }
  addEventListener('scroll', () => {
    if (!motionOK() || !total) return;
    // the line only ever draws forward; it does not un-draw when scrolling back
    const y = Math.min(total, readLine());
    if (y > target + 1) { target = y; tick(); }
  }, { passive: true });

  // The line is rebuilt inside the ResizeObserver callback: it runs right after
  // layout, so reading positions there is free (a timer-driven build forced a
  // synchronous reflow). Every change that moves an anchor (fonts swapping in,
  // the text-size control, a resize, an opened <details>, the map) changes the
  // page's size, so the observer alone covers them.
  let t = 0;
  function relayout() { if (hasRO) return; clearTimeout(t); t = setTimeout(build, 80); }
  if (hasRO) new ResizeObserver(build).observe(page);
  else { addEventListener('resize', relayout); addEventListener('load', relayout); }
  reduce.addEventListener && reduce.addEventListener('change', () => { built = false; build(); });
})();
