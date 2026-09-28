/* GM Screen: table tools (scene tracker, turn order, challenges, minions and lieutenants, villains,
   twist generator) and the GM's private notes. Everything stays in this browser: the table in
   localStorage, the notes encrypted (AES-GCM) with the same key the GM password unlocks. */
(() => {
  'use strict';
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const ico = n => (window.ICO ? window.ICO(n) : '');
  const STORE = 'runeterra-gm-table-v1', NOTES = 'runeterra-gm-notes-v1';
  const DICE = ['d4', 'd6', 'd8', 'd10', 'd12'];
  const dn = d => parseInt(d.slice(1), 10);
  const down = d => DICE[Math.max(0, DICE.indexOf(d) - 1)];
  const rollDie = d => { const a = new Uint32Array(1); crypto.getRandomValues(a); return 1 + (a[0] % dn(d)); };
  const uid = () => Math.random().toString(36).slice(2, 9);
  const b64 = s => Uint8Array.from(atob(s), c => c.charCodeAt(0));
  const toB64 = buf => btoa(String.fromCharCode(...new Uint8Array(buf)));
  const TRACKERS = { standard: ['Padrão', [2, 4, 2]], prolonged: ['Prolongado', [3, 5, 3]], epic: ['Épico', [1, 3, 4]] };
  const KINDS = { hero: 'Herói', villain: 'Vilão', minion: 'Lacaios', lieutenant: 'Tenente', tracker: 'Marcador', challenge: 'Desafio', other: 'Outro' };
  const dieBadge = d => `<span class="die ${d}">${d.slice(1)}</span>`;
  const blank = () => ({ tracker: { g: 2, y: 4, r: 2, marked: 0 }, round: 1, turns: [], challenges: [], foes: [], villains: [], region: 'any', twist: null });

  let S = load(), root = null, key = null, notesTimer = null;
  function load() {
    try { const s = JSON.parse(localStorage.getItem(STORE)); if (s) return Object.assign(blank(), s); } catch (e) { /* ignore */ }
    return blank();
  }
  const save = () => { try { localStorage.setItem(STORE, JSON.stringify(S)); } catch (e) { /* storage full or blocked */ } };

  // ------------------------------------------------------------------ encrypted notes
  async function seal(obj) {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, new TextEncoder().encode(JSON.stringify(obj)));
    return { iv: toB64(iv), ct: toB64(ct) };
  }
  async function unseal(box) {
    const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: b64(box.iv) }, key, b64(box.ct));
    return JSON.parse(new TextDecoder().decode(plain));
  }
  const say = msg => { const el = root && root.querySelector('.gmt-notes-status'); if (el) el.textContent = msg; };
  async function saveNotes(text) {
    try { localStorage.setItem(NOTES, JSON.stringify(await seal({ notes: text }))); say('Salvo e criptografado neste navegador.'); }
    catch (e) { say('Não foi possível salvar as notas neste navegador.'); }
  }
  async function loadNotes() {
    const ta = root.querySelector('#gmt-notes');
    try {
      const raw = localStorage.getItem(NOTES);
      if (!raw) { say('Nenhuma nota ainda. Elas ficam só neste navegador, criptografadas com a senha do Mestre.'); return; }
      ta.value = (await unseal(JSON.parse(raw))).notes || '';
      say('Notas abertas. Salvas e criptografadas neste navegador.');
    } catch (e) { say('As notas guardadas foram criptografadas com outra senha e não puderam ser abertas.'); }
  }
  async function exportBackup() {
    const ta = root.querySelector('#gmt-notes');
    const box = await seal({ notes: ta.value, table: S });
    const file = { kind: 'runeterra-gm-backup', v: 1, salt: window.GM_VAULT ? window.GM_VAULT.salt : '', ...box, saved: new Date().toISOString() };
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([JSON.stringify(file, null, 2)], { type: 'application/json' }));
    a.download = `escudo-do-mestre-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    say('Backup exportado. Ele só abre com a senha do Mestre.');
  }
  function importBackup(fileObj) {
    const r = new FileReader();
    r.onload = async () => {
      try {
        const file = JSON.parse(r.result);
        if (file.kind !== 'runeterra-gm-backup') throw new Error('kind');
        const data = await unseal(file);
        if (!confirm('Importar este backup? As notas e a mesa atuais serão substituídas.')) return;
        S = Object.assign(blank(), data.table || {}); save();
        render();
        root.querySelector('#gmt-notes').value = data.notes || '';
        await saveNotes(data.notes || '');
        say('Backup importado.');
      } catch (e) { say('Não foi possível importar: o arquivo não é um backup do Escudo ou foi feito com outra senha.'); }
    };
    r.readAsText(fileObj);
  }

  // ------------------------------------------------------------------ panels
  function trackerHtml() {
    const t = S.tracker, total = t.g + t.y + t.r;
    const zone = t.marked >= total ? 'end' : t.marked >= t.g + t.y ? 'red' : t.marked >= t.g ? 'yellow' : 'green';
    const LABEL = { green: 'Cena Verde', yellow: 'Cena Amarela', red: 'Cena Vermelha', end: 'Fim do marcador' };
    const boxes = Array.from({ length: total }, (_, i) => {
      const c = i < t.g ? 'g' : i < t.g + t.y ? 'y' : 'r';
      return `<button type="button" class="gmt-box ${c}${i < t.marked ? ' on' : ''}" data-gm="mark" data-i="${i}" aria-label="Espaço ${i + 1}${i < t.marked ? ', marcado' : ''}"></button>`;
    }).join('');
    const size = (c, label) => `<span class="gmt-size ${c}"><button type="button" data-gm="tsize" data-c="${c}" data-d="-1" aria-label="Um espaço ${label} a menos">−</button><b>${t[c]}</b><button type="button" data-gm="tsize" data-c="${c}" data-d="1" aria-label="Um espaço ${label} a mais">+</button></span>`;
    return `<section class="gmt-panel gmt-tracker" id="gmt-tracker"><h3>${ico('mark')} Marcador de cena</h3>
      <div class="gmt-status z-${zone}">${LABEL[zone]}</div>
      <div class="gmt-boxes" role="group" aria-label="Espaços do marcador">${boxes}</div>
      ${zone === 'end' ? '<p class="gmt-alert">O último espaço Vermelho foi marcado: algo ruim acontece e a cena termina.</p>' : ''}
      <div class="gmt-row"><button type="button" class="btn small primary" data-gm="advance"${zone === 'end' ? ' disabled' : ''}>Avançar um espaço</button><button type="button" class="btn small ghost" data-gm="unmark"${t.marked ? '' : ' disabled'}>Voltar um</button><button type="button" class="btn small ghost" data-gm="treset">Zerar</button></div>
      <div class="gmt-row gmt-sub"><span>Modelo:</span>${Object.entries(TRACKERS).map(([k, [n]]) => `<button type="button" class="gmt-chip" data-gm="preset" data-p="${k}">${n}</button>`).join('')}</div>
      <div class="gmt-row gmt-sub"><span>Tamanho:</span>${size('g', 'Verde')}${size('y', 'Amarelo')}${size('r', 'Vermelho')}</div>
      <p class="gmt-hint">No turno do marcador: avance um espaço, ative as ameaças do ambiente e, se não houver nenhuma, traga uma nova ou dispare uma reviravolta do ambiente.</p></section>`;
  }

  function turnsHtml() {
    const left = S.turns.filter(x => !x.acted).length;
    return `<section class="gmt-panel gmt-turns" id="gmt-turns"><h3>${ico('next')} Ordem de turno <small>Rodada ${S.round}</small></h3>
      <ol class="gmt-list">${S.turns.map(x => `<li class="${x.acted ? 'done' : ''}"><button type="button" class="gmt-check" data-gm="acted" data-id="${x.id}" aria-pressed="${!!x.acted}" aria-label="${esc(x.name)} já agiu">${x.acted ? ico('mark') : ''}</button><span class="gmt-kind k-${x.kind}">${KINDS[x.kind] || ''}</span><span class="gmt-name">${esc(x.name)}</span><button type="button" class="gmt-x" data-gm="turnDel" data-id="${x.id}" aria-label="Tirar ${esc(x.name)}">×</button></li>`).join('') || '<li class="gmt-empty">Adicione heróis, vilões, grupos de lacaios e o marcador de cena.</li>'}</ol>
      ${S.turns.length ? `<p class="gmt-hint">${left ? `Faltam ${left} para agir nesta rodada. Quem termina o turno escolhe quem joga em seguida.` : 'Todos agiram. Quem jogou por último escolhe quem abre a próxima rodada, menos a si mesmo.'}</p>` : ''}
      <form class="gmt-form" data-gm-form="turn"><input name="name" placeholder="Nome" aria-label="Nome" required maxlength="40"><select name="kind" aria-label="Tipo">${Object.entries(KINDS).map(([k, v]) => `<option value="${k}">${v}</option>`).join('')}</select><button class="btn small">Adicionar</button></form>
      <div class="gmt-row"><button type="button" class="btn small primary" data-gm="newRound"${S.turns.length ? '' : ' disabled'}>Nova rodada</button>${S.turns.some(x => x.kind === 'tracker') ? '' : '<button type="button" class="btn small ghost" data-gm="addTracker">+ Marcador de cena</button>'}</div></section>`;
  }

  function challengesHtml() {
    const card = c => {
      const resolved = c.done >= c.need, fired = c.timer && c.ticks >= c.timer;
      return `<div class="gmt-card${resolved ? ' ok' : fired ? ' bad' : ''}"><div class="gmt-card-h"><b>${esc(c.name)}</b>${resolved ? '<span class="gmt-tag ok">Resolvido</span>' : fired ? '<span class="gmt-tag bad">Disparou!</span>' : ''}<button type="button" class="gmt-x" data-gm="chDel" data-id="${c.id}" aria-label="Remover desafio">×</button></div>
        <div class="gmt-track-line"><span>Sucessos</span>${Array.from({ length: c.need }, (_, i) => `<button type="button" class="gmt-box s${i < c.done ? ' on' : ''}" data-gm="chDone" data-id="${c.id}" data-i="${i}" aria-label="Sucesso ${i + 1}"></button>`).join('')}</div>
        ${c.timer ? `<div class="gmt-track-line"><span>Contador</span>${Array.from({ length: c.timer }, (_, i) => `<button type="button" class="gmt-box t${i < c.ticks ? ' on' : ''}" data-gm="chTick" data-id="${c.id}" data-i="${i}" aria-label="Turno ${i + 1} do contador"></button>`).join('')}</div>` : ''}</div>`;
    };
    return `<section class="gmt-panel gmt-challenges" id="gmt-challenges"><h3>${ico('lock')} Desafios</h3>
      <div class="gmt-cards">${S.challenges.map(card).join('') || '<p class="gmt-empty">Nenhum desafio na cena.</p>'}</div>
      <form class="gmt-form" data-gm-form="challenge"><input name="name" placeholder="Ex.: Vazamento de gás" aria-label="Nome do desafio" required maxlength="50">
        <label>Sucessos <input name="need" type="number" min="1" max="5" value="1"></label><label>Contador <input name="timer" type="number" min="0" max="8" value="0"></label><button class="btn small">Adicionar</button></form>
      <p class="gmt-hint">Um 12+ no Superar conta dois sucessos. Contador 0 = sem contador; marque uma caixa a cada turno do desafio.</p></section>`;
  }

  function foesHtml() {
    const card = f => `<div class="gmt-card gmt-foe${f.dice.length ? '' : ' gone'}"><div class="gmt-card-h"><b>${esc(f.name)}</b><span class="gmt-tag">${f.kind === 'lieutenant' ? 'Tenente' : 'Lacaios'}</span>${f.out ? `<span class="gmt-tag">${f.out} fora</span>` : ''}<button type="button" class="gmt-x" data-gm="foeDel" data-id="${f.id}" aria-label="Remover">×</button></div>
      ${f.dice.length ? `<div class="gmt-dice" role="group" aria-label="Escolha o alvo">${f.dice.map((d, i) => `<button type="button" class="gmt-die${i === f.sel ? ' sel' : ''}" data-gm="foeSel" data-id="${f.id}" data-i="${i}" aria-pressed="${i === f.sel}" aria-label="${f.kind === 'lieutenant' ? 'Tenente' : 'Lacaio ' + (i + 1)}: ${d}">${dieBadge(d)}</button>`).join('')}</div>
        <div class="gmt-row"><label class="gmt-dmg">Dano <input type="number" min="0" max="60" inputmode="numeric" data-dmg="${f.id}" value="${esc(f.dmg || '')}"></label><button type="button" class="btn small primary" data-gm="foeHit" data-id="${f.id}">Rolar defesa</button><button type="button" class="btn small ghost" data-gm="foeRoll" data-id="${f.id}">Rolar ação</button></div>` : '<p class="gmt-empty">Todos derrotados.</p>'}
      ${f.last ? `<p class="gmt-result" aria-live="polite">${f.last}</p>` : ''}</div>`;
    return `<section class="gmt-panel gmt-foes" id="gmt-foes"><h3>${ico('reset')} Lacaios e tenentes</h3>
      <div class="gmt-cards">${S.foes.map(card).join('') || '<p class="gmt-empty">Nenhum lacaio ou tenente em cena.</p>'}</div>
      <form class="gmt-form" data-gm-form="foe"><input name="name" placeholder="Ex.: Capangas turbinados" aria-label="Nome" required maxlength="40">
        <select name="kind" aria-label="Tipo"><option value="minion">Lacaios</option><option value="lieutenant">Tenente</option></select>
        <select name="die" aria-label="Dado">${DICE.map(d => `<option${d === 'd8' ? ' selected' : ''}>${d}</option>`).join('')}</select>
        <label>Qtd. <input name="count" type="number" min="1" max="12" value="3"></label><button class="btn small">Adicionar</button></form>
      <p class="gmt-hint">Escolha o alvo, digite o dano e role a defesa: a regra de lacaio ou tenente é aplicada sozinha, incluindo o dano massivo (o dobro do dado derruba um tenente sem rolar).</p></section>`;
  }

  function villainsHtml() {
    const card = v => `<div class="gmt-card"><div class="gmt-card-h"><b>${esc(v.name)}</b><button type="button" class="gmt-x" data-gm="vilDel" data-id="${v.id}" aria-label="Remover vilão">×</button></div>
      <div class="gmt-hp"><span class="gmt-hp-n"><b>${v.hp}</b> / ${v.max}</span>${[-5, -1, 1, 5].map(d => `<button type="button" class="gmt-chip" data-gm="vilHp" data-id="${v.id}" data-d="${d}">${d > 0 ? '+' + d : '−' + -d}</button>`).join('')}</div>
      <div class="gmt-bar"><i style="width:${Math.max(0, Math.min(100, (v.hp / v.max) * 100))}%"></i></div>
      <div class="gmt-row gmt-status-dice"><span>Status</span>${['Verde', 'Amarelo', 'Vermelho'].map((z, n) => `<label class="z${n}">${z} <select data-gmv="vil" data-id="${v.id}" data-f="st${n}">${DICE.map(d => `<option${v['st' + n] === d ? ' selected' : ''}>${d}</option>`).join('')}</select></label>`).join('')}</div>
      <textarea data-gmv="vil" data-id="${v.id}" data-f="notes" placeholder="Poderes, qualidades, habilidades, aprimoramentos, plano…" aria-label="Anotações do vilão">${esc(v.notes || '')}</textarea></div>`;
    return `<section class="gmt-panel gmt-villains" id="gmt-villains"><h3>${ico('codex')} Vilões</h3>
      <div class="gmt-cards">${S.villains.map(card).join('') || '<p class="gmt-empty">Nenhum vilão em cena.</p>'}</div>
      <form class="gmt-form" data-gm-form="villain"><input name="name" placeholder="Nome do vilão" aria-label="Nome do vilão" required maxlength="40"><label>Vida <input name="max" type="number" min="1" max="200" value="40"></label><button class="btn small">Adicionar</button></form></section>`;
  }

  function twistHtml() {
    const regions = (window.REGIONS || []).filter(r => window.GM_TWISTS[r.id]);
    const t = S.twist;
    return `<section class="gmt-panel gmt-twists" id="gmt-twists"><h3>${ico('map')} Gerador de reviravoltas</h3>
      <label class="gmt-field">Onde a cena acontece <select data-gmv="region"><option value="any">Qualquer lugar</option>${regions.map(r => `<option value="${r.id}"${S.region === r.id ? ' selected' : ''}>${esc(r.name)}</option>`).join('')}</select></label>
      <div class="gmt-row"><button type="button" class="btn small" data-gm="twist" data-t="minor">Reviravolta menor</button><button type="button" class="btn small" data-gm="twist" data-t="major">Reviravolta maior</button></div>
      ${t ? `<div class="gmt-twist ${t.t}"><span>${t.t === 'major' ? 'Maior' : 'Menor'} · ${esc(t.where)}</span><p>${esc(t.text)}</p></div>` : '<p class="gmt-hint">Antes, confira as perguntas de reviravolta dos princípios dos heróis: elas são sempre a primeira opção.</p>'}</section>`;
  }

  function notesHtml() {
    return `<section class="gmt-panel gmt-notes" id="gmt-notes-sec"><h3>${ico('lock')} Notas do Mestre</h3>
      <textarea id="gmt-notes" spellcheck="true" placeholder="Planos, segredos dos vilões, ganchos para as próximas edições…" aria-label="Notas do Mestre"></textarea>
      <p class="gmt-notes-status gmt-hint" aria-live="polite"></p>
      <div class="gmt-row"><button type="button" class="btn small" data-gm="backup">${ico('download')} Exportar backup</button><label class="btn small" for="gmt-import" tabindex="0">${ico('upload')} Importar backup</label><input id="gmt-import" type="file" accept="application/json,.json" hidden><button type="button" class="btn small ghost" data-gm="tableReset">Limpar a mesa</button></div>
      <p class="gmt-hint">As notas e a mesa ficam só neste navegador (nada vai para a internet). O backup sai criptografado e só abre com a senha do Mestre: use-o para levar tudo para outro aparelho.</p></section>`;
  }

  function render() {
    if (!root) return;
    const notes = root.querySelector('#gmt-notes');
    const keep = notes ? notes.value : null;
    const tools = root.querySelector('.gmt-grid');
    tools.innerHTML = trackerHtml() + turnsHtml() + challengesHtml() + foesHtml() + villainsHtml() + twistHtml();
    if (keep != null && notes) notes.value = keep;
    save();
  }

  // ------------------------------------------------------------------ actions
  const byId = (list, id) => list.find(x => x.id === id);
  function act(el) {
    const a = el.dataset.gm, id = el.dataset.id, i = +el.dataset.i, t = S.tracker;
    const total = t.g + t.y + t.r;
    if (a === 'mark') t.marked = i < t.marked ? i : i + 1;
    if (a === 'advance') t.marked = Math.min(total, t.marked + 1);
    if (a === 'unmark') t.marked = Math.max(0, t.marked - 1);
    if (a === 'treset') t.marked = 0;
    if (a === 'preset') { const [g, y, r] = TRACKERS[el.dataset.p][1]; Object.assign(t, { g, y, r, marked: 0 }); }
    if (a === 'tsize') { const c = el.dataset.c; t[c] = Math.max(1, Math.min(8, t[c] + +el.dataset.d)); t.marked = Math.min(t.marked, t.g + t.y + t.r); }
    if (a === 'acted') { const x = byId(S.turns, id); if (x) x.acted = !x.acted; }
    if (a === 'turnDel') S.turns = S.turns.filter(x => x.id !== id);
    if (a === 'newRound') { S.round++; S.turns.forEach(x => { x.acted = false; }); }
    if (a === 'addTracker') S.turns.push({ id: uid(), name: 'Marcador de cena', kind: 'tracker', acted: false });
    if (a === 'chDel') S.challenges = S.challenges.filter(x => x.id !== id);
    if (a === 'chDone') { const c = byId(S.challenges, id); if (c) c.done = i < c.done ? i : i + 1; }
    if (a === 'chTick') { const c = byId(S.challenges, id); if (c) c.ticks = i < c.ticks ? i : i + 1; }
    if (a === 'foeDel') S.foes = S.foes.filter(x => x.id !== id);
    if (a === 'foeSel') { const f = byId(S.foes, id); if (f) f.sel = i; }
    if (a === 'foeHit') foeHit(byId(S.foes, id));
    if (a === 'foeRoll') { const f = byId(S.foes, id); if (f) f.last = 'Ação: ' + f.dice.map(d => `${d} → <b>${rollDie(d)}</b>`).join(' · ') + (f.kind === 'minion' && f.dice.length > 1 ? '. Distribua os resultados entre os alvos.' : '.'); }
    if (a === 'vilDel') S.villains = S.villains.filter(x => x.id !== id);
    if (a === 'vilHp') { const v = byId(S.villains, id); if (v) v.hp = Math.max(0, Math.min(v.max, v.hp + +el.dataset.d)); }
    if (a === 'twist') twist(el.dataset.t);
    if (a === 'backup') { exportBackup(); return; }
    if (a === 'tableReset') { if (!confirm('Limpar a mesa? Marcador, turnos, desafios, lacaios e vilões voltam ao zero. As notas continuam.')) return; S = blank(); }
    render();
    const again = root.querySelector(`[data-gm="${a}"]${id ? `[data-id="${id}"]` : ''}${el.dataset.i != null ? `[data-i="${el.dataset.i}"]` : ''}`);
    if (again && !again.disabled) again.focus();   // keep keyboard focus through the re-render
  }

  // Damage save: minions fall on a failed save and shrink on a success; lieutenants shrink on a failed save.
  function foeHit(f) {
    if (!f || !f.dice.length) return;
    const dmg = parseInt(f.dmg, 10);
    if (!(dmg >= 0)) { f.last = 'Digite o dano do ataque.'; return; }
    const sel = Math.min(f.sel || 0, f.dice.length - 1), d = f.dice[sel];
    const who = f.kind === 'lieutenant' ? 'O tenente' : `O lacaio ${sel + 1}`;
    const out = () => { f.dice.splice(sel, 1); f.out = (f.out || 0) + 1; f.sel = 0; };
    if (f.kind === 'lieutenant' && dmg >= 2 * dn(d)) { out(); f.last = `Dano ${dmg}, pelo menos o dobro do ${d}: <b>derrotado sem rolar</b>.`; return; }
    const r = rollDie(d);
    const head = `${who} (${d}) rolou <b>${r}</b> contra ${dmg} de dano: `;
    if (f.kind === 'minion') {
      if (r < dmg) { out(); f.last = head + '<b>derrotado</b>.'; }
      else if (d === 'd4') f.last = head + 'resistiu e continua em d4 (última resistência).';
      else { f.dice[sel] = down(d); f.last = head + `resistiu, mas cai para <b>${f.dice[sel]}</b>.`; }
    } else if (r < dmg) {
      if (d === 'd4') { out(); f.last = head + 'falhou em d4: <b>derrotado</b>.'; }
      else { f.dice[sel] = down(d); f.last = head + `falhou e cai para <b>${f.dice[sel]}</b>.`; }
    } else f.last = head + 'resistiu, nada acontece.';
    f.dmg = '';
  }

  function twist(kind) {
    const T = window.GM_TWISTS || {};
    const here = T[S.region] || T.any;
    const pool = here[kind].concat(S.region === 'any' ? [] : T.any[kind].slice(0, 2));
    let text;
    do { text = pool[Math.floor(Math.random() * pool.length)]; } while (pool.length > 1 && S.twist && S.twist.text === text);
    const r = (window.REGIONS || []).find(x => x.id === S.region);
    S.twist = { t: kind, text, where: r ? r.name : 'Qualquer lugar' };
  }

  function add(form) {
    const f = Object.fromEntries(new FormData(form));
    const name = String(f.name || '').trim();
    if (!name) return;
    const n = (v, lo, hi, def) => { const x = parseInt(v, 10); return isNaN(x) ? def : Math.max(lo, Math.min(hi, x)); };
    if (form.dataset.gmForm === 'turn') S.turns.push({ id: uid(), name, kind: f.kind, acted: false });
    if (form.dataset.gmForm === 'challenge') S.challenges.push({ id: uid(), name, need: n(f.need, 1, 5, 1), done: 0, timer: n(f.timer, 0, 8, 0), ticks: 0 });
    if (form.dataset.gmForm === 'foe') {
      const count = f.kind === 'lieutenant' ? 1 : n(f.count, 1, 12, 3);
      S.foes.push({ id: uid(), name, kind: f.kind, dice: Array(count).fill(DICE.includes(f.die) ? f.die : 'd8'), sel: 0, out: 0, dmg: '', last: '' });
    }
    if (form.dataset.gmForm === 'villain') { const max = n(f.max, 1, 200, 40); S.villains.push({ id: uid(), name, max, hp: max, st0: 'd8', st1: 'd8', st2: 'd8', notes: '' }); }
    render();
    const again = root.querySelector(`[data-gm-form="${form.dataset.gmForm}"] input[name=name]`);
    if (again) again.focus();
  }

  window.GM_TOOLS = {
    async mount(el, rawKeyB64) {
      root = el;
      root.innerHTML = `<div class="gmt"><div class="gmt-head"><div><div class="eyebrow">Durante a sessão</div><h2>Mesa do Mestre</h2>
        <p>Ferramentas para conduzir a cena. Tudo fica salvo neste navegador enquanto você joga.</p></div>
        <nav class="gmt-nav" aria-label="Ferramentas">${[['gmt-tracker', 'Marcador'], ['gmt-turns', 'Turnos'], ['gmt-challenges', 'Desafios'], ['gmt-foes', 'Lacaios'], ['gmt-villains', 'Vilões'], ['gmt-twists', 'Reviravoltas'], ['gmt-notes-sec', 'Notas']].map(([h, l]) => `<a href="#${h}">${l}</a>`).join('')}</nav></div>
        <div class="gmt-grid"></div>${notesHtml()}</div>`;
      render();
      root.addEventListener('click', ev => { const el2 = ev.target.closest('[data-gm]'); if (el2 && root.contains(el2)) { ev.preventDefault(); act(el2); } });
      root.addEventListener('submit', ev => { const form = ev.target.closest('[data-gm-form]'); if (form) { ev.preventDefault(); add(form); } });
      root.addEventListener('input', ev => {
        const t = ev.target;
        if (t.dataset.dmg) { const f = byId(S.foes, t.dataset.dmg); if (f) { f.dmg = t.value; save(); } return; }
        if (t.dataset.gmv === 'vil' && t.tagName === 'TEXTAREA') { const v = byId(S.villains, t.dataset.id); if (v) { v.notes = t.value; save(); } return; }
        if (t.id === 'gmt-notes') { say('Salvando…'); clearTimeout(notesTimer); notesTimer = setTimeout(() => saveNotes(t.value), 600); }
      });
      root.addEventListener('change', ev => {
        const t = ev.target;
        if (t.id === 'gmt-import') { if (t.files[0]) importBackup(t.files[0]); t.value = ''; return; }
        if (t.dataset.gmv === 'region') { S.region = t.value; S.twist = null; render(); return; }
        if (t.dataset.gmv === 'vil' && t.tagName === 'SELECT') { const v = byId(S.villains, t.dataset.id); if (v) { v[t.dataset.f] = t.value; save(); } }
      });
      root.addEventListener('keydown', ev => { if ((ev.key === 'Enter' || ev.key === ' ') && ev.target.matches('label[for="gmt-import"]')) { ev.preventDefault(); ev.target.click(); } });
      try {
        key = await crypto.subtle.importKey('raw', b64(rawKeyB64), 'AES-GCM', false, ['encrypt', 'decrypt']);
        await loadNotes();
      } catch (e) { say('Não foi possível abrir as notas neste navegador.'); }
    }
  };
})();
