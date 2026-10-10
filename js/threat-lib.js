/* The Threat Bank: lacaios (minions) and tenentes (lieutenants) kept in this browser (localStorage), shared by the three
   GM workshops (Threats, Environment, Antagonist). Each threat is its own record, with an optional picture and a folder.
   This file holds no GM material: the ability templates live in the vault (gm-env-data) and reach it through ui(ED, helpers).
   Environments and antagonists keep a COPY of the threats they use (same id), so their sheets and .json files stay complete;
   the bank can refresh a copy on request. */
(() => {
  'use strict';
  const KEY = 'runeterra-threat-lib-v1';
  const DIES = ['d4', 'd6', 'd8', 'd10', 'd12'];
  const uid = () => Math.random().toString(36).slice(2, 10);
  const read = () => { try { return JSON.parse(localStorage.getItem(KEY)); } catch (e) { return null; } };
  const normItem = o => {
    const t = Object.assign({ id: uid(), name: '', kind: 'minion', die: 'd6', desc: '', tactics: '', abs: [], portrait: null, folder: '', updated: 0 }, o || {});
    t.kind = t.kind === 'lieutenant' ? 'lieutenant' : 'minion';
    if (!DIES.includes(t.die)) t.die = t.kind === 'lieutenant' ? 'd8' : 'd6';
    t.abs = (Array.isArray(t.abs) ? t.abs : []).map(a => Object.assign({ t: 'custom', v: 2, x: '' }, a));
    t.name = String(t.name || ''); t.desc = String(t.desc || ''); t.tactics = String(t.tactics || ''); t.folder = String(t.folder || '');
    delete t.app; delete t.v;
    return t;
  };
  const load = () => {
    const l = read() || {};
    return { folders: (Array.isArray(l.folders) ? l.folders : []).map(f => ({ id: String(f.id), name: String(f.name || 'Pasta') })), items: (Array.isArray(l.items) ? l.items : []).map(normItem) };
  };
  let warned = false;
  const save = lib => {
    try { localStorage.setItem(KEY, JSON.stringify(lib)); return true; }
    catch (e) { if (!warned) { warned = true; alert('Este navegador está sem espaço: a última mudança do banco de ameaças pode não ter sido salva. Exporte as ameaças e remova fotos pesadas.'); } return false; }
  };
  const clone = o => JSON.parse(JSON.stringify(o));
  const same = (a, b) => JSON.stringify([a.name, a.kind, a.die, a.desc, a.tactics, a.abs, a.portrait]) === JSON.stringify([b.name, b.kind, b.die, b.desc, b.tactics, b.abs, b.portrait]);

  const api = {
    KEY, DIES, uid, normItem,
    all: () => load().items,
    folders: () => load().folders,
    get: id => load().items.find(t => t.id === id) || null,
    put(item) { const l = load(), t = normItem(item); t.updated = Date.now(); const i = l.items.findIndex(x => x.id === t.id); if (i >= 0) l.items[i] = t; else l.items.push(t); save(l); return t; },
    del(id) { const l = load(); l.items = l.items.filter(t => t.id !== id); save(l); },
    addFolder(name) { const l = load(), f = { id: uid(), name: String(name || '').trim() || 'Nova pasta' }; l.folders.push(f); save(l); return f; },
    renameFolder(id, name) { const l = load(), f = l.folders.find(x => x.id === id); if (f) { f.name = String(name || '').trim() || f.name; save(l); } },
    delFolder(id) { const l = load(); l.folders = l.folders.filter(f => f.id !== id); l.items.forEach(t => { if (t.folder === id) t.folder = ''; }); save(l); },
    // adds the threats an environment or an antagonist already carries that the bank does not know yet (older sheets)
    adopt(list) { const l = load(); let n = 0; for (const t of list || []) if (t && t.id && !l.items.some(x => x.id === t.id)) { const c = normItem(clone(t)); c.updated = Date.now(); l.items.push(c); n++; } if (n) save(l); return n; },
    copyOf: id => { const t = api.get(id); return t ? clone(Object.assign({}, t, { folder: '', portrait: t.portrait })) : null; },

    // files: one threat per .json, or a library .json that carries several threats and the folders they sit in
    exportOne: t => Object.assign({ app: 'runeterra-threat', v: 1 }, clone(t)),
    exportMany(items, label) {
      const l = load(), used = new Set(items.map(t => t.folder).filter(Boolean));
      return { app: 'runeterra-threat-library', v: 1, name: label || '', folders: l.folders.filter(f => used.has(f.id)), items: clone(items) };
    },
    // returns { added, skipped, copies } or null when the file is not ours
    importObj(o) {
      if (!o || typeof o !== 'object') return null;
      let items, folders = [];
      if (o.app === 'runeterra-threat') items = [o];
      else if (o.app === 'runeterra-threat-library' && Array.isArray(o.items)) { items = o.items; folders = Array.isArray(o.folders) ? o.folders : []; }
      else return null;
      const l = load(), fmap = {};
      for (const f of folders) { let hit = l.folders.find(x => x.name === f.name); if (!hit) { hit = { id: uid(), name: String(f.name || 'Pasta') }; l.folders.push(hit); } fmap[f.id] = hit.id; }
      let added = 0, skipped = 0, copies = 0;
      for (const raw of items) {
        const t = normItem(raw);
        t.folder = fmap[t.folder] || '';
        const hit = l.items.find(x => x.id === t.id);
        if (hit && same(hit, t)) { skipped++; continue; }
        if (hit) { t.id = uid(); t.name = t.name + ' (importada)'; copies++; }
        t.updated = Date.now(); l.items.push(t); added++;
      }
      save(l);
      return { added, skipped, copies };
    },

    // shared drawing code; ED is the vault's GM_ENVDATA, h = { esc, die, tipA }
    ui(ED, h) {
      const { esc, die, tipA } = h;
      const TK = () => ED.threatKinds;
      const abTpl = id => ED.abilities.find(a => a.id === id);
      const abText = a => { const t = abTpl(a.t); return t ? t.t(a.v, (a.x || '').trim()) : ''; };
      const abName = a => { const t = abTpl(a.t); return t ? t.name : ''; };
      const abUsesV = t => !!t && t.t(1, 'x') !== t.t(2, 'x');
      const dieAtLeast = (d, m) => DIES.indexOf(d) >= DIES.indexOf(m);
      function issues(th) {
        const I = [], k = TK()[th.kind], who = `“${th.name.trim() || 'sem nome'}”: `;
        if (!th.name.trim()) I.push(who + 'dê um nome à ameaça.');
        if (th.kind === 'lieutenant' && !th.abs.length) I.push(who + 'um tenente precisa de pelo menos uma habilidade.');
        if (th.abs.length > k.maxAb) I.push(who + `${th.kind === 'minion' ? 'lacaios têm' : 'tenentes têm'} no máximo ${k.maxAb} habilidades.`);
        th.abs.forEach(a => { if (a.t === 'custom' && !(a.x || '').trim()) I.push(who + 'descreva a habilidade própria.'); });
        return I;
      }
      const tip = th => {
        const k = TK()[th.kind];
        return `<h5>${esc(th.name.trim() || 'Ameaça sem nome')} · ${k.name} ${esc(th.die)}</h5>${th.portrait ? `<img class="th-tip-img" src="${th.portrait}" alt="">` : ''}${th.desc.trim() ? `<p>${esc(th.desc.trim())}</p>` : ''}<p><b>Salvamento.</b> ${esc(k.save)}</p>${th.abs.length ? `<ul>${th.abs.map(a => `<li><b>${esc(abName(a))}.</b> ${esc(abText(a))}</li>`).join('')}</ul>` : '<p class="muted">Sem habilidades: só age e leva dano.</p>'}${th.tactics.trim() ? `<p><i>Tática:</i> ${esc(th.tactics.trim())}</p>` : ''}`;
      };
      const chip = th => `<span class="term env-thr-chip"${tipA(tip(th))}>${esc(th.name.trim() || 'Ameaça sem nome')} ${die(th.die, 'sm')} <small class="muted">${TK()[th.kind].name.toLowerCase()}</small></span>`;
      const sheet = th => `<div class="env-thc">${th.portrait ? `<img class="env-thc-img" src="${th.portrait}" alt="">` : ''}<div class="env-thc-h"><b>${esc(th.name.trim() || 'sem nome')}</b> ${die(th.die, 'sm')} <small class="muted">${TK()[th.kind].name.toLowerCase()}</small></div>
        ${th.desc.trim() ? `<div class="env-thc-d">${esc(th.desc.trim())}</div>` : ''}${th.abs.map(a => `<div class="env-thc-a"><b>${esc(abName(a))}.</b> ${esc(abText(a))}</div>`).join('')}${th.tactics.trim() ? `<div class="env-thc-t"><i>Tática:</i> ${esc(th.tactics.trim())}</div>` : ''}<div class="env-thc-s"><i>Salvamento:</i> ${esc(TK()[th.kind].save)}</div></div>`;
      const plainLine = t => `${t.name || 'sem nome'} (${TK()[t.kind].name.toLowerCase()} ${t.die})${t.desc ? ': ' + t.desc : ''}${t.abs.length ? ' · ' + t.abs.map(a => `${abName(a)}: ${abText(a)}`).join(' ') : ''}${t.tactics ? ' · Tática: ' + t.tactics : ''}`;
      // one minion per hero, half as many lieutenants (rounded up), on the GM Table
      function toTable(th, heroes) {
        const n = Math.max(1, Math.min(8, parseInt(heroes, 10) || 4)), count = th.kind === 'minion' ? n : Math.ceil(n / 2);
        let T; try { T = JSON.parse(localStorage.getItem('runeterra-gm-table-v1')); } catch (e) { T = null; }
        T = T && typeof T === 'object' ? T : {};
        if (!Array.isArray(T.foes)) T.foes = [];
        T.foes.push({ id: uid(), name: th.name.trim() || 'Ameaça', kind: th.kind, dice: Array(count).fill(th.die), sel: 0, out: 0, dmg: '', last: '' });
        try { localStorage.setItem('runeterra-gm-table-v1', JSON.stringify(T)); } catch (e) { return 'Sem espaço neste navegador.'; }
        return `Adicionado à Mesa: ${count} × ${th.die} (${count === 1 ? 'um' : count} ${th.kind === 'minion' ? 'lacaio' : 'tenente'}${count === 1 ? '' : 's'}).`;
      }
      // a picture file, shrunk to fit in the browser's storage
      function readPicture(file, done) {
        if (!file) return;
        const r = new FileReader();
        r.onload = () => {
          const img = new Image();
          img.onload = () => {
            const max = 420, k = Math.min(1, max / Math.max(img.width, img.height));
            const c = document.createElement('canvas'); c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
            c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
            done(c.toDataURL('image/jpeg', 0.82));
          };
          img.src = r.result;
        };
        r.readAsDataURL(file);
      }
      return { TK, abTpl, abText, abName, abUsesV, dieAtLeast, issues, tip, chip, sheet, plainLine, toTable, readPicture };
    }
  };
  window.THREAT_LIB = api;
})();
