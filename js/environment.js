/* The Environment Workshop (ambiente.html): the Game Master's tool for building a scene environment, step by step.
   Seven chapters follow chapter 5 of the rulebook ("Creating Environments" and "Creating Minions and Lieutenants"): the place, three traits with a die each,
   a library of threats (minions and lieutenants) and the
   twists of each scene zone (Green, Yellow, Red), each built from the rulebook's "Twist Strength Guidelines" tables.
   The tables themselves are sealed in the vault (gm-env-data); this page only holds the behaviour.
   Like the Antagonist Workshop it reuses the Champion Forge's look, tooltips and sheet, and is only reachable behind the
   GM Screen: it checks the key the Screen keeps for this tab. */
(() => {
  'use strict';
  const KEY = 'runeterra-environment-v1', ROSTER = 'runeterra-environment-roster-v1', SLOT = id => 'runeterra-environment-' + id;
  const GMKEY = 'runeterra-gm-key';
  const ROMAN = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];
  const DIES = ['d4', 'd6', 'd8', 'd10', 'd12'];
  const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const $ = s => document.querySelector(s);
  const ico = (n, c) => (window.ICO ? window.ICO(n, c) : '');
  const uid = () => Math.random().toString(36).slice(2, 10);
  const K = () => window.ForgeKit;
  const tipA = h => K().tip(h);
  const die = (d, c) => K().die(d, c);
  const dieWords = t => t.replace(/\bd(4|6|8|10|12)\b/g, '[d$1]');
  const ruleHtml = text => K().rulesText(dieWords(text));
  let ED = null;   // the twist tables: sealed in the vault, loaded after unlocking

  const ZN = { green: 'Verde', yellow: 'Amarela', red: 'Vermelha' };
  const ZSTAGE = { green: 'Estável', yellow: 'Em decadência', red: 'Colapso' };
  const STEPS = [
    { id: 'concept', name: 'Conceito', sub: 'O lugar', title: 'Dê um lugar à cena', lede: 'O <b>nome</b> do ambiente já define a escala: um estádio, um quarteirão, uma cidade inteira, uma ilha, outra dimensão. Descreva o lugar e o clima que você quer passar à mesa.' },
    { id: 'traits', name: 'Traços', sub: 'Três características', title: 'Os três traços e seus dados', lede: 'Escolha <b>três traços</b>: características do ambiente, não ameaças (“Armamento Automatizado”, e não “Torreta”). Cada traço recebe um dado, e os três dados formam a reserva que o ambiente rola quando age.' },
    { id: 'threats', name: 'Ameaças', sub: 'Lacaios e tenentes', title: 'A biblioteca de ameaças', lede: 'Monte aqui os <b>lacaios</b> e <b>tenentes</b> deste ambiente. Cada reviravolta que “adiciona uma ameaça” escolhe uma delas, e a ficha mostra todas. Você pode pular este capítulo se o ambiente não vai ter ameaças.' },
    { id: 'green', name: 'Zona Verde', sub: 'Estável', title: 'Reviravoltas da zona Verde', lede: 'A catástrofe do ambiente tem três fases: <b>Estável</b> (Verde), <b>em decadência</b> (Amarela) e <b>colapso</b> (Vermelha). Na Verde, o ambiente reúne forças: incômodos e estranhezas. Crie <b>duas ou três reviravoltas menores</b> e <b>uma maior</b>.' },
    { id: 'yellow', name: 'Zona Amarela', sub: 'Em decadência', title: 'Reviravoltas da zona Amarela', lede: 'Na Amarela, o ambiente fica sob tanto estresse quanto os campeões: os efeitos ficam mais fortes. Crie <b>duas ou três reviravoltas menores</b> e <b>uma maior</b>.' },
    { id: 'red', name: 'Zona Vermelha', sub: 'Colapso', title: 'Reviravoltas da zona Vermelha', lede: 'Na Vermelha, o ambiente colapsa e algo perigoso emerge. É aqui que entra o <b>dispositivo do fim do mundo</b>, se você quiser um: crie-o como desafio <b>personalizado</b> na reviravolta maior. Crie <b>duas ou três reviravoltas menores</b> e <b>uma maior</b>.' },
    { id: 'finish', name: 'A ficha', sub: 'Pronta para a mesa', title: 'A ficha do ambiente', lede: 'Confira a ficha, copie como texto, imprima, exporte em PDF ou salve em .json.' }
  ];
  const GUIDE = {
    concept: '<p>Pense no lugar onde a cena acontece e no que ele faz <b>com todos</b>: um ambiente costuma machucar os campeões mais do que os antagonistas. Na maioria das cenas há um só ambiente; use dois apenas se o grupo foi totalmente separado.</p><p class="muted">Exemplo: “Tempestade Sobrenatural sobre a Cidade da Torre”: fendas dimensionais abrem e fecham pela cidade como nuvens.</p>',
    traits: '<p>Os traços aparecem sobretudo nas reviravoltas, por isso precisam ser <b>características gerais</b>: isso deixa você livre para descrever o que acontece. Dê o dado mais alto ao traço mais importante para o impacto do ambiente na cena.</p><p>Guia dos dados: <b>d4</b> mínimo, <b>d6</b> médio, <b>d8</b> desafiador, <b>d10</b> perigoso, <b>d12</b> catastrófico. Se estiver em dúvida, use d6 e d8. Não precisa equilibrar: um dado alto não exige um baixo.</p>',
    threats: '<p><b>Lacaio</b>: ameaça frágil que age em grupo. Se falhar no salvamento, cai na hora; se passar, o dado cai um tamanho. <b>Tenente</b>: ameaça resistente. Passando no salvamento o dado fica igual; falhando, cai um tamanho. Dano de pelo menos o dobro do dado derrota o tenente na hora.</p><p>Lacaios com dado alto ficam perigosos em número: prefira dar <b>habilidades</b> (bônus de 1 a 3, o mais comum é 2) em vez de subir o dado. Lacaios têm no máximo duas habilidades; tenentes precisam de pelo menos uma. Quando o ambiente cria lacaios, a quantidade costuma ser a de campeões.</p>',
    zone: '<p>Cada reviravolta usa <b>os dados do ambiente</b>: o <b>Mín</b>, o <b>Médio</b> e o <b>Máx</b> da reserva de três dados. Escolha o tipo de efeito, a receita do livro para aquela zona e aquele peso (menor ou maior), e escreva o que acontece na história.</p><p>Como o ambiente rola <b>três dados</b>, você pode combinar até três efeitos numa reviravolta, cada um usando um dado diferente: é um jeito de deixar a Amarela e a Vermelha mais complicadas.</p><p class="muted">O marcador de cena já avança sozinho no começo de todo turno do ambiente. Só a reviravolta <b>maior</b> pode, se você quiser, incluir o efeito “Avançar o marcador”, que é uma casa <b>a mais</b>. Cada reviravolta maior vale uma vez por cena.</p>',
    finish: '<p>Na hora de jogar, o turno do ambiente é o turno do marcador de cena: <b>avance o marcador</b>, <b>ative as ameaças</b> que já estão em cena e então <b>introduza uma ameaça nova ou acione uma reviravolta</b> da zona atual. Ameaças novas só agem no turno seguinte.</p><p>Ambientes não Defendem nem Superam: use Atrapalhar contra os campeões.</p>'
  };
  const SEV = { minor: 'Menor', major: 'Maior' };
  const VERBS = { attack: ['Atacar', 'Ataque'], hinder: ['Atrapalhar', 'Atrapalhe'], boost: ['Fortalecer', 'Fortaleça'], defend: ['Defender', 'Defenda'], overcome: ['Superar', 'Supere'] };
  const WHO_TXT = { one: 'um alvo', two: 'dois alvos', all: 'todos os alvos', first: 'um alvo', second: 'outro alvo', same: 'o mesmo alvo', others: 'os demais alvos' };
  const CATS = [['basic', 'Ação básica'], ['threat', 'Ameaças'], ['challenge', 'Desafio'], ['advance', 'Avançar o marcador']];
  const DIENAME = { min: 'dado Mín', mid: 'dado Médio', max: 'dado Máx', 'mid+min': 'dados Médio+Mín', 'max+min': 'dados Máx+Mín' };

  // ------------------------------------------------------------------ state
  const newFx = () => ({ cat: 'basic', opt: '', verbs: [], persistIdx: 0, other: '', tid: '', ctext: '', cwhere: '', cblocks: '', cdice: ['mid'], ctimer: false, tm: '2', tneed: 3, tcons: '' });
  const newTh = () => ({ id: uid(), name: '', kind: 'minion', die: 'd6', desc: '', tactics: '', abs: [] });
  const newTw = () => ({ id: uid(), name: '', desc: '', fx: [newFx()] });
  const blankZones = () => ({ green: { minor: [], major: [] }, yellow: { minor: [], major: [] }, red: { minor: [], major: [] } });
  const blank = () => ({ cid: uid(), name: '', scope: '', note: '', portrait: null, places: [], heroes: 4, threats: [], traits: [{ name: '', die: '' }, { name: '', die: '' }, { name: '', die: '' }], tw: blankZones(), play: { notes: [] }, step: 'concept', seen: {}, updated: 0 });
  const read = k => { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } };
  const normalize = o => {
    const b = blank(), s = Object.assign(b, o || {});
    s.play = Object.assign(b.play, s.play || {});
    s.tw = Object.assign(blankZones(), s.tw || {});
    for (const z of Object.keys(ZN)) s.tw[z] = Object.assign({ minor: [], major: [] }, s.tw[z]);
    s.traits = [0, 1, 2].map(i => Object.assign({ name: '', die: '' }, (s.traits || [])[i]));
    s.places = (Array.isArray(s.places) ? s.places : []).map(x => Object.assign({ id: uid(), name: '' }, x));
    s.threats = (Array.isArray(s.threats) ? s.threats : []).map(t => Object.assign(newTh(), t, { abs: Array.isArray(t && t.abs) ? t.abs.map(a => Object.assign({ t: 'custom', v: 2, x: '' }, a)) : [] }));
    for (const z of Object.keys(ZN)) for (const sv of ['minor', 'major']) for (const tw of s.tw[z][sv]) tw.fx = (tw.fx || []).map(f => Object.assign(newFx(), f));
    return s;
  };
  // threats typed straight into a twist (older saves) move into the library
  const migrate = s => {
    if (!ED) return s;
    for (const z of Object.keys(ZN)) for (const sv of ['minor', 'major']) for (const tw of s.tw[z][sv]) for (const fx of tw.fx) {
      if (fx.cat === 'threat' && !fx.tid && (fx.tname || '').trim()) {
        const o = optsFor('threat', z, sv).find(x => x.id === fx.opt), kind = o && o.lt ? 'lieutenant' : 'minion', die = fx.tdie || 'd6';
        let th = s.threats.find(t => t.name === fx.tname.trim() && t.kind === kind && t.die === die);
        if (!th) { th = Object.assign(newTh(), { name: fx.tname.trim(), kind, die }); s.threats.push(th); }
        fx.tid = th.id;
      }
      if (z === 'red' && sv === 'major' && fx.cat === 'challenge' && fx.opt === 'r-m1') fx.opt = 'custom';   // the ready-made doomsday recipe is gone: the text stays as a custom challenge
      delete fx.tname; delete fx.tdie;
    }
    return s;
  };
  const hydrate = o => migrate(normalize(o));
  const rosterIds = () => { const r = read(ROSTER); return Array.isArray(r) ? r : []; };
  let S = normalize(read(KEY));
  const ui = { guide: {} };
  let storageWarned = false;
  function save() {
    S.updated = Date.now();
    try {
      localStorage.setItem(KEY, JSON.stringify(S));
      localStorage.setItem(SLOT(S.cid), JSON.stringify(S));
      const ids = rosterIds(); if (!ids.includes(S.cid)) { ids.push(S.cid); localStorage.setItem(ROSTER, JSON.stringify(ids)); }
    } catch (e) { if (!storageWarned) { storageWarned = true; alert('Este navegador está sem espaço: a última mudança pode não ter sido salva. Exporte seus ambientes (Arquivo) e remova retratos ou ambientes antigos.'); } }
    const c = $('#roster-count'); if (c) c.textContent = rosterIds().length || '';
  }

  // ------------------------------------------------------------------ dice and twist texts
  const sortedDice = () => S.traits.map(t => t.die).filter(Boolean).sort((a, b) => DIES.indexOf(a) - DIES.indexOf(b));
  const DV = () => { const s = sortedDice(); return s.length === 3 ? { min: s[0], mid: s[1], max: s[2] } : null; };
  const getTw = id => { for (const z of Object.keys(ZN)) for (const s of ['minor', 'major']) { const t = S.tw[z][s].find(x => x.id === id); if (t) return { tw: t, z, s }; } return null; };
  // the last recipe of basic actions and of challenges is the GM's own, outside the rulebook's tables (a pacifism field, say)
  const CUSTOM = { basic: { id: 'custom', custom: true, acts: [], other: null, persistOne: false }, challenge: { id: 'custom', custom: true, kind: 'custom', other: false } };
  const optsFor = (cat, z, s) => (cat === 'basic' ? ED.basic[z][s].concat([CUSTOM.basic]) : cat === 'threat' ? ED.threats[z][s] : cat === 'challenge' ? ED.challenges[z][s].concat([CUSTOM.challenge]) : []);
  const timedOn = (o, fx) => !!o && (o.kind === 'timed' || (o.custom && fx.cat === 'challenge' && fx.ctimer));
  const getOpt = (fx, z, s) => optsFor(fx.cat, z, s).find(o => o.id === fx.opt) || null;
  const catsFor = (z, s) => CATS.filter(c => c[0] !== 'advance' || s === 'major');
  const isPersist = (o, fx, i) => !!(o.acts[i].persist || (o.persistOne && (fx.persistIdx || 0) === i));
  const dieWord = d => DIENAME[d] || d;
  // Overcome works on challenges, not on targets: it cannot hit "everyone", and it never creates a persistent modifier
  const OVERCOME_OK = a => !['all', 'two', 'others'].includes(a.who) && !a.persist;
  const verbsFor = (o, fx, k) => Object.keys(VERBS).filter(key => {
    const pers = isPersist(o, fx, k);
    if (pers) return key === 'hinder' || key === 'boost';
    if (key === 'overcome') return OVERCOME_OK(o.acts[k]);
    return true;
  });
  // what it means for an environment to Defend or Overcome (pp. 158 and 242-243 of the rulebook)
  const VERB_WARN = {
    defend: `<b>Defender com um ambiente é exceção.</b> Defender protege alguém do próximo dano, e um ambiente não toma dano: por isso, na hora de jogar, o livro manda <b>Atrapalhar os campeões</b> em vez de Defender, mesmo quando a ideia é “defender o lar”. Só faz sentido quando a reviravolta <b>protege outras pessoas</b> da cena, como o “Campo Místico do Pacifismo” do livro: Defende quem não Atacou no último turno e Atrapalha os demais.`,
    overcome: `<b>Superar com um ambiente é exceção.</b> Superar é um teste que pode dar “sucesso com reviravolta”, e um ambiente não tem um jogador do outro lado para sofrer essa reviravolta: por isso o livro diz que ambientes <b>normalmente não Superam</b>. A exceção é resolver <b>um desafio da cena</b>, como os “socorristas que chegam e resolvem um dos obstáculos restantes”. Só vale se houver um desafio ativo quando a reviravolta acontecer.`
  };
  const getPl = id => S.places.find(x => x.id === id) || null;
  const plName = id => { const x = getPl(id); return x ? (x.name.trim() || 'local sem nome') : ''; };
  const TK = () => ED.threatKinds;
  const getTh = id => S.threats.find(t => t.id === id) || null;
  const abTpl = id => ED.abilities.find(a => a.id === id);
  const abText = a => { const t = abTpl(a.t); return t ? t.t(a.v, (a.x || '').trim()) : ''; };
  const abName = a => { const t = abTpl(a.t); return t ? t.name : ''; };
  const dieAtLeast = (d, m) => DIES.indexOf(d) >= DIES.indexOf(m);
  function thIssues(th) {
    const I = [], k = TK()[th.kind], who = `“${th.name.trim() || 'sem nome'}”: `;
    if (!th.name.trim()) I.push(who + 'dê um nome à ameaça.');
    if (th.kind === 'lieutenant' && !th.abs.length) I.push(who + 'um tenente precisa de pelo menos uma habilidade.');
    if (th.abs.length > k.maxAb) I.push(who + `${k.name === 'Lacaio' ? 'lacaios têm' : 'tenentes têm'} no máximo ${k.maxAb} habilidades.`);
    th.abs.forEach(a => { if (a.t === 'custom' && !(a.x || '').trim()) I.push(who + 'descreva a habilidade própria.'); });
    return I;
  }
  // the little sheet of a threat, shown in hovers
  function thTip(th) {
    const k = TK()[th.kind];
    return `<h5>${esc(th.name.trim() || 'Ameaça sem nome')} · ${k.name} ${esc(th.die)}</h5>${th.desc.trim() ? `<p>${esc(th.desc.trim())}</p>` : ''}<p><b>Salvamento.</b> ${esc(k.save)}</p>${th.abs.length ? `<ul>${th.abs.map(a => `<li><b>${esc(abName(a))}.</b> ${esc(abText(a))}</li>`).join('')}</ul>` : '<p class="muted">Sem habilidades: só age e leva dano.</p>'}${th.tactics.trim() ? `<p><i>Tática:</i> ${esc(th.tactics.trim())}</p>` : ''}`;
  }
  const thChip = th => `<span class="term env-thr-chip"${tipA(thTip(th))}>${esc(th.name.trim() || 'Ameaça sem nome')} ${die(th.die, 'sm')} <small class="muted">${TK()[th.kind].name.toLowerCase()}</small></span>`;
  const timerOf = fx => ED.timers.find(x => x[0] === fx.tm) || ED.timers[1];
  const timerWords = fx => { const t = timerOf(fx); return t[0] === 'zone' ? 'até a cena mudar de zona' : t[0] === '1' ? '1 caixinha' : `${t[0]} caixinhas`; };
  const withDie = d => `com ${/^dados/.test(dieWord(d)) ? 'os' : 'o'} ${dieWord(d)}`;
  const thCount = n => (n === 'one' ? '' : `dado ${n === 'min' ? 'Mín' : n === 'mid' ? 'Médio' : 'Máx'}`);

  // labels of the recipes, as the GM picks them
  function optLabel(cat, o) {
    if (o.custom) return 'Personalizada: fora das tabelas do livro';
    if (cat === 'basic') {
      const acts = o.acts;
      const one = a => `${WHO_TXT[a.who]}, ${dieWord(a.die)}${a.persist ? ' (persistente e exclusivo)' : ''}`;
      if (acts.length === 1) return `${acts[0].who === 'one' ? 'Um alvo' : acts[0].who === 'two' ? 'Dois alvos' : 'Todos os alvos'}: ${dieWord(acts[0].die)}${acts[0].persist ? ' (persistente e exclusivo)' : ''}${o.other ? ` + outro efeito${o.other === 'any' ? '' : ' com o ' + dieWord(o.other)}` : ''}`;
      const who = acts.some(a => a.who === 'first') ? 'Dois alvos' : acts.some(a => a.who === 'others') ? 'Todos os alvos' : acts.some(a => a.who === 'same') ? 'Um alvo' : '';
      return `${who}: ${acts.length} ações, ${acts.map(a => `${dieWord(a.die)}${a.persist ? ' (persistente e exclusivo)' : ''}`).join(', depois ')}${o.persistOne ? ' (uma delas persistente e exclusiva)' : ''}${o.other ? ` + outro efeito` : ''}`;
    }
    if (cat === 'threat') {
      if (o.restore === 'minions') return 'Restaurar todos os lacaios ameaça à força total';
      if (o.restore === 'lieutenant') return 'Restaurar um tenente ameaça à força total';
      if (o.restore === 'all') return 'Restaurar todos os lacaios e tenentes à força total';
      const what = o.lt ? (o.strong ? 'um tenente mais poderoso' : 'um tenente') : o.n === 'one' ? 'um lacaio' : `lacaios (quantidade = ${thCount(o.n)})`;
      return `Adicionar ${what}${o.other ? ' + outro efeito' : ''}`;
    }
    const k = { simple: 'um desafio simples', timed: 'um desafio com cronômetro ou em várias etapas', raise: 'a dificuldade de um desafio existente', doomsday: 'o dispositivo do fim do mundo' }[o.kind];
    return (o.kind === 'raise' ? 'Aumentar ' : o.kind === 'doomsday' ? 'Ativar ' : 'Adicionar ') + k + (o.other ? ' + outro efeito' : '');
  }

  // the game text of one effect; I = what the effect still lacks
  function fxPlain(fx, z, s) {
    const I = [];
    if (fx.cat === 'advance') return { text: 'Avance o marcador de cena em um espaço.', I, dice: false };
    const o = getOpt(fx, z, s);
    if (!o) return { text: '', I: ['Escolha uma das receitas do livro para este efeito.'], dice: false };
    let text = '', dice = false;
    if (fx.cat === 'basic' && o.custom) {
      const ds = ['min', 'mid', 'max'].filter(d => fx.cdice.includes(d));
      if (!fx.ctext.trim()) I.push('Descreva o efeito personalizado.');
      dice = ds.length > 0;
      text = `${fx.ctext.trim() || '…'}${/[.…!?]$/.test(fx.ctext.trim()) ? '' : '.'}${ds.length ? ` Use ${ds.map(dieWord).join(' e ')} do ambiente.` : ''}`;
    } else if (fx.cat === 'basic') {
      dice = true;
      const parts = o.acts.map((a, i) => {
        const v = fx.verbs[i] || 'hinder', pers = isPersist(o, fx, i);
        return `${VERBS[v][1]} ${v === 'overcome' ? 'um dos desafios restantes da cena' : WHO_TXT[a.who]} ${withDie(a.die)}${pers ? ', criando um modificador persistente e exclusivo' : ''}`;
      });
      text = parts.join(', e depois ') + '.';
      if (o.other) {
        if (!fx.other.trim()) I.push('Descreva o outro efeito.');
        text += ` Outro efeito${o.other === 'any' ? ' (com um dos dados que sobraram)' : ` (${withDie(o.other)})`}: ${fx.other.trim() || '…'}.`;
      }
    } else if (fx.cat === 'threat') {
      if (o.restore) text = { minions: 'Restaure todos os lacaios ameaça à força total.', lieutenant: 'Restaure um tenente ameaça à força total.', all: 'Restaure todos os lacaios e tenentes ameaça à força total.' }[o.restore];
      else {
        const th = getTh(fx.tid);
        if (!th) I.push(o.lt ? 'Escolha o tenente na biblioteca de ameaças.' : 'Escolha o lacaio na biblioteca de ameaças.');
        else if ((th.kind === 'lieutenant') !== !!o.lt) I.push('A ameaça escolhida não é do tipo que esta receita pede (' + (o.lt ? 'tenente' : 'lacaio') + ').');
        const nm = (th && th.name.trim()) || '…', d = th ? th.die : 'd6';
        if (o.lt) text = `Adicione um tenente${o.strong ? ' mais poderoso que os demais da cena' : ''}: ${nm} (${d}).`;
        else if (o.n === 'one') text = `Adicione um lacaio: ${nm} (${d}).`;
        else { dice = true; text = `Adicione lacaios ${nm} (${d}) em quantidade igual ao ${dieWord(o.n)} do ambiente.`; }
      }
      if (o.other) { if (!fx.other.trim()) I.push('Descreva o outro efeito.'); text += ` Além disso: ${fx.other.trim() || '…'}.`; }
    } else {
      if (o.kind !== 'raise' && !fx.ctext.trim()) I.push(o.kind === 'doomsday' ? 'Descreva o dispositivo do fim do mundo.' : 'Descreva o desafio.');
      const c = fx.ctext.trim() || '…';
      text = { custom: `Adicione um desafio personalizado: ${c}`, simple: `Adicione um desafio simples: ${c}`, timed: `Adicione um desafio com cronômetro (${timerWords(fx)}): ${c}`, raise: 'Aumente a dificuldade de um desafio existente.', doomsday: `Ative o dispositivo do fim do mundo: ${c}` }[o.kind];
      if (!/[.…]$/.test(text)) text += '.';
      if (o.kind !== 'raise') {
        if (getPl(fx.cwhere)) text += ` O desafio fica em ${plName(fx.cwhere)}.`;
        if (getPl(fx.cblocks)) text += ` Enquanto ninguém o superar, ninguém passa para ${plName(fx.cblocks)}.`;
      }
      if (timedOn(o, fx)) {
        const n = Math.max(1, fx.tneed | 0);
        text += timerOf(fx)[0] === 'zone' ? ' O cronômetro vale até a cena mudar de zona (o marcador de cena entrar na próxima zona).' : ' Marque uma caixinha por rodada, no turno do próprio desafio.';
        text += ` Os campeões o resolvem com ${n} ${n === 1 ? 'sucesso' : 'sucessos'} em Superar.`;
        if (!fx.tcons.trim()) I.push('Diga o que acontece se o tempo acabar.');
        text += ` Se o tempo acabar: ${fx.tcons.trim() || '…'}${/[.…]$/.test(fx.tcons.trim()) ? '' : '.'}`;
      }
      if (o.other) { if (!fx.other.trim()) I.push('Descreva o outro efeito.'); text += ` Além disso: ${fx.other.trim() || '…'}.`; }
    }
    return { text, I, dice };
  }
  function twPlain(tw, z, s) {
    const parts = tw.fx.map(f => fxPlain(f, z, s));
    const dice = parts.some(p => p.dice);
    return { text: (dice ? 'Role os dados do ambiente. ' : '') + parts.map(p => p.text).filter(Boolean).join(' '), I: parts.flatMap(p => p.I) };
  }
  function twIssues(tw, z, s) {
    const I = [];
    if (!tw.name.trim()) I.push('dê um nome à reviravolta.');
    if (!tw.fx.length) I.push('adicione pelo menos um efeito.');
    for (const x of twPlain(tw, z, s).I) I.push(x.charAt(0).toLowerCase() + x.slice(1));
    return I.map(t => `“${tw.name.trim() || 'sem nome'}”: ${t}`);
  }
  function stepIssues(id) {
    const N = [];
    if (id === 'concept') { if (!S.name.trim()) N.push('Dê um nome ao ambiente.'); S.places.forEach((x, i) => { if (!x.name.trim()) N.push(`Dê um nome ao local ${i + 1} (ou remova-o).`); }); return N; }
    if (id === 'traits') {
      S.traits.forEach((t, i) => { if (!t.name.trim()) N.push(`Dê um nome ao traço ${i + 1}.`); if (!t.die) N.push(`Escolha o dado do traço ${i + 1}.`); });
      return N;
    }
    if (id === 'threats') return S.threats.flatMap(thIssues);
    if (ZN[id]) {
      const z = S.tw[id];
      if (z.minor.length < 2) N.push(`Crie pelo menos duas reviravoltas menores (hoje há ${z.minor.length}).`);
      if (z.major.length < 1) N.push('Crie a reviravolta maior.');
      for (const s of ['minor', 'major']) for (const tw of z[s]) N.push(...twIssues(tw, id, s));
      return N;
    }
    if (id === 'finish') return ['concept', 'traits', 'threats', 'green', 'yellow', 'red'].flatMap(stepIssues);
    return N;
  }
  const stepIdx = id => STEPS.findIndex(s => s.id === id);
  function reach() { for (let i = 0; i < STEPS.length - 1; i++) if (stepIssues(STEPS[i].id).length) return i; return STEPS.length - 1; }
  const complete = () => !stepIssues('finish').length;

  // ------------------------------------------------------------------ chapter bodies
  const field = (path, label, ph, v) => `<label class="field"><span>${label}</span><input type="text" data-b="${path}" value="${esc(v)}" placeholder="${esc(ph || '')}"></label>`;
  const tchipB = (attrs, on, inner, tipHtml, dis) => `<button type="button" class="tchip${on ? ' on' : ''}" role="radio" aria-checked="${on}" ${attrs}${dis ? ' disabled' : ''}${tipHtml ? tipA(tipHtml) : ''}>${inner}</button>`;
  const IMPACT = () => Object.fromEntries(ED.impact);

  function body(id) {
    if (id === 'concept') return `<div class="grid3">${field('name', 'Nome do ambiente', 'Ex.: Tempestade Sobrenatural sobre a Cidade da Torre', S.name)}${field('scope', 'Escala e lugar', 'Ex.: a cidade inteira; um navio; uma dimensão', S.scope)}</div>
      <label class="field"><span>Clima, aparência e o que ele faz com todos</span><textarea data-b="note" rows="3" placeholder="Como é o lugar, o que ele faz com os campeões, o que o torna perigoso…">${esc(S.note)}</textarea></label>
      <div class="subsec"><h4>Locais <small class="muted">opcional</small></h4>
        <p class="muted env-note">O livro não fixa um número: uma cena pode ter um só local (um parque, um avião) ou vários (a Doca de Pesquisa, a Sala do Portal). Um local não tem ficha de jogo, só um nome ou uma frase que diz para que serve. Use os locais para dizer onde ficam os desafios e o que eles bloqueiam.</p>
        ${S.places.map((x, i) => `<div class="env-row"><label class="field"><span>Local ${i + 1}</span><input type="text" data-pl="${x.id}" value="${esc(x.name)}" placeholder="Ex.: Estação de Metrô, Ponte da Nave, Centro de Controle"></label><button type="button" class="linkbtn danger" data-a="plDel" data-id2="${x.id}">Remover</button></div>`).join('')}
        <button type="button" class="btn small" data-a="plAdd">${ico('mark')} Adicionar local</button></div>
      <div class="portrait-row"><div class="hs-portrait small">${S.portrait ? `<img src="${S.portrait}" alt="Imagem">` : '<span class="muted">Sem imagem</span>'}</div>
        <div><label class="btn small" for="portrait-file">${S.portrait ? 'Trocar imagem' : 'Adicionar imagem'}</label> ${S.portrait ? '<button class="btn small ghost" data-a="clearPortrait">Remover</button>' : ''}<input id="portrait-file" type="file" accept="image/*" hidden>
          <p class="portrait-hint">Uma imagem do lugar (qualquer formato). Ela fica só neste navegador e dentro do arquivo .json e do PDF.</p></div></div>`;
    if (id === 'traits') {
      const v = DV(), imp = IMPACT();
      return `<div class="rename-grid env-traits">${S.traits.map((t, i) => `<div class="rename-card"><span class="rn-h"><b>Traço ${i + 1}</b>${t.die ? die(t.die, 'sm') : ''}<span class="rn-type">${t.die ? esc(imp[t.die]) : 'sem dado'}</span></span>
          <input type="text" data-b="traits.${i}.name" value="${esc(t.name)}" placeholder="${['Ex.: Fendas Dimensionais', 'Ex.: Distorções Horrendas', 'Ex.: Caos Malévolo'][i]}" aria-label="Nome do traço ${i + 1}">
          <div class="tchips" role="radiogroup" aria-label="Dado do traço ${i + 1}">${ED.impact.map(([d, w]) => tchipB(`data-a="tdie" data-i="${i}" data-val="${d}"`, t.die === d, `${die(d, 'sm')}<span>${esc(w)}</span>`, `<h5>${d.toUpperCase()}: ${esc(w)}</h5>Impacto do traço na cena.`)).join('')}</div></div>`).join('')}</div>
        <div class="env-dice"><b>Os dados do ambiente</b> ${v ? `<span class="term"${tipA(window.GLOSSARY['Min die'] ? `<h5>Dado Mín</h5>${window.GLOSSARY['Min die']}` : 'O menor dos três dados.')}>Mín</span> ${die(v.min, 'sm')} <span class="term"${tipA(window.GLOSSARY['Mid die'] ? `<h5>Dado Médio</h5>${window.GLOSSARY['Mid die']}` : 'O dado do meio.')}>Médio</span> ${die(v.mid, 'sm')} <span class="term"${tipA(window.GLOSSARY['Max die'] ? `<h5>Dado Máx</h5>${window.GLOSSARY['Max die']}` : 'O maior dos três dados.')}>Máx</span> ${die(v.max, 'sm')}` : '<span class="muted">escolha os três dados</span>'}</div>`;
    }
    if (id === 'threats') return threatsBody();
    if (ZN[id]) return zoneBody(id);
    return '';
  }

  // the threat library: minions and lieutenants, each with a die, a short description, abilities and tactics
  const PERS_TIP = '<h5>Persistente e exclusivo</h5><b>Persistente</b>: o bônus ou a penalidade não some depois de um uso; dura até algo o remover, até alguém Superar para encerrá-lo ou, no máximo, até o fim da cena. <b>Exclusivo</b>: numa mesma rolagem só vale um bônus exclusivo e uma penalidade exclusiva. Isso vale só para bônus e penalidades (Fortalecer e Atrapalhar), não para dano.';
  function threatsBody() {
    const cards = S.threats.map(thCard).join('');
    return `<div class="env-row"><label class="field"><span>Campeões na mesa</span><input type="number" min="1" max="8" data-b="heroes" value="${esc(S.heroes)}"></label>
        <p class="muted env-note">Usado só no botão “Adicionar à Mesa do Mestre”: um grupo de lacaios tem um por campeão, e tenentes entram na metade (arredondada para cima).</p></div>
      ${cards || '<p class="muted">Nenhuma ameaça ainda.</p>'}
      <button type="button" class="btn small" data-a="thAdd">${ico('mark')} Adicionar lacaio ou tenente</button>`;
  }
  function thCard(th) {
    const k = TK()[th.kind], A = `data-th="${th.id}"`;
    const left = k.maxAb - th.abs.length;
    const warn = th.kind === 'minion' && dieAtLeast(th.die, 'd10') ? `<div class="env-warn" role="note">${ico('warn')}<span><b>Lacaio com dado alto.</b> Lacaios d10 e d12 ficam mortais em grupo. O livro sugere manter o dado baixo e dar <b>habilidades</b> (bônus em ações ou salvamentos) para torná-los especiais. Se a ameaça é de verdade perigosa, faça dela um tenente.</span></div>` : th.kind === 'lieutenant' && th.die === 'd6' ? `<div class="env-warn" role="note">${ico('warn')}<span><b>Tenente d6.</b> É raro: tenentes costumam ir de d8 a d12.</span></div>` : '';
    return `<div class="ab ant picked env-tw env-th" data-thcard="${th.id}">
      <div class="ab-top"><span class="ab-name">${esc(th.name.trim() || 'Ameaça sem nome')}</span><span class="pill">${k.name} ${esc(th.die)}</span><button type="button" class="linkbtn danger env-del" data-a="thDel" ${A}>Remover</button></div>
      <div class="env-fields"><label class="field"><span>Nome</span><input type="text" data-th="${th.id}" data-f="name" value="${esc(th.name)}" placeholder="Ex.: Diabretes da Tempestade"></label>
        <label class="field"><span>Descrição (o que é e como ataca)</span><input type="text" data-th="${th.id}" data-f="desc" value="${esc(th.desc)}" placeholder="Uma frase: corpo a corpo ou à distância, o que o torna uma ameaça"></label></div>
      <div class="env-row"><div><div class="cfg-l">Tipo</div><div class="tchips" role="radiogroup">${Object.keys(TK()).map(key => tchipB(`data-a="thKind" ${A} data-val="${key}"`, th.kind === key, `<span>${TK()[key].name}</span>`, `<h5>${TK()[key].name}</h5>${esc(TK()[key].save)}`)).join('')}</div></div>
        <div><div class="cfg-l">Dado</div><div class="tchips" role="radiogroup">${k.dice.map(d => tchipB(`data-a="thDie" ${A} data-val="${d}"`, th.die === d, die(d, 'sm'))).join('')}</div></div></div>
      <p class="muted env-note"><b>Salvamento.</b> ${esc(k.save)}</p>${warn}
      <div class="cfg-l">Habilidades <small class="muted">(${th.kind === 'minion' ? '0 a 2' : '1 a 3'}; bônus de 1 a 3, o mais comum é 2)</small></div>
      ${th.abs.map((a, i) => { const t = abTpl(a.t); return `<div class="env-ab"><div class="env-ab-h"><b>${esc(abName(a))}</b>${t && t.t(1, 'x') !== t.t(2, 'x') ? `<span class="tchips" role="radiogroup" aria-label="Valor do bônus ou da penalidade"${tipA('<h5>Valor</h5>O número do bônus ou da penalidade desta habilidade. O livro usa de 1 a 3, e o mais comum é 2.')}>${[1, 2, 3].map(v => tchipB(`data-a="thAbV" ${A} data-i="${i}" data-val="${v}"`, a.v === v, `<span>${v}</span>`)).join('')}</span>` : ''}<button type="button" class="linkbtn danger" data-a="thAbDel" ${A} data-i="${i}">Remover</button></div>
        ${t && t.ph ? `<input type="text" data-th="${th.id}" data-ab="${i}" data-f="x" value="${esc(a.x)}" placeholder="${esc(t.ph)}" aria-label="Detalhe da habilidade">` : ''}<div class="ab-text">${esc(abText(a))}</div></div>`; }).join('')}
      ${left > 0 ? `<label class="field"><span>Adicionar habilidade</span><select data-thadd="${th.id}"><option value="">Escolha…</option>${ED.abilities.map(t => `<option value="${t.id}">${esc(t.name)}</option>`).join('')}</select></label>` : ''}
      <label class="field"><span>Tática (opcional)</span><input type="text" data-th="${th.id}" data-f="tactics" value="${esc(th.tactics)}" placeholder="Como age na cena, em uma frase"></label>
      <div class="env-row"><button type="button" class="btn small" data-a="thMesa" ${A}>Adicionar à Mesa do Mestre</button><span class="muted env-note" data-mesa="${th.id}"></span></div></div>`;
  }

  // one zone: the minor twists and the major twist, each built from the rulebook's recipes
  function zoneBody(z) {
    const sec = (s, title, hint, max) => {
      const list = S.tw[z][s];
      return `<div class="subsec"><h4>${title} <small class="muted">${hint}</small></h4>
        ${list.map(tw => twCard(z, s, tw)).join('')}
        ${list.length < max ? `<button type="button" class="btn small" data-a="twAdd" data-z="${z}" data-s="${s}">${ico('mark')} Adicionar reviravolta ${s === 'minor' ? 'menor' : 'maior'}</button>` : ''}</div>`;
    };
    return `${sec('minor', 'Reviravoltas menores', 'duas ou três', 3)}${sec('major', 'Reviravolta maior', 'uma', 1)}`;
  }
  function twCard(z, s, tw) {
    const pl = twPlain(tw, z, s);
    return `<div class="ab ant picked env-tw" data-twcard="${tw.id}">
      <div class="ab-top"><span class="ab-name">${esc(tw.name.trim() || 'Reviravolta sem nome')}</span><span class="pill ${z}">${SEV[s]}</span><button type="button" class="linkbtn danger env-del" data-a="twDel" data-id="${tw.id}">Remover</button></div>
      <div class="env-fields"><label class="field"><span>Nome</span><input type="text" data-tw="${tw.id}" data-f="name" value="${esc(tw.name)}" placeholder="Ex.: Uma Fenda se Abre"></label>
        <label class="field"><span>O que acontece na história</span><input type="text" data-tw="${tw.id}" data-f="desc" value="${esc(tw.desc)}" placeholder="Uma frase que descreve a cena"></label></div>
      ${tw.fx.map((fx, i) => fxBlock(z, s, tw, fx, i)).join('')}
      ${tw.fx.length < 3 ? `<button type="button" class="btn small ghost" data-a="fxAdd" data-id="${tw.id}">${ico('mark')} Combinar com outro efeito</button>` : ''}
      <div class="env-prev" data-prev="${tw.id}">${prevHtml(z, s, tw)}</div></div>`;
  }
  function prevHtml(z, s, tw) {
    const pl = twPlain(tw, z, s);
    return `<b>Texto do jogo</b><div class="ab-text">${pl.text.trim() ? ruleHtml(pl.text) : '<span class="muted">Escolha uma receita.</span>'}</div>`;
  }
  function fxBlock(z, s, tw, fx, i) {
    const cats = catsFor(z, s), o = getOpt(fx, z, s);
    const A = `data-id="${tw.id}" data-i="${i}"`;
    const catChips = `<div class="tchips" role="radiogroup" aria-label="Tipo de efeito">${cats.map(([c, l]) => tchipB(`data-a="fxCat" ${A} data-val="${c}"`, fx.cat === c, `<span>${l}</span>`, ({ basic: 'Hinder, Boost, Attack, Defend ou Overcome, usando os dados do ambiente.', threat: 'Lacaios ou tenentes que entram na cena. Eles só agem no turno seguinte.', challenge: 'Um problema que os campeões resolvem com Superar. Pode ser o dispositivo do fim do mundo, na Vermelha maior.', advance: 'Opcional, só na reviravolta maior: avança o marcador mais um espaço, além do avanço normal do turno do ambiente.' })[c])).join('')}</div>`;
    let opts = '';
    if (fx.cat !== 'advance') {
      opts = `<div class="cfg-l">Receita do livro para a zona ${ZN[z]}, reviravolta ${SEV[s].toLowerCase()}</div><div class="ab-list env-opts">${optsFor(fx.cat, z, s).map(r => `<div class="ab ant${fx.opt === r.id ? ' picked' : ''}" data-a="fxOpt" ${A} data-val="${r.id}" role="radio" aria-checked="${fx.opt === r.id}"><div class="ab-top"><input type="checkbox" tabindex="-1"${fx.opt === r.id ? ' checked' : ''} aria-hidden="true"><span class="ab-name">${esc(optLabel(fx.cat, r))}</span></div></div>`).join('')}</div>`;
    }
    let cfg = '';
    if (o && o.custom) cfg += `<div class="env-warn" role="note">${ico('warn')}<span><b>Receita fora das tabelas do livro.</b> Você decide a força. Como referência, compare com as receitas da zona ${ZN[z]} acima: uma reviravolta ${SEV[s].toLowerCase()} não deveria passar da mais forte delas.</span></div>`;
    if (o && o.custom && fx.cat === 'basic') {
      cfg += `<label class="field"><span>O efeito (ações, quem atinge e a condição)</span><input type="text" data-tw="${tw.id}" data-i="${i}" data-f="ctext" value="${esc(fx.ctext)}" placeholder="Ex.: Defenda quem não Atacou no último turno com o dado Médio e Atrapalhe os demais com o dado Mín"></label>
        <div class="cfg-l">Dados do ambiente que ele usa <small class="muted">(opcional)</small></div><div class="tchips" role="radiogroup">${['min', 'mid', 'max'].map(d => tchipB(`data-a="fxCdice" ${A} data-val="${d}"`, fx.cdice.includes(d), `<span>${dieWord(d)}</span>`)).join('')}</div>`;
    }
    if (o && fx.cat === 'basic' && !o.custom) {
      cfg += o.acts.map((a, k) => {
        const pers = isPersist(o, fx, k), v = fx.verbs[k] || 'hinder';
        const verbs = verbsFor(o, fx, k).map(key => [key, VERBS[key]]);
        return `<div class="cfg-l">Ação ${o.acts.length > 1 ? k + 1 + ': ' : ''}${v === 'overcome' ? 'um dos desafios restantes da cena' : esc(WHO_TXT[a.who])} ${esc(withDie(a.die))}${pers ? ` <span class="term"${tipA(PERS_TIP)}>(persistente e exclusiva)</span>` : ''}</div><div class="tchips" role="radiogroup">${verbs.map(([key, l]) => tchipB(`data-a="fxVerb" ${A} data-k="${k}" data-val="${key}"`, v === key, `<span>${l[0]}</span>`, `<h5>${l[0]}</h5>${window.GLOSSARY[{ attack: 'Attack', hinder: 'Hinder', boost: 'Boost', defend: 'Defend', overcome: 'Overcome' }[key]] || ''}${VERB_WARN[key] ? `<hr><small>${VERB_WARN[key]}</small>` : ''}`)).join('')}</div>${VERB_WARN[v] ? `<div class="env-warn" role="note">${ico('warn')}<span>${VERB_WARN[v]}</span></div>` : ''}`;
      }).join('');
      if (o.persistOne) cfg += `<div class="cfg-l">Qual das ações é persistente e exclusiva?</div><div class="tchips" role="radiogroup">${o.acts.map((a, k) => tchipB(`data-a="fxPers" ${A} data-val="${k}"`, (fx.persistIdx || 0) === k, `<span>Ação ${k + 1}</span>`)).join('')}</div>`;
    }
    if (o && fx.cat === 'threat' && !o.restore) {
      const pool = S.threats.filter(t => (t.kind === 'lieutenant') === !!o.lt), cur = getTh(fx.tid);
      cfg += pool.length ? `<div class="cfg-l">${o.lt ? 'Tenente' : 'Lacaio'} da biblioteca</div><div class="tchips" role="radiogroup">${pool.map(t => tchipB(`data-a="fxThreat" ${A} data-val="${t.id}"`, fx.tid === t.id, `<span>${esc(t.name.trim() || 'Sem nome')}</span>${die(t.die, 'sm')}`, thTip(t))).join('')}</div>`
        : `<div class="env-warn" role="note">${ico('warn')}<span>Ainda não há ${o.lt ? 'nenhum tenente' : 'nenhum lacaio'} na biblioteca. <button type="button" class="linkbtn" data-a="go" data-i="${stepIdx('threats')}">Criar no capítulo Ameaças</button></span></div>`;
      if (cur && !o.lt && o.n !== 'one' && cur.kind === 'minion' && dieAtLeast(cur.die, 'd10')) cfg += `<div class="env-warn" role="note">${ico('warn')}<span><b>${esc(cur.die)} em quantidade.</b> Vários lacaios ${esc(cur.die)} tiram muita Vida dos campeões de uma vez. Considere um dado menor com habilidades, ou um tenente.</span></div>`;
    }
    if (o && fx.cat === 'challenge' && o.kind !== 'raise') {
      const sel = (f, label, none) => `<label class="field"><span>${label}</span><select data-tw="${tw.id}" data-i="${i}" data-f="${f}"><option value="">${none}</option>${S.places.map(x => `<option value="${x.id}"${fx[f] === x.id ? ' selected' : ''}>${esc(x.name.trim() || 'local sem nome')}</option>`).join('')}</select></label>`;
      cfg += S.places.length ? `<div class="env-row">${sel('cwhere', 'Onde fica o desafio', 'A cena toda')}${sel('cblocks', 'Enquanto não for superado, bloqueia a passagem para', 'Nenhum local')}</div>` : `<p class="muted env-note">Cadastre os locais da cena no capítulo Conceito para dizer onde fica o desafio e o que ele bloqueia.</p>`;
    }
    if (o && fx.cat === 'challenge' && o.kind !== 'raise') cfg += `<label class="field"><span>${o.kind === 'doomsday' ? 'O dispositivo do fim do mundo' : o.custom ? 'O desafio personalizado' : 'O desafio'}</span><input type="text" data-tw="${tw.id}" data-i="${i}" data-f="ctext" value="${esc(fx.ctext)}" placeholder="${o.kind === 'doomsday' ? 'Ex.: Fendas gigantes se abrem por toda a cidade' : 'Ex.: Resgatar os cidadãos antes do próximo turno do ambiente'}"></label>`;
    if (o && o.custom && fx.cat === 'challenge') cfg += `<div class="cfg-l">Tem cronômetro?</div><div class="tchips" role="radiogroup">${[[false, 'Sem cronômetro'], [true, 'Com cronômetro']].map(([v, l]) => tchipB(`data-a="fxCtimer" ${A} data-val="${v}"`, fx.ctimer === v, `<span>${l}</span>`)).join('')}</div>`;
    if (timedOn(o, fx) && fx.cat === 'challenge') {
      cfg += `<div class="cfg-l">Cronômetro <small class="muted">(uma caixinha marcada por rodada, no turno do próprio desafio)</small></div><div class="tchips" role="radiogroup">${ED.timers.map(t => tchipB(`data-a="fxTm" ${A} data-val="${t[0]}"`, fx.tm === t[0], `<span>${esc(t[1])}</span>`, `<h5>${esc(t[1])}</h5>${esc(t[2])}`)).join('')}</div>
        <div class="cfg-l">Sucessos em Superar para resolver</div><div class="tchips" role="radiogroup">${[1, 2, 3, 4, 5].map(n => tchipB(`data-a="fxNeed" ${A} data-val="${n}"`, fx.tneed === n, `<span>${n}</span>`)).join('')}</div><p class="muted env-note">O livro não impõe um limite, mas recomenda cerca de <b>3 sucessos, no máximo 5</b>, para variar as ameaças da cena.</p>
        <label class="field"><span>Se o tempo acabar…</span><input type="text" data-tw="${tw.id}" data-i="${i}" data-f="tcons" value="${esc(fx.tcons)}" placeholder="Ex.: o prédio desaba e todos na zona sofrem um Ataque com o dado Máx"></label>
        <p class="muted env-note">Se a consequência for o fim do cenário, descreva-o como desafio personalizado na reviravolta maior da zona Vermelha, em vez de usar um cronômetro comum.</p>`;
    }
    if (o && o.other) cfg += `<label class="field"><span>O outro efeito${o.other === 'any' || fx.cat !== 'basic' ? '' : ` (${esc(withDie(o.other))})`}</span><input type="text" data-tw="${tw.id}" data-i="${i}" data-f="other" value="${esc(fx.other)}" placeholder="Descreva o outro efeito"></label>`;
    return `<div class="env-fx"><div class="cfg-l env-fxh">Efeito ${i + 1}${tw.fx.length > 1 ? ` <button type="button" class="linkbtn danger" data-a="fxDel" ${A}>Remover efeito</button>` : ''}</div>${catChips}${opts}${cfg}</div>`;
  }

  // ------------------------------------------------------------------ the sheet
  const ICON_RE = [['Attack', /\bAta[cq]\w*/], ['Defend', /\bDefe[ns]\w*/], ['Overcome', /\bSuper\w*/], ['Boost', /\bFortale\w*/], ['Hinder', /\bAtrapalh\w*/], ['Recover', /\bRecuper\w*/]];
  const iconsFor = text => ICON_RE.filter(([, re]) => re.test(text)).map(([a]) => `<span class="act-ic act-${a.toLowerCase()}"${tipA(`<h5>Ícone de ${K().ICONS[a][1]}</h5>${window.GLOSSARY[a]}`)}>${K().ICONS[a][0]}</span>`).join('');
  const zoneTip = z => `<h5>Zona ${ZN[z]}</h5>${ZSTAGE[z]}. ${window.GLOSSARY[{ green: 'Green zone', yellow: 'Yellow zone', red: 'Red zone' }[z]] || ''}`;
  const lines = (path, list, n, label) => Array.from({ length: n }, (_, i) => `<input class="hs-line" type="text" data-b="${path}.${i}" value="${esc(list[i] || '')}" aria-label="${label} ${i + 1}">`).join('');
  function challengesOf() {
    const ch = [];
    for (const z of Object.keys(ZN)) for (const sv of ['minor', 'major']) for (const tw of S.tw[z][sv]) for (const fx of tw.fx) {
      const o = getOpt(fx, z, sv);
      if (fx.cat === 'challenge' && o && fx.ctext.trim()) ch.push({ z, t: fx.ctext.trim(), kind: o.kind, timer: timedOn(o, fx) ? `cronômetro: ${timerWords(fx)} · ${Math.max(1, fx.tneed | 0)} ${(fx.tneed | 0) === 1 ? 'sucesso' : 'sucessos'} em Superar · se acabar: ${fx.tcons.trim() || '…'}` : '' });
    }
    return ch;
  }
  const thSheet = th => `<div class="env-thc"><div class="env-thc-h"><b>${esc(th.name.trim() || 'sem nome')}</b> ${die(th.die, 'sm')} <small class="muted">${TK()[th.kind].name.toLowerCase()}</small></div>
    ${th.desc.trim() ? `<div class="env-thc-d">${esc(th.desc.trim())}</div>` : ''}${th.abs.map(a => `<div class="env-thc-a"><b>${esc(abName(a))}.</b> ${esc(abText(a))}</div>`).join('')}${th.tactics.trim() ? `<div class="env-thc-t"><i>Tática:</i> ${esc(th.tactics.trim())}</div>` : ''}<div class="env-thc-s"><i>Salvamento:</i> ${esc(TK()[th.kind].save)}</div></div>`;
  const usedThreats = tw => tw.fx.map(f => (f.cat === 'threat' ? getTh(f.tid) : null)).filter(Boolean);
  function sheetHtml() {
    const imp = IMPACT(), v = DV(), title = esc(S.name || 'Ambiente sem nome'), ch = challengesOf();
    const zoneBlock = z => {
      const rows = ['minor', 'major'].flatMap(s => S.tw[z][s].map(tw => {
        const pl = twPlain(tw, z, s);
        return `<tr><td class="ic">${iconsFor(pl.text)}</td><td class="nm">${esc(tw.name || 'sem nome')}<small>${SEV[s]}</small></td><td class="ty">${s === 'major' ? 'M' : 'm'}</td><td class="gt">${ruleHtml(pl.text)}${usedThreats(tw).length ? `<div class="env-thr">${usedThreats(tw).map(thChip).join(' ')}</div>` : ''}${tw.desc.trim() ? `<div class="env-story">${esc(tw.desc.trim())}</div>` : ''}</td></tr>`;
      }));
      return `<div class="hs-zone ${z}"><div class="zlbl"${tipA(zoneTip(z))}>${ZN[z]}</div><table class="hs-ab-t"><tbody>${rows.join('') || '<tr><td class="gt muted">Nenhuma reviravolta ainda.</td></tr>'}</tbody></table></div>`;
    };
    return `<div class="hero-sheet">
      <div class="hs-page" id="hs-p1">
        <div class="hs-top">
          <div class="hs-left"><div class="hs-portrait">${S.portrait ? `<img src="${S.portrait}" alt="Imagem de ${title}">` : '<span class="muted">Imagem</span>'}</div></div>
          <div class="hs-idblock">
            <div class="hs-card"><div class="hs-h">Ambiente</div><div class="hs-name">${title}</div></div>
            <div class="hs-card"><div class="hs-h">Escala e lugar</div><div class="hs-ml">${esc(S.scope || '')}&nbsp;</div></div>
            <div class="hs-card"><div class="hs-h">Clima, aparência e o que ele faz com todos</div><div class="hs-ml">${esc((S.note || '').trim())}&nbsp;</div></div>
          </div>
        </div>
        <div class="hs-2 ant-traits">
          <table class="hs-traits"><thead><tr><th>Traços</th><th>Dado</th></tr></thead><tbody>${S.traits.map(t => `<tr><td>${esc(t.name || '?')}${t.die ? `<small class="hs-orig">${esc(imp[t.die])}</small>` : ''}</td><td class="dt">${t.die ? die(t.die, 'sm') : ''}</td></tr>`).join('')}</tbody></table>
          <div class="hs-card"><div class="hs-h"${tipA('<h5>Dados do ambiente</h5>O ambiente rola os três dados dos traços sempre que age. Mín, Médio e Máx são o menor, o do meio e o maior.')}>Dados do ambiente</div>
            ${v ? `<div class="env-dice">Mín ${die(v.min, 'sm')} · Médio ${die(v.mid, 'sm')} · Máx ${die(v.max, 'sm')}</div>` : '<span class="muted">Escolha os três dados.</span>'}
            <div class="hs-h" style="margin-top:10px">Turno do ambiente</div>
            <p class="env-turn-note">É um <b>passo a passo</b>, feito <b>nesta ordem</b> a cada turno do ambiente. Não são opções para escolher.</p>
            <ol class="env-turn"><li><span class="term"${tipA('<h5>1. Avance o marcador de cena</h5>Sempre é a primeira coisa do turno do ambiente: marque a próxima casa do marcador, de Verde para Vermelho. Isso acontece em todo turno, haja ou não reviravolta. Ao marcar a última casa de uma cor, a cena entra na zona seguinte.')}>Avance o marcador de cena.</span></li><li><span class="term"${tipA('<h5>2. Ative as ameaças que já estão em cena</h5>Os lacaios e tenentes que o ambiente colocou em turnos anteriores agem agora, como qualquer outro lacaio ou tenente: uma ação básica (Atacar, Atrapalhar, Fortalecer ou Defender) ou uma habilidade própria. Você decide o que cada um faz, conforme a natureza dele, e eles podem estar do lado dos heróis, do vilão ou contra os dois. Grupos podem agir de uma vez, rolando todos os dados juntos. Ameaças recém-chegadas só agem no turno seguinte.')}>Ative as ameaças que já estão em cena.</span></li><li><span class="term"${tipA('<h5>3. Nova ameaça ou reviravolta</h5>Se <b>não há nenhuma ameaça do ambiente</b> em cena, introduza uma, entre as liberadas pela zona atual: ela só age no turno seguinte. Se já há, <b>acione uma reviravolta</b> da zona atual (cada reviravolta maior vale uma vez por cena). Se nenhuma reviravolta servir, role os dados do ambiente como Atacar, Fortalecer ou Atrapalhar.')}>Introduza uma ameaça nova <b>ou</b> acione uma reviravolta da zona atual.</span></li></ol></div>
        </div>
        ${S.places.length ? `<div class="hs-card"><div class="hs-h"${tipA('<h5>Locais</h5>Os lugares da cena. Um local não tem ficha de jogo: serve para dizer onde ficam heróis, ameaças e desafios.')}>Locais da cena</div>${S.places.map(x => `<div class="hs-f">${esc(x.name.trim() || 'sem nome')}</div>`).join('')}</div>` : ''}
        ${S.threats.length ? `<div class="hs-card"><div class="hs-h">Ameaças deste ambiente</div><div class="env-thcs">${S.threats.map(thSheet).join('')}</div></div>` : ''}
        ${ch.length ? `<div class="hs-card"><div class="hs-h">Desafios deste ambiente</div>${ch.map(c => `<div class="hs-f">${esc(c.t)} <small class="muted">${c.kind === 'doomsday' ? 'fim do mundo' : 'desafio'} · ${ZN[c.z]}</small>${c.timer ? `<div class="env-story">${esc(c.timer)}</div>` : ''}</div>`).join('')}</div>` : ''}
        <div class="hs-card"><div class="hs-h">Notas de mesa</div><div class="hs-notes">${lines('play.notes', S.play.notes, 8, 'Nota')}</div></div>
      </div>
      <div class="hs-page" id="hs-p2">
        <div class="hs-card hs-3"><div><div class="hs-h">Ambiente</div>${title}</div><div><div class="hs-h">Escala</div>${esc(S.scope || '')}&nbsp;</div><div><div class="hs-h">Dados</div>${v ? `${die(v.min, 'sm')} ${die(v.mid, 'sm')} ${die(v.max, 'sm')}` : ''}</div></div>
        <div class="hs-h" style="margin-top:6px">Reviravoltas</div>
        ${['green', 'yellow', 'red'].map(zoneBlock).join('')}
      </div>
    </div>`;
  }
  function sheetText() {
    const v = DV(), L = [`${S.name || 'Ambiente sem nome'}${S.scope ? ' · ' + S.scope : ''}`];
    L.push('Traços: ' + S.traits.map(t => `${t.name || '?'} ${t.die || '?'}`).join(', '));
    if (v) L.push(`Dados do ambiente: Mín ${v.min}, Médio ${v.mid}, Máx ${v.max}`);
    for (const z of Object.keys(ZN)) {
      L.push('', `ZONA ${ZN[z].toUpperCase()}`);
      for (const s of ['minor', 'major']) for (const tw of S.tw[z][s]) L.push(`${SEV[s]}: ${tw.name || 'sem nome'}${tw.desc ? ' (' + tw.desc + ')' : ''}: ${twPlain(tw, z, s).text}`);
    }
    if (S.places.length) L.push('', 'LOCAIS: ' + S.places.map(x => x.name || 'sem nome').join(', '));
    if (S.threats.length) { L.push('', 'AMEAÇAS'); for (const t of S.threats) L.push(`${t.name || 'sem nome'} (${TK()[t.kind].name.toLowerCase()} ${t.die})${t.desc ? ': ' + t.desc : ''}${t.abs.length ? ' · ' + t.abs.map(a => `${abName(a)}: ${abText(a)}`).join(' ') : ''}${t.tactics ? ' · Tática: ' + t.tactics : ''}`); }
    const chs = challengesOf(); if (chs.length) { L.push('', 'DESAFIOS'); for (const c of chs) L.push(`${c.t} (${ZN[c.z]})${c.timer ? ' · ' + c.timer : ''}`); }
    if (S.note) L.push('', S.note);
    return L.join('\n');
  }

  // ------------------------------------------------------------------ pages
  function chapterHead(i) {
    const s = STEPS[i];
    return `<header class="chapter"><div class="chapter-num" aria-hidden="true">${ROMAN[i + 1]}</div>
      <div class="chapter-titles"><div class="chapter-kicker">Capítulo ${ROMAN[i + 1]} <span>de ${ROMAN[STEPS.length]}</span></div><h2 class="chapter-title">${esc(s.title)}</h2></div>
      <div class="chapter-tools"><button class="btn small ghost guide-btn" data-a="guide">${ico('codex')} Guia</button></div></header>`;
  }
  const todoHtml = need => (need.length ? `<div class="flow-todo"><span class="flow-todo-l">Ainda falta</span><ul>${need.map(x => `<li>${esc(x)}</li>`).join('')}</ul></div>` : '');
  function footer(i) {
    const ready = !stepIssues(STEPS[i].id).length, next = STEPS[i + 1];
    return `<div class="step-footer"><div class="footer-left">${i > 0 ? `<button class="btn ghost" data-a="back">${ico('prev')} Voltar</button>` : ''}</div>
      ${next ? `<div class="next-wrap"><button class="btn primary${ready ? '' : ' is-disabled'}" data-a="next" aria-disabled="${!ready}"><span class="btn-kicker">Capítulo ${ROMAN[i + 2]}</span>${esc(next.name)} ${ico('next')}</button></div>` : ''}</div>`;
  }
  function navHtml() {
    const r = reach(), cur = stepIdx(S.step);
    return `<div class="rail-title">Oficina de Ambiente</div><ol class="rail">${STEPS.map((s, i) => {
      const locked = i > r, I = locked ? [] : stepIssues(s.id);
      const cls = ['rail-item', i === cur ? 'active' : '', locked ? 'locked' : I.length ? 'open' : 'done'].join(' ');
      const status = locked ? 'Fechado' : i === cur ? 'Você está aqui' : I.length ? 'Falta algo' : s.sub;
      return `<li class="${cls}"><button data-a="go" data-i="${i}"${locked ? ' disabled title="Complete os capítulos anteriores primeiro"' : ''}${i === cur ? ' aria-current="step"' : ''}>
        <span class="rail-mark"><span>${ROMAN[i + 1]}</span></span><span class="rail-label"><span class="rail-name">${esc(s.name)}</span><span class="rail-sub">${esc(status)}</span></span></button></li>`;
    }).join('')}</ol>`;
  }
  function stageHtml() {
    const i = Math.min(stepIdx(S.step), reach()), s = STEPS[i];
    S.step = s.id;
    const need = stepIssues(s.id);
    const gid = ZN[s.id] ? 'zone' : s.id;
    const showGuide = ui.guide[s.id] != null ? ui.guide[s.id] : !S.seen[s.id];
    const guide = showGuide ? `<div class="ant-guide" role="note"><b>Guia deste capítulo</b>${GUIDE[gid]}</div>` : '';
    if (s.id === 'finish') {
      const done = !need.length;
      return `<div class="panel no-print">${chapterHead(i)}<p class="chapter-lede">${s.lede}</p>${guide}
        <section class="flow-sec current"><div class="flow-head"><span class="flow-num">${done ? ico('mark') : i + 1}</span><h3>${done ? 'Pronta para a mesa' : 'Quase lá'}</h3></div>
          <div class="flow-body">${todoHtml(need)}
            <div class="export-row"><button class="btn primary" data-a="pdf">${ico('download')} Exportar PDF da ficha</button><button class="btn" data-a="print">${ico('print')} Imprimir</button><button class="btn" data-a="export">${ico('file')} Exportar .json</button><button class="btn" data-a="copy">Copiar como texto</button></div>
            <div id="pdf-status"></div></div></section>
        ${footer(i).replace(/<div class="next-wrap">[\s\S]*$/, '</div>')}</div>
        <div class="panel" id="sheet-preview">${sheetHtml()}</div>`;
    }
    return `<div class="panel">${chapterHead(i)}<p class="chapter-lede">${s.lede}</p>${guide}
      <section class="flow-sec current"><div class="flow-head"><span class="flow-num">${i + 1}</span><h3>${esc(s.title)}</h3><span class="flow-here">Você está aqui</span></div>
        <div class="flow-body">${body(s.id)}<div class="todo-slot">${todoHtml(need)}</div></div></section>
      ${footer(i)}</div>`;
  }
  function render(opts = {}) {
    K().tipReset();
    $('#nav').innerHTML = navHtml();
    const y = window.scrollY;
    const focus = document.activeElement && document.activeElement.closest && document.activeElement.closest('#stage') ? ['data-a', 'data-b', 'data-id', 'data-i', 'data-val', 'data-k', 'data-f'].filter(k => document.activeElement.getAttribute(k) != null).map(k => `[${k}="${CSS.escape(document.activeElement.getAttribute(k))}"]`).join('') : '';
    $('#stage').innerHTML = stageHtml();
    if (opts.top) window.scrollTo(0, 0); else window.scrollTo(0, y);
    if (focus && !opts.top) { const e = $('#stage ' + focus); if (e && !['INPUT', 'TEXTAREA'].includes(e.tagName)) e.focus({ preventScroll: true }); }
    const c = $('#roster-count'); if (c) c.textContent = rosterIds().length || '';
  }
  // typing never redraws the page; only what depends on it: the rail, the "falta" list, the Continue button and the twist preview
  function light(twId) {
    const i = stepIdx(S.step);
    $('#nav').innerHTML = navHtml();
    const slot = $('#stage .todo-slot'); if (slot) slot.innerHTML = todoHtml(stepIssues(S.step));
    const f = $('#stage .step-footer'); if (f && i < STEPS.length - 1) f.outerHTML = footer(i);
    if (twId) {
      const hit = getTw(twId), pv = $(`[data-prev="${twId}"]`);
      if (hit && pv) pv.innerHTML = prevHtml(hit.z, hit.s, hit.tw);
      const nm = $(`[data-twcard="${twId}"] > .ab-top .ab-name`); if (nm && hit) nm.textContent = hit.tw.name.trim() || 'Reviravolta sem nome';
    }
  }

  // ------------------------------------------------------------------ actions
  const setPath = (o, path, v) => { const p = path.split('.'); let t = o; for (let i = 0; i < p.length - 1; i++) { if (t[p[i]] == null) t[p[i]] = /^\d+$/.test(p[i + 1]) ? [] : {}; t = t[p[i]]; } t[p[p.length - 1]] = v; };
  function go(i, top = true) { i = Math.max(0, Math.min(i, reach())); S.seen[S.step] = true; S.step = STEPS[i].id; save(); render({ top }); }
  const fileBase = () => ((S.name || '').trim() || 'ambiente').replace(/[^\w-]+/g, '_');
  function exportJson() {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([JSON.stringify(Object.assign({ app: 'runeterra-environment', v: 1 }, S), null, 2)], { type: 'application/json' }));
    a.download = fileBase() + '.json';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }
  function importJson(text) {
    let o;
    try { o = JSON.parse(text); } catch (e) { alert('Este arquivo não é um .json válido.'); return; }
    if (!o || o.app !== 'runeterra-environment') { alert('Este arquivo não é de um ambiente da Oficina de Ambiente.'); return; }
    save();
    delete o.app; delete o.v;
    S = hydrate(o);
    const old = read(SLOT(S.cid));
    if (rosterIds().includes(S.cid) && old && old.updated > S.updated) S.cid = uid();
    save(); render({ top: true });
  }
  function loadPortrait(file) {
    if (!file) return;
    const r = new FileReader();
    r.onload = () => {
      const img = new Image();
      img.onload = () => {
        const max = 900, k = Math.min(1, max / Math.max(img.width, img.height));
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
    if (!window.PDFLib) {
      const ref = document.querySelector('script[src*="sheet-pdf.js"]');
      await new Promise(done => { const sc = document.createElement('script'); sc.src = ref ? ref.src.replace('sheet-pdf.js', 'vendor/pdf-lib.min.js') : 'js/vendor/pdf-lib.min.js'; sc.onload = sc.onerror = done; document.head.appendChild(sc); });
    }
    if (!window.PDFLib || !window.SheetPDF) { say('A biblioteca de PDF não carregou.', true); return; }
    try {
      const bytes = await window.SheetPDF.render({
        html: sheetHtml(), cssHref: document.querySelector('link[href*="style.css"]').href, fontBase: new URL('assets/fonts/', location.href).href,
        fontkitSrc: 'js/vendor/fontkit.umd.min.js', pageBg: getComputedStyle(document.body).backgroundColor, onStatus: x => say(esc(x)),
        title: `Ficha de Ambiente: ${S.name || 'ambiente sem nome'}`, creator: 'Oficina de Ambiente · Runeterra'
      });
      const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' })); a.download = fileBase() + '_ficha_ambiente.pdf';
      document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
      say('PDF baixado. As notas de mesa viram campos que dá para digitar em qualquer leitor de PDF.');
    } catch (e) { say('Não foi possível montar o PDF: ' + esc(e.message), true); }
  }

  // roster
  const zoneCount = c => Object.keys(ZN).reduce((n, z) => n + ((c.tw && c.tw[z] ? c.tw[z].minor.length + c.tw[z].major.length : 0)), 0);
  function rosterHtml() {
    const list = rosterIds().map(id => (id === S.cid ? S : read(SLOT(id)))).filter(Boolean).sort((a, b) => (b.cid === S.cid) - (a.cid === S.cid) || (b.updated || 0) - (a.updated || 0));
    const when = t => (t ? new Date(t).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' }) : '');
    return `<div class="ro-back" data-a="rosterClose"></div><section class="ro-panel" role="dialog" aria-modal="true" aria-labelledby="ro-title">
      <header class="ro-head"><div><h2 id="ro-title">Meus ambientes</h2><p class="muted">Guardados neste navegador. Exporte (Arquivo) para guardar uma cópia ou levar para outro aparelho.</p></div>
        <button type="button" class="btn primary" data-a="rosterNew">${ico('mark')} Novo ambiente</button><button type="button" class="ro-x" data-a="rosterClose" aria-label="Fechar">✕</button></header>
      <ul class="ro-list">${list.map(c => `<li class="ro-item${c.cid === S.cid ? ' on' : ''}"><div class="ro-pic">${c.portrait ? `<img src="${c.portrait}" alt="">` : ico('map')}</div>
        <div class="ro-main"><div class="ro-name">${esc((c.name || '').trim() || 'Ambiente sem nome')}</div><div class="ro-line">${esc(c.scope || '')}${c.scope ? ' · ' : ''}${zoneCount(c)} reviravoltas</div><div class="ro-meta"><span>Editado ${when(c.updated)}</span></div></div>
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
  function pickOpt(fx, z, s, optId) {
    fx.opt = optId; fx.persistIdx = 0;
    const o = getOpt(fx, z, s);
    if (o && fx.cat === 'basic') fx.verbs = o.acts.map((a, i) => (fx.verbs[i] && verbsFor(o, fx, i).includes(fx.verbs[i])) ? fx.verbs[i] : 'hinder');
    if (fx.cat === 'threat') { const th = getTh(fx.tid); if (th && (th.kind === 'lieutenant') !== !!(o && o.lt)) fx.tid = ''; }
  }
  // sends a threat to the GM Table (Escudo): one minion per hero, half as many lieutenants (rounded up)
  function sendToTable(th) {
    const n = Math.max(1, Math.min(8, parseInt(S.heroes, 10) || 4)), count = th.kind === 'minion' ? n : Math.ceil(n / 2);
    let T; try { T = JSON.parse(localStorage.getItem('runeterra-gm-table-v1')); } catch (e) { T = null; }
    T = T && typeof T === 'object' ? T : {};
    if (!Array.isArray(T.foes)) T.foes = [];
    T.foes.push({ id: uid(), name: th.name.trim() || 'Ameaça', kind: th.kind, dice: Array(count).fill(th.die), sel: 0, out: 0, dmg: '', last: '' });
    try { localStorage.setItem('runeterra-gm-table-v1', JSON.stringify(T)); } catch (e) { return 'Sem espaço neste navegador.'; }
    return `Adicionado à Mesa: ${count} × ${th.die} (${count === 1 ? 'um' : count} ${th.kind === 'minion' ? 'lacaio' : 'tenente'}${count === 1 ? '' : 's'}).`;
  }
  function onClick(ev) {
    const t = ev.target;
    if (t.closest('select, textarea, label, input:not([type=checkbox])')) return;
    const el = t.closest('[data-a]');
    if (!el) return;
    const a = el.dataset.a;
    if (el.classList.contains('is-disabled')) { const f = $('#stage .flow-todo'); if (f) { f.scrollIntoView({ block: 'center', behavior: 'smooth' }); f.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-5px)' }, { transform: 'translateX(5px)' }, { transform: 'translateX(0)' }], { duration: 240 }); } return; }
    const hit = el.dataset.id ? getTw(el.dataset.id) : null, fx = hit && el.dataset.i != null ? hit.tw.fx[+el.dataset.i] : null;
    const th = el.dataset.th ? getTh(el.dataset.th) : null;
    if (a === 'plAdd') { const n = { id: uid(), name: '' }; S.places.push(n); save(); render(); const inp = $(`input[data-pl="${n.id}"]`); if (inp) inp.focus(); return; }
    if (a === 'plDel') {
      const id = el.dataset.id2, x = getPl(id);
      if (x && (!x.name.trim() || confirm(`Remover o local “${x.name.trim()}”?`))) {
        S.places = S.places.filter(y => y.id !== id);
        for (const z of Object.keys(ZN)) for (const sv of ['minor', 'major']) for (const tw of S.tw[z][sv]) for (const f of tw.fx) { if (f.cwhere === id) f.cwhere = ''; if (f.cblocks === id) f.cblocks = ''; }
        save(); render();
      }
      return;
    }
    if (a === 'thAdd') { const n = newTh(); S.threats.push(n); save(); render(); const inp = $(`[data-thcard="${n.id}"] input[data-f="name"]`); if (inp) inp.focus(); return; }
    if (a === 'thDel') {
      if (th && confirm(`Remover a ameaça “${th.name.trim() || 'sem nome'}” da biblioteca? Ela some das reviravoltas que a usam.`)) {
        S.threats = S.threats.filter(x => x.id !== th.id);
        for (const z of Object.keys(ZN)) for (const sv of ['minor', 'major']) for (const tw of S.tw[z][sv]) for (const f of tw.fx) if (f.tid === th.id) f.tid = '';
        save(); render();
      }
      return;
    }
    if (a === 'thKind' && th) { th.kind = el.dataset.val; const k = TK()[th.kind]; if (!k.dice.includes(th.die)) th.die = 'd8'; if (th.abs.length > k.maxAb) th.abs.length = k.maxAb; save(); render(); return; }
    if (a === 'thDie' && th) { th.die = el.dataset.val; save(); render(); return; }
    if (a === 'thAbV' && th) { th.abs[+el.dataset.i].v = +el.dataset.val; save(); render(); return; }
    if (a === 'thAbDel' && th) { th.abs.splice(+el.dataset.i, 1); save(); render(); return; }
    if (a === 'thMesa' && th) { const r = sendToTable(th); const m = $(`[data-mesa="${th.id}"]`); if (m) m.textContent = r; return; }
    if (a === 'fxThreat' && fx) { fx.tid = el.dataset.val; save(); render(); return; }
    if (a === 'fxCdice' && fx) { const d = el.dataset.val; fx.cdice = fx.cdice.includes(d) ? fx.cdice.filter(x => x !== d) : fx.cdice.concat([d]); save(); render(); return; }
    if (a === 'fxCtimer' && fx) { fx.ctimer = el.dataset.val === 'true'; save(); render(); return; }
    if (a === 'fxTm' && fx) { fx.tm = el.dataset.val; save(); render(); return; }
    if (a === 'fxNeed' && fx) { fx.tneed = +el.dataset.val; save(); render(); return; }
    if (a === 'tdie') { S.traits[+el.dataset.i].die = el.dataset.val; save(); render(); return; }
    if (a === 'twAdd') { const { z, s } = el.dataset; S.tw[z][s].push(newTw()); save(); render(); const inp = $(`[data-twcard="${S.tw[z][s][S.tw[z][s].length - 1].id}"] input[data-f="name"]`); if (inp) inp.focus(); return; }
    if (a === 'twDel') { if (hit && confirm(`Remover a reviravolta “${hit.tw.name.trim() || 'sem nome'}”?`)) { S.tw[hit.z][hit.s] = S.tw[hit.z][hit.s].filter(x => x.id !== hit.tw.id); save(); render(); } return; }
    if (a === 'fxAdd') { if (hit && hit.tw.fx.length < 3) { hit.tw.fx.push(newFx()); save(); render(); } return; }
    if (a === 'fxDel') { if (hit && hit.tw.fx.length > 1) { hit.tw.fx.splice(+el.dataset.i, 1); save(); render(); } return; }
    if (a === 'fxCat' && fx) { fx.cat = el.dataset.val; fx.opt = ''; fx.verbs = []; save(); render(); return; }
    if (a === 'fxOpt' && fx) { pickOpt(fx, hit.z, hit.s, el.dataset.val); save(); render(); return; }
    if (a === 'fxVerb' && fx) { fx.verbs[+el.dataset.k] = el.dataset.val; save(); render(); return; }
    if (a === 'fxPers' && fx) { fx.persistIdx = +el.dataset.val; const o = getOpt(fx, hit.z, hit.s); if (o) o.acts.forEach((x, i) => { if (!verbsFor(o, fx, i).includes(fx.verbs[i])) fx.verbs[i] = 'hinder'; }); save(); render(); return; }
    if (a === 'go') return go(+el.dataset.i);
    if (a === 'next') return go(stepIdx(S.step) + 1);
    if (a === 'back') return go(stepIdx(S.step) - 1);
    if (a === 'guide') { ui.guide[S.step] = !(ui.guide[S.step] != null ? ui.guide[S.step] : !S.seen[S.step]); render(); return; }
    if (a === 'clearPortrait') { S.portrait = null; save(); render(); return; }
    if (a === 'print') { window.print(); return; }
    if (a === 'pdf') { exportPdf(); return; }
    if (a === 'export') { exportJson(); return; }
    if (a === 'copy') { if (navigator.clipboard) navigator.clipboard.writeText(sheetText()).catch(() => {}); const old = el.textContent; el.textContent = 'Copiado'; setTimeout(() => { el.textContent = old; }, 1600); return; }
    if (a === 'roster') { showRoster(); return; }
    if (a === 'rosterClose') { hideRoster(); return; }
    if (a === 'rosterNew') { save(); S = blank(); save(); hideRoster(); render({ top: true }); return; }
    if (a === 'rosterOpen') { const c = read(SLOT(el.dataset.id)); if (c) { save(); S = hydrate(c); save(); hideRoster(); render({ top: true }); } return; }
    if (a === 'rosterDup') {
      save();
      const c = el.dataset.id === S.cid ? JSON.parse(JSON.stringify(S)) : read(SLOT(el.dataset.id));
      if (!c) return;
      c.cid = uid(); c.updated = Date.now(); c.name = (c.name || 'Ambiente sem nome') + ' (cópia)';
      try { localStorage.setItem(SLOT(c.cid), JSON.stringify(c)); localStorage.setItem(ROSTER, JSON.stringify(rosterIds().concat([c.cid]))); } catch (e) { alert('Sem espaço neste navegador.'); }
      showRoster(); return;
    }
    if (a === 'rosterDel') {
      if (!confirm('Excluir este ambiente deste navegador? Exporte antes se quiser guardar uma cópia.')) return;
      const id = el.dataset.id;
      try { localStorage.removeItem(SLOT(id)); localStorage.setItem(ROSTER, JSON.stringify(rosterIds().filter(x => x !== id))); } catch (e) { /* ignore */ }
      if (id === S.cid) { S = blank(); save(); render({ top: true }); }
      showRoster(); return;
    }
    if (a === 'reset') { if (confirm('Recomeçar do zero? Isso apaga o ambiente aberto neste navegador.')) { const id = S.cid; try { localStorage.removeItem(SLOT(id)); localStorage.setItem(ROSTER, JSON.stringify(rosterIds().filter(x => x !== id))); } catch (e) { /* ignore */ } S = blank(); save(); render({ top: true }); } return; }
  }
  function wire() {
    document.addEventListener('click', onClick);
    document.addEventListener('keydown', ev => {
      if (ev.key === 'Escape') { const r = $('#roster'); if (r && !r.hidden) hideRoster(); }
      const c = ev.target.closest && ev.target.closest('[data-a][role=radio]:not(button)');
      if (c && ev.target === c && (ev.key === 'Enter' || ev.key === ' ')) { ev.preventDefault(); c.click(); }
    });
    document.addEventListener('input', ev => {
      const el = ev.target;
      const flt = el.closest && el.closest('[data-filter]'); if (flt) return;
      if (el.dataset && el.dataset.tw) {
        const hit = getTw(el.dataset.tw); if (!hit) return;
        if (el.dataset.i != null && el.dataset.i !== '') hit.tw.fx[+el.dataset.i][el.dataset.f] = el.value; else hit.tw[el.dataset.f] = el.value;
        save(); light(el.dataset.tw); return;
      }
      if (el.dataset && el.dataset.pl) { const x = getPl(el.dataset.pl); if (x) { x.name = el.value; save(); light(); } return; }
      if (el.dataset && el.dataset.th) {
        const th = getTh(el.dataset.th); if (!th) return;
        if (el.dataset.ab != null) th.abs[+el.dataset.ab][el.dataset.f] = el.value; else th[el.dataset.f] = el.value;
        save(); light();
        const card = $(`[data-thcard="${th.id}"]`);
        if (card) { const nm = card.querySelector('.ab-top .ab-name'); if (nm) nm.textContent = th.name.trim() || 'Ameaça sem nome'; if (el.dataset.ab != null) { const t = el.closest('.env-ab').querySelector('.ab-text'); if (t) t.textContent = abText(th.abs[+el.dataset.ab]); } }
        return;
      }
      const b = el.dataset && el.dataset.b;
      if (!b || el.tagName === 'SELECT') return;
      setPath(S, b, el.value);
      save(); if (b === 'name' || b.startsWith('traits.')) light();
    });
    document.addEventListener('change', ev => {
      const el = ev.target;
      if (el.dataset && el.dataset.thadd) { const th = getTh(el.dataset.thadd); if (th && el.value && th.abs.length < TK()[th.kind].maxAb) { th.abs.push({ t: el.value, v: 2, x: '' }); save(); render(); } return; }
      if (el.id === 'portrait-file') { loadPortrait(el.files[0]); el.value = ''; return; }
      if (el.id === 'import-file') { const f = el.files[0]; el.value = ''; if (!f) return; const r = new FileReader(); r.onload = () => importJson(String(r.result)); r.readAsText(f); }
    });
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
    const raw = (() => { try { return sessionStorage.getItem(GMKEY); } catch (e) { return null; } })();
    const payload = await window.GM_UNSEAL.openRaw(raw);
    if (!payload) return false;
    window.GM_UNSEAL.run(payload, ['gm-env-data']);
    ED = window.GM_ENVDATA;
    if (ED) S = migrate(S);
    return !!ED;
  }
  (async () => {
    const gate = $('#gate'), app = $('#app');
    if (!(await unlocked())) {
      gate.hidden = false;
      gate.innerHTML = `<div class="sp-empty"><span class="gm-seal" aria-hidden="true">${ico('lock')}</span><h1>Somente para o Mestre</h1>
        <p class="muted">A Oficina de Ambiente fica atrás do Escudo do Mestre. Abra o Escudo, digite a senha e volte por aqui: o botão “Oficina de Ambiente” aparece no cabeçalho quando você está dentro.</p>
        <a class="btn primary" href="gm.html">${ico('lock')} Abrir o Escudo do Mestre</a></div>`;
      return;
    }
    app.hidden = false;
    wire();
    S.step = STEPS[Math.min(stepIdx(S.step) < 0 ? 0 : stepIdx(S.step), reach())].id;
    render({ top: true });
    save();
  })();
})();
