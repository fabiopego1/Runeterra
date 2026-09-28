/* Language: the app is published in Brazilian Portuguese only.
   - The source strings in the code are English and double as translation keys:
     T('English text', {vars}) returns the pt-BR text from I18N.ui.
   - The pt-BR files in js/pt/ patch the data in place (names, descriptions, lore) and fill
     I18N.ui / I18N.text. Rules logic always reads the English data, which players never see. */
(() => {
  'use strict';
  window.LANG = 'pt';
  document.documentElement.lang = 'pt-BR';
  try { localStorage.removeItem('runeterra-lang'); } catch (e) { /* old language choice, no longer used */ }

  const I18N = window.I18N = {
    ui: {},        // English UI string → pt-BR
    text: {},      // English rules text (abilities, principles, out abilities) → pt-BR, same [tokens]
    names: {},     // English ability name → pt-BR
    // Load the pt-BR overlays right after the data files (document.write keeps them in order, before app.js).
    loadPt(files) {
      const q = (document.currentScript && document.currentScript.src.split('?')[1]) || '';
      for (const f of files) document.write(`<script src="${f}${q ? '?' + q : ''}"><\/script>`);
    }
  };

  window.T = (s, vars) => {
    let out = Object.prototype.hasOwnProperty.call(I18N.ui, s) ? I18N.ui[s] : s;
    if (vars) out = out.replace(/\{(\w+)\}/g, (m, k) => (vars[k] != null ? vars[k] : m));
    return out;
  };

  // Static page text: <span data-t>Lore</span>, title="…" via data-t-title.
  const applyStatic = () => {
    document.querySelectorAll('[data-t]').forEach(el => { el.textContent = window.T(el.dataset.t || el.textContent.trim()); });
    document.querySelectorAll('[data-t-title]').forEach(el => { el.title = window.T(el.dataset.tTitle); });
    document.querySelectorAll('[data-t-html]').forEach(el => { const v = I18N.ui[el.dataset.tHtml]; if (v) el.innerHTML = v; });
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', applyStatic); else applyStatic();
})();
