/* The Antagonist Forge (antagonista.html): the Game Master's version of the Champion Forge.
   Ten chapters build an antagonist the way chapter 5 of the rulebook does (approach, dice, abilities, archetype,
   upgrades, mastery); the last two let the GM rename powers, qualities and abilities and print the sheet.
   The sheet reuses the champion sheet's look, so it prints, exports to PDF and saves to .json the same way.
   The page is only reachable behind the GM Screen: it checks the key the screen keeps for this tab. */
(() => {
  'use strict';
  const VD = window.GM_VDATA;
  const KEY = 'runeterra-antagonist-v1', ROSTER = 'runeterra-antagonist-roster-v1', SLOT = id => 'runeterra-antagonist-' + id;
  const OLD = 'runeterra-gm-villain-v1', GMKEY = 'runeterra-gm-key', TABLE = 'runeterra-gm-table-v1';
  const DIES = ['d4', 'd6', 'd8', 'd10', 'd12'];
  const ROMAN = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI'];
  const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const $ = s => document.querySelector(s);
  const ico = (n, c) => (window.ICO ? window.ICO(n, c) : '');
  const die = (d, c = '') => `<span class="die ${d} ${c}">${d.slice(1)}</span>`;
  const dt = t => esc(t).replace(/\bd(4|6|8|10|12)\b/g, (m, n) => die('d' + n));   // "d8" in running text becomes a die
  const uid = () => Math.random().toString(36).slice(2, 10);
  const sgn = n => (n >= 0 ? '+' : '') + n;
  const bump = d => DIES[Math.min(DIES.length - 1, DIES.indexOf(d) + 1)];
  const firstSentence = t => String(t).split(/(?<=[.!?])\s/)[0];
  const b64 = s => Uint8Array.from(atob(s), c => c.charCodeAt(0));
  const ZONES = [[100, ['Máx−75', '74−26', '25−1']], [95, ['95−70', '69−25', '24−1']], [90, ['90−66', '65−23', '22−1']], [85, ['85−60', '59−22', '21−1']],
    [80, ['80−55', '54−21', '20−1']], [75, ['75−50', '49−20', '19−1']], [70, ['70−50', '49−18', '17−1']], [65, ['65−45', '44−18', '17−1']],
    [60, ['60−41', '40−17', '16−1']], [55, ['55−38', '37−17', '16−1']], [50, ['50−35', '34−16', '15−1']], [45, ['45−32', '31−16', '15−1']],
    [40, ['40−30', '29−15', '14−1']], [35, ['35−27', '26−13', '12−1']], [30, ['30−23', '22−12', '11−1']], [25, ['25−20', '19−10', '9−1']],
    [20, ['20−16', '15−8', '7−1']], [15, ['15−11', '10−6', '5−1']], [10, ['10', '9−5', '4−1']]];
  const zonesFor = max => { const r = ZONES.find(z => max >= z[0]) || ZONES[ZONES.length - 1]; return r[1]; };
  // Zone ranges as [from, to] numbers for the sheet's burst boxes ("74−26" → 74 to 26; "Máx−75" → max to 75)
  const zoneRange = (txt, max) => { const m = String(txt).replace('Máx', max).split('−'); return m.length > 1 ? `${m[0]}–${m[1]}` : m[0]; };

  // ------------------------------------------------------------------ state
  const STEPS = [
    { id: 'concept', name: 'Conceito', sub: 'Quem é', title: 'Dê vida ao antagonista', lede: 'Comece pela pessoa, não pelos números: <b>quem é</b>, <b>o que quer</b> e <b>como bate de frente</b> com os campeões do seu grupo. Nome, aparência e retrato entram na ficha.' },
    { id: 'ap', name: 'Abordagem', sub: 'Como age', title: 'Escolha a abordagem', lede: 'A <b>abordagem</b> diz <b>como o antagonista age</b>: dá os dados de poder e qualidade, a Vida base e as habilidades de ação dele. Leia as cartas e escolha pelo estilo, não pelo número.' },
    { id: 'dice', name: 'Dados', sub: 'Poderes e qualidades', title: 'Ligue os dados a poderes e qualidades', lede: 'Cada dado que a abordagem dá precisa de um <b>poder</b> ou de uma <b>qualidade</b>. Use as sugestões como ponto de partida e troque à vontade para combinar com o conceito.' },
    { id: 'abap', name: 'Habilidades', sub: 'Da abordagem', title: 'Escolha as habilidades da abordagem', lede: 'Escolha o número de habilidades indicado. A maioria tem um espaço <b>[poder]</b> ou <b>[qualidade]</b>: indique qual dos <b>seus</b> traços a habilidade usa.' },
    { id: 'arch', name: 'Arquétipo', sub: 'O que importa', title: 'Escolha o arquétipo', lede: 'O <b>arquétipo</b> diz <b>do que o antagonista se importa na cena</b> e define o dado de <b>status</b>: ele muda conforme a Vida, o número de lacaios, de campeões ou de invenções.' },
    { id: 'abar', name: 'Habilidades', sub: 'Do arquétipo', title: 'Escolha as habilidades do arquétipo', lede: 'Elas costumam girar em torno do status: o que o antagonista faz melhor quando o status está alto ou baixo. A lista “combina bem com”, no arquétipo, ajuda a evitar habilidades que se anulam.' },
    { id: 'up', name: 'Melhorias', sub: 'Opcional', title: 'Melhorias (opcional)', lede: 'Cada <b>melhoria</b> deixa o antagonista perigoso o bastante para encarar <b>mais um campeão</b>: soma Vida e dá habilidades. Sem melhorias ele é <b>menor</b>; com uma, vira <b>maior</b>.' },
    { id: 'mast', name: 'Maestria', sub: 'Opcional', title: 'Maestria (opcional)', lede: 'A <b>maestria</b> é uma habilidade passiva que só antagonistas com melhorias ganham: um <b>sucesso automático em um Superar</b> sempre que a condição for cumprida.' },
    { id: 'names', name: 'Nomes', sub: 'Opcional', title: 'Nomes só seus (opcional)', lede: 'Dê nomes próprios a poderes, qualidades e habilidades. A ficha mostra o seu nome e, em letra pequena, o original do livro.' },
    { id: 'finish', name: 'A ficha', sub: 'Pronta para a mesa', title: 'A ficha do antagonista', lede: 'Confira a ficha, adicione-a à Mesa do Mestre, imprima, exporte em PDF ou salve em .json.' }
  ];
  const GUIDE = {
    concept: '<p>Responda em uma frase: <b>quem é</b> o antagonista, <b>o que quer</b> e <b>como bate de frente</b> com os campeões do seu grupo. Ligue-o a algo que os jogadores já se importam: uma região, um rival, uma promessa não cumprida.</p><p>Não precisa estar fechado: o conceito pode mudar enquanto você monta. Abordagem e arquétipo são guias, não correntes.</p><p class="muted">Exemplo: “A Dra. Kaelor cobra a cidade de Zaun por um antídoto contra uma doença que ela mesma espalhou.”</p>',
    ap: '<p>Escolha pelo estilo, não pelo número:</p><ul class="gm-bp-list"><li><b>Ninja, Implacável, Parasita:</b> combate pessoal, caça um alvo.</li><li><b>Mente Mestra, Criador, Tático:</b> planos, lacaios e aliados.</li><li><b>Sobrepoderoso, Ancestral:</b> ameaça enorme, vence-se com esperteza.</li><li><b>Valentão, Orgulhoso, Generalista:</b> briga direta.</li><li><b>Subpoderoso, Habilidoso:</b> ameaças menores, boas para começar.</li></ul><p class="muted">Quanto maior a Vida base, mais tempo o antagonista dura na cena.</p>',
    dice: '<p>Use as sugestões como ponto de partida e troque à vontade para combinar com o conceito (Sombras para um antagonista das Ilhas das Sombras, Tóxico para um alquimista de Zaun).</p><p>A <b>qualidade de interpretação</b> (d8) é uma frase que define como o antagonista age na história, como a Qualidade Marcante do campeão: “Luto Eterno”, “Fé no Fim”, “Sorriso Calculado”.</p>',
    abap: '<p>Dê o dado mais alto às habilidades principais. Algumas abordagens têm uma regra extra (por exemplo, usar poderes diferentes em cada habilidade). A Forja avisa quando ela não é cumprida.</p>',
    arch: '<ul class="gm-bp-list"><li><b>Brutamontes, Frágil:</b> status pela própria Vida, como os campeões.</li><li><b>Legião, Senhor da Horda:</b> contam lacaios (Legião: quanto mais, mais fraco).</li><li><b>Predador, Guerrilheiro:</b> contam oponentes engajados.</li><li><b>Solitário, Esquadrão:</b> contam outros antagonistas.</li><li><b>Indomável:</b> status fixo. <b>Titã:</b> começa em d12 e tem um desafio para reduzir o status.</li></ul>',
    abar: '<p>Escolha o número de habilidades do arquétipo. A etiqueta “Combina com a abordagem” mostra os arquétipos que a combinam bem com a que você escolheu.</p>',
    up: '<p>Um antagonista sem melhorias é <b>menor</b> (conta como um elemento moderado na cena); com uma melhoria, vira <b>maior</b> (elemento difícil).</p><p class="muted">Dicas: use “Esquadrão de capangas” para um antagonista no próprio covil; “Aprimoramento de poder” e “de qualidade” para quem fez um ritual ou treino; “Veículo antagonista” para um navio ou máquina de guerra.</p>',
    mast: '<p>A maestria dá um <b>sucesso automático em um Superar</b> (resolver problemas fora de combate: convencer, tomar, construir, abrir) <b>sempre que a condição for cumprida</b>. Não rola dado e não vale para ataques.</p><p>Os campeões enfrentam a maestria <b>quebrando a condição</b>: cortar o contrato, destruir o laboratório, tirá-lo do comando.</p>',
    names: '<p>Renomear não muda as regras, só como o traço aparece na ficha. Deixe em branco para usar o nome do livro.</p>',
    finish: '<p><b>Vida = abordagem + arquétipo + 5 × número de campeões + melhorias.</b> Com mais campeões na mesa, o antagonista aguenta mais. Confira os avisos: eles mostram o que ainda falta.</p>'
  };
  const blank = () => ({ cid: uid(), name: '', alias: '', concept: '', note: '', portrait: null, n: 4, ap: '', arch: '', P: {}, Q: {}, rp: '', ab: {}, tk: {}, up: {}, mastery: '',
    renames: {}, traitNames: {}, play: { cur: '', notes: [], plans: [] }, step: 'concept', maxStep: 0, seen: {}, updated: 0 });
  const read = k => { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } };
  const normalize = o => { const b = blank(); const s = Object.assign(b, o || {}); s.play = Object.assign(b.play, s.play || {}); return s; };
  const rosterIds = () => { const r = read(ROSTER); return Array.isArray(r) ? r : []; };
  let S = (() => {
    const cur = read(KEY);
    if (cur) return normalize(cur);
    const old = read(OLD);   // the builder that lived inside the GM Screen
    if (old && (old.name || old.ap || old.arch)) return normalize(Object.assign({}, old, { step: 'concept' }));
    return blank();
  })();
  const ui = { guide: {}, sheetUpdate: null };
  let storageWarned = false;
  function save() {
    S.updated = Date.now();
    try {
      localStorage.setItem(KEY, JSON.stringify(S));
      localStorage.setItem(SLOT(S.cid), JSON.stringify(S));
      const ids = rosterIds(); if (!ids.includes(S.cid)) { ids.push(S.cid); localStorage.setItem(ROSTER, JSON.stringify(ids)); }
    } catch (e) { if (!storageWarned) { storageWarned = true; alert('Este navegador está sem espaço: a última mudança pode não ter sido salva. Exporte seus antagonistas (Arquivo) e remova retratos ou antagonistas antigos.'); } }
    const c = $('#roster-count'); if (c) c.textContent = rosterIds().length || '';
  }

  // ------------------------------------------------------------------ traits and the model
  const cats = () => Object.entries(window.TRAIT_CATEGORIES || {});
  const traitKinds = k => (k.startsWith('P:') ? 'power' : 'quality');
  const allTraits = () => cats().flatMap(([ck, v]) => (v.items || []).map(i => ({ key: i[0], name: i[2] || i[1], desc: i[3] || '', kind: traitKinds(ck), cat: ck, catName: v.rt || ck })));
  const tName = key => { const t = allTraits().find(x => x.key === key); return t ? t.name : ''; };
  const tShow = key => (S.traitNames[key] && S.traitNames[key].trim()) || tName(key);   // the name the GM gave it, else the book's
  const tRenamed = key => !!(S.traitNames[key] && S.traitNames[key].trim() && S.traitNames[key].trim() !== tName(key));
  const origTag = name => `<small class="hs-orig">${esc(name)}</small>`;
  const traitOptions = (kind, sel) => cats().filter(([ck]) => traitKinds(ck) === kind)
    .map(([ck, v]) => `<optgroup label="${esc(v.rt || ck)}">${(v.items || []).map(i => `<option value="${esc(i[0])}"${sel === i[0] ? ' selected' : ''}>${esc(i[2] || i[1])}</option>`).join('')}</optgroup>`).join('');
  const TOKEN_RE = /\[(poder\/qualidade|energia\/elemento|poder|qualidade)\]/g;
  const tokensOf = text => [...new Set([...text.matchAll(TOKEN_RE)].map(m => m[1]))];

  function model() {
    const N = S.n, ap = VD.approaches.find(x => x.id === S.ap), ar = VD.archetypes.find(x => x.id === S.arch);
    const ups = VD.upgrades.filter(u => S.up[u.id]);
    const pUp = ups.some(u => u.id === 'power'), qUp = ups.some(u => u.id === 'quality');
    const pDice = ap ? ap.P.map(d => (pUp ? bump(d) : d)) : [], qDice = ap ? ap.Q.map(d => (qUp ? bump(d) : d)) : [];
    const pOver = ap && pUp && ap.P.some(d => d === 'd12'), qOver = ap && qUp && ap.Q.some(d => d === 'd12');
    const needA = ap ? ap.pick + (qOver ? 1 : 0) : 0;
    const arPool = ar ? ar.ab.filter(a => a.n !== ar.gain) : [];
    const needR = ar ? ar.pick + (pOver ? 1 : 0) : 0;
    const chosenA = ap ? ap.ab.map((a, i) => ({ a, id: 'a:' + i })).filter(x => S.ab[x.id]) : [];
    const chosenR = ar ? arPool.map(a => ({ a, id: 'r:' + ar.ab.indexOf(a) })).filter(x => S.ab[x.id]) : [];
    const gain = ar && ar.gain ? ar.ab.filter(a => a.n === ar.gain).map(a => ({ a, id: 'g:' + a.n })) : [];
    const upAb = [];
    for (const u of ups) u.ab.forEach((a, i) => { if (u.id !== 'vehicle' || S.ab['u:vehicle:' + i]) upAb.push({ a, id: `u:${u.id}:${i}`, src: u.n }); });
    const upH = ups.reduce((n, u) => n + u.hp, 0);
    const hp = ap && ar ? ap.hp + ar.hp + 5 * N + upH : null;
    const mastery = ups.length ? VD.masteries.find(m => m.n === S.mastery) : null;
    return { N, ap, ar, ups, pDice, qDice, pOver, qOver, needA, needR, arPool, chosenA, chosenR, gain, upAb, upH, hp, mastery };
  }
  // an ability's text with the traits the GM picked, in the names the GM gave them
  const fill = (x, id) => x.x.replace(TOKEN_RE, (m, t) => { const k = S.tk[id + '|' + t]; return k ? `«${tShow(k)}»` : m; });
  const mine = kind => (VD.approaches.find(x => x.id === S.ap) ? Object.values(kind === 'power' ? S.P : S.Q).filter(Boolean) : []);
  function tokenPick(id, text) {
    return tokensOf(text).map(t => {
      const keys = t === 'poder' ? mine('power') : t === 'qualidade' ? mine('quality') : t === 'energia/elemento' ? mine('power').filter(k => (window.TRAIT_CATEGORIES['P:elemental'] || { items: [] }).items.some(i => i[0] === k)) : mine('power').concat(mine('quality'));
      const cur = S.tk[id + '|' + t] || '';
      return `<label class="gm-bp-tok">[${esc(t)}] <select data-b="tk" data-id="${esc(id)}" data-t="${esc(t)}"><option value="">escolher…</option>${[...new Set(keys)].map(k => `<option value="${esc(k)}"${cur === k ? ' selected' : ''}>${esc(tShow(k))}</option>`).join('')}</select></label>`;
    }).join('');
  }
  const openTokens = x => tokensOf(x.a.x).filter(t => !S.tk[x.id + '|' + t]);
  // what the builder still lacks or breaks, in plain words
  function issues(m) {
    const I = [];
    if (!m.ap || !m.ar) { if (!m.ap) I.push('Escolha uma abordagem.'); if (!m.ar) I.push('Escolha um arquétipo.'); return I; }
    const lackP = m.pDice.filter((d, i) => !S.P[i]).length, lackQ = m.qDice.filter((d, i) => !S.Q[i]).length;
    if (lackP) I.push(`Faltam ${lackP} dado(s) de poder para atribuir.`);
    if (lackQ) I.push(`Faltam ${lackQ} dado(s) de qualidade para atribuir.`);
    if (!S.rp.trim()) I.push('Dê um nome à qualidade de interpretação (d8).');
    if (m.chosenA.length < m.needA) I.push(`Faltam ${m.needA - m.chosenA.length} habilidade(s) da abordagem.`);
    if (m.chosenR.length < m.needR) I.push(`Faltam ${m.needR - m.chosenR.length} habilidade(s) do arquétipo.`);
    for (const x of m.chosenA.concat(m.chosenR, m.gain, m.upAb)) {
      const open = openTokens(x);
      if (open.length) I.push(`Escolha o ${open.map(t => '[' + t + ']').join(' e ')} usado em “${x.a.n}”.`);
    }
    // the rule some approaches add on top of the number of abilities
    const used = m.chosenA.map(x => tokensOf(x.a.x).map(t => S.tk[x.id + '|' + t]).filter(Boolean)[0]);
    if (m.ap.rule && used.length === m.ap.pick && used.every(Boolean)) {
      const uniq = new Set(used);
      if (m.ap.rule === 'all-diff' && uniq.size !== used.length) I.push(`${m.ap.n}: ${m.ap.note.charAt(0).toLowerCase() + m.ap.note.slice(1)} Hoje há ${used.length - uniq.size} repetição(ões).`);
      if (m.ap.rule === 'two-one') {
        const counts = [...uniq].map(k => used.filter(u => u === k).length).sort();
        if (!(counts.length === 2 && counts[0] === 1 && counts[1] === 2)) I.push(`${m.ap.n}: ${m.ap.note.charAt(0).toLowerCase() + m.ap.note.slice(1)}`);
        const bad = used.filter(k => { const t = allTraits().find(x => x.key === k); return t && t.kind !== (m.ap.kind === 'poder' ? 'power' : 'quality'); });
        if (bad.length) I.push(`${m.ap.n}: aqui as habilidades usam ${m.ap.kind === 'poder' ? 'poderes' : 'qualidades'}, mas ${bad.length} usa(m) o outro tipo.`);
      }
    }
    return I;
  }
  // what one chapter still lacks
  function stepIssues(id, m) {
    const I = issues(m), N = [];
    if (id === 'concept') { if (!S.name.trim()) N.push('Dê um nome ao antagonista.'); return N; }
    if (id === 'ap' && !m.ap) return ['Escolha uma abordagem.'];
    if (id === 'arch' && !m.ar) return ['Escolha um arquétipo.'];
    if (['dice', 'abap'].includes(id) && !m.ap) return ['Escolha primeiro a abordagem.'];
    if (id === 'abar' && !m.ar) return ['Escolha primeiro o arquétipo.'];
    if (id === 'dice') {
      const p = m.pDice.filter((d, i) => !S.P[i]).length, q = m.qDice.filter((d, i) => !S.Q[i]).length;
      if (p) N.push(`Faltam ${p} dado(s) de poder.`);
      if (q) N.push(`Faltam ${q} dado(s) de qualidade.`);
      if (!S.rp.trim()) N.push('Dê um nome à qualidade de interpretação (d8).');
    }
    if (id === 'abap' || id === 'abar') {
      const ch = id === 'abap' ? m.chosenA : m.chosenR, need = id === 'abap' ? m.needA : m.needR;
      if (ch.length < need) N.push(`Faltam ${need - ch.length} habilidade(s).`);
      for (const x of (id === 'abap' ? ch : ch.concat(m.gain))) { const open = openTokens(x); if (open.length) N.push(`Escolha o ${open.map(t => '[' + t + ']').join(' e ')} usado em “${x.a.n}”.`); }
      if (id === 'abap' && m.ap) for (const t of I) if (t.startsWith(m.ap.n + ':')) N.push(t);
    }
    if (id === 'up') for (const x of m.upAb) { const open = openTokens(x); if (open.length) N.push(`Escolha o ${open.map(t => '[' + t + ']').join(' e ')} usado em “${x.a.n}”.`); }
    if (id === 'finish') return I.concat(S.name.trim() ? [] : ['Dê um nome ao antagonista.']);
    return N;
  }
  const stepIdx = id => STEPS.findIndex(s => s.id === id);
  // chapters open up to the first unfinished one
  function reach(m) { for (let i = 0; i < STEPS.length - 1; i++) if (stepIssues(STEPS[i].id, m).length) return i; return STEPS.length - 1; }

  // ------------------------------------------------------------------ chapter bodies
  const vcard = (data, on, dis, inner) => `<div class="vf-card${on ? ' on' : ''}${dis ? ' dis' : ''}" role="button" tabindex="${dis ? -1 : 0}" aria-pressed="${on ? 'true' : 'false'}"${dis ? ' aria-disabled="true"' : ''} ${data}>${inner}</div>`;
  const typeName = t => (t === 'A' ? 'Ação' : t === 'R' ? 'Reação' : 'Passiva');
  const abCard = (id, a, on, dis) => vcard(`data-a="ab" data-id="${esc(id)}"`, on, dis, `<header><h4>${esc(S.renames[id] && S.renames[id].trim() ? S.renames[id].trim() : a.n)}</h4><span class="gm-bp-ty">${typeName(a.t)}</span></header><p>${dt(a.x)}</p>${on ? tokenPick(id, a.x) : ''}`);
  const fixedCard = (id, a, src) => `<div class="vf-card on fixed"><header><h4>${esc(S.renames[id] && S.renames[id].trim() ? S.renames[id].trim() : a.n)}</h4><span class="gm-bp-ty">${typeName(a.t)}</span></header><p>${dt(a.x)}</p>${tokenPick(id, a.x)}<small class="muted">Sempre inclusa (${esc(src)})</small></div>`;
  const counter = (list, need) => `<span class="gm-bp-count${list.length === need ? ' ok' : list.length > need ? ' bad' : ''}">${list.length}/${need}</span>`;
  const diceRow = arr => arr.map(d => die(d)).join(' ');
  const field = (path, label, ph, v) => `<label class="field"><span>${label}</span><input type="text" data-b="${path}" value="${esc(v)}" placeholder="${esc(ph || '')}"></label>`;

  function body(id, m) {
    const ap = m.ap, ar = m.ar;
    if (id === 'concept') return `<div class="grid3">${field('name', 'Nome', 'Ex.: Capitão Dorrick Maré-Negra', S.name)}${field('alias', 'Título ou alcunha', 'Ex.: o Terror das Marés', S.alias)}${field('concept', 'Conceito', 'Quem é, o que quer, como enfrenta os campeões', S.concept)}</div>
      <label class="field"><span>Aparência, jeito de falar e motivos</span><textarea data-b="note" rows="3" placeholder="Como ele se parece, como fala, o que o move…">${esc(S.note)}</textarea></label>
      <div class="portrait-row"><div class="hs-portrait small">${S.portrait ? `<img src="${S.portrait}" alt="Retrato">` : '<span class="muted">Sem retrato</span>'}</div>
        <div><label class="btn small" for="portrait-file">${S.portrait ? 'Trocar retrato' : 'Adicionar retrato'}</label> ${S.portrait ? '<button class="btn small ghost" data-a="clearPortrait">Remover</button>' : ''}<input id="portrait-file" type="file" accept="image/*" hidden>
          <p class="portrait-hint">Melhor formato: imagem em pé, 3:4 (por exemplo 900 × 1200 px). Outros formatos são cortados para caber na moldura da ficha. A imagem fica só neste navegador e dentro do arquivo .json e do PDF.</p></div></div>`;
    if (id === 'ap') return `<div class="vf-cards">${VD.approaches.map(a => vcard(`data-a="ap" data-v="${a.id}"`, S.ap === a.id, false, `<header><h4>${esc(a.n)}</h4><span class="vf-hp">Vida base ${a.hp}</span></header><p class="vf-d">${esc(a.d)}</p>
        <p class="vf-stat"><b>Poderes</b> ${diceRow(a.P)}</p><p class="vf-stat"><b>Qualidades</b> ${diceRow(a.Q)} ${die('d8')}</p>
        <p class="vf-stat"><b>Habilidades</b> escolha ${a.pick} de ${a.ab.length}</p><p class="vf-list">${a.ab.map(x => esc(x.n)).join(' · ')}</p>${a.note ? `<p class="vf-note">${esc(a.note)}</p>` : ''}`)).join('')}</div>`;
    if (id === 'dice') {
      if (!ap) return '<p class="muted">Escolha primeiro a abordagem.</p>';
      const slots = (kind, dice, store) => dice.map((d, i) => `<label class="gm-bp-slot">${die(d)} <select data-b="${kind}" data-i="${i}"><option value="">—</option>${traitOptions(kind === 'P' ? 'power' : 'quality', store[i])}</select></label>`).join('');
      return `<h5>Poderes <small>sugestão: ${esc(ap.sp)}</small></h5><div class="gm-bp-slots">${slots('P', m.pDice, S.P)}</div>
        <h5>Qualidades <small>sugestão: ${esc(ap.sq)}</small></h5><div class="gm-bp-slots">${slots('Q', m.qDice, S.Q)}
          <label class="gm-bp-slot">${die('d8')} <input type="text" data-b="rp" value="${esc(S.rp)}" placeholder="Qualidade de interpretação"></label></div>
        ${m.pOver || m.qOver ? '<p class="muted">Um dado já era d12 e o aprimoramento não o sobe mais: em troca, você ganha uma habilidade extra.</p>' : ''}`;
    }
    if (id === 'abap') return !ap ? '<p class="muted">Escolha primeiro a abordagem.</p>' : `<p class="vf-count">Escolha ${m.needA} ${counter(m.chosenA, m.needA)}</p><div class="vf-cards wide">${ap.ab.map((a, i) => abCard('a:' + i, a, !!S.ab['a:' + i], !S.ab['a:' + i] && m.chosenA.length >= m.needA)).join('')}</div>`;
    if (id === 'arch') return `<div class="vf-cards">${VD.archetypes.map(a => vcard(`data-a="arch" data-v="${a.id}"`, S.arch === a.id, false, `<header><h4>${esc(a.n)}</h4><span class="vf-hp">Vida ${sgn(a.hp)}</span></header>${ap && a.pairs && a.pairs.toLowerCase().includes(ap.n.toLowerCase()) ? '<span class="vf-fit">Combina com a abordagem escolhida</span>' : ''}<p class="vf-d">${esc(a.d)}</p>
        <table class="vf-mini">${a.status.map(s => `<tr><td>${dt(s[0])}</td><td>${die(s[1])}</td></tr>`).join('')}</table>
        <p class="vf-stat"><b>Habilidades</b> escolha ${a.pick} de ${a.ab.length - (a.gain ? 1 : 0)}${a.gain ? ' (+ ' + esc(a.gain) + ')' : ''}</p>
        ${a.challenge ? `<ul class="vf-note">${a.challenge.map(c => '<li>' + esc(c) + '</li>').join('')}</ul>` : ''}<p class="vf-note">Combina bem com: ${esc(a.pairs)}.</p>`)).join('')}</div>`;
    if (id === 'abar') return !ar ? '<p class="muted">Escolha primeiro o arquétipo.</p>' : `<p class="vf-count">Escolha ${m.needR} ${counter(m.chosenR, m.needR)}</p><div class="vf-cards wide">${m.arPool.map(a => abCard('r:' + ar.ab.indexOf(a), a, !!S.ab['r:' + ar.ab.indexOf(a)], !S.ab['r:' + ar.ab.indexOf(a)] && m.chosenR.length >= m.needR)).join('')}${m.gain.map(g => fixedCard(g.id, g.a, ar.n)).join('')}</div>`;
    if (id === 'up') {
      const upList = m.ups.filter(u => u.ab.length);
      return `<div class="vf-cards">${VD.upgrades.map(u => vcard(`data-a="up" data-id="${u.id}"`, !!S.up[u.id], false, `<header><h4>${esc(u.n)}</h4><span class="vf-hp">Vida ${sgn(u.hp)}</span></header><p class="vf-d">${esc(u.when)}</p>
          ${u.ab.length ? `<ul class="vf-ablist">${u.ab.map(a => `<li><b>${esc(a.n)}</b> <span class="gm-bp-ty">${a.t}</span> ${dt(firstSentence(a.x))}</li>`).join('')}</ul>` : '<p class="vf-note">Sem habilidades extras: só soma Vida.</p>'}${u.note ? `<p class="vf-note">${esc(u.note)}</p>` : ''}`)).join('')}</div>
        ${upList.length ? `<h5>Habilidades das melhorias</h5><div class="vf-cards wide">${upList.map(u => u.ab.map((a, i) => u.id === 'vehicle' ? abCard('u:vehicle:' + i, a, !!S.ab['u:vehicle:' + i], false) : fixedCard('u:' + u.id + ':' + i, a, u.n)).join('')).join('')}</div>${m.ups.some(u => u.id === 'vehicle') ? '<p class="muted">Veículo antagonista: monte um tenente com 2 a 4 destas habilidades (mais habilidades para mais campeões).</p>' : ''}` : ''}`;
    }
    if (id === 'mast') {
      if (!m.ups.length) return '<p class="muted">A maestria só existe para antagonistas com pelo menos uma melhoria. Volte ao capítulo anterior se quiser um antagonista maior.</p>';
      return `<div class="vf-cards">${vcard('data-a="mast" data-v=""', !S.mastery, false, '<header><h4>Sem maestria</h4></header><p class="vf-d">O antagonista fica só com as habilidades e as melhorias.</p>')}${VD.masteries.map(x => vcard(`data-a="mast" data-v="${esc(x.n)}"`, S.mastery === x.n, false, `<header><h4>${esc(x.n)}</h4><span class="gm-bp-ty">Passiva</span></header>
        <p class="vf-stat"><b>Quando vale</b> ${esc(x.cond)}</p><p class="vf-stat"><b>O que faz</b> ${esc(x.x)}</p><p class="vf-note">Exemplo: ${esc(x.ex)}</p>`)).join('')}</div>`;
    }
    if (id === 'names') return namesBody(m);
    return '';
  }

  // rename powers, qualities and abilities: the Forge's "your name for it" cards
  function chosenKeys(m) { return [...new Set(Object.values(S.P).concat(Object.values(S.Q)).filter(Boolean))]; }
  function allAbilityList(m) {
    const L = [];
    for (const x of m.chosenA) L.push({ id: x.id, a: x.a, src: m.ap.n });
    for (const x of m.chosenR.concat(m.gain)) L.push({ id: x.id, a: x.a, src: m.ar.n });
    for (const x of m.upAb) L.push({ id: x.id, a: x.a, src: x.src });
    return L;
  }
  function namesBody(m) {
    if (!m.ap || !m.ar) return '<p class="muted">Escolha a abordagem e o arquétipo para dar nomes aos traços e às habilidades.</p>';
    const tr = chosenKeys(m).map(k => allTraits().find(t => t.key === k)).filter(Boolean);
    const traits = tr.length ? `<h5>Poderes e qualidades</h5><div class="rename-grid">${tr.map(t => `<label class="rename-card"><span class="rn-h"><b>${esc(t.name)}</b><span class="rn-type">${t.kind === 'power' ? 'poder' : 'qualidade'} · ${esc(t.catName)}</span></span><input type="text" data-b="traitNames.${esc(t.key)}" value="${esc(S.traitNames[t.key] || '')}" placeholder="Seu nome para ele (opcional)"><span class="rn-d">${esc(t.desc)}</span></label>`).join('')}</div>` : '';
    const abs = allAbilityList(m);
    const abil = abs.length ? `<h5>Habilidades</h5><div class="rename-grid">${abs.map(x => `<label class="rename-card"><span class="rn-h"><b>${esc(x.a.n)}</b><span class="rn-type">${typeName(x.a.t)} · ${esc(x.src)}</span></span><input type="text" data-b="renames.${esc(x.id)}" value="${esc(S.renames[x.id] || '')}" placeholder="Seu nome para ela (opcional)"><span class="rn-d">${dt(x.a.x)}</span></label>`).join('')}</div>` : '';
    const mast = m.mastery ? `<h5>Maestria</h5><div class="rename-grid"><label class="rename-card"><span class="rn-h"><b>${esc(m.mastery.n)}</b><span class="rn-type">Passiva</span></span><input type="text" data-b="renames.mastery" value="${esc(S.renames.mastery || '')}" placeholder="Seu nome para ela (opcional)"><span class="rn-d">${esc(m.mastery.x)}</span></label></div>` : '';
    return traits + abil + mast;
  }

  // ------------------------------------------------------------------ the sheet
  const abName = (id, base) => (S.renames[id] && S.renames[id].trim()) || base;
  const abNameHtml = (id, base) => esc(abName(id, base)) + (S.renames[id] && S.renames[id].trim() && S.renames[id].trim() !== base ? origTag(base) : '');
  function abLines(m) {
    const L = [];
    for (const x of m.chosenA) L.push({ id: x.id, n: x.a.n, t: x.a.t, x: fill(x.a, x.id), src: m.ap.n });
    for (const x of m.chosenR) L.push({ id: x.id, n: x.a.n, t: x.a.t, x: fill(x.a, x.id), src: m.ar.n });
    for (const x of m.gain) L.push({ id: x.id, n: x.a.n, t: x.a.t, x: fill(x.a, x.id), src: m.ar.n });
    for (const x of m.upAb) L.push({ id: x.id, n: x.a.n, t: x.a.t, x: fill(x.a, x.id), src: x.src });
    return L;
  }
  const lines = (path, list, n, label) => Array.from({ length: n }, (_, i) => `<input class="hs-line" type="text" data-b="${path}.${i}" value="${esc(list[i] || '')}" aria-label="${label} ${i + 1}">`).join('');
  const attr = (label, v) => `<div class="hs-f"><span class="hs-l">${label}</span>${esc(v || '')}</div>`;
  function sheetHtml(m) {
    const ap = m.ap, ar = m.ar;
    if (!ap || !ar) return '<div class="hero-sheet"><div class="hs-page"><p class="muted">Escolha a abordagem e o arquétipo para ver a ficha.</p></div></div>';
    const zoned = ['bruiser', 'fragile'].includes(ar.id);
    const z = zoned ? zonesFor(m.hp) : null;
    const traitRows = (dice, store, n, extra) => {
      const out = dice.map((d, i) => { const k = store[i]; return `<tr><td>${k ? esc(tShow(k)) + (tRenamed(k) ? origTag(tName(k)) : '') : '<span class="muted">?</span>'}</td><td class="dt">${die(d, 'sm')}</td></tr>`; });
      if (extra) out.push(extra);
      while (out.length < n) out.push('<tr><td>&nbsp;</td><td class="dt"></td></tr>');
      return out.join('');
    };
    const rpRow = `<tr><td>${esc(S.rp || '?')}</td><td class="dt">${die('d8', 'sm')}</td></tr>`;
    const groups = [];   // abilities by where they come from
    for (const l of abLines(m)) { let g = groups.find(x => x.src === l.src); if (!g) groups.push(g = { src: l.src, rows: [] }); g.rows.push(l); }
    if (m.mastery) groups.push({ src: 'Maestria', rows: [{ id: 'mastery', n: m.mastery.n, t: 'I', x: m.mastery.x, src: 'Maestria' }] });
    const abRow = r => `<tr><td class="nm">${abNameHtml(r.id, r.n)}</td><td class="ty">${r.t === 'A' ? 'Ação' : r.t === 'R' ? 'Reação' : 'Passiva'}</td><td class="gt">${dt(r.x).replace(/«([^»]+)»/g, '<b>$1</b>')}</td></tr>`;
    const title = esc(S.name || 'Antagonista sem nome');
    return `<div class="hero-sheet">
      <div class="hs-page" id="hs-p1">
        <div class="hs-top">
          <div class="hs-left"><div class="hs-portrait">${S.portrait ? `<img src="${S.portrait}" alt="Retrato de ${title}">` : '<span class="muted">Retrato</span>'}</div>
            <div class="hs-card hs-hpcard"><div class="hs-hr"><div class="hs-h">Vida</div>
              <div class="burst c">Máxima<b>${m.hp}</b></div>
              ${z ? `<div class="burst g">Verde<b>${zoneRange(z[0], m.hp)}</b></div><div class="burst y">Amarela<b>${zoneRange(z[1], m.hp)}</b></div><div class="burst r">Vermelha<b>${zoneRange(z[2], m.hp)}</b></div>` : ''}
              <div class="burst c">Atual<input type="text" inputmode="numeric" data-b="play.cur" value="${esc(S.play.cur === '' || S.play.cur == null ? m.hp : S.play.cur)}" aria-label="Vida atual"></div>
              <div class="hs-track hs-noexport" role="group" aria-label="Ajustar a Vida"><button type="button" data-a="hp" data-d="-1" aria-label="Perder 1 de Vida">−</button><button type="button" data-a="hp" data-d="1" aria-label="Recuperar 1 de Vida">+</button><button type="button" data-a="hp" data-d="max" aria-label="Vida cheia">${ico('reset')}</button></div>
              <small class="muted">Vida para ${m.N} campeões: ${ap.hp} ${ar.hp >= 0 ? '+ ' + ar.hp : '− ' + -ar.hp} + 5×${m.N}${m.upH ? ' + ' + m.upH : ''}</small></div></div></div>
          <div class="hs-idblock">
            <div class="hs-card hs-2"><div><div class="hs-h">Título</div><div class="hs-name">${esc(S.alias || '')}&nbsp;</div></div><div><div class="hs-h">Nome</div><div class="hs-name hs-title">${esc(S.name || 'Antagonista sem nome')}</div></div></div>
            <div class="hs-card"><div class="hs-h">Conceito</div><div class="hs-ml">${esc(S.concept || '')}&nbsp;</div></div>
            <div class="hs-card"><div class="hs-h">Características</div>
              <div class="hs-2">${attr('Abordagem', ap.n)}${attr('Arquétipo', ar.n)}</div>
              <div class="hs-2">${attr('Melhorias', m.ups.length ? m.ups.map(u => u.n).join(', ') : 'nenhuma (antagonista menor)')}${attr('Maestria', m.mastery ? m.mastery.n : '')}</div></div>
            <div class="hs-card"><div class="hs-h">Aparência, jeito de falar e motivos</div><div class="hs-ml">${esc((S.note || '').trim())}&nbsp;</div></div>
          </div>
        </div>
        <div class="hs-bottom">
          <div class="hs-card"><div class="hs-h">Planos e segredos</div>${lines('play.plans', S.play.plans, 6, 'Plano')}</div>
          <div class="hs-card"><div class="hs-h">Notas de mesa</div>${lines('play.notes', S.play.notes, 6, 'Nota')}</div>
        </div>
      </div>
      <div class="hs-page" id="hs-p2">
        <div class="hs-card hs-3"><div><div class="hs-h">Título</div>${esc(S.alias || '')}&nbsp;</div><div><div class="hs-h">Nome</div>${esc(S.name || '')}</div><div><div class="hs-h">Abordagem · Arquétipo</div>${esc(ap.n)} · ${esc(ar.n)}</div></div>
        <div class="hs-2 ant-traits">
          <table class="hs-traits"><thead><tr><th>Poderes</th><th>Dado</th></tr></thead><tbody>${traitRows(m.pDice, S.P, 5)}</tbody></table>
          <table class="hs-traits"><thead><tr><th>Qualidades</th><th>Dado</th></tr></thead><tbody>${traitRows(m.qDice, S.Q, 5, rpRow)}</tbody></table>
        </div>
        <div class="hs-2 ant-traits">
          <table class="hs-traits"><thead><tr><th>Status: ${esc(ar.n)}</th><th>Dado</th></tr></thead><tbody>${ar.status.map(s => `<tr><td>${dt(s[0])}</td><td class="dt">${die(s[1], 'sm')}</td></tr>`).join('')}</tbody></table>
          ${ar.challenge ? `<div class="hs-card"><div class="hs-h">Desafio do arquétipo</div>${ar.challenge.map(c => `<div class="hs-f">${esc(c)}</div>`).join('')}</div>` : '<div></div>'}
        </div>
        <div class="hs-h" style="margin-top:12px">Habilidades</div>
        ${groups.map(g => `<div class="hs-zone src"><div class="zlbl">${esc(g.src)}</div><table class="hs-ab-t"><tbody>${g.rows.map(abRow).join('')}</tbody></table></div>`).join('')}
      </div>
    </div>`;
  }
  function sheetText(m) {
    const tr = (dice, store) => dice.map((d, i) => `${d} ${store[i] ? tShow(store[i]) : '?'}`).join(', ');
    const L = [`${S.name || 'Antagonista sem nome'}${S.alias ? ', ' + S.alias : ''}${S.concept ? ' · ' + S.concept : ''}`, `${m.ap.n} (${m.ap.hp}) + ${m.ar.n} (${m.ar.hp})${m.ups.length ? ' + ' + m.ups.map(u => u.n).join(', ') : ''}${m.mastery ? ' · ' + m.mastery.n : ''}`,
      `Poderes: ${tr(m.pDice, S.P)}`, `Qualidades: ${tr(m.qDice, S.Q)}, d8 ${S.rp || 'qualidade de interpretação'}`,
      `Status: ${m.ar.status.map(s => s[0] + ' ' + s[1]).join(' | ')}`, `Vida para ${m.N} campeões: ${m.ap.hp} + ${m.ar.hp} + 5×${m.N}${m.upH ? ' + ' + m.upH : ''} = ${m.hp}`];
    for (const l of abLines(m)) L.push(`${abName(l.id, l.n).replace(/\s*\(.*$/, '')} [${l.t}]: ${l.x.replace(/«|»/g, '')}`);
    if (m.mastery) L.push(`${abName('mastery', m.mastery.n)} [I]: ${m.mastery.x}`);
    if (S.note) L.push(S.note);
    return L.join('\n');
  }

  // ------------------------------------------------------------------ pages
  function chapterHead(i) {
    const s = STEPS[i];
    return `<header class="chapter"><div class="chapter-num" aria-hidden="true">${ROMAN[i + 1]}</div>
      <div class="chapter-titles"><div class="chapter-kicker">Capítulo ${ROMAN[i + 1]} <span>de ${ROMAN[STEPS.length]}</span></div><h2 class="chapter-title">${esc(s.title)}</h2></div>
      <div class="chapter-tools"><label class="gm-bp-n">Campeões (N)<select data-b="n">${[2, 3, 4, 5, 6].map(k => `<option${k === S.n ? ' selected' : ''}>${k}</option>`).join('')}</select></label>
        <button class="btn small ghost guide-btn" data-a="guide">${ico('codex')} Guia</button></div></header>`;
  }
  function footer(i, m) {
    const ready = !stepIssues(STEPS[i].id, m).length, next = STEPS[i + 1];
    return `<div class="step-footer"><div class="footer-left">${i > 0 ? `<button class="btn ghost" data-a="back">${ico('prev')} Voltar</button>` : ''}</div>
      ${next ? `<div class="next-wrap"><button class="btn primary${ready ? '' : ' is-disabled'}" data-a="next" aria-disabled="${!ready}"><span class="btn-kicker">Capítulo ${ROMAN[i + 2]}</span>${esc(next.name)} ${ico('next')}</button></div>` : ''}</div>`;
  }
  function navHtml(m) {
    const r = reach(m), cur = stepIdx(S.step);
    return `<div class="rail-title">Forja do Antagonista</div><ol class="rail">${STEPS.map((s, i) => {
      const locked = i > r, I = locked ? [] : stepIssues(s.id, m);
      const cls = ['rail-item', i === cur ? 'active' : '', locked ? 'locked' : I.length ? 'open' : (s.id === 'up' || s.id === 'mast' || s.id === 'names') && i > r - 1 ? '' : 'done'].join(' ');
      const status = locked ? 'Fechado' : i === cur ? 'Você está aqui' : I.length ? 'Falta algo' : s.sub;
      return `<li class="${cls}"><button data-a="go" data-i="${i}"${locked ? ' disabled title="Complete os capítulos anteriores primeiro"' : ''}${i === cur ? ' aria-current="step"' : ''}>
        <span class="rail-mark"><span>${ROMAN[i + 1]}</span></span><span class="rail-label"><span class="rail-name">${esc(s.name)}</span><span class="rail-sub">${esc(status)}</span></span></button></li>`;
    }).join('')}</ol>`;
  }
  const todoHtml = need => (need.length ? `<div class="flow-todo"><span class="flow-todo-l">Ainda falta</span><ul>${need.map(x => `<li>${esc(x)}</li>`).join('')}</ul></div>` : '');
  function stageHtml(m) {
    const i = Math.min(stepIdx(S.step), reach(m)), s = STEPS[i];
    if (S.step !== s.id) { S.step = s.id; }
    const need = stepIssues(s.id, m);
    const showGuide = ui.guide[s.id] != null ? ui.guide[s.id] : !S.seen[s.id];
    const guide = showGuide ? `<div class="ant-guide" role="note"><b>Guia deste capítulo</b>${GUIDE[s.id]}</div>` : '';
    if (s.id === 'finish') {
      const done = !need.length;
      return `<div class="panel no-print">${chapterHead(i)}<p class="chapter-lede">${s.lede}</p>${guide}
        <section class="flow-sec current"><div class="flow-head"><span class="flow-num">${done ? ico('mark') : i + 1}</span><h3>${done ? 'Pronta para a mesa' : 'Quase lá'}</h3></div>
          <div class="flow-body">${need.length ? `<div class="flow-todo"><span class="flow-todo-l">Ainda falta ou está fora da regra</span><ul>${need.map(x => `<li>${esc(x)}</li>`).join('')}</ul></div>` : ''}
            <div class="export-row"><button class="btn primary" data-a="pdf"${m.hp == null ? ' disabled' : ''}>${ico('download')} Exportar PDF da ficha</button><button class="btn" data-a="print"${m.hp == null ? ' disabled' : ''}>${ico('print')} Imprimir</button><button class="btn" data-a="export">${ico('file')} Exportar .json</button><button class="btn" data-a="copy"${m.hp == null ? ' disabled' : ''}>Copiar como texto</button><button class="btn" data-a="toTable"${m.hp == null ? ' disabled' : ''}>Adicionar à Mesa do Mestre${m.hp != null ? ' (Vida ' + m.hp + ')' : ''}</button></div>
            <div id="pdf-status"></div></div></section>
        ${footer(i, m).replace(/<div class="next-wrap">[\s\S]*$/, '</div>')}</div>
        <div class="panel" id="sheet-preview">${sheetHtml(m)}</div>`;
    }
    return `<div class="panel">${chapterHead(i)}<p class="chapter-lede">${s.lede}</p>${guide}
      <section class="flow-sec current"><div class="flow-head"><span class="flow-num">${i + 1}</span><h3>${esc(s.title.replace(/ \(opcional\)/, ''))}</h3><span class="flow-here">Você está aqui</span></div>
        <div class="flow-body">${body(s.id, m)}<div class="todo-slot">${todoHtml(need)}</div></div></section>
      ${footer(i, m)}</div>`;
  }
  function render(opts = {}) {
    const m = model();
    $('#nav').innerHTML = navHtml(m);
    const focus = document.activeElement && document.activeElement.closest && document.activeElement.closest('#stage') ? ['data-a', 'data-b', 'data-id', 'data-v', 'data-i'].filter(k => document.activeElement.getAttribute(k) != null).map(k => `[${k}="${CSS.escape(document.activeElement.getAttribute(k))}"]`).join('') : '';
    const y = window.scrollY;
    $('#stage').innerHTML = stageHtml(m);
    if (opts.top) window.scrollTo(0, 0); else window.scrollTo(0, y);
    if (focus && !opts.top) { const e = $('#stage ' + focus); if (e && !['INPUT', 'TEXTAREA'].includes(e.tagName)) e.focus({ preventScroll: true }); }
    const c = $('#roster-count'); if (c) c.textContent = rosterIds().length || '';
  }
  // typing never redraws the page; only the little things that depend on it: the rail, the "falta" list and the Continue button
  function light() {
    const m = model(), i = stepIdx(S.step);
    $('#nav').innerHTML = navHtml(m);
    const slot = $('#stage .todo-slot'); if (slot) slot.innerHTML = todoHtml(stepIssues(S.step, m));
    const f = $('#stage .step-footer'); if (f && i < STEPS.length - 1) f.outerHTML = footer(i, m);
  }

  // ------------------------------------------------------------------ actions
  const setPath = (o, path, v) => { const p = path.split('.'); let t = o; for (let i = 0; i < p.length - 1; i++) { if (t[p[i]] == null) t[p[i]] = /^\d+$/.test(p[i + 1]) ? [] : {}; t = t[p[i]]; } t[p[p.length - 1]] = v; };
  const dropAb = prefix => { for (const k of Object.keys(S.ab)) if (k.startsWith(prefix)) delete S.ab[k]; for (const k of Object.keys(S.tk)) if (k.startsWith(prefix)) delete S.tk[k]; };
  const mark = () => { S.seen[S.step] = true; };
  function go(i, top = true) { const m = model(); i = Math.max(0, Math.min(i, reach(m))); mark(); S.step = STEPS[i].id; S.maxStep = Math.max(S.maxStep || 0, i); save(); render({ top }); }
  const addToTable = m => {
    const t = Object.assign({ tracker: { g: 2, y: 4, r: 2, marked: 0 }, round: 1, turns: [], challenges: [], foes: [], villains: [], region: 'any', twist: null }, read(TABLE) || {});
    t.villains = (t.villains || []).concat([{ id: uid().slice(0, 7), name: S.name || 'Antagonista sem nome', max: m.hp, hp: m.hp, st0: 'd8', st1: 'd8', st2: 'd8', notes: '' }]);
    try { localStorage.setItem(TABLE, JSON.stringify(t)); return true; } catch (e) { return false; }
  };
  const fileBase = () => ((S.alias || '').trim() || (S.name || '').trim() || 'antagonista').replace(/[^\w-]+/g, '_');
  function exportJson() {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([JSON.stringify(Object.assign({ app: 'runeterra-antagonist', v: 1 }, S), null, 2)], { type: 'application/json' }));
    a.download = fileBase() + '.json';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }
  function importJson(text) {
    let o;
    try { o = JSON.parse(text); } catch (e) { alert('Este arquivo não é um .json válido.'); return; }
    if (!o || o.app !== 'runeterra-antagonist') { alert('Este arquivo não é de um antagonista da Forja. Para campeões, use a Forja de Campeões.'); return; }
    save();
    delete o.app; delete o.v;
    S = normalize(o);
    if (rosterIds().includes(S.cid) && read(SLOT(S.cid)) && read(SLOT(S.cid)).updated > S.updated) S.cid = uid();
    save(); render({ top: true });
  }
  function loadPortrait(file) {
    if (!file) return;
    const r = new FileReader();
    r.onload = () => {
      const img = new Image();
      img.onload = () => {
        const max = 700, k = Math.min(1, max / Math.max(img.width, img.height));
        const c = document.createElement('canvas'); c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        S.portrait = c.toDataURL('image/jpeg', 0.85); save(); render();
      };
      img.src = r.result;
    };
    r.readAsDataURL(file);
  }
  async function exportPdf() {
    const status = $('#pdf-status');
    const say = (msg, err) => { if (status) { status.innerHTML = msg; status.className = err ? 'issues' : 'okbox'; } };
    const m = model();
    if (m.hp == null) return;
    if (!window.PDFLib) {
      const ref = document.querySelector('script[src*="sheet-pdf.js"]');
      await new Promise(done => { const sc = document.createElement('script'); sc.src = ref ? ref.src.replace('sheet-pdf.js', 'vendor/pdf-lib.min.js') : 'js/vendor/pdf-lib.min.js'; sc.onload = sc.onerror = done; document.head.appendChild(sc); });
    }
    if (!window.PDFLib || !window.SheetPDF) { say('A biblioteca de PDF não carregou.', true); return; }
    try {
      const bytes = await window.SheetPDF.render({
        html: sheetHtml(m), cssHref: document.querySelector('link[href*="style.css"]').href, fontBase: new URL('assets/fonts/', location.href).href,
        fontkitSrc: 'js/vendor/fontkit.umd.min.js', pageBg: getComputedStyle(document.body).backgroundColor, onStatus: x => say(esc(x)),
        title: `Ficha de Antagonista de ${S.name || 'antagonista sem nome'}`, creator: 'Forja do Antagonista · Runeterra'
      });
      const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' })); a.download = fileBase() + '_ficha_antagonista.pdf';
      document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
      say('PDF baixado. Vida atual, planos e notas viram campos que dá para digitar em qualquer leitor de PDF.');
    } catch (e) { say('Não foi possível montar o PDF: ' + esc(e.message), true); }
  }

  // roster
  const champLine = c => { const ap = VD.approaches.find(x => x.id === c.ap), ar = VD.archetypes.find(x => x.id === c.arch); return [ap && ap.n, ar && ar.n].filter(Boolean).join(' · ') || 'Ainda sem abordagem'; };
  function rosterHtml() {
    const list = rosterIds().map(id => (id === S.cid ? S : read(SLOT(id)))).filter(Boolean).sort((a, b) => (b.cid === S.cid) - (a.cid === S.cid) || (b.updated || 0) - (a.updated || 0));
    const when = t => (t ? new Date(t).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' }) : '');
    return `<div class="ro-back" data-a="rosterClose"></div><section class="ro-panel" role="dialog" aria-modal="true" aria-labelledby="ro-title">
      <header class="ro-head"><div><h2 id="ro-title">Meus antagonistas</h2><p class="muted">Guardados neste navegador. Exporte (Arquivo) para guardar uma cópia ou levar para outro aparelho.</p></div>
        <button type="button" class="btn primary" data-a="rosterNew">${ico('mark')} Novo antagonista</button><button type="button" class="ro-x" data-a="rosterClose" aria-label="Fechar">✕</button></header>
      <ul class="ro-list">${list.map(c => `<li class="ro-item${c.cid === S.cid ? ' on' : ''}"><div class="ro-pic">${c.portrait ? `<img src="${c.portrait}" alt="">` : ico('compass')}</div>
        <div class="ro-main"><div class="ro-name">${esc((c.name || '').trim() || 'Antagonista sem nome')}${c.alias ? ` <small>${esc(c.alias)}</small>` : ''}</div><div class="ro-line">${esc(champLine(c))}</div><div class="ro-meta"><span>Editado ${when(c.updated)}</span></div></div>
        <div class="ro-acts">${c.cid === S.cid ? '<span class="ro-open">Aberto agora</span>' : `<button type="button" class="btn small" data-a="rosterOpen" data-id="${c.cid}">Abrir</button>`}
          <button type="button" class="linkbtn" data-a="rosterDup" data-id="${c.cid}">Duplicar</button><button type="button" class="linkbtn danger" data-a="rosterDel" data-id="${c.cid}">Excluir</button></div></li>`).join('')}</ul></section>`;
  }
  function showRoster() {
    let r = $('#roster'); if (!r) { r = document.createElement('div'); r.id = 'roster'; r.className = 'roster'; document.body.appendChild(r); }
    save(); r.innerHTML = rosterHtml(); r.hidden = false; document.body.classList.add('ro-lock');
    const b = r.querySelector('[data-a="rosterNew"]'); if (b) b.focus();
  }
  const hideRoster = () => { const r = $('#roster'); if (r) r.hidden = true; document.body.classList.remove('ro-lock'); };

  // ------------------------------------------------------------------ events
  function applyChange(f, o) {
    if (f === 'ap') { S.ap = o.value; S.P = {}; S.Q = {}; dropAb('a:'); }
    else if (f === 'arch') { S.arch = o.value; dropAb('r:'); dropAb('g:'); }
    else if (f === 'P' || f === 'Q') { if (o.value) S[f][o.i] = o.value; else delete S[f][o.i]; }
    else if (f === 'tk') { const k = o.id + '|' + o.t; if (o.value) S.tk[k] = o.value; else delete S.tk[k]; }
    else if (f === 'ab') { if (o.checked) S.ab[o.id] = true; else { delete S.ab[o.id]; dropAb(o.id + '|'); } }
    else if (f === 'up') { if (o.checked) S.up[o.id] = true; else { delete S.up[o.id]; dropAb('u:' + o.id + ':'); if (!Object.keys(S.up).length) S.mastery = ''; } }
    else if (f === 'mastery') S.mastery = o.value;
    save(); render();
  }
  function onClick(ev) {
    const t = ev.target;
    if (t.closest('select, input, textarea, label')) return;
    const el = t.closest('[data-a]');
    if (!el) return;
    const a = el.dataset.a;
    if (el.classList.contains('dis')) return;
    if (el.classList.contains('is-disabled')) { const f = $('#stage .flow-todo'); if (f) { f.scrollIntoView({ block: 'center', behavior: 'smooth' }); f.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-5px)' }, { transform: 'translateX(5px)' }, { transform: 'translateX(0)' }], { duration: 240 }); } return; }
    const m = model();
    if (a === 'ap' || a === 'arch') return applyChange(a, { value: el.dataset.v });
    if (a === 'ab') return applyChange('ab', { id: el.dataset.id, checked: !S.ab[el.dataset.id] });
    if (a === 'up') return applyChange('up', { id: el.dataset.id, checked: !S.up[el.dataset.id] });
    if (a === 'mast') return applyChange('mastery', { value: el.dataset.v });
    if (a === 'go') return go(+el.dataset.i);
    if (a === 'next') return go(stepIdx(S.step) + 1);
    if (a === 'back') return go(stepIdx(S.step) - 1);
    if (a === 'guide') { ui.guide[S.step] = !(ui.guide[S.step] != null ? ui.guide[S.step] : !S.seen[S.step]); render(); return; }
    if (a === 'clearPortrait') { S.portrait = null; save(); render(); return; }
    if (a === 'hp') {
      const cur = parseInt(S.play.cur === '' || S.play.cur == null ? m.hp : S.play.cur, 10) || 0, d = el.dataset.d;
      S.play.cur = String(d === 'max' ? m.hp : Math.max(0, Math.min(m.hp, cur + +d))); save();
      const inp = $('#sheet-preview [data-b="play.cur"]'); if (inp) inp.value = S.play.cur;
      return;
    }
    if (a === 'print') { window.print(); return; }
    if (a === 'pdf') { exportPdf(); return; }
    if (a === 'export') { exportJson(); return; }
    if (a === 'copy' || a === 'toTable') {
      if (m.hp == null) return;
      if (a === 'toTable') addToTable(m); else if (navigator.clipboard) navigator.clipboard.writeText(sheetText(m)).catch(() => {});
      const old = el.textContent; el.textContent = a === 'toTable' ? 'Adicionado na Mesa do Mestre' : 'Copiado'; setTimeout(() => { el.textContent = old; }, 1600); return;
    }
    if (a === 'roster') { showRoster(); return; }
    if (a === 'rosterClose') { hideRoster(); return; }
    if (a === 'rosterNew') { save(); S = blank(); save(); hideRoster(); render({ top: true }); return; }
    if (a === 'rosterOpen') { const c = read(SLOT(el.dataset.id)); if (c) { save(); S = normalize(c); save(); hideRoster(); render({ top: true }); } return; }
    if (a === 'rosterDup') {
      save();
      const c = el.dataset.id === S.cid ? JSON.parse(JSON.stringify(S)) : read(SLOT(el.dataset.id));
      if (!c) return;
      c.cid = uid(); c.updated = Date.now(); c.name = (c.name || 'Antagonista sem nome') + ' (cópia)';
      try { localStorage.setItem(SLOT(c.cid), JSON.stringify(c)); localStorage.setItem(ROSTER, JSON.stringify(rosterIds().concat([c.cid]))); } catch (e) { alert('Sem espaço neste navegador.'); }
      showRoster(); return;
    }
    if (a === 'rosterDel') {
      if (!confirm('Excluir este antagonista deste navegador? Exporte antes se quiser guardar uma cópia.')) return;
      const id = el.dataset.id;
      try { localStorage.removeItem(SLOT(id)); localStorage.setItem(ROSTER, JSON.stringify(rosterIds().filter(x => x !== id))); } catch (e) { /* ignore */ }
      if (id === S.cid) { S = blank(); save(); render({ top: true }); }
      showRoster(); return;
    }
    if (a === 'reset') { if (confirm('Recomeçar do zero? Isso apaga o antagonista aberto neste navegador.')) { const id = S.cid; try { localStorage.removeItem(SLOT(id)); localStorage.setItem(ROSTER, JSON.stringify(rosterIds().filter(x => x !== id))); } catch (e) { /* ignore */ } S = blank(); save(); render({ top: true }); } return; }
  }

  function wire() {
    document.addEventListener('click', onClick);
    document.addEventListener('keydown', ev => {
      const c = ev.target.closest && ev.target.closest('.vf-card[role=button]');
      if (c && ev.target === c && (ev.key === 'Enter' || ev.key === ' ')) { ev.preventDefault(); c.click(); }
      if (ev.key === 'Escape') { const r = $('#roster'); if (r && !r.hidden) hideRoster(); }
    });
    document.addEventListener('input', ev => {
      const el = ev.target, b = el.dataset && el.dataset.b;
      if (!b || el.tagName === 'SELECT') return;
      if (b.startsWith('traitNames.') || b.startsWith('renames.')) setPath(S, b, el.value);
      else setPath(S, b, el.value);
      save(); if (b === 'name' || b === 'rp') light();
    });
    document.addEventListener('change', ev => {
      const el = ev.target;
      if (el.id === 'portrait-file') { loadPortrait(el.files[0]); el.value = ''; return; }
      if (el.id === 'import-file') { const f = el.files[0]; el.value = ''; if (!f) return; const r = new FileReader(); r.onload = () => importJson(String(r.result)); r.readAsText(f); return; }
      const b = el.dataset && el.dataset.b;
      if (!b) return;
      if (b === 'n') { S.n = +el.value; save(); render(); return; }
      if (b === 'tk') return applyChange('tk', { id: el.dataset.id, t: el.dataset.t, value: el.value });
      if (b === 'P' || b === 'Q') return applyChange(b, { i: el.dataset.i, value: el.value });
      
    });
    // Arquivo menu
    const btn = $('#file-btn'), pop = $('#file-pop');
    const setOpen = (open, focus) => { pop.hidden = !open; btn.setAttribute('aria-expanded', String(open)); if (open && focus) pop.querySelector('[role="menuitem"]').focus(); if (!open && focus) btn.focus(); };
    btn.addEventListener('click', ev => { ev.stopPropagation(); setOpen(pop.hidden, ev.detail === 0); });
    document.addEventListener('click', ev => { if (pop.hidden) return; if (!pop.contains(ev.target) || ev.target.closest('[role="menuitem"]')) setTimeout(() => setOpen(false), 0); });
    document.addEventListener('keydown', ev => { if (ev.key === 'Escape' && !pop.hidden) setOpen(false, true); });
    pop.addEventListener('keydown', ev => {
      const list = [...pop.querySelectorAll('[role="menuitem"]')], i = list.indexOf(document.activeElement);
      if (ev.key === 'ArrowDown' || ev.key === 'ArrowUp') { ev.preventDefault(); list[(i + (ev.key === 'ArrowDown' ? 1 : list.length - 1)) % list.length].focus(); }
      if ((ev.key === 'Enter' || ev.key === ' ') && document.activeElement.tagName === 'LABEL') { ev.preventDefault(); document.activeElement.click(); }
    });
  }

  // ------------------------------------------------------------------ gate: only behind the GM Screen
  async function unlocked() {
    const raw = (() => { try { return sessionStorage.getItem(GMKEY); } catch (e) { return null; } })(), v = window.GM_VAULT;
    if (!raw || !v || !window.crypto || !crypto.subtle) return false;
    try {
      const key = await crypto.subtle.importKey('raw', b64(raw), 'AES-GCM', false, ['decrypt']);
      await crypto.subtle.decrypt({ name: 'AES-GCM', iv: b64(v.iv) }, key, b64(v.ct));
      return true;
    } catch (e) { return false; }
  }
  (async () => {
    const gate = $('#gate'), app = $('#app');
    if (!(await unlocked())) {
      gate.hidden = false;
      gate.innerHTML = `<div class="sp-empty"><span class="gm-seal" aria-hidden="true">${ico('lock')}</span><h1>Somente para o Mestre</h1>
        <p class="muted">A Forja do Antagonista fica atrás do Escudo do Mestre. Abra o Escudo, digite a senha e volte por aqui: o botão “Forja do Antagonista” aparece no cabeçalho quando você está dentro.</p>
        <a class="btn primary" href="gm.html">${ico('lock')} Abrir o Escudo do Mestre</a></div>`;
      return;
    }
    app.hidden = false;
    wire();
    const m = model();
    S.step = STEPS[Math.min(stepIdx(S.step) < 0 ? 0 : stepIdx(S.step), reach(m))].id;
    render({ top: true });
    save();
  })();
})();
