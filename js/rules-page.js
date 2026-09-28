/* Rules page (regras.html): the table rules summary (js/pt/cheatsheet.js) plus an A–Z glossary built
   from the same definitions the Forge shows on hover. */
(() => {
  'use strict';
  const SECTIONS = window.CHEAT_SECTIONS_PT || [];
  const G = window.GLOSSARY || {};
  const LABEL = (window.I18N && window.I18N.glossLabel) || {};
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const slug = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const die = (d, label) => `<span class="rf-die"><span class="die ${d}">${d.slice(1)}</span><small>${label}</small></span>`;

  const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
  const terms = Object.keys(G).map(k => ({ k, label: cap(LABEL[k] || k), text: G[k] }))
    .sort((a, b) => a.label.localeCompare(b.label, 'pt'));
  const letters = [...new Set(terms.map(t => t.label[0].toUpperCase()))];

  document.getElementById('page').innerHTML = `
    <section class="page-hero rules-hero">
      <div class="hero-text">
        <div class="eyebrow">Referência rápida para a mesa</div>
        <h1>Regras</h1>
        <p class="lede">Tudo o que você precisa durante o jogo: como um turno funciona, o que cada ação faz e as palavras que aparecem nas fichas.</p>
      </div>
      <div class="roll-formula" aria-label="Como uma rolagem funciona">
        <div class="rf-row">${die('d10', 'Poder')}<span class="rf-op">+</span>${die('d8', 'Qualidade')}<span class="rf-op">+</span>${die('d6', 'Status')}</div>
        <div class="rf-arrow">role e ordene</div>
        <div class="rf-row rf-result"><span class="rf-slot">Mín</span><span class="rf-slot on">Médio</span><span class="rf-slot">Máx</span></div>
        <p>O dado <b>Médio</b> é o <b>dado de efeito</b>, a não ser que uma habilidade diga outra coisa.</p>
      </div>
    </section>
    <div class="page-grid">
      <nav class="page-toc" aria-label="Índice das regras">
        <input type="search" class="page-search" placeholder="Buscar… (ex.: lacaio, reviravolta, mod)" aria-label="Buscar nas regras">
        <div class="toc-group"><span class="toc-head">Na mesa</span>
          <ul>${SECTIONS.map(s => `<li><a href="#cs-${s.id}">${esc(s.nav || s.title)}</a></li>`).join('')}</ul></div>
        <div class="toc-group"><a class="toc-head" href="#glossario">Glossário</a>
          <ul class="toc-letters">${letters.map(l => `<li><a href="#gl-${l}">${l}</a></li>`).join('')}</ul></div>
      </nav>
      <div class="page-body">
        <div class="rule-list">${SECTIONS.map((s, i) => `
          <section class="cs-sec rule-card" id="cs-${s.id}">
            <header class="rule-head"><span class="group-num">${String(i + 1).padStart(2, '0')}</span><h2>${esc(s.title)}</h2></header>
            ${s.body}</section>`).join('')}
        </div>
        <section class="glossary" id="glossario">
          <header class="group-head"><span class="group-num">A–Z</span><div><h2>Glossário</h2><p>Os termos que aparecem na Forja e na ficha. Na Forja, passe o mouse em qualquer termo sublinhado para ver a mesma explicação.</p></div></header>
          ${letters.map(l => `<div class="gl-letter" id="gl-${l}"><span class="gl-l">${l}</span><dl>${terms.filter(t => t.label[0].toUpperCase() === l).map(t => `<div class="gl-term" id="gl-${slug(t.label)}"><dt>${esc(t.label)}</dt><dd>${t.text}</dd></div>`).join('')}</dl></div>`).join('')}
        </section>
        <p class="page-empty" hidden>Nenhuma regra corresponde à sua busca.</p>
      </div>
    </div>`;

  const norm = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const search = document.querySelector('.page-search');
  search.addEventListener('input', () => {
    const q = norm(search.value.trim());
    let any = false;
    document.querySelectorAll('.rule-card, .gl-term').forEach(el => { const hit = !q || norm(el.textContent).includes(q); el.hidden = !hit; any = any || hit; });
    document.querySelectorAll('.gl-letter').forEach(l => { l.hidden = !l.querySelector('.gl-term:not([hidden])'); });
    document.querySelector('.glossary').hidden = !document.querySelector('.gl-letter:not([hidden])');
    document.querySelector('.page-empty').hidden = any;
  });

  const toc = document.querySelector('.page-toc');
  const links = new Map([...toc.querySelectorAll('li a')].map(a => [a.getAttribute('href').slice(1), a]));
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { links.forEach(a => a.classList.remove('on')); const a = links.get(e.target.id); if (a) a.classList.add('on'); } });
  }, { rootMargin: '-20% 0px -70% 0px' });
  document.querySelectorAll('.rule-card, .gl-letter').forEach(el => io.observe(el));

  if (location.hash) {
    const t = document.getElementById(decodeURIComponent(location.hash.slice(1)));
    if (t) { requestAnimationFrame(() => t.scrollIntoView()); if (document.fonts) document.fonts.ready.then(() => t.scrollIntoView()); }   // again once web fonts settle the layout
  }
})();
