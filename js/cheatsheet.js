/* Rules cheat sheet: a slide-in reference panel available from every step. */
(() => {
  'use strict';

  const SECTIONS = window.CHEAT_SECTIONS_PT; // texts live in js/pt/cheatsheet.js
  const T = window.T || (x => x);

  const panel = document.createElement('aside');
  panel.id = 'cheatsheet';
  panel.setAttribute('aria-label', T('Rules cheat sheet'));
  panel.setAttribute('aria-hidden', 'true');
  panel.innerHTML = `
    <div class="cs-head">
      <div><div class="eyebrow">${T('Quick reference')}</div><h2>${T('Rules Cheat Sheet')}</h2></div>
      <button class="btn small" data-cs-close aria-label="${T('Close cheat sheet')}">${window.ICO ? window.ICO('close') : '×'}</button>
    </div>
    <input type="search" class="cs-search" placeholder="${T('Search rules… (e.g. minion, twist, mod)')}" aria-label="${T('Search rules')}">
    <nav class="cs-index">${SECTIONS.map(s => `<a href="#cs-${s.id}" data-cs-jump="cs-${s.id}">${s.nav || s.title}</a>`).join('')}</nav>
    <div class="cs-body">${SECTIONS.map(s => `<section class="cs-sec" id="cs-${s.id}"><h3>${s.title}</h3>${s.body}</section>`).join('')}
      <p class="cs-empty" hidden>${T('No rules match your search.')}</p>
    </div>`;
  const backdrop = document.createElement('div');
  backdrop.className = 'cs-backdrop';
  document.body.append(backdrop, panel);

  const search = panel.querySelector('.cs-search');
  const open = () => {
    panel.classList.add('open'); backdrop.classList.add('open');
    panel.setAttribute('aria-hidden', 'false');
    setTimeout(() => search.focus(), 50);
  };
  const close = () => { panel.classList.remove('open'); backdrop.classList.remove('open'); panel.setAttribute('aria-hidden', 'true'); };
  window.openCheatSheet = open;

  document.addEventListener('click', ev => {
    if (ev.target.closest('[data-act="rules"]')) { open(); return; }
    if (ev.target.closest('[data-cs-close]') || ev.target === backdrop) { close(); return; }
    const j = ev.target.closest('[data-cs-jump]');
    if (j && panel.contains(j)) {
      ev.preventDefault();
      const t = panel.querySelector('#' + j.dataset.csJump);
      if (t) { t.hidden = false; t.scrollIntoView({ behavior: 'smooth', block: 'start' }); t.classList.add('flash'); setTimeout(() => t.classList.remove('flash'), 900); }
    }
  });
  document.addEventListener('keydown', ev => {
    if (ev.key === 'Escape' && panel.classList.contains('open')) close();
    const typing = /^(INPUT|TEXTAREA|SELECT)$/.test((ev.target.tagName || ''));
    if (ev.key === '?' && !typing) { ev.preventDefault(); panel.classList.contains('open') ? close() : open(); }
  });
  search.addEventListener('input', () => {
    const q = search.value.trim().toLowerCase();
    let any = false;
    panel.querySelectorAll('.cs-sec').forEach(sec => {
      const hit = !q || sec.textContent.toLowerCase().includes(q);
      sec.hidden = !hit; any = any || hit;
    });
    panel.querySelector('.cs-empty').hidden = any;
  });
})();
