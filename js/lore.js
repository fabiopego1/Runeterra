/* World lore panel: Runeterra background for players (texts from the campaign's lore notes, js/pt/lore.js). */
(() => {
  'use strict';

  const SECTIONS = window.LORE_SECTIONS_PT; // texts live in js/pt/lore.js
  const T = window.T || (x => x);

  const groups = [...new Set(SECTIONS.map(s => s.group))];
  const panel = document.createElement('aside');
  panel.id = 'lore';
  panel.className = 'drawer wide';
  panel.setAttribute('aria-label', T('World lore'));
  panel.setAttribute('aria-hidden', 'true');
  panel.innerHTML = `
    <div class="cs-head">
      <div><div class="eyebrow">${T('The world of the campaign')}</div><h2>${T('Runeterra Lore')}</h2></div>
      <button class="btn small" data-lore-close aria-label="${T('Close lore')}">${window.ICO ? window.ICO('close') : '×'}</button>
    </div>
    <input type="search" class="cs-search" placeholder="${T('Search the lore… (e.g. Void, Azir, petricite)')}" aria-label="${T('Search lore')}">
    <nav class="cs-index">${groups.map(g => `<div class="lore-group"><span>${g}</span>${SECTIONS.filter(s => s.group === g).map(s => `<a href="#lore-${s.id}" data-lore-jump="lore-${s.id}">${s.title.replace(/^.*? [AD]N: /, '')}</a>`).join('')}</div>`).join('')}</nav>
    <div class="cs-body">${groups.map(g => `<h2 class="lore-gh" data-group="${g}">${g}</h2>` + SECTIONS.filter(s => s.group === g).map(s => `<section class="cs-sec" id="lore-${s.id}" data-group="${g}"><h3>${s.title}</h3>${s.body}</section>`).join('')).join('')}
      <p class="cs-empty" hidden>${T('Nothing in the lore matches your search.')}</p>
    </div>`;
  const backdrop = document.createElement('div');
  backdrop.className = 'cs-backdrop';
  document.body.append(backdrop, panel);

  const search = panel.querySelector('.cs-search');
  const jump = id => {
    const t = panel.querySelector('#' + id);
    if (!t) return;
    t.hidden = false;
    t.scrollIntoView({ behavior: 'smooth', block: 'start' });
    t.classList.add('flash'); setTimeout(() => t.classList.remove('flash'), 900);
  };
  const open = sectionId => {
    panel.classList.add('open'); backdrop.classList.add('open');
    panel.setAttribute('aria-hidden', 'false');
    if (sectionId) setTimeout(() => jump(sectionId), 260);
  };
  const close = () => { panel.classList.remove('open'); backdrop.classList.remove('open'); panel.setAttribute('aria-hidden', 'true'); };
  window.openLore = open;
  // Lore section for a builder region id (used by the Homeland step).
  window.LORE_FOR_REGION = Object.fromEntries(SECTIONS.filter(s => s.region).map(s => [s.region, 'lore-' + s.id]));

  document.addEventListener('click', ev => {
    const opener = ev.target.closest('[data-act="lore"]');
    if (opener) { ev.preventDefault(); open(opener.dataset.section); return; }
    if (ev.target.closest('[data-lore-close]') || ev.target === backdrop) { close(); return; }
    const j = ev.target.closest('[data-lore-jump]');
    if (j && panel.contains(j)) { ev.preventDefault(); jump(j.dataset.loreJump); }
  });
  document.addEventListener('keydown', ev => { if (ev.key === 'Escape' && panel.classList.contains('open')) close(); });
  search.addEventListener('input', () => {
    const q = search.value.trim().toLowerCase();
    let any = false;
    panel.querySelectorAll('.cs-sec').forEach(sec => { const hit = !q || sec.textContent.toLowerCase().includes(q); sec.hidden = !hit; any = any || hit; });
    panel.querySelectorAll('.lore-gh').forEach(h => { h.hidden = !panel.querySelector(`.cs-sec[data-group="${h.dataset.group}"]:not([hidden])`); });
    panel.querySelector('.cs-empty').hidden = any;
  });
})();
