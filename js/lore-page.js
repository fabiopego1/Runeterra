/* Lore page (lore.html): the campaign's world, built from js/pt/lore.js with an image slot for every
   section, region and people. Artwork is registered in js/lore-images.js. */
(() => {
  'use strict';
  const SECTIONS = window.LORE_SECTIONS_PT || [];
  const IMAGES = window.LORE_IMAGES || {};
  const REGIONS = Object.fromEntries((window.REGIONS || []).map(r => [r.id, r]));
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const slug = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const sigil = id => window.SIGIL ? window.SIGIL(id || 'compass') : '';

  // An image slot: the registered artwork, or an engraved empty frame that shows where art goes.
  const figure = (id, { ratio = '16 / 9', sigilId, color, cls = '', alt = '' } = {}) => {
    const img = IMAGES[id];
    const style = `--ar:${ratio};${color ? `--rc:${color};` : ''}`;
    if (img && img.src) {
      const fit = `object-fit:${img.fit === 'contain' ? 'contain' : 'cover'};${img.pos ? `object-position:${img.pos};` : ''}`;
      return `<figure class="lore-fig has-img ${cls}" style="${style}"><img src="${esc(img.src)}" alt="${esc(img.alt || alt)}" loading="lazy" style="${fit}">` +
        (img.credit ? `<figcaption>${esc(img.credit)}</figcaption>` : '') + '</figure>';
    }
    return `<figure class="lore-fig empty ${cls}" style="${style}" title="Espaço para imagem: ${esc(id)}" data-slot="${esc(id)}" aria-hidden="true">${sigil(sigilId)}</figure>`;
  };

  const splitDate = title => {
    const m = title.match(/^(.*? [AD]N): (.*)$/);
    return m ? { date: m[1], name: m[2] } : { date: '', name: title };
  };

  const UNDATED = { primordial: 'Antes da história', present: '994 DN · hoje' };   // timeline entries without a date in the title
  const groups = [...new Set(SECTIONS.map(s => s.group))];
  const GROUP_INFO = {
    'O Mundo': { id: 'mundo', lede: 'O planeta, as Runas Globais e os reinos que existem além dele.' },
    'Linha do Tempo': { id: 'linha', lede: 'Da Era Primordial aos dias atuais. AN é antes da Nova Era; DN, depois.' },
    'Regiões': { id: 'regioes', lede: 'As terras de onde seu campeão pode vir. Cada uma destaca Origens, Fontes e Princípios no criador.' },
    'Povos': { id: 'povos', lede: 'Quem vive em Runeterra. A raça não tem regras próprias: ela aparece na Origem, na Fonte e nos Princípios.' }
  };

  const world = s => `<article class="lore-art" id="${s.id}" data-group="${esc(s.group)}">
      ${figure(s.id, { ratio: '4 / 3', cls: 'float', alt: s.title })}
      <h3>${esc(s.title)}</h3>${s.body}</article>`;

  const timelineItem = s => {
    const { date, name } = splitDate(s.title);
    return `<li class="tl-item" id="${s.id}" data-group="${esc(s.group)}">
      <div class="tl-date">${esc(date || UNDATED[s.id] || '')}</div>
      <article class="tl-card">${IMAGES[s.id] ? figure(s.id, { ratio: '21 / 9', cls: 'tl-banner', alt: name }) : figure(s.id, { ratio: '1 / 1', cls: 'thumb', alt: name })}<h3>${esc(name)}</h3>${s.body}</article></li>`;
  };

  const region = s => {
    const r = REGIONS[s.region] || {};
    return `<article class="lore-region" id="${s.id}" data-group="${esc(s.group)}" style="--rc:${r.color || 'var(--gold)'}">
      <div class="region-banner">${figure(s.id, { ratio: '21 / 8', sigilId: s.region, color: r.color, alt: s.title })}
        <div class="region-title"><span class="region-sigil">${sigil(s.region)}</span><div><h3>${esc(s.title)}</h3>${r.tag ? `<p>${esc(r.tag)}</p>` : ''}</div></div></div>
      <div class="region-body">${s.body}</div></article>`;
  };

  // Peoples: the section body holds one .race block per people; each gets a portrait slot.
  const peoples = s => {
    const box = document.createElement('div');
    box.innerHTML = s.body;
    box.querySelectorAll('.race').forEach(r => {
      const h = r.querySelector('h4');
      const id = 'race-' + slug(h ? h.textContent : 'povo');
      r.id = id;
      r.insertAdjacentHTML('afterbegin', figure(id, { ratio: '3 / 4', cls: 'portrait', alt: h ? h.textContent : '' }));
      const text = document.createElement('div');
      text.className = 'race-text';
      [...r.childNodes].filter(n => !(n.nodeType === 1 && n.matches('figure'))).forEach(n => text.appendChild(n));
      r.appendChild(text);
    });
    const races = [...box.querySelectorAll('.race')];
    races.forEach(r => r.remove());
    return `<article class="lore-art" id="${s.id}" data-group="${esc(s.group)}"><h3>${esc(s.title)}</h3>${box.innerHTML}</article>
      <div class="race-grid">${races.map(r => r.outerHTML).join('')}</div>`;
  };

  const renderGroup = g => {
    const list = SECTIONS.filter(s => s.group === g);
    const info = GROUP_INFO[g] || { id: slug(g), lede: '' };
    let body;
    if (g === 'Linha do Tempo') body = `<ol class="timeline">${list.map(timelineItem).join('')}</ol>`;
    else if (g === 'Regiões') body = `<div class="region-list">${list.map(region).join('')}</div>`;
    else if (g === 'Povos') body = list.map(peoples).join('');
    else body = list.map(world).join('');
    return `<section class="lore-group-sec" id="g-${info.id}" data-group="${esc(g)}">
      <header class="group-head"><span class="group-num">${String(groups.indexOf(g) + 1).padStart(2, '0')}</span><div><h2>${esc(g)}</h2>${info.lede ? `<p>${esc(info.lede)}</p>` : ''}</div></header>
      ${body}</section>`;
  };

  const tocLabel = s => splitDate(s.title).name;
  document.getElementById('page').innerHTML = `
    <section class="page-hero lore-hero">
      ${figure('cover', { ratio: '21 / 7', cls: 'hero-fig', alt: 'Runeterra' })}
      <div class="hero-text">
        <div class="eyebrow">O mundo da campanha</div>
        <h1>Runeterra</h1>
        <p class="lede">Um mundo naturalmente mágico, moldado pelas Runas Globais e por milênios de guerras, impérios e deuses. Tudo o que seu campeão precisa saber antes de pisar nele.</p>
      </div>
    </section>
    <div class="page-grid">
      <nav class="page-toc" aria-label="Índice da lore">
        <input type="search" class="page-search" placeholder="Buscar… (ex.: Vazio, Azir, petricita)" aria-label="Buscar na lore">
        ${groups.map(g => `<div class="toc-group"><a class="toc-head" href="#g-${(GROUP_INFO[g] || { id: slug(g) }).id}">${esc(g)}</a>
          <ul>${SECTIONS.filter(s => s.group === g).map(s => `<li><a href="#${s.id}">${esc(tocLabel(s))}</a></li>`).join('')}</ul></div>`).join('')}
      </nav>
      <div class="page-body">${groups.map(renderGroup).join('')}
        <p class="page-empty" hidden>Nada na lore corresponde à sua busca.</p></div>
    </div>`;

  // Search: hide non-matching articles, timeline entries, regions and peoples (accent-insensitive).
  const norm = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const search = document.querySelector('.page-search');
  search.addEventListener('input', () => {
    const q = norm(search.value.trim());
    let any = false;
    document.querySelectorAll('.lore-group-sec').forEach(g => {
      let n = 0;
      g.querySelectorAll('.lore-art, .tl-item, .lore-region, .race').forEach(el => { const hit = !q || norm(el.textContent).includes(q); el.hidden = !hit; if (hit) n++; });
      g.hidden = n === 0; any = any || n > 0;
    });
    document.querySelector('.page-empty').hidden = any;
  });

  // Highlight the section being read in the table of contents.
  const toc = document.querySelector('.page-toc');
  const links = new Map([...toc.querySelectorAll('li a')].map(a => [a.getAttribute('href').slice(1), a]));
  const keepVisible = a => {   // scroll only the contents column, never the page
    if (toc.scrollHeight <= toc.clientHeight) return;
    const top = a.offsetTop, h = toc.clientHeight;
    if (top < toc.scrollTop + 40 || top > toc.scrollTop + h - 60) toc.scrollTop = top - h / 3;
  };
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { links.forEach(a => a.classList.remove('on')); const a = links.get(e.target.id); if (a) { a.classList.add('on'); keepVisible(a); } } });
  }, { rootMargin: '-20% 0px -70% 0px' });
  SECTIONS.forEach(s => { const el = document.getElementById(s.id); if (el) io.observe(el); });

  // Opening lore.html#section (e.g. from the Forge's Homeland step) lands on it after rendering.
  if (location.hash) {
    const t = document.getElementById(decodeURIComponent(location.hash.slice(1)));
    if (t) { requestAnimationFrame(() => t.scrollIntoView()); if (document.fonts) document.fonts.ready.then(() => t.scrollIntoView()); }   // again once web fonts settle the layout
  }
})();
