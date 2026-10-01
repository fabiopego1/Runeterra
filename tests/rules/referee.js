/* Book referee: an independent reading of hero creation in the Sentinels Comics RPG Core Rulebook (pp.49-113).
   It rebuilds a champion from a saved Forge state using only the data tables (which were audited against the
   book separately) and its own copy of the book's wording, never the Forge's own rule code, and returns every
   rule the champion breaks, tagged with the Forge chapter the rule belongs to.
   Runs in the page (it reads window.BACKGROUNDS etc.): window.BookReferee(state) -> { violations, T, status, status2, health } */
(function () {
  'use strict';
  const W = window;
  const DN = d => +String(d).replace('d', '');
  const UP = (d, n = 1) => 'd' + Math.max(4, Math.min(12, DN(d) + 2 * n));

  // How each Path's Green and Yellow abilities are chosen, written out from the book's own lines (pp.74-94).
  //   n: how many; diff: each uses a different trait; kind: every one uses a power (or quality);
  //   fromList: the trait comes from the Path's own list; cat: every one uses a trait of that category;
  //   needs: at least one uses each of these (a list of traits, or a kind); minPowers: at least that many different powers;
  //   fromGreen: the Yellow is one of the Green list; notGreen: it uses a trait none of the Greens uses;
  //   assoc: (Psychic) only abilities whose named power you have.
  const PATHS = {
    speedster: { green: { n: 2, diff: true, fromList: true }, yellow: { n: 1 } },                           // p.75
    shadow: { green: { n: 2, diff: true, fromList: true }, yellow: { n: 1 } },                              // p.76
    powerhouse: { green: { n: 2, diff: true, fromList: true }, yellow: { n: 1, fromGreen: true, notGreen: true } },   // p.78
    marksman: { green: { n: 2, needs: [['sig-weapon'], 'quality'] }, yellow: { n: 2, diff: true, kind: 'quality' } },  // p.79
    blaster: { green: { n: 2, diff: true, fromList: true, kind: 'power' }, yellow: { n: 2, diff: true, kind: 'power' } }, // p.80
    cqc: { green: { n: 3, needs: [['close-combat'], 'power'] }, yellow: { n: 1, fromGreen: true, notGreen: true } },     // p.81
    armored: { fixed: ['Armored'], green: { n: 3, minPowers: 2 } },                                          // p.82
    flyer: { green: { n: 2, needs: [['flight', 'sig-vehicle']] }, yellow: { n: 1, fromGreen: true } },      // p.83
    elemental: { green: { n: 2, cat: 'P:elemental' }, yellow: { n: 1, cat: 'P:elemental' } },               // p.84
    robot: { green: { n: 2, diff: true, kind: 'power' }, yellow: { n: 1, fromGreen: true } },               // p.85
    sorcerer: { green: { n: 2, diff: true, kind: 'power' }, yellow: { n: 1 } },                              // p.86
    psychic: { green: { n: 2 }, yellow: { n: 2, assoc: true } },                                             // p.87
    transporter: { green: { n: 2, diff: true, kind: 'power' }, yellow: { n: 1, fromGreen: true } },         // p.88
    'minion-maker': { green: { n: 2, all: true, diff: true, kind: 'power' }, yellow: { n: 1 } },             // p.89
    'wild-card': { green: { n: 2, diff: true, kind: 'power' }, yellow: { n: 1 } },                           // p.90
    'form-changer': { fixed: ['Change Forms'], green: { n: 1 } },                                            // p.91
    gadgeteer: { green: { n: 2, diff: true, kind: 'power' }, yellow: { n: 1 } },                             // p.92
    'reality-shaper': { green: { n: 2, diff: true, kind: 'power' }, yellow: { n: 1 } }                       // p.93
  };
  // The required die of each Path (pp.75-93): which traits, how many you must end with, and what the other dice may do.
  //   one: exactly one of the remaining dice goes to a power; some: one or more; any: any number (even none).
  const REM = { speedster: 'some', shadow: 'any', powerhouse: 'one', marksman: 'some', blaster: 'one', cqc: 'some', armored: 'some', flyer: 'some',
    elemental: 'one', robot: 'some', sorcerer: 'some', psychic: 'any', transporter: 'some', 'minion-maker': 'some', 'wild-card': 'some',
    'form-changer': 'some', gadgeteer: 'some', 'reality-shaper': 'some' };
  // Principle category of each Path (p.80 table; Divided p.95 uses Responsibility, Modular p.96 its base Path's).
  const PATH_PRINCIPLE = { speedster: 'Expertise', shadow: 'Expertise', powerhouse: 'Expertise', marksman: 'Responsibility', blaster: 'Esoteric',
    cqc: 'Responsibility', armored: 'Expertise', flyer: 'Ideals', elemental: 'Esoteric', robot: 'Expertise', sorcerer: 'Esoteric', psychic: 'Esoteric',
    transporter: 'Expertise', 'minion-maker': 'Expertise', 'wild-card': 'Ideals', 'form-changer': 'Esoteric', gadgeteer: 'Identity', 'reality-shaper': 'Expertise',
    divided: 'Responsibility' };
  // Power Sources whose Yellow abilities must each use a different power (every one except Nature, pp.57-72).
  const PS_YELLOW_ANY = ['nature'];
  // Abilities named after a power you must have to take them (Psychic Yellow list, p.87).
  const NAMED_POWER = [['Remote Viewing', 'remote-viewing'], ['Illusions', 'illusions'], ['Suggestion', 'suggestion'], ['Postcognition', 'postcognition'],
    ['Precognition', 'precognition'], ['Animal Control', 'animal-control'], ['Telekinesis', 'telekinesis'], ['Telepathy', 'telepathy'], ['Power Suit', 'power-suit'], ['Vitality', 'vitality']];

  W.BookReferee = function referee(st) {
    const CAT = W.TRAIT_CATEGORIES;
    const byKey = {};
    for (const [c, def] of Object.entries(CAT)) for (const it of def.items) byKey[it[0]] = { cat: c, kind: def.kind };
    byKey['rp-quality'] = { cat: null, kind: 'quality' };   // the Signature Quality (p.100) is a quality of no category
    const kind = k => byKey[k] && byKey[k].kind, cat = k => byKey[k] && byKey[k].cat;
    const expand = opts => [...new Set((opts || []).flatMap(o => o === 'P:*' ? Object.keys(byKey).filter(k => k !== 'rp-quality' && kind(k) === 'power')
      : o === 'Q:*' ? Object.keys(byKey).filter(k => k !== 'rp-quality' && kind(k) === 'quality') : o.includes(':') ? (CAT[o] ? CAT[o].items.map(i => i[0]) : []) : [o]))];
    const ELEMENTS = CAT['P:elemental'].items;
    const elementKey = v => { const i = ELEMENTS.find(x => v && (v === x[0] || v === x[1] || v === x[2])); return i ? i[0] : null; };
    const V = [];
    const bad = (step, rule, msg) => V.push({ step, rule, msg });
    const find = (list, id) => (list || []).find(x => x.id === id);
    const T = {};                 // trait -> die
    const gainedIn = {};          // trait -> chapter where it was first gained
    const fromPath = new Set();   // traits whose die came from the Path chapter (new ones, or the required one swapped)
    const sel = st.sel || {};
    const out = { violations: V, T, status: null, status2: null, health: null };
    const give = (step, k, d, rule) => {
      if (!byKey[k]) return bad(step, rule, `unknown trait ${k}`);
      if (T[k]) return bad(step, rule, `${k} taken again (already ${T[k]})`);
      T[k] = d; gainedIn[k] = step;
      if (step === 'archetype') fromPath.add(k);
    };
    const slotsOf = (assign, prefix, n) => Array.from({ length: n }, (_, i) => (assign || {})[prefix + i] || null);

    // One chosen ability: its bracketed words say what it uses (p.46).
    // pool: traits you have when you take it; ctx.use: the book names the trait; ctx.cat: an Ultimate's category.
    const abilityCheck = (step, rule, e, pool, ctx = {}) => {
      const A = W.ABILITIES[e.name];
      if (!A) return bad(step, rule, `unknown ability ${e.name}`);
      const t = A.text || '';
      const has = w => t.includes('[' + w + ']');
      const owns = k => k && pool.includes(k);
      let need = null, need2 = null;      // { kind, only, cat }
      if (has('Signature Vehicle')) need = { kind: 'power', only: ['sig-vehicle'] };
      else if (has('Signature Weaponry')) need = { kind: 'power', only: ['sig-weapon'] };
      else if (has('Self Control power')) need = { kind: 'power', cat: 'P:selfcontrol' };
      else if (has('Psychic power')) need = { kind: 'power', cat: 'P:psychic' };
      else if (has('Mental quality')) need = { kind: 'quality', cat: 'Q:mental' };
      else if (has('a power gained from your archetype')) need = { kind: 'power', path: true };
      else if (has('a quality gained from your archetype')) need = { kind: 'quality', path: true };
      else if (has('power/quality')) need = { kind: 'any' };
      else if (has('power') && has('quality')) { need = { kind: 'power' }; need2 = { kind: 'quality' }; }
      else if (has('power')) need = { kind: 'power' };
      else if (has('quality')) need = { kind: 'quality' };
      if (!need) {
        const named = NAMED_POWER.find(([w]) => new RegExp('\\b' + w + '\\b').test(t));
        if (named && !owns(named[1])) bad(step, rule, `${e.name} needs ${named[1]}, which you don't have`);
      }
      if (ctx.use && !ctx.use.some(owns)) bad(step, rule, `${e.name} needs ${ctx.use.join('/')}, which you don't have`);
      const check = (n, k, label) => {
        if (!k) return bad(step, rule, `${e.name}: no ${label} chosen`);
        if (!owns(k)) return bad(step, rule, `${e.name} uses ${k}, which you don't have${pool.length !== Object.keys(T).length ? ' at this step' : ''}`);
        if (n.kind !== 'any' && kind(k) !== n.kind) bad(step, rule, `${e.name} needs a ${n.kind}, uses ${k}`);
        if (n.only && !n.only.includes(k)) bad(step, rule, `${e.name} must use ${n.only.join('/')}`);
        if (n.cat && cat(k) !== n.cat) bad(step, rule, `${e.name} needs a ${n.cat} trait, uses ${k}`);
        if (n.path && !fromPath.has(k)) bad(step, rule, `${e.name} must use a trait gained from your Path, uses ${k}`);
        if (ctx.use && !ctx.use.includes(k)) bad(step, rule, `${e.name} must use ${ctx.use.join('/')}`);
      };
      // an Ultimate's category applies to the trait of that category's kind
      const catKind = ctx.cat ? CAT[ctx.cat].kind : null;
      if (need) check(ctx.cat && (!need2 || catKind === need.kind) ? Object.assign({}, need, { cat: ctx.cat, kind: need.kind === 'any' ? catKind : need.kind }) : need, e.trait, 'trait');
      if (need2) check(ctx.cat && catKind === need2.kind ? Object.assign({}, need2, { cat: ctx.cat }) : need2, e.trait2, 'quality');
      // choices made when the ability is taken
      const ch = e.ch || {};
      t.replace(/\[([^\]]+)\]/g, (m, b) => {
        const v = ch[b];
        if (b === 'Boost or Hinder' && !['Boost', 'Hinder'].includes(v)) bad(step, rule, `${e.name}: choose Boost or Hinder`);
        if (b === 'physical or energy' && !['physical', 'energy'].includes(v)) bad(step, rule, `${e.name}: choose physical or energy`);
        if (/^(energy\/element|element\/energy|elemental\/energy)$/.test(b) && !elementKey(v)) bad(step, rule, `${e.name}: choose an element`);
        if (/you have a related power for/.test(b)) {
          const el = elementKey(v);
          if (!el) bad(step, rule, `${e.name}: choose an element`);
          else if (!owns(el)) bad(step, rule, `${e.name}: ${el} needs a related power you have`);
        }
        if (b === 'choose two basic actions' && !(v && String(v).trim())) bad(step, rule, `${e.name}: name the two basic actions`);
        return m;
      });
    };
    const usesTrait = n => /\[(power|quality|power\/quality|Signature Vehicle|Signature Weaponry|Self Control power|Psychic power|Mental quality|a power gained from your archetype|a quality gained from your archetype)\]/.test((W.ABILITIES[n] || {}).text || '');
    // A group of abilities: how many, from which list, and the group's own rules.
    const groupCheck = (step, key, list, n, pool, rules = {}, fixedNames = []) => {
      const s = (sel[key] || []).filter(e => !fixedNames.includes(e.name));
      const rule = 'group.' + key;
      if (s.length !== n) bad(step, rule + '.count', `${key}: ${s.length} abilities, the book gives ${n}`);
      const names = s.map(e => e.name);
      if (new Set(names).size !== names.length) bad(step, rule, `${key}: the same ability twice`);
      for (const e of s) if (!list.includes(e.name)) bad(step, rule, `${key}: ${e.name} is not on the list`);
      for (const e of s) abilityCheck(step, rule, e, pool);
      const t = s.filter(e => usesTrait(e.name));   // (an ability that uses no trait ignores any left on it)
      const used = t.map(e => e.trait).filter(Boolean);
      if (rules.diff && new Set(used).size !== used.length) bad(step, rule + '.diff', `${key}: each must use a different trait (${used.join(', ')})`);
      if (rules.kind) for (const e of t) if (e.trait && kind(e.trait) !== rules.kind) bad(step, rule + '.kind', `${key}: ${e.name} must use a ${rules.kind}`);
      if (rules.cat) for (const e of t) if (e.trait && cat(e.trait) !== rules.cat) bad(step, rule + '.cat', `${key}: ${e.name} must use a ${rules.cat} power`);
      if (rules.fromList) for (const e of t) if (e.trait && !rules.fromList.includes(e.trait)) bad(step, rule + '.list', `${key}: ${e.name} must use a trait from the Path's list`);
      if (rules.needs && s.length === n && used.length === t.length) {
        const fits = (k, nd) => Array.isArray(nd) ? nd.includes(k) : kind(k) === nd;
        const cover = (i, left) => i === rules.needs.length || left.some((k, j) => fits(k, rules.needs[i]) && cover(i + 1, left.filter((_, x) => x !== j)));
        if (!cover(0, used)) bad(step, rule + '.needs', `${key}: must include ${rules.needs.map(x => 'one using ' + x).join(' and ')}`);
      }
      if (rules.minPowers && s.length === n) {
        const p = new Set(used.filter(k => kind(k) === 'power'));
        if (p.size < rules.minPowers) bad(step, rule + '.min', `${key}: at least ${rules.minPowers} different powers`);
      }
      return s;
    };

    // ---------------------------------------------------------------- Step 1, Background (pp.49-54)
    const bg = find(W.BACKGROUNDS, st.bg && st.bg.id);
    if (!bg) { bad('background', 'pick', 'no Origin'); return out; }
    const bgOpts = expand(bg.q.opts);
    const bgKeys = slotsOf(st.bg.assign, 'b', bg.q.dice.length);
    bgKeys.forEach((k, i) => {
      if (!k) return bad('background', 'dice', `${bg.q.dice[i]} not assigned`);
      if (!bgOpts.includes(k)) bad('background', 'dice', `${k} is not on the ${bg.id} list`);
      if (kind(k) !== 'quality') bad('background', 'dice', `${k} is not a quality`);
      give('background', k, bg.q.dice[i], 'dice');
    });
    if (bg.q.mustInclude && !bgKeys.includes(bg.q.mustInclude)) bad('background', 'dice', `${bg.q.mustInclude} is required`);
    const principleCheck = (step, slot, category) => {
      const id = slot === 'bg' ? st.bg.principle : st.arch.principle;
      const p = (W.PRINCIPLES || []).find(x => x.id === id);
      if (!p) return bad(step, 'principle', `no ${category} principle`);
      if (p.cat !== category) bad(step, 'principle', `${id} is ${p.cat}, the book gives a ${category} principle`);
      if (id === 'energy-element' && !elementKey((st.pch || {})[slot])) bad(step, 'principle', 'the Principle of the Energy/Element needs an element');
    };
    principleCheck('background', 'bg', bg.principle);

    // ---------------------------------------------------------------- Step 2, Power Source (pp.57-72)
    const ps = find(W.POWER_SOURCES, st.ps && st.ps.id);
    if (!ps) { bad('powersource', 'pick', 'no Source'); return out; }
    const psOpts = expand(ps.opts);
    const psKeys = slotsOf(st.ps.assign, 'p', bg.psDice.length);
    psKeys.forEach((k, i) => {
      if (!k) return bad('powersource', 'dice', `${bg.psDice[i]} not assigned`);
      if (!psOpts.includes(k) && !(ps.required && ps.required.key === k)) bad('powersource', 'dice', `${k} is not on the ${ps.id} list`);
      if (kind(k) !== 'power') bad('powersource', 'dice', `${k} is not a power`);
      give('powersource', k, bg.psDice[i], 'dice');
    });
    if (ps.required && !psKeys.includes(ps.required.key)) bad('powersource', 'dice', `${ps.required.key} is required`);
    const ex = ps.extra, e = (st.ps && st.ps.extra) || {};
    if (ex && ex.type === 'addTrait') {
      const ok = expand(ex.opts).filter(k => !ex.notInOpts || !psOpts.includes(k));
      if (!e.key) bad('powersource', 'extra', 'bonus trait not chosen');
      else if (!ok.includes(e.key)) bad('powersource', 'extra', `bonus ${e.key} is not allowed`);
      else if (T[e.key] && DN(T[e.key]) >= DN(ex.die)) bad('powersource', 'extra', `bonus ${e.key} is already ${T[e.key]}`);
      else { T[e.key] = ex.die; gainedIn[e.key] = gainedIn[e.key] || 'powersource'; }
    }
    if (ex && ex.type === 'alien') {   // p.68: upgrade a d6 power or quality to d8; with no d6 powers, add a power from the list at d6
      const hasD6Power = Object.keys(T).some(k => T[k] === 'd6' && kind(k) === 'power');
      if (!e.key) bad('powersource', 'extra', 'Void-touched choice missing');
      else if (hasD6Power) { if (T[e.key] !== 'd6') bad('powersource', 'extra', `must raise one of your d6 traits, not ${e.key}`); else T[e.key] = 'd8'; }
      else if (!psOpts.includes(e.key) || kind(e.key) !== 'power' || T[e.key]) bad('powersource', 'extra', `new d6 power ${e.key} is not allowed`);
      else give('powersource', e.key, 'd6', 'extra');
    }
    if (ex && ex.type === 'cosmos') {  // p.69: one d8/d10/d12 power down a size, one d6/d8/d10 power up a size
      if (!e.down || !e.up) bad('powersource', 'extra', 'choose both powers');
      else if (e.down === e.up) bad('powersource', 'extra', 'the two powers must differ');
      else {
        if (!T[e.down] || kind(e.down) !== 'power' || DN(T[e.down]) < 8) bad('powersource', 'extra', `cannot lower ${e.down}`);
        else T[e.down] = UP(T[e.down], -1);
        if (!T[e.up] || kind(e.up) !== 'power' || DN(T[e.up]) > 10) bad('powersource', 'extra', `cannot raise ${e.up}`);
        else T[e.up] = UP(T[e.up]);
      }
    }
    const afterPs = Object.keys(T);
    groupCheck('powersource', 'ps-yellow', ps.yellow.list, ps.yellow.count, afterPs, { diff: !PS_YELLOW_ANY.includes(ps.id) });
    if (ps.green) groupCheck('powersource', 'ps-green', ps.green.list, ps.green.count, afterPs);

    // ---------------------------------------------------------------- Step 3, Archetype (pp.73-98)
    const ar = find(W.ARCHETYPES, st.arch && st.arch.id);
    if (!ar) { bad('archetype', 'pick', 'no Path'); return out; }
    const shape = ar.divided || ar.modular ? find(W.ARCHETYPES, st.arch.base) : ar;
    if (!shape) { bad('archetype', 'pick', 'no base Path'); return out; }
    if (shape.divided || shape.modular) bad('archetype', 'pick', 'the base Path cannot be Divided or Modular');
    const pw = expand(shape.powers), ql = expand(shape.quals), rq = shape.req ? expand(shape.req.any) : [];
    const before = Object.assign({}, T);
    const dice = [];   // every die placed this step: { k, d, req }
    const archKeys = slotsOf(st.arch.assign, 'a', ps.archDice.length);
    archKeys.forEach((k, i) => {
      const d = ps.archDice[i];
      if (!k) return bad('archetype', 'dice', `${d} not assigned`);
      if (!pw.includes(k) && !ql.includes(k) && !rq.includes(k)) bad('archetype', 'dice', `${k} is not on the ${shape.id} lists`);
      // p.44 "I've Already Got That": the required trait you already have may take a bigger new die; its old die is placed elsewhere this step
      if (before[k] && T[k] === before[k] && rq.includes(k) && DN(d) > DN(before[k])) {   // (once: then it is taken)
        const f = st.arch.assign['fa' + i];
        dice.push({ k, d, req: true, swap: true });
        T[k] = d; fromPath.add(k);
        if (!f) return bad('archetype', 'dice', `the old ${before[k]} of ${k} is not placed`);
        if (!pw.includes(f) && !ql.includes(f)) bad('archetype', 'dice', `${f} is not on the ${shape.id} lists`);
        dice.push({ k: f, d: before[k] });
        give('archetype', f, before[k], 'dice');
        return;
      }
      dice.push({ k, d });
      give('archetype', k, d, 'dice');
    });
    if (ps.id === 'training') {   // p.58: one extra quality from the Path's quality list at d8
      const t = st.arch.assign.t0;
      if (!t) bad('archetype', 'dice', 'Training quality not chosen');
      else { if (!ql.includes(t) || kind(t) !== 'quality') bad('archetype', 'dice', `Training: ${t} is not a quality of the Path`); give('archetype', t, 'd8', 'dice'); }
    }
    if (shape.req) {
      const need = shape.req.count || 1;
      if (Object.keys(T).filter(k => rq.includes(k)).length < need) bad('archetype', 'dice', `the Path needs ${shape.req.label}`);
    }
    // The other dice: exactly one / one or more / any number to powers. With the required trait already owned
    // the required die may be skipped (then every die is a "remaining" one) or placed on another trait of the list.
    const rem = REM[shape.id];
    if (archKeys.every(Boolean) && ps.archDice.length > 1 && rem !== 'any') {
      const reqPower = rq.some(k => kind(k) === 'power');
      const powers = dice.filter(x => kind(x.k) === 'power');
      const reqCands = powers.filter(x => rq.includes(x.k) && (x.swap || !before[x.k])).length;
      const had = Object.keys(before).filter(k => rq.includes(k)).length >= (shape.req && shape.req.count || 1);
      const options = [];
      if (!reqPower) options.push(powers.length);
      else if (dice.some(x => x.swap)) options.push(powers.length - 1);   // a swap is the required die
      else { if (reqCands) options.push(powers.length - 1); if (had || !reqCands) options.push(powers.length); }
      const okRem = options.some(r => rem === 'one' ? r === 1 : r >= 1);
      if (!okRem) bad('archetype', 'dice', rem === 'one' ? 'exactly one of the other dice goes to a power' : 'one or more of the other dice go to powers');
    }
    if (shape.extra && shape.extra.type === 'addTrait') {   // Robot p.85: a Technological power you don't have, at d10
      const k = (st.arch.extra || {}).key;
      if (!k) bad('archetype', 'dice', 'Robot: Technological power not chosen');
      else if (!expand(shape.extra.opts).includes(k) || T[k]) bad('archetype', 'dice', `Robot: ${k} is not a new Technological power`);
      else give('archetype', k, 'd10', 'dice');
    }
    if (ar.modular) {   // p.96: you need at least four powers; add d6 powers until you have them
      const n = Object.keys(T).filter(k => kind(k) === 'power').length;
      for (let i = 0; i < Math.max(0, 4 - n); i++) {
        const k = (st.arch.extra || {})['m' + i];
        if (!k) bad('archetype', 'dice', 'Modular: add a d6 power');
        else if (kind(k) !== 'power') bad('archetype', 'dice', `Modular: ${k} is not a power`);
        else give('archetype', k, 'd6', 'dice');
      }
    }
    const afterArch = Object.keys(T);
    const list = expand((shape.req ? shape.req.any : []).concat(shape.powers || [], shape.quals || []));
    if (!ar.modular) {
      const P = PATHS[shape.id];
      for (const n of P.fixed || []) {   // automatic abilities that still use a trait
        const fe = (sel['arch-fixed'] || []).find(x => x.name === n) || { name: n };
        abilityCheck('archetype', 'group.arch-fixed', fe, afterArch);
      }
      const g = P.green, gl = shape.green.list;
      const greens = g.all ? (() => {
        const s = sel['arch-green'] || [];
        for (const n of gl) { const x = s.find(y => y.name === n); abilityCheck('archetype', 'group.arch-green', x || { name: n }, afterArch); }
        const used = s.map(x => x.trait).filter(Boolean);
        if (g.diff && new Set(used).size !== used.length) bad('archetype', 'group.arch-green.diff', 'each Green must use a different power');
        if (g.kind) for (const x of s) if (x.trait && kind(x.trait) !== g.kind) bad('archetype', 'group.arch-green.kind', `${x.name} must use a ${g.kind}`);
        return s;
      })() : groupCheck('archetype', 'arch-green', gl, g.n, afterArch, { diff: g.diff, kind: g.kind, cat: g.cat, fromList: g.fromList ? list : null, needs: g.needs, minPowers: g.minPowers });
      if (P.yellow) {
        const y = P.yellow;
        const ys = groupCheck('archetype', 'arch-yellow', y.fromGreen ? gl : shape.yellow.list, y.n, afterArch, { diff: y.diff, kind: y.kind, cat: y.cat });
        if (y.notGreen) for (const x of ys) if (x.trait && usesTrait(x.name) && greens.some(z => z.trait === x.trait && usesTrait(z.name))) bad('archetype', 'group.arch-yellow.notGreen', `${x.name} must use a trait none of your Greens uses`);
      }
      if (shape.forms) {   // Form-Changer p.91: two Green forms, one Yellow form (a Yellow form or one of the other Green forms)
        const fg = groupCheck('archetype', 'arch-formgreen', shape.forms.green, 2, afterArch);
        const taken = fg.map(x => x.name);
        groupCheck('archetype', 'arch-formyellow', shape.forms.yellow.concat(shape.forms.green.filter(n => !taken.includes(n))), 1, afterArch);
      }
      if (shape.minionForms) {   // Minion-Maker p.88: forms equal to the max of a related quality
        const q = st.arch.minionQ, f = st.arch.minionForms || [];
        if (!q) bad('archetype', 'minions', 'no quality for minion forms');
        else if (!T[q] || kind(q) !== 'quality') bad('archetype', 'minions', `${q} is not one of your qualities`);
        else if (f.length !== DN(T[q])) bad('archetype', 'minions', `${f.length} minion forms, ${q} gives ${DN(T[q])}`);
        if (new Set(f).size !== f.length) bad('archetype', 'minions', 'the same minion form twice');
        for (const n of f) if (!W.MINION_FORMS.some(m => m[0] === n)) bad('archetype', 'minions', `unknown minion form ${n}`);
      }
    }
    if (ar.divided) {   // p.95: a method of transformation, then Divided Psyche or Split Form
      const m = (W.DIVIDED.methods || []).find(x => x.id === st.arch.divMethod);
      if (!m) bad('archetype', 'divided', 'no method of transformation');
      else if (m.choose) groupCheck('archetype', 'arch-divmethod', m.choose, 1, afterArch);
      groupCheck('archetype', 'arch-divafter', W.DIVIDED.after, 1, afterArch);
      if ((sel['arch-divafter'] || []).some(x => x.name === 'Split Form')) {
        const sp = st.arch.split || {};
        const both = kd => afterArch.filter(k => sp[k] === 'both' && kind(k) === kd).length;
        if (both('power') !== 2) bad('archetype', 'split', `Split Form: ${both('power')} powers in both forms (book: 2)`);
        if (both('quality') !== 2) bad('archetype', 'split', `Split Form: ${both('quality')} qualities in both forms (book: 2)`);
        const left = afterArch.filter(k => !['both', 'civ', 'her'].includes(sp[k]));
        if (left.length) bad('archetype', 'split', `Split Form: ${left.join(', ')} not placed in a form`);
      }
    }
    if (ar.modular) {   // p.96: Switch/Quick Switch/Emergency Switch, one Green mode, two Yellow modes, one Red mode
      abilityCheck('archetype', 'group.arch-modfixg', (sel['arch-modfixg'] || []).find(x => x.name === 'Switch') || { name: 'Switch' }, afterArch);
      const M = W.MODULAR;
      groupCheck('archetype', 'arch-modgreen', M.green.map(x => x.name), 1, afterArch);
      groupCheck('archetype', 'arch-modyellow', M.yellow.map(x => x.name), 2, afterArch);
      groupCheck('archetype', 'arch-modred', M.red.map(x => x.name), 1, afterArch);
      const pl = st.arch.powerless;
      if (pl && pl.on) {   // optional Powerless Mode: one of your powers at d6 and another at d10
        if (!pl.a || !pl.b || pl.a === pl.b) bad('archetype', 'powerless', 'Powerless Mode needs two different powers');
        for (const k of [pl.a, pl.b]) if (k && (!T[k] || kind(k) !== 'power')) bad('archetype', 'powerless', `Powerless Mode: ${k} is not one of your powers`);
      }
    }   // (a Powerless Mode left over from an earlier Modular choice simply does not apply)
    for (const k of Object.keys(sel)) {   // an ability is taken once, automatic ones included
      const names = (sel[k] || []).map(x => x.name), step = k.startsWith('ps-') ? 'powersource' : k.startsWith('arch-') ? 'archetype' : null;
      if (step && new Set(names).size !== names.length) bad(step, 'group.' + k, `${k}: the same ability twice`);
    }
    principleCheck('archetype', 'arch', ar.modular ? PATH_PRINCIPLE[shape.id] : PATH_PRINCIPLE[ar.id]);
    if (st.arch.principle && st.arch.principle === st.bg.principle) bad('archetype', 'principle', 'the two principles must differ');

    // ---------------------------------------------------------------- Step 4, Personality (pp.100-104)
    const pe = find(W.PERSONALITIES, st.pers && st.pers.id);
    if (!pe) { bad('personality', 'pick', 'no Temperament'); return out; }
    if (!st.pers.qname || !String(st.pers.qname).trim() || !st.pers.qdesc || !String(st.pers.qdesc).trim() || st.pers.qok === false) bad('personality', 'qname', 'no Signature Quality');
    T['rp-quality'] = 'd8';
    if (pe.extra === 'impulsive') {   // p.101: upgrade one power or quality one size
      const u = st.pers.upgrade;
      if (!u || !T[u] || u === 'rp-quality') bad('personality', 'reckless', 'Reckless upgrade missing');
      else if (DN(T[u]) >= 12) bad('personality', 'reckless', `${u} is already d12`);
      else T[u] = UP(T[u]);
    }
    if (/\[(power|quality)\]/.test(pe.out)) {
      const want = /\[power\]/.test(pe.out) ? 'power' : 'quality';
      const k = st.pers.outTrait;
      if (!k) bad('personality', 'out', 'Out ability trait not chosen');
      else if (!T[k] || kind(k) !== want) bad('personality', 'out', `Out ability needs one of your ${want}s, uses ${k}`);
    }
    out.status = pe.status.slice();
    if (st.pers.id2 && ar.divided) {   // Divided p.95: another Temperament for the other form, only its status dice
      const p2 = find(W.PERSONALITIES, st.pers.id2);   // (one left over from an earlier Divided choice, or the same one, does not apply)
      if (p2 && st.pers.id2 !== st.pers.id) out.status2 = p2.status.slice();
    }

    // ---------------------------------------------------------------- Step 5, Red abilities (pp.106-111)
    const reds = sel.red || [];
    const all = Object.keys(T);
    if (reds.length !== 2) bad('red', 'count', `${reds.length} Red abilities, the book gives 2`);
    const shown = reds.map(r => r.name.replace(/ \((PS|Hallmark|Quality|Self Control)\)$/, ''));
    if (new Set(shown).size !== shown.length) bad('red', 'dup', 'the same Red ability twice');
    for (const r of reds) {
      if (r.cat && r.cat.startsWith('X:')) {   // Minion-Maker's own Red abilities (p.89)
        if (ar.modular || r.cat !== 'X:' + shape.id || !(shape.extraRed || []).includes(r.name)) bad('red', 'cat', `${r.name} is not one of your Path's Red abilities`);
        abilityCheck('red', 'trait', r, all);
        continue;
      }
      const c = W.RED_ABILITIES.find(x => x.cat === r.cat);
      if (!c) { bad('red', 'cat', `unknown category ${r.cat}`); continue; }
      const entry = c.list.find(x => x.a === r.name);
      if (!entry) { bad('red', 'cat', `${r.name} is not in ${r.cat}`); continue; }
      if (!all.some(k => cat(k) === r.cat && DN(T[k]) >= 6)) bad('red', 'cat', `${r.name}: no d6+ trait in ${r.cat}`);
      abilityCheck('red', 'trait', r, all, { cat: r.cat, use: entry.use || null });
    }

    // ---------------------------------------------------------------- Step 7, Health (p.113)
    // 8 + max of the Red status die + max of an Athletic power or Mental quality (d4 without one) + a d8 roll or 4
    let elig = all.filter(k => cat(k) === 'P:athletic' || cat(k) === 'Q:mental');
    if (shape.healthAlt) elig = elig.concat(all.filter(k => shape.healthAlt.includes(cat(k))));
    if (pe.healthAny) elig = all.slice();
    const H = st.health || {};
    // (a trait that can no longer set Health falls back to the best one you have)
    const chosen = H.trait && elig.includes(H.trait) ? H.trait : elig.sort((a, b) => DN(T[b]) - DN(T[a]))[0];
    if (H.mode === 'roll' && H.roll != null && !(H.roll >= 1 && H.roll <= 8)) bad('health', 'roll', `a d8 cannot roll ${H.roll}`);
    const roll = H.mode === 'roll' && H.roll ? H.roll : 4;
    out.health = 8 + DN(pe.status[2]) + (chosen ? DN(T[chosen]) : 4) + roll;
    return out;
  };
})();
