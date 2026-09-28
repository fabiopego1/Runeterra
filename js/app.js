/* Runeterra Champion Forge — character builder for a Runeterra game on the Sentinels RPG system. */
(() => {
  'use strict';

  const A = window.ABILITIES;
  const PRINCIPLES = window.PRINCIPLES;
  const CATS = window.TRAIT_CATEGORIES;
  const SIZES = ['d4', 'd6', 'd8', 'd10', 'd12'];
  const dn = d => parseInt(String(d).slice(1), 10) || 0;
  const upDie = (d, n = 1) => SIZES[Math.max(0, Math.min(4, SIZES.indexOf(d) + n))];
  const hiDie = (a, b) => (dn(a) >= dn(b) ? a : b);
  const loDie = (a, b) => (dn(a) >= dn(b) ? b : a);

  // ------------------------------------------------------------------ trait index
  const TRAIT = {};
  for (const [cat, def] of Object.entries(CATS)) {
    for (const [key, sc, rt, desc, lore] of def.items) TRAIT[key] = { key, sc, rt, desc, lore, cat, kind: def.kind };
  }
  TRAIT['rp-quality'] = {
    key: 'rp-quality', sc: 'Roleplaying Quality (Special)', rt: 'Signature Quality', cat: 'Q:special', kind: 'quality',
    desc: 'A custom quality that sums up your hero — your "high concept". Rather than a narrow skill, it covers many parts of who you are.',
    lore: 'e.g. "Hextech Prodigy of the Academy", "Last Kinkou of the Eastern Isles", "Bilgewater\'s Luckiest Liar".'
  };
  const catName = c => (c === 'Q:special' ? 'Special' : (CATS[c] ? CATS[c].rt : c));
  const catSc = c => (c === 'Q:special' ? 'Special' : (CATS[c] ? CATS[c].sc : c));
  const allOf = kind => Object.values(TRAIT).filter(t => t.kind === kind && t.cat !== 'Q:special').map(t => t.key);

  function expand(opts) {
    const out = [];
    for (const o of opts || []) {
      if (o === 'P:*') out.push(...allOf('power'));
      else if (o === 'Q:*') out.push(...allOf('quality'));
      else if (o.includes(':')) out.push(...(CATS[o] ? CATS[o].items.map(i => i[0]) : []));
      else out.push(o);
    }
    return [...new Set(out)];
  }

  // ------------------------------------------------------------------ state
  const STORE = 'runeterra-forge-v1';
  const blank = () => ({
    v: 1, step: 'intro', maxStep: 0, method: 'guided', region: null,
    rolls: {}, rerolls: {},
    bg: { id: null, assign: {}, principle: null },
    ps: { id: null, assign: {}, extra: {} },
    arch: { id: null, base: null, assign: {}, principle: null, extra: {}, divMethod: null, minionQ: null, minionForms: [], notes: '' },
    pers: { id: null, qname: '', outTrait: null, upgrade: null },
    retcon: { type: null },
    health: { trait: null, mode: 'fixed', roll: null },
    pch: {},
    sel: {},
    info: { name: '', alias: '', player: '', gender: '', age: '', height: '', eyes: '', hair: '', skin: '', build: '', costume: '', notes: '', portrait: null },
    play: { hp: [], rw: [], issues: [], coll: [], cdone: [], current: null },
    renames: {}, traitNames: {}
  });
  let st = load();

  function load() {
    try {
      const raw = localStorage.getItem(STORE);
      if (raw) { const s = JSON.parse(raw); if (s && s.v === 1) return upgradeState(s); }
    } catch (e) { /* storage unavailable */ }
    return blank();
  }
  // Merge a saved/imported state onto a blank one (older saves lack newer fields).
  function upgradeState(s) {
    const b = blank();
    const out = Object.assign(b, s);
    out.info = Object.assign(blank().info, s.info || {});
    if (s.info && s.info.look && !out.info.costume) out.info.costume = s.info.look;
    if (s.info && s.info.pronouns && !out.info.gender) out.info.gender = s.info.pronouns;
    out.play = Object.assign(blank().play, s.play || {});
    out.maxStep = typeof s.maxStep === 'number' ? s.maxStep : -1;   // older saves: recomputed after load
    return out;
  }
  function save() { try { localStorage.setItem(STORE, JSON.stringify(st)); } catch (e) { /* ignore */ } }

  function setPath(obj, path, val) {
    const parts = path.split('.');
    let o = obj;
    for (let i = 0; i < parts.length - 1; i++) {
      const p = parts[i];
      if (o[p] == null || typeof o[p] !== 'object') o[p] = /^\d+$/.test(parts[i + 1]) ? [] : {};
      o = o[p];
    }
    o[parts[parts.length - 1]] = val;
  }

  // ------------------------------------------------------------------ definitions
  const byId = (list, id) => list.find(x => x.id === id) || null;
  const bgDef = () => byId(window.BACKGROUNDS, st.bg.id);
  const psDef = () => byId(window.POWER_SOURCES, st.ps.id);
  const archDef = () => byId(window.ARCHETYPES, st.arch.id);
  const persDef = () => byId(window.PERSONALITIES, st.pers.id);
  const regionDef = () => byId(window.REGIONS, st.region);
  // The archetype whose dice/abilities are used (base archetype for Divided/Modular).
  function shapeDef() {
    const a = archDef();
    if (!a) return null;
    if (a.divided || a.modular) return byId(window.ARCHETYPES, st.arch.base);
    return a;
  }

  // ------------------------------------------------------------------ html helpers
  const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const tip = html => ` data-tip="${esc(html)}"`;
  const traitName = k => (st.traitNames[k] || (TRAIT[k] ? TRAIT[k].rt : k));

  function dieTip(d) {
    const i = window.DICE_INFO[d] || {};
    return `<h5>${d.toUpperCase()}</h5><div class="sc-line">Sentinels die size</div>` +
      `In the Sentinels system every trait is a die — bigger is better (d4 → d6 → d8 → d10 → d12). ` +
      `Each roll uses a pool of <b>one power + one quality + your status die</b>.` +
      `<ul><li>As a power: ${esc(i.power || '—')}</li><li>As a quality: ${esc(i.quality || '—')}</li><li>As a status die: ${esc(i.status || '—')}</li></ul>` +
      (i.note ? `<small>${esc(i.note)}</small>` : '');
  }
  const die = (d, cls = '') => d ? `<span class="die ${d} ${cls}"${tip(dieTip(d))}>${d.slice(1)}</span>` : '';

  function traitTip(k) {
    const t = TRAIT[k];
    if (!t) return esc(k);
    const c = CATS[t.cat];
    return `<h5>${esc(traitName(k))}</h5><div class="sc-line">Sentinels: ${esc(t.sc)} · ${t.kind} · ${esc(catSc(t.cat))}</div>` +
      `${esc(t.desc)}<hr><em>In Runeterra:</em> ${esc(t.lore)}` +
      (c && c.note ? `<hr><small>${esc(c.note)}</small>` : '') +
      (t.kind === 'power' ? '<hr><small>Powers are what makes you exceptional — the first die in your pool.</small>' : '<hr><small>Qualities are how you use your powers — the second die in your pool.</small>');
  }
  const traitSpan = k => `<span class="term"${tip(traitTip(k))}>${esc(traitName(k))}</span>`;

  function optsText(opts) {
    return (opts || []).map(o => {
      if (o === 'P:*') return 'any power';
      if (o === 'Q:*') return 'any quality';
      if (o.includes(':')) {
        const c = CATS[o];
        return `any <span class="term"${tip(`<h5>${esc(c.rt)}</h5><div class="sc-line">Sentinels: ${esc(c.sc)} ${c.kind}s</div>` + c.items.map(i => esc(i[2])).join(', '))}>${esc(c.rt)}</span> ${c.kind}`;
      }
      return TRAIT[o] ? traitSpan(o) : esc(o);
    }).join(', ');
  }

  // Glossary-aware rules text
  const TERM_RE = /\[(d4|d6|d8|d10|d12)\]|\[([^\]]+)\]|\b(Max\+Mid\+Min|Max\+Mid|Max\+Min|Mid\+Min|Min die|Mid die|Max die|Green zone|Yellow zone|Red zone|status die|minor twist|major twist|hero points?|Attack(?:s|ed|ing)?|Defend(?:s|ed|ing)?|Overcome|Overcoming|Boost(?:s|ed|ing)?|Hinder(?:s|ed|ing)?|Recover(?:s|ing)?|persistent|exclusive|irreducible|bonus(?:es)?|penalt(?:y|ies)|minions?|lieutenants?|Reactions?|doubles|nearby|close|scene|collection|Health|environment(?:al)?|twists?)\b/gi;
  function glossKey(m) {
    const l = m.toLowerCase();
    const map = [['max+mid+min', 'Max+Mid+Min'], ['max+mid', 'Max+Mid'], ['max+min', 'Max+Min'], ['mid+min', 'Mid+Min'], ['min die', 'Min die'], ['mid die', 'Mid die'], ['max die', 'Max die'], ['green zone', 'Green zone'], ['yellow zone', 'Yellow zone'], ['red zone', 'Red zone'], ['status die', 'status die'], ['minor twist', 'minor twist'], ['major twist', 'major twist']];
    for (const [a, b] of map) if (l === a) return b;
    if (l.startsWith('hero point')) return 'hero point';
    if (l.startsWith('attack')) return 'Attack';
    if (l.startsWith('defend')) return 'Defend';
    if (l.startsWith('overcom')) return 'Overcome';
    if (l.startsWith('boost')) return 'Boost';
    if (l.startsWith('hinder')) return 'Hinder';
    if (l.startsWith('recover')) return 'Recover';
    if (l.startsWith('bonus')) return 'bonus';
    if (l.startsWith('penalt')) return 'penalty';
    if (l.startsWith('minion')) return 'minion';
    if (l.startsWith('lieutenant')) return 'lieutenant';
    if (l.startsWith('reaction')) return 'Reaction';
    if (l.startsWith('environment')) return 'environment';
    if (l.startsWith('twist')) return 'twist';
    if (l === 'health') return 'Health';
    return l;
  }
  const TRAIT_TOKENS = { 'power': 'power', 'quality': 'quality', 'power/quality': 'power or quality', 'Self Control power': 'Self Control power', 'Psychic power': 'Psychic power', 'Mental quality': 'Mental quality', 'Signature Vehicle': 'Signature Vehicle', 'Signature Weaponry': 'Signature Weaponry', 'a power gained from your archetype': 'power from your Path', 'a quality gained from your archetype': 'quality from your Path' };

  // entry: {trait, trait2, ch} used to fill brackets.
  function rulesText(text, entry) {
    let out = '';
    let last = 0;
    text.replace(TERM_RE, (m, dsz, br, term, idx) => {
      out += esc(text.slice(last, idx));
      last = idx + m.length;
      if (dsz) out += die(dsz, 'sm');
      else if (br) {
        if (TRAIT_TOKENS[br] !== undefined) {
          const k = entry ? (br === 'quality' && entry.trait2 ? entry.trait2 : entry.trait) : null;
          if (k && TRAIT[k]) out += `<span class="slot-chip"${tip(traitTip(k))}>${esc(traitName(k))}</span>`;
          else out += `<span class="slot-chip unset"${tip(`<h5>[${esc(br)}]</h5>Placeholder: when you take this ability you pick which ${esc(TRAIT_TOKENS[br])} it uses. That choice is fixed on your sheet (it can only change through a Retcon or advancement).`)}>[${esc(br)}]</span>`;
        } else if (CHOICE_TOKENS[br] !== undefined) {
          const v = entry && entry.ch && entry.ch[br];
          out += v ? `<span class="slot-chip"${tip(`Chosen for <b>[${esc(br)}]</b>`)}>${esc(v)}</span>`
            : `<span class="slot-chip unset"${tip(`<h5>[${esc(br)}]</h5>A choice you make when taking this ability (e.g. which element, which action). Fixed once chosen.`)}>[${esc(br)}]</span>`;
        } else {
          out += `<span class="slot-chip"${tip('Decided each time you use the ability.')}>[${esc(br)}]</span>`;
        }
      } else {
        const g = window.GLOSSARY[glossKey(term)];
        out += g ? `<span class="term"${tip(`<h5>${esc(glossKey(term))}</h5>${g}`)}>${esc(term)}</span>` : esc(term);
      }
      return m;
    });
    out += esc(text.slice(last));
    return out;
  }

  // What trait an ability needs, from its text.
  const FIXED_WORDS = [['Remote Viewing', 'remote-viewing'], ['Illusions', 'illusions'], ['Suggestion', 'suggestion'], ['Postcognition', 'postcognition'], ['Precognition', 'precognition'], ['Animal Control', 'animal-control'], ['Telekinesis', 'telekinesis'], ['Telepathy', 'telepathy'], ['Power Suit', 'power-suit'], ['Vitality', 'vitality']];
  function reqFromText(t) {
    if (!t) return { kind: 'none' };
    if (t.includes('[Signature Vehicle]')) return { kind: 'power', only: ['sig-vehicle'] };
    if (t.includes('[Signature Weaponry]')) return { kind: 'power', only: ['sig-weapon'] };
    if (t.includes('[Self Control power]')) return { kind: 'power', cat: 'P:selfcontrol' };
    if (t.includes('[Psychic power]')) return { kind: 'power', cat: 'P:psychic' };
    if (t.includes('[Mental quality]')) return { kind: 'quality', cat: 'Q:mental' };
    if (t.includes('[a power gained from your archetype]')) return { kind: 'power' };
    if (t.includes('[a quality gained from your archetype]')) return { kind: 'quality' };
    if (t.includes('[power/quality]')) return { kind: 'any' };
    if (t.includes('[power]') && t.includes('[quality]')) return { kind: 'power', second: 'quality' };
    if (t.includes('[power]')) return { kind: 'power' };
    if (t.includes('[quality]')) return { kind: 'quality' };
    for (const [w, k] of FIXED_WORDS) if (new RegExp('\\b' + w + '\\b').test(t)) return { kind: 'power', only: [k], fixed: true };
    return { kind: 'none' };
  }
  const CHOICE_TOKENS = {
    'Boost or Hinder': ['Boost', 'Hinder'],
    'physical or energy': ['physical', 'energy'],
    'energy/element': 'element', 'element/energy': 'element', 'elemental/energy': 'element',
    'element/energy you have a related power for': 'element', 'energy/element you have a related power for': 'element',
    'choose two basic actions': 'text'
  };
  function choiceTokens(t) {
    const out = [];
    (t || '').replace(/\[([^\]]+)\]/g, (m, b) => { if (CHOICE_TOKENS[b] && !out.includes(b)) out.push(b); return m; });
    return out;
  }
  const displayName = n => n.replace(/ \((PS|Hallmark|Quality|Self Control)\)$/, '');

  // ------------------------------------------------------------------ core computation
  function assignStep(prefix, dice, assign, T, src) {
    const slots = dice.map((d, i) => ({ id: prefix + i, die: d }));
    for (let i = 0; i < slots.length; i++) {
      const s = slots[i];
      const k = assign[s.id];
      if (!k || !TRAIT[k]) continue;
      s.key = k;
      if (T[k]) {
        const old = T[k].die;
        s.upgrade = { from: old, to: hiDie(old, s.die) };
        T[k].die = hiDie(old, s.die);
        T[k].src.push(src);
        if (slots.length < 12) slots.push({ id: 'f' + s.id, die: loDie(old, s.die), freed: true, from: k });
      } else {
        T[k] = { key: k, die: s.die, src: [src] };
      }
    }
    return slots;
  }
  const addTrait = (T, k, d, src) => {
    if (!k || !TRAIT[k]) return;
    if (T[k]) { T[k].die = hiDie(T[k].die, d); T[k].src.push(src); } else T[k] = { key: k, die: d, src: [src] };
  };
  const snap = T => JSON.parse(JSON.stringify(T));

  function compute() {
    const T = {};
    const R = { slots: {}, before: {} };
    const bg = bgDef(), ps = psDef(), ar = archDef(), shape = shapeDef(), pers = persDef();
    R.before.background = snap(T);
    if (bg) R.slots.bg = assignStep('b', bg.q.dice, st.bg.assign, T, 'Origin');
    R.before.powersource = snap(T);
    if (bg && ps) {
      R.slots.ps = assignStep('p', bg.psDice, st.ps.assign, T, 'Source');
      R.before.psExtra = snap(T);
      const ex = ps.extra, e = st.ps.extra;
      if (ex && ex.type === 'addTrait' && e.key) addTrait(T, e.key, ex.die, 'Source');
      if (ex && ex.type === 'alien' && e.key) {
        const hasD6Power = Object.values(R.before.psExtra).some(t => t.die === 'd6' && TRAIT[t.key].kind === 'power');
        if (hasD6Power && T[e.key] && T[e.key].die === 'd6') T[e.key].die = 'd8';
        else if (!hasD6Power && !T[e.key]) addTrait(T, e.key, 'd6', 'Source');
      }
      if (ex && ex.type === 'cosmos') {
        if (e.down && T[e.down] && dn(T[e.down].die) >= 8) T[e.down].die = upDie(T[e.down].die, -1);
        if (e.up && T[e.up] && e.up !== e.down && dn(T[e.up].die) <= 10) T[e.up].die = upDie(T[e.up].die, 1);
      }
    }
    R.before.archetype = snap(T);
    if (ps && ar && shape) {
      R.slots.arch = assignStep('a', ps.archDice, st.arch.assign, T, 'Path');
      if (ps.id === 'training') R.slots.training = assignStep('t', ['d8'], st.arch.assign, T, 'Path (Training)');
      if (shape.extra && shape.extra.type === 'addTrait' && st.arch.extra.key) addTrait(T, st.arch.extra.key, shape.extra.die, 'Path');
      if (ar.modular) {
        const n = Object.values(T).filter(t => TRAIT[t.key].kind === 'power').length;
        R.modExtra = Math.max(0, Math.min(2, 4 - n));
        for (let i = 0; i < R.modExtra; i++) addTrait(T, st.arch.extra['m' + i], 'd6', 'Path (Modular)');
      }
    }
    R.before.personality = snap(T);
    if (pers) {
      T['rp-quality'] = { key: 'rp-quality', die: 'd8', src: ['Temperament'] };
      if (pers.extra === 'impulsive' && st.pers.upgrade && T[st.pers.upgrade] && dn(T[st.pers.upgrade].die) < 12) T[st.pers.upgrade].die = upDie(T[st.pers.upgrade].die);
    }
    R.before.retcon = snap(T);
    const rc = st.retcon;
    if ((rc.type === 'swap-powers' || rc.type === 'swap-quals') && rc.a && rc.b && T[rc.a] && T[rc.b] && rc.a !== rc.b) {
      const t = T[rc.a].die; T[rc.a].die = T[rc.b].die; T[rc.b].die = t;
    }
    if (rc.type === 'add-d6' && rc.key && !T[rc.key]) T[rc.key] = { key: rc.key, die: 'd6', src: ['Twist of Fate'] };
    R.T = T;
    // status dice
    if (pers) {
      const s = pers.status.slice();
      if (rc.type === 'red-up') s[2] = upDie(s[2]);
      R.status = s;
    }
    return R;
  }

  const owned = (R, kind) => Object.values(R.T).filter(t => !kind || TRAIT[t.key].kind === kind);
  const sortTraits = list => list.sort((a, b) => dn(b.die) - dn(a.die) || traitName(a.key).localeCompare(traitName(b.key)));

  // ------------------------------------------------------------------ ability groups
  function groups() {
    const G = [];
    const ps = psDef(), ar = archDef(), shape = shapeDef();
    if (ps) {
      G.push({ key: 'ps-yellow', step: 'powersource', color: 'yellow', count: ps.yellow.count, diff: ps.yellow.diff, list: ps.yellow.list, label: `Yellow abilities (choose ${ps.yellow.count}${ps.yellow.diff ? ', each using a different power' : ''})`, powersOnly: true });
      if (ps.green) G.push({ key: 'ps-green', step: 'powersource', color: 'green', count: ps.green.count, list: ps.green.list, label: 'Green ability (choose 1)' });
    }
    if (ar) {
      const useShapeAbilities = shape && !ar.modular;
      if (useShapeAbilities) {
        if (shape.fixedGreen) G.push({ key: 'arch-fixed', step: 'archetype', color: 'green', fixed: true, count: shape.fixedGreen.length, list: shape.fixedGreen, label: 'Green ability (automatic)' });
        const g = shape.green;
        G.push({ key: 'arch-green', step: 'archetype', color: 'green', count: g.count, list: g.list, diff: g.diff, fixed: g.fixed, note: g.note, rules: g.rules, label: `Green abilities (${g.fixed ? 'you gain both' : 'choose ' + g.count})` });
        if (shape.yellow) {
          const y = shape.yellow;
          G.push({ key: 'arch-yellow', step: 'archetype', color: 'yellow', count: y.count, list: y.fromGreen ? g.list : y.list, diff: y.diff, note: y.note || (y.rules && y.rules.notGreen ? 'Using a different power or quality than your Green abilities.' : ''), rules: y.rules, label: `Yellow ${y.count > 1 ? 'abilities' : 'ability'} (choose ${y.count})` });
        }
        if (shape.forms) {
          G.push({ key: 'arch-formgreen', step: 'archetype', color: 'green', count: 2, list: shape.forms.green, label: 'Green forms (choose 2 form abilities, one per form)', note: 'Each Green form gets a different ability usable only in that form. Record which powers/dice each form uses in your notes.' });
          const used = (st.sel['arch-formgreen'] || []).map(x => x.name);
          G.push({ key: 'arch-formyellow', step: 'archetype', color: 'yellow', count: 1, list: shape.forms.yellow.concat(shape.forms.green.filter(n => !used.includes(n))), label: 'Yellow form (choose 1)', note: 'Your Yellow form may swap powers around and upgrade any two dice by one size.' });
        }
        if (shape.fixedRed) G.push({ key: 'arch-fixedred', step: 'archetype', color: 'red', fixed: true, count: shape.fixedRed.length, list: shape.fixedRed, label: 'Red ability (automatic)' });
      }
      if (ar.divided && shape) {
        const m = window.DIVIDED.methods.find(x => x.id === st.arch.divMethod);
        if (m) {
          if (m.green) G.push({ key: 'arch-divmethod', step: 'archetype', color: 'green', fixed: true, count: 1, list: m.green, label: 'Transformation ability (automatic)' });
          else G.push({ key: 'arch-divmethod', step: 'archetype', color: 'green', count: 1, list: m.choose, label: 'Transformation ability (choose 1)' });
        }
        G.push({ key: 'arch-divafter', step: 'archetype', color: 'green', count: 1, list: window.DIVIDED.after, label: 'Divided nature (choose 1)' });
      }
      if (ar.modular && shape) {
        const M = window.MODULAR;
        G.push({ key: 'arch-modfixg', step: 'archetype', color: 'green', fixed: true, count: 1, list: M.fixed.green, label: 'Green (automatic)' });
        G.push({ key: 'arch-modfixy', step: 'archetype', color: 'yellow', fixed: true, count: 1, list: M.fixed.yellow, label: 'Yellow (automatic)' });
        G.push({ key: 'arch-modfixr', step: 'archetype', color: 'red', fixed: true, count: 1, list: M.fixed.red, label: 'Red (automatic)' });
        G.push({ key: 'arch-modgreen', step: 'archetype', color: 'green', count: 1, list: M.green.map(x => x.name), modes: M.green, label: 'Green mode (choose 1 besides your default mode)' });
        G.push({ key: 'arch-modyellow', step: 'archetype', color: 'yellow', count: 2, list: M.yellow.map(x => x.name), modes: M.yellow, label: 'Yellow modes (choose 2)' });
        G.push({ key: 'arch-modred', step: 'archetype', color: 'red', count: 1, list: M.red.map(x => x.name), modes: M.red, label: 'Red mode (choose 1)' });
      }
    }
    return G;
  }

  function selOf(g) {
    let s = st.sel[g.key];
    if (!Array.isArray(s)) s = st.sel[g.key] = [];
    // drop entries no longer in list
    const keep = s.filter(e => g.list.includes(e.name));
    if (keep.length !== s.length) st.sel[g.key] = s = keep;
    if (g.fixed) {
      for (const n of g.list) if (!s.find(e => e.name === n)) s.push({ name: n, ch: {} });
    }
    return s;
  }

  // Traits an ability may use.
  function allowedTraits(R, name, ctx = {}) {
    const ab = A[name];
    const req = reqFromText(ab && ab.text);
    let pool = Object.keys(R.T);
    if (req.kind === 'none') return { req, keys: [] };
    if (req.only) pool = pool.filter(k => req.only.includes(k));
    if (ctx.use) pool = pool.filter(k => ctx.use.includes(k));
    if (req.cat) pool = pool.filter(k => TRAIT[k].cat === req.cat);
    if (ctx.cat) pool = pool.filter(k => TRAIT[k].cat === ctx.cat);
    if (req.kind !== 'any') pool = pool.filter(k => TRAIT[k].kind === req.kind);
    if (ctx.powersOnly && req.kind === 'any') pool = pool.filter(k => TRAIT[k].kind === 'power');
    const keys2 = req.second ? Object.keys(R.T).filter(k => TRAIT[k].kind === req.second) : null;
    return { req, keys: sortTraits(pool.map(k => R.T[k])).map(t => t.key), keys2 };
  }

  function traitOptions(keys, sel, placeholder) {
    return `<option value="">${esc(placeholder || '— choose —')}</option>` + keys.map(k => `<option value="${k}"${k === sel ? ' selected' : ''}>${esc(traitName(k))} (${R0.T[k] ? R0.T[k].die : ''})</option>`).join('');
  }

  // ------------------------------------------------------------------ validation, organised as guided sub-steps
  // Each step is a list of sections; a section is done when it has no issues.
  // stepIssues() is simply all section issues, so the flow, the Next button and the nav always agree.
  // Traits a group's abilities may use, narrowed by the Path's own wording ("from the Speedster list", "Elemental/Energy powers"...).
  function groupUse(g, R) {
    const ru = g.rules;
    if (!ru || !(ru.fromList || ru.cat || ru.kind)) return null;
    const shape = shapeDef();
    const list = ru.fromList && shape ? expand((shape.req ? shape.req.any : []).concat(shape.powers || [], shape.quals || [])) : null;
    return Object.keys(R.T).filter(k => (!list || list.includes(k)) && (!ru.cat || TRAIT[k].cat === ru.cat) && (!ru.kind || TRAIT[k].kind === ru.kind));
  }
  function groupIssues(g, R) {
    const I = [];
    const s = selOf(g);
    if (!g.fixed && s.length !== g.count) I.push(`Pick ${g.count} (${s.length}/${g.count} chosen).`);
    const used = [];
    for (const e of s) {
      const al = allowedTraits(R, e.name, { powersOnly: g.powersOnly, use: groupUse(g, R) });
      if (al.req.kind !== 'none' && !al.req.fixed && !e.trait) I.push(`Choose which power/quality “${displayName(e.name)}” uses.`);
      if (al.req.fixed && !R.T[al.req.only[0]]) I.push(`“${displayName(e.name)}” requires ${traitName(al.req.only[0])}, which you don't have.`);
      if (e.trait && !R.T[e.trait]) I.push(`“${displayName(e.name)}” uses ${traitName(e.trait)}, which you no longer have.`);
      if (al.req.second && !e.trait2) I.push(`Choose the quality for “${displayName(e.name)}”.`);
      for (const t of choiceTokens(A[e.name] && A[e.name].text)) if (!(e.ch && e.ch[t])) I.push(`Choose [${t}] for “${displayName(e.name)}”.`);
      if (e.trait) used.push(e.trait);
    }
    if (g.diff && new Set(used).size !== used.length) I.push('Each ability must use a different power/quality.');
    const ru = g.rules || {};
    const full = s.length === g.count && used.length === s.length;
    if (full && ru.minDistinct && new Set(used.filter(k => !ru.distinctKind || TRAIT[k].kind === ru.distinctKind)).size < ru.minDistinct) I.push(`Use at least ${ru.minDistinct} different ${ru.distinctKind || 'power/quality'}s across these abilities.`);
    if (full && ru.needs) {
      const fits = (k, n) => (n.any ? expand(n.any).includes(k) : true) && (n.kind ? TRAIT[k].kind === n.kind : true);
      const cover = (i, left) => i === ru.needs.length || left.some((k, j) => fits(k, ru.needs[i]) && cover(i + 1, left.filter((_, x) => x !== j)));
      if (!cover(0, used)) I.push(`These abilities must include: ${ru.needs.map(n => 'one using ' + n.label).join(', and ')}.`);
    }
    if (ru.notGreen) {
      const greens = (st.sel['arch-green'] || []).map(e => e.trait).filter(Boolean);
      for (const e of s) if (e.trait && greens.includes(e.trait)) I.push(`“${displayName(e.name)}” must use a different power or quality than your Green abilities (${traitName(e.trait)} is already used there).`);
    }
    return I;
  }
  const slotIssues = slots => (slots || []).filter(s => !s.key).map(s => `Assign your ${s.die}${s.freed ? ' (freed die)' : ''}.`);
  function principleIssues(slot, cat) {
    const cur = slot === 'bg' ? st.bg.principle : st.arch.principle;
    if (!cur) return [`Choose ${aan(cat)} principle.`];
    const I = [];
    if (cur === 'energy-element' && !st.pch[slot]) I.push('Choose your element for this principle.');
    if (slot === 'arch' && cur === st.bg.principle) I.push('Your two principles must be different.');
    return I;
  }
  const aan = w => (/^[aeiou]/i.test(w) ? 'an ' : 'a ') + w;
  const GROUP_HINT = 'Tick the boxes to choose, then pick which power or quality each ability uses from its drop-down.';

  function sectionsFor(id, R) {
    const S = [];
    const add = (sid, title, issues, hint, extra) => S.push(Object.assign({ id: sid, title, issues: issues || [], hint: hint || '' }, extra || {}));
    const bg = bgDef(), ps = psDef(), ar = archDef(), shape = shapeDef(), pers = persDef();
    const rollSec = (key, title, picked) => {
      if (st.method === 'guided') add('roll', title, st.rolls[key] || picked ? [] : ['Roll the dice.'], 'Press <b>Roll</b>. The highlighted entries are the ones you can pick.');
    };
    const groupSecs = step => groups().filter(g => g.step === step).forEach(g => add('g-' + g.key, g.label, groupIssues(g, R), g.note ? esc(g.note) + ' ' + GROUP_HINT : GROUP_HINT, { group: g }));
    if (id === 'region') {
      add('pick', 'Choose your homeland', st.region ? [] : ['Choose a homeland.'], 'Click the land your champion comes from. Hover a card to preview it.');
    }
    if (id === 'background') {
      rollSec('bg', 'Roll for your Origin', !!bg);
      add('pick', 'Choose your Origin', bg ? [] : ['Choose an Origin.'], 'Click one of the Origins' + (st.method === 'guided' ? ' highlighted by your roll' : '') + '. Hover the <b>i</b> to see what it gives you.');
      const I = bg ? slotIssues(R.slots.bg) : [];
      if (bg && bg.q.mustInclude && !(R.slots.bg || []).some(s => s.key === bg.q.mustInclude)) I.push(`One die must go to ${traitName(bg.q.mustInclude)}.`);
      add('assign', 'Assign your quality dice', I, 'Click a die, then choose the quality it becomes. Bigger dice mean you are better at it.');
      add('principle', `Choose ${bg ? aan(bg.principle) : 'your first'} principle`, bg ? principleIssues('bg', bg.principle) : [], 'Principles are what your champion believes in. Click one — hover to read it in full.');
    }
    if (id === 'powersource') {
      rollSec('ps', 'Roll your Origin dice', !!ps);
      add('pick', 'Choose your Source of Power', ps ? [] : ['Choose a Source of Power.'], 'Click where your champion\'s power comes from. Hover the <b>i</b> for details.');
      const I = ps ? slotIssues(R.slots.ps) : [];
      if (ps && ps.required && !R.T[ps.required.key]) I.push(`One die must go to ${ps.required.label}.`);
      add('assign', 'Assign your power dice', I, 'Click a die, then choose the power it becomes.');
      if (ps && ps.extra) {
        const ex = ps.extra, e = st.ps.extra, X = [];
        if (ex.type === 'addTrait' && !e.key) X.push('Make your choice.');
        if (ex.type === 'alien' && !e.key) X.push('Choose the Void-touched upgrade.');
        if (ex.type === 'cosmos' && (!e.down || !e.up)) X.push('Choose which power to downgrade and which to upgrade.');
        add('extra', 'Special bonus', X, esc(ex.text));
      }
      if (ps) groupSecs('powersource');
      else add('g-ph', 'Choose your abilities', []);
    }
    if (id === 'archetype') {
      rollSec('arch', 'Roll your Source dice', !!ar);
      add('pick', 'Choose your Path', ar ? [] : ['Choose a Path.'], 'Click how your champion fights. <b>Two Souls</b> and <b>Stance Master</b> are advanced options.');
      if (ar && (ar.divided || ar.modular)) {
        if (st.method === 'guided') add('broll', 'Roll for your base Path', st.rolls.base || st.arch.base ? [] : ['Roll the dice.'], 'Press <b>Roll</b> for your base Path.');
        add('base', 'Choose your base Path', shape ? [] : ['Choose the base Path.'], ar.divided ? 'Your second Path provides your dice and abilities.' : 'Your base Path decides how your dice are assigned.');
      }
      const I = [];
      if (shape) {
        I.push(...slotIssues(R.slots.arch));
        if (ps && ps.id === 'training') I.push(...slotIssues(R.slots.training));
        if (shape.req) {
          const cands = expand(shape.req.any);
          if (Object.keys(R.T).filter(k => cands.includes(k)).length < (shape.req.count || 1)) I.push(`You need ${shape.req.label}.`);
        }
        const archSlots = (R.slots.arch || []).filter(s => s.key);
        const powerSlots = archSlots.filter(s => TRAIT[s.key].kind === 'power');
        const reqKeys = shape.req ? expand(shape.req.any) : [];
        const reqIsPower = reqKeys.some(k => TRAIT[k].kind === 'power');
        const reqInStep = reqIsPower ? Math.min(shape.req.count || 1, powerSlots.filter(s => reqKeys.includes(s.key)).length) : 0;
        const nonReq = powerSlots.length - reqInStep;
        const dice = (R.slots.arch || []).length;
        if (shape.remPowers === 'one' && nonReq > 1) I.push('Only one of the remaining dice may go to a power (the rest go to qualities).');
        if (shape.remPowers === 'one' && nonReq < 1 && archSlots.length === dice && dice > 1) I.push('One of the remaining dice must go to a power.');
        if (shape.remPowers === 'oneOrMore' && nonReq < 1 && archSlots.length === dice && dice > 1) I.push('At least one die must go to a power.');
        if (shape.extra && shape.extra.type === 'addTrait' && !st.arch.extra.key) I.push(shape.extra.text);
        if (ar.modular) for (let i = 0; i < (R.modExtra || 0); i++) if (!st.arch.extra['m' + i]) I.push('Add a d6 power (Stance Masters need four powers).');
      }
      add('assign', 'Assign your dice', I, 'Click a die, then choose the power or quality it becomes. Read the rules above the dice — some must go to specific things.');
      if (ar && ar.divided && shape) add('divm', 'Choose your method of transformation', st.arch.divMethod ? [] : ['Choose a method.'], 'How does your champion switch between their two forms?');
      if (shape) groupSecs('archetype');
      else add('g-ph', 'Choose your abilities', []);
      if (shape && shape.minionForms) {
        const M = [];
        if (!st.arch.minionQ) M.push('Choose the quality that sets your number of minion forms.');
        else {
          const max = R.T[st.arch.minionQ] ? dn(R.T[st.arch.minionQ].die) : 0;
          if ((st.arch.minionForms || []).length !== max) M.push(`Choose ${max} minion forms (${(st.arch.minionForms || []).length} chosen).`);
        }
        add('minions', 'Choose your minion forms', M, 'Pick the quality first, then tick as many forms as it allows.');
      }
      if (shape && (shape.forms || ar.modular || ar.divided)) add('notes', `Notes on your ${ar.modular ? 'modes' : 'forms'} (optional)`, [], 'Optional — jot down which powers each form or mode uses.');
      const pc = archPrincipleCat();
      add('principle', pc ? `Choose ${aan(pc)} principle` : 'Choose your second principle', shape && pc ? principleIssues('arch', pc) : [], 'Click a principle — it must be different from your first one.');
    }
    if (id === 'personality') {
      rollSec('pers', 'Roll for your Temperament', !!pers);
      add('pick', 'Choose your Temperament', pers ? [] : ['Choose a Temperament.'], 'Click how your champion behaves under pressure. The three dice are your Green / Yellow / Red status.');
      add('qname', 'Name your Signature Quality', pers && !st.pers.qname.trim() ? ['Type a name for your Signature Quality.'] : [], 'Type a short phrase that sums up your champion, like <em>Last Kinkou of the Eastern Isles</em>.');
      if (pers) {
        const rq = reqFromText(pers.out);
        if (rq.kind !== 'none') add('out', 'Set up your Out ability', st.pers.outTrait ? [] : ['Choose which trait your Out ability uses.'], 'Pick the power or quality used when you\'re knocked out.');
        if (pers.extra === 'impulsive') add('reckless', 'Reckless upgrade', st.pers.upgrade ? [] : ['Choose a power or quality to upgrade.'], 'Pick one trait to raise by one die size.');
      }
    }
    if (id === 'red') {
      const need = 2 + (st.retcon.type === 'extra-red' ? 1 : 0);
      const s = st.sel.red || [];
      const I = [];
      if (s.length !== need) I.push(`Pick ${need} Ultimates (${s.length}/${need} chosen).`);
      for (const e of s) {
        const al = allowedTraits(R, e.name, { cat: e.cat && e.cat.startsWith('X:') ? null : e.cat, use: e.use });
        if (al.req.kind !== 'none' && !e.trait) I.push(`Choose which trait “${displayName(e.name)}” uses.`);
        if (al.req.second && !e.trait2) I.push(`Choose the quality for “${displayName(e.name)}”.`);
        for (const t of choiceTokens(A[e.name] && A[e.name].text)) if (!(e.ch && e.ch[t])) I.push(`Choose [${t}] for “${displayName(e.name)}”.`);
      }
      add('pick', `Choose ${need} Ultimates`, I, 'Only categories marked <b>eligible</b> can be picked — they match powers and qualities you have. Tick ' + need + ' abilities, then choose the trait each one uses.');
    }
    if (id === 'retcon') {
      const rc = st.retcon, I = [];
      add('pick', 'Choose one Twist of Fate', rc.type ? [] : ['Choose one option.'], 'Pick one small tweak to your champion.');
      if ((rc.type === 'swap-powers' || rc.type === 'swap-quals') && (!rc.a || !rc.b || rc.a === rc.b)) I.push('Pick two different traits to swap.');
      if (rc.type === 'add-d6' && !rc.key) I.push('Pick the new d6 power or quality.');
      if (rc.type === 'change-principle' && (!rc.which || !rc.principle)) I.push('Pick which principle to change and its replacement.');
      if (rc.type === 'red-up' && pers && pers.status[2] === 'd12') I.push('Your Red status die is already d12 — pick another option.');
      if (rc.type === 'extra-red' && (st.sel.red || []).length < 3) I.push('Go back to Ultimates and pick your third Red ability.');
      add('cfg', 'Set it up', I, 'Complete the choice for your Twist of Fate.');
    }
    if (id === 'health') add('review', 'Review your Health', [], 'Pick the trait that adds to your Health and whether to roll.');
    if (id === 'finish') {
      add('name', 'Name your champion', st.info.name.trim() ? [] : ['Type your champion\'s name.'], 'Type a hero name — you can fill in the rest below at your own pace.');
      add('describe', 'Describe them (optional)', [], 'Optional details for your hero sheet.');
      add('abilities', 'Name your abilities (optional)', [], 'Optional — give your abilities Runeterran names.');
      add('gear', 'Name your gear & gifts (optional)', [], 'Optional — rename your Signature Weapon, powers and so on.');
    }
    return S;
  }
  function stepIssues(id, R) { return sectionsFor(id, R).flatMap(s => s.issues); }
  function archPrincipleCat() {
    const ar = archDef();
    if (!ar) return null;
    if (ar.divided) return 'Responsibility';
    if (ar.modular) { const s = shapeDef(); return s ? s.principle : null; }
    return ar.principle;
  }

  // ------------------------------------------------------------------ steps
  const STEPS = [
    { id: 'intro', name: 'Welcome', sub: 'How it works' },
    { id: 'region', name: 'Homeland', sub: 'Runeterra flavour' },
    { id: 'background', name: 'Origin', sub: 'Sentinels: Background' },
    { id: 'powersource', name: 'Source of Power', sub: 'Sentinels: Power Source' },
    { id: 'archetype', name: 'Path', sub: 'Sentinels: Archetype' },
    { id: 'personality', name: 'Temperament', sub: 'Sentinels: Personality' },
    { id: 'red', name: 'Ultimates', sub: 'Sentinels: Red Abilities' },
    { id: 'retcon', name: 'Twist of Fate', sub: 'Sentinels: Retcon' },
    { id: 'health', name: 'Health', sub: 'Sentinels: Health' },
    { id: 'finish', name: 'Legend', sub: 'Finishing Touches & Sheet' }
  ];

  // ------------------------------------------------------------------ rendering: shared widgets
  let R0 = compute();

  function rollerHtml(key, sizes, label) {
    if (st.method !== 'guided') return `<div class="roller"><span>${esc(label)}</span><span class="muted">Constructed method: pick whichever entry fits your concept. The dice ${sizes.map(d => die(d)).join('')} still matter for what you assign.</span></div>`;
    const r = st.rolls[key];
    const re = st.rerolls[key] || 0;
    let res = '';
    if (r) {
      const valid = validFrom(r);
      res = `<div class="results">${r.map((v, i) => `<span class="rolled">${die(sizes[i] || 'd10')}<span class="val">${v}</span></span>`).join('')}</div>` +
        `<div class="valid-list">You may choose: <b>${[...valid].sort((a, b) => a - b).join(', ')}</b> <small>(any single die, or the sum of any two)</small></div>`;
    }
    return `<div class="roller"><span${tip('<h5>Guided method</h5>Roll the listed dice. You may pick the table entry equal to any single die <b>or</b> the sum of any two dice. If nothing fits your idea, you may re-roll once per step. Only the die <b>sizes</b> carry on to your powers/qualities — not the numbers.')} class="term">${esc(label)}</span> ` +
      (r ? '' : `<button class="btn primary" data-act="roll" data-key="${key}" data-sizes="${sizes.join(',')}">Roll ${sizes.map(d => die(d, 'sm')).join('')}</button>`) + res +
      (r && re < 1 ? `<button class="btn small" data-act="roll" data-key="${key}" data-sizes="${sizes.join(',')}" data-re="1">Re-roll (once)</button>` : '') +
      (r && re >= 1 ? '<small class="muted">Re-roll used.</small>' : '') + '</div>';
  }
  function validFrom(vals) {
    const s = new Set(vals);
    for (let i = 0; i < vals.length; i++) for (let j = i + 1; j < vals.length; j++) s.add(vals[i] + vals[j]);
    return s;
  }
  function isValid(key, n) {
    if (st.method !== 'guided') return null;
    const r = st.rolls[key];
    if (!r) return null;
    return validFrom(r).has(n);
  }

  function cardsHtml(list, kind, selId, rollKey, renderer) {
    return `<div class="cards">${list.map(it => {
      const v = rollKey ? isValid(rollKey, it.n) : null;
      const cls = ['card', it.id === selId ? 'selected' : '', v === true ? 'valid' : '', v === false && it.id !== selId ? 'invalid' : ''].join(' ');
      return `<button class="${cls}" data-act="pick" data-kind="${kind}" data-id="${it.id}"${v === false ? ' data-locked="1"' : ''}${it.id === selId ? ' aria-pressed="true"' : ''}>${renderer(it)}</button>`;
    }).join('')}</div>`;
  }
  const fitMark = (arr, id) => {
    const r = regionDef();
    return r && arr && r[arr] && r[arr].includes(id) ? `<span class="fit"${tip(`Suits a champion from ${esc(r.name)}`)}>${ico('mark')}${esc(r.name)}</span>` : '';
  };

  function assignHtml(slots, optionKeys, before, stepPrefix, label) {
    if (!slots || !slots.length) return '';
    const rows = slots.map(s => {
      const takenBy = k => { const o = slots.find(x => x !== s && x.key === k); return o ? `on your ${o.die}` : ''; };
      const groups = traitGroups(optionKeys, k => traitItem(k, { after: before[k] ? `have ${before[k].die}` : '', taken: takenBy(k) }));
      let note = '';
      if (s.key) note = s.upgrade ? `Already had ${traitName(s.key)} at ${s.upgrade.from}: it becomes ${s.upgrade.to} and the other die is freed below.` : '';
      if (s.freed) note = note || `Freed die from ${traitName(s.from)} (“I've already got that” rule).`;
      return socket({ bind: `${stepPrefix}.assign.${s.id}`, d: s.die, cur: s.key, groups, empty: `Bind this ${s.die} to a trait`, note, freed: s.freed });
    }).join('');
    return `<div class="assign"><div class="muted"${tip('<h5>Assigning dice</h5>Only the die <b>size</b> matters. Each die becomes the rating of one power or quality. If you pick something you already have, the bigger die is kept and the smaller one is freed to assign elsewhere in the same step (the rulebook\'s <em>“I\'ve Already Got That”</em> rule).')}>${label} <span class="term info-mark">${ico('info')}</span></div>${rows}</div>`;
  }

  function abilityCard(g, name, entry, picked, R, ctx = {}) {
    const ab = A[name];
    if (!ab) return `<div class="ab">Unknown ability ${esc(name)}</div>`;
    const color = ctx.color || g.color;
    const al = allowedTraits(R, name, ctx);
    const reqFixed = al.req.fixed ? al.req.only[0] : null;
    const unavailable = reqFixed && !R.T[reqFixed];
    const orig = displayName(name);
    const mode = g.modes ? g.modes.find(m => m.name === name) : null;
    let cfg = '';
    if (picked && entry) {
      const idx = ctx.idx;
      const base = ctx.bind || `sel.${g.key}.${idx}`;
      if (al.req.kind !== 'none' && !reqFixed) {
        cfg += `<label>Uses ${al.req.kind === 'any' ? 'power or quality' : al.req.cat ? catName(al.req.cat) + ' ' + al.req.kind : al.req.kind}${ctx.cat ? ' (' + esc(catName(ctx.cat)) + ')' : ''}<select data-bind="${base}.trait">${traitOptions(al.keys, entry.trait)}</select></label>`;
        if (!al.keys.length) cfg += '<small class="muted">You have no eligible trait yet.</small>';
      }
      if (reqFixed) cfg += `<small class="muted">Uses ${esc(traitName(reqFixed))}${unavailable ? ' — which you don\'t have!' : ''}</small>`;
      if (al.keys2) cfg += `<label>Quality<select data-bind="${base}.trait2">${traitOptions(al.keys2, entry.trait2)}</select></label>`;
      for (const t of choiceTokens(ab.text)) {
        const kind = CHOICE_TOKENS[t];
        const cur = (entry.ch || {})[t] || '';
        if (kind === 'element') {
          const els = CATS['P:elemental'].items.map(i => i[2] + ' (' + i[1] + ')');
          cfg += `<label>[${esc(t)}]<select data-bind="${base}.ch.${t}"><option value="">— choose —</option>${els.map(x => `<option${x === cur ? ' selected' : ''}>${esc(x)}</option>`).join('')}</select></label>`;
        } else if (Array.isArray(kind)) {
          cfg += `<label>[${esc(t)}]<select data-bind="${base}.ch.${t}"><option value="">— choose —</option>${kind.map(x => `<option${x === cur ? ' selected' : ''}>${x}</option>`).join('')}</select></label>`;
        } else {
          cfg += `<label>[${esc(t)}]<input type="text" data-bind="${base}.ch.${t}" value="${esc(cur)}" placeholder="e.g. Attack and Overcome"></label>`;
        }
      }
    }
    const typeTip = `<h5>Type: ${ab.type}</h5>${window.ABILITY_TYPES[ab.type] || ''}`;
    const colorTip = `<h5>${color[0].toUpperCase() + color.slice(1)} ability</h5>${window.COLOR_INFO[color] || ''}`;
    const inputType = g.count === 1 && !g.fixed ? 'radio' : 'checkbox';
    const control = g.fixed ? '' : `<input type="checkbox" data-act="toggleAb" data-g="${g.key}" data-name="${esc(name)}"${ctx.cat ? ` data-cat="${esc(ctx.cat)}"` : ''}${picked ? ' checked' : ''}${unavailable ? ' disabled' : ''} aria-label="${inputType === 'radio' ? 'Select' : 'Toggle'} ${esc(orig)}">`;
    return `<div class="ab ${color}${picked ? ' picked' : ''}${unavailable ? ' disabled' : ''}">` +
      `<div class="ab-top">${control}<span class="ab-name">${esc(orig)}</span><span class="pill ${color}"${tip(colorTip)}>${color}</span><span class="ab-type"${tip(typeTip)}>${ab.type}</span></div>` +
      (mode ? `<div class="ab-text"><em>Mode:</em> ${esc(mode.text)}</div>` : '') +
      `<div class="ab-text">${rulesText(ab.text, picked ? entry : null)}</div>` +
      (cfg ? `<div class="ab-cfg">${cfg}</div>` : '') + '</div>';
  }

  function groupHtml(g, R, bare) {
    const s = selOf(g);
    return `<div class="${bare ? '' : 'subsec'}">${bare ? '' : `<h4>${esc(g.label)}</h4>`}${g.note ? `<p class="muted">${esc(g.note)}</p>` : ''}${!g.fixed ? `<p class="count-line"><b>${s.length}/${g.count}</b> chosen</p>` : ''}<div class="ab-list">` +
      g.list.map(n => {
        const i = s.findIndex(e => e.name === n);
        return abilityCard(g, n, s[i], i >= 0, R, { idx: i, powersOnly: g.powersOnly, use: groupUse(g, R) });
      }).join('') + '</div></div>';
  }

  function principleHtml(slot, cat, R) {
    const cur = slot === 'bg' ? st.bg.principle : st.arch.principle;
    const other = slot === 'bg' ? st.arch.principle : st.bg.principle;
    const list = PRINCIPLES.filter(p => p.cat === cat);
    const pc = window.PRINCIPLE_CATEGORIES[cat] || '';
    const r = regionDef();
    const items = list.map(p => {
      const lore = window.PRINCIPLE_LORE[p.id] || [p.name, ''];
      const t = `<h5>${esc(lore[0])}</h5><div class="sc-line">Sentinels: ${esc(p.name)} · ${esc(p.cat)}</div>` +
        `<b>During roleplaying:</b> ${esc(p.rp)}<hr><b>Minor twist:</b> ${esc(p.minor)}<br><b>Major twist:</b> ${esc(p.major)}<hr>` +
        `<b>Green ability (${p.type}):</b> ${esc(p.ability)}` + (lore[1] ? `<hr><em>In Runeterra:</em> ${esc(lore[1])}` : '');
      const fits = r && r.pr.includes(p.id) ? ` <span class="fit-inline">${ico('mark')}${esc(r.name)}</span>` : '';
      return `<button class="principle${p.id === cur ? ' selected' : ''}${p.id === other ? ' taken' : ''}" data-act="principle" data-slot="${slot}" data-id="${p.id}"${tip(t)}${p.id === other ? ' disabled' : ''}>` +
        `<div class="pn">${esc(lore[0])}${fits}</div><div class="po">${esc(p.name)}</div><div class="ph">${esc(lore[1])}</div></button>`;
    }).join('');
    let detail = '';
    const p = PRINCIPLES.find(x => x.id === cur);
    if (p) {
      const needsEl = p.id === 'energy-element';
      detail = `<div class="detail"><h4>${esc((window.PRINCIPLE_LORE[p.id] || [p.name])[0])}</h4>` +
        `<p><b>During roleplaying:</b> ${esc(p.rp)}</p><p><b>Minor twist:</b> <em>${esc(p.minor)}</em><br><b>Major twist:</b> <em>${esc(p.major)}</em></p>` +
        `<div class="ab green picked"><div class="ab-top"><span class="ab-name">${esc(p.name)}</span><span class="pill green">green</span><span class="ab-type"${tip(`<h5>Type: ${p.type}</h5>${window.ABILITY_TYPES[p.type]}`)}>${p.type}</span></div><div class="ab-text">${rulesText(p.ability, { ch: { 'energy/element': st.pch[slot] } })}</div></div>` +
        (needsEl ? `<label class="field"><span>Your element</span><select data-bind="pch.${slot}"><option value="">— choose —</option>${CATS['P:elemental'].items.map(i => `<option${st.pch[slot] === i[2] ? ' selected' : ''}>${esc(i[2])}</option>`).join('')}</select></label>` : '') +
        '<small class="muted">The twist questions are prompts the GM may ask when a twist happens. Record the questions, not answers.</small></div>';
    }
    const intro = `<p class="muted"${tip(`<h5>${esc(cat)} principles</h5>${esc(pc)}<hr>Each principle gives roleplaying guidance, a Minor and Major twist question, and a Green ability that earns hero points for the whole team.`)}>${esc(pc)} <span class="term info-mark">${ico('info')}</span></p>`;
    const key = 'pr-' + slot;
    if (p && !ui.expand[key]) return `<div class="picked-bar"><span>Chosen: <b>${esc((window.PRINCIPLE_LORE[p.id] || [p.name])[0])}</b></span><button class="btn small" data-act="expand" data-key="${key}">Change</button></div>${detail}`;
    return intro + (p ? `<div class="picked-bar muted-bar"><span>Pick a different principle below, or</span><button class="btn small" data-act="collapse" data-key="${key}">Keep current choice</button></div>` : '') + `<div class="principles">${items}</div>${detail}`;
  }



  // ------------------------------------------------------------------ rendering: steps
  function renderIntro() {
    const chapters = [
      ['Homeland', 'The land that shaped you', ''],
      ['Origin', 'Where you came from', 'Background'],
      ['Source of Power', 'What changed you', 'Power Source'],
      ['Path', 'How you fight', 'Archetype'],
      ['Temperament', 'How you face pressure', 'Personality'],
      ['Ultimates', 'What you unleash when all is lost', 'Red Abilities'],
      ['Twist of Fate', 'One last tweak', 'Retcon'],
      ['Health', 'How much you can endure', 'Health'],
      ['Legend', 'Your name and your sheet', 'Finishing Touches']
    ];
    return `<div class="panel title-page">
      <section class="tp-main">
        <div class="tp-kicker">A codex for the Sentinels roleplaying system</div>
        <h2 class="tp-title">Forge a Champion <span>of Runeterra</span></h2>
        <p class="tp-lede">Nine chapters take you from a nameless wanderer to a champion ready for the table — where you were born, what gave you power, how you fight, and what you will become when everything is on the line.</p>
        <p class="tp-note">Every Runeterran name hides the rule behind it: <span class="term"${tip('<h5>Hover and learn</h5>Anything underlined like this explains itself. Runeterra names show the Sentinels RPG rule they stand for.')}>hover anything underlined</span>. New to the world? Read the <a href="#" data-act="lore">${ico('map')} lore</a>. New to the rules? Open the <a href="#" data-act="rules">${ico('codex')} cheat sheet</a> (<kbd>?</kbd>).</p>
        <div class="tp-method">
          <div class="tp-method-l">Choose how fate is decided</div>
          <div class="tp-options" role="radiogroup" aria-label="Creation method">
            <button class="tp-option${st.method === 'guided' ? ' on' : ''}" role="radio" aria-checked="${st.method === 'guided'}" data-act="method" data-m="guided"><span class="tp-o-t">Guided</span><span class="tp-o-d">Roll the dice at every chapter and choose among the paths they open. Let the Runes decide.</span></button>
            <button class="tp-option${st.method === 'constructed' ? ' on' : ''}" role="radio" aria-checked="${st.method === 'constructed'}" data-act="method" data-m="constructed"><span class="tp-o-t">Constructed</span><span class="tp-o-d">Pick freely to build the champion you already imagine. Same dice, your choice.</span></button>
          </div>
          <p class="tp-small">You can switch at any time. Progress is kept in this browser.</p>
        </div>
        <div class="step-footer tp-footer"><span></span><div class="next-wrap"><button class="btn primary" data-act="next"><span class="btn-kicker">Chapter I</span>Begin the chronicle ${ico('next')}</button></div></div>
      </section>
      <aside class="tp-aside">
        <div class="tp-aside-h">The Chapters</div>
        <ol class="tp-chapters">${chapters.map((c, i) => `<li><span class="tp-n">${ROMAN[i + 1]}</span><span class="tp-c"><b>${c[0]}</b><span>${c[1]}</span></span>${c[2] ? `<span class="tp-sc">${c[2]}</span>` : ''}</li>`).join('')}</ol>
        <div class="tp-dice">
          <div class="tp-aside-h">How a roll works</div>
          <p>Every action rolls <b>three dice</b> — a <span class="term"${tip('<h5>Powers</h5>Exceptional traits — magic, Hextech, Ascended strength. Rated d6 (above average) to d12 (godlike).')}>power</span>, a <span class="term"${tip('<h5>Qualities</h5>Learned skills and knowledge. Rated d6 (solid competency) to d12 (world class).')}>quality</span> and your <span class="term"${tip(window.GLOSSARY['status die'])}>status</span> — sorted into ${rulesText('Min die, Mid die and Max die')}.</p>
          <div class="tp-dice-row">${['d4', 'd6', 'd8', 'd10', 'd12'].map(d => die(d)).join('')}</div>
          <p>As ${rulesText('Health')} falls you pass from the ${rulesText('Green zone')} to the ${rulesText('Yellow zone')} and ${rulesText('Red zone')}, unlocking stronger abilities.</p>
        </div>
      </aside>
    </div>`;
  }


  // ------------------------------------------------------------------ art-direction helpers
  const ROMAN = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI', 'XVII', 'XVIII', 'XIX', 'XX'];
  const ico = (n, c) => (window.ICO ? window.ICO(n, c) : '');
  const sigil = (id, c) => (window.SIGIL ? window.SIGIL(id, c) : '');
  const pad2 = n => String(n).padStart(2, '0');

  // ------------------------------------------------------------------ die sockets (replace die-choice drop-downs)
  // A socket is one die waiting for a trait. Its tray lists the candidates grouped by category.
  // Only one tray is open at a time: the one the player opened, else the first empty socket.
  let socketAuto = false;           // set once per render when an empty socket has claimed the auto-open
  const traitGroups = (keys, item) => {
    const G = {};
    for (const k of keys) { const c = TRAIT[k].cat; (G[c] = G[c] || []).push(item(k)); }
    return Object.entries(G).map(([c, items]) => ({ label: catName(c), sub: CATS[c] ? `${catSc(c)} ${CATS[c].kind === 'quality' ? 'qualities' : 'powers'}` : catSc(c), items }));
  };
  const traitItem = (k, extra = {}) => ({ k, name: traitName(k), sub: TRAIT[k].rt !== TRAIT[k].sc ? TRAIT[k].sc : '', ...extra });
  function socket({ bind, d, mark, cur, groups, empty, note, freed }) {
    const all = groups.flatMap(g => g.items);
    const curItem = all.find(i => i.k === cur);
    let open = ui.socket === bind;
    if (!open && !cur && ui.socket == null && !socketAuto) { open = socketAuto = true; }
    const gem = d ? die(d) : `<span class="sock-mark">${esc(mark || '')}</span>`;
    const face = curItem
      ? `<span class="sock-name">${esc(curItem.name)}</span><span class="sock-cat">${esc(TRAIT[cur] ? catName(TRAIT[cur].cat) : '')}${curItem.after ? ` · ${esc(curItem.after)}` : ''}</span>`
      : `<span class="sock-empty">${esc(empty || 'Choose')}</span>`;
    const filter = all.length > 12 ? `<label class="tray-filter">${ico('mark')}<input type="search" data-filter="1" placeholder="Filter ${all.length} options…" aria-label="Filter options"></label>` : '';
    const tray = open ? `<div class="tray" role="group" aria-label="${esc(empty || 'Options')}">${filter}${groups.map(g => `<div class="tray-group"><div class="tray-label">${esc(g.label)}${g.sub ? `<span>${esc(g.sub)}</span>` : ''}</div><div class="tray-grid">${g.items.map(i => {
      const on = i.k === cur, off = !!i.taken && !on;
      return `<button class="rune${on ? ' on' : ''}${off ? ' off' : ''}" data-act="socket" data-bind="${bind}" data-val="${i.k}" data-q="${esc((i.name + ' ' + (i.sub || '') + ' ' + g.label).toLowerCase())}"${off ? ' aria-disabled="true"' : ''}${on ? ' aria-pressed="true"' : ''}${tip(traitTip(i.k))}>
        <span class="rune-name">${esc(i.name)}</span>${i.sub ? `<span class="rune-sub">${esc(i.sub)}</span>` : ''}${i.after ? `<span class="rune-badge">${esc(i.after)}</span>` : ''}${off ? `<span class="rune-badge taken">${esc(i.taken)}</span>` : ''}</button>`;
    }).join('')}</div></div>`).join('')}${cur ? `<button class="linkbtn tray-clear" data-act="socket" data-bind="${bind}" data-val="">Unbind this die</button>` : ''}</div>` : '';
    return `<div class="socket${cur ? ' filled' : ''}${open ? ' open' : ''}${freed ? ' freed' : ''}">
      <div class="sock-row">${gem}<span class="sock-link" aria-hidden="true"></span>
      <button class="sock-slot" data-act="socketOpen" data-bind="${bind}" aria-expanded="${open}">${face}<span class="sock-cta">${open ? 'Close' : cur ? 'Change' : 'Choose'}</span></button>
      ${cur && TRAIT[cur] ? `<span class="term info-mark"${tip(traitTip(cur))}>${ico('info')}</span>` : ''}</div>
      ${note ? `<div class="note">${esc(note)}</div>` : ''}${tray}</div>`;
  }

  // ------------------------------------------------------------------ guided flow
  const ui = { expand: {} };        // transient: which collapsed choice grids are re-opened
  let flowCurrent = null;           // "step:section" of the section the user should work on now

  // Renders a step's sections in order. Sections after the first unfinished one are locked.
  function flowHtml(stepId, secs, H) {
    let cur = -1;
    const n = secs.length;
    const parts = secs.map((s, i) => {
      const done = !s.issues.length;
      const state = cur >= 0 ? 'locked' : done ? 'done' : 'current';
      if (state === 'current') cur = i;
      const head = `<div class="flow-head"><span class="flow-num">${state === 'done' ? ico('check') : state === 'locked' ? ico('lock') : i + 1}</span><h3>${esc(s.title)}</h3>` +
        (state === 'current' ? '<span class="flow-here">You are here</span>' : '') +
        (state === 'done' ? '<span class="flow-state">Done</span>' : '') +
        (state === 'locked' ? '<span class="flow-lock">Sealed — finish the step above</span>' : '') + '</div>';
      if (state === 'locked') return `<section class="flow-sec locked">${head}</section>`;
      const fn = H[s.id] || (s.group && H.group) || null;
      const body = fn ? fn(s) : '';
      const todo = state === 'current' && s.issues.length ? `<div class="flow-todo"><span class="flow-todo-l">Still to do</span><ul>${s.issues.map(x => `<li>${esc(x)}</li>`).join('')}</ul></div>` : '';
      return `<section class="flow-sec ${state}" id="flow-${stepId}-${s.id}">${head}<div class="flow-body">${body}${todo}</div></section>`;
    });
    flowCurrent = cur >= 0 ? `${stepId}:${secs[cur].id}` : `${stepId}:done`;
    const idx = STEPS.findIndex(x => x.id === stepId);
    const next = STEPS[idx + 1];
    const guide = cur >= 0
      ? `<div class="guide"><span class="guide-label">Now</span><div class="guide-text"><b>${esc(secs[cur].title)}.</b> <span>${secs[cur].hint}</span></div><span class="guide-count">${cur + 1}<i>/</i>${n}</span><button class="linkbtn" data-act="jump" data-target="flow-${stepId}-${secs[cur].id}">Show me</button></div>`
      : `<div class="guide done"><span class="guide-label">${ico('check')}</span><div class="guide-text"><b>This chapter is complete.</b> ${next ? `Continue to <b>${esc(next.name)}</b> when you are ready.` : ''}</div><span class="guide-count">${n}<i>/</i>${n}</span></div>`;
    return guide + parts.join('');
  }

  // Collapsible choice grid: once something is chosen, show a compact summary with a Change button.
  function pickSection(key, chosenHtml, gridHtml) {
    if (chosenHtml && !ui.expand[key]) return `<div class="picked-bar">${chosenHtml}<button class="linkbtn" data-act="expand" data-key="${key}">Change</button></div>`;
    return (chosenHtml ? `<div class="picked-bar muted-bar"><span>Pick a different option below, or</span><button class="linkbtn" data-act="collapse" data-key="${key}">keep the current choice</button></div>` : '') + gridHtml;
  }
  const chosenSummary = (title, sc, lore, champs, extra = '') => `<div class="chosen"><div class="chosen-sc">Sentinels · ${esc(sc)}</div><div class="chosen-t">${esc(title)}</div>${lore ? `<p class="lore">${esc(lore)}</p>` : ''}${champs ? `<p class="champs"><span>Champions</span> ${esc(champs)}</p>` : ''}${extra}</div>`;

  function bgTip(b) {
    return `<h5>${esc(b.rt)}</h5><div class="sc-line">Sentinels: ${esc(b.sc)} background</div>${esc(b.lore)}<hr>` +
      `<b>Qualities:</b> assign ${b.q.dice.map(d => d).join(' + ')} to ${b.q.count || 2} of: ${esc(b.q.opts.map(o => o.includes(':') ? 'any ' + CATS[o].sc : TRAIT[o].sc).join(', '))}` +
      `<br><b>Principle:</b> ${esc(b.principle)}<br><b>Power Source dice:</b> ${b.psDice.join(' ')}<hr><small>Champions: ${esc(b.champs)}</small>`;
  }
  function psTip(p) {
    return `<h5>${esc(p.rt)}</h5><div class="sc-line">Sentinels: ${esc(p.sc)} power source</div>${esc(p.lore)}<hr>` +
      `<b>Powers:</b> ${esc(p.opts.map(o => o.includes(':') ? 'any ' + CATS[o].sc : TRAIT[o].sc).join(', '))}` +
      (p.required ? `<br><b>Required:</b> one die to ${esc(TRAIT[p.required.key].sc)}` : '') +
      `<br><b>Yellow (choose 2):</b> ${esc(p.yellow.list.map(displayName).join(', '))}` +
      (p.green ? `<br><b>Green (choose 1):</b> ${esc(p.green.list.join(', '))}` : `<br><b>Instead of Green:</b> ${esc(p.extra.text)}`) +
      `<br><b>Path dice:</b> ${p.archDice.join(' ')}<hr><small>Champions: ${esc(p.champs)}</small>`;
  }
  function archTip(a) {
    if (a.advanced) return `<h5>${esc(a.rt)}</h5><div class="sc-line">Sentinels: ${esc(a.sc)} archetype (advanced)</div>${esc(a.lore)}<hr>${a.divided ? 'Pick a second Path as your base; you gain a civilian and a heroic form plus a transformation method. Principle: Responsibility.' : 'Pick a base Path for your dice, but instead of its abilities you gain switchable modes (Green, Yellow and Red). Principle: from the base Path.'}<hr><small>Champions: ${esc(a.champs)}</small>`;
    return `<h5>${esc(a.rt)} <small>(${esc(a.role)})</small></h5><div class="sc-line">Sentinels: ${esc(a.sc)} archetype</div>${esc(a.lore)}<hr>` +
      (a.req ? `<b>Required:</b> ${esc(a.req.label)}<br>` : '') +
      `<b>Powers:</b> ${esc(a.powers.map(o => o.includes(':') ? 'any ' + CATS[o].sc : TRAIT[o].sc).join(', '))}<br><b>Qualities:</b> ${esc(a.quals.map(o => o.includes(':') ? 'any ' + CATS[o].sc : TRAIT[o].sc).join(', '))}` +
      `<br><b>Green:</b> ${esc((a.fixedGreen || []).concat(a.green.list).join(', '))}` +
      (a.yellow ? `<br><b>Yellow:</b> ${esc(a.yellow.fromGreen ? 'one of the Green list' : a.yellow.list.join(', '))}` : '') +
      `<br><b>Principle:</b> ${esc(a.principle)}<hr><small>Champions: ${esc(a.champs)}</small>`;
  }
  const chapterHead = (title, withMethod) => {
    const i = stepIndex(st.step);
    const sub = (STEPS[i].sub || '').replace('Sentinels: ', '');
    return `<header class="chapter"><div class="chapter-num" aria-hidden="true">${ROMAN[i]}</div>
      <div class="chapter-titles"><div class="chapter-kicker">Chapter ${ROMAN[i]} <span>of IX</span>${STEPS[i].sub.startsWith('Sentinels') ? `<span class="sc-tag">Sentinels · ${esc(sub)}</span>` : ''}</div><h2 class="chapter-title">${esc(title)}</h2></div>
      ${withMethod ? methodToggle() : ''}</header>`;
  };
  const stepPanel = (eyebrow, title, introKey, body, withMethod) => `<div class="panel">${chapterHead(title, withMethod)}
      <p class="chapter-lede">${window.STEP_INTROS[introKey]}</p>${body}${navFooter()}</div>`;

  function renderRegion() {
    const r = regionDef();
    const names = (list, arr) => arr.map(id => { const x = byId(list, id); return x ? x.rt : id; }).join(', ');
    const H = {
      pick: () => pickSection('region', r && `<div class="chosen chosen-region" style="--rc:${r.color}">${sigil(r.id, 'chosen-sigil')}<div class="chosen-sc">Homeland</div><div class="chosen-t">${esc(r.name)}</div><p class="lore">${esc(r.lore)}</p>${window.LORE_FOR_REGION && window.LORE_FOR_REGION[r.id] ? `<p class="lore-link"><a href="#" data-act="lore" data-section="${window.LORE_FOR_REGION[r.id]}">${ico('map')} Read the full lore of ${esc(r.name)}</a></p>` : ''}
          <p class="champs"><b>Champions:</b> ${esc(r.champs)}</p>
          <div class="grid3"><div><h4>Fitting Origins</h4><small>${esc(names(window.BACKGROUNDS, r.bg))}</small></div><div><h4>Fitting Sources</h4><small>${esc(names(window.POWER_SOURCES, r.ps))}</small></div><div><h4>Fitting Principles</h4><small>${esc(r.pr.map(id => (window.PRINCIPLE_LORE[id] || [id])[0]).join(', '))}</small></div></div>
          <p class="sc">No rules effect. Options marked ${ico('mark')} <b>${esc(r.name)}</b> in later steps are only suggestions.</p></div>`,
        `<p class="muted">New to Runeterra? Read the <a href="#" data-act="lore" data-section="lore-planet">world lore</a> first.</p><div class="cards regions">${window.REGIONS.map(x => `<button class="card region-card${x.id === st.region ? ' selected' : ''}" style="--rc:${x.color}" data-act="pick" data-kind="region" data-id="${x.id}"${tip(`<h5>${esc(x.name)}</h5>${esc(x.lore)}<hr><small>${esc(x.champs)}</small>`)}>${sigil(x.id)}<div class="t">${esc(x.name)}</div><div class="d">${esc(x.tag)}</div></button>`).join('')}</div>`)
    };
    return stepPanel('Step 1 · Runeterra', 'Homeland', 'region', flowHtml('region', sectionsFor('region', R0), H), false);
  }

  function renderBackground() {
    const R = R0, b = bgDef();
    const H = {
      roll: () => rollerHtml('bg', ['d10', 'd10'], 'Roll 2d10 for your Origin'),
      pick: () => pickSection('bg', b && chosenSummary(b.rt, b.sc, b.lore, b.champs),
        (st.method !== 'guided' ? '' : '<p class="muted">Highlighted cards match your roll.</p>') + cardsHtml(window.BACKGROUNDS, 'bg', st.bg.id, 'bg', x => `<span class="n">${pad2(x.n)}</span><div class="t">${esc(x.rt)}</div><div class="s">${esc(x.sc)}</div><div class="d">${esc(x.sub)}</div>${fitMark('bg', x.id)}<span class="info" aria-label="Details"${tip(bgTip(x))}>${ico('info')}</span>`)),
      assign: () => `<p>Assign ${b.q.dice.map(d => die(d)).join(' ')} to ${b.q.count || 2} of: ${optsText(b.q.opts)}.${b.q.mustInclude ? ` One die <b>must</b> go to ${traitSpan(b.q.mustInclude)}.` : ''}</p>${assignHtml(R.slots.bg, expand(b.q.opts), R.before.background, 'bg', 'Assign each die to a quality:')}`,
      principle: () => principleHtml('bg', b.principle, R) + `<p class="muted" style="margin-top:10px">Next step: your Source of Power, rolled with ${b.psDice.map(d => die(d, 'sm')).join('')}.</p>`
    };
    return stepPanel('Step 2 · Sentinels: Background', 'Origin', 'background', flowHtml('background', sectionsFor('background', R), H), true);
  }

  function psExtraBody(p, R) {
    const ex = p.extra, e = st.ps.extra;
    if (ex.type === 'addTrait') {
      let keys = expand(ex.opts);
      if (ex.notInOpts) { const skip = expand(p.opts); keys = keys.filter(k => !skip.includes(k)); }
      return `<p>${esc(ex.text)}</p>${socket({ bind: 'ps.extra.key', d: ex.die, cur: e.key, groups: traitGroups(keys, k => traitItem(k)), empty: `Bind this ${ex.die} to a trait` })}`;
    }
    if (ex.type === 'alien') {
      const B = Object.values(R.before.psExtra || {});
      if (B.some(t => t.die === 'd6' && TRAIT[t.key].kind === 'power')) {
        const cands = sortTraits(B.filter(t => t.die === 'd6')).map(t => t.key);
        return `<p>${esc(ex.text)}</p>${socket({ bind: 'ps.extra.key', d: 'd8', cur: e.key, groups: traitGroups(cands, k => traitItem(k, { after: 'd6 → d8' })), empty: 'Raise which d6 to d8?' })}`;
      }
      const keys = expand(p.opts).filter(k => !(R.before.psExtra || {})[k]);
      return `<p>${esc(ex.text)}</p><p class="muted">You have no d6 powers, so instead add a new power from the list at d6.</p>${socket({ bind: 'ps.extra.key', d: 'd6', cur: e.key, groups: traitGroups(keys, k => traitItem(k)), empty: 'Bind this d6 to a new power' })}`;
    }
    const pw = Object.values(R.before.psExtra || {}).filter(t => TRAIT[t.key].kind === 'power');
    const downs = sortTraits(pw.filter(t => dn(t.die) >= 8));
    const ups = sortTraits(pw.filter(t => dn(t.die) <= 10 && t.key !== e.down));
    return `<p>${esc(ex.text)}</p>${socket({ bind: 'ps.extra.down', mark: '−1', cur: e.down, groups: traitGroups(downs.map(t => t.key), k => traitItem(k, { after: `${pw.find(t => t.key === k).die} → ${upDie(pw.find(t => t.key === k).die, -1)}` })), empty: 'Shrink one power by a size' })}` +
      `${socket({ bind: 'ps.extra.up', mark: '+1', cur: e.up, groups: traitGroups(ups.map(t => t.key), k => traitItem(k, { after: `${pw.find(t => t.key === k).die} → ${upDie(pw.find(t => t.key === k).die)}` })), empty: 'Grow one power by a size' })}`;
  }

  function renderPowerSource() {
    const R = R0, b = bgDef(), p = psDef();
    if (!b) return lockedPanel('Source of Power', 'Choose your Origin first — it gives the dice you roll here.', 'background');
    const H = {
      roll: () => rollerHtml('ps', b.psDice, 'Roll your Origin dice'),
      pick: () => pickSection('ps', p && chosenSummary(p.rt, p.sc, p.lore, p.champs),
        cardsHtml(window.POWER_SOURCES, 'ps', st.ps.id, 'ps', x => `<span class="n">${pad2(x.n)}</span><div class="t">${esc(x.rt)}</div><div class="s">${esc(x.sc)}</div><div class="d">${esc(x.sub)}</div>${fitMark('ps', x.id)}<span class="info" aria-label="Details"${tip(psTip(x))}>${ico('info')}</span>`)),
      assign: () => {
        let optKeys = expand(p.opts);
        if (p.required && !optKeys.includes(p.required.key)) optKeys = [p.required.key].concat(optKeys);
        return `<p>${p.required ? `Assign one of the dice from your Origin (${b.psDice.map(d => die(d)).join(' ')}) to ${traitSpan(p.required.key)} — this one is required. Every other die goes to a power: ${optsText(p.opts)}.` : `Every die from your Origin (${b.psDice.map(d => die(d)).join(' ')}) goes to a power: ${optsText(p.opts)}.`}</p>
          <p class="muted">Signature Weapon / Mount can be renamed in the last step (e.g. “Hextech Rifle”, “Valor”).</p>${assignHtml(R.slots.ps, optKeys, R.before.powersource, 'ps', 'Assign each die to a power:')}`;
      },
      extra: () => psExtraBody(p, R),
      group: s => groupHtml(s.group, R, true)
    };
    return stepPanel('Step 3 · Sentinels: Power Source', 'Source of Power', 'powersource', flowHtml('powersource', sectionsFor('powersource', R), H), true);
  }

  function renderArchetype() {
    const R = R0, p = psDef(), a = archDef(), shape = shapeDef();
    if (!p) return lockedPanel('Path', 'Choose your Source of Power first — it gives the dice you roll here.', 'powersource');
    const H = {
      roll: () => rollerHtml('arch', p.archDice, 'Roll your Source dice'),
      pick: () => pickSection('arch', a && chosenSummary(a.rt + ' · ' + a.role, a.sc, a.lore, a.champs),
        cardsHtml(window.ARCHETYPES, 'arch', st.arch.id, 'arch', x => `<span class="n">${pad2(x.n)}</span><div class="t">${esc(x.rt)}</div><div class="s">${esc(x.sc)}${x.advanced ? ' · advanced' : ''}</div><div class="d">${esc(x.champs)}</div><span class="info" aria-label="Details"${tip(archTip(x))}>${ico('info')}</span>`)),
      broll: () => rollerHtml('base', p.archDice, 'Roll for your base Path'),
      base: () => `<p class="muted">${a.divided ? 'Your full Path becomes “' + esc(a.rt) + ' ' + (shape ? esc(shape.rt) : '…') + '”.' : 'You follow this Path\'s dice rules, but gain modes instead of its abilities.'}</p>` +
        pickSection('base', shape && chosenSummary(shape.rt + ' · ' + shape.role, shape.sc, shape.lore, shape.champs),
          cardsHtml(window.ARCHETYPES.filter(x => !x.advanced), 'base', st.arch.base, 'base', x => `<span class="n">${pad2(x.n)}</span><div class="t">${esc(x.rt)}</div><div class="s">${esc(x.sc)}</div><span class="info" aria-label="Details"${tip(archTip(x))}>${ico('info')}</span>`)),
      assign: () => {
        const optKeys = expand((shape.req ? shape.req.any : []).concat(shape.powers, shape.quals));
        return `<p>Assign the dice from your Source (${p.archDice.map(d => die(d)).join(' ')}).</p><ul class="rules-list">
            ${shape.req ? (shape.req.count ? `<li>You <b>must</b> end this step with <b>${esc(shape.req.label)}</b> — ones you already have count, so put dice there only until you have two.</li>` : `<li>First, one die <b>must</b> go to <b>${esc(shape.req.label)}</b>. If you already have it, you may skip this and use the die below instead.</li>`) : ''}
            <li>${shape.req ? 'Of the other dice, ' : ''}${shape.remPowers === 'one' ? `<b>${shape.req ? 'exactly one' : 'Exactly one die'}</b> goes` : shape.remPowers === 'any' ? `<b>${shape.req ? 'any number' : 'Any number of dice'}</b> (even none) go` : `<b>${shape.req ? 'one or more' : 'One or more dice'}</b> go`} to powers: ${optsText(shape.powers)}.</li>
            <li>Every die left over goes to qualities: ${optsText(shape.quals)}.${shape.remPowers !== 'one' ? ' <span class="muted">It is fine to put every die into powers and take no quality here.</span>' : ''}</li></ul>
          ${assignHtml(R.slots.arch, optKeys, R.before.archetype, 'arch', 'Assign each die:')}
          ${p.id === 'training' ? `<p style="margin-top:12px">From your <b>${esc(p.rt)}</b> source: one extra quality from this Path's list at ${die('d8')}.</p>${assignHtml(R.slots.training, expand(shape.quals), R.before.archetype, 'arch', 'Training bonus quality:')}` : ''}
          ${shape.extra ? `<p style="margin-top:12px">${esc(shape.extra.text)}</p>${socket({ bind: 'arch.extra.key', d: shape.extra.die, cur: st.arch.extra.key, groups: traitGroups(expand(shape.extra.opts).filter(k => !R.before.archetype[k]), k => traitItem(k)), empty: `Bind this ${shape.extra.die} to a trait` })}` : ''}
          ${a.modular && R.modExtra ? `<p style="margin-top:12px">Stance Masters need at least four powers — add ${R.modExtra} ${die('d6')} power(s):</p>` + Array.from({ length: R.modExtra }, (_, i) => socket({ bind: `arch.extra.m${i}`, d: 'd6', cur: st.arch.extra['m' + i], groups: traitGroups(allOf('power').filter(k => !R.before.personality[k] || k === st.arch.extra['m' + i]), k => traitItem(k, { taken: Object.keys(st.arch.extra).some(x => x !== 'm' + i && /^m\d/.test(x) && st.arch.extra[x] === k) ? 'on another d6' : '' })), empty: 'Bind this d6 to any power' })).join('') : ''}
          ${shape.healthAlt ? `<p class="sc">When determining Health you may use a ${esc(shape.healthAlt.map(catName).join(' or '))} power instead of an Athletic power or Mental quality.</p>` : ''}
          ${shape.extraRed ? `<p class="sc">As a ${esc(shape.rt)}, the Red abilities ${esc(shape.extraRed.join(', '))} are added to your options in the Ultimates step.</p>` : ''}`;
      },
      divm: () => `<div class="principles">${window.DIVIDED.methods.map(m => `<button class="principle${st.arch.divMethod === m.id ? ' selected' : ''}" data-act="divMethod" data-id="${m.id}"${tip(`<h5>${esc(m.rt)}</h5><div class="sc-line">Sentinels: ${esc(m.name)}</div>${esc(m.text)}`)}><div class="pn">${esc(m.rt)}</div><div class="po">${esc(m.name)}</div><div class="ph">${esc(m.text)}</div></button>`).join('')}</div>`,
      group: s => groupHtml(s.group, R, true),
      minions: () => minionFormsHtml(R),
      notes: () => `<p class="muted">Record which powers/dice each ${a.modular ? 'mode' : 'form'} uses (this goes on your auxiliary sheet).</p><textarea data-bind="arch.notes" data-live="1">${esc(st.arch.notes)}</textarea>`,
      principle: () => principleHtml('arch', archPrincipleCat(), R) + `<p class="muted" style="margin-top:10px">Next step: your Temperament, rolled with ${die('d10', 'sm')}${die('d10', 'sm')}.</p>`
    };
    return stepPanel('Step 4 · Sentinels: Archetype', 'Path', 'archetype', flowHtml('archetype', sectionsFor('archetype', R), H), true);
  }

  function minionFormsHtml(R) {
    const q = ['creativity', 'magical-lore', 'otherworldly-mythos', 'science', 'technology'].filter(k => R.T[k]);
    const cur = st.arch.minionQ;
    const max = cur && R.T[cur] ? dn(R.T[cur].die) : 0;
    const chosen = st.arch.minionForms || [];
    return `<p class="muted"${tip('<h5>Minion forms</h5>When you create a minion you may discard one bonus you have access to in order to add a form with that bonus value or higher. The number of forms you know equals the maximum value of a related quality.')}>You know as many minion forms as the maximum value of a related quality. <span class="term info-mark">${ico('info')}</span></p>
      <label class="field"><span>Related quality</span><select data-bind="arch.minionQ"><option value="">— choose —</option>${q.map(k => `<option value="${k}"${cur === k ? ' selected' : ''}>${esc(traitName(k))} (${R.T[k].die})</option>`).join('')}</select></label>
      ${q.length ? '' : '<small class="muted">You need Creativity, Arcane Lore, Spirit & Void Mythos, Natural Philosophy or Hextech Engineering.</small>'}
      <div class="ab-list">${window.MINION_FORMS.map(([n, d, b]) => `<label class="ab${chosen.includes(n) ? ' picked' : ''}"><div class="ab-top"><input type="checkbox" data-act="minionForm" data-name="${esc(n)}"${chosen.includes(n) ? ' checked' : ''}${!chosen.includes(n) && chosen.length >= max ? ' disabled' : ''}><span class="ab-name">${esc(n)}</span><span class="ab-type"${tip('Bonus needed to apply this form')}>${esc(b)} or higher</span></div><div class="ab-text">${rulesText(d)}</div></label>`).join('')}</div>
      <p class="muted">${chosen.length}/${max} chosen.</p>`;
  }

  function renderPersonality() {
    const R = R0, a = archDef(), pe = persDef();
    if (!a) return lockedPanel('Temperament', 'Choose your Path first.', 'archetype');
    const statusCell = x => x.status.map((d, i) => `<span class="z ${'gyr'[i]}">${die(d, 'sm')}</span>`).join('');
    const H = {
      roll: () => rollerHtml('pers', ['d10', 'd10'], 'Roll 2d10 for your Temperament'),
      pick: () => pickSection('pers', pe && chosenSummary(pe.rt, pe.sc, '', pe.champs,
        `<div class="status-row"${tip('<h5>Status dice</h5>The third die of every roll. Which one you use depends on your current Health zone.')}><span class="z g">Green ${die(R.status[0])}</span><span class="z y">Yellow ${die(R.status[1])}</span><span class="z r">Red ${die(R.status[2])}</span></div>` +
        (pe.healthAny ? '<p class="sc">When determining Health you may use <b>any</b> power or quality.</p>' : '')),
        cardsHtml(window.PERSONALITIES, 'pers', st.pers.id, 'pers', x => `<span class="n">${pad2(x.n)}</span><div class="t">${esc(x.rt)}</div><div class="s">${esc(x.sc)}</div><div class="dice-row status-row">${statusCell(x)}</div><span class="info" aria-label="Details"${tip(`<h5>${esc(x.rt)}</h5><div class="sc-line">Sentinels: ${esc(x.sc)}</div><b>Status:</b> Green ${x.status[0]}, Yellow ${x.status[1]}, Red ${x.status[2]}<br><b>Out:</b> ${esc(x.out)}<hr><small>${esc(x.champs)}</small>`)}>${ico('info')}</span>`)),
      qname: () => `<p class="muted"${tip(traitTip('rp-quality'))}>A ${die('d8', 'sm')} quality that sums up your champion — your “high concept”. Examples: <em>Hextech Prodigy of the Academy</em>, <em>Last Kinkou of the Eastern Isles</em>, <em>Bilgewater's Luckiest Liar</em>.</p>
        <input type="text" data-bind="pers.qname" data-live="1" data-commit="1" value="${esc(st.pers.qname)}" placeholder="Type your Signature Quality, then press Enter">`,
      out: () => {
        const rq = reqFromText(pe.out);
        const outKeys = sortTraits(owned(R, rq.kind)).map(t => t.key);
        return `<p class="muted"${tip(`<h5>Out ability</h5>${window.COLOR_INFO.out}`)}>Used when your champion is knocked out. <span class="term info-mark">${ico('info')}</span></p><div class="ab out picked"><div class="ab-text">${rulesText(pe.out, { trait: st.pers.outTrait })}</div>
          <div class="ab-cfg"><label>Uses<select data-bind="pers.outTrait">${traitOptions(outKeys, st.pers.outTrait)}</select></label></div></div>`;
      },
      reckless: () => {
        const upg = sortTraits(Object.values(R.before.personality).filter(t => dn(t.die) < 12 || t.key === st.pers.upgrade)).map(t => t.key);
        return `<p>Upgrade one of your power or quality dice by one step (max ${die('d12')}).</p>${socket({ bind: 'pers.upgrade', mark: '+1', cur: st.pers.upgrade, groups: traitGroups(upg, k => traitItem(k, { after: `${R.before.personality[k].die} → ${upDie(R.before.personality[k].die)}` })), empty: 'Grow one die by a size' })}`;
      }
    };
    return stepPanel('Step 5 · Sentinels: Personality', 'Temperament', 'personality', flowHtml('personality', sectionsFor('personality', R), H), true);
  }

  function renderRed() {
    const R = R0;
    if (!persDef()) return lockedPanel('Ultimates', 'Choose your Temperament first.', 'personality');
    const need = 2 + (st.retcon.type === 'extra-red' ? 1 : 0);
    const s = st.sel.red = st.sel.red || [];
    const cats = window.RED_ABILITIES.slice();
    const shape = shapeDef();
    if (shape && shape.extraRed) cats.push({ cat: 'X:' + shape.id, label: shape.rt + ' (Path)', list: shape.extraRed.map(a => ({ a })) });
    const catHtml = c => {
      const isX = c.cat.startsWith('X:');
      const inCat = isX ? [] : Object.values(R.T).filter(t => TRAIT[t.key].cat === c.cat && dn(t.die) >= 6);
      const eligible = isX || inCat.length > 0;
      const label = isX ? c.label : `${catName(c.cat)} ${CATS[c.cat].kind}s`;
      const sub = isX ? '' : ` <small class="muted">Sentinels: ${esc(catSc(c.cat))} ${CATS[c.cat].kind}s</small>`;
      const cards = c.list.map(({ a, use }) => {
        const idx = s.findIndex(e => e.name === a && e.cat === c.cat);
        const picked = idx >= 0;
        const takenElsewhere = !picked && s.some(e => displayName(e.name) === displayName(a));
        const useOk = !use || use.some(k => R.T[k]);
        const card = abilityCard({ key: 'red', color: 'red', count: need, list: [] }, a, s[idx], picked, R, { idx, cat: isX ? null : c.cat, use, color: 'red' });
        const block = !useOk || takenElsewhere || (!picked && s.length >= need);
        return block && !picked ? card.replace('type="checkbox"', 'type="checkbox" disabled').replace('class="ab red', 'class="ab red disabled') : card;
      }).join('');
      return `<div class="subsec"><h4>${esc(label)}${sub} <span class="pill green">eligible</span></h4>${!isX ? `<p class="muted">You have: ${inCat.map(t => traitSpan(t.key) + ' ' + die(t.die, 'sm')).join(', ')}</p>` : ''}<div class="ab-list">${cards}</div></div>`;
    };
    const eligibleCats = cats.filter(c => c.cat.startsWith('X:') || Object.values(R.T).some(t => TRAIT[t.key].cat === c.cat && dn(t.die) >= 6));
    const lockedCats = cats.filter(c => !eligibleCats.includes(c));
    const H = {
      pick: () => `<p class="count-line"><b>${s.length}/${need}</b> chosen. ${need > 2 ? '<span class="pill red">+1 from Twist of Fate</span>' : ''}</p>` +
        eligibleCats.map(catHtml).join('') +
        (lockedCats.length ? `<p class="muted"${tip('You need a power or quality of these categories rated d6 or higher to take their Red abilities.')}>Not available to you (you have no traits in these categories): ${lockedCats.map(c => esc(`${catName(c.cat)} ${CATS[c.cat].kind}s`)).join(', ')}.</p>` : '')
    };
    return stepPanel('Step 6 · Sentinels: Red Abilities', 'Ultimates', 'red', flowHtml('red', sectionsFor('red', R), H), false);
  }

  function renderRetcon() {
    const R = R0;
    if (!persDef()) return lockedPanel('Twist of Fate', 'Choose your Temperament first.', 'personality');
    const rc = st.retcon;
    const B = R.before.retcon;
    const traitsOf = kind => sortTraits(Object.values(B).filter(t => TRAIT[t.key].kind === kind)).map(t => t.key);
    const H = {
      pick: () => `<div class="principles">${window.RETCONS.map(x => `<button class="principle${rc.type === x.id ? ' selected' : ''}" data-act="retcon" data-id="${x.id}"${tip(`<h5>${esc(x.rt)}</h5><div class="sc-line">Sentinels retcon</div>${esc(x.sc)}`)}><div class="pn">${esc(x.rt)}</div><div class="ph">${esc(x.sc)}</div></button>`).join('')}</div>`,
      cfg: () => {
        if (rc.type === 'swap-powers' || rc.type === 'swap-quals') {
          const keys = traitsOf(rc.type === 'swap-powers' ? 'power' : 'quality');
          const it = k => traitItem(k, { after: B[k] ? B[k].die : '' });
          return socket({ bind: 'retcon.a', mark: 'A', cur: rc.a, groups: traitGroups(keys, it), empty: 'First trait to swap' }) +
            socket({ bind: 'retcon.b', mark: 'B', cur: rc.b, groups: traitGroups(keys.filter(k => k !== rc.a), it), empty: 'Swap its die with…' });
        }
        if (rc.type === 'add-d6') {
          const keys = Object.values(CATS).flatMap(def => def.items.map(i => i[0])).filter(k => TRAIT[k] && !B[k]);
          return socket({ bind: 'retcon.key', d: 'd6', cur: rc.key, groups: traitGroups(keys, k => traitItem(k)), empty: 'Bind this d6 to any power or quality' });
        }
        if (rc.type === 'change-principle') {
          const opts = PRINCIPLES.map(p => `<option value="${p.id}"${rc.principle === p.id ? ' selected' : ''}>${esc((window.PRINCIPLE_LORE[p.id] || [p.name])[0])} — ${esc(p.cat)}</option>`).join('');
          return `<div class="grid2"><label class="field"><span>Replace</span><select data-bind="retcon.which"><option value="">— choose —</option><option value="bg"${rc.which === 'bg' ? ' selected' : ''}>Origin principle</option><option value="arch"${rc.which === 'arch' ? ' selected' : ''}>Path principle</option></select></label><label class="field"><span>With (any category)</span><select data-bind="retcon.principle"><option value="">— choose —</option>${opts}</select></label></div>`;
        }
        if (rc.type === 'change-ability') return '<p class="muted">Go back to any ability (Source, Path or Ultimates) and change which power or quality it uses. Everything stays editable — this option simply makes it “official”.</p>';
        if (rc.type === 'red-up' && R.status) return `<p>Red status die: ${die(persDef().status[2])} → ${die(R.status[2])}</p>`;
        if (rc.type === 'extra-red') return `<p>Go back to <a href="#" data-act="go" data-step="red">Ultimates</a> and pick a third Red ability (${(st.sel.red || []).length}/3 chosen).</p>`;
        return '';
      }
    };
    return stepPanel('Step 7 · Sentinels: Retcon', 'Twist of Fate', 'retcon', flowHtml('retcon', sectionsFor('retcon', R), H), false);
  }

  function healthCalc(R) {
    const pe = persDef(), shape = shapeDef();
    if (!pe || !R.status) return null;
    let elig = Object.values(R.T).filter(t => TRAIT[t.key].cat === 'P:athletic' || TRAIT[t.key].cat === 'Q:mental');
    if (shape && shape.healthAlt) elig = elig.concat(Object.values(R.T).filter(t => shape.healthAlt.includes(TRAIT[t.key].cat)));
    if (pe.healthAny) elig = Object.values(R.T);
    elig = sortTraits([...new Map(elig.map(t => [t.key, t])).values()]);
    const chosen = elig.find(t => t.key === st.health.trait) || elig[0] || null;
    const traitMax = chosen ? dn(chosen.die) : 4;
    const roll = st.health.mode === 'roll' && st.health.roll ? st.health.roll : 4;
    const red = dn(R.status[2]);
    const max = 8 + red + traitMax + roll;
    const row = window.HEALTH_TABLE[Math.max(17, Math.min(40, max))];
    return { elig, chosen, traitMax, roll, red, max, green: [max, row[0]], yellow: [row[1], row[2]], redR: [row[3], 1] };
  }

  function renderHealth() {
    const R = R0;
    const h = healthCalc(R);
    if (!h) return lockedPanel('Health', 'Choose your Temperament first (your Red status die is part of Health).', 'personality');
    const H = {
      review: () => `<div class="grid2"><div class="detail">
        <label class="field"><span>Trait added to Health (highest by default)</span><select data-bind="health.trait">${h.elig.map(t => `<option value="${t.key}"${h.chosen && h.chosen.key === t.key ? ' selected' : ''}>${esc(traitName(t.key))} (${t.die})</option>`).join('')}${h.elig.length ? '' : '<option value="">none — use d4</option>'}</select></label>
        <div class="method" role="group"><button class="${st.health.mode !== 'roll' ? 'on' : ''}" data-act="hmode" data-m="fixed">Take 4</button><button class="${st.health.mode === 'roll' ? 'on' : ''}" data-act="hmode" data-m="roll">Roll ${die('d8', 'sm')}</button></div>
        ${st.health.mode === 'roll' ? ` <button class="btn small" data-act="hroll">${st.health.roll ? 'Rolled ' + st.health.roll + ' — roll again' : 'Roll d8'}</button>` : ''}
        <p class="muted" style="margin-top:8px">Decide whether to roll <em>before</em> rolling.</p>
      </div><div class="detail">
        <table style="width:100%;font-size:.95rem"><tbody>
        <tr><td>Base</td><td style="text-align:right">8</td></tr>
        <tr><td>Red status die max ${die(R.status[2], 'sm')}</td><td style="text-align:right">${h.red}</td></tr>
        <tr><td>${h.chosen ? esc(traitName(h.chosen.key)) + ' ' + die(h.chosen.die, 'sm') : 'No eligible trait ' + die('d4', 'sm')}</td><td style="text-align:right">${h.traitMax}</td></tr>
        <tr><td>${st.health.mode === 'roll' ? 'd8 roll' : 'Fixed'}</td><td style="text-align:right">${h.roll}</td></tr>
        <tr><td><b>Maximum Health</b></td><td style="text-align:right"><b>${h.max}</b></td></tr></tbody></table>
      </div></div>
      <div class="hs-health" style="margin-top:14px"><div class="max">Max<b>${h.max}</b></div><div class="g"${tip(window.GLOSSARY['Green zone'])}>Green<b>${h.green[0]}–${h.green[1]}</b></div><div class="y"${tip(window.GLOSSARY['Yellow zone'])}>Yellow<b>${h.yellow[0]}–${h.yellow[1]}</b></div><div class="r"${tip(window.GLOSSARY['Red zone'])}>Red<b>${h.redR[0]}–1</b></div></div>`
    };
    return stepPanel('Step 8 · Sentinels: Health', 'Health', 'health', flowHtml('health', sectionsFor('health', R), H), false);
  }

  // ------------------------------------------------------------------ compile sheet
  function principlesFinal() {
    const out = [];
    const bgP = st.bg.principle, arP = st.arch.principle;
    const rc = st.retcon;
    const pick = (slot, id) => (rc.type === 'change-principle' && rc.which === slot && rc.principle ? rc.principle : id);
    if (bgP) out.push({ slot: 'bg', id: pick('bg', bgP) });
    if (arP) out.push({ slot: 'arch', id: pick('arch', arP) });
    return out.map(x => ({ ...x, p: PRINCIPLES.find(p => p.id === x.id) })).filter(x => x.p);
  }

  function allAbilities(R) {
    const L = [];
    const srcName = { powersource: 'Source', archetype: 'Path' };
    for (const g of groups()) {
      for (const e of selOf(g)) L.push({ iid: g.key + ':' + e.name, name: e.name, color: g.color, src: srcName[g.step], entry: e });
    }
    for (const x of principlesFinal()) {
      L.push({ iid: 'pr:' + x.slot, name: x.p.name, color: 'green', src: 'Principle', text: x.p.ability, type: x.p.type, entry: { ch: { 'energy/element': st.pch[x.slot] } } });
    }
    for (const e of st.sel.red || []) L.push({ iid: 'red:' + e.cat + ':' + e.name, name: e.name, color: 'red', src: 'Ultimate', entry: e });
    const pe = persDef();
    if (pe) L.push({ iid: 'out', name: 'Out', color: 'out', src: 'Temperament', text: pe.out, type: '—', entry: { trait: st.pers.outTrait } });
    return L;
  }

  // ------------------------------------------------------------------ action icons (the "ICON" column of the hero sheet)
  const ICONS = {
    Attack: ['ATK', 'Attack'], Defend: ['DEF', 'Defend'], Overcome: ['OVR', 'Overcome'],
    Boost: ['BST', 'Boost'], Hinder: ['HIN', 'Hinder'], Recover: ['REC', 'Recover']
  };
  function actionIcons(text) {
    const out = [];
    (text || '').replace(/\b(Attack|Defend|Overcome|Boost|Hinder|Recover)\b/g, (m, a) => { if (!out.includes(a)) out.push(a); return m; });
    return out;
  }
  const iconHtml = text => actionIcons(text).map(a => `<span class="act-ic act-${a.toLowerCase()}"${tip(`<h5>${a} icon</h5>${window.GLOSSARY[a]}<hr><small>The hero sheet's ICON column shows which basic actions an ability uses.</small>`)}>${ICONS[a][0]}</span>`).join('');

  // Plain-text version of an ability (brackets filled in) for the PDF sheet.
  function plainText(text, entry) {
    return String(text || '').replace(/\[([^\]]+)\]/g, (m, br) => {
      if (/^d(4|6|8|10|12)$/.test(br)) return br;
      if (TRAIT_TOKENS[br] !== undefined && entry) {
        const k = br === 'quality' && entry.trait2 ? entry.trait2 : entry.trait;
        if (k && TRAIT[k]) return sheetTraitName(k);
      }
      if (CHOICE_TOKENS[br] !== undefined && entry && entry.ch && entry.ch[br]) return entry.ch[br].replace(/ \(.*\)$/, '');
      return m;
    });
  }
  const sheetTraitName = k => (k === 'rp-quality' && st.pers.qname ? st.pers.qname : traitName(k));
  const principleShort = x => {
    let n = (window.PRINCIPLE_LORE[x.id] || [x.p.name])[0].replace(/^Principle of /, '');
    if (x.id === 'energy-element') n = st.pch[x.slot] || n;
    return n;
  };
  const principleText = (x, s) => String(s).replace(/\[energy\/element\]/g, st.pch[x.slot] || '[energy/element]');

  // Rows of the official sheet: green / principles / yellow / red / out
  function sheetRows(R) {
    const abs = allAbilities(R);
    const row = x => {
      const ab = A[x.name];
      const text = x.text || (ab && ab.text) || '';
      return { x, name: st.renames[x.iid] || displayName(x.name), orig: displayName(x.name), type: x.type || (ab && ab.type) || '', text, entry: x.entry };
    };
    return {
      green: abs.filter(x => x.color === 'green' && x.src !== 'Principle').map(row),
      principles: abs.filter(x => x.src === 'Principle').map(row),
      yellow: abs.filter(x => x.color === 'yellow').map(row),
      red: abs.filter(x => x.color === 'red').map(row),
      out: abs.filter(x => x.color === 'out').map(row)[0] || null
    };
  }

  function sheetHtml(R) {
    const bg = bgDef(), ps = psDef(), ar = archDef(), shape = shapeDef(), pe = persDef(), rg = regionDef();
    const h = healthCalc(R);
    const powers = sortTraits(owned(R, 'power'));
    const quals = sortTraits(owned(R, 'quality'));
    const i = st.info, pl = st.play;
    const pr = principlesFinal();
    const rows = sheetRows(R);
    const charLine = (label, d, extra = '') => `<div class="hs-f"><span class="hs-l">${label}</span>${d ? `<span${tip(`<div class="sc-line">Sentinels: ${esc(d.sc)}</div>${esc(d.lore || '')}`)} class="term">${esc(d.rt + extra)}</span> <small class="muted">(${esc(d.sc)})</small>` : '—'}</div>`;
    const attr = (label, v) => `<div class="hs-f"><span class="hs-l">${label}</span>${esc(v || '')}</div>`;
    const traitRows = (list, n) => {
      const out = list.map(t => `<tr><td>${t.key === 'rp-quality' && st.pers.qname ? `<span class="term"${tip(traitTip('rp-quality'))}>${esc(st.pers.qname)}</span>` : traitSpan(t.key)}</td><td class="dt">${die(t.die, 'sm')}</td></tr>`);
      while (out.length < n) out.push('<tr><td>&nbsp;</td><td class="dt"></td></tr>');
      return out.join('');
    };
    const abRow = (r, zone) => `<tr><td class="ic">${iconHtml(r.text)}</td><td class="nm">${esc(r.name)}${r.name !== r.orig ? `<small>${esc(r.orig)}</small>` : ''}</td><td class="ty"${tip(window.ABILITY_TYPES[r.type] || '')}>${esc(r.type)}</td><td class="gt">${rulesText(r.text, r.entry)}</td></tr>`;
    const emptyRows = (n, have) => Array.from({ length: Math.max(0, n - have) }, () => '<tr><td class="ic"></td><td class="nm">&nbsp;</td><td class="ty"></td><td class="gt"></td></tr>').join('');
    const prRow = (x, r) => `<tr class="pr-row"><td class="ic">${iconHtml(x.p.ability)}</td><td class="nm"><small class="po-lbl">Principle of</small> ${esc(principleShort(x))}</td><td class="ty">${esc(x.p.type)}</td><td class="gt">${rulesText(x.p.ability, { ch: { 'energy/element': st.pch[x.slot] } })}</td></tr>`;
    const check = (path, val, label) => `<input type="checkbox" class="hs-chk" data-bind="${path}" data-live="1"${val ? ' checked' : ''} aria-label="${esc(label)}">`;
    const zone = (cls, label, body) => `<div class="hs-zone ${cls}"><div class="zlbl">${label}</div><table class="hs-ab-t"><thead><tr><th>Icon</th><th>Name</th><th>Type</th><th>Game text</th></tr></thead><tbody>${body}</tbody></table></div>`;
    const principleCol = x => x ? `<div class="hs-pr"><div class="hs-pr-h">Principle of <b>${esc(principleShort(x))}</b> <small class="muted">${esc(x.p.cat)} · ${esc(x.p.name)}</small></div>
      <div class="hs-pr-s"><span class="hs-l">During roleplaying</span>${esc(principleText(x, x.p.rp))}</div>
      <div class="hs-pr-s"><span class="hs-l">Minor twist</span>${esc(x.p.minor)}</div>
      <div class="hs-pr-s"><span class="hs-l">Major twist</span>${esc(x.p.major)}</div></div>` : '<div class="hs-pr"><div class="hs-pr-h">Principle of …</div></div>';
    return `<div class="hero-sheet">
      <div class="hs-page">
        <div class="hs-top">
          <div class="hs-portrait">${i.portrait ? `<img src="${i.portrait}" alt="Portrait of ${esc(i.name || 'your champion')}">` : `<span class="muted">Portrait</span>`}</div>
          <div class="hs-idblock">
            <div class="hs-card"><div class="hs-h">Player</div>${esc(i.player || '')}&nbsp;</div>
            <div class="hs-card hs-2"><div><div class="hs-h">Hero Name</div><div class="hs-name">${esc(i.name || 'Unnamed Champion')}</div></div><div><div class="hs-h">Alias</div>${esc(i.alias || '')}</div></div>
            <div class="hs-card"><div class="hs-h">Physical Attributes</div>
              <div class="hs-3">${attr('Gender', i.gender)}${attr('Age', i.age)}${attr('Height', i.height)}</div>
              <div class="hs-3">${attr('Eyes', i.eyes)}${attr('Hair', i.hair)}${attr('Skin', i.skin)}</div>
              ${attr('Build', i.build)}${attr('Costume/Equipment', i.costume)}${rg ? attr('Homeland', rg.name) : ''}</div>
            <div class="hs-card"><div class="hs-h">Characteristics</div>
              <div class="hs-2">${charLine('Background', bg)}${charLine('Power Source', ps)}</div>
              <div class="hs-2">${charLine('Archetype', ar, shape && shape !== ar ? ' ' + shape.rt : '')}${charLine('Personality', pe)}</div></div>
          </div>
        </div>
        <div class="hs-prs">${principleCol(pr[0])}${principleCol(pr[1])}</div>
        <div class="hs-bottom">
          <div class="hs-card"><div class="hs-h"${tip(window.GLOSSARY['hero point'])}>Hero Points <small>this issue</small></div><div class="hs-hp">${[0, 1, 2, 3, 4].map(n => check(`play.hp.${n}`, pl.hp[n], 'Hero point ' + (n + 1))).join('')}</div>
            <div class="hs-h" style="margin-top:8px"${tip('Rewards you can claim by spending hero points — tick them off as you use them.')}>Hero Point Rewards</div>
            ${[1, 2, 3, 4].map(r => `<div class="hs-hp"><b>+${r}</b>${[0, 1, 2, 3].map(c => check(`play.rw.${(r - 1) * 4 + c}`, pl.rw[(r - 1) * 4 + c], `+${r} reward ${c + 1}`)).join('')}</div>`).join('')}</div>
          <div class="hs-card"><div class="hs-h"${tip('Past sessions ("issues") your champion took part in.')}>Back Issues</div>${[0, 1, 2, 3, 4, 5].map(n => `<input class="hs-line" type="text" data-bind="play.issues.${n}" data-live="1" value="${esc(pl.issues[n] || '')}" aria-label="Back issue ${n + 1}">`).join('')}</div>
          <div class="hs-card"><div class="hs-h"${tip(window.GLOSSARY.collection + ' Tick a collection when it is complete — that is when your champion advances.')}>Collections</div>${[0, 1, 2, 3, 4, 5, 6, 7].map(n => `<div class="hs-coll">${check(`play.cdone.${n}`, pl.cdone[n], 'Collection ' + (n + 1) + ' complete')}<input class="hs-line" type="text" data-bind="play.coll.${n}" data-live="1" value="${esc(pl.coll[n] || '')}" aria-label="Collection ${n + 1}"></div>`).join('')}</div>
        </div>
      </div>
      <div class="hs-page">
        <div class="hs-card hs-3"><div><div class="hs-h">Hero Name</div>${esc(i.name || '')}</div><div><div class="hs-h">Alias</div>${esc(i.alias || '')}</div><div><div class="hs-h">Player</div>${esc(i.player || '')}</div></div>
        <div class="hs-stats">
          <table class="hs-traits"><thead><tr><th>Powers</th><th>Die</th></tr></thead><tbody>${traitRows(powers, 6)}</tbody></table>
          <table class="hs-traits"><thead><tr><th>Qualities</th><th>Die</th></tr></thead><tbody>${traitRows(quals, 6)}</tbody></table>
          <div class="hs-status"><div class="hs-h"${tip(window.GLOSSARY['status die'])}>Status Dice</div>${R.status ? ['Green', 'Yellow', 'Red'].map((z, n) => `<div class="hs-sd ${z.toLowerCase()}"><small>${z}</small>${die(R.status[n])}</div>`).join('') : '—'}</div>
          <div class="hs-hr"><div class="hs-h"${tip(window.GLOSSARY.Health)}>Health Range</div>${h ? `<div class="burst g">Green<b>${h.green[0]}–${h.green[1]}</b></div><div class="burst y">Yellow<b>${h.yellow[0]}–${h.yellow[1]}</b></div><div class="burst r">Red<b>${h.redR[0]}–1</b></div>
            <div class="burst c">Current<input type="text" inputmode="numeric" data-bind="play.current" data-live="1" value="${esc(pl.current == null || pl.current === '' ? h.max : pl.current)}" aria-label="Current Health"></div>` : '—'}</div>
        </div>
        <div class="hs-h" style="margin-top:12px">Abilities</div>
        ${zone('green', 'Green zone', rows.green.map(r => abRow(r)).join('') + emptyRows(5, rows.green.length) + pr.map(x => prRow(x)).join(''))}
        ${zone('yellow', 'Yellow zone', rows.yellow.map(r => abRow(r)).join('') + emptyRows(5, rows.yellow.length))}
        ${zone('red', 'Red zone', rows.red.map(r => abRow(r)).join('') + emptyRows(3, rows.red.length))}
        <div class="hs-out"><span class="zlbl"${tip(window.COLOR_INFO.out)}>Out</span>${rows.out ? rulesText(rows.out.text, rows.out.entry) : ''}</div>
        ${st.arch.minionForms && st.arch.minionForms.length ? `<div class="hs-card"><div class="hs-h">Minion forms (auxiliary sheet)</div><small>${esc(st.arch.minionForms.join(', '))}</small></div>` : ''}
        ${i.notes || st.arch.notes ? `<div class="hs-card"><div class="hs-h">Notes (auxiliary sheet)</div><div style="font-size:.9rem;white-space:pre-wrap">${esc([i.notes, st.arch.notes].filter(Boolean).join('\n\n'))}</div></div>` : ''}
      </div>
    </div>`;
  }

  // ------------------------------------------------------------------ official PDF export (Form Fillable Hero Sheet)
  const pdfSafe = s => String(s == null ? '' : s)
    .replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/[–—]/g, '-')
    .replace(/…/g, '...').replace(/★/g, '*').replace(/[^\x09\x0A\x0D\x20-\x7E\xA0-\xFF]/g, '');

  function sheetFieldValues(R) {
    const F = {}, D = {}, C = {}, sizes = {};
    const bg = bgDef(), ps = psDef(), ar = archDef(), shape = shapeDef(), pe = persDef();
    const i = st.info, pl = st.play;
    const both = d => (d ? `${d.rt} (${d.sc})` : '');
    Object.assign(F, {
      'Player': i.player, 'Hero Name': i.name, 'Alias': i.alias, 'Gender': i.gender, 'Age': i.age, 'Height': i.height,
      'Eyes': i.eyes, 'Hair': i.hair, 'Skin': i.skin, 'Build': i.build,
      'Costume/Equipment': [i.costume, regionDef() ? 'Homeland: ' + regionDef().name : ''].filter(Boolean).join('\n'),
      'Background': both(bg), 'Power Source': both(ps),
      'Archetype': ar ? (shape && shape !== ar ? `${ar.rt} ${shape.rt} (${ar.sc} ${shape.sc})` : both(ar)) : '',
      'Personality': both(pe)
    });
    for (const k of ['Background', 'Power Source', 'Archetype', 'Personality']) {
      const n = (F[k] || '').length;
      if (n > 16) sizes[k] = n > 34 ? 5 : n > 26 ? 6 : 7;
    }
    const pr = principlesFinal();
    pr.forEach((x, n) => {
      const sfx = n ? ' 2' : '';
      F['Principle' + sfx] = principleShort(x);
      F['During Roleplaying' + sfx] = principleText(x, x.p.rp);
      F['Minor Twist' + sfx] = x.p.minor;
      F['Major Twist' + sfx] = x.p.major;
    });
    const fillTraits = (list, fieldBase, dieStart) => {
      const rows = list.slice(0, 6);
      if (list.length > 6) rows[5] = { merged: list.slice(5) };
      rows.forEach((t, n) => {
        const f = n ? `${fieldBase} ${n + 1}` : fieldBase;
        if (t.merged) { F[f] = t.merged.map(x => `${sheetTraitName(x.key)} ${x.die}`).join(', '); sizes[f] = 6; }
        else { F[f] = sheetTraitName(t.key); D['Die Type ' + (dieStart + n)] = t.die; }
      });
    };
    fillTraits(sortTraits(owned(R, 'power')), 'Powers', 1);
    fillTraits(sortTraits(owned(R, 'quality')), 'Qualities', 7);
    if (R.status) R.status.forEach((d, n) => { D['Die Type ' + (13 + n)] = d; });
    const h = healthCalc(R);
    if (h) {
      F['Health Range 1'] = `${h.green[0]}-${h.green[1]}`;
      F['Health Range 2'] = `${h.yellow[0]}-${h.yellow[1]}`;
      F['Health Range 3'] = `${h.redR[0]}-1`;
      F['Health Range 4'] = String(pl.current == null || pl.current === '' ? h.max : pl.current);
    }
    const rows = sheetRows(R);
    const put = (slot, r) => {
      const sfx = slot === 1 ? '' : ' ' + slot;
      F['Icon' + sfx] = actionIcons(r.text).slice(0, 2).map(a => ICONS[a][0]).join(' ');
      F['Name' + sfx] = r.name;
      D['Type' + sfx] = r.type === 'A/I' ? 'A' : r.type;
      F['Text' + sfx] = r.textPlain;
      sizes['Text' + sfx] = r.textPlain.length > 230 ? 5 : r.textPlain.length > 150 ? 6 : 7;
      sizes['Icon' + sfx] = 4.5;
    };
    const zoneFill = (list, first, count) => {
      const L = list.map(r => ({ ...r, textPlain: plainText(r.text, r.entry) }));
      if (L.length > count) {
        const extra = L.slice(count - 1);
        L.splice(count - 1, L.length, { name: extra.map(r => r.name).join(' / '), type: extra[0].type, text: '', textPlain: extra.map(r => `${r.name}: ${r.textPlain}`).join(' | ') });
      }
      L.forEach((r, n) => put(first + n, r));
      return list.length > count;
    };
    const over = [];
    if (zoneFill(rows.green, 1, 5)) over.push('Green');
    pr.forEach((x, n) => {
      const slot = 6 + n;
      F['Icon ' + slot] = actionIcons(x.p.ability).slice(0, 2).map(a => ICONS[a][0]).join(' ');
      sizes['Icon ' + slot] = 4.5;
      F['Name ' + slot] = principleShort(x);
      D['Type ' + slot] = x.p.type;
      F['Text ' + slot] = principleText(x, x.p.ability);
      sizes['Text ' + slot] = 7;
    });
    if (zoneFill(rows.yellow, 8, 5)) over.push('Yellow');
    if (zoneFill(rows.red, 13, 3)) over.push('Red');
    if (rows.out) F['Out'] = plainText(rows.out.text, rows.out.entry);
    for (let n = 0; n < 5; n++) C['Check Box ' + (n + 1)] = !!pl.hp[n];
    for (let n = 0; n < 16; n++) C['Check Box ' + (n + 6)] = !!pl.rw[n];
    ['Back Issues', 'Back Issues 2', 'Back Issues 3', 'Back Issues 4', 'Back Issues 5', 'Back Issues 6'].forEach((f, n) => { F[f] = pl.issues[n] || ''; });
    for (let n = 0; n < 8; n++) F[n ? 'Collected Trades ' + (n + 1) : 'Collected Trades'] = (pl.cdone[n] ? '[X] ' : '') + (pl.coll[n] || '');
    return { F, D, C, sizes, over };
  }

  const downloadPdf = (bytes, suffix) => {
    const blob = new Blob([bytes], { type: 'application/pdf' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = (st.info.name || 'runeterra-champion').replace(/[^\w-]+/g, '_') + suffix;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  };

  // The sheet exactly as previewed, drawn into a PDF with clickable hero points and editable play fields.
  async function exportPdf() {
    const status = document.getElementById('pdf-status');
    const say = (msg, isErr) => { if (status) { status.innerHTML = msg; status.className = isErr ? 'issues' : 'okbox'; } };
    if (!window.PDFLib || !window.SheetPDF) { say('The PDF library failed to load.', true); return; }
    const link = sel => { const l = document.querySelector(sel); return l ? l.href : ''; };
    try {
      const bytes = await window.SheetPDF.render({
        html: sheetHtml(compute()),
        cssHref: link('link[href*="style.css"]'),
        fontBase: new URL('assets/fonts/', location.href).href,
        fontkitSrc: 'js/vendor/fontkit.umd.min.js',
        pageBg: getComputedStyle(document.body).backgroundColor,
        onStatus: m => say(esc(m))
      });
      downloadPdf(bytes, '_hero_sheet.pdf');
      say('Hero sheet PDF downloaded — hero points, collections, back issues and current Health can be clicked and typed into in any PDF reader.');
    } catch (e) {
      say('Could not build the PDF: ' + esc(e.message), true);
    }
  }

  let pdfTemplate = null; // ArrayBuffer chosen by the user when fetch is unavailable (file://)
  async function exportOfficialPdf() {
    const status = document.getElementById('pdf-status');
    const say = (msg, isErr) => { if (status) { status.innerHTML = msg; status.className = isErr ? 'issues' : 'okbox'; } };
    if (!window.PDFLib) { say('The PDF library failed to load (js/vendor/pdf-lib.min.js).', true); return; }
    let bytes = pdfTemplate;
    if (!bytes) {
      try {
        const r = await fetch('assets/hero-sheet.pdf');
        if (!r.ok) throw new Error(r.status);
        bytes = await r.arrayBuffer();
      } catch (e) {
        say('Your browser blocked loading <code>assets/hero-sheet.pdf</code> (this happens when opening the page straight from disk). <label class="btn small" for="template-file">Choose the blank Form Fillable Hero Sheet PDF</label> and the export will continue — or serve the folder with any web server.', true);
        return;
      }
    }
    try {
      say('Filling your hero sheet…');
      const { PDFDocument, StandardFonts } = window.PDFLib;
      const doc = await PDFDocument.load(bytes);
      const form = doc.getForm();
      const font = await doc.embedFont(StandardFonts.Helvetica);
      const R = compute();
      const { F, D, C, sizes, over } = sheetFieldValues(R);
      for (const [name, val] of Object.entries(F)) {
        try {
          const f = form.getTextField(name);
          f.setText(pdfSafe(val));
          f.setFontSize(sizes[name] || (f.isMultiline() ? 8 : 9));
        } catch (e) { /* field missing in this template */ }
      }
      for (const [name, val] of Object.entries(D)) {
        try { const f = form.getDropdown(name); if (f.getOptions().includes(val)) f.select(val); } catch (e) { /* ignore */ }
      }
      for (const [name, val] of Object.entries(C)) {
        try { const f = form.getCheckBox(name); if (val) f.check(); else f.uncheck(); } catch (e) { /* ignore */ }
      }
      if (st.info.portrait) {
        try {
          const img = st.info.portrait.startsWith('data:image/png') ? await doc.embedPng(st.info.portrait) : await doc.embedJpg(st.info.portrait);
          form.getButton('Character Image').setImage(img);
        } catch (e) { /* ignore image problems */ }
      }
      form.updateFieldAppearances(font);
      downloadPdf(await doc.save(), '_official_sheet.pdf');
      say('Official Sentinels hero sheet downloaded.' + (over.length ? ` Note: your ${over.join(' & ')} zone has more abilities than the sheet has rows, so the extras were combined into the last row.` : ''));
    } catch (e) {
      say('Could not fill the PDF: ' + esc(e.message), true);
    }
  }

  function renderFinish() {
    const R = R0;
    const i = st.info;
    const field = (k, label, ph = '', commit = false) => `<label class="field"><span>${label}</span><input type="text" data-bind="info.${k}" data-live="1"${commit ? ' data-commit="1"' : ''} value="${esc(i[k])}" placeholder="${esc(ph)}"></label>`;
    const abs = allAbilities(R).filter(x => x.name !== 'Out' && x.src !== 'Principle');
    const renameTraits = Object.keys(R.T).filter(k => k !== 'rp-quality');
    const H = {
      name: () => `<div class="grid3">${field('name', 'Hero name', 'Type a name, then press Enter', true)}${field('alias', 'Alias / true name', 'e.g. Kaelis Du Morne')}${field('player', 'Player')}</div>`,
      describe: () => `<div class="grid3">${field('gender', 'Gender')}${field('age', 'Age', 'e.g. mid-thirties, or 2,000 years')}${field('height', 'Height')}${field('eyes', 'Eyes', 'e.g. glowing Hextech blue')}${field('hair', 'Hair')}${field('skin', 'Skin', 'e.g. sun-bronzed, bioluminescent')}</div>
        ${field('build', 'Build', 'e.g. wiry, towering, clockwork')}
        <label class="field"><span>Costume / equipment</span><textarea data-bind="info.costume" data-live="1" placeholder="What do they wear and carry into battle?">${esc(i.costume)}</textarea></label>
        <div class="portrait-row"><div class="hs-portrait small">${i.portrait ? `<img src="${i.portrait}" alt="Portrait">` : '<span class="muted">No portrait</span>'}</div>
          <div><label class="btn small" for="portrait-file">${i.portrait ? 'Change portrait' : 'Add portrait'}</label> ${i.portrait ? '<button class="btn small ghost" data-act="clearPortrait">Remove</button>' : ''}<input id="portrait-file" type="file" accept="image/*" hidden>
          <p class="muted">Goes in the picture box of the hero sheet (and the PDF).</p></div></div>
        <label class="field"><span>Backstory notes (auxiliary sheet)</span><textarea data-bind="info.notes" data-live="1" placeholder="Where did they come from? Who do they fight for?">${esc(i.notes)}</textarea></label>`,
      abilities: () => `<p class="muted"${tip('The rulebook asks you to rename every ability to fit your hero. The original Sentinels name stays on the sheet in small print so you and your GM can look it up.')}>Leave a box empty to keep the original name. <span class="term info-mark">${ico('info')}</span></p>
        <div class="grid2">${abs.map(x => `<label class="field"><span>${esc(displayName(x.name))} <span class="pill ${x.color}">${x.color}</span></span><input type="text" data-rename="${esc(x.iid)}" data-bind="renames" data-live="1" value="${esc(st.renames[x.iid] || '')}" placeholder="${esc(displayName(x.name))}"></label>`).join('') || '<small class="muted">No abilities yet.</small>'}</div>`,
      gear: () => `<p class="muted"${tip('Signature Weapon and Mount are meant to be renamed (e.g. "Hextech Rifle", "Valor"). You can rename any other trait too, the way the rulebook renames Power Suit to "Power Arm".')}>Leave a box empty to keep the original name. <span class="term info-mark">${ico('info')}</span></p>
        <div class="grid3">${renameTraits.map(k => `<label class="field"><span>${esc(TRAIT[k].rt)} ${die(R.T[k].die, 'sm')}</span><input type="text" data-bind="traitNames.${k}" data-live="1" value="${esc(st.traitNames[k] || '')}" placeholder="${esc(TRAIT[k].rt)}"></label>`).join('')}</div>`
    };
    const done = !stepIssues('finish', R).length;
    return `<div class="panel no-print">${chapterHead('Legend')}
      <p class="chapter-lede">${window.STEP_INTROS.finish}</p>
      ${flowHtml('finish', sectionsFor('finish', R), H)}
      <section class="flow-sec ${done ? 'current' : 'locked'}" id="flow-finish-export"><div class="flow-head"><span class="flow-num">${done ? ico('mark') : ico('lock')}</span><h3>Your hero sheet</h3>${done ? '' : '<span class="flow-lock">Sealed — name your champion first</span>'}</div>
      ${done ? `<div class="flow-body"><p class="muted">Your sheet is below, laid out like the official two-page <em>Sentinel Comics RPG</em> hero sheet. Hero points, back issues, collections and current Health can be ticked and edited right on it during play.</p><div id="pdf-status"></div><input id="template-file" type="file" accept="application/pdf,.pdf" hidden>
        <div class="export-row"><button class="btn primary" data-act="pdf">${ico('download')} Export PDF hero sheet</button><button class="btn" data-act="print">Print</button><button class="btn" data-act="export">Export JSON</button></div>
        <p class="muted" style="margin-top:10px">Need the official Sentinels layout instead? <button class="linkbtn" data-act="pdfOfficial">Download the official form-fillable sheet</button></p></div>` : ''}</section>
      <div class="step-footer"><button class="btn ghost" data-act="back">${ico('prev')} Back</button><span></span></div></div>
      <div class="panel" id="sheet-preview">${sheetHtml(R)}</div>`;
  }

  function lockedPanel(title, msg, step) {
    return `<div class="panel">${chapterHead(title)}<p class="chapter-lede">${esc(msg)}</p><button class="btn primary" data-act="go" data-step="${step}">Go there ${ico('next')}</button></div>`;
  }
  const stepIndex = id => STEPS.findIndex(x => x.id === id);
  // Back / Next. Next only works once the current step is complete.
  function navFooter() {
    const i = stepIndex(st.step);
    const next = STEPS[i + 1];
    const ready = !stepIssues(st.step, R0).length;
    return `<div class="step-footer"><button class="btn ghost" data-act="back">${ico('prev')} Back</button>
      <div class="next-wrap">${ready ? '' : '<span class="next-hint">Finish the step marked “You are here” to continue</span>'}<button class="btn primary${ready ? '' : ' is-disabled'}" data-act="next" aria-disabled="${!ready}"><span class="btn-kicker">${next ? 'Chapter ' + ROMAN[i + 1] : ''}</span>${next ? esc(next.name) : 'Next'} ${ico('next')}</button></div></div>`;
  }
  const methodToggle = () => `<div class="method" role="group" aria-label="Creation method"${tip('<h5>Guided vs Constructed</h5>Guided: roll and choose among the allowed entries. Constructed: pick freely. Die sizes work the same either way.')}><span class="method-l">Method</span><button class="${st.method === 'guided' ? 'on' : ''}" data-act="method" data-m="guided" aria-pressed="${st.method === 'guided'}">Guided</button><button class="${st.method === 'constructed' ? 'on' : ''}" data-act="method" data-m="constructed" aria-pressed="${st.method === 'constructed'}">Constructed</button></div>`;

  // ------------------------------------------------------------------ nav + side
  function renderNav() {
    const R = R0;
    return `<div class="rail-title">The Chronicle</div><ol class="rail">${STEPS.map((s, i) => {
      const locked = i > st.maxStep;
      const I = s.id === 'intro' || locked ? [] : stepIssues(s.id, R);
      const cls = ['rail-item', st.step === s.id ? 'active' : '', locked ? 'locked' : I.length ? 'open' : 'done'].join(' ');
      const status = locked ? 'Sealed' : st.step === s.id ? 'You are here' : s.id === 'intro' ? '' : I.length ? 'Unfinished' : 'Complete';
      return `<li class="${cls}"><button data-act="go" data-step="${s.id}"${locked ? ' disabled title="Complete the previous chapters first"' : ''}${st.step === s.id ? ' aria-current="step"' : ''}>
        <span class="rail-mark"><span>${i === 0 ? '·' : ROMAN[i]}</span></span>
        <span class="rail-label"><span class="rail-name">${esc(s.name)}</span><span class="rail-sub">${esc(status || s.sub.replace('Sentinels: ', ''))}</span></span></button></li>`;
    }).join('')}</ol>`;
  }

  // The Champion Dossier: identity first, mechanics second.
  function renderSide() {
    const R = R0;
    const bg = bgDef(), ps = psDef(), ar = archDef(), shape = shapeDef(), pe = persDef(), rg = regionDef();
    const powers = sortTraits(owned(R, 'power'));
    const quals = sortTraits(owned(R, 'quality'));
    const abs = allAbilities(R);
    const cnt = c => abs.filter(x => x.color === c).length;
    const h = healthCalc(R);
    const i = st.info;
    const row = t => `<li><span class="led-name">${t.key === 'rp-quality' && st.pers.qname ? `<span class="term"${tip(traitTip('rp-quality'))}>${esc(st.pers.qname)}</span>` : traitSpan(t.key)}</span><span class="led-dots"></span>${die(t.die, 'sm')}</li>`;
    const fact = (label, d, extra) => `<div class="dos-fact${d ? '' : ' empty'}"><dt>${label}</dt><dd>${d ? esc(d.rt + (extra || '')) : '—'}</dd></div>`;
    return `<div class="dossier" style="--rc:${rg ? rg.color : 'var(--gold)'}">
      <div class="dos-band"><span class="dos-kicker">Champion Dossier</span><span class="dos-region">${rg ? esc(rg.name) : 'Homeland unknown'}</span></div>
      <div class="dos-id">
        <div class="dos-portrait">${i.portrait ? `<img src="${i.portrait}" alt="">` : sigil(rg ? rg.id : 'compass', 'dos-sigil')}</div>
        <div class="dos-names"><div class="dos-name${i.name ? '' : ' unnamed'}">${esc(i.name || 'Unnamed Champion')}</div>
        <div class="dos-epithet">${i.alias ? esc(i.alias) : pe ? 'the ' + esc(pe.rt) : 'an untold legend'}</div></div>
      </div>
      <dl class="dos-facts">${fact('Origin', bg)}${fact('Source', ps)}${fact('Path', ar, shape && shape !== ar ? ' ' + shape.rt : '')}${fact('Temperament', pe)}</dl>
      <div class="dos-sec"><h4>Powers</h4>${powers.length ? `<ul class="ledger">${powers.map(row).join('')}</ul>` : '<p class="dos-empty">None yet — gained from your Source and Path.</p>'}</div>
      <div class="dos-sec"><h4>Qualities</h4>${quals.length ? `<ul class="ledger">${quals.map(row).join('')}</ul>` : '<p class="dos-empty">None yet — gained from your Origin.</p>'}</div>
      ${R.status ? `<div class="dos-sec"><h4>Status</h4><div class="dos-status"><span class="z g">${die(R.status[0])}<i>Green</i></span><span class="z y">${die(R.status[1])}<i>Yellow</i></span><span class="z r">${die(R.status[2])}<i>Red</i></span>${h ? `<span class="dos-hp"><b>${h.max}</b><i>Health</i></span>` : ''}</div></div>` : ''}
      <div class="dos-sec"><h4>Abilities</h4><p class="dos-counts"><span class="c-g">${cnt('green')} Green</span><span class="c-y">${cnt('yellow')} Yellow</span><span class="c-r">${cnt('red')} Red</span>${pe ? '<span>Out</span>' : ''}</p></div>
      <div class="dos-sec"><h4>Principles</h4>${principlesFinal().map(x => `<p class="dos-principle"><span class="term"${tip(`<h5>${esc(x.p.name)}</h5>${esc(x.p.rp)}`)}>${esc((window.PRINCIPLE_LORE[x.id] || [x.p.name])[0])}</span><small>${esc(x.p.cat)}</small></p>`).join('') || '<p class="dos-empty">None yet.</p>'}</div>
    </div>`;
  }

  // ------------------------------------------------------------------ main render
  const RENDER = { intro: renderIntro, region: renderRegion, background: renderBackground, powersource: renderPowerSource, archetype: renderArchetype, personality: renderPersonality, red: renderRed, retcon: renderRetcon, health: renderHealth, finish: renderFinish };
  // For saves made before step locking existed: unlock up to the first incomplete step.
  function reachedStep() {
    const R = compute();
    for (let i = 1; i < STEPS.length; i++) if (stepIssues(STEPS[i].id, R).length) return i;
    return STEPS.length - 1;
  }
  let lastFlow = null;
  let lastStep = null;
  function render() {
    R0 = compute();
    flowCurrent = null;
    socketAuto = false;
    if (lastStep !== st.step) { ui.socket = null; lastStep = st.step; }
    const rg = regionDef();
    document.body.dataset.region = rg ? rg.id : '';
    document.body.style.setProperty('--region', rg ? rg.color : '');
    if (st.maxStep < 0) st.maxStep = reachedStep();
    if (stepIndex(st.step) > st.maxStep) st.step = STEPS[st.maxStep].id;
    document.getElementById('nav').innerHTML = renderNav();
    // On narrow screens the rail scrolls sideways: keep the current chapter in view.
    const rail = document.querySelector('.rail'), here = rail && rail.querySelector('.rail-item.active');
    if (rail && here && rail.scrollWidth > rail.clientWidth) rail.scrollLeft = here.offsetLeft - (rail.clientWidth - here.offsetWidth) / 2;
    document.getElementById('stage').innerHTML = (RENDER[st.step] || renderIntro)();
    document.getElementById('side').innerHTML = renderSide();
    save();
    // Guide the eye: when a section is completed, scroll to the newly unlocked one.
    if (lastFlow && flowCurrent && lastFlow !== flowCurrent && lastFlow.split(':')[0] === flowCurrent.split(':')[0] && !flowCurrent.endsWith(':done')) {
      const [sid, sec] = flowCurrent.split(':');
      const el = document.getElementById(`flow-${sid}-${sec}`);
      if (el) setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60);
    }
    lastFlow = flowCurrent;
  }
  function renderSideOnly(fromSheet) {
    R0 = compute();
    document.getElementById('side').innerHTML = renderSide();
    const sheet = document.getElementById('sheet-preview');
    if (sheet && !fromSheet) sheet.innerHTML = sheetHtml(R0);
    save();
  }

  // ------------------------------------------------------------------ events
  function roll(sizes) { return sizes.map(d => 1 + Math.floor(Math.random() * dn(d))); }

  function pick(kind, id) {
    if (kind === 'region') st.region = st.region === id ? null : id;
    if (kind === 'bg' && st.bg.id !== id) {
      const old = bgDef();
      st.bg.id = id; st.bg.assign = {};
      delete st.rolls.ps; delete st.rerolls.ps;
      const nw = bgDef();
      if (!old || old.principle !== nw.principle) st.bg.principle = null;
    }
    if (kind === 'ps' && st.ps.id !== id) {
      st.ps.id = id; st.ps.assign = {}; st.ps.extra = {}; delete st.sel['ps-yellow']; delete st.sel['ps-green'];
      for (const k of ['arch', 'base']) { delete st.rolls[k]; delete st.rerolls[k]; }
    }
    if (kind === 'arch' && st.arch.id !== id) {
      const oldCat = archPrincipleCat();
      st.arch.id = id; st.arch.base = null; st.arch.assign = {}; st.arch.extra = {}; st.arch.divMethod = null; st.arch.minionQ = null; st.arch.minionForms = [];
      for (const k of Object.keys(st.sel)) if (k.startsWith('arch-')) delete st.sel[k];
      if (archPrincipleCat() !== oldCat) st.arch.principle = null;
    }
    if (kind === 'base' && st.arch.base !== id) {
      const oldCat = archPrincipleCat();
      st.arch.base = id; st.arch.assign = {}; st.arch.extra = {}; st.arch.minionQ = null; st.arch.minionForms = [];
      for (const k of Object.keys(st.sel)) if (k.startsWith('arch-') && !k.startsWith('arch-mod') && !k.startsWith('arch-div')) delete st.sel[k];
      if (archPrincipleCat() !== oldCat) st.arch.principle = null;
    }
    if (kind === 'pers' && st.pers.id !== id) { st.pers.id = id; st.pers.outTrait = null; st.pers.upgrade = null; }
  }

  function toggleAb(gkey, name, cat) {
    if (gkey === 'red') {
      const s = st.sel.red = st.sel.red || [];
      const i = s.findIndex(e => e.name === name && e.cat === cat);
      if (i >= 0) s.splice(i, 1);
      else {
        const entryDef = (window.RED_ABILITIES.find(c => c.cat === cat) || { list: [] }).list.find(x => x.a === name) || {};
        s.push({ name, cat, use: entryDef.use || null, ch: {} });
      }
      return;
    }
    const g = groups().find(x => x.key === gkey);
    if (!g || g.fixed) return;
    const s = selOf(g);
    const i = s.findIndex(e => e.name === name);
    if (i >= 0) s.splice(i, 1);
    else {
      if (g.count === 1) s.length = 0;
      else if (s.length >= g.count) s.shift();
      s.push({ name, ch: {} });
    }
  }

  document.addEventListener('click', ev => {
    const el = ev.target.closest('[data-act]');
    if (!el) return;
    const act = el.dataset.act;
    if (el.tagName === 'A') ev.preventDefault();
    if (act === 'go') {
      const i = stepIndex(el.dataset.step);
      if (i < 0 || i > st.maxStep) return;                     // can't jump ahead to a step never reached
      st.step = el.dataset.step; hideTip(); render(); window.scrollTo({ top: 0, behavior: 'smooth' }); return;
    }
    if (act === 'back') { const i = stepIndex(st.step); if (i > 0) { st.step = STEPS[i - 1].id; hideTip(); render(); window.scrollTo({ top: 0, behavior: 'smooth' }); } return; }
    if (act === 'next') {
      const i = stepIndex(st.step);
      if (stepIssues(st.step, R0).length) {                    // not finished: point at what's missing
        const cur = document.querySelector('.flow-sec.current');
        if (cur) { cur.scrollIntoView({ behavior: 'smooth', block: 'start' }); cur.classList.remove('pulse'); void cur.offsetWidth; cur.classList.add('pulse'); }
        return;
      }
      if (i < STEPS.length - 1) { st.step = STEPS[i + 1].id; st.maxStep = Math.max(st.maxStep, i + 1); hideTip(); render(); window.scrollTo({ top: 0, behavior: 'smooth' }); }
      return;
    }
    if (act === 'socketOpen') { ui.socket = el.getAttribute('aria-expanded') === 'true' ? '' : el.dataset.bind; render(); return; }
    if (act === 'socket') {
      if (el.getAttribute('aria-disabled') === 'true') {
        el.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-4px)' }, { transform: 'translateX(4px)' }, { transform: 'translateX(0)' }], { duration: 220 });
        showTipFor(el, '<h5>Already bound</h5>Another die holds this trait. Unbind it there first, or choose a different trait.'); setTimeout(hideTip, 1800); return;
      }
      setPath(st, el.dataset.bind, el.dataset.val || null); ui.socket = null; hideTip(); render();
      const next = document.querySelector('.socket.open .rune');           // keyboard users land in the next tray
      if (next && document.activeElement === document.body) next.focus({ preventScroll: true });
      return;
    }
    if (act === 'expand' || act === 'collapse') { ui.expand[el.dataset.key] = act === 'expand'; render(); return; }
    if (act === 'jump') { const t = document.getElementById(el.dataset.target); if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' }); return; }
    if (act === 'method') { st.method = el.dataset.m; render(); return; }
    if (act === 'roll') {
      const key = el.dataset.key;
      if (el.dataset.re) st.rerolls[key] = (st.rerolls[key] || 0) + 1;
      st.rolls[key] = roll(el.dataset.sizes.split(','));
      render(); return;
    }
    if (act === 'pick') {
      if (el.dataset.locked && st.method === 'guided') { flash(el); return; }
      pick(el.dataset.kind, el.dataset.id); ui.expand[el.dataset.kind] = false; render(); return;
    }
    if (act === 'toggleAb') { toggleAb(el.dataset.g, el.dataset.name, el.dataset.cat); render(); return; }
    if (act === 'principle') { if (el.dataset.slot === 'bg') st.bg.principle = el.dataset.id; else st.arch.principle = el.dataset.id; ui.expand['pr-' + el.dataset.slot] = false; render(); return; }
    if (act === 'divMethod') { st.arch.divMethod = el.dataset.id; delete st.sel['arch-divmethod']; render(); return; }
    if (act === 'minionForm') {
      const f = st.arch.minionForms = st.arch.minionForms || [];
      const i = f.indexOf(el.dataset.name);
      if (i >= 0) f.splice(i, 1); else f.push(el.dataset.name);
      render(); return;
    }
    if (act === 'retcon') {
      const was = st.retcon.type;
      st.retcon = { type: was === el.dataset.id ? null : el.dataset.id };
      if (was === 'extra-red' && st.sel.red && st.sel.red.length > 2) st.sel.red.length = 2;
      render(); return;
    }
    if (act === 'hmode') { st.health.mode = el.dataset.m; if (el.dataset.m === 'roll' && !st.health.roll) st.health.roll = roll(['d8'])[0]; render(); return; }
    if (act === 'hroll') { st.health.roll = roll(['d8'])[0]; render(); return; }
    if (act === 'export') { exportJson(); return; }
    if (act === 'pdf') { exportPdf(); return; }
    if (act === 'pdfOfficial') { exportOfficialPdf(); return; }
    if (act === 'clearPortrait') { st.info.portrait = null; render(); return; }
    if (act === 'print') {
      if (stepIndex('finish') > st.maxStep) { showTipFor(el, '<h5>Not yet</h5>Finish creating your champion first — the sheet is printed from the last step.'); setTimeout(hideTip, 2200); return; }
      st.step = 'finish'; render(); setTimeout(() => window.print(), 150); return;
    }
    if (act === 'reset') { if (confirm('Start over? This clears your current champion.')) { st = blank(); render(); } return; }
  });

  function bindValue(el) {
    let v = el.type === 'checkbox' ? el.checked : el.value;
    if (v === '') v = null;
    let path = el.dataset.bind;
    if (el.dataset.rename) { st.renames[el.dataset.rename] = el.value; return; }
    if (path.startsWith('pers.qname') || path.startsWith('info.') || path.startsWith('traitNames.') || path === 'arch.notes' || (path.startsWith('play.') && el.type !== 'checkbox')) v = el.value;
    setPath(st, path, v);
  }
  document.addEventListener('change', ev => {
    const el = ev.target;
    if (el.id === 'import-file') { importJson(el.files[0]); el.value = ''; return; }
    if (el.id === 'portrait-file') { loadPortrait(el.files[0]); el.value = ''; return; }
    if (el.id === 'template-file') {
      const f = el.files[0]; el.value = '';
      if (f) f.arrayBuffer().then(b => { pdfTemplate = b; exportOfficialPdf(); });
      return;
    }
    if (!el.dataset.bind) return;
    bindValue(el);
    if (el.dataset.live && !el.dataset.commit) { renderSideOnly(!!el.closest('#sheet-preview')); document.getElementById('nav').innerHTML = renderNav(); return; }
    render();
  });
  document.addEventListener('keydown', ev => {
    if (ev.key === 'Enter' && ev.target.dataset && ev.target.dataset.commit) { ev.preventDefault(); ev.target.blur(); }
  });
  document.addEventListener('input', ev => {
    const el = ev.target;
    if (el.dataset.filter) {                                   // narrow a socket tray as you type
      const q = el.value.trim().toLowerCase(), tray = el.closest('.tray');
      tray.querySelectorAll('.rune').forEach(r => { r.hidden = !!q && !r.dataset.q.includes(q); });
      tray.querySelectorAll('.tray-group').forEach(g => { g.hidden = !g.querySelector('.rune:not([hidden])'); });
      return;
    }
    if (!el.dataset.bind || !el.dataset.live) return;
    bindValue(el);
    renderSideOnly(!!el.closest('#sheet-preview'));
  });

  // Downscale the portrait so it fits comfortably in browser storage and the PDF.
  function loadPortrait(file) {
    if (!file) return;
    const r = new FileReader();
    r.onload = () => {
      const img = new Image();
      img.onload = () => {
        const max = 700, k = Math.min(1, max / Math.max(img.width, img.height));
        const c = document.createElement('canvas');
        c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        st.info.portrait = c.toDataURL('image/jpeg', 0.85);
        render();
      };
      img.src = r.result;
    };
    r.readAsDataURL(file);
  }

  function flash(el) {
    el.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-4px)' }, { transform: 'translateX(4px)' }, { transform: 'translateX(0)' }], { duration: 220 });
    showTipFor(el, '<h5>Not available with this roll</h5>Guided method: pick an entry matching one die or the sum of two dice. Use your one re-roll, or switch to the Constructed method.');
    setTimeout(hideTip, 1800);
  }

  function exportJson() {
    const blob = new Blob([JSON.stringify(st, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = (st.info.name || 'runeterra-champion').replace(/[^\w-]+/g, '_') + '.json';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }
  function importJson(file) {
    if (!file) return;
    const r = new FileReader();
    r.onload = () => {
      try {
        const s = JSON.parse(r.result);
        if (!s || s.v !== 1) throw new Error('Not a Champion Forge file');
        st = upgradeState(s); render();
      } catch (e) { alert('Could not import: ' + e.message); }
    };
    r.readAsText(file);
  }

  // ------------------------------------------------------------------ tooltip
  const tipEl = document.getElementById('tip');
  let tipTarget = null;
  function place(x, y) {
    const pad = 14, w = tipEl.offsetWidth, h = tipEl.offsetHeight;
    let left = x + pad, top = y + pad;
    if (left + w > window.innerWidth - 8) left = Math.max(8, x - w - pad);
    if (top + h > window.innerHeight - 8) top = Math.max(8, y - h - pad);
    tipEl.style.left = left + 'px'; tipEl.style.top = top + 'px';
  }
  function showTipFor(el, html, x, y) {
    tipEl.innerHTML = html;
    tipEl.classList.add('show');
    if (x == null) { const r = el.getBoundingClientRect(); x = r.left + r.width / 2; y = r.bottom; }
    place(x, y);
  }
  function hideTip() { tipEl.classList.remove('show'); tipTarget = null; }
  document.addEventListener('mouseover', ev => {
    const el = ev.target.closest('[data-tip]');
    if (!el) { if (tipTarget) hideTip(); return; }
    if (el === tipTarget) return;
    tipTarget = el;
    showTipFor(el, el.dataset.tip, ev.clientX, ev.clientY);
  });
  document.addEventListener('mousemove', ev => { if (tipTarget) place(ev.clientX, ev.clientY); });
  document.addEventListener('scroll', () => { if (tipTarget) hideTip(); }, { passive: true });
  // Touch: tap an info/term element to toggle its tooltip.
  document.addEventListener('touchstart', ev => {
    const el = ev.target.closest('.term, .info, .die, .ab-type, .pill, .slot-chip');
    if (el && el.dataset.tip) {
      if (tipTarget === el) { hideTip(); return; }
      tipTarget = el;
      const t = ev.touches[0];
      showTipFor(el, el.dataset.tip, t.clientX, t.clientY);
    } else if (tipTarget) hideTip();
  }, { passive: true });

  render();
})();
