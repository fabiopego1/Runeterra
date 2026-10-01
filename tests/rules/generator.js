/* Champion generator for the rules test. Runs in the page next to the book referee (referee.js).
   build(): a random champion for a given Origin / Source / Path / Temperament that the referee accepts, made chapter by
   chapter (each chapter is re-rolled until the referee has nothing against it).
   mutate(): the same champion with one choice changed at random (often into something the book forbids).
   compare(): the book referee's verdict and values against the Forge's own (window.ForgeDebug.check). */
(function () {
  'use strict';
  const W = window;
  const STEPS = ['background', 'powersource', 'archetype', 'personality', 'red', 'health'];
  const clone = x => JSON.parse(JSON.stringify(x));
  const DN = d => +String(d).replace('d', '');
  function rng(seed) {
    let s = (seed * 2654435761 >>> 0) || 1;
    return () => { s ^= s << 13; s >>>= 0; s ^= s >> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; };
  }

  function tools(R) {
    const CAT = W.TRAIT_CATEGORIES;
    const byKey = {};
    for (const [c, def] of Object.entries(CAT)) for (const it of def.items) byKey[it[0]] = { cat: c, kind: def.kind };
    const ALL = Object.keys(byKey);
    const expand = opts => [...new Set((opts || []).flatMap(o => o === 'P:*' ? ALL.filter(k => byKey[k].kind === 'power') : o === 'Q:*' ? ALL.filter(k => byKey[k].kind === 'quality') : o.includes(':') ? (CAT[o] ? CAT[o].items.map(i => i[0]) : []) : [o]))];
    const pick = a => a.length ? a[Math.floor(R() * a.length)] : null;
    const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(R() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
    const kind = k => (k === 'rp-quality' ? 'quality' : byKey[k] && byKey[k].kind), cat = k => byKey[k] && byKey[k].cat;
    const ELS = CAT['P:elemental'].items;
    return { byKey, ALL, expand, pick, shuffle, kind, cat, ELS };
  }

  // Fill in what a chosen ability uses, at random among the traits that could fit.
  function fill(t, e, owned, opts = {}) {
    const { pick, kind, cat, ELS } = t;
    const text = (W.ABILITIES[e.name] || {}).text || '';
    const has = w => text.includes('[' + w + ']');
    let cands = null, cands2 = null;
    const k = x => owned.filter(y => kind(y) === x);
    if (has('Signature Vehicle')) cands = ['sig-vehicle'];
    else if (has('Signature Weaponry')) cands = ['sig-weapon'];
    else if (has('Self Control power')) cands = owned.filter(y => cat(y) === 'P:selfcontrol');
    else if (has('Psychic power')) cands = owned.filter(y => cat(y) === 'P:psychic');
    else if (has('Mental quality')) cands = owned.filter(y => cat(y) === 'Q:mental');
    else if (has('a power gained from your archetype')) cands = (opts.path || []).filter(y => kind(y) === 'power');
    else if (has('a quality gained from your archetype')) cands = (opts.path || []).filter(y => kind(y) === 'quality');
    else if (has('power/quality')) cands = owned.slice();
    else if (has('power') && has('quality')) { cands = k('power'); cands2 = k('quality'); }
    else if (has('power')) cands = k('power');
    else if (has('quality')) cands = k('quality');
    if (opts.cat && cands) {
      const ck = W.TRAIT_CATEGORIES[opts.cat].kind;
      if (cands2 && ck === 'quality') cands2 = cands2.filter(y => cat(y) === opts.cat);
      else cands = cands.filter(y => cat(y) === opts.cat);
    }
    if (opts.use && cands) cands = cands.filter(y => opts.use.includes(y));
    if (opts.prefer && cands && R01(opts) < 0.7) { const p = cands.filter(y => opts.prefer.includes(y)); if (p.length) cands = p; }
    if (cands) e.trait = pick(cands.filter(y => owned.includes(y) || opts.loose));
    if (cands2) e.trait2 = pick(cands2);
    e.ch = {};
    text.replace(/\[([^\]]+)\]/g, (m, b) => {
      if (b === 'Boost or Hinder') e.ch[b] = pick(['Boost', 'Hinder']);
      else if (b === 'physical or energy') e.ch[b] = pick(['physical', 'energy']);
      else if (/you have a related power for/.test(b)) { const mine = ELS.filter(i => owned.includes(i[0])); e.ch[b] = (pick(mine.length ? mine : ELS) || [])[2]; }
      else if (/^(energy\/element|element\/energy|elemental\/energy)$/.test(b)) e.ch[b] = pick(ELS)[2];
      else if (b === 'choose two basic actions') e.ch[b] = 'Attack and Overcome';
      return m;
    });
    return e;
  }
  const R01 = o => o.R();

  function blankState(c) {
    return {
      v: 1, noRetcon: true, step: 'finish', maxStep: 9, method: 'constructed', people: 'human', region: 'demacia', unlocked: {}, rolls: {}, rerolls: {},
      bg: { id: c.bg, assign: {}, principle: null },
      ps: { id: c.ps, assign: {}, extra: {} },
      arch: { id: c.arch, base: c.base || null, assign: {}, principle: null, extra: {}, divMethod: null, minionQ: null, minionForms: [], notes: '' },
      pers: { id: c.pers, qname: 'Campeão', qdesc: 'Um herói de verdade.', qok: true, outTrait: null, upgrade: null, id2: null },
      health: { trait: null, mode: 'fixed', roll: null, rerolled: false },
      pch: {}, sel: {}, info: {}, play: {}, renames: {}, traitNames: {}, evo: { traits: {}, principles: {}, abilities: {}, log: [] }, tour: { on: false, seen: {} }
    };
  }

  const vio = (s, step, only) => W.BookReferee(s).violations.filter(v => v.step === step && (!only || only(v)));

  // Re-roll one part of the champion until the referee accepts it.
  function settle(s, step, roll, only, tries = 400) {
    let last = null;
    for (let i = 0; i < tries; i++) {
      const c = clone(s);
      roll(c, i);
      last = vio(c, step, only);
      if (!last.length) return { s: c };
      if (i === tries - 1) return { s: c, fail: last };
    }
    return { s, fail: last };
  }

  function build(c, seed) {
    const R = rng(seed), t = tools(R);
    const { expand, pick, shuffle, kind, cat } = t;
    const find = (l, id) => l.find(x => x.id === id);
    const bg = find(W.BACKGROUNDS, c.bg), ps = find(W.POWER_SOURCES, c.ps), ar = find(W.ARCHETYPES, c.arch);
    const shape = ar.divided || ar.modular ? find(W.ARCHETYPES, c.base) : ar;
    const pe = find(W.PERSONALITIES, c.pers);
    const fo = { R };
    let s = blankState(c);
    const owned = x => Object.keys(W.BookReferee(x).T);
    const stage = (step, roll, only, tries) => { const r = settle(s, step, roll, only, tries); s = r.s; if (r.fail) throw Object.assign(new Error('nogen ' + step), { violations: r.fail, state: s }); };
    const principleOf = (category, avoid) => pick(W.PRINCIPLES.filter(p => p.cat === category && p.id !== avoid)).id;

    // Origin: its quality dice and a principle
    stage('background', x => {
      const opts = shuffle(expand(bg.q.opts).filter(k => kind(k) === 'quality'));
      if (bg.q.mustInclude) { opts.splice(opts.indexOf(bg.q.mustInclude), 1); opts.splice(Math.floor(R() * bg.q.dice.length), 0, bg.q.mustInclude); }
      bg.q.dice.forEach((d, i) => { x.bg.assign['b' + i] = opts[i]; });
      x.bg.principle = principleOf(bg.principle);
      if (x.bg.principle === 'energy-element') x.pch.bg = pick(t.ELS)[2];
    });
    // Source: power dice, its bonus, its abilities
    stage('powersource', x => {
      const have = owned(x);
      const opts = shuffle(expand(ps.opts).filter(k => kind(k) === 'power' && !have.includes(k)));
      if (ps.required) { const i = opts.indexOf(ps.required.key); if (i >= 0) opts.splice(i, 1); opts.splice(Math.floor(R() * bg.psDice.length), 0, ps.required.key); }
      bg.psDice.forEach((d, i) => { x.ps.assign['p' + i] = opts[i]; });
    }, v => v.rule === 'dice');
    stage('powersource', x => {
      const ex = ps.extra; if (!ex) return;
      const T = W.BookReferee(Object.assign(clone(x), { ps: Object.assign(clone(x.ps), { extra: {} }) })).T;
      if (ex.type === 'addTrait') x.ps.extra.key = pick(expand(ex.opts).filter(k => !(ex.notInOpts && expand(ps.opts).includes(k)) && !(T[k] && DN(T[k]) >= DN(ex.die))));
      if (ex.type === 'alien') {
        const d6p = Object.keys(T).some(k => T[k] === 'd6' && kind(k) === 'power');
        x.ps.extra.key = d6p ? pick(Object.keys(T).filter(k => T[k] === 'd6')) : pick(expand(ps.opts).filter(k => kind(k) === 'power' && !T[k]));
      }
      if (ex.type === 'cosmos') {
        const pw = Object.keys(T).filter(k => kind(k) === 'power');
        x.ps.extra.down = pick(pw.filter(k => DN(T[k]) >= 8));
        x.ps.extra.up = pick(pw.filter(k => DN(T[k]) <= 10 && k !== x.ps.extra.down));
      }
    }, v => v.rule === 'extra');
    stage('powersource', x => {
      const have = owned(x);
      x.sel['ps-yellow'] = shuffle(ps.yellow.list).slice(0, ps.yellow.count).map(name => fill(t, { name }, have, fo));
      if (ps.green) x.sel['ps-green'] = shuffle(ps.green.list).slice(0, ps.green.count).map(name => fill(t, { name }, have, fo));
    });
    // Path: dice (with the required die, swaps, Training, Robot, Modular extras), then abilities, then the principle
    const pw = expand(shape.powers), ql = expand(shape.quals), rq = shape.req ? expand(shape.req.any) : [];
    stage('archetype', x => {
      const T = W.BookReferee(x).T, used = new Set(Object.keys(T));
      const free = l => l.filter(k => !used.has(k));
      const take = k => { used.add(k); return k; };
      ps.archDice.forEach((d, i) => {
        const had = rq.filter(k => T[k] && DN(d) > DN(T[k]));
        if (had.length && R() < 0.35 && !Object.keys(x.arch.assign).some(a => /^fa/.test(a))) {   // "I've Already Got That": swap
          x.arch.assign['a' + i] = pick(had);
          x.arch.assign['fa' + i] = take(pick(free(R() < 0.5 ? pw : ql)));
          return;
        }
        const r = R();
        const list = i === 0 && rq.length && R() < 0.7 ? rq : r < 0.5 ? pw : ql;
        x.arch.assign['a' + i] = take(pick(free(list)) || pick(free(pw.concat(ql))));
      });
      if (ps.id === 'training') x.arch.assign.t0 = take(pick(free(ql).filter(k => kind(k) === 'quality')));
      if (shape.extra && shape.extra.type === 'addTrait') x.arch.extra.key = take(pick(free(expand(shape.extra.opts))));
      if (ar.modular) {
        const n = [...used].filter(k => kind(k) === 'power').length;
        for (let i = 0; i < Math.max(0, 4 - n); i++) x.arch.extra['m' + i] = take(pick(free(t.ALL.filter(k => kind(k) === 'power'))));
      }
    }, v => v.rule === 'dice', 3000);
    const pathGained = x => { const r = W.BookReferee(x); const before = W.BookReferee(Object.assign(clone(x), { arch: Object.assign(clone(x.arch), { id: null }) })).T; return Object.keys(r.T).filter(k => !before[k] || r.T[k] !== before[k]); };
    stage('archetype', x => {
      const have = owned(x);
      const path = pathGained(x);
      const list = expand((shape.req ? shape.req.any : []).concat(shape.powers || [], shape.quals || []));
      for (const k of Object.keys(x.sel)) if (k.startsWith('arch-')) delete x.sel[k];
      if (!ar.modular) {
        if (shape.fixedGreen) x.sel['arch-fixed'] = shape.fixedGreen.map(name => fill(t, { name }, have, fo));
        const g = shape.green;
        const ropt = Object.assign({}, fo, g.rules && g.rules.fromList ? { prefer: list } : g.rules && g.rules.needs ? { prefer: expand([].concat(...g.rules.needs.map(n => n.any || []))) } : {});
        x.sel['arch-green'] = (g.fixed ? g.list : shuffle(g.list).slice(0, g.count)).map(name => fill(t, { name }, have, ropt));
        if (shape.yellow) {
          const y = shape.yellow;
          const yl = (y.fromGreen ? g.list : y.list).filter(n => !(y.fromGreen && x.sel['arch-green'].some(e => e.name === n) && R() < 0.5));
          x.sel['arch-yellow'] = shuffle(yl).slice(0, y.count).map(name => fill(t, { name }, have, fo));
        }
        if (shape.forms) {
          const fg = shuffle(shape.forms.green).slice(0, 2);
          x.sel['arch-formgreen'] = fg.map(name => fill(t, { name }, have, fo));
          x.sel['arch-formyellow'] = [fill(t, { name: pick(shape.forms.yellow.concat(shape.forms.green.filter(n => !fg.includes(n)))) }, have, fo)];
        }
        if (shape.fixedRed) x.sel['arch-fixedred'] = shape.fixedRed.map(name => ({ name, ch: {} }));
        if (shape.minionForms) {
          x.arch.minionQ = pick(have.filter(k => kind(k) === 'quality'));
          const T = W.BookReferee(x).T;
          x.arch.minionForms = shuffle(W.MINION_FORMS.map(m => m[0])).slice(0, DN(T[x.arch.minionQ]));
        }
      }
      if (ar.divided) {
        const m = pick(W.DIVIDED.methods);
        x.arch.divMethod = m.id;
        x.sel['arch-divmethod'] = (m.green || [pick(m.choose)]).map(name => fill(t, { name }, have, Object.assign({ path }, fo)));
        const after = pick(W.DIVIDED.after);
        x.sel['arch-divafter'] = [{ name: after, ch: {} }];
        if (after === 'Split Form') {
          x.arch.split = {};
          for (const kd of ['power', 'quality']) shuffle(have.filter(k => kind(k) === kd)).forEach((k, i) => { x.arch.split[k] = i < 2 ? 'both' : pick(['civ', 'her']); });
        }
      }
      if (ar.modular) {
        const M = W.MODULAR;
        x.sel['arch-modfixg'] = [fill(t, { name: 'Switch' }, have, fo)];
        x.sel['arch-modfixy'] = [{ name: 'Quick Switch', ch: {} }];
        x.sel['arch-modfixr'] = [{ name: 'Emergency Switch', ch: {} }];
        x.sel['arch-modgreen'] = [fill(t, { name: pick(M.green).name }, have, fo)];
        x.sel['arch-modyellow'] = shuffle(M.yellow).slice(0, 2).map(m => fill(t, { name: m.name }, have, fo));
        x.sel['arch-modred'] = [fill(t, { name: pick(M.red).name }, have, fo)];
        if (R() < 0.5) { const p = shuffle(have.filter(k => kind(k) === 'power')); x.arch.powerless = { on: true, a: p[0], b: p[1] }; }
      }
      const pc = ar.divided ? 'Responsibility' : ar.modular ? shape.principle : ar.principle;
      x.arch.principle = principleOf(pc, x.bg.principle);
      if (x.arch.principle === 'energy-element') x.pch.arch = pick(t.ELS)[2];
    }, null, 3000);
    // Temperament
    stage('personality', x => {
      const T = W.BookReferee(x).T, have = Object.keys(T);
      const want = /\[power\]/.test(pe.out) ? 'power' : /\[quality\]/.test(pe.out) ? 'quality' : null;
      if (want) x.pers.outTrait = pick(have.filter(k => kind(k) === want).concat(want === 'quality' && R() < 0.1 ? ['rp-quality'] : []));
      if (pe.extra === 'impulsive') x.pers.upgrade = pick(have.filter(k => DN(T[k]) < 12 && k !== 'rp-quality'));
      if (ar.divided && R() < 0.5) x.pers.id2 = pick(W.PERSONALITIES.filter(p => p.id !== pe.id)).id;
    });
    // Ultimates
    stage('red', x => {
      const T = W.BookReferee(x).T, have = Object.keys(T);
      const cats = W.RED_ABILITIES.filter(c => have.some(k => cat(k) === c.cat && DN(T[k]) >= 6)).map(c => ({ cat: c.cat, list: c.list }));
      if (shape.extraRed && !ar.modular) cats.push({ cat: 'X:' + shape.id, list: shape.extraRed.map(a => ({ a })) });
      x.sel.red = [];
      for (let i = 0; i < 2; i++) {
        const c = pick(cats), a = pick(c.list.filter(y => !y.use || y.use.some(k => T[k])));
        if (!a) continue;
        x.sel.red.push(fill(t, { name: a.a, cat: c.cat, use: a.use || null }, have, Object.assign({ cat: c.cat.startsWith('X:') ? null : c.cat, use: a.use }, fo)));
      }
    });
    // Health
    stage('health', x => {
      const have = Object.keys(W.BookReferee(x).T);
      const elig = have.filter(k => cat(k) === 'P:athletic' || cat(k) === 'Q:mental' || (shape.healthAlt || []).includes(cat(k)) || pe.healthAny);
      x.health.trait = R() < 0.5 ? null : pick(elig);
      if (R() < 0.5) { x.health.mode = 'roll'; x.health.roll = 1 + Math.floor(R() * 8); }
    });
    return s;
  }

  // One random change to a legal champion.
  function mutate(s0, seed) {
    const R = rng(seed), t = tools(R);
    const { pick, ALL, ELS } = t;
    const s = clone(s0);
    const T = W.BookReferee(s).T, have = Object.keys(T);
    const anyTrait = () => pick(R() < 0.5 ? have : ALL);
    const groups = Object.keys(s.sel).filter(k => Array.isArray(s.sel[k]) && s.sel[k].length);
    const M = [
      ['bg dice', () => { const k = pick(Object.keys(s.bg.assign)); s.bg.assign[k] = R() < 0.2 ? null : anyTrait(); }],
      ['bg principle', () => { s.bg.principle = pick(W.PRINCIPLES).id; if (s.bg.principle === 'energy-element' && R() < 0.5) s.pch.bg = pick(ELS)[2]; }],
      ['ps dice', () => { const k = pick(Object.keys(s.ps.assign)); s.ps.assign[k] = R() < 0.2 ? null : anyTrait(); }],
      ['ps extra', () => { const e = s.ps.extra; if (e.down || e.up) { e[pick(['down', 'up'])] = anyTrait(); } else e.key = R() < 0.15 ? null : anyTrait(); }],
      ['arch dice', () => { const k = pick(Object.keys(s.arch.assign)); s.arch.assign[k] = R() < 0.15 ? null : anyTrait(); }],
      ['arch swap', () => { const k = pick(Object.keys(s.arch.assign).filter(a => /^a\d/.test(a))); const rq = (W.ARCHETYPES.find(a => a.id === (s.arch.base || s.arch.id)).req || { any: [] }); s.arch.assign[k] = pick(t.expand(rq.any).concat(have)); if (R() < 0.5) s.arch.assign['f' + k] = anyTrait(); }],
      ['arch extra', () => { const k = pick(Object.keys(s.arch.extra).concat(['key'])); s.arch.extra[k] = R() < 0.2 ? null : anyTrait(); }],
      ['ability trait', () => { const g = pick(groups); if (!g) return; const e = pick(s.sel[g]); const r = R(); if (r < 0.15) delete e.trait; else if (r < 0.3) e.trait2 = anyTrait(); else e.trait = anyTrait(); }],
      ['ability choice', () => { const g = pick(groups); if (!g) return; const e = pick(s.sel[g]); const ks = Object.keys(e.ch || {}); if (!ks.length) { e.trait = anyTrait(); return; } const k = pick(ks); e.ch[k] = R() < 0.2 ? '' : R() < 0.6 ? pick(ELS)[2] : pick(['Boost', 'Hinder', 'physical', 'energy', 'banana']); }],
      ['ability pick', () => {
        const g = pick(groups); if (!g) return; const L = s.sel[g]; const r = R();
        if (r < 0.3) L.splice(Math.floor(R() * L.length), 1);
        else if (r < 0.55) L.push(clone(pick(L)));
        else { const names = Object.keys(W.ABILITIES); L[Math.floor(R() * L.length)] = Object.assign(clone(pick(L)), { name: pick(names) }); }
      }],
      ['minions', () => { if (s.arch.minionQ) { if (R() < 0.5) s.arch.minionQ = anyTrait(); else if (R() < 0.5) s.arch.minionForms.pop(); else s.arch.minionForms.push(pick(W.MINION_FORMS)[0]); } else s.arch.minionQ = anyTrait(); }],
      ['divided', () => { if (R() < 0.4) s.arch.divMethod = pick(W.DIVIDED.methods.map(m => m.id).concat([null])); else { s.arch.split = s.arch.split || {}; s.arch.split[pick(have)] = pick(['both', 'civ', 'her', null]); } }],
      ['powerless', () => { s.arch.powerless = { on: true, a: anyTrait(), b: R() < 0.3 ? null : anyTrait() }; }],
      ['arch principle', () => { s.arch.principle = R() < 0.4 ? s.bg.principle : pick(W.PRINCIPLES).id; if (s.arch.principle === 'energy-element' && R() < 0.5) s.pch.arch = pick(ELS)[2]; }],
      ['element principle', () => { const sl = pick(['bg', 'arch']); if (sl === 'bg') s.bg.principle = 'energy-element'; else s.arch.principle = 'energy-element'; s.pch[sl] = R() < 0.5 ? null : pick(ELS)[2]; }],
      ['out', () => { s.pers.outTrait = R() < 0.2 ? null : anyTrait(); }],
      ['reckless', () => { s.pers.upgrade = R() < 0.2 ? null : anyTrait(); }],
      ['pers2', () => { s.pers.id2 = R() < 0.3 ? s.pers.id : pick(W.PERSONALITIES).id; }],
      ['qname', () => { const r = R(); if (r < 0.34) s.pers.qname = '  '; else if (r < 0.67) s.pers.qdesc = ''; else s.pers.qok = false; }],
      ['red pick', () => {
        const L = s.sel.red = s.sel.red || []; const r = R();
        const c = pick(W.RED_ABILITIES), a = pick(c.list);
        if (r < 0.25) L.pop();
        else if (r < 0.45) L.push(clone(pick(L) || { name: a.a, cat: c.cat, ch: {} }));
        else if (L.length) L[Math.floor(R() * L.length)] = fill(t, { name: a.a, cat: c.cat, use: a.use || null }, have, { R, cat: c.cat, use: a.use, loose: R() < 0.5 });
      }],
      ['red trait', () => { const e = pick(s.sel.red || []); if (!e) return; if (R() < 0.3) e.trait2 = anyTrait(); else e.trait = R() < 0.1 ? null : anyTrait(); }],
      ['red extra', () => { const L = s.sel.red = s.sel.red || []; const e = { name: pick(['Construction Focus', 'Swarm Combat', 'Sacrifice']), cat: 'X:' + pick(['minion-maker', 'robot']), ch: {} }; fill(t, e, have, { R }); L[Math.floor(R() * Math.max(1, L.length))] = e; }],
      ['health', () => { if (R() < 0.6) s.health.trait = anyTrait(); else { s.health.mode = 'roll'; s.health.roll = pick([0, 9, 12]); } }]
    ];
    const [label, fn] = pick(M);
    fn();
    return { label, s };
  }

  // The referee's verdict and values against the Forge's.
  function compare(s, legal) {
    const B = W.BookReferee(s), F = W.ForgeDebug.check(s);
    const d = [];
    // Chapter by chapter up to the first one the book rejects: once a chapter is wrong, later ones are built on
    // dice that are already wrong, and the two may fairly disagree about what comes after.
    for (const step of STEPS) {
      const b = B.violations.filter(v => v.step === step), f = F.issues[step] || [];
      if (!!b.length !== !!f.length) d.push({ step, rules: [...new Set(b.map(v => v.rule))], book: b.map(v => v.msg), forge: f });
      if (b.length) break;
    }
    if (legal) {
      for (const k of new Set(Object.keys(B.T).concat(Object.keys(F.T)))) if (B.T[k] !== F.T[k]) d.push({ step: 'values', book: [`${k} ${B.T[k] || '-'}`], forge: [`${k} ${F.T[k] || '-'}`] });
      if (JSON.stringify(B.status) !== JSON.stringify(F.status)) d.push({ step: 'values', book: ['status ' + B.status], forge: ['status ' + F.status] });
      if (JSON.stringify(B.status2) !== JSON.stringify(F.status2)) d.push({ step: 'values', book: ['status2 ' + B.status2], forge: ['status2 ' + F.status2] });
      if (B.health !== F.health) d.push({ step: 'values', book: ['health ' + B.health], forge: ['health ' + F.health] });
    }
    return { diffs: d, bookSteps: STEPS.filter(x => B.violations.some(v => v.step === x)) };
  }

  // Every Source x Path pair (normal Paths, and each base Path under Divided and under Modular), Origins and
  // Temperaments cycled so each of them meets every Source and Path.
  function combos() {
    const P = W.POWER_SOURCES.map(x => x.id), B = W.BACKGROUNDS.map(x => x.id), E = W.PERSONALITIES.map(x => x.id);
    const normal = W.ARCHETYPES.filter(a => !a.divided && !a.modular).map(a => a.id);
    const variants = normal.map(id => ({ arch: id })).concat(normal.map(id => ({ arch: 'divided', base: id })), normal.map(id => ({ arch: 'modular', base: id })));
    const out = [];
    variants.forEach((v, ai) => P.forEach((ps, pi) => out.push(Object.assign({ ps, bg: B[(ai + pi * 7) % B.length], pers: E[(ai * 3 + pi) % E.length] }, v))));
    return out;
  }

  W.RulesFuzz = { build, mutate, compare, combos, rng };
})();
