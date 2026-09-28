/* Language: English (default) or Brazilian Portuguese.
   - T('English text', {vars}) returns the pt-BR version when one exists (falls back to English).
   - The pt-BR files in js/pt/ are loaded only when Portuguese is active; they patch the data in place
     (names, descriptions, lore) and fill I18N.ui / I18N.text. Rules logic always reads the English data. */
(() => {
  'use strict';
  const KEY = 'runeterra-lang';
  let lang = null;
  try { lang = localStorage.getItem(KEY); } catch (e) { /* storage blocked */ }
  if (!lang) lang = /^pt/i.test(navigator.language || '') ? 'pt' : 'en';
  window.LANG = lang === 'pt' ? 'pt' : 'en';
  document.documentElement.lang = window.LANG === 'pt' ? 'pt-BR' : 'en';

  const I18N = window.I18N = {
    ui: {},        // English UI string → pt-BR
    text: {},      // English rules text (abilities, principles, out abilities) → pt-BR, same [tokens]
    names: {},     // English ability name → pt-BR
    setLang(l) {
      try { localStorage.setItem(KEY, l); } catch (e) { /* ignore */ }
      location.reload();
    },
    // Load the pt-BR overlays right after the data files (document.write keeps them in order, before app.js).
    loadPt(files) {
      if (window.LANG !== 'pt') return;
      const q = (document.currentScript && document.currentScript.src.split('?')[1]) || '';
      for (const f of files) document.write(`<script src="${f}${q ? '?' + q : ''}"><\/script>`);
    }
  };

  window.T = (s, vars) => {
    let out = (window.LANG === 'pt' && Object.prototype.hasOwnProperty.call(I18N.ui, s)) ? I18N.ui[s] : s;
    if (vars) out = out.replace(/\{(\w+)\}/g, (m, k) => (vars[k] != null ? vars[k] : m));
    return out;
  };

  // Static page text: <span data-t>Lore</span>, title="…" via data-t-title.
  const applyStatic = () => {
    document.querySelectorAll('[data-t]').forEach(el => { el.textContent = window.T(el.dataset.t || el.textContent.trim()); });
    document.querySelectorAll('[data-t-title]').forEach(el => { el.title = window.T(el.dataset.tTitle); });
    document.querySelectorAll('[data-t-html]').forEach(el => { const v = I18N.ui[el.dataset.tHtml]; if (window.LANG === 'pt' && v) el.innerHTML = v; });
    document.querySelectorAll('[data-lang]').forEach(el => el.setAttribute('aria-pressed', String(el.dataset.lang === window.LANG)));
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', applyStatic); else applyStatic();
  document.addEventListener('click', ev => {
    const b = ev.target.closest('[data-lang]');
    if (b && b.dataset.lang !== window.LANG) I18N.setLang(b.dataset.lang);
  });
})();
