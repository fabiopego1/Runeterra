/* The Threat Workshop (ameacas.html): the bank of minions and lieutenants, kept in this browser and shared by the Environment and
   Antagonist workshops. One threat per record, with a picture and a folder; export one, a selection or a folder as .json.
   Only reachable behind the GM Screen (the ability templates live in the vault). */
(() => {
  'use strict';
  const GMKEY = 'runeterra-gm-key';
  const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const $ = s => document.querySelector(s);
  const ico = (n, c) => (window.ICO ? window.ICO(n, c) : '');
  const K = () => window.ForgeKit;
  const tipA = h => K().tip(h);
  const die = (d, c) => K().die(d, c);
  const L = window.THREAT_LIB;
  let ED = null, U = null;
  const ui = { folder: 'all', sel: new Set(), edit: null, q: '', note: '' };

  const slug = s => (String(s || '').normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/[^\w-]+/g, '_').replace(/^_+|_+$/g, '')) || 'ameaca';
  const download = (name, obj) => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([JSON.stringify(obj, null, 2)], { type: 'application/json' }));
    a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };
  const tchipB = (attrs, on, inner, tipHtml) => `<button type="button" class="tchip${on ? ' on' : ''}" role="radio" aria-checked="${on}" ${attrs}${tipHtml ? tipA(tipHtml) : ''}>${inner}</button>`;
  const folderName = id => { const f = L.folders().find(x => x.id === id); return f ? f.name : ''; };
  const visible = () => {
    const q = ui.q.trim().toLowerCase();
    return L.all().filter(t => (ui.folder === 'all' || t.folder === ui.folder) && (!q || (t.name + ' ' + t.desc).toLowerCase().includes(q)))
      .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
  };

  function navHtml() {
    const items = L.all(), fs = L.folders();
    const row = (id, label, n) => `<li class="rail-item${ui.folder === id ? ' active' : ''}"><button data-a="folder" data-id="${id}"${ui.folder === id ? ' aria-current="true"' : ''}><span class="rail-label"><span class="rail-name">${esc(label)}</span><span class="rail-sub">${n} ${n === 1 ? 'ameaça' : 'ameaças'}</span></span></button></li>`;
    return `<div class="rail-title">Banco de ameaças</div><ol class="rail th-folders">${row('all', 'Todas', items.length)}${fs.map(f => row(f.id, f.name, items.filter(t => t.folder === f.id).length)).join('')}</ol>
      <p class="th-drop-hint">Arraste um card até uma pasta para movê-lo. Soltar em “Todas” tira da pasta.</p><div class="th-folder-acts"><button type="button" class="btn small ghost" data-a="folderNew">${ico('mark')} Nova pasta</button>${fs.some(f => f.id === ui.folder) ? `<button type="button" class="linkbtn" data-a="folderRename">Renomear</button><button type="button" class="linkbtn danger" data-a="folderDel">Apagar pasta</button>` : ''}</div>`;
  }

  // a destination picker: the folders, plus a way out of any folder
  const moveSelect = (attr, label, cls) => `<select class="th-move ${cls}" ${attr} aria-label="${esc(label)}"><option value="">${esc(label)}</option><option value="__none">Tirar da pasta</option>${L.folders().map(f => `<option value="${f.id}">${esc(f.name)}</option>`).join('')}</select>`;
  const moveTo = (ids, dest) => {
    const to = dest === '__none' ? '' : dest;
    for (const id of ids) { const t = L.get(id); if (t && t.folder !== to) { t.folder = to; L.put(t); } }
    say(`${ids.length} ${ids.length === 1 ? 'ameaça movida' : 'ameaças movidas'} para ${to ? '“' + folderName(to) + '”' : 'fora das pastas'}.`);
    render();
  };
  function cardHtml(t) {
    const k = U.TK()[t.kind];
    return `<div class="th-card" data-card="${t.id}" draggable="true"><label class="th-sel"><input type="checkbox" data-sel="${t.id}"${ui.sel.has(t.id) ? ' checked' : ''} aria-label="Selecionar ${esc(t.name || 'ameaça')}"></label>
      <div class="th-pic"${tipA(U.tip(t))}>${t.portrait ? `<img src="${t.portrait}" alt="">` : `<span class="muted">${k.name}</span>`}</div>
      <div class="th-main"><div class="th-name"${tipA(U.tip(t))}>${esc(t.name.trim() || 'Ameaça sem nome')}</div><div class="th-line">${die(t.die, 'sm')} <span class="muted">${k.name.toLowerCase()}${t.folder ? ' · ' + esc(folderName(t.folder)) : ''}</span></div>
        <div class="th-acts"><button type="button" class="btn small" data-a="edit" data-id="${t.id}">Editar</button><button type="button" class="linkbtn" data-a="exportOne" data-id="${t.id}">Exportar</button><button type="button" class="linkbtn" data-a="toTable" data-id="${t.id}">Mesa</button><button type="button" class="linkbtn" data-a="dup" data-id="${t.id}">Duplicar</button><button type="button" class="linkbtn danger" data-a="del" data-id="${t.id}">Excluir</button></div>
        ${moveSelect(`data-move="${t.id}"`, 'Mover para…', '')}</div></div>`;
  }

  function editorHtml(th) {
    const k = U.TK()[th.kind], A = `data-th="${th.id}"`, left = k.maxAb - th.abs.length;
    const warn = th.kind === 'minion' && U.dieAtLeast(th.die, 'd10') ? `<div class="env-warn" role="note">${ico('warn')}<span><b>Lacaio com dado alto.</b> Lacaios d10 e d12 ficam mortais em grupo. O livro sugere manter o dado baixo e dar <b>habilidades</b> (bônus em ações ou salvamentos) para torná-los especiais. Se a ameaça é de verdade perigosa, faça dela um tenente.</span></div>` : th.kind === 'lieutenant' && th.die === 'd6' ? `<div class="env-warn" role="note">${ico('warn')}<span><b>Tenente d6.</b> É raro: tenentes costumam ir de d8 a d12.</span></div>` : '';
    const iss = U.issues(th);
    return `<div class="ab ant picked env-tw env-th" data-thcard="${th.id}">
      <div class="ab-top"><span class="ab-name">${esc(th.name.trim() || 'Ameaça sem nome')}</span><span class="pill">${k.name} ${esc(th.die)}</span><button type="button" class="btn small" data-a="editDone">Pronto</button></div>
      <div class="portrait-row"><div class="hs-portrait small">${th.portrait ? `<img src="${th.portrait}" alt="Foto">` : '<span class="muted">Sem foto</span>'}</div>
        <div><label class="btn small" for="portrait-file">${th.portrait ? 'Trocar foto' : 'Adicionar foto'}</label> ${th.portrait ? '<button class="btn small ghost" data-a="clearPortrait">Remover</button>' : ''}<input id="portrait-file" type="file" accept="image/*" hidden>
          <p class="portrait-hint">A foto fica só neste navegador e dentro do .json da ameaça.</p></div></div>
      <div class="env-fields"><label class="field"><span>Nome</span><input type="text" ${A} data-f="name" value="${esc(th.name)}" placeholder="Ex.: Diabretes da Tempestade"></label>
        <label class="field"><span>Descrição (o que é e como ataca)</span><input type="text" ${A} data-f="desc" value="${esc(th.desc)}" placeholder="Uma frase: corpo a corpo ou à distância, o que o torna uma ameaça"></label></div>
      <div class="env-row"><div><div class="cfg-l">Tipo</div><div class="tchips" role="radiogroup">${Object.keys(U.TK()).map(key => tchipB(`data-a="thKind" data-val="${key}"`, th.kind === key, `<span>${U.TK()[key].name}</span>`, `<h5>${U.TK()[key].name}</h5>${esc(U.TK()[key].save)}`)).join('')}</div></div>
        <div><div class="cfg-l">Dado</div><div class="tchips" role="radiogroup">${k.dice.map(d => tchipB(`data-a="thDie" data-val="${d}"`, th.die === d, die(d, 'sm'))).join('')}</div></div>
        <label class="field"><span>Pasta</span><select data-th="${th.id}" data-f="folder"><option value="">Sem pasta</option>${L.folders().map(f => `<option value="${f.id}"${th.folder === f.id ? ' selected' : ''}>${esc(f.name)}</option>`).join('')}</select></label></div>
      <p class="muted env-note"><b>Salvamento.</b> ${esc(k.save)}</p>${warn}
      <div class="cfg-l">Habilidades <small class="muted">(${th.kind === 'minion' ? '0 a 2' : '1 a 3'}; bônus de 1 a 3, o mais comum é 2)</small></div>
      ${th.abs.map((a, i) => { const t = U.abTpl(a.t); return `<div class="env-ab"><div class="env-ab-h"><b>${esc(U.abName(a))}</b>${U.abUsesV(t) ? `<span class="tchips" role="radiogroup" aria-label="Valor do bônus ou da penalidade"${tipA('<h5>Valor</h5>O número do bônus ou da penalidade desta habilidade. O livro usa de 1 a 3, e o mais comum é 2.')}>${[1, 2, 3].map(v => tchipB(`data-a="thAbV" data-i="${i}" data-val="${v}"`, a.v === v, `<span>${v}</span>`)).join('')}</span>` : ''}<button type="button" class="linkbtn danger" data-a="thAbDel" data-i="${i}">Remover</button></div>
        ${t && t.ph ? `<input type="text" ${A} data-ab="${i}" data-f="x" value="${esc(a.x)}" placeholder="${esc(t.ph)}" aria-label="Detalhe da habilidade">` : ''}<div class="ab-text">${esc(U.abText(a))}</div></div>`; }).join('')}
      ${left > 0 ? `<label class="field"><span>Adicionar habilidade</span><select data-thadd="${th.id}"><option value="">Escolha…</option>${ED.abilities.map(t => `<option value="${t.id}">${esc(t.name)}</option>`).join('')}</select></label>` : ''}
      <label class="field"><span>Tática (opcional)</span><input type="text" ${A} data-f="tactics" value="${esc(th.tactics)}" placeholder="Como age na cena, em uma frase"></label>
      <div class="todo-slot">${iss.length ? `<div class="flow-todo"><span class="flow-todo-l">Ainda falta</span><ul>${iss.map(x => `<li>${esc(x)}</li>`).join('')}</ul></div>` : ''}</div></div>`;
  }

  function stageHtml() {
    const list = visible(), th = ui.edit ? L.get(ui.edit) : null, n = ui.sel.size;
    const here = ui.folder === 'all' ? 'Todas as ameaças' : folderName(ui.folder);
    return `<div class="panel"><header class="chapter"><div class="chapter-titles"><div class="chapter-kicker">Banco de ameaças</div><h2 class="chapter-title">${esc(here)}</h2></div></header>
      <p class="chapter-lede">Lacaios e tenentes guardados <b>neste navegador</b>. Os ambientes e os antagonistas escolhem daqui. Cada ameaça é um arquivo próprio: dá para exportar uma, as marcadas ou uma pasta inteira.</p>
      ${th ? editorHtml(th) : ''}
      <div class="th-bar"><button type="button" class="btn primary" data-a="new">${ico('mark')} Nova ameaça</button>
        <label class="btn" for="import-file">${ico('upload')} Importar</label>
        <button type="button" class="btn${n ? '' : ' is-disabled'}" data-a="exportSel" aria-disabled="${!n}">${ico('download')} Exportar selecionadas${n ? ` (${n})` : ''}</button>
        ${L.folders().some(f => f.id === ui.folder) ? `<button type="button" class="btn" data-a="exportFolder">${ico('download')} Exportar esta pasta</button>` : ''}
        ${moveSelect(`data-movesel${n ? '' : ' disabled'}`, n ? `Mover as ${n} marcadas para…` : 'Mover as marcadas para…', '')}
        <button type="button" class="linkbtn" data-a="selAll">${list.length && list.every(t => ui.sel.has(t.id)) ? 'Desmarcar as visíveis' : 'Marcar as visíveis'}</button>
        <input type="search" class="th-search" data-q placeholder="Buscar pelo nome" value="${esc(ui.q)}" aria-label="Buscar ameaças"></div>
      <div class="th-note" role="status">${esc(ui.note)}</div>
      <div class="th-grid">${list.map(cardHtml).join('') || '<p class="muted">Nenhuma ameaça aqui ainda. Crie uma ou importe arquivos .json.</p>'}</div></div>`;
  }
  function render() {
    K().tipReset();
    $('#nav').innerHTML = navHtml();
    const y = window.scrollY, f = document.activeElement && document.activeElement.matches && document.activeElement.matches('[data-q]');
    $('#stage').innerHTML = stageHtml();
    window.scrollTo(0, y);
    if (f) { const q = $('[data-q]'); q.focus(); q.setSelectionRange(q.value.length, q.value.length); }
  }
  // typing in the editor only refreshes what depends on it
  function light(th) {
    const card = $(`[data-thcard="${th.id}"]`); if (!card) return;
    const nm = card.querySelector('.ab-top .ab-name'); if (nm) nm.textContent = th.name.trim() || 'Ameaça sem nome';
    const iss = U.issues(th), slot = card.querySelector('.todo-slot');
    if (slot) slot.innerHTML = iss.length ? `<div class="flow-todo"><span class="flow-todo-l">Ainda falta</span><ul>${iss.map(x => `<li>${esc(x)}</li>`).join('')}</ul></div>` : '';
  }
  const say = msg => { ui.note = msg; const n = $('.th-note'); if (n) n.textContent = msg; };

  function exportItems(items, label) {
    if (!items.length) { say('Não há ameaças para exportar aí.'); return; }
    download(`ameacas_${slug(label)}.json`, L.exportMany(items, label));
    say(`Exportadas ${items.length} ${items.length === 1 ? 'ameaça' : 'ameaças'} em ameacas_${slug(label)}.json.`);
  }
  function importFiles(files) {
    let done = 0, add = 0, skip = 0, copies = 0, bad = 0;
    for (const f of files) {
      const r = new FileReader();
      r.onload = () => {
        let o = null; try { o = JSON.parse(String(r.result)); } catch (e) { /* not json */ }
        const res = L.importObj(o);
        if (res) { add += res.added; skip += res.skipped; copies += res.copies; } else bad++;
        if (++done === files.length) {
          say(`Importação: ${add} ${add === 1 ? 'nova' : 'novas'}${skip ? `, ${skip} já estavam no banco` : ''}${copies ? `, ${copies} com o mesmo id mas conteúdo diferente entraram como cópia` : ''}${bad ? `, ${bad} arquivo(s) ignorado(s) por não serem de ameaças` : ''}.`);
          render();
        }
      };
      r.readAsText(f);
    }
  }

  function onClick(ev) {
    const t = ev.target;
    if (t.closest('select, textarea, label, input:not([type=checkbox])')) return;
    const el = t.closest('[data-a]'); if (!el) return;
    const a = el.dataset.a, id = el.dataset.id, th = ui.edit ? L.get(ui.edit) : null;
    if (el.classList.contains('is-disabled')) { say('Marque as ameaças que quer exportar (a caixinha de cada card).'); return; }
    if (a === 'folder') { ui.folder = id; render(); return; }
    if (a === 'folderNew') { const n = prompt('Nome da nova pasta:'); if (n && n.trim()) { const f = L.addFolder(n); ui.folder = f.id; render(); } return; }
    if (a === 'folderRename') { const n = prompt('Novo nome da pasta:', folderName(ui.folder)); if (n && n.trim()) { L.renameFolder(ui.folder, n); render(); } return; }
    if (a === 'folderDel') { if (confirm(`Apagar a pasta “${folderName(ui.folder)}”? As ameaças dela não são apagadas: ficam sem pasta.`)) { L.delFolder(ui.folder); ui.folder = 'all'; render(); } return; }
    if (a === 'new') { const n = L.put(Object.assign(L.normItem({}), { folder: L.folders().some(f => f.id === ui.folder) ? ui.folder : '' })); ui.edit = n.id; render(); const i = $(`[data-thcard="${n.id}"] input[data-f=name]`); if (i) i.focus(); return; }
    if (a === 'edit') { ui.edit = id; render(); const c = $('[data-thcard]'); if (c) c.scrollIntoView({ block: 'start' }); return; }
    if (a === 'editDone') { ui.edit = null; render(); return; }
    if (a === 'dup') { const s = L.get(id); if (s) { const c = JSON.parse(JSON.stringify(s)); c.id = L.uid(); c.name = (c.name || 'Ameaça sem nome') + ' (cópia)'; L.put(c); render(); } return; }
    if (a === 'del') { const s = L.get(id); if (s && confirm(`Excluir “${s.name.trim() || 'sem nome'}” do banco? Ambientes e antagonistas que já a copiaram continuam com a cópia deles.`)) { L.del(id); ui.sel.delete(id); if (ui.edit === id) ui.edit = null; render(); } return; }
    if (a === 'exportOne') { const s = L.get(id); if (s) { download(`ameaca_${slug(s.name)}.json`, L.exportOne(s)); say(`Exportada: ameaca_${slug(s.name)}.json.`); } return; }
    if (a === 'toTable') { const s = L.get(id); if (s) say(U.toTable(s, 4) + ' (4 campeões; o número é ajustável na Mesa).'); return; }
    if (a === 'selAll') { const v = visible(); if (v.every(x => ui.sel.has(x.id))) v.forEach(x => ui.sel.delete(x.id)); else v.forEach(x => ui.sel.add(x.id)); render(); return; }
    if (a === 'exportSel') { exportItems(L.all().filter(x => ui.sel.has(x.id)), 'selecao'); return; }
    if (a === 'exportFolder') { const fid = L.folders().some(f => f.id === ui.folder) ? ui.folder : null; if (fid) exportItems(L.all().filter(x => x.folder === fid), folderName(fid)); else say('Abra uma pasta para exportar o conteúdo dela.'); return; }
    if (a === 'clearPortrait' && th) { th.portrait = null; L.put(th); render(); return; }
    if (!th) return;
    if (a === 'thKind') { th.kind = el.dataset.val; const k = U.TK()[th.kind]; if (!k.dice.includes(th.die)) th.die = 'd8'; if (th.abs.length > k.maxAb) th.abs.length = k.maxAb; L.put(th); render(); return; }
    if (a === 'thDie') { th.die = el.dataset.val; L.put(th); render(); return; }
    if (a === 'thAbV') { th.abs[+el.dataset.i].v = +el.dataset.val; L.put(th); render(); return; }
    if (a === 'thAbDel') { th.abs.splice(+el.dataset.i, 1); L.put(th); render(); return; }
  }
  function wire() {
    document.addEventListener('click', onClick);
    // drag a card (or, if it is checked, all the checked cards) onto a folder in the rail
    let drag = null;
    document.addEventListener('dragstart', ev => {
      const c = ev.target.closest && ev.target.closest('[data-card]'); if (!c) return;
      const id = c.dataset.card; drag = ui.sel.has(id) ? [...ui.sel] : [id];
      ev.dataTransfer.setData('text/plain', 'ameaca:' + drag.join(',')); ev.dataTransfer.effectAllowed = 'move';
    });
    const target = ev => { const b = ev.target.closest && ev.target.closest('.th-folders [data-a=folder]'); return b ? b.closest('.rail-item') : null; };
    document.addEventListener('dragover', ev => { const li = target(ev); if (li && drag) { ev.preventDefault(); li.classList.add('drop'); } });
    document.addEventListener('dragleave', ev => { const li = target(ev); if (li) li.classList.remove('drop'); });
    document.addEventListener('drop', ev => {
      const li = target(ev); if (!li || !drag) return;
      ev.preventDefault();
      const dest = li.querySelector('[data-a=folder]').dataset.id, ids = drag; drag = null;
      moveTo(ids, dest === 'all' ? '__none' : dest);
    });
    document.addEventListener('dragend', () => { drag = null; document.querySelectorAll('.rail-item.drop').forEach(x => x.classList.remove('drop')); });
    document.addEventListener('input', ev => {
      const el = ev.target;
      if (el.matches && el.matches('[data-q]')) { ui.q = el.value; render(); return; }
      if (el.dataset && el.dataset.th && el.tagName !== 'SELECT') {
        const th = L.get(el.dataset.th); if (!th) return;
        if (el.dataset.ab != null) th.abs[+el.dataset.ab][el.dataset.f] = el.value; else th[el.dataset.f] = el.value;
        L.put(th); light(th);
        if (el.dataset.ab != null) { const t = el.closest('.env-ab').querySelector('.ab-text'); if (t) t.textContent = U.abText(th.abs[+el.dataset.ab]); }
      }
    });
    document.addEventListener('change', ev => {
      const el = ev.target;
      if (el.dataset && el.dataset.move !== undefined) { if (el.value) moveTo([el.dataset.move], el.value); return; }
      if (el.dataset && el.dataset.movesel !== undefined) { if (el.value && ui.sel.size) moveTo([...ui.sel], el.value); return; }
      if (el.dataset && el.dataset.sel) { if (el.checked) ui.sel.add(el.dataset.sel); else ui.sel.delete(el.dataset.sel); render(); return; }
      if (el.dataset && el.dataset.thadd) { const th = L.get(el.dataset.thadd); if (th && el.value && th.abs.length < U.TK()[th.kind].maxAb) { th.abs.push({ t: el.value, v: 2, x: '' }); L.put(th); render(); } return; }
      if (el.dataset && el.dataset.th && el.tagName === 'SELECT') { const th = L.get(el.dataset.th); if (th) { th[el.dataset.f] = el.value; L.put(th); render(); } return; }
      if (el.id === 'portrait-file') { const th = ui.edit ? L.get(ui.edit) : null; if (th) U.readPicture(el.files[0], d => { th.portrait = d; L.put(th); render(); }); el.value = ''; return; }
      if (el.id === 'import-file') { const fs = [...el.files]; el.value = ''; if (fs.length) importFiles(fs); }
    });
    const btn = $('#file-btn'), pop = $('#file-pop');
    const setOpen = (open, focus) => { pop.hidden = !open; btn.setAttribute('aria-expanded', String(open)); if (open && focus) pop.querySelector('[role="menuitem"]').focus(); if (!open && focus) btn.focus(); };
    btn.addEventListener('click', ev => { ev.stopPropagation(); setOpen(pop.hidden, ev.detail === 0); });
    document.addEventListener('click', ev => { if (pop.hidden) return; if (!pop.contains(ev.target) || ev.target.closest('[role="menuitem"]')) setTimeout(() => setOpen(false), 0); });
    document.addEventListener('keydown', ev => {
      if (ev.key === 'Escape' && !pop.hidden) setOpen(false, true);
      const c = ev.target.closest && ev.target.closest('[data-a][role=radio]:not(button)');
      if (c && ev.target === c && (ev.key === 'Enter' || ev.key === ' ')) { ev.preventDefault(); c.click(); }
    });
    pop.addEventListener('keydown', ev => {
      const list = [...pop.querySelectorAll('[role="menuitem"]')], i = list.indexOf(document.activeElement);
      if (ev.key === 'ArrowDown' || ev.key === 'ArrowUp') { ev.preventDefault(); list[(i + (ev.key === 'ArrowDown' ? 1 : list.length - 1)) % list.length].focus(); }
      if ((ev.key === 'Enter' || ev.key === ' ') && document.activeElement.tagName === 'LABEL') { ev.preventDefault(); document.activeElement.click(); }
    });
  }

  async function unlocked() {
    const raw = (() => { try { return sessionStorage.getItem(GMKEY); } catch (e) { return null; } })();
    const payload = await window.GM_UNSEAL.openRaw(raw);
    if (!payload) return false;
    window.GM_UNSEAL.run(payload, ['gm-env-data']);
    ED = window.GM_ENVDATA;
    return !!ED;
  }
  (async () => {
    const gate = $('#gate'), app = $('#app');
    if (!(await unlocked())) {
      gate.hidden = false;
      gate.innerHTML = `<div class="sp-empty"><span class="gm-seal" aria-hidden="true">${ico('lock')}</span><h1>Somente para o Mestre</h1>
        <p class="muted">A Oficina de Ameaças fica atrás do Escudo do Mestre. Abra o Escudo, digite a senha e volte por aqui: o botão “Ameaças” aparece no cabeçalho quando você está dentro.</p>
        <a class="btn primary" href="gm.html">${ico('lock')} Abrir o Escudo do Mestre</a></div>`;
      return;
    }
    U = L.ui(ED, { esc, die, tipA });
    app.hidden = false;
    wire();
    render();
  })();
})();
