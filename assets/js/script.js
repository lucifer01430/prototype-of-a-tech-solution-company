(() => {
  'use strict';

  /* ============================================================
     INTRO — build network SVG + wire skip/enter
  ============================================================ */
  const introSvg = document.getElementById('intro-svg');
  const introEl = document.getElementById('intro');
  const deckEl = document.getElementById('deck');

  function buildIntroNetwork(){
    const W = 1600, H = 900;
    const cx = W/2, cy = H/2;

    // Scattered node positions (hand-placed for a pleasing organic network)
    const positions = [
      [260,180],[420,340],[180,520],[360,620],[560,220],
      [700,460],[520,700],[900,200],[1040,380],[1180,560],
      [960,660],[1300,260],[1360,540],[1200,700]
    ];

    let svgMarkup = '';
    positions.forEach((p, i) => {
      const delay = (0.5 + i*0.32).toFixed(2);
      const r = 4 + (i % 3);
      svgMarkup += `<circle class="inode" cx="${p[0]}" cy="${p[1]}" r="${r}" style="animation-delay:${delay}s"></circle>`;
    });

    // Connecting lines: each node links back to center, progressively
    positions.forEach((p, i) => {
      const delay = (1.1 + i*0.34).toFixed(2);
      svgMarkup += `<line class="iline draw" x1="${p[0]}" y1="${p[1]}" x2="${cx}" y2="${cy}" style="animation-delay:${delay}s"></line>`;
    });

    // A few cross-links between neighboring nodes for network feel
    const crossLinks = [[0,1],[1,2],[2,3],[4,5],[5,6],[7,8],[8,9],[9,10],[11,12],[12,13],[3,6],[10,13]];
    crossLinks.forEach((pair, i) => {
      const a = positions[pair[0]], b = positions[pair[1]];
      const delay = (2.6 + i*0.18).toFixed(2);
      svgMarkup += `<line class="iline draw" x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" style="animation-delay:${delay}s;opacity:.3"></line>`;
    });

    // Central converging core
    svgMarkup += `<circle class="inode inode-core" cx="${cx}" cy="${cy}" r="10" style="animation-delay:5.6s"></circle>`;

    introSvg.innerHTML = svgMarkup;
  }
  buildIntroNetwork();

  let introFinished = false;

  function enterDeck(){
    if (introFinished) return;
    introFinished = true;
    introEl.classList.add('hidden');
    deckEl.classList.add('visible');
    deckEl.setAttribute('aria-hidden', 'false');
    setTimeout(() => { activateSlide(0, true); }, 50);
  }

  document.getElementById('skipIntro').addEventListener('click', enterDeck);
  document.getElementById('enterBtn').addEventListener('click', enterDeck);
  // Auto-advance shortly after the reveal finishes, in case the user doesn't click
  setTimeout(() => {
    if (!introFinished) {
      // Do nothing automatically — wait for explicit user action (Enter/Skip)
      // so the cinematic reveal remains the intentional gateway to the deck.
    }
  }, 9000);

  /* ============================================================
     SLIDE ENGINE
  ============================================================ */
  const slideEls = Array.from(document.querySelectorAll('.slide'));
  const total = slideEls.length;
  let current = 0;
  let isAnimating = false;

  const progressBar = document.getElementById('progressBar');
  const counterCurrent = document.getElementById('counterCurrent');
  const counterTotal = document.getElementById('counterTotal');
  counterTotal.textContent = String(total).padStart(2, '0');

  function activateSlide(index, immediate){
    index = Math.max(0, Math.min(total - 1, index));
    if (index === current && slideEls[current].classList.contains('active') && !immediate) return;

    const prevIndex = current;
    const goingForward = index > prevIndex;

    slideEls.forEach((s, i) => {
      s.classList.remove('active', 'leaving-up', 'leaving-down');
      if (i === prevIndex && i !== index) {
        s.classList.add(goingForward ? 'leaving-up' : 'leaving-down');
      }
    });

    current = index;
    const activeSlide = slideEls[current];
    activeSlide.classList.add('active');

    buildDiagramFor(activeSlide);

    progressBar.style.width = (total > 1 ? (current / (total - 1)) * 100 : 0) + '%';
    counterCurrent.textContent = String(current + 1).padStart(2, '0');
  }

  function nextSlide(){ if (current < total - 1) go(current + 1); }
  function prevSlide(){ if (current > 0) go(current - 1); }

  function go(index){
    if (isAnimating || index === current) return;
    isAnimating = true;
    activateSlide(index);
    setTimeout(() => { isAnimating = false; }, 650);
  }

  document.getElementById('nextBtn').addEventListener('click', nextSlide);
  document.getElementById('prevBtn').addEventListener('click', prevSlide);

  // Keyboard navigation
  window.addEventListener('keydown', (e) => {
    if (!deckEl.classList.contains('visible')) return;
    if (['ArrowDown','ArrowRight',' ','PageDown'].includes(e.key)) { e.preventDefault(); nextSlide(); }
    else if (['ArrowUp','ArrowLeft','PageUp'].includes(e.key)) { e.preventDefault(); prevSlide(); }
  });

  // Wheel navigation (debounced)
  let wheelLock = false;
  window.addEventListener('wheel', (e) => {
    if (!deckEl.classList.contains('visible')) return;
    if (wheelLock) return;
    if (Math.abs(e.deltaY) < 12) return;
    wheelLock = true;
    if (e.deltaY > 0) nextSlide(); else prevSlide();
    setTimeout(() => { wheelLock = false; }, 750);
  }, { passive: true });

  // Fullscreen
  document.getElementById('fullscreenBtn').addEventListener('click', () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.();
      deckEl.classList.add('presenting');
    } else {
      document.exitFullscreen?.();
      deckEl.classList.remove('presenting');
    }
  });
  document.addEventListener('fullscreenchange', () => {
    if (!document.fullscreenElement) deckEl.classList.remove('presenting');
  });

  /* ============================================================
     DIAGRAM BUILDERS (lazy — built once per slide on first activation)
  ============================================================ */
  function buildDiagramFor(slideEl){
    if (slideEl.dataset.built === '1') return;
    slideEl.dataset.built = '1';

    const format = slideEl.dataset.format;
    if (format === 'title') buildTitleNetwork(slideEl);

    slideEl.querySelectorAll('[data-diagram]').forEach(el => {
      const kind = el.dataset.diagram;
      if (kind === 'pipeline') buildPipeline(el);
      else if (kind === 'radial') buildRadial(el);
      else if (kind === 'ecosystem') buildEcosystem(el);
      else if (kind === 'chipcloud') buildChipCloud(el);
      else if (kind === 'dataflow') buildDataflow(el);
      else if (kind === 'funnel') buildFunnel(el);
      else if (kind === 'shield') buildShield(el);
      else if (kind === 'personal') buildPersonal(el);
      else if (kind === 'collab') buildCollab(el);
      else if (kind === 'timeline') buildTimeline(el);
      else if (kind === 'pillars') buildPillars(el);
    });
  }

  function icon(name){ return `<i class="bi bi-${name}"></i>`; }

  // ---------- Title network (decorative background nodes) ----------
  function buildTitleNetwork(slideEl){
    const svg = slideEl.querySelector('.title-network');
    if (!svg) return;
    const pts = [[120,120],[220,320],[80,480],[340,560],[900,140],[1080,300],[980,500],[1120,600],[600,80],[600,650]];
    let m = '';
    pts.forEach((p,i) => {
      m += `<circle class="tnode" cx="${p[0]}" cy="${p[1]}" r="3.5" style="animation-delay:${(0.3+i*0.12).toFixed(2)}s"></circle>`;
    });
    for (let i=0;i<pts.length-1;i+=2){
      m += `<line class="tline" x1="${pts[i][0]}" y1="${pts[i][1]}" x2="${pts[i+1][0]}" y2="${pts[i+1][1]}" style="animation-delay:${(0.6+i*0.1).toFixed(2)}s"></line>`;
    }
    svg.innerHTML = m;
  }

  // ---------- Pipeline (horizontal or vertical chain) ----------
  function buildPipeline(el){
    const items = (el.dataset.items || '').split(',').map(s => s.trim());
    const icons = (el.dataset.icons || '').split(',').map(s => s.trim());
    const isVertical = el.classList.contains('pipeline-vertical');
    let html = '';
    items.forEach((label, i) => {
      const delay = (0.15 + i*0.12).toFixed(2);
      html += `<div class="pipe-step" style="animation-delay:${delay}s">
        <span class="pipe-icon">${icon(icons[i] || 'circle')}</span>
        <span class="pipe-label">${label}</span>
      </div>`;
      if (i < items.length - 1) {
        const cDelay = (0.15 + i*0.12 + 0.08).toFixed(2);
        html += `<div class="pipe-connector" style="animation-delay:${cDelay}s">${icon(isVertical ? 'chevron-down' : 'chevron-right')}</div>`;
      }
    });
    el.innerHTML = html;
  }

  // ---------- Radial hub-and-spoke ----------
  function buildRadial(el){
    let items;
    try { items = JSON.parse(el.dataset.items); } catch(e) { items = []; }
    const centerHtml = el.dataset.center || '';
    const centerIcon = el.dataset.centerIcon || 'diagram-3';

    const w = el.clientWidth || 900;
    const h = el.clientHeight || 520;
    const cx = w/2, cy = h/2;
    const radius = Math.min(w, h) * 0.40;

    let svgHtml = `<svg class="radial-svg" viewBox="0 0 ${w} ${h}">`;
    let nodesHtml = '';

    items.forEach((it, i) => {
      const angle = (Math.PI * 2 * i / items.length) - Math.PI/2;
      const nx = cx + radius * Math.cos(angle);
      const ny = cy + radius * Math.sin(angle);
      const delay = (0.25 + i*0.12).toFixed(2);

      svgHtml += `<line class="animate" x1="${cx}" y1="${cy}" x2="${nx}" y2="${ny}" style="animation-delay:${delay}s"></line>`;

      const nodeW = 168, nodeH = 92;
      let left = nx - nodeW/2, top = ny - nodeH/2;
      left = Math.max(4, Math.min(w - nodeW - 4, left));
      top = Math.max(4, Math.min(h - nodeH - 4, top));

      nodesHtml += `<div class="radial-node" style="left:${left}px;top:${top}px;animation-delay:${delay}s">
        <div class="rn-top">
          ${it.n ? `<span class="rn-num">${it.n}</span>` : ''}
          <span class="rn-icon">${icon(it.icon || 'circle')}</span>
        </div>
        <span class="rn-title">${it.t}</span>
        <span class="rn-desc">${it.d || ''}</span>
      </div>`;
    });
    svgHtml += `</svg>`;

    el.innerHTML = svgHtml +
      `<div class="radial-center"><i class="bi bi-${centerIcon}"></i><span>${centerHtml}</span></div>` +
      nodesHtml;
  }

  // ---------- Ecosystem (hotel example) ----------
  function buildEcosystem(el){
    const groups = Array.from(el.querySelectorAll('.eco-group'));
    groups.forEach(g => {
      const name = g.dataset.group;
      const gIcon = g.dataset.icon;
      const tags = (g.dataset.items || '').split(',').map(s => s.trim());
      g.innerHTML = `<div class="eco-group-head"><i class="bi bi-${gIcon}"></i>${name}</div>
        <div class="eco-tags">${tags.map(t => `<span>${t}</span>`).join('')}</div>`;
    });
  }

  // ---------- Chip cloud ----------
  function buildChipCloud(el){
    const items = (el.dataset.items || '').split(',').map(s => s.trim());
    let html = '';
    items.forEach((t, i) => {
      html += `<span class="chip" style="animation-delay:${(0.1 + i*0.06).toFixed(2)}s">${t}</span>`;
    });
    el.innerHTML = html;
  }

  // ---------- Dataflow (linear flow with pulse) ----------
  function buildDataflow(el){
    const items = (el.dataset.items || '').split(',').map(s => s.trim());
    const icons = (el.dataset.icons || '').split(',').map(s => s.trim());
    let html = '';
    items.forEach((label, i) => {
      const delay = (0.15 + i*0.18).toFixed(2);
      html += `<div class="flow-node" style="animation-delay:${delay}s">
        ${icon(icons[i] || 'circle')}<span>${label}</span>
      </div>`;
      if (i < items.length - 1) {
        html += `<div class="flow-arrow" style="animation-delay:${(parseFloat(delay)+0.1).toFixed(2)}s"><span class="pulse"></span></div>`;
      }
    });
    el.innerHTML = html;
  }

  // ---------- Funnel ----------
  function buildFunnel(el){
    const items = (el.dataset.items || '').split(',').map(s => s.trim());
    const icons = (el.dataset.icons || '').split(',').map(s => s.trim());
    let html = '';
    items.forEach((label, i) => {
      const delay = (0.15 + i*0.16).toFixed(2);
      html += `<div class="funnel-step" style="animation-delay:${delay}s">
        <span class="fs-icon">${icon(icons[i] || 'circle')}</span>
        <span class="fs-label">${label}</span>
      </div>`;
      if (i < items.length - 1) html += `<span class="funnel-arrow" style="animation-delay:${delay}s">${icon('arrow-right')}</span>`;
    });
    el.innerHTML = html;
  }

  // ---------- Shield (cybersecurity concentric layers) ----------
  function buildShield(el){
    const items = (el.dataset.items || '').split(',').map(s => s.trim());
    const w = el.clientWidth || 640, h = el.clientHeight || 460;
    const cx = w/2, cy = h/2;
    const ringOuter = Math.min(w,h) * 0.94;
    const ringInner = Math.min(w,h) * 0.62;
    const radius = Math.min(w,h) * 0.42;

    let html = `
      <div class="shield-ring" style="width:${ringOuter}px;height:${ringOuter}px;left:${cx - ringOuter/2}px;top:${cy - ringOuter/2}px;animation-delay:.1s"></div>
      <div class="shield-ring" style="width:${ringInner}px;height:${ringInner}px;left:${cx - ringInner/2}px;top:${cy - ringInner/2}px;animation-delay:.25s"></div>
      <div class="shield-core"><i class="bi bi-shield-lock-fill"></i></div>`;

    items.forEach((label, i) => {
      const angle = (Math.PI * 2 * i / items.length) - Math.PI/2;
      const nx = cx + radius * Math.cos(angle);
      const ny = cy + radius * Math.sin(angle);
      const delay = (0.4 + i*0.1).toFixed(2);
      html += `<span class="shield-item" style="left:${nx}px;top:${ny}px;transform:translate(-50%,-50%) scale(.7);animation-delay:${delay}s">${label}</span>`;
    });

    el.innerHTML = html;
  }

  // ---------- Personal capability map (HARSH) ----------
  function buildPersonal(el){
    let items;
    try { items = JSON.parse(el.dataset.items); } catch(e) { items = []; }
    const centerText = el.dataset.center || '';

    const w = el.clientWidth || 880, h = el.clientHeight || 500;
    const cx = w/2, cy = h/2;
    const radius = Math.min(w,h) * 0.38;

    let svgHtml = `<svg class="pm-svg" viewBox="0 0 ${w} ${h}">`;
    let nodesHtml = '';

    items.forEach((it, i) => {
      const angle = (Math.PI * 2 * i / items.length) - Math.PI/2;
      const nx = cx + radius * Math.cos(angle);
      const ny = cy + radius * Math.sin(angle);
      const delay = (0.3 + i*0.15).toFixed(2);

      svgHtml += `<line x1="${cx}" y1="${cy}" x2="${nx}" y2="${ny}" style="animation-delay:${delay}s"></line>`;

      const nodeW = 190, nodeH = 86;
      let left = nx - nodeW/2, top = ny - nodeH/2;
      left = Math.max(4, Math.min(w - nodeW - 4, left));
      top = Math.max(4, Math.min(h - nodeH - 4, top));

      nodesHtml += `<div class="pm-node" style="left:${left}px;top:${top}px;animation-delay:${delay}s">
        <div class="pm-top">${icon(it.icon || 'circle')}<span class="pm-title">${it.t}</span></div>
        <span class="pm-desc">${it.d || ''}</span>
      </div>`;
    });
    svgHtml += `</svg>`;

    el.innerHTML = svgHtml + `<div class="pm-center"><span>${centerText}</span></div>` + nodesHtml;
  }

  // ---------- Collaboration diagram ----------
  function buildCollab(el){
    const own = el.dataset.own || '';
    const specialists = (el.dataset.specialists || '').split(',').map(s => s.trim());
    el.innerHTML = `
      <div class="collab-own">${own}</div>
      <div class="collab-connector"></div>
      <span class="collab-label">Collaborate with specialists</span>
      <div class="collab-specialists">
        ${specialists.map((s,i) => `<span class="collab-chip" style="animation-delay:${(0.5+i*0.1).toFixed(2)}s">${s}</span>`).join('')}
      </div>`;
  }

  // ---------- Timeline (roadmap phases) ----------
  function buildTimeline(el){
    let items;
    try { items = JSON.parse(el.dataset.items); } catch(e) { items = []; }
    let html = '';
    items.forEach((it, i) => {
      const delay = (0.15 + i*0.15).toFixed(2);
      html += `<div class="tl-item" style="animation-delay:${delay}s">
        <div class="tl-bar" style="animation-delay:${delay}s"></div>
        <span class="tl-phase">${it.p}</span>
        <div class="tl-title">${it.t}</div>
        <div class="tl-desc">${it.d}</div>
      </div>`;
    });
    el.innerHTML = html;
  }

  // ---------- Pillar stairs (final slide) ----------
  function buildPillars(el){
    let items;
    try { items = JSON.parse(el.dataset.items); } catch(e) { items = []; }
    let html = '';
    items.forEach((it, i) => {
      const delay = (0.15 + i*0.13).toFixed(2);
      html += `<div class="pillar" style="animation-delay:${delay}s">
        <span class="pillar-icon">${icon(it.icon || 'circle')}</span>
        <span class="pillar-title">${it.t}</span>
        <span class="pillar-desc">${it.d}</span>
      </div>`;
    });
    el.innerHTML = html;
  }

})();
