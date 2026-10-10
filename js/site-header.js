/* The site header, the same on every page. index.html and ficha.html carry it in their markup (app.js drives
   Campeões and Arquivo there); the other pages get it from here, with the same buttons:
   - Campeões opens the champion list in the Forge (index.html#campeoes);
   - Arquivo exports the open champion, imports a file (the Forge picks it up) or goes to the sheet to print it.
   The only part that changes from page to page is the "Forja" button: it shows everywhere except in the Forge. */
(() => {
  'use strict';
  const header = document.querySelector('header.site-header');
  if (!header || document.getElementById('file-btn')) return;   // the Forge and the sheet have their own
  const page = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  const here = { 'ficha.html': 'ficha', 'lore.html': 'lore', 'regras.html': 'regras', 'resumo.html': 'regras' }[page] || '';
  const cur = k => (here === k ? ' aria-current="page"' : '');
  const isGm = document.body.classList.contains('gm-page');
  const read = k => { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } };

  // how many champions are saved in this browser (the one being edited counts even before it is in the list)
  const count = () => {
    const ids = read('runeterra-forge-roster-v1');
    const list = Array.isArray(ids) ? ids.slice() : [];
    const open = read('runeterra-forge-v1');
    if (open && open.cid && !list.includes(open.cid)) list.push(open.cid);
    return list.length;
  };

  header.innerHTML = `
    <a class="brand" href="index.html">
      <span class="brand-mark" data-sigil="compass"></span>
      <span class="brand-text"><span class="brand-kicker">Runeterra · Criador de Ficha</span><span class="brand-title">Forja de Campeões</span></span>
    </a>
    <nav class="header-actions site-nav" aria-label="Páginas">
      <a class="hbtn" href="index.html"><span data-ico="prev"></span><span>Forja</span></a>
      <a class="hbtn key" href="index.html#campeoes" title="Seus campeões guardados neste navegador"><span data-ico="compass"></span><span>Campeões</span><span class="hcount" id="roster-count">${count() || ''}</span></a>
      <a class="hbtn key" href="ficha.html"${cur('ficha')}><span data-ico="file"></span><span>Ficha</span></a>
      <a class="hbtn key" href="lore.html"${cur('lore')}><span data-ico="map"></span><span>Lore</span></a>
      <a class="hbtn key" href="regras.html"${cur('regras')}><span data-ico="codex"></span><span>Regras</span></a>
      <a class="hbtn key" href="antagonista.html" data-gm-only hidden title="Oficina de Antagonista (só atrás do Escudo do Mestre)"><span data-ico="lock"></span><span class="ant-long">Oficina de </span><span>Antagonista</span></a>
      <a class="hbtn key" href="ambiente.html" data-gm-only hidden title="Oficina de Ambiente (só atrás do Escudo do Mestre)"><span data-ico="lock"></span><span class="ant-long">Oficina de </span><span>Ambiente</span></a>
      <span class="hsep" aria-hidden="true"></span>
      <div class="file-menu">
        <button class="hbtn" id="file-btn" aria-haspopup="menu" aria-expanded="false" aria-controls="file-pop"><span data-ico="file"></span><span>Arquivo</span><span class="chev" data-ico="chevron"></span></button>
        <div class="file-pop" id="file-pop" role="menu" hidden>
          <button role="menuitem" data-file="export"><span data-ico="download"></span><span>Exportar campeão<small>Salva um arquivo .json de backup</small></span></button>
          <label role="menuitem" for="import-file" tabindex="0"><span data-ico="upload"></span><span>Importar campeão<small>Abre um arquivo .json salvo antes</small></span></label>
          <a role="menuitem" href="ficha.html#imprimir"><span data-ico="print"></span><span>Imprimir ficha</span></a>
        </div>
      </div>
      ${isGm ? '<button class="hbtn" data-gm-lock hidden><span data-ico="lock"></span><span>Trancar</span></button>' : ''}
      <input id="import-file" type="file" accept="application/json,.json" hidden>
    </nav>`;

  const btn = document.getElementById('file-btn'), pop = document.getElementById('file-pop');
  const setOpen = (open, focus) => {
    pop.hidden = !open;
    btn.setAttribute('aria-expanded', String(open));
    if (open && focus) pop.querySelector('[role="menuitem"]').focus();
    if (!open && focus) btn.focus();
  };
  btn.addEventListener('click', ev => { ev.stopPropagation(); setOpen(pop.hidden, ev.detail === 0); });
  document.addEventListener('click', ev => {
    if (pop.hidden) return;
    if (!pop.contains(ev.target) || ev.target.closest('[role="menuitem"]')) setTimeout(() => setOpen(false), 0);
  });
  document.addEventListener('keydown', ev => { if (ev.key === 'Escape' && !pop.hidden) setOpen(false, true); });
  pop.addEventListener('keydown', ev => {
    const list = [...pop.querySelectorAll('[role="menuitem"]')], i = list.indexOf(document.activeElement);
    if (ev.key === 'ArrowDown' || ev.key === 'ArrowUp') { ev.preventDefault(); list[(i + (ev.key === 'ArrowDown' ? 1 : list.length - 1)) % list.length].focus(); }
    if ((ev.key === 'Enter' || ev.key === ' ') && document.activeElement.tagName === 'LABEL') { ev.preventDefault(); document.activeElement.click(); }
  });

  // export: the open champion, as the Forge would save it
  pop.querySelector('[data-file="export"]').addEventListener('click', () => {
    const s = read('runeterra-forge-v1');
    if (!s) { alert('Ainda não há um campeão neste navegador: crie um na Forja.'); return; }
    const info = s.info || {};
    const base = ((info.alias || '').trim() || (info.name || '').trim() || 'runeterra-champion').replace(/[^\w-]+/g, '_');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([JSON.stringify(s, null, 2)], { type: 'application/json' }));
    a.download = base + '.json';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  });
  // import: the Forge reads and checks the file, so hand it over and go there
  document.getElementById('import-file').addEventListener('change', ev => {
    const f = ev.target.files[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      try { sessionStorage.setItem('runeterra-import', String(r.result)); location.href = 'index.html#importar'; }
      catch (e) { alert('Não foi possível importar por aqui: abra a Forja e importe de lá.'); }
    };
    r.readAsText(f);
  });
})();
