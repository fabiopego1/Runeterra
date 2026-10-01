/* Runeterra Champion Forge — character builder for a Runeterra game on the Sentinels RPG system. */
(() => {
  'use strict';

  const tr = window.T;
  const PT = window.LANG === 'pt';
  // Empty-value marker; Portuguese copy avoids the em dash.
  const BLANK = PT ? 'a definir' : '—';
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
    key: 'rp-quality', sc: 'Roleplaying Quality (Special)', rt: tr('Signature Quality'), cat: 'Q:special', kind: 'quality',
    desc: tr('A custom quality that sums up your hero — your "high concept". Rather than a narrow skill, it covers many parts of who you are.'),
    lore: tr('e.g. "Hextech Prodigy of the Academy", "Last Kinkou of the Eastern Isles", "Bilgewater\'s Luckiest Liar".')
  };
  const kindWord = (k, plural) => tr(plural ? k + 's' : k).replace(/^qualitys$/, 'qualities');
  const catName = c => (c === 'Q:special' ? tr('Special') : (CATS[c] ? CATS[c].rt : c));
  // "an Athletic power" / "Athletic powers" as a phrase: Portuguese agrees the adjective ("poderes Atléticos", "qualidades Físicas").
  const PT_CAT = {
    'P:athletic': ['poder Atlético', 'poderes Atléticos'], 'P:elemental': ['poder Elemental/de Energia', 'poderes Elementais/de Energia'],
    'P:hallmark': ['poder Emblemático', 'poderes Emblemáticos'], 'P:intellectual': ['poder Intelectual', 'poderes Intelectuais'],
    'P:materials': ['poder de Materiais', 'poderes de Materiais'], 'P:mobility': ['poder de Mobilidade', 'poderes de Mobilidade'],
    'P:psychic': ['poder Psíquico', 'poderes Psíquicos'], 'P:selfcontrol': ['poder de Autocontrole', 'poderes de Autocontrole'],
    'P:technological': ['poder Tecnológico', 'poderes Tecnológicos'], 'Q:information': ['qualidade de Informação', 'qualidades de Informação'],
    'Q:mental': ['qualidade Mental', 'qualidades Mentais'], 'Q:physical': ['qualidade Física', 'qualidades Físicas'], 'Q:social': ['qualidade Social', 'qualidades Sociais']
  };
  const catPhrase = (c, plural) => (PT && PT_CAT[c] ? PT_CAT[c][plural ? 1 : 0]
    : tr(CATS[c] && CATS[c].kind === 'power' ? (plural ? '{cat} powers' : '{cat} power') : (plural ? '{cat} qualities' : '{cat} quality'), { cat: catName(c) }));
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
  // Work in progress, hidden from players: the "Evolve your champion" tools (open the Ficha with ?wip to see them).
  const WIP = /[?&]wip\b/.test(location.search);
  const STORE = 'runeterra-forge-v1';   // the champion open now (the Forge and the Ficha page both read it)
  // Every champion also has its own slot, and the roster lists them in the order they were made.
  const ROSTER = 'runeterra-forge-roster-v1', SLOT = id => 'runeterra-forge-c-' + id;
  const newId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  const blank = () => ({
    v: 1, cid: newId(), updated: Date.now(), noRetcon: true, step: 'intro', maxStep: 0, method: 'constructed', people: null, region: null, unlocked: {},   // Construído is the default method
    rolls: {}, rerolls: {},
    bg: { id: null, assign: {}, principle: null },
    ps: { id: null, assign: {}, extra: {} },
    arch: { id: null, base: null, assign: {}, principle: null, extra: {}, divMethod: null, minionQ: null, minionForms: [], notes: '' },
    pers: { id: null, qname: '', qdesc: '', outTrait: null, upgrade: null, id2: null },
    health: { trait: null, mode: 'fixed', roll: null, rerolled: false },
    pch: {},
    sel: {},
    info: { name: '', alias: '', player: '', gender: '', age: '', height: '', eyes: '', hair: '', skin: '', build: '', costume: '', notes: '', portrait: null },
    play: { hp: [], rw: [], issues: [], coll: [], cdone: [], current: null, notes: [] },
    renames: {}, traitNames: {},
    evo: { traits: {}, principles: {}, abilities: {}, log: [] },   // changes between collections, laid over the creation choices
    tour: { on: true, seen: {} }   // guided popups for a new champion, one per chapter
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
    if (!s.cid) out.cid = newId();   // saves from before the roster
    out.info = Object.assign(blank().info, s.info || {});
    if (s.info && s.info.look && !out.info.costume) out.info.costume = s.info.look;
    if (s.info && s.info.pronouns && !out.info.gender) out.info.gender = s.info.pronouns;
    out.play = Object.assign(blank().play, s.play || {});
    out.evo = Object.assign(blank().evo, s.evo || {});
    // Champions made before the guide existed are already under way: keep the guide off for them.
    out.tour = s.tour ? Object.assign({ on: true, seen: {} }, s.tour) : { on: !(out.maxStep > 1), seen: {} };
    out.maxStep = typeof s.maxStep === 'number' ? s.maxStep : -1;   // older saves: recomputed after load
    // Saves from before the People chapter: every chapter after the welcome moved one place down.
    if (!('people' in s) && out.maxStep >= 1) out.maxStep += 1;
    // Saves from before the Twist of Fate chapter was removed: the chapters after Ultimates moved up one place,
    // and a third Ultimate from "Hidden Reserves" no longer has a source.
    if (!s.noRetcon) {
      if (out.maxStep >= 9) out.maxStep -= 1;
      if (out.step === 'retcon') out.step = 'health';
      if (out.sel && Array.isArray(out.sel.red) && out.sel.red.length > 2) out.sel.red.length = 2;
    }
    out.noRetcon = true; delete out.retcon;
    // Older saves stored element choices as "Energia Hextec Bruta (Nuclear)", or under an earlier name: use the current name.
    const EL = window.TRAIT_CATEGORIES['P:elemental'].items;
    const OLD_EL = { 'Gelo & Gelo Verdadeiro': 'cold', 'Poder Celestial': 'cosmic', 'Relâmpago': 'electricity', 'Chama': 'fire', 'Sombra & Névoa Negra': 'infernal', 'Energia Hextec Bruta': 'nuclear', 'Luz': 'radiant', 'Radiante': 'radiant', 'Tempestade & Vento': 'weather' };
    const clean = v => {
      if (typeof v !== 'string') return v;
      const base = v.replace(/ \([^)]*\)$/, '');
      const m = EL.find(i => v === i[2] + ' (' + i[1] + ')') || EL.find(i => i[0] === OLD_EL[base]);
      return m ? m[2] : v;
    };
    for (const list of Object.values(out.sel || {})) if (Array.isArray(list)) for (const e of list) if (e && e.ch) for (const k of Object.keys(e.ch)) e.ch[k] = clean(e.ch[k]);
    for (const k of Object.keys(out.pch || {})) out.pch[k] = clean(out.pch[k]);
    if (out.pers && out.pers.qname && out.pers.qok === undefined) out.pers.qok = true;   // named before the Confirm button existed
    // A save that never left the intro has not really started: open it on the default method (Construído).
    out.method = 'constructed';   // the Guided method (rolling for options) is no longer offered
    return out;
  }
  const rosterIds = () => { try { const r = JSON.parse(localStorage.getItem(ROSTER)); return Array.isArray(r) ? r : []; } catch (e) { return []; } };
  let saveWarned = false;
  function save() {
    st.updated = Date.now();
    try {
      const json = JSON.stringify(st);
      localStorage.setItem(STORE, json);
      localStorage.setItem(SLOT(st.cid), json);
      const ids = rosterIds();
      if (!ids.includes(st.cid)) { ids.push(st.cid); localStorage.setItem(ROSTER, JSON.stringify(ids)); }
    } catch (e) {   // storage full (usually portraits) or blocked
      if (!saveWarned && typeof rosterHooks !== 'undefined') { saveWarned = true; rosterHooks.warn(); }
    }
  }

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
  const peopleDef = () => byId(window.PEOPLES || [], st.people);
  // The archetype whose dice/abilities are used (base archetype for Divided/Modular).
  function shapeDef() {
    const a = archDef();
    if (!a) return null;
    if (a.divided || a.modular) return byId(window.ARCHETYPES, st.arch.base);
    return a;
  }
  // The Path whose abilities you gain: a Modular hero only takes its base Path's dice rules (p.96), so no minion
  // forms or extra Red abilities from it.
  const abilityShape = () => { const a = archDef(), s = shapeDef(); return a && s && !a.modular ? s : null; };

  // ------------------------------------------------------------------ html helpers
  const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const tip = html => ` data-tip="${esc(html)}"`;
  // the Signature Quality takes the name the player confirmed, everywhere it shows up
  const qualName = () => (st.pers.qok && st.pers.qname && st.pers.qname.trim()) || '';
  // ...and the short description the player wrote for it (shown wherever the quality's tooltip appears)
  const QDESC_MAX = 100;
  const qReady = () => !!((st.pers.qname || '').trim() && (st.pers.qdesc || '').trim());
  const qualDesc = () => (st.pers.qok && st.pers.qdesc && st.pers.qdesc.trim()) || '';
  const traitName = k => (k === 'rp-quality' && qualName()) || st.traitNames[k] || (TRAIT[k] ? TRAIT[k].rt : k);
  const baseTraitName = k => (TRAIT[k] ? TRAIT[k].rt : k);
  // a renamed power/quality/ability shows its original name under the player's one
  const renamedTrait = k => !!(st.traitNames[k] && st.traitNames[k].trim() && st.traitNames[k].trim() !== baseTraitName(k));
  const origTag = name => `<small class="hs-orig">${esc(name)}</small>`;

  function dieTip(d) {
    const i = window.DICE_INFO[d] || {};
    return `<h5>${d.toUpperCase()}</h5>` +
      tr('In the Sentinels system every trait is a die — bigger is better (d4 → d6 → d8 → d10 → d12). ') +
      tr('Each roll uses a pool of <b>one power + one quality + your status die</b>.') +
      `<ul><li>${tr('As a power:')} ${esc(i.power || (PT ? 'não se aplica' : '—'))}</li><li>${tr('As a quality:')} ${esc(i.quality || (PT ? 'não se aplica' : '—'))}</li><li>${tr('As a status die:')} ${esc(i.status || (PT ? 'não se aplica' : '—'))}</li></ul>` +
      (i.note ? `<small>${esc(i.note)}</small>` : '');
  }
  const die = (d, cls = '') => d ? `<span class="die ${d} ${cls}"${tip(dieTip(d))}>${d.slice(1)}</span>` : '';

  function traitTip(k) {
    const t = TRAIT[k];
    if (!t) return esc(k);
    const c = CATS[t.cat];
    const own = k === 'rp-quality' && qualDesc();
    return `<h5>${esc(traitName(k))}</h5><div class="sc-line">${renamedTrait(k) || (k === 'rp-quality' && qualName()) ? esc(baseTraitName(k)) + ' · ' : ''}${kindWord(t.kind)} · ${esc(catName(t.cat))}</div>` +
      (own ? `${esc(own)}<hr><small>${esc(t.desc)}</small>` : `${esc(t.desc)}<hr><em>${tr('In Runeterra:')}</em> ${esc(t.lore)}`) +
      (c && c.note ? `<hr><small>${esc(c.note)}</small>` : '') +
      (t.kind === 'power' ? `<hr><small>${tr('Powers are what makes you exceptional — the first die in your pool.')}</small>` : `<hr><small>${tr('Qualities are how you use your powers — the second die in your pool.')}</small>`);
  }
  const traitSpan = k => `<span class="term"${tip(traitTip(k))}>${esc(traitName(k))}</span>`;

  function optsText(opts) {
    return (opts || []).map(o => {
      if (o === 'P:*') return tr('any power');
      if (o === 'Q:*') return tr('any quality');
      if (o.includes(':')) {
        const c = CATS[o];
        const span = `<span class="term"${tip(`<h5>${esc(c.rt)}</h5><div class="sc-line">${tr(c.kind === 'power' ? 'Powers' : 'Qualities')}</div>` + c.items.map(i => esc(i[2])).join(', '))}>${esc(c.rt)}</span>`;
        if (PT && PT_CAT[o]) return `qualquer <span class="term"${span.match(/ data-tip="[^"]*"/)[0]}>${esc(PT_CAT[o][0])}</span>`;
        return tr(c.kind === 'power' ? 'any {cat} power' : 'any {cat} quality', { cat: span });
      }
      return TRAIT[o] ? traitSpan(o) : esc(o);
    }).join(', ');
  }

  // Glossary-aware rules text
  const TERM_RE = /\[(d4|d6|d8|d10|d12)\]|\[([^\]]+)\]|\b(Max\+Mid\+Min|Max\+Mid|Max\+Min|Mid\+Min|Min die|Mid die|Max die|Green zone|Yellow zone|Red zone|status die|minor twist|major twist|hero points?|Attack(?:s|ed|ing)?|Defend(?:s|ed|ing)?|Overcome|Overcoming|Boost(?:s|ed|ing)?|Hinder(?:s|ed|ing)?|Recover(?:s|ing)?|persistent|exclusive|irreducible|bonus(?:es)?|penalt(?:y|ies)|minions?|lieutenants?|Reactions?|doubles|nearby|close|scene|collection|Health|environment(?:al)?|twists?)\b/gi;
  // Portuguese rules text: same glossary, Portuguese words (accent-aware boundaries; "próximo turno" is not "nearby").
  const TERM_RE_PT = /\[(d4|d6|d8|d10|d12)\]|\[([^\]]+)\]|(?<![A-Za-zÀ-ÿ])(Máx\+Médio\+Mín|Máx\+Médio|Máx\+Mín|Médio\+Mín|dados? Mín(?!\+)|dados? Médio(?!\+)|dados? Máx(?!\+)|Zona Verde|Zona Amarela|Zona Vermelha|dados? de status|reviravoltas? menor(?:es)?|reviravoltas? maior(?:es)?|pontos? de herói|Atac[a-zà-ÿ]*|Ataque[a-zà-ÿ]*|Defend[a-zà-ÿ]*|Defesa|Super[aeo][a-zà-ÿ]*|Fortale[a-zà-ÿ]*|Atrapalh[a-zà-ÿ]*|Recuper[a-zà-ÿ]*|persistentes?|exclusiv[oa]s?|irredutíve(?:l|is)|bônus|penalidades?|lacaios?|tenentes?|Reaç(?:ão|ões)|dados iguais|próxim[oa]s?(?! (?:turno|rodada|vez|ação|edição))|cenas?|coleç(?:ão|ões)|Vida|ambientes?|ambienta(?:l|is)|reviravoltas?)(?![A-Za-zÀ-ÿ])/g;
  const GLOSS_PT = [[/^máx\+médio\+mín/, 'Max+Mid+Min'], [/^máx\+médio/, 'Max+Mid'], [/^máx\+mín/, 'Max+Min'], [/^médio\+mín/, 'Mid+Min'], [/^dados? mín/, 'Min die'], [/^dados? médio/, 'Mid die'], [/^dados? máx/, 'Max die'],
    [/^zona verde/, 'Green zone'], [/^zona amarela/, 'Yellow zone'], [/^zona vermelha/, 'Red zone'], [/^dados? de status/, 'status die'], [/^reviravoltas? men/, 'minor twist'], [/^reviravoltas? mai/, 'major twist'],
    [/^pontos? de herói/, 'hero point'], [/^atac/, 'Attack'], [/^defe/, 'Defend'], [/^super/, 'Overcome'], [/^fortale/, 'Boost'], [/^atrapalh/, 'Hinder'], [/^recuper/, 'Recover'], [/^persist/, 'persistent'],
    [/^exclusiv/, 'exclusive'], [/^irredut/, 'irreducible'], [/^bônus/, 'bonus'], [/^penalidade/, 'penalty'], [/^lacaio/, 'minion'], [/^tenente/, 'lieutenant'], [/^reaç/, 'Reaction'], [/^dados iguais/, 'doubles'],
    [/^próxim/, 'nearby'], [/^cena/, 'scene'], [/^coleç/, 'collection'], [/^vida$/, 'Health'], [/^ambient/, 'environment'], [/^reviravolta/, 'twist']];
  const glossTitle = k => (PT && window.I18N.glossLabel && window.I18N.glossLabel[k]) || k;
  function glossKey(m) {
    const l = m.toLowerCase();
    if (PT) { const hit = GLOSS_PT.find(([re]) => re.test(l)); if (hit) return hit[1]; }
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

  // Rules text shown to the player: pt-BR version of the same text when Portuguese is on (tokens stay in English).
  const ruleSrc = s => (PT && window.I18N.text[s]) || s;
  const TOKEN_PT = { 'power': 'poder', 'quality': 'qualidade', 'power/quality': 'poder/qualidade', 'Self Control power': 'poder de Autocontrole', 'Psychic power': 'poder Psíquico', 'Mental quality': 'qualidade Mental', 'Signature Vehicle': 'Montaria Emblemática', 'Signature Weaponry': 'Arma Emblemática', 'a power gained from your archetype': 'um poder ganho do seu Caminho', 'a quality gained from your archetype': 'uma qualidade ganha do seu Caminho', 'energy/element': 'energia/elemento', 'element/energy': 'elemento/energia', 'elemental/energy': 'elemental/energia', 'element': 'elemento', 'basic action': 'ação básica', 'actions': 'ações', 'action': 'ação',
    'element/energy you have a related power for': 'elemento/energia de um poder que você tem', 'energy/element you have a related power for': 'energia/elemento de um poder que você tem', 'physical or energy': 'físico ou de energia', 'Boost or Hinder': 'Fortaleça ou Atrapalhe', 'choose two basic actions': 'escolha duas ações básicas', 'any Physical or Mental quality': 'qualquer qualidade Física ou Mental' };
  const tokenLabel = br => (PT && TOKEN_PT[br]) || br;
  // Plain (tooltip) version of a rules text: pt-BR text with its [tokens] shown in pt-BR too.
  const ruleTip = s => ruleSrc(s).replace(/\[([^\]]+)\]/g, (m, b) => '[' + tokenLabel(b) + ']');
  // entry: {trait, trait2, ch} used to fill brackets.
  function rulesText(text, entry) {
    let out = '';
    let last = 0;
    text = ruleSrc(text);
    text.replace(PT ? TERM_RE_PT : TERM_RE, (m, dsz, br, term, idx) => {
      out += esc(text.slice(last, idx));
      last = idx + m.length;
      if (dsz) out += die(dsz, 'sm');
      else if (br) {
        if (TRAIT_TOKENS[br] !== undefined) {
          const k = entry ? (br === 'quality' && entry.trait2 ? entry.trait2 : entry.trait) : null;
          if (k && TRAIT[k]) out += `<span class="slot-chip"${tip(traitTip(k))}>${esc(traitName(k))}</span>`;
          else out += `<span class="slot-chip unset"${tip(`<h5>[${esc(tokenLabel(br))}]</h5>` + tr('Placeholder: when you take this ability you pick which {what} it uses. That choice is fixed on your sheet (it can only change when your champion evolves).', { what: esc(tr(TRAIT_TOKENS[br])) }))}>[${esc(tokenLabel(br))}]</span>`;
        } else if (CHOICE_TOKENS[br] !== undefined) {
          const v = entry && entry.ch && entry.ch[br];
          out += v ? `<span class="slot-chip"${tip(tr('Chosen for <b>[{what}]</b>', { what: esc(tokenLabel(br)) }))}>${esc(tr(v))}</span>`
            : `<span class="slot-chip unset"${tip(`<h5>[${esc(tokenLabel(br))}]</h5>` + tr('A choice you make when taking this ability (e.g. which element, which action). Fixed once chosen.'))}>[${esc(tokenLabel(br))}]</span>`;
        } else {
          out += `<span class="slot-chip"${tip(tr('Decided each time you use the ability.'))}>[${esc(tokenLabel(br))}]</span>`;
        }
      } else {
        const g = window.GLOSSARY[glossKey(term)];
        out += g ? `<span class="term"${tip(`<h5>${esc(glossTitle(glossKey(term)))}</h5>${g}`)}>${esc(term)}</span>` : esc(term);
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
    if (t.includes('[a power gained from your archetype]')) return { kind: 'power', path: true };
    if (t.includes('[a quality gained from your archetype]')) return { kind: 'quality', path: true };
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
  // Is a choice made for a bracketed word valid? Elements must be real ones; "you have a related power for" needs that power.
  const elementKey = v => { const i = CATS['P:elemental'].items.find(x => v && (v === x[0] || v === x[1] || v === x[2])); return i ? i[0] : null; };
  const relatedToken = t => /you have a related power for/.test(t);
  function tokenOk(t, v, pool) {
    const kind = CHOICE_TOKENS[t];
    if (Array.isArray(kind)) return kind.includes(v);
    if (kind === 'element') return !!elementKey(v) && (!relatedToken(t) || pool.includes(elementKey(v)));
    return !!(v && String(v).trim());
  }
  // Does the ability use one of your traits that you pick (not a fixed one like Telepathy)?
  const usesTrait = n => { const q = reqFromText(A[n] && A[n].text); return q.kind !== 'none' && !q.fixed; };
  function choiceTokens(t) {
    const out = [];
    (t || '').replace(/\[([^\]]+)\]/g, (m, b) => { if (CHOICE_TOKENS[b] && !out.includes(b)) out.push(b); return m; });
    return out;
  }
  const displayName = n => n.replace(/ \((PS|Hallmark|Quality|Self Control)\)$/, '');
  // Name shown to the player (pt-BR); the rulebook name is only used internally and on the GM Screen.
  const abName = n => (PT && window.I18N.names[n]) || displayName(n);

  // ------------------------------------------------------------------ core computation
  // swap: traits this step names (a Path's required power or quality). The book's "I've Already Got That"
  // (p.44): if you already have it, you may put a bigger new die on it and use its old die elsewhere in this step.
  // Any other trait you already have cannot be taken again.
  function assignStep(prefix, dice, assign, T, src, swap = []) {
    const slots = dice.map((d, i) => ({ id: prefix + i, die: d }));
    for (let i = 0; i < slots.length; i++) {
      const s = slots[i];
      const k = assign[s.id];
      if (!k || !TRAIT[k]) continue;
      s.key = k;
      if (T[k] && swap.includes(k) && dn(s.die) > dn(T[k].die) && !s.freed) {
        const old = T[k].die;
        s.swap = { from: old, to: s.die };
        T[k].die = s.die; T[k].src.push(src);
        slots.push({ id: 'f' + s.id, die: old, freed: true, from: k });
      } else if (T[k]) {   // already owned: flagged by slotIssues until the player picks something else
        s.upgrade = { from: T[k].die, to: T[k].die };
      } else {
        T[k] = { key: k, die: s.die, src: [src] };
      }
    }
    return slots;
  }
  // Traits a Source's "gain a trait" bonus may take (p.57-72).
  const psExtraKeys = p => { const ex = p.extra, skip = ex.notInOpts ? expand(p.opts) : []; return expand(ex.opts).filter(k => !skip.includes(k)); };
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
      R.psExtraOk = true;   // a bonus choice that no longer fits (the dice changed since) is ignored and flagged
      if (ex && ex.type === 'addTrait' && e.key) {
        if (psExtraKeys(ps).includes(e.key) && !(T[e.key] && dn(T[e.key].die) >= dn(ex.die))) addTrait(T, e.key, ex.die, 'Source'); else R.psExtraOk = false;
      }
      if (ex && ex.type === 'alien' && e.key) {
        const hasD6Power = Object.values(R.before.psExtra).some(t => t.die === 'd6' && TRAIT[t.key].kind === 'power');
        if (hasD6Power && T[e.key] && T[e.key].die === 'd6') T[e.key].die = 'd8';
        else if (!hasD6Power && !T[e.key] && expand(ps.opts).includes(e.key) && TRAIT[e.key].kind === 'power') addTrait(T, e.key, 'd6', 'Source');
        else R.psExtraOk = false;
      }
      if (ex && ex.type === 'cosmos' && (e.down || e.up)) {
        const isP = k => k && T[k] && TRAIT[k].kind === 'power';
        if (isP(e.down) && dn(T[e.down].die) >= 8) T[e.down].die = upDie(T[e.down].die, -1); else if (e.down) R.psExtraOk = false;
        if (isP(e.up) && e.up !== e.down && dn(T[e.up].die) <= 10) T[e.up].die = upDie(T[e.up].die, 1); else if (e.up) R.psExtraOk = false;
      }
    }
    R.before.archetype = snap(T);
    if (ps && ar && shape) {
      R.slots.arch = assignStep('a', ps.archDice, st.arch.assign, T, 'Path', shape.req ? expand(shape.req.any) : []);
      if (ps.id === 'training') R.slots.training = assignStep('t', ['d8'], st.arch.assign, T, 'Path (Training)');
      R.before.archExtra = snap(T);
      if (shape.extra && shape.extra.type === 'addTrait' && st.arch.extra.key) addTrait(T, st.arch.extra.key, shape.extra.die, 'Path');
      if (ar.modular) {
        const n = Object.values(T).filter(t => TRAIT[t.key].kind === 'power').length;
        R.modExtra = Math.max(0, Math.min(2, 4 - n));
        R.before.modExtra = snap(T);
        for (let i = 0; i < R.modExtra; i++) addTrait(T, st.arch.extra['m' + i], 'd6', 'Path (Modular)');
      }
    }
    R.before.personality = snap(T);
    if (pers) {
      T['rp-quality'] = { key: 'rp-quality', die: 'd8', src: ['Temperament'] };
      if (pers.extra === 'impulsive' && st.pers.upgrade && T[st.pers.upgrade] && dn(T[st.pers.upgrade].die) < 12) T[st.pers.upgrade].die = upDie(T[st.pers.upgrade].die);
    }
    R.T = T;
    if (pers) R.status = pers.status.slice();   // status dice
    // Divided (p.95): optionally a second Temperament for the other form. It only changes that form's status dice.
    const pers2 = ar && ar.divided && st.pers.id2 && st.pers.id2 !== st.pers.id ? byId(window.PERSONALITIES, st.pers.id2) : null;
    if (pers && pers2) R.status2 = pers2.status.slice();
    return R;
  }

  const owned = (R, kind) => Object.values(R.T).filter(t => !kind || TRAIT[t.key].kind === kind);
  const sortTraits = list => list.sort((a, b) => dn(b.die) - dn(a.die) || traitName(a.key).localeCompare(traitName(b.key)));

  // ------------------------------------------------------------------ ability groups
  function groups() {
    const G = [];
    const ps = psDef(), ar = archDef(), shape = shapeDef();
    if (ps) {
      G.push({ key: 'ps-yellow', step: 'powersource', color: 'yellow', count: ps.yellow.count, diff: ps.yellow.diff, list: ps.yellow.list, label: tr(ps.yellow.diff ? 'Yellow abilities (choose {n}, each using a different power)' : 'Yellow abilities (choose {n})', { n: ps.yellow.count }), powersOnly: true });
      if (ps.green) G.push({ key: 'ps-green', step: 'powersource', color: 'green', count: ps.green.count, list: ps.green.list, label: tr('Green ability (choose 1)') });
    }
    if (ar) {
      const useShapeAbilities = shape && !ar.modular;
      if (useShapeAbilities) {
        if (shape.fixedGreen) G.push({ key: 'arch-fixed', step: 'archetype', color: 'green', fixed: true, count: shape.fixedGreen.length, list: shape.fixedGreen, label: tr('Green ability (automatic)') });
        const g = shape.green;
        G.push({ key: 'arch-green', step: 'archetype', color: 'green', count: g.count, list: g.list, diff: g.diff, fixed: g.fixed, note: g.note, rules: g.rules, label: g.fixed ? tr('Green abilities (you gain both)') : tr('Green abilities (choose {n})', { n: g.count }) });
        if (shape.yellow) {
          const y = shape.yellow;
          G.push({ key: 'arch-yellow', step: 'archetype', color: 'yellow', count: y.count, list: y.fromGreen ? g.list : y.list, diff: y.diff, note: y.note || (y.rules && y.rules.notGreen ? tr('Using a different power or quality than your Green abilities.') : ''), rules: y.rules, label: tr(y.count > 1 ? 'Yellow abilities (choose {n})' : 'Yellow ability (choose {n})', { n: y.count }) });
        }
        if (shape.forms) {
          G.push({ key: 'arch-formgreen', step: 'archetype', color: 'green', count: 2, list: shape.forms.green, label: tr('Green forms (choose 2 form abilities, one per form)'), note: tr('Each Green form gets a different ability usable only in that form. Record which powers/dice each form uses in your notes.') });
          const used = (st.sel['arch-formgreen'] || []).map(x => x.name);
          G.push({ key: 'arch-formyellow', step: 'archetype', color: 'yellow', count: 1, list: shape.forms.yellow.concat(shape.forms.green.filter(n => !used.includes(n))), label: tr('Yellow form (choose 1)'), note: tr('Your Yellow form may swap powers around and upgrade any two dice by one size.') });
        }
        if (shape.fixedRed) G.push({ key: 'arch-fixedred', step: 'archetype', color: 'red', fixed: true, count: shape.fixedRed.length, list: shape.fixedRed, label: tr('Red ability (automatic)') });
      }
      if (ar.divided && shape) {
        const m = window.DIVIDED.methods.find(x => x.id === st.arch.divMethod);
        if (m) {
          if (m.green) G.push({ key: 'arch-divmethod', step: 'archetype', color: 'green', fixed: true, count: 1, list: m.green, label: tr('Transformation ability (automatic)') });
          else G.push({ key: 'arch-divmethod', step: 'archetype', color: 'green', count: 1, list: m.choose, label: tr('Transformation ability (choose 1)') });
        }
        G.push({ key: 'arch-divafter', step: 'archetype', color: 'green', count: 1, list: window.DIVIDED.after, label: tr('Divided nature (choose 1)') });
      }
      if (ar.modular && shape) {
        const M = window.MODULAR;
        G.push({ key: 'arch-modfixg', step: 'archetype', color: 'green', fixed: true, count: 1, list: M.fixed.green, label: tr('Green (automatic)') });
        G.push({ key: 'arch-modfixy', step: 'archetype', color: 'yellow', fixed: true, count: 1, list: M.fixed.yellow, label: tr('Yellow (automatic)') });
        G.push({ key: 'arch-modfixr', step: 'archetype', color: 'red', fixed: true, count: 1, list: M.fixed.red, label: tr('Red (automatic)') });
        G.push({ key: 'arch-modgreen', step: 'archetype', color: 'green', count: 1, list: M.green.map(x => x.name), modes: M.green, label: tr('Green mode (choose 1 besides your default mode)') });
        G.push({ key: 'arch-modyellow', step: 'archetype', color: 'yellow', count: 2, list: M.yellow.map(x => x.name), modes: M.yellow, label: tr('Yellow modes (choose 2)') });
        G.push({ key: 'arch-modred', step: 'archetype', color: 'red', count: 1, list: M.red.map(x => x.name), modes: M.red, label: tr('Red mode (choose 1)') });
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
    const base = ctx.pool || Object.keys(R.T);
    let pool = base.slice();
    if (req.kind === 'none') return { req, keys: [] };
    if (req.only) pool = pool.filter(k => req.only.includes(k));
    if (req.path) pool = pool.filter(k => R.T[k].src.some(x => /^Path/.test(x)));   // a trait gained from your Path
    if (ctx.use) pool = pool.filter(k => ctx.use.includes(k));
    if (req.cat) pool = pool.filter(k => TRAIT[k].cat === req.cat);
    // An Ultimate's category narrows the trait of the same kind: for "[power] ... [quality]" in a quality
    // category (e.g. Harmony, Mental qualities) it is the quality that must be Mental, not the power.
    const catKind = ctx.cat ? (ctx.cat[0] === 'Q' ? 'quality' : 'power') : null;
    const catOnSecond = !!(req.second && catKind === req.second);
    if (ctx.cat && !catOnSecond) pool = pool.filter(k => TRAIT[k].cat === ctx.cat);
    if (req.kind !== 'any') pool = pool.filter(k => TRAIT[k].kind === req.kind);
    if (ctx.powersOnly && req.kind === 'any') pool = pool.filter(k => TRAIT[k].kind === 'power');
    const keys2 = req.second ? base.filter(k => TRAIT[k].kind === req.second && (!catOnSecond || TRAIT[k].cat === ctx.cat)) : null;
    return { req, keys: sortTraits(pool.map(k => R.T[k])).map(t => t.key), keys2 };
  }

  // block: { traitKey: why } for traits that this choice may not repeat (shown greyed out and not selectable).

  // The same choice as a row of chips: every option in view, with its die, instead of a closed dropdown.
  function traitChips(bind, keys, sel, block = {}) {
    if (!keys.length) return '';
    return `<div class="tchips" role="radiogroup">${keys.map(k => {
      const no = block[k] && k !== sel, t = R0.T[k];
      return `<button type="button" class="tchip${k === sel ? ' on' : ''}" role="radio" aria-checked="${k === sel}" data-act="setBind" data-bind="${bind}" data-val="${k}"${no ? ' disabled' : ''}${tip(traitTip(k) + (no ? `<hr><small>${esc(block[k])}</small>` : ''))}>${t ? die(t.die, 'sm') : ''}<span>${esc(traitName(k))}</span><small>${tr(TRAIT[k].kind)}</small></button>`;
    }).join('')}</div>`;
  }
  const valueChips = (bind, vals, sel, label = x => x) => `<div class="tchips" role="radiogroup">${vals.map(v => `<button type="button" class="tchip${v === sel ? ' on' : ''}" role="radio" aria-checked="${v === sel}" data-act="setBind" data-bind="${bind}" data-val="${esc(v)}"><span>${esc(label(v))}</span></button>`).join('')}</div>`;

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
  // An ability uses the traits you had when you took it: a Source's abilities those of the first two chapters,
  // a Path's those you have by the end of the Path chapter (p.46).
  const groupPool = (g, R) => Object.keys(g.step === 'powersource' ? R.before.archetype : R.before.personality);
  // The trait checks shared by every chosen ability (Source, Path and Ultimates).
  function traitIssues(e, al, R, pool) {
    const I = [], ab = abName(e.name);
    if (al.req.kind !== 'none' && !al.req.fixed && !e.trait) I.push(tr('Choose which power/quality “{ab}” uses.', { ab }));
    if (al.req.fixed && !R.T[al.req.only[0]]) I.push(tr('“{ab}” requires {trait}, which you don\'t have.', { ab, trait: traitName(al.req.only[0]) }));
    const uses = al.req.kind !== 'none' && !al.req.fixed;   // (a trait left on an ability that uses none is ignored)
    if (uses && e.trait && !R.T[e.trait]) I.push(tr('“{ab}” uses {trait}, which you no longer have.', { ab, trait: traitName(e.trait) }));
    else if (uses && e.trait && !al.keys.includes(e.trait)) I.push(tr('“{ab}” cannot use {trait}: choose another.', { ab, trait: traitName(e.trait) }));
    if (al.req.second && !e.trait2) I.push(tr('Choose the quality for “{ab}”.', { ab }));
    else if (al.req.second && !(al.keys2 || []).includes(e.trait2)) I.push(tr('“{ab}” cannot use {trait}: choose another.', { ab, trait: traitName(e.trait2) }));
    for (const t of choiceTokens(A[e.name] && A[e.name].text)) if (!tokenOk(t, (e.ch || {})[t], pool)) I.push(tr('Choose [{what}] for “{ab}”.', { what: tokenLabel(t), ab }));
    return I;
  }
  function groupIssues(g, R) {
    const I = [];
    const s = selOf(g);
    if (!g.fixed && s.length !== g.count) I.push(tr('Pick {n} ({have}/{n} chosen).', { n: g.count, have: s.length }));
    if (new Set(s.map(e => e.name)).size !== s.length) I.push(tr('You picked the same ability twice.'));
    const used = [];
    let missing = 0;
    const pool = groupPool(g, R);
    for (const e of s) {
      const al = allowedTraits(R, e.name, { powersOnly: g.powersOnly, use: groupUse(g, R), pool });
      I.push(...traitIssues(e, al, R, pool));
      if (e.trait && usesTrait(e.name)) used.push(e.trait);
      if (usesTrait(e.name) && !e.trait) missing++;
    }
    if (g.diff && new Set(used).size !== used.length) I.push(tr('Each ability must use a different power/quality.'));
    const ru = g.rules || {};
    // complete: every ability picked and every one that uses a trait has it (some, like Deflect, use none)
    const full = s.length === g.count && !missing;
    if (full && ru.minDistinct && new Set(used.filter(k => !ru.distinctKind || TRAIT[k].kind === ru.distinctKind)).size < ru.minDistinct) I.push(tr(ru.distinctKind === 'power' ? 'Use at least {n} different powers across these abilities.' : 'Use at least {n} different powers/qualities across these abilities.', { n: ru.minDistinct }));
    if (full && ru.needs) {
      const fits = (k, n) => (n.any ? expand(n.any).includes(k) : true) && (n.kind ? TRAIT[k].kind === n.kind : true);
      const cover = (i, left) => i === ru.needs.length || left.some((k, j) => fits(k, ru.needs[i]) && cover(i + 1, left.filter((_, x) => x !== j)));
      if (!cover(0, used)) I.push(tr('These abilities must include: {list}.', { list: ru.needs.map(n => tr('one using {what}', { what: tr(n.label) })).join(tr(', and ')) }));
    }
    if (ru.notGreen) {
      const greens = (st.sel['arch-green'] || []).filter(e => usesTrait(e.name)).map(e => e.trait).filter(Boolean);
      for (const e of s) if (e.trait && usesTrait(e.name) && greens.includes(e.trait)) I.push(tr('“{ab}” must use a different power or quality than your Green abilities ({trait} is already used there).', { ab: abName(e.name), trait: traitName(e.trait) }));
    }
    return I;
  }
  // Dice placed on something the step does not offer (the list, or a trait of the wrong kind).
  const offList = (slots, keys) => (slots || []).filter(s => s.key && !keys.includes(s.key)).map(s => tr('{trait} is not an option for this {die}.', { trait: traitName(s.key), die: s.die }));
  const slotIssues = slots => (slots || []).filter(s => !s.key).map(s => tr(s.freed ? 'Assign your {die} (the old die of {trait}).' : 'Assign your {die}.', { die: s.die, trait: traitName(s.from || '') }))
    .concat((slots || []).filter(s => s.key && s.upgrade).map(s => tr('You already had {trait}: bind this {die} to something else.', { trait: traitName(s.key), die: s.die })));
  function principleIssues(slot, cat) {
    const cur = slot === 'bg' ? st.bg.principle : st.arch.principle;
    const p = PRINCIPLES.find(x => x.id === cur);
    if (!p || p.cat !== cat) return [tr('Choose {p}.', { p: aPrinciple(cat) })];
    const I = [];
    if (cur === 'energy-element' && !elementKey(st.pch[slot])) I.push(tr('Choose your element for this principle.'));
    if (slot === 'arch' && cur === st.bg.principle) I.push(tr('Your two principles must be different.'));
    return I;
  }
  const aan = w => (/^[aeiou]/i.test(w) ? 'an ' : 'a ') + w;
  // "an Esoteric principle" / "um princípio Esotérico", "um princípio de Especialidade"
  const aPrinciple = cat => (PT ? (cat === 'Esoteric' ? 'um princípio Esotérico' : 'um princípio de ' + tr(cat)) : aan(cat) + ' principle');
  const GROUP_HINT = tr('Tick the boxes to choose, then pick which power or quality each ability uses from its drop-down.');

  function sectionsFor(id, R) {
    const S = [];
    const add = (sid, title, issues, hint, extra) => S.push(Object.assign({ id: sid, title, issues: issues || [], hint: hint || '' }, extra || {}));
    const bg = bgDef(), ps = psDef(), ar = archDef(), shape = shapeDef(), pers = persDef();
    const rollSec = (key, title, picked) => {
      if (st.method === 'guided') add('roll', title, st.rolls[key] || picked ? [] : [tr('Roll the dice.')], tr('Press <b>Roll</b>. The highlighted entries are the ones you can pick.'));
    };
    const groupSecs = step => groups().filter(g => g.step === step).forEach(g => add('g-' + g.key, g.label, groupIssues(g, R), g.note ? esc(g.note) + ' ' + GROUP_HINT : GROUP_HINT, { group: g }));
    if (id === 'people') {
      add('pick', tr('Choose your people'), !st.people ? [tr('Choose a people.')] : peopleLocked(st.people) ? [tr('This people is locked: pick it again and enter the password.')] : [], tr('Click the people your champion belongs to. Hover a card to preview it.'));
    }
    if (id === 'region') {
      add('pick', tr('Choose your homeland'), !st.region ? [tr('Choose a homeland.')] : regionLocked(st.region) ? [tr('This homeland is locked: pick it again and enter the password.')] : [], tr('Click the land your champion comes from. Hover a card to preview it.'));
    }
    if (id === 'background') {
      rollSec('bg', tr('Roll for your Origin'), !!bg);
      add('pick', tr('Choose your Origin'), bg ? [] : [tr('Choose an Origin.')], tr(st.method === 'guided' ? 'Click one of the Origins highlighted by your roll. Hover the <b>i</b> to see what it gives you.' : 'Click one of the Origins. Hover the <b>i</b> to see what it gives you.'));
      const I = bg ? slotIssues(R.slots.bg).concat(offList(R.slots.bg, expand(bg.q.opts).filter(k => TRAIT[k].kind === 'quality'))) : [];
      if (bg && bg.q.mustInclude && !(R.slots.bg || []).some(s => s.key === bg.q.mustInclude)) I.push(tr('One die must go to {trait}.', { trait: traitName(bg.q.mustInclude) }));
      add('assign', tr('Assign your quality dice'), I, tr('Click a die, then choose the quality it becomes. Bigger dice mean you are better at it.'));
      add('principle', bg ? tr('Choose {p}', { p: aPrinciple(bg.principle) }) : tr('Choose your first principle'), bg ? principleIssues('bg', bg.principle) : [], tr('Principles are what your champion believes in. Click one — hover to read it in full.'));
    }
    if (id === 'powersource') {
      rollSec('ps', tr('Roll your Origin dice'), !!ps);
      add('pick', tr('Choose your Source of Power'), ps ? [] : [tr('Choose a Source of Power.')], tr('Click where your champion\'s power comes from. Hover the <b>i</b> for details.'));
      const I = ps ? slotIssues(R.slots.ps).concat(offList(R.slots.ps, expand(ps.opts).concat(ps.required ? [ps.required.key] : []).filter(k => TRAIT[k].kind === 'power'))) : [];
      if (ps && ps.required && !R.T[ps.required.key]) I.push(tr('One die must go to {trait}.', { trait: traitName(ps.required.key) }));
      add('assign', tr('Assign your power dice'), I, tr('Click a die, then choose the power it becomes.'));
      if (ps && ps.extra) {
        const ex = ps.extra, e = st.ps.extra, X = [];
        if (ex.type === 'addTrait' && !e.key) X.push(tr('Make your choice.'));
        if (ex.type === 'alien' && !e.key) X.push(tr('Choose the Void-touched upgrade.'));
        if (ex.type === 'cosmos' && (!e.down || !e.up)) X.push(tr('Choose which power to downgrade and which to upgrade.'));
        if (!R.psExtraOk) X.push(tr('Your bonus choice no longer fits your dice: choose again.'));
        add('extra', tr('Special bonus'), X, esc(ex.text));
      }
      if (ps) groupSecs('powersource');
      else add('g-ph', tr('Choose your abilities'), []);
    }
    if (id === 'archetype') {
      rollSec('arch', tr('Roll your Source dice'), !!ar);
      add('pick', tr('Choose your Path'), ar ? [] : [tr('Choose a Path.')], tr('Click how your champion fights. <b>Two Souls</b> and <b>Stance Master</b> are advanced options.'));
      if (ar && (ar.divided || ar.modular)) {
        if (st.method === 'guided') add('broll', tr('Roll for your base Path'), st.rolls.base || st.arch.base ? [] : [tr('Roll the dice.')], tr('Press <b>Roll</b> for your base Path.'));
        add('base', tr('Choose your base Path'), shape ? [] : [tr('Choose the base Path.')], tr(ar.divided ? 'Your second Path provides your dice and abilities.' : 'Your base Path decides how your dice are assigned.'));
      }
      const I = [];
      if (shape) {
        I.push(...slotIssues(R.slots.arch));
        const pathKeys = expand((shape.req ? shape.req.any : []).concat(shape.powers, shape.quals));
        I.push(...offList((R.slots.arch || []).filter(x => !x.freed), pathKeys), ...offList((R.slots.arch || []).filter(x => x.freed), expand(shape.powers.concat(shape.quals))));
        if (ps && ps.id === 'training') I.push(...slotIssues(R.slots.training), ...offList(R.slots.training, expand(shape.quals).filter(k => TRAIT[k].kind === 'quality')));
        const xk = st.arch.extra.key;
        if (shape.extra && shape.extra.type === 'addTrait' && xk && (!expand(shape.extra.opts).includes(xk) || R.before.archExtra[xk])) I.push(tr('{trait} is not an option for this {die}.', { trait: traitName(xk), die: shape.extra.die }));
        if (ar.modular) for (let i = 0; i < (R.modExtra || 0); i++) {
          const k = st.arch.extra['m' + i];
          if (k && (!TRAIT[k] || TRAIT[k].kind !== 'power' || R.before.modExtra[k] || Object.keys(st.arch.extra).some(x => x !== 'm' + i && /^m\d$/.test(x) && +x.slice(1) < R.modExtra && st.arch.extra[x] === k))) I.push(tr('{trait} is not an option for this {die}.', { trait: traitName(k), die: 'd6' }));
        }
        if (shape.req) {
          const cands = expand(shape.req.any);
          if (Object.keys(R.T).filter(k => cands.includes(k)).length < (shape.req.count || 1)) I.push(tr('You need {what}.', { what: tr(shape.req.label) }));
        }
        // How many of the "remaining" dice went to powers. The required die is not one of them, but a Path whose
        // required trait you already have lets you skip that die (then every die is a remaining one), put it on
        // another trait of the list, or swap it (the swapped die is then the required one), pp.75-93 and p.44.
        const archSlots = (R.slots.arch || []).filter(s => s.key && !s.upgrade);
        const powerSlots = archSlots.filter(s => TRAIT[s.key].kind === 'power');
        const reqKeys = shape.req ? expand(shape.req.any) : [];
        const reqIsPower = reqKeys.some(k => TRAIT[k].kind === 'power');
        const before = R.before.archetype;
        const had = Object.keys(before).filter(k => reqKeys.includes(k)).length >= ((shape.req && shape.req.count) || 1);
        const reqCands = powerSlots.filter(s => reqKeys.includes(s.key) && (s.swap || !before[s.key])).length;
        const n = powerSlots.length;
        const remOpts = !reqIsPower ? [n] : archSlots.some(s => s.swap) ? [n - 1] : (reqCands ? [n - 1] : []).concat(had || !reqCands ? [n] : []);
        const dice = (R.slots.arch || []).length, allSet = (R.slots.arch || []).every(s => s.key);
        if (shape.remPowers === 'one' && Math.min(...remOpts) > 1) I.push(tr('Only one of the remaining dice may go to a power (the rest go to qualities).'));
        else if (shape.remPowers === 'one' && allSet && dice > 1 && !remOpts.includes(1)) I.push(tr('One of the remaining dice must go to a power.'));
        if (shape.remPowers === 'oneOrMore' && allSet && dice > 1 && !remOpts.some(r => r >= 1)) I.push(tr('At least one die must go to a power.'));
        if (shape.extra && shape.extra.type === 'addTrait' && !st.arch.extra.key) I.push(shape.extra.text);
        if (ar.modular) for (let i = 0; i < (R.modExtra || 0); i++) if (!st.arch.extra['m' + i]) I.push(tr('Add a d6 power (Stance Masters need four powers).'));
      }
      add('assign', tr('Assign your dice'), I, tr('Click a die, then choose the power or quality it becomes. Read the rules above the dice — some must go to specific things.'));
      if (ar && ar.divided && shape) add('divm', tr('Choose your method of transformation'), st.arch.divMethod ? [] : [tr('Choose a method.')], tr('How does your champion switch between their two forms?'));
      if (shape) groupSecs('archetype');
      else add('g-ph', tr('Choose your abilities'), []);
      if (abilityShape() && shape.minionForms) {
        const M = [];
        const mq = R.before.personality[st.arch.minionQ];
        if (!mq || TRAIT[mq.key].kind !== 'quality') M.push(tr('Choose the quality that sets your number of minion forms.'));
        else {
          const max = dn(mq.die);
          if ((st.arch.minionForms || []).length !== max) M.push(tr('Choose {n} minion forms ({have} chosen).', { n: max, have: (st.arch.minionForms || []).length }));
        }
        add('minions', tr('Choose your minion forms'), M, tr('Pick the quality first, then tick as many forms as it allows.'));
      }
      if (ar && ar.modular && shape) {   // p.96: optional Powerless Mode, one default-mode power at d6 and another at d10
        const pl = st.arch.powerless || {}, P = [];
        const isPow = k => k && R.T[k] && TRAIT[k].kind === 'power';
        if (pl.on && (!isPow(pl.a) || !isPow(pl.b) || pl.a === pl.b)) P.push(tr('Choose two different powers for your Powerless Mode.'));
        add('powerless', tr('Powerless Mode (optional)'), P, '', { opt: true });
      }
      if (shape && ar.divided && splitOn()) add('split', tr('Split Form: divide your powers and qualities'), splitIssues(R), '');
      if (shape && (shape.forms || ar.modular || ar.divided)) add('notes', tr(ar.modular ? 'Notes on your modes (optional)' : 'Notes on your forms (optional)'), [], tr('Optional — jot down which powers each form or mode uses.'), { opt: true });
      const pc = archPrincipleCat();
      add('principle', pc ? tr('Choose {p}', { p: aPrinciple(pc) }) : tr('Choose your second principle'), shape && pc ? principleIssues('arch', pc) : [], tr('Click a principle — it must be different from your first one.'));
    }
    if (id === 'personality') {
      rollSec('pers', tr('Roll for your Temperament'), !!pers);
      add('pick', tr('Choose your Temperament'), pers ? [] : [tr('Choose a Temperament.')], tr('Click how your champion behaves under pressure. The three dice are your Green / Yellow / Red status.'));
      add('qname', tr('Name your Signature Quality'), pers && !st.pers.qname.trim() ? [tr('Type a name for your Signature Quality.')] : pers && !(st.pers.qdesc || '').trim() ? [tr('Describe in a few words what your Signature Quality is about.')] : pers && !st.pers.qok ? [tr('Press Confirm to keep this name.')] : [], tr('Type a short phrase that sums up your champion, like <em>Last Kinkou of the Eastern Isles</em>.'));
      if (pers) {
        const rq = reqFromText(pers.out);
        const outOk = st.pers.outTrait && owned(R, rq.kind).some(t => t.key === st.pers.outTrait);
        if (rq.kind !== 'none') add('out', tr('Set up your Out ability'), outOk ? [] : [tr('Choose which trait your Out ability uses.')], tr('Pick the power or quality used when you\'re knocked out.'));
        if (ar && ar.divided) add('pers2', tr('Temperament of your other form (optional)'), [], '', { opt: true });
        const up = R.before.personality[st.pers.upgrade];
        if (pers.extra === 'impulsive') add('reckless', tr('Reckless upgrade'), up && dn(up.die) < 12 ? [] : [tr('Choose a power or quality to upgrade.')], tr('Pick one trait to raise by one die size.'));
      }
    }
    if (id === 'red') {
      const need = 2;
      const s = st.sel.red || [];
      const I = [];
      if (s.length !== need) I.push(tr('Pick {n} Ultimates ({have}/{n} chosen).', { n: need, have: s.length }));
      const ashape = abilityShape(), pool = Object.keys(R.T);
      for (const e of s) {
        const isX = !!(e.cat && e.cat.startsWith('X:'));
        // p.106: a Red ability comes from a category where you have a power or quality of d6 or more (or your Path's own list)
        const def = isX ? null : ((window.RED_ABILITIES.find(c => c.cat === e.cat) || { list: [] }).list.find(x => x.a === e.name));
        if (isX ? !(ashape && e.cat === 'X:' + ashape.id && (ashape.extraRed || []).includes(e.name)) : !def) { I.push(tr('“{ab}” is not one of your Ultimate options: untick it.', { ab: abName(e.name) })); continue; }
        if (!isX && !Object.values(R.T).some(t => TRAIT[t.key].cat === e.cat && dn(t.die) >= 6)) I.push(tr('“{ab}” needs one of your {cat} at d6 or more: untick it.', { ab: abName(e.name), cat: catLabel(e.cat) }));
        const use = def && def.use;
        if (use && !use.some(k => R.T[k])) I.push(tr('“{ab}” requires {trait}, which you don\'t have.', { ab: abName(e.name), trait: traitName(use[0]) }));
        I.push(...traitIssues(e, allowedTraits(R, e.name, { cat: isX ? null : e.cat, use }), R, pool));
      }
      if (new Set(s.map(e => displayName(e.name))).size !== s.length) I.push(tr('You picked the same Ultimate twice.'));
      add('pick', tr('Choose {n} Ultimates', { n: need }), I, tr('Only categories marked <b>eligible</b> can be picked — they match powers and qualities you have. Tick {n} abilities, then choose the trait each one uses.', { n: need }));
    }
    if (id === 'health') add('review', tr('Review your Health'), st.health.mode === 'roll' && st.health.roll != null && !(st.health.roll >= 1 && st.health.roll <= 8) ? [tr('Roll the d8 again.')] : [], tr('Pick the trait that adds to your Health and whether to roll.'), { opt: true });
    if (id === 'finish') {
      add('name', tr('Name your champion (optional)'), [], tr('Type a hero name — you can fill in the rest below at your own pace.'));
      add('describe', tr('Describe them (optional)'), [], tr('Optional details for your hero sheet.'));
      add('bio', tr('Biography (optional)'), [], tr('Tell your champion\'s story. The lore guide gathers questions from your choices; click one to add it to the text.'));
      add('abilities', tr('Name your abilities (optional)'), [], tr('Optional — give your abilities Runeterran names.'));
      add('gear', tr('Name your gear & gifts (optional)'), [], tr('Optional — rename your Signature Weapon, powers and so on.'));
    }
    return S;
  }
  function stepIssues(id, R) { return sectionsFor(id, R).flatMap(s => s.issues); }
  // Divided with Split Form (p.95): two powers and two qualities work in both forms, the rest belong to one form.
  const splitOn = () => { const a = archDef(); return !!(a && a.divided && (st.sel['arch-divafter'] || []).some(e => e.name === 'Split Form')); };
  function splitIssues(R) {
    const sp = st.arch.split || {}, keys = Object.keys(R.T).filter(k => k !== 'rp-quality'), I = [];
    const both = kind => keys.filter(k => sp[k] === 'both' && TRAIT[k].kind === kind).length;
    if (both('power') !== 2) I.push(tr('Mark exactly two powers as “both forms” ({n} marked).', { n: both('power') }));
    if (both('quality') !== 2) I.push(tr('Mark exactly two qualities as “both forms” ({n} marked).', { n: both('quality') }));
    const left = keys.filter(k => !sp[k]).length;
    if (left) I.push(tr('Put each of the other powers and qualities in one form ({n} left).', { n: left }));
    return I;
  }
  function archPrincipleCat() {
    const ar = archDef();
    if (!ar) return null;
    if (ar.divided) return 'Responsibility';
    if (ar.modular) { const s = shapeDef(); return s ? s.principle : null; }
    return ar.principle;
  }

  // ------------------------------------------------------------------ steps
  const STEPS = [
    { id: 'intro', name: tr('Welcome'), sub: tr('How it works') },
    { id: 'people', name: tr('People'), sub: tr('Runeterra flavour') },
    { id: 'region', name: tr('Homeland'), sub: tr('Runeterra flavour') },
    { id: 'background', name: tr('Origin'), sub: '' },
    { id: 'powersource', name: tr('Source of Power'), sub: '' },
    { id: 'archetype', name: tr('Path'), sub: '' },
    { id: 'personality', name: tr('Temperament'), sub: '' },
    { id: 'red', name: tr('Ultimates'), sub: '' },
    { id: 'health', name: tr('Health'), sub: '' },
    { id: 'finish', name: tr('Legend'), sub: tr('Finishing Touches & Sheet') }
  ];

  // ------------------------------------------------------------------ rendering: shared widgets
  let R0 = compute();

  function rollerHtml(key, sizes, label) {
    if (st.method !== 'guided') return `<div class="roller"><span>${esc(label)}</span><span class="muted">${tr('Constructed method: pick whichever entry fits your concept. The dice {dice} still matter for what you assign.', { dice: sizes.map(d => die(d)).join('') })}</span></div>`;
    const r = st.rolls[key];
    const re = st.rerolls[key] || 0;
    let res = '';
    if (r) {
      const valid = validFrom(r);
      res = `<div class="results">${r.map((v, i) => `<span class="rolled">${die(sizes[i] || 'd10')}<span class="val">${v}</span></span>`).join('')}</div>` +
        `<div class="valid-list">${tr('You may choose:')} <b>${[...valid].sort((a, b) => a - b).join(', ')}</b> <small>${tr('(any single die, or the sum of any two)')}</small></div>`;
    }
    return `<div class="roller"><span${tip(tr('<h5>Guided method</h5>Roll the listed dice. You may pick the table entry equal to any single die <b>or</b> the sum of any two dice. If nothing fits your idea, you may re-roll once per step. Only the die <b>sizes</b> carry on to your powers/qualities — not the numbers.'))} class="term">${esc(label)}</span> ` +
      (r ? '' : `<button class="btn primary" data-act="roll" data-key="${key}" data-sizes="${sizes.join(',')}">${tr('Roll')} ${sizes.map(d => die(d, 'sm')).join('')}</button>`) + res +
      (r && re < 1 ? `<button class="btn small" data-act="roll" data-key="${key}" data-sizes="${sizes.join(',')}" data-re="1">${tr('Re-roll (once)')}</button>` : '') +
      (r && re >= 1 ? `<small class="muted">${tr('Re-roll used.')}</small>` : '') + '</div>';
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
      // the card's details tooltip (from its empty .info span) goes on the whole card
      let inner = renderer(it), tipAttr = '';
      inner = inner.replace(/<span class="info"[^>]*?( data-tip="[^"]*")><\/span>/, (m, t) => { tipAttr = t; return ''; });
      return `<button class="${cls}" data-act="pick" data-kind="${kind}" data-id="${it.id}"${v === false ? ' data-locked="1"' : ''}${it.id === selId ? ' aria-pressed="true"' : ''}${tipAttr}>${inner}</button>`;
    }).join('')}</div>`;
  }
  // Lore art at the top of a region or people tooltip (the same pictures as the Lore page).
  const PEOPLE_SLOT = { human: 'humano', spirit: 'espirito', construct: 'construto', plant: 'plantifero', dragonkin: 'meio-dragao', minotaur: 'minotauro' };
  // People and Homeland tooltips have their own Legends of Runeterra art (assets/tip/, 480px), different
  // from the Lore page's pictures: no image appears twice anywhere on the site.
  const tipSrc = slot => `assets/tip/${slot}.webp`;
  const tipImg = slot => `<img class="tip-img" src="${tipSrc(slot)}" alt="" decoding="async">`;
  // Fetch the current chapter's tooltip pictures in the background, so hovering shows them at once.
  const warmed = new Set();
  function warmImages() {
    const urls = {
      people: (window.PEOPLES || []).map(x => tipSrc('race-' + (PEOPLE_SLOT[x.id] || x.id))),
      region: (window.REGIONS || []).map(x => tipSrc('r-' + x.id)),
      background: window.BACKGROUNDS.map(x => `assets/cards/bg-${x.id}.webp`),
      powersource: window.POWER_SOURCES.map(x => `assets/cards/ps-${x.id}.webp`),
      archetype: window.ARCHETYPES.map(x => `assets/cards/ar-${x.id}.webp`),
      personality: window.PERSONALITIES.map(x => `assets/cards/pe-${x.id}.webp`)
    }[st.step] || [];
    const todo = urls.filter(u => !warmed.has(u));
    if (!todo.length) return;
    const go = () => todo.forEach(u => { warmed.add(u); const i = new Image(); i.decoding = 'async'; i.src = u; });
    if (window.requestIdleCallback) requestIdleCallback(go, { timeout: 1500 }); else setTimeout(go, 300);
  }
  // Suggestion marks from the flavour chapters (People and Homeland): no rules effect.
  const fitMark = (arr, id) => {
    const r = regionDef(), pp = peopleDef();
    // a list that covers almost everything (humans live in every region) suggests nothing: no marks
    const m = (src, label) => src && src[arr] && src[arr].length <= 8 && src[arr].includes(id) ? `<span class="fit"${tip(`<h5>${ico('mark')} ${tr('Suggestion')}</h5>${label}. ${tr('Only a suggestion: you can pick any option.')}`)}>${ico('mark')}${tr('Suggestion')}: ${esc(src.name)}</span>` : '';
    return m(pp, tr('Suits a champion of the {people} people', { people: esc(pp && pp.name) })) + m(r, tr('Suits a champion from {place}', { place: esc(r && r.name) }));
  };

  // A one-line key above any list that carries ✦ marks, so nobody mistakes them for rules.
  const suggLegend = html => /class="(fit|fit-inline|rune-sugg)"/.test(html)
    ? `<p class="sugg-legend">${ico('mark')} <span>${tr('<b>Suggestion</b> for your People and Homeland. Only a suggestion: you can pick any option.')}</span></p>` : '';

  // Powers and qualities suggested by the People or Homeland (✦ in the socket trays).
  const fitTrait = k => {
    const who = [peopleDef(), regionDef()].filter(x => x && x.tr && x.tr.includes(k)).map(x => x.name);
    return who.length ? tr('Suits {who}', { who: who.join(tr(' and ')) }) : '';
  };

  // others: slots of another group in the same step (e.g. the Training bonus next to the Path dice), also off-limits
  // Every power and quality is listed; the ones this step does not offer stay locked, with why (lockWhy).
  // onlyKind: the step gives only powers or only qualities, so the other kind is left out of the list.
  function assignHtml(slots, optionKeys, before, stepPrefix, label, others = [], swap = [], lockWhy = '', onlyKind = '') {
    if (!slots || !slots.length) return '';
    const everyKey = !lockWhy ? optionKeys : onlyKind ? allOf(onlyKind) : allOf('power').concat(allOf('quality'));
    const rows = slots.map(s => {
      // a required trait you already have can take a bigger new die; its old die then comes back to this step
      const onOther = k => slots.concat(others).some(x => x !== s && x.key === k);
      const canSwap = k => swap.includes(k) && before[k] && !s.freed && dn(s.die) > dn(before[k].die) && !onOther(k);
      const takenBy = k => { const o = slots.concat(others).find(x => x !== s && x.key === k); if (o) return tr('on your {die}', { die: o.die }); if (before[k] && s.key !== k && !canSwap(k)) return tr('you already have {die}', { die: before[k].die }); return ''; };
      const groups = traitGroups(everyKey, k => optionKeys.includes(k)
        ? traitItem(k, { taken: takenBy(k), after: canSwap(k) && s.key !== k ? tr('{from} → {to}, the {from} comes back', { from: before[k].die, to: s.die }) : '' })
        : traitItem(k, { locked: lockWhy }));
      let note = '';
      if (s.key) note = s.upgrade ? tr('You already had {trait}: bind this {die} to something else.', { trait: traitName(s.key), die: s.die }) : s.swap ? tr('{trait} goes from {from} to {to}; its old {from} is below for you to use in this step.', { trait: traitName(s.key), from: s.swap.from, to: s.swap.to }) : '';
      if (s.freed) note = note || tr('This is the old {die} of {trait}. Use it for something else in this step.', { die: s.die, trait: traitName(s.from) });
      return socket({ bind: `${stepPrefix}.assign.${s.id}`, d: s.die, cur: s.key, groups, empty: tr('Bind this {die} to a trait', { die: s.die }), note, freed: s.freed });
    }).join('');
    return `<div class="assign"><div class="muted"${tip(tr('<h5>Assigning dice</h5>Only the die <b>size</b> matters. Each die becomes the rating of one power or quality. Powers and qualities you already have cannot be chosen again.'))}>${label}</div>${rows}</div>`;
  }

  function abilityCard(g, name, entry, picked, R, ctx = {}) {
    const ab = A[name];
    if (!ab) return `<div class="ab">${tr('Unknown ability')} ${esc(name)}</div>`;
    const color = ctx.color || g.color;
    const al = allowedTraits(R, name, ctx);
    const reqFixed = al.req.fixed ? al.req.only[0] : null;
    // needs a power you don't have: a named one (Telepathy…), or an Elemental/Energy one for "[element you have a related power for]"
    const noEl = choiceTokens(ab.text).some(relatedToken) && !CATS['P:elemental'].items.some(i => (ctx.pool || Object.keys(R.T)).includes(i[0]));
    const unavailable = (reqFixed && !R.T[reqFixed]) || noEl;
    const orig = displayName(name);
    const mode = g.modes ? g.modes.find(m => m.name === name) : null;
    let cfg = '';
    if (picked && entry) {
      const idx = ctx.idx;
      const base = ctx.bind || `sel.${g.key}.${idx}`;
      if (al.req.kind !== 'none' && !reqFixed) {
        const what = al.req.kind === 'any' ? tr('power or quality') : al.req.cat ? catPhrase(al.req.cat) : tr(al.req.kind);
        const catOn2 = ctx.cat && al.req.second && (ctx.cat[0] === 'Q' ? 'quality' : 'power') === al.req.second;
        cfg += `<div class="cfg-l">${tr('Uses {what}', { what })}${ctx.cat && !catOn2 ? ' (' + esc(catName(ctx.cat)) + ')' : ''}</div>${traitChips(`${base}.trait`, al.keys, entry.trait, ctx.block || {})}`;
        if (!al.keys.length) cfg += `<small class="muted">${tr('You have no eligible trait yet.')}</small>`;
      }
      if (reqFixed) cfg += `<small class="muted">${tr('Uses {what}', { what: esc(traitName(reqFixed)) })}${unavailable ? tr(' — which you don\'t have!') : ''}</small>`;
      if (al.keys2) cfg += `<div class="cfg-l">${tr('Quality')}${ctx.cat && al.req.second && ctx.cat[0] === 'Q' ? ' (' + esc(catName(ctx.cat)) + ')' : ''}</div>${traitChips(`${base}.trait2`, al.keys2, entry.trait2)}`;
      for (const t of choiceTokens(ab.text)) {
        const kind = CHOICE_TOKENS[t];
        const cur = (entry.ch || {})[t] || '';
        if (kind === 'element') {
          // "[element/energy you have a related power for]": only the elements of your own Elemental/Energy powers
          const mine = ctx.pool || Object.keys(R.T);
          const els = CATS['P:elemental'].items.filter(i => !relatedToken(t) || mine.includes(i[0])).map(i => i[2]);
          if (!els.length) { cfg += `<small class="muted">${tr('You have no Elemental/Energy power for this.')}</small>`; continue; }
          cfg += `<div class="cfg-l">[${esc(tokenLabel(t))}]</div>${valueChips(`${base}.ch.${t}`, els, cur)}`;
        } else if (Array.isArray(kind)) {
          cfg += `<div class="cfg-l">[${esc(tokenLabel(t))}]</div>${valueChips(`${base}.ch.${t}`, kind, cur, x => tr(x))}`;
        } else {
          cfg += `<label>[${esc(tokenLabel(t))}]<input type="text" data-bind="${base}.ch.${t}" value="${esc(cur)}" placeholder="${tr('e.g. Attack and Overcome')}"></label>`;
        }
      }
    }
    const typeTip = `<h5>${tr('Type: {t}', { t: ab.type })}</h5>${window.ABILITY_TYPES[ab.type] || ''}`;
    const colorTip = `<h5>${tr(color[0].toUpperCase() + color.slice(1) + ' ability')}</h5>${window.COLOR_INFO[color] || ''}`;
    const inputType = g.count === 1 && !g.fixed ? 'radio' : 'checkbox';
    const control = g.fixed ? '' : `<input type="checkbox" data-act="toggleAb" data-g="${g.key}" data-name="${esc(name)}"${ctx.cat || ctx.dataCat ? ` data-cat="${esc(ctx.dataCat || ctx.cat)}"` : ''}${picked ? ' checked' : ''}${unavailable && !picked ? ' disabled' : ''} aria-label="${tr(inputType === 'radio' ? 'Select' : 'Toggle')} ${esc(abName(name))}">`;
    return `<div class="ab ${color}${picked ? ' picked' : ''}${unavailable ? ' disabled' : ''}">` +
      `<div class="ab-top">${control}<span class="ab-name">${esc(abName(name))}</span><span class="pill ${color}"${tip(colorTip)}>${tr(color)}</span><span class="ab-type"${tip(typeTip)}>${ab.type}</span></div>` +
      (mode ? `<div class="ab-text"><em>${tr('Mode:')}</em> ${esc(mode.text)}</div>` : '') +
      `<div class="ab-text">${rulesText(ab.text, picked ? entry : null)}</div>` +
      (cfg ? `<div class="ab-cfg">${cfg}</div>` : '') + '</div>';
  }

  function groupHtml(g, R, bare) {
    const s = selOf(g);
    return `<div class="${bare ? '' : 'subsec'}">${bare ? '' : `<h4>${esc(g.label)}</h4>`}${g.note ? `<p class="muted">${esc(g.note)}</p>` : ''}${!g.fixed ? `<p class="count-line"><b>${s.length}/${g.count}</b> ${tr('chosen')}</p>` : ''}<div class="ab-list">` +
      g.list.map(n => {
        const i = s.findIndex(e => e.name === n);
        // Groups that need a different power/quality per ability (or different from the Green ones) block repeats up front.
        const block = {};
        if (g.diff) s.forEach((e, j) => { if (j !== i && e.trait && usesTrait(e.name)) block[e.trait] = tr('used by {ab}', { ab: abName(e.name) }); });
        if (g.rules && g.rules.notGreen) (st.sel['arch-green'] || []).forEach(e => { if (e.trait && usesTrait(e.name)) block[e.trait] = tr('used by {ab}', { ab: abName(e.name) }); });
        // "At least N different powers": once the other picks can no longer reach N on their own, this one must bring a new power.
        const md = g.rules && g.rules.minDistinct;
        if (md) {
          const kindOk = k => !g.rules.distinctKind || TRAIT[k].kind === g.rules.distinctKind;
          const others = s.filter((e, j) => j !== i && usesTrait(e.name));
          const have = new Set(others.map(e => e.trait).filter(k => k && kindOk(k)));
          const open = (g.count - s.length - (i < 0 ? 1 : 0)) + others.filter(e => !e.trait).length;
          if (have.size + open < md) others.forEach(e => { if (e.trait && kindOk(e.trait)) block[e.trait] = tr('used by {ab}: these abilities need at least {n} different powers', { ab: abName(e.name), n: md }); });
        }
        return abilityCard(g, n, s[i], i >= 0, R, { idx: i, powersOnly: g.powersOnly, use: groupUse(g, R), pool: groupPool(g, R), block });
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
      const t = `<h5>${esc(lore[0])}</h5>` + (lore[1] ? `<b>${tr('In Runeterra:')}</b> ${esc(lore[1])}` : esc(p.rp));
      const pp = peopleDef();
      const fits = (pp && pp.pr.includes(p.id) ? ` <span class="fit-inline">${ico('mark')}${tr('Suggestion')}: ${esc(pp.name)}</span>` : '') + (r && r.pr.includes(p.id) ? ` <span class="fit-inline">${ico('mark')}${tr('Suggestion')}: ${esc(r.name)}</span>` : '');
      return `<button class="principle${p.id === cur ? ' selected' : ''}${p.id === other ? ' taken' : ''}" data-act="principle" data-slot="${slot}" data-id="${p.id}"${tip(t)}${p.id === other ? ' disabled' : ''}>` +
        `<div class="pn">${esc(lore[0])}${fits}</div><div class="po">${esc(tr(p.cat))}</div><div class="ph">${esc(p.rp)}</div></button>`;
    }).join('');
    let detail = '';
    const p = PRINCIPLES.find(x => x.id === cur);
    if (p) {
      const needsEl = p.id === 'energy-element';
      detail = `<div class="detail"><h4>${esc((window.PRINCIPLE_LORE[p.id] || [p.name])[0])}</h4>` +
        `<p><b>${tr('During roleplaying:')}</b> ${esc(p.rp)}</p><p><b>${tr('Minor twist:')}</b> <em>${esc(p.minor)}</em><br><b>${tr('Major twist:')}</b> <em>${esc(p.major)}</em></p>` +
        `<div class="ab green picked"><div class="ab-top"><span class="ab-name">${esc((window.PRINCIPLE_LORE[p.id] || [p.name])[0])}</span><span class="pill green">${tr('green')}</span><span class="ab-type"${tip(`<h5>${tr('Type: {t}', { t: p.type })}</h5>${window.ABILITY_TYPES[p.type]}`)}>${p.type}</span></div><div class="ab-text">${rulesText(p.ability, { ch: { 'energy/element': st.pch[slot] } })}</div></div>` +
        (needsEl ? `<div class="ab-cfg"><div class="cfg-l">${tr('Your element')}</div>${valueChips(`pch.${slot}`, CATS['P:elemental'].items.map(i => i[2]), st.pch[slot])}</div>` : '') +
        `</div>`;
    }
    return `<div class="principles">${items}</div>${detail}`;
  }



  // ------------------------------------------------------------------ rendering: steps
  function renderIntro() {
    // The chapters themselves are listed in the chronicle rail on the left; the welcome page sets the scene
    // and asks for the creation method. How a roll works lives in the Rules page.
    return `<div class="panel title-page">
      <section class="tp-hero">
        <div class="tp-main">
          <div class="tp-kicker">${tr('A codex for the Sentinels roleplaying system')}</div>
          <h2 class="tp-title">${tr('Forge a Champion <span>of Runeterra</span>')}</h2>
          <p class="tp-lede">${tr('Nine chapters take you from a nameless wanderer to a champion ready for the table — where you were born, what gave you power, how you fight, and what you will become when everything is on the line.')}</p>
        </div>
      </section>
      <section class="tp-start">
        <div class="tp-go">
          <button class="btn primary" data-act="next"><span class="btn-kicker">${tr('Chapter I')}</span>${tr('Begin the chronicle')} ${ico('next')}</button></div>
      </section>
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
  let pointerDown = false, pendingRender = false;   // see the pointerdown/pointerup listeners below
  let socketAuto = false;           // set once per render when an empty socket has claimed the auto-open
  const traitGroups = (keys, item) => {
    const G = {};
    for (const k of keys) { const c = TRAIT[k].cat; (G[c] = G[c] || []).push(item(k)); }
    return Object.entries(G).map(([c, items]) => ({ label: catName(c), items }));
  };
  const traitItem = (k, extra = {}) => ({ k, name: traitName(k), ...extra });
  // One die and the trait it becomes, read left to right: [d10] becomes → [Medicine · QUALITY].
  // An empty slot asks the question in words. When a die may become either a power or a quality,
  // the tray splits into a Powers block and a Qualities block, each with its own colour.
  const kindOf = k => (TRAIT[k] ? TRAIT[k].kind : '');
  const kindTag = k => `<span class="sock-kind k-${k}">${tr(k)}</span>`;
  function socket({ bind, d, mark, cur, groups, empty, note, freed }) {
    // open options first: inside each group, then groups, then the Powers/Qualities blocks
    const open1 = i => !i.locked;
    groups = groups.map(g => ({ ...g, items: g.items.filter(open1).concat(g.items.filter(i => !open1(i))) }))
      .sort((a, b) => (b.items.some(open1) ? 1 : 0) - (a.items.some(open1) ? 1 : 0));
    const all = groups.flatMap(g => g.items);
    const curItem = all.find(i => i.k === cur);
    const kinds = [...new Set(all.map(i => kindOf(i.k)).filter(Boolean))];
    const both = kinds.length > 1;
    let open = ui.socket === bind;
    if (!open && !cur && ui.socket == null && !socketAuto) { open = socketAuto = true; }
    const gem = d ? die(d) : `<span class="sock-mark">${esc(mark || '')}</span>`;
    const ask = d ? tr(both ? 'Which power or quality does this {die} become?' : kinds[0] === 'power' ? 'Which power does this {die} become?' : 'Which quality does this {die} become?', { die: d }) : (empty || tr('Choose'));
    const face = curItem
      ? `${kindOf(cur) ? kindTag(kindOf(cur)) : ''}<span class="sock-name"${TRAIT[cur] ? tip(traitTip(cur)) : ''}>${esc(curItem.name)}</span>${d ? die(d, 'sm') : ''}<span class="sock-cat">${esc(TRAIT[cur] ? catName(TRAIT[cur].cat) : '')}${curItem.after ? ` · ${esc(curItem.after)}` : ''}</span>`
      : `<span class="sock-empty">${esc(ask)}</span>`;
    const filter = all.length > 12 ? `<label class="tray-filter">${ico('mark')}<input type="search" data-filter="1" placeholder="${tr('Filter {n} options…', { n: all.length })}" aria-label="${tr('Filter options')}"></label>` : '';
    const groupHtml = g => `<div class="tray-group"><div class="tray-label">${esc(g.label)}${g.sub ? `<span>${esc(g.sub)}</span>` : ''}</div><div class="tray-grid">${g.items.map(i => {
      const on = i.k === cur, lock = !!i.locked && !on, off = (!!i.taken || lock) && !on, fit = !lock && fitTrait(i.k);
      const why = lock ? i.locked : off ? tr('You already have this trait here, so this die would be wasted. Choose a different trait, or unbind it where it is first.') : '';
      return `<button class="rune k-${kindOf(i.k)}${on ? ' on' : ''}${off ? ' off' : ''}${lock ? ' locked' : ''}${fit ? ' fits' : ''}" data-act="socket" data-bind="${bind}" data-val="${i.k}" data-q="${esc((i.name + ' ' + (i.sub || '') + ' ' + g.label).toLowerCase())}"${off ? ` aria-disabled="true" data-why="${esc(why)}"` : ''}${on ? ' aria-pressed="true"' : ''}${tip(traitTip(i.k) + (lock ? `<hr>${ico('lock')} ${esc(i.locked)}` : '') + (fit ? `<hr>✦ <b>${tr('Suggestion')}</b>: ${esc(fit)}. ${tr('Only a suggestion: you can pick any option.')}` : ''))}>
        ${lock ? `<span class="rune-lock">${ico('lock')}</span>` : ''}<span class="rune-name">${esc(i.name)}</span>${fit ? `<span class="rune-sugg">${ico('mark')} ${tr('Suggestion')}</span>` : ''}${i.sub ? `<span class="rune-sub">${esc(i.sub)}</span>` : ''}${i.after ? `<span class="rune-badge">${esc(i.after)}</span>` : ''}${off && !lock ? `<span class="rune-badge taken">${esc(i.taken)}</span>` : ''}</button>`;
    }).join('')}</div></div>`;
    const body = !both ? groups.map(groupHtml).join('')
      : ['power', 'quality'].sort((a, b) => (groups.some(g => kindOf(g.items[0].k) === b && g.items.some(open1)) ? 1 : 0) - (groups.some(g => kindOf(g.items[0].k) === a && g.items.some(open1)) ? 1 : 0)).map(k => {
        const gs = groups.filter(g => g.items.length && kindOf(g.items[0].k) === k);
        return gs.length ? `<div class="tray-kind k-${k}"><div class="tray-kind-h">${kindTag(k)}<span>${tr(k === 'power' ? 'Powers: what makes you extraordinary.' : 'Qualities: what you know how to do.')}</span></div>${gs.map(groupHtml).join('')}</div>` : '';
      }).join('');
    const tray = open ? `<div class="tray${both ? ' both' : ''}" role="group" aria-label="${esc(ask)}">${filter}${body}${cur ? `<button class="linkbtn tray-clear" data-act="socket" data-bind="${bind}" data-val="">${tr('Unbind this die')}</button>` : ''}</div>` : '';
    return `<div class="socket${cur ? ' filled' : ''}${open ? ' open' : ''}${freed ? ' freed' : ''}">
      <div class="sock-row">${gem}<span class="sock-arrow" aria-hidden="true"><i>${tr('becomes')}</i></span>
      <button class="sock-slot" data-act="socketOpen" data-bind="${bind}" aria-expanded="${open}">${face}${open || !cur ? `<span class="sock-cta">${tr(open ? 'Close' : 'Choose')}</span>` : ''}</button>
</div>
      ${note ? `<div class="note">${esc(note)}</div>` : ''}${tray}</div>`;
  }

  // ------------------------------------------------------------------ guided flow
  const ui = { expand: {}, lastPick: {}, at: {}, passed: {}, redOpen: {}, evo: { tab: 'power', from: '', to: '', ch: {} } };   // transient: re-opened choice grids; most recent choice per chapter; the Evolve form
  const tipHooks = { reset: () => {} };   // set by the tooltip code: hides the tooltip whenever the page is redrawn
  let flowCurrent = null;           // "step:section" of the section the user should work on now

  // Renders a step's sections one at a time, like a wizard. Only the section under the cursor is open;
  // the finished ones above it fold into a one-line summary and the ones below stay sealed.
  // The cursor follows the first unfinished section on its own; "Back" (or the browser's back button)
  // moves it up one section, and "Next" moves it down again. Optional sections wait for "Next".
  // With open = true (People, Homeland, Legend) nothing is folded or sealed.
  let flowPos = null;               // { step, c, n, f, secs } of the chapter on screen
  function flowHtml(stepId, secs, H, open = false) {
    const n = secs.length;
    if (open) {
      flowPos = { step: stepId, open: true, c: n, n, f: n, secs };
      const parts = secs.map(s => {
        const state = s.issues.length ? 'current' : 'done';
        const head = `<div class="flow-head"><span class="flow-num">${state === 'done' ? ico('check') : secs.indexOf(s) + 1}</span><h3>${esc(s.title)}</h3></div>`;
        const fn = H[s.id] || (s.group && H.group) || null;
        const todo = s.issues.length ? `<div class="flow-todo"><span class="flow-todo-l">${tr('Still to do')}</span><ul>${s.issues.map(x => `<li>${esc(x)}</li>`).join('')}</ul></div>` : '';
        const body = fn ? fn(s) : '';
        return `<section class="flow-sec ${state}" id="flow-${stepId}-${s.id}">${head}<div class="flow-body">${suggLegend(body)}${body}${todo}</div></section>`;
      });
      flowCurrent = `${stepId}:open`;
      return parts.join('');
    }
    const pend = i => secs[i].issues.length > 0 || (secs[i].opt && !ui.passed[stepId + ':' + secs[i].id]);
    let f = secs.findIndex((_, i) => pend(i)); if (f < 0) f = n;
    let c = ui.at[stepId];
    if (c === 'last') c = Math.max(0, n - 1);
    if (c == null || c > f) c = f;
    if (ui.advance && c < f) c++;   // a single-choice section reopened with Back: choosing moves on, as it did the first time
    ui.advance = false;
    if (c === f) delete ui.at[stepId]; else ui.at[stepId] = c;
    flowPos = { step: stepId, c, n, f, secs };
    const parts = secs.map((s, i) => {
      if (i === c) {
        const fn = H[s.id] || (s.group && H.group) || null;
        const todo = s.issues.length ? `<div class="flow-todo"><span class="flow-todo-l">${tr('Still to do')}</span><ul>${s.issues.map(x => `<li>${esc(x)}</li>`).join('')}</ul></div>` : '';
        const body = fn ? fn(s) : '';
        return `<section class="flow-sec current" id="flow-${stepId}-${s.id}"><div class="flow-head"><span class="flow-num">${i + 1}</span><h3>${esc(s.title)}</h3><span class="flow-here">${tr('You are here')}</span></div><div class="flow-body">${suggLegend(body)}${body}${todo}</div></section>`;
      }
      if (i < f) {
        const sum = secSummary(stepId, s);
        return `<section class="flow-sec done folded" id="flow-${stepId}-${s.id}"><button type="button" class="flow-head" data-act="flowGo" data-i="${i}"${tip(tr('Open this part again'))}><span class="flow-num">${ico('check')}</span><h3>${esc(s.title)}</h3>${sum ? `<span class="flow-sum">${sum}</span>` : ''}</button></section>`;
      }
      return `<section class="flow-sec locked" id="flow-${stepId}-${s.id}"><div class="flow-head"><span class="flow-num">${ico('lock')}</span><h3>${esc(s.title)}</h3></div></section>`;
    });
    flowCurrent = c < n ? `${stepId}:${secs[c].id}` : `${stepId}:done`;
    return parts.join('');
  }
  // What a finished section chose, in one line.
  function secSummary(stepId, s) {
    const R = R0;
    const tl = list => (list || []).filter(x => x && x.key).map(x => `${esc(traitName(x.key))} ${die(x.die, 'sm')}`).join(' ');
    const pn = id => id ? esc((window.PRINCIPLE_LORE[id] || [id])[0]) : '';
    const abl = list => (list || []).map(e => esc(abName(e.name)) + (e.trait ? ` <small>(${esc(traitName(e.trait))})</small>` : '')).join(', ');
    const def = { background: bgDef, powersource: psDef, archetype: archDef, personality: persDef }[stepId];
    switch (s.id) {
      case 'pick':
        if (stepId === 'red') return abl(st.sel.red);
        return def && def() ? esc(def().rt) : '';
      case 'base': return shapeDef() ? esc(shapeDef().rt) : '';
      case 'assign': {
        const k = { background: 'bg', powersource: 'ps', archetype: 'arch' }[stepId];
        return tl((R.slots[k] || []).concat(stepId === 'archetype' ? (R.slots.training || []) : []));
      }
      case 'extra': return st.ps.extra.key ? esc(traitName(st.ps.extra.key)) : st.ps.extra.up ? `${esc(traitName(st.ps.extra.down))} −1 · ${esc(traitName(st.ps.extra.up))} +1` : '';
      case 'principle': return pn(stepId === 'background' ? st.bg.principle : st.arch.principle);
      case 'divm': { const m = window.DIVIDED.methods.find(x => x.id === st.arch.divMethod); return m ? esc(m.rt) : ''; }
      case 'minions': return (st.arch.minionForms || []).map(n => esc(abName(n))).join(', ');
      case 'qname': return esc(st.pers.qname) + (st.pers.qdesc ? ` <small>${esc(st.pers.qdesc)}</small>` : '');
      case 'out': return st.pers.outTrait ? esc(traitName(st.pers.outTrait)) : '';
      case 'pers2': { const p2 = st.pers.id2 && byId(window.PERSONALITIES, st.pers.id2); return p2 ? esc(p2.rt) + ' ' + p2.status.map(d => die(d, 'sm')).join('') : tr('Same in both forms'); }
      case 'powerless': { const pl = st.arch.powerless || {}; return pl.on && pl.a && pl.b ? `${esc(traitName(pl.a))} ${die('d6', 'sm')} ${esc(traitName(pl.b))} ${die('d10', 'sm')}` : tr('None'); }
      case 'split': { const sp = st.arch.split || {}; const b = Object.keys(sp).filter(k => sp[k] === 'both'); return b.length ? tr('Both forms: {list}', { list: b.map(k => esc(traitName(k))).join(', ') }) : ''; }
      case 'reckless': return st.pers.upgrade ? esc(traitName(st.pers.upgrade)) : '';
      case 'review': { const h = healthCalc(R); return h ? tr('Health {n}', { n: h.max }) : ''; }
    }
    if (s.group) return abl(st.sel[s.group.key]);
    return '';
  }

  // A choice grid. Finished sections fold into a summary, so the grid only shows while its section is open.
  const pickSection = (key, chosenHtml, gridHtml) => gridHtml;
  const chosenSummary = (title, sc, lore, champs, extra = '') => `<div class="chosen"><div class="chosen-t">${esc(title)}</div>${lore ? `<p class="lore">${esc(lore)}</p>` : ''}${champs ? `<p class="champs"><span>${tr('Champions')}</span> ${esc(champs)}</p>` : ''}${extra}</div>`;

  // Hover cards: Legends of Runeterra art, the story and champions who fit. The numbers show up
  // in the chapter itself once the card is chosen.
  const cardArt = (kind, id) => `<img class="tip-img" src="assets/cards/${kind}-${id}.webp" alt="" decoding="async">`;
  const bgTip = b => `${cardArt('bg', b.id)}<h5>${esc(b.rt)}</h5>${esc(b.lore)}<hr><small>${tr('Champions:')} ${esc(b.champs)}</small>`;
  const psTip = p => `${cardArt('ps', p.id)}<h5>${esc(p.rt)}</h5>${esc(p.lore)}<hr><small>${tr('Champions:')} ${esc(p.champs)}</small>`;
  function archTip(a) {
    if (a.advanced) return `${cardArt('ar', a.id)}<h5>${esc(a.rt)}</h5><div class="sc-line">${tr('advanced')}</div><div class="tip-warn">${ico('warn')}${tr(a.divided ? 'DIVIDED_WARNING' : 'MODULAR_WARNING')}</div>${esc(a.lore)}<hr>${tr(a.divided ? 'Two forms, a civilian one and a heroic one, and a way to switch between them.' : 'Switchable modes instead of fixed abilities.')}<hr><small>${tr('Champions:')} ${esc(a.champs)}</small>`;
    return `${cardArt('ar', a.id)}<h5>${esc(a.rt)} <small>(${esc(a.role)})</small></h5>${esc(a.lore)}<hr><small>${tr('Champions:')} ${esc(a.champs)}</small>`;
  }
  const chapterHead = (title, withMethod) => {
    const i = stepIndex(st.step);
    return `<header class="chapter"><div class="chapter-num" aria-hidden="true">${ROMAN[i]}</div>
      <div class="chapter-titles"><div class="chapter-kicker">${tr('Chapter')} ${ROMAN[i]} <span>${tr('of {n}', { n: ROMAN[STEPS.length - 1] })}</span></div><h2 class="chapter-title">${esc(title)}</h2></div>
      <div class="chapter-tools">${window.TOUR && window.TOUR[st.step] ? `<button class="btn small ghost guide-btn" data-act="tourShow">${ico('codex')} ${tr('Guide')}</button>` : ''}</div></header>`;
  };
  const stepPanel = (eyebrow, title, introKey, body, withMethod) => `<div class="panel">${chapterHead(title, withMethod)}
      <p class="chapter-lede">${window.STEP_INTROS[introKey]}</p>${body}${navFooter()}</div>`;

  function renderPeople() {
    const p = peopleDef();
    const H = {
      pick: () => pickSection('people', '',   // the cards stay on screen; the chosen one is highlighted
        `<div class="cards regions">${(window.PEOPLES || []).map(x => `<button class="card region-card${x.id === st.people ? ' selected' : ''}" style="--rc:${x.color}" data-act="pick" data-kind="people" data-id="${x.id}"${tip(`${tipImg('race-' + (PEOPLE_SLOT[x.id] || x.id))}<h5>${esc(x.name)}</h5>${esc(x.lore)}<hr><small>${esc(x.champs)}</small>`)}>${sigil(x.sigil)}${peopleLocked(x.id) ? `<span class="lock-mark" aria-label="${tr('Locked')}">${ico('lock')}</span>` : ''}<div class="t">${esc(x.name)}</div><div class="d">${esc(x.tag)}</div></button>`).join('')}</div>` + lockFormHtml('people'))
    };
    return stepPanel('Step 0 · Runeterra', tr('People'), 'people', flowHtml('people', sectionsFor('people', R0), H, true), false);
  }

  // Locked homelands: picking one asks for a password from the GM. Only the SHA-256 of each password is kept here.
  const LOCKED_REGIONS = {
    'shadow-isles': '45f649fc7af0b40898b16dc844273b1f6517ce87dca5efda0eaec2e5e80b5d13',
    void: '1b9c5f53121dba131856767c7b290fb4f2558d3bf807b6db88ba01e90dfde854'
  };
  const regionLocked = id => !!LOCKED_REGIONS[id] && !(st.unlocked || {})[id];
  // Locked peoples work the same way (their ids never clash with homeland ids in st.unlocked).
  const LOCKED_PEOPLES = {
    dragonkin: 'd5a3dee549a7eeb3913b0603a87ec0544a9907505a96537d020fe7ee678c88f3'
  };
  const peopleLocked = id => !!LOCKED_PEOPLES[id] && !(st.unlocked || {})[id];
  const LOCKS = { region: LOCKED_REGIONS, people: LOCKED_PEOPLES };
  function sha256(text) {
    const K = [], H = [];
    const isPrime = n => { for (let f = 2; f * f <= n; f++) if (n % f === 0) return false; return true; };
    for (let n = 2, i = 0; i < 64; n++) if (isPrime(n)) { if (i < 8) H[i] = (Math.pow(n, 1 / 2) * 4294967296) | 0; K[i++] = (Math.pow(n, 1 / 3) * 4294967296) | 0; }
    const bytes = Array.from(new TextEncoder().encode(text)), bits = bytes.length * 8;
    bytes.push(0x80);
    while (bytes.length % 64 !== 56) bytes.push(0);
    for (let i = 7; i >= 0; i--) bytes.push(i > 3 ? 0 : (bits >>> (i * 8)) & 255);
    const r = (x, n) => (x >>> n) | (x << (32 - n));
    for (let o = 0; o < bytes.length; o += 64) {
      const w = [];
      for (let i = 0; i < 64; i++) {
        if (i < 16) w[i] = (bytes[o + 4 * i] << 24) | (bytes[o + 4 * i + 1] << 16) | (bytes[o + 4 * i + 2] << 8) | bytes[o + 4 * i + 3];
        else w[i] = (w[i - 16] + (r(w[i - 15], 7) ^ r(w[i - 15], 18) ^ (w[i - 15] >>> 3)) + w[i - 7] + (r(w[i - 2], 17) ^ r(w[i - 2], 19) ^ (w[i - 2] >>> 10))) | 0;
      }
      let [a, b, c, d, e, f, g, h] = H;
      for (let i = 0; i < 64; i++) {
        const t1 = (h + (r(e, 6) ^ r(e, 11) ^ r(e, 25)) + ((e & f) ^ (~e & g)) + K[i] + w[i]) | 0;
        const t2 = ((r(a, 2) ^ r(a, 13) ^ r(a, 22)) + ((a & b) ^ (a & c) ^ (b & c))) | 0;
        h = g; g = f; f = e; e = (d + t1) | 0; d = c; c = b; b = a; a = (t1 + t2) | 0;
      }
      [a, b, c, d, e, f, g, h].forEach((v, i) => { H[i] = (H[i] + v) | 0; });
    }
    return H.map(v => (v >>> 0).toString(16).padStart(8, '0')).join('');
  }
  function lockFormHtml(kind) {
    const x = ui.lockAsk && ui.lockKind === kind && byId(kind === 'people' ? window.PEOPLES || [] : window.REGIONS, ui.lockAsk);
    if (!x) return '';
    return `<form class="lock-form" data-lock="${x.id}" data-lock-kind="${kind}"><div class="lock-h">${ico('lock')} ${tr('{name} is locked', { name: esc(x.name) })}</div>
      <p class="muted">${tr(kind === 'people' ? 'Ask your GM for the password to choose this people.' : 'Ask your GM for the password to choose this homeland.')}</p>
      <div class="lock-row"><input type="password" name="pw" autocomplete="off" aria-label="${tr('Password')}" placeholder="${tr('Password')}">
      <button type="submit" class="btn small">${tr('Unlock')}</button><button type="button" class="btn small ghost" data-act="lockCancel">${tr('Cancel')}</button></div>
      ${ui.lockErr ? `<p class="lock-err">${tr('Wrong password.')}</p>` : ''}</form>`;
  }

  function renderRegion() {
    const r = regionDef();
    const names = (list, arr) => arr.map(id => { const x = byId(list, id); return x ? x.rt : id; }).join(', ');
    const H = {
      pick: () => pickSection('region', '',   // the cards stay on screen; the chosen one is highlighted
        `<div class="cards regions">${window.REGIONS.map(x => `<button class="card region-card${x.id === st.region ? ' selected' : ''}" style="--rc:${x.color}" data-act="pick" data-kind="region" data-id="${x.id}"${tip(`${tipImg('r-' + x.id)}<h5>${esc(x.name)}</h5>${esc(x.lore)}<hr><small>${esc(x.champs)}</small>`)}>${sigil(x.id)}${regionLocked(x.id) ? `<span class="lock-mark" aria-label="${tr('Locked')}">${ico('lock')}</span>` : ''}${fitMark('regions', x.id)}<div class="t">${esc(x.name)}</div><div class="d">${esc(x.tag)}</div></button>`).join('')}</div>` + lockFormHtml('region'))
    };
    return stepPanel('Step 1 · Runeterra', tr('Homeland'), 'region', flowHtml('region', sectionsFor('region', R0), H, true), false);
  }

  function renderBackground() {
    const R = R0, b = bgDef();
    const H = {
      roll: () => rollerHtml('bg', ['d10', 'd10'], tr('Roll 2d10 for your Origin')),
      pick: () => pickSection('bg', b && chosenSummary(b.rt, b.sc, b.lore, b.champs),
        (st.method !== 'guided' ? '' : `<p class="muted">${tr('Highlighted cards match your roll.')}</p>`) + cardsHtml(window.BACKGROUNDS, 'bg', st.bg.id, 'bg', x => `<span class="n">${pad2(x.n)}</span>${fitMark('bg', x.id)}<div class="t">${esc(x.rt)}</div><div class="d">${esc(x.sub)}</div><span class="info" aria-label="${tr('Details')}"${tip(bgTip(x))}></span>`)),
      assign: () => `${b.q.mustInclude ? `<p>${tr('One die <b>must</b> go to {trait}.', { trait: traitSpan(b.q.mustInclude) })}</p>` : ''}${assignHtml(R.slots.bg, expand(b.q.opts), R.before.background, 'bg', tr('Assign each die to a quality:'), [], [], tr('Your Origin does not offer this.'), 'quality')}
        <p class="muted" style="margin-top:12px">${tr('Powers come in chapter IV, Source of Power, with the dice this Origin passes on: {dice}.', { dice: b.psDice.map(d => die(d, 'sm')).join('') })}</p>`,
      principle: () => principleHtml('bg', b.principle, R) + `<p class="muted" style="margin-top:10px">${tr('Next step: your Source of Power, rolled with {dice}.', { dice: b.psDice.map(d => die(d, 'sm')).join('') })}</p>`
    };
    return stepPanel('Step 2 · Sentinels: Background', tr('Origin'), 'background', flowHtml('background', sectionsFor('background', R), H), true);
  }

  function psExtraBody(p, R) {
    const ex = p.extra, e = st.ps.extra;
    if (ex.type === 'addTrait') {
      let keys = expand(ex.opts);
      if (ex.notInOpts) { const skip = expand(p.opts); keys = keys.filter(k => !skip.includes(k)); }
      const have = R.before.psExtra || {};
      return `<p>${esc(ex.text)}</p>${socket({ bind: 'ps.extra.key', d: ex.die, cur: e.key, groups: traitGroups(keys, k => traitItem(k, { taken: have[k] && dn(have[k].die) >= dn(ex.die) ? tr('you already have {die}', { die: have[k].die }) : '', after: have[k] && dn(have[k].die) < dn(ex.die) ? tr('have {die}', { die: have[k].die }) : '' })), empty: tr('Bind this {die} to a trait', { die: ex.die }) })}`;
    }
    if (ex.type === 'alien') {
      const B = Object.values(R.before.psExtra || {});
      if (B.some(t => t.die === 'd6' && TRAIT[t.key].kind === 'power')) {
        const cands = sortTraits(B.filter(t => t.die === 'd6')).map(t => t.key);
        return `<p>${esc(ex.text)}</p>${socket({ bind: 'ps.extra.key', d: 'd8', cur: e.key, groups: traitGroups(cands, k => traitItem(k, { after: 'd6 → d8' })), empty: tr('Raise which d6 to d8?') })}`;
      }
      const keys = expand(p.opts).filter(k => !(R.before.psExtra || {})[k]);
      return `<p>${esc(ex.text)}</p><p class="muted">${tr('You have no d6 powers, so instead add a new power from the list at d6.')}</p>${socket({ bind: 'ps.extra.key', d: 'd6', cur: e.key, groups: traitGroups(keys, k => traitItem(k)), empty: tr('Bind this d6 to a new power') })}`;
    }
    if (ex.type !== 'cosmos') return `<p>${esc(ex.text)}</p><p class="muted">${tr('Nothing to choose here: this bonus shows up in the Path chapter.')}</p>`;
    const pw = Object.values(R.before.psExtra || {}).filter(t => TRAIT[t.key].kind === 'power');
    const downs = sortTraits(pw.filter(t => dn(t.die) >= 8));
    const ups = sortTraits(pw.filter(t => dn(t.die) <= 10 && t.key !== e.down));
    return `<p>${esc(ex.text)}</p>${socket({ bind: 'ps.extra.down', mark: '−1', cur: e.down, groups: traitGroups(downs.map(t => t.key), k => traitItem(k, { after: `${pw.find(t => t.key === k).die} → ${upDie(pw.find(t => t.key === k).die, -1)}` })), empty: tr('Shrink one power by a size') })}` +
      `${socket({ bind: 'ps.extra.up', mark: '+1', cur: e.up, groups: traitGroups(ups.map(t => t.key), k => traitItem(k, { after: `${pw.find(t => t.key === k).die} → ${upDie(pw.find(t => t.key === k).die)}` })), empty: tr('Grow one power by a size') })}`;
  }

  function renderPowerSource() {
    const R = R0, b = bgDef(), p = psDef();
    if (!b) return lockedPanel(tr('Source of Power'), tr('Choose your Origin first — it gives the dice you roll here.'), 'background');
    const H = {
      roll: () => rollerHtml('ps', b.psDice, tr('Roll your Origin dice')),
      pick: () => pickSection('ps', p && chosenSummary(p.rt, p.sc, p.lore, p.champs),
        cardsHtml(window.POWER_SOURCES, 'ps', st.ps.id, 'ps', x => `<span class="n">${pad2(x.n)}</span>${fitMark('ps', x.id)}<div class="t">${esc(x.rt)}</div><div class="d">${esc(x.sub)}</div><span class="info" aria-label="${tr('Details')}"${tip(psTip(x))}></span>`)),
      assign: () => {
        let optKeys = expand(p.opts);
        if (p.required && !optKeys.includes(p.required.key)) optKeys = [p.required.key].concat(optKeys);
        return `${p.required ? `<p>${tr('One die <b>must</b> go to {trait}.', { trait: traitSpan(p.required.key) })}</p>` : ''}
${assignHtml(R.slots.ps, optKeys, R.before.powersource, 'ps', tr('Assign each die to a power:'), [], [], tr('Your Source of Power does not offer this.'), 'power')}`;
      },
      extra: () => psExtraBody(p, R),
      group: s => groupHtml(s.group, R, true)
    };
    return stepPanel('Step 3 · Sentinels: Power Source', tr('Source of Power'), 'powersource', flowHtml('powersource', sectionsFor('powersource', R), H), true);
  }

  function renderArchetype() {
    const R = R0, p = psDef(), a = archDef(), shape = shapeDef();
    if (!p) return lockedPanel(tr('Path'), tr('Choose your Source of Power first — it gives the dice you roll here.'), 'powersource');
    const H = {
      roll: () => rollerHtml('arch', p.archDice, tr('Roll your Source dice')),
      pick: () => pickSection('arch', a && chosenSummary(a.rt + ' · ' + a.role, a.sc, a.lore, a.champs),
        cardsHtml(window.ARCHETYPES, 'arch', st.arch.id, 'arch', x => `<span class="n">${pad2(x.n)}</span>${x.advanced ? `<span class="warn-mark" aria-label="${tr('Complex option')}">${ico('warn')}</span>` : ''}${fitMark('ar', x.id)}<div class="t">${esc(x.rt)}</div><div class="s">${esc(x.role)}${x.advanced ? ' · ' + tr('advanced') : ''}</div><div class="d">${esc(x.champs)}</div><span class="info" aria-label="${tr('Details')}"${tip(archTip(x))}></span>`)),
      broll: () => rollerHtml('base', p.archDice, tr('Roll for your base Path')),
      base: () => `<p class="base-why">${a.divided ? tr('A <b>Two Souls</b> champion still fights like one of the Paths below: pick it. It gives this chapter its <b>dice rules and abilities</b>; Two Souls adds how you <b>change form</b> and what each form keeps.') : tr('A <b>Stance Master</b> follows the <b>dice rules</b> of one of the Paths below: pick it. Instead of that Path\'s abilities you gain <b>modes</b> to switch between.')}` +
        (a.divided && shape ? ` ${tr('Your full Path: <b>{name}</b>.', { name: esc(a.rt) + ' · ' + esc(shape.rt) })}` : '') + '</p>' +
        pickSection('base', shape && chosenSummary(shape.rt + ' · ' + shape.role, shape.sc, shape.lore, shape.champs),
          cardsHtml(window.ARCHETYPES.filter(x => !x.advanced), 'base', st.arch.base, 'base', x => `<span class="n">${pad2(x.n)}</span><div class="t">${esc(x.rt)}</div><div class="s">${esc(x.role)}</div><span class="info" aria-label="${tr('Details')}"${tip(archTip(x))}></span>`)),
      assign: () => {
        const optKeys = expand((shape.req ? shape.req.any : []).concat(shape.powers, shape.quals));
        const rem = shape.remPowers === 'one' ? (shape.req ? 'exactly one' : 'Exactly one die') : shape.remPowers === 'any' ? (shape.req ? 'any number' : 'Any number of dice') : (shape.req ? 'one or more' : 'One or more dice');
        const remLine = tr((shape.req ? 'Of the other dice, ' : '') + '<b>' + rem + '</b>' + (shape.remPowers === 'one' ? ' goes' : shape.remPowers === 'any' ? ' (even none) go' : ' go') + ' to powers.');
        return `<ul class="rules-list">
            ${shape.req ? (shape.req.count ? `<li>${tr('You <b>must</b> end this step with <b>{what}</b> — ones you already have count, so put dice there only until you have two.', { what: esc(tr(shape.req.label)) })}</li>` : `<li>${tr('First, one die <b>must</b> go to <b>{what}</b>. If you already have it, either skip this, or put a bigger new die on it and use its old die elsewhere.', { what: esc(tr(shape.req.label)) })}</li>`) : ''}
            <li>${remLine}</li>
            <li>${tr('Every die left over goes to qualities.')}</li></ul>
          ${assignHtml(R.slots.arch, optKeys, R.before.archetype, 'arch', tr('Assign each die:'), R.slots.training || [], shape.req ? expand(shape.req.any) : [], tr('Your Path does not offer this.'))}
          ${p.id === 'training' ? `<p style="margin-top:12px">${tr('From your <b>{src}</b> source: one extra quality from this Path\'s list at {die}.', { src: esc(p.rt), die: die('d8') })}</p>${assignHtml(R.slots.training, expand(shape.quals), R.before.archetype, 'arch', tr('Training bonus quality:'), R.slots.arch || [], [], tr('Training gives one of your Path\'s qualities.'), 'quality')}` : ''}
          ${shape.extra ? `<p style="margin-top:12px">${esc(shape.extra.text)}</p>${socket({ bind: 'arch.extra.key', d: shape.extra.die, cur: st.arch.extra.key, groups: traitGroups(expand(shape.extra.opts).filter(k => !R.before.archetype[k]), k => traitItem(k)), empty: tr('Bind this {die} to a trait', { die: shape.extra.die }) })}` : ''}
          ${a.modular && R.modExtra ? `<p style="margin-top:12px">${tr('Stance Masters need at least four powers — add {n} {die} power(s):', { n: R.modExtra, die: die('d6') })}</p>` + Array.from({ length: R.modExtra }, (_, i) => socket({ bind: `arch.extra.m${i}`, d: 'd6', cur: st.arch.extra['m' + i], groups: traitGroups(allOf('power').filter(k => !R.before.personality[k] || k === st.arch.extra['m' + i]), k => traitItem(k, { taken: Object.keys(st.arch.extra).some(x => x !== 'm' + i && /^m\d/.test(x) && st.arch.extra[x] === k) ? tr('on another d6') : '' })), empty: tr('Bind this d6 to any power') })).join('') : ''}
          ${shape.healthAlt ? `<p class="sc">${tr('When determining Health you may use {what} instead of an Athletic power or Mental quality.', { what: esc(shape.healthAlt.map(c => (PT ? 'um ' : 'a ') + catPhrase(c)).join(PT ? ' ou ' : ' or ')) })}</p>` : ''}
          ${shape.extraRed && !a.modular ? `<p class="sc">${tr('As a {path}, the Red abilities {list} are added to your options in the Ultimates step.', { path: esc(shape.rt), list: esc(shape.extraRed.map(abName).join(', ')) })}</p>` : ''}`;
      },
      divm: () => `<div class="principles">${window.DIVIDED.methods.map(m => `<button class="principle${st.arch.divMethod === m.id ? ' selected' : ''}" data-act="divMethod" data-id="${m.id}"${tip(`<h5>${esc(m.rt)}</h5>${esc(m.text)}`)}><div class="pn">${esc(m.rt)}</div><div class="ph">${esc(m.text)}</div></button>`).join('')}</div>`,
      group: s => groupHtml(s.group, R, true),
      minions: () => minionFormsHtml(R),
      split: () => {
        const sp = st.arch.split || {};
        const row = t => `<div class="split-row"><span class="split-n">${esc(traitName(t.key))} ${die(t.die, 'sm')} <small>${tr(TRAIT[t.key].kind)}</small></span>${valueChips(`arch.split.${t.key}`, ['both', 'civ', 'her'], sp[t.key] || '', v => tr({ both: 'Both forms', civ: 'Civilian form', her: 'Heroic form' }[v]))}</div>`;
        const list = kind => sortTraits(owned(R, kind).filter(t => t.key !== 'rp-quality')).map(row).join('');
        // live count next to each list: how many are marked "both forms" and how many still need a form
        const count = kind => {
          const ks = owned(R, kind).filter(t => t.key !== 'rp-quality').map(t => t.key);
          const both = ks.filter(k => sp[k] === 'both').length, left = ks.filter(k => !sp[k]).length;
          return `<span class="split-count${both === 2 ? ' ok' : ''}">${tr('{n}/2 in both forms', { n: both })}</span>${left ? `<span class="split-count">${tr('{n} without a form', { n: left })}</span>` : ''}`;
        };
        return `<p>${tr('With <b>Split Form</b>, choose <b>two powers</b> and <b>two qualities</b> that work in both forms. Every other power and quality works in only one of them. Your Signature Quality works in both.')}</p>
          <div class="cfg-l">${tr('Powers')} ${count('power')}</div>${list('power')}<div class="cfg-l" style="margin-top:10px">${tr('Qualities')} ${count('quality')}</div>${list('quality')}`;
      },
      powerless: () => {
        const pl = st.arch.powerless || {};
        const pows = sortTraits(owned(R, 'power')).map(t => t.key);
        return `<p>${tr('If your champion could be cut off from their power (a Hextech suit, a relic that can be taken away), you may add a <b>Powerless Mode</b>: one of your powers at {d6} and another at {d10}. In this mode you can only use your <b>principle</b> abilities.', { d6: die('d6', 'sm'), d10: die('d10', 'sm') })}</p>
          <div class="tchips"><button type="button" class="tchip${pl.on ? ' on' : ''}" data-act="powerless" data-v="1">${tr('Add a Powerless Mode')}</button><button type="button" class="tchip${pl.on ? '' : ' on'}" data-act="powerless" data-v="">${tr('No Powerless Mode')}</button></div>
          ${pl.on ? `<div class="ab-cfg"><div class="cfg-l">${tr('Power at {die}', { die: 'd6' })}</div>${traitChips('arch.powerless.a', pows, pl.a, pl.b ? { [pl.b]: tr('used at d10') } : {})}
          <div class="cfg-l">${tr('Power at {die}', { die: 'd10' })}</div>${traitChips('arch.powerless.b', pows, pl.b, pl.a ? { [pl.a]: tr('used at d6') } : {})}</div>` : ''}`;
      },
      notes: () => `<p class="muted">${tr(a.modular ? 'Record which powers/dice each mode uses (this goes on your auxiliary sheet).' : 'Record which powers/dice each form uses (this goes on your auxiliary sheet).')}</p><textarea data-bind="arch.notes" data-live="1">${esc(st.arch.notes)}</textarea>`,
      principle: () => principleHtml('arch', archPrincipleCat(), R) + `<p class="muted" style="margin-top:10px">${tr('Next step: your Temperament, rolled with {dice}.', { dice: die('d10', 'sm') + die('d10', 'sm') })}</p>`
    };
    return stepPanel('Step 4 · Sentinels: Archetype', tr('Path'), 'archetype', flowHtml('archetype', sectionsFor('archetype', R), H), true);
  }

  function minionFormsHtml(R) {
    // The book lists these as examples; any quality the hero has may fit, so the examples come first.
    const EX = ['creativity', 'magical-lore', 'otherworldly-mythos', 'science', 'technology'];
    const Q = R.before.personality;   // the qualities you have at the end of this chapter
    const q = EX.filter(k => Q[k]).concat(Object.keys(Q).filter(k => !EX.includes(k) && TRAIT[k] && TRAIT[k].kind === 'quality'));
    const cur = st.arch.minionQ;
    const max = cur && Q[cur] ? dn(Q[cur].die) : 0;
    const chosen = st.arch.minionForms || [];
    return `<p class="muted"${tip(tr('<h5>Minion forms</h5>When you create a minion you may discard one bonus you have access to in order to add a form with that bonus value or higher. The number of forms you know equals the maximum value of a related quality.'))}>${tr('You know as many minion forms as the maximum value of a related quality.')}</p>
      <label class="field"><span>${tr('Related quality')}</span><select data-bind="arch.minionQ"><option value="">${tr('— choose —')}</option>${q.map(k => `<option value="${k}"${cur === k ? ' selected' : ''}>${esc(traitName(k))} (${Q[k].die})</option>`).join('')}</select></label>

      <div class="ab-list">${window.MINION_FORMS.map(([n, d, b]) => `<label class="ab${chosen.includes(n) ? ' picked' : ''}"><div class="ab-top"><input type="checkbox" data-act="minionForm" data-name="${esc(n)}"${chosen.includes(n) ? ' checked' : ''}${!chosen.includes(n) && chosen.length >= max ? ' disabled' : ''}><span class="ab-name">${esc(abName(n))}</span><span class="ab-type"${tip(tr('Bonus needed to apply this form'))}>${tr('{b} or higher', { b: esc(b) })}</span></div><div class="ab-text">${rulesText(d)}</div></label>`).join('')}</div>
      <p class="muted">${chosen.length}/${max} ${tr('chosen')}.</p>`;
  }


  function renderPersonality() {
    const R = R0, a = archDef(), pe = persDef();
    if (!a) return lockedPanel(tr('Temperament'), tr('Choose your Path first.'), 'archetype');
    // Each status die with the zone it belongs to: Green while healthy, Yellow when hurt, Red when on the ropes.
    const statusCell = x => x.status.map((d, i) => `<span class="zc ${'gyr'[i]}">${die(d, 'sm')}<i>${tr(['Green', 'Yellow', 'Red'][i])}</i></span>`).join('<span class="zc-arrow" aria-hidden="true">›</span>');
    const H = {
      roll: () => rollerHtml('pers', ['d10', 'd10'], tr('Roll 2d10 for your Temperament')),
      pick: () => pickSection('pers', pe && chosenSummary(pe.rt, pe.sc, '', pe.champs,
        `<div class="status-row"${tip(tr('<h5>Status dice</h5>The third die of every roll. Which one you use depends on your current Health zone.'))}><span class="z g">${tr('Green')} ${die(R.status[0])}</span><span class="z y">${tr('Yellow')} ${die(R.status[1])}</span><span class="z r">${tr('Red')} ${die(R.status[2])}</span></div>` +
        (pe.healthAny ? `<p class="sc">${tr('When determining Health you may use <b>any</b> power or quality.')}</p>` : '')),
        cardsHtml(window.PERSONALITIES, 'pers', st.pers.id, 'pers', x => `<span class="n">${pad2(x.n)}</span><div class="t">${esc(x.rt)}</div><div class="dice-row status-row">${statusCell(x)}</div><span class="info" aria-label="${tr('Details')}"${tip(`${cardArt('pe', x.id)}<h5>${esc(x.rt)}</h5>${x.lore ? esc(x.lore) + '<hr>' : ''}<small>${tr('Champions:')} ${esc(x.champs)}</small>`)}></span>`)),
      qname: () => `
        <div class="qname-row"><input type="text" data-bind="pers.qname" data-live="1" data-commit="1" value="${esc(st.pers.qname)}" placeholder="${tr('Type your Signature Quality')}"></div>
        <div class="qname-row"><label class="qdesc"><input type="text" data-bind="pers.qdesc" data-live="1" data-commit="1" maxlength="${QDESC_MAX}" value="${esc(st.pers.qdesc || '')}" placeholder="${tr('What is it about? A short description (up to {n} characters)', { n: QDESC_MAX })}"><span class="qdesc-n">${(st.pers.qdesc || '').length}/${QDESC_MAX}</span></label>
        <button type="button" class="btn primary" data-act="qok"${qReady() ? '' : ' disabled'}>${ico('check')} ${tr('Confirm')}</button></div>${(() => {
          // a short reminder of the qualities already taken, so the new one says something different
          const qs = sortTraits(owned(R, 'quality').filter(t => t.key !== 'rp-quality'));
          return qs.length ? `<p class="qname-have">${tr('Qualities you already have:')} ${qs.map(t => `<span>${esc(traitName(t.key))}</span>`).join(', ')}</p>` : '';
        })()}`,
      out: () => {
        const rq = reqFromText(pe.out);
        const outKeys = sortTraits(owned(R, rq.kind)).map(t => t.key);
        return `<p class="muted"${tip(`<h5>${tr('Out ability')}</h5>${window.COLOR_INFO.out}`)}>${tr('Used when your champion is knocked out.')}</p><div class="ab out picked"><div class="ab-text">${rulesText(pe.out, { trait: st.pers.outTrait })}</div>
          <div class="ab-cfg"><div class="cfg-l">${tr('Uses')}</div>${traitChips('pers.outTrait', outKeys, st.pers.outTrait)}</div></div>`;
      },
      pers2: () => `<p>${tr('Divided heroes may take a <b>second Temperament</b> for their other form. It only changes that form\'s <b>status dice</b>: your Signature Quality and Out ability stay the same, and Health uses your main Temperament.')}</p>
        <p class="muted">${st.pers.id2 ? `<button type="button" class="linkbtn" data-act="pers2" data-id="">${tr('Use one Temperament for both forms')}</button>` : tr('Skip this to use the same Temperament in both forms.')}</p>` +
        cardsHtml(window.PERSONALITIES.filter(x => x.id !== st.pers.id), 'pers2', st.pers.id2, null, x => `<span class="n">${pad2(x.n)}</span><div class="t">${esc(x.rt)}</div><div class="dice-row status-row">${statusCell(x)}</div>`),
      reckless: () => {
        const upg = sortTraits(Object.values(R.before.personality).filter(t => dn(t.die) < 12 || t.key === st.pers.upgrade)).map(t => t.key);
        return `<p>${tr('Upgrade one of your power or quality dice by one step (max {die}).', { die: die('d12') })}</p>${socket({ bind: 'pers.upgrade', mark: '+1', cur: st.pers.upgrade, groups: traitGroups(upg, k => traitItem(k, { after: `${R.before.personality[k].die} → ${upDie(R.before.personality[k].die)}` })), empty: tr('Grow one die by a size') })}`;
      }
    };
    return stepPanel('Step 5 · Sentinels: Personality', tr('Temperament'), 'personality', flowHtml('personality', sectionsFor('personality', R), H), true);
  }

  function renderRed() {
    const R = R0;
    if (!persDef()) return lockedPanel(tr('Ultimates'), tr('Choose your Temperament first.'), 'personality');
    const need = 2;
    const s = st.sel.red = st.sel.red || [];
    const cats = window.RED_ABILITIES.slice();
    const shape = abilityShape();
    if (shape && shape.extraRed) cats.push({ cat: 'X:' + shape.id, label: shape.rt + ' (' + tr('Path') + ')', list: shape.extraRed.map(a => ({ a })) });
    // Older saves stored Path Red abilities without their category.
    if (shape && shape.extraRed) for (const e of s) if (!e.cat && shape.extraRed.includes(e.name)) e.cat = 'X:' + shape.id;
    const catHtml = c => {
      const isX = c.cat.startsWith('X:');
      const inCat = isX ? [] : Object.values(R.T).filter(t => TRAIT[t.key].cat === c.cat && dn(t.die) >= 6);
      const eligible = isX || inCat.length > 0;
      const label = isX ? c.label : catLabel(c.cat);
      const sub = '';
      // abilities tied to a trait you do not have are left out (the book only allows them with that trait)
      const usable = c.list.filter(({ use }) => !use || use.some(k => R.T[k]));
      const mine = usable.filter(({ a }) => s.some(e => e.name === a && e.cat === c.cat)).length;
      const open = ui.redOpen[c.cat] != null ? ui.redOpen[c.cat] : mine > 0;
      const cards = !open ? '' : usable.map(({ a, use }) => {
        const idx = s.findIndex(e => e.name === a && e.cat === c.cat);
        const picked = idx >= 0;
        const takenElsewhere = !picked && s.some(e => displayName(e.name) === displayName(a));
        const card = abilityCard({ key: 'red', color: 'red', count: need, list: [] }, a, s[idx], picked, R, { idx, cat: isX ? null : c.cat, dataCat: c.cat, use, color: 'red' });
        const block = takenElsewhere || (!picked && s.length >= need);
        return block && !picked ? card.replace('type="checkbox"', 'type="checkbox" disabled').replace('class="ab red', 'class="ab red disabled') : card;
      }).join('');
      if (!usable.length) return '';
      return `<div class="redcat${open ? ' open' : ''}"><button type="button" class="redcat-h" data-act="redCat" data-cat="${esc(c.cat)}" aria-expanded="${open}">` +
        `<span class="redcat-t">${esc(label)}</span>${!isX ? `<span class="redcat-have">${inCat.map(t => esc(traitName(t.key)) + ' ' + die(t.die, 'sm')).join(' ')}</span>` : ''}` +
        `<span class="redcat-n">${mine ? `<b>${tr('{n} chosen', { n: mine })}</b> · ` : ''}${tr('{n} abilities', { n: usable.length })}</span><span class="redcat-arrow" aria-hidden="true">${ico(open ? 'close' : 'next')}</span></button>` +
        (open ? `<div class="ab-list">${cards}</div>` : '') + '</div>';
    };
    const eligibleCats = cats.filter(c => c.cat.startsWith('X:') || Object.values(R.T).some(t => TRAIT[t.key].cat === c.cat && dn(t.die) >= 6));
    const lockedCats = cats.filter(c => !eligibleCats.includes(c));
    const H = {
      pick: () => `<p class="count-line"><b>${s.length}/${need}</b> ${tr('chosen')}. <span class="muted">${tr('Open a category to see its abilities.')}</span></p>` +
        eligibleCats.map(catHtml).join('') +
        (lockedCats.length ? `<p class="muted"${tip(tr('You need a power or quality of these categories rated d6 or higher to take their Red abilities.'))}>${tr('Not available to you (you have no traits in these categories):')} ${lockedCats.map(c => esc(catLabel(c.cat))).join(', ')}.</p>` : '')
    };
    return stepPanel('Step 6 · Sentinels: Red Abilities', tr('Ultimates'), 'red', flowHtml('red', sectionsFor('red', R), H), false);
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
  // Current Health during play (starts at the maximum) and the zone it puts the champion in.
  function curHealth(h) {
    const v = st.play.current;
    if (!h) return null;
    if (v == null || v === '') return h.max;
    const n = parseInt(v, 10);
    return isNaN(n) ? h.max : n;
  }
  function zoneOf(h) {
    const c = curHealth(h);
    if (c == null) return null;
    return c >= h.green[1] ? 'green' : c >= h.yellow[1] ? 'yellow' : c >= 1 ? 'red' : 'out';
  }

  // Take 4 or roll a d8. Rolling cannot be undone (the book lets you re-roll once, never go back to 4),
  // so the roll option says so up front and, once used, Take 4 shows as locked.
  function healthChoice() {
    const H = st.health, rolled = !!H.roll;
    const fixedOn = !rolled && H.mode !== 'roll';
    return `<div class="hchoice" role="group" aria-label="${tr('Health roll')}">
      <button type="button" class="hc${fixedOn ? ' on' : ''}${rolled ? ' locked' : ''}" data-act="hmode" data-m="fixed"${rolled ? ' disabled' : ''}>
        <span class="hc-t">${tr('Take 4')}</span><span class="hc-d">${rolled ? `${ico('lock')} ${tr('Not available after rolling.')}` : tr('Safe: always 4.')}</span></button>
      <button type="button" class="hc roll${rolled ? ' on' : ''}" data-act="${rolled ? (H.rerolled ? '' : 'hroll') : 'hmode'}" data-m="roll"${rolled && H.rerolled ? ' disabled' : ''}>
        <span class="hc-t">${rolled ? tr('Rolled {n}', { n: H.roll }) : tr('Roll')} ${die('d8', 'sm')}</span>
        <span class="hc-d">${!rolled ? `<b class="hc-warn">${tr('Final: after rolling you cannot go back to 4.')}</b> ${tr('You may re-roll once.')}` : H.rerolled ? tr('Re-roll already used.') : tr('Click to re-roll (once).')}</span></button></div>`;
  }

  function renderHealth() {
    const R = R0;
    const h = healthCalc(R);
    if (!h) return lockedPanel(tr('Health'), tr('Choose your Temperament first (your Red status die is part of Health).'), 'personality');
    const H = {
      review: () => `<div class="grid2"><div class="detail">
        <label class="field"><span>${tr('Trait added to Health (highest by default)')}</span><select data-bind="health.trait">${h.elig.map(t => `<option value="${t.key}"${h.chosen && h.chosen.key === t.key ? ' selected' : ''}>${esc(traitName(t.key))} (${t.die})</option>`).join('')}${h.elig.length ? '' : `<option value="">${tr('none — use d4')}</option>`}</select></label>
        ${healthChoice()}
      </div><div class="detail">
        <table style="width:100%;font-size:.95rem"><tbody>
        <tr><td>${tr('Base')}</td><td style="text-align:right">8</td></tr>
        <tr><td>${tr('Red status die max')} ${die(R.status[2], 'sm')}</td><td style="text-align:right">${h.red}</td></tr>
        <tr><td>${h.chosen ? esc(traitName(h.chosen.key)) + ' ' + die(h.chosen.die, 'sm') : tr('No eligible trait') + ' ' + die('d4', 'sm')}</td><td style="text-align:right">${h.traitMax}</td></tr>
        <tr><td>${tr(st.health.mode === 'roll' ? 'd8 roll' : 'Fixed')}</td><td style="text-align:right">${h.roll}</td></tr>
        <tr><td><b>${tr('Maximum Health')}</b></td><td style="text-align:right"><b>${h.max}</b></td></tr></tbody></table>
      </div></div>
      <div class="hs-health" style="margin-top:14px"><div class="max">${tr('Max')}<b>${h.max}</b></div><div class="g"${tip(window.GLOSSARY['Green zone'])}>${tr('Green')}<b>${h.green[0]}–${h.green[1]}</b></div><div class="y"${tip(window.GLOSSARY['Yellow zone'])}>${tr('Yellow')}<b>${h.yellow[0]}–${h.yellow[1]}</b></div><div class="r"${tip(window.GLOSSARY['Red zone'])}>${tr('Red')}<b>${h.redR[0]}–1</b></div></div>`
    };
    return stepPanel('Step 8 · Sentinels: Health', tr('Health'), 'health', flowHtml('health', sectionsFor('health', R), H), false);
  }

  // ------------------------------------------------------------------ compile sheet
  function principlesFinal() {
    const out = [];
    const bgP = st.bg.principle, arP = st.arch.principle;
    if (bgP) out.push({ slot: 'bg', id: st.evo.principles.bg || bgP });
    if (arP) out.push({ slot: 'arch', id: st.evo.principles.arch || arP });
    return out.map(x => ({ ...x, p: PRINCIPLES.find(p => p.id === x.id) })).filter(x => x.p);
  }

  // ------------------------------------------------------------------ evolution between collections
  // Rulebook "Change details": swap a power or quality for another of the same die, a principle for another,
  // or an ability for another of the same colour from the same lists. Stored as an overlay (st.evo) so the
  // creation chapters stay as they were built; the sheet and the PDF show the evolved champion.
  const evoTrait = k => (k && st.evo.traits[k]) || k;
  function evolvedR(R) {
    const T = {};
    for (const [k, t] of Object.entries(R.T)) { const nk = evoTrait(k); T[nk] = { ...t, key: nk }; }
    return { ...R, T };
  }
  function evoAb(x) {
    const e = x.entry || {};
    const entry = { ...e, trait: evoTrait(e.trait), trait2: evoTrait(e.trait2) };
    const o = st.evo.abilities[x.iid];
    if (!o) return { ...x, entry };
    return { ...x, name: o.name, orig: x.name, entry: { ...entry, ch: o.ch || {}, trait: o.trait || entry.trait } };
  }
  const prName = id => { const p = PRINCIPLES.find(x => x.id === id); return p ? (window.PRINCIPLE_LORE[id] || [p.name])[0] : id; };
  // Abilities that can be swapped: the ones picked from a list (automatic, form and mode abilities are part of the Path itself).
  const evoGroupKeys = () => groups().filter(g => !g.fixed && !/fixed|mod|form|div/.test(g.key)).map(g => g.key).concat('red');
  const evoAbilityChoices = () => { const keys = evoGroupKeys(); return allAbilities(R0).filter(x => keys.includes(x.gkey)); };
  // "Use the same power or quality for that ability."
  function evoFits(name, entry, RT) {
    const ab = A[name];
    if (!ab) return false;
    const req = reqFromText(ab.text);
    if (req.kind === 'none') return true;
    if (req.only) return req.only.some(k => RT[k]);
    const t = entry.trait;
    if (!t || !TRAIT[t]) return false;
    if (req.kind !== 'any' && TRAIT[t].kind !== req.kind) return false;
    if (req.cat && TRAIT[t].cat !== req.cat) return false;
    if (req.second && !(entry.trait2 && RT[entry.trait2])) return false;
    return true;
  }
  // Same colour, same Source/Path (or Ultimate category) list, not already on the sheet.
  function evoAbilityOptions(x) {
    let list = [];
    if (x.gkey === 'red') {
      const cat = x.entry.cat || '';
      if (cat.startsWith('X:')) list = (abilityShape() && abilityShape().extraRed) || [];
      else { const c = window.RED_ABILITIES.find(r => r.cat === cat); list = c ? c.list.filter(o => !o.use || o.use.includes(x.entry.trait)).map(o => o.a) : []; }
    } else { const g = groups().find(y => y.key === x.gkey); list = g ? g.list : []; }
    const RT = evolvedR(R0).T;
    const taken = allAbilities(R0).filter(y => y.color === x.color).map(y => displayName(y.name));
    return list.filter(n => !taken.includes(displayName(n)) && evoFits(n, x.entry, RT));
  }
  const evoSnapshot = () => JSON.parse(JSON.stringify({ traits: st.evo.traits, principles: st.evo.principles, abilities: st.evo.abilities, pch: st.pch, renames: st.renames }));
  const lastCollection = () => (st.play.coll || []).filter(Boolean).slice(-1)[0] || '';

  function evoApply() {
    const E = ui.evo, RT = evolvedR(R0).T, undo = evoSnapshot();
    let from = '', to = '';
    if (E.tab === 'power' || E.tab === 'quality') {
      if (!RT[E.from] || RT[E.to] || !TRAIT[E.to] || TRAIT[E.to].kind !== TRAIT[E.from].kind) return;
      const orig = Object.keys(st.evo.traits).find(o => st.evo.traits[o] === E.from) || E.from;
      from = `${sheetTraitName(E.from)} (${RT[E.from].die})`; to = traitName(E.to);
      if (E.to === orig) delete st.evo.traits[orig]; else st.evo.traits[orig] = E.to;
    } else if (E.tab === 'principle') {
      const cur = principlesFinal().find(x => x.slot === E.from);
      if (!cur || !E.to || principlesFinal().some(x => x.id === E.to)) return;
      if (E.to === 'energy-element' && !(E.el || '').trim()) return;
      from = prName(cur.id); to = prName(E.to);
      st.evo.principles[E.from] = E.to;
      if (E.to === 'energy-element') { st.pch[E.from] = E.el.trim(); to += ` (${st.pch[E.from]})`; }
    } else if (E.tab === 'ability') {
      const x = evoAbilityChoices().find(y => y.iid === E.from);
      if (!x || !evoAbilityOptions(x).includes(E.to)) return;
      if (choiceTokens(A[E.to].text).some(tk => !(E.ch[tk] || '').trim())) return;
      from = st.renames[x.iid] || abName(x.name); to = abName(E.to);
      const req = reqFromText(A[E.to].text);
      if (E.to === (x.orig || x.name)) delete st.evo.abilities[x.iid];
      else st.evo.abilities[x.iid] = { name: E.to, ch: { ...E.ch }, trait: req.only ? req.only.find(k => RT[k]) : undefined };
      delete st.renames[x.iid];   // the old ability's custom name does not carry over
    } else return;
    st.evo.log.push({ kind: E.tab, from, to, coll: lastCollection(), t: Date.now(), undo });
    ui.evo = { tab: E.tab, from: '', to: '', ch: {} };
    render();
  }
  function evoUndo() {
    const e = st.evo.log[st.evo.log.length - 1];
    if (!e || !e.undo) return;
    st.evo.log.pop();
    Object.assign(st.evo, { traits: e.undo.traits, principles: e.undo.principles, abilities: e.undo.abilities });
    st.pch = e.undo.pch; st.renames = e.undo.renames;
    render();
  }
  // "Majorly rewrite": creation again with the Constructed method, keeping the champion's history.
  function evoRewrite() {
    if (!confirm(tr('Rewrite the champion? You go through creation again with the Constructed method. Name, description, portrait, biography, collections, back issues, notes and the change history are kept.'))) return;
    const coll = lastCollection();
    const keep = { info: st.info, play: { ...st.play, current: null }, region: st.region, log: st.evo.log.map(({ undo, ...e }) => e) };
    st = blank();
    Object.assign(st, { info: keep.info, play: keep.play, region: keep.region, method: 'constructed' });
    st.evo.log = keep.log.concat({ kind: 'rewrite', from: '', to: '', coll, t: Date.now() });
    st.maxStep = stepIndex('background'); st.step = 'background';
    ui.evo = { tab: 'power', from: '', to: '', ch: {} };
    if (SHEET_PAGE) { save(); location.href = 'index.html'; return; }   // the chapters live in the Forge
    render(); scrollTo(0, 0);
  }

  function evolveHtml() {
    const RT = evolvedR(R0).T, E = ui.evo;
    const opt = (v, label, cur) => `<option value="${esc(v)}"${v === cur ? ' selected' : ''}>${esc(label)}</option>`;
    const sel = (field, label, options) => `<label class="field"><span>${label}</span><select data-evo="${esc(field)}"><option value="">${tr('— choose —')}</option>${options}</select></label>`;
    let form = '', note = '', why = '', ok = false;
    if (E.tab === 'power' || E.tab === 'quality') {
      const mine = sortTraits(Object.values(RT).filter(t => TRAIT[t.key].kind === E.tab));
      const from = RT[E.from] && TRAIT[E.from].kind === E.tab ? E.from : '';
      const cands = Object.keys(TRAIT).filter(k => k !== 'rp-quality' && TRAIT[k].kind === E.tab && !RT[k]);
      const byCat = {};
      cands.forEach(k => (byCat[TRAIT[k].cat] = byCat[TRAIT[k].cat] || []).push(k));
      form = sel('from', tr('Swap'), mine.map(t => opt(t.key, `${sheetTraitName(t.key)} (${t.die})`, from)).join(''))
        + sel('to', tr('For'), Object.entries(byCat).map(([c, ks]) => `<optgroup label="${esc(catName(c))}">${ks.sort((a, b) => traitName(a).localeCompare(traitName(b))).map(k => opt(k, traitName(k), E.to)).join('')}</optgroup>`).join(''));
      if (from) note = tr('The new trait keeps the {die}, and every ability that used {old} now uses it.', { die: RT[from].die, old: esc(sheetTraitName(from)) });
      ok = !!(from && cands.includes(E.to));
    } else if (E.tab === 'principle') {
      const cur = principlesFinal();
      const byCat = {};
      PRINCIPLES.filter(p => !cur.some(x => x.id === p.id)).forEach(p => (byCat[p.cat] = byCat[p.cat] || []).push(p));
      form = sel('from', tr('Swap'), cur.map(x => opt(x.slot, prName(x.id), E.from)).join(''))
        + sel('to', tr('For'), Object.entries(byCat).map(([c, ps]) => `<optgroup label="${esc(tr(c))}">${ps.map(p => opt(p.id, prName(p.id), E.to)).join('')}</optgroup>`).join(''));
      if (E.to === 'energy-element') form += `<label class="field"><span>${tr('Energy or element')}</span><input type="text" data-evo="el" value="${esc(E.el || '')}" placeholder="${tr('e.g. fire, Hextech, shadow')}"></label>`;
      const p = PRINCIPLES.find(x => x.id === E.to);
      if (p) note = `<b>${esc(prName(p.id))}</b> · ${esc(p.rp)}`;
      ok = !!(cur.some(x => x.slot === E.from) && p && (E.to !== 'energy-element' || (E.el || '').trim()));
    } else {
      const list = evoAbilityChoices();
      const from = list.find(x => x.iid === E.from);
      form = sel('from', tr('Swap'), list.map(x => opt(x.iid, `${st.renames[x.iid] || abName(x.name)} · ${tr(x.color === 'green' ? 'Green' : x.color === 'yellow' ? 'Yellow' : 'Red')}`, E.from)).join(''));
      if (from) {
        const cands = evoAbilityOptions(from);
        if (cands.length) form += sel('to', tr('For'), cands.map(n => opt(n, abName(n), E.to)).join(''));
        else why = tr('No other ability of this colour, from the same list, fits the same power or quality.');
        const toks = cands.includes(E.to) ? choiceTokens(A[E.to].text) : [];
        toks.forEach(tk => {
          const c = CHOICE_TOKENS[tk];
          form += Array.isArray(c) ? sel('ch.' + tk, esc(tokenLabel(tk)), c.map(v => opt(v, tr(v), E.ch[tk])).join(''))
            : `<label class="field"><span>${esc(tokenLabel(tk))}</span><input type="text" data-evo="ch.${esc(tk)}" value="${esc(E.ch[tk] || '')}"></label>`;
        });
        if (cands.includes(E.to)) note = `<b>${esc(abName(E.to))}</b> <span class="muted">${esc(A[E.to].type || '')}</span><div>${rulesText(A[E.to].text, { ...from.entry, ch: E.ch })}</div>`;
        ok = cands.includes(E.to) && toks.every(tk => (E.ch[tk] || '').trim());
      }
    }
    const KIND = { power: tr('Power'), quality: tr('Quality'), principle: tr('Principle'), ability: tr('Ability'), rewrite: tr('Full rewrite') };
    const log = st.evo.log;
    const canUndo = log.length && log[log.length - 1].undo;
    const tabs = ['power', 'quality', 'principle', 'ability'].map(t => `<button type="button" role="tab" class="evo-tab${E.tab === t ? ' on' : ''}" aria-selected="${E.tab === t}" data-act="evoTab" data-tab="${t}">${KIND[t]}</button>`).join('');
    return `<section class="flow-sec current evolve" id="flow-evolve"><div class="flow-head"><span class="flow-num">${ico('reset')}</span><h3>${tr('Evolve your champion')}</h3></div>
      <div class="flow-body">
        <p class="muted">${tr('Every six back issues become a collection, and a collection closes a storyline. Between collections your champion can change. Pick the size of the change:')}</p>
        <div class="evo-ways">
          <div><b>${tr('Cosmetic changes')}</b><span>${tr('New look, alias, costume or name: edit them in the Legend chapter of the Forge. No rules involved.')}</span></div>
          <div class="on"><b>${tr('Change details')}</b><span>${tr('Swap one power or quality for another of the same die, one principle for another, or one ability for another of the same colour. Use the form below.')}</span></div>
          <div><b>${tr('Major rewrite')}</b><span>${tr('When too much changed, go through creation again with the Constructed method, keeping the champion\'s history.')}</span></div>
        </div>
        <div class="evo-tabs" role="tablist" aria-label="${tr('What to change')}">${tabs}</div>
        <div class="evo-form">${form}</div>
        ${note ? `<div class="evo-note">${note}</div>` : ''}${why ? `<p class="evo-why">${why}</p>` : ''}
        <div class="export-row"><button class="btn primary" data-act="evoApply"${ok ? '' : ' disabled'}>${ico('mark')} ${tr('Apply change')}</button>${lastCollection() ? `<small class="muted">${tr('Recorded under the collection “{c}”.', { c: esc(lastCollection()) })}</small>` : ''}</div>
        <h4 class="evo-h">${tr('Change history')}</h4>
        ${log.length ? `<ol class="evo-log">${log.slice().reverse().map(e => `<li><span class="evo-k">${esc(KIND[e.kind] || e.kind)}</span><span>${e.kind === 'rewrite' ? esc(tr('The champion was rewritten from scratch.')) : `${esc(e.from)} ${ico('next')} <b>${esc(e.to)}</b>`}</span>${e.coll ? `<small>${esc(e.coll)}</small>` : ''}</li>`).join('')}</ol>
          <button class="btn small ghost" data-act="evoUndo"${canUndo ? '' : ' disabled'}>${ico('reset')} ${tr('Undo last change')}</button>` : `<p class="muted">${tr('No changes yet. They also appear on page 3 of the sheet.')}</p>`}
        <div class="evo-rewrite"><div><b>${tr('Major rewrite')}</b><p class="muted">${tr('Starts the chapters again from the Origin with the Constructed method. Name, description, portrait, biography, collections, back issues, notes and this history stay.')}</p></div><button class="btn" data-act="evoRewrite">${ico('reset')} ${tr('Rewrite champion')}</button></div>
      </div></section>`;
  }

  // Chapter IX lore guide: one card per choice, each with questions that help write the biography.
  function loreGuide() {
    const r = regionDef(), b = bgDef(), p = psDef(), a = archDef(), pe = persDef();
    const fill = (t, slot) => String(t || '').replace(/\[([^\]]+)\]/g, (m, k) => (k === 'energy/element' && st.pch[slot]) || tokenLabel(k));
    const C = [];
    const pp = peopleDef();
    if (pp) C.push({ kicker: tr('People'), title: pp.name, text: esc(pp.lore), color: pp.color, link: 'lore.html#races',
      qs: [tr('What does your people think of you, and what do you think of them?'), tr('Which custom of your people do you still keep, even far from home?')] });
    if (r) C.push({ kicker: tr('Homeland'), title: r.name, text: esc(r.tag), color: r.color,
      link: window.LORE_FOR_REGION && window.LORE_FOR_REGION[r.id] ? 'lore.html#' + window.LORE_FOR_REGION[r.id].replace(/^lore-/, '') : '',
      qs: [...((window.BIO_REGION || {})[r.id] || []), r.champs ? tr('Which of these champions does your hero know, admire or fear? {c}.', { c: r.champs }) : ''] });
    if (b) C.push({ kicker: tr('Origin'), title: b.rt, text: esc(b.lore),
      qs: [tr('What from that life do you still carry, and who did you leave behind?'), tr('Who from those days would recognise you today?')] });
    if (p) C.push({ kicker: tr('Source of Power'), title: p.rt, text: esc(p.lore),
      qs: [tr('When did this power first show itself, and what did it cost you?'), tr('Who else knows where your power comes from?')] });
    if (a) C.push({ kicker: tr('Path'), title: a.rt + (a.role ? ' · ' + a.role : ''), text: esc(a.lore),
      qs: [tr('Who taught you to fight like this?'), tr('What was the first fight you could not win?')] });
    if (pe) C.push({ kicker: tr('Temperament'), title: pe.rt, text: '',
      qs: [tr('Where does this way of being come from?'), tr('Who clashes with you, or is won over, because of it?')] });
    for (const x of principlesFinal()) C.push({ kicker: tr('Principle'), title: (window.PRINCIPLE_LORE[x.id] || [x.p.name])[0], text: esc(fill(x.p.rp, x.slot)),
      qs: [fill(x.p.major, x.slot)] });
    C.push({ kicker: tr('The campaign'), title: tr('The present day (994 DN)'), text: esc(tr('The story of the table starts now, in times of political unrest, returning gods and global threats.')),
      link: 'lore.html#present', qs: [tr('Where is your hero when the campaign begins, and why?'), tr('What do they want that they cannot get alone?')] });
    return C;
  }

  function allAbilities(R) {
    const L = [];
    const srcName = { powersource: 'Source', archetype: 'Path' };
    for (const g of groups()) {
      for (const e of selOf(g)) L.push(evoAb({ iid: g.key + ':' + e.name, gkey: g.key, name: e.name, color: g.color, src: srcName[g.step], entry: e }));
    }
    for (const x of principlesFinal()) {
      L.push({ iid: 'pr:' + x.slot, name: x.p.name, color: 'green', src: 'Principle', text: x.p.ability, type: x.p.type, entry: { ch: { 'energy/element': st.pch[x.slot] } } });
    }
    for (const e of st.sel.red || []) L.push(evoAb({ iid: 'red:' + e.cat + ':' + e.name, gkey: 'red', name: e.name, color: 'red', src: 'Ultimate', entry: e }));
    const pe = persDef();
    if (pe) L.push({ iid: 'out', name: 'Out', color: 'out', src: 'Temperament', text: pe.out, type: PT ? '' : '—', entry: { trait: evoTrait(st.pers.outTrait) } });
    return L;
  }

  // ------------------------------------------------------------------ action icons (the "ICON" column of the hero sheet)
  const ICONS = PT ? {
    Attack: ['ATQ', 'Atacar'], Defend: ['DEF', 'Defender'], Overcome: ['SUP', 'Superar'],
    Boost: ['FOR', 'Fortalecer'], Hinder: ['ATR', 'Atrapalhar'], Recover: ['REC', 'Recuperar']
  } : {
    Attack: ['ATK', 'Attack'], Defend: ['DEF', 'Defend'], Overcome: ['OVR', 'Overcome'],
    Boost: ['BST', 'Boost'], Hinder: ['HIN', 'Hinder'], Recover: ['REC', 'Recover']
  };
  const catLabel = c => catPhrase(c, true);
  function actionIcons(text) {
    const out = [];
    (text || '').replace(/\b(Attack|Defend|Overcome|Boost|Hinder|Recover)\b/g, (m, a) => { if (!out.includes(a)) out.push(a); return m; });
    return out;
  }
  const iconHtml = text => actionIcons(text).map(a => `<span class="act-ic act-${a.toLowerCase()}"${tip(`<h5>${tr('{a} icon', { a: ICONS[a][1] })}</h5>${window.GLOSSARY[a]}<hr><small>${tr('The hero sheet\'s ICON column shows which basic actions an ability uses.')}</small>`)}>${ICONS[a][0]}</span>`).join('');

  // Plain-text version of an ability (brackets filled in) for the PDF sheet.
  function plainText(text, entry) {
    return String(ruleSrc(text || '')).replace(/\[([^\]]+)\]/g, (m, br) => {
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
    let n = (window.PRINCIPLE_LORE[x.id] || [x.p.name])[0].replace(/^Principle of /, '').replace(/^Princípio /, '');   // pt keeps its article: "do Destino"
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
      const base = x.name === 'Out' ? tr('Out') : abName(x.name), own = (st.renames[x.iid] || '').trim();
      return { x, name: own || base, base, renamed: !!own && own !== base, orig: displayName(x.name), type: x.type || (ab && ab.type) || '', text, entry: x.entry };
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
    const h = healthCalc(R);   // Health stays as built; traits show any swaps made between collections
    const powers = sortTraits(owned(evolvedR(R), 'power'));
    const quals = sortTraits(owned(evolvedR(R), 'quality'));
    const i = st.info, pl = st.play;
    const pr = principlesFinal();
    const rows = sheetRows(R);
    // Table mode: the current Health decides the zone, which lights its status die and locks the zones above it.
    const zNow = zoneOf(h);
    const ZRANK = { green: 0, yellow: 1, red: 2, out: 3 };
    const ZNAME = { green: tr('Green zone'), yellow: tr('Yellow zone'), red: tr('Red zone'), out: tr('Out of the fight') };
    const zLocked = z => zNow && ZRANK[z] > ZRANK[zNow] || zNow === 'out';
    const charLine = (label, d, extra = '', more = '') => `<div class="hs-f"><span class="hs-l">${label}</span>${d ? `<span${tip(`${esc(d.lore || '')}${more}`)} class="term">${esc(d.rt + extra)}</span>` : BLANK}</div>`;
    const zoneDice = list => `<div class="status-row"><span class="z g">${tr('Green')} ${die(list[0])}</span><span class="z y">${tr('Yellow')} ${die(list[1])}</span><span class="z r">${tr('Red')} ${die(list[2])}</span></div>`;
    const peDice = () => {
      if (!pe || !pe.status) return '';
      const p2 = st.pers.id2 && byId(window.PERSONALITIES, st.pers.id2);
      return `<hr><div class="sc-line">${tr('Status dice')}</div>${zoneDice(pe.status)}` + (p2 ? `<div class="sc-line">${tr('Other form')}: ${esc(p2.rt)}</div>${zoneDice(p2.status)}` : '');
    };
    const attr = (label, v) => `<div class="hs-f"><span class="hs-l">${label}</span>${esc(v || '')}</div>`;
    // keeps the paragraphs and line breaks typed in the Legend chapter
    const attrML = (label, v) => `<div class="hs-f"><span class="hs-l">${label}</span><span class="hs-ml">${esc((v || '').trim())}</span></div>`;
    const traitRows = (list, n) => {
      const sp = splitOn() ? (st.arch.split || {}) : {};
      const formTag = k => sp[k] && sp[k] !== 'both' ? ` <small class="hs-form-tag"${tip(tr(sp[k] === 'civ' ? 'Only in your civilian form' : 'Only in your heroic form'))}>${tr(sp[k] === 'civ' ? 'civil' : 'heroic')}</small>` : '';
      const out = list.map(t => `<tr><td>${t.key === 'rp-quality' && st.pers.qname ? `<span class="term"${tip(traitTip('rp-quality'))}>${esc(st.pers.qname)}</span>` : traitSpan(t.key)}${renamedTrait(t.key) ? origTag(baseTraitName(t.key)) : ''}${formTag(t.key)}</td><td class="dt">${die(t.die, 'sm')}</td></tr>`);
      while (out.length < n) out.push('<tr><td>&nbsp;</td><td class="dt"></td></tr>');
      return out.join('');
    };
    const abRow = (r, zone) => `<tr><td class="ic">${iconHtml(r.text)}</td><td class="nm">${esc(r.name)}${r.renamed ? origTag(r.base) : ''}</td><td class="ty"${tip(window.ABILITY_TYPES[r.type] || '')}>${esc(r.type)}</td><td class="gt">${rulesText(r.text, r.entry)}</td></tr>`;
    const emptyRows = (n, have) => Array.from({ length: Math.max(0, n - have) }, () => '<tr><td class="ic"></td><td class="nm">&nbsp;</td><td class="ty"></td><td class="gt"></td></tr>').join('');
    const prRow = (x, r) => `<tr class="pr-row"><td class="ic">${iconHtml(x.p.ability)}</td><td class="nm"><small class="po-lbl">${tr('Principle of')}</small> ${esc(principleShort(x))}</td><td class="ty">${esc(x.p.type)}</td><td class="gt">${rulesText(x.p.ability, { ch: { 'energy/element': st.pch[x.slot] } })}</td></tr>`;
    const check = (path, val, label) => `<input type="checkbox" class="hs-chk" data-bind="${path}" data-live="1"${val ? ' checked' : ''} aria-label="${esc(label)}">`;
    const zone = (cls, label, body) => `<div class="hs-zone ${cls}${zLocked(cls) ? ' locked' : ''}${zNow === cls ? ' now' : ''}"><div class="zlbl">${label}</div><table class="hs-ab-t">${zLocked(cls) ? `<caption class="zlock">${ico('lock')} ${zNow === 'out' ? tr('Out of the fight: only your Out action is available.') : tr('Unlocked when your Health reaches the {z}.', { z: ZNAME[cls].toLowerCase() })}</caption>` : ''}<thead><tr><th>${tr('Icon')}</th><th>${tr('Name')}</th><th>${tr('Type')}</th><th>${tr('Game text')}</th></tr></thead><tbody>${body}</tbody></table></div>`;
    const principleCol = x => x ? `<div class="hs-pr"><div class="hs-pr-h">${tr('Principle of')} <b>${esc(principleShort(x))}</b> <small class="muted">${esc(tr(x.p.cat))}</small></div>
      <div class="hs-pr-s"><span class="hs-l">${tr('During roleplaying')}</span>${esc(principleText(x, x.p.rp))}</div>
      <div class="hs-pr-s"><span class="hs-l">${tr('Minor twist')}</span>${esc(x.p.minor)}</div>
      <div class="hs-pr-s"><span class="hs-l">${tr('Major twist')}</span>${esc(x.p.major)}</div></div>` : `<div class="hs-pr"><div class="hs-pr-h">${tr('Principle of')} …</div></div>`;
    return `<div class="hero-sheet">
      <div class="hs-page" id="hs-p1">
        <div class="hs-top">
          <div class="hs-left"><div class="hs-portrait">${i.portrait ? `<img src="${i.portrait}" alt="${tr('Portrait of {name}', { name: esc(i.name || tr('your champion')) })}">` : `<span class="muted">${tr('Portrait')}</span>`}</div>
            <div class="hs-card hs-hpcard"><div class="hs-hpgrp"><div class="hs-h"${tip(window.GLOSSARY['hero point'])}>${tr('Hero Points')}</div><div class="hs-hp">${[0, 1, 2, 3, 4].map(n => check(`play.hp.${n}`, pl.hp[n], tr('Hero point {n}', { n: n + 1 }))).join('')}</div></div>
            <div class="hs-hpgrp hs-rw"><div class="hs-h"${tip(tr('Rewards you can claim by spending hero points — tick them off as you use them.'))}>${tr('Hero Point Rewards')}</div>
            ${[1, 2, 3, 4].map(r => `<div class="hs-hp"><b>+${r}</b>${[0, 1, 2, 3].map(c => check(`play.rw.${(r - 1) * 4 + c}`, pl.rw[(r - 1) * 4 + c], tr('+{r} reward {c}', { r, c: c + 1 }))).join('')}</div>`).join('')}</div></div></div>
          <div class="hs-idblock">
            <div class="hs-card"><div class="hs-h">${tr('Player')}</div>${esc(i.player || '')}&nbsp;</div>
            <div class="hs-card hs-2"><div><div class="hs-h">${tr('Alias')}</div><div class="hs-name">${esc(i.alias || (i.name ? '' : tr('Unnamed Champion')))}</div></div><div><div class="hs-h">${tr('Hero Name')}</div><div class="hs-name hs-title">${esc(i.name || '')}</div></div></div>
            <div class="hs-card"><div class="hs-h">${tr('Physical Attributes')}</div>
              <div class="hs-3">${attr(tr('Gender'), i.gender)}${attr(tr('Age'), i.age)}${attr(tr('Height'), i.height)}</div>
              <div class="hs-3">${attr(tr('Eyes'), i.eyes)}${attr(tr('Hair'), i.hair)}${attr(tr('Skin'), i.skin)}</div>
              ${attr(tr('Build'), i.build)}${attrML(tr('Costume/Equipment'), i.costume)}<div class="hs-2">${attr(tr('People'), peopleDef() ? peopleDef().name : '')}${attr(tr('Homeland'), rg ? rg.name : '')}</div></div>
            <div class="hs-card"><div class="hs-h">${tr('Characteristics')}</div>
              <div class="hs-2">${charLine(tr('Background'), bg)}${charLine(tr('Power Source'), ps)}</div>
              <div class="hs-2">${charLine(tr('Archetype'), ar, shape && shape !== ar ? ' ' + shape.rt : '')}${charLine(tr('Personality'), pe, '', peDice())}</div></div>
          </div>
        </div>
        <div class="hs-prs">${principleCol(pr[0])}${principleCol(pr[1])}</div>
      </div>
      <div class="hs-page" id="hs-p2">
        <div class="hs-card hs-3"><div><div class="hs-h">${tr('Alias')}</div>${esc(i.alias || '')}</div><div><div class="hs-h">${tr('Hero Name')}</div>${esc(i.name || '')}</div><div><div class="hs-h">${tr('Player')}</div>${esc(i.player || '')}</div></div>
        <div class="hs-stats">
          <table class="hs-traits"><thead><tr><th>${tr('Powers')}</th><th>${tr('Die')}</th></tr></thead><tbody>${traitRows(powers, 6)}</tbody></table>
          <table class="hs-traits"><thead><tr><th>${tr('Qualities')}</th><th>${tr('Die')}</th></tr></thead><tbody>${traitRows(quals, 6)}</tbody></table>
          <div class="hs-status"><div class="hs-h"${tip(window.GLOSSARY['status die'])}>${tr('Status Dice')}</div>${R.status ? ['Green', 'Yellow', 'Red'].map((z, n) => `<div class="hs-sd ${z.toLowerCase()}${zNow === z.toLowerCase() ? ' current' : ''}"><small>${tr(z)}</small>${die(R.status[n])}${R.status2 ? `<span class="hs-sd2"${tip(tr('Status die of your other form'))}>${die(R.status2[n], 'sm')}</span>` : ''}</div>`).join('') : BLANK}${R.status2 ? `<div class="hs-sd-note">${tr('Big die: main form. Small die: other form.')}</div>` : ''}</div>
          <div class="hs-hr"><div class="hs-h"${tip(window.GLOSSARY.Health)}>${tr('Health Range')}</div>${h ? `<div class="burst g${zNow === 'green' ? ' now' : ''}">${tr('Green')}<b>${h.green[0]}–${h.green[1]}</b></div><div class="burst y${zNow === 'yellow' ? ' now' : ''}">${tr('Yellow')}<b>${h.yellow[0]}–${h.yellow[1]}</b></div><div class="burst r${zNow === 'red' ? ' now' : ''}">${tr('Red')}<b>${h.redR[0]}–1</b></div>
            <div class="burst c">${tr('Current')}<input type="text" inputmode="numeric" data-bind="play.current" data-live="1" value="${esc(curHealth(h))}" aria-label="${tr('Current Health')}"></div>
            <div class="hs-track hs-noexport" role="group" aria-label="${tr('Adjust Health')}"><button type="button" data-act="hpStep" data-d="-1" aria-label="${tr('Lose 1 Health')}">−</button><button type="button" data-act="hpStep" data-d="1" aria-label="${tr('Recover 1 Health')}">+</button><button type="button" data-act="hpStep" data-d="max" aria-label="${tr('Back to full Health')}"${tip(tr('Back to full Health'))}>${ico('reset')}</button></div>
            <div class="hs-znow z-${zNow}">${ZNAME[zNow]}</div>` : BLANK}</div>
        </div>
        <div class="hs-h" style="margin-top:12px">${tr('Abilities')}</div>
        ${zone('green', tr('Green zone'), rows.green.map(r => abRow(r)).join('') + emptyRows(5, rows.green.length) + pr.map(x => prRow(x)).join(''))}
        ${zone('yellow', tr('Yellow zone'), rows.yellow.map(r => abRow(r)).join('') + emptyRows(5, rows.yellow.length))}
        ${zone('red', tr('Red zone'), rows.red.map(r => abRow(r)).join('') + emptyRows(3, rows.red.length))}
        <div class="hs-out${zNow === 'out' ? ' on' : ''}"><span class="zlbl"${tip(window.COLOR_INFO.out)}>${tr('Out')}</span>${rows.out ? rulesText(rows.out.text, rows.out.entry) : ''}</div>
      </div>
      ${auxPageHtml()}
    </div>`;
  }

  // Page 3, the auxiliary sheet: biography, forms/modes, minions in play and table notes.
  function auxPageHtml() {
    const i = st.info, pl = st.play, forms = st.arch.minionForms || [];
    const paras = (i.notes || '').split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);
    const lines = n => Array.from({ length: n }, () => '<div class="hs-rule"></div>').join('');
    const line = (path, n, label) => `<input class="hs-line" type="text" data-bind="${path}.${n}" data-live="1" value="${esc((pl[path.split('.')[1]] || [])[n] || '')}" aria-label="${esc(label)}">`;
    const log = st.evo.log;
    const side = `${forms.length ? `<div class="hs-card"><div class="hs-h"${tip(tr('<h5>Minion forms</h5>When you create a minion you may discard one bonus you have access to in order to add a form with that bonus value or higher. The number of forms you know equals the maximum value of a related quality.'))}>${tr('Minion forms')}</div>
              ${forms.map(n => { const f = window.MINION_FORMS.find(x => x[0] === n) || [n, '', '']; return `<div class="hs-form"><b>${esc(abName(n))}</b> <small>${tr('{b} or higher', { b: esc(f[2]) })}</small><div>${rulesText(f[1])}</div></div>`; }).join('')}</div>` : ''}
            ${archDef() && archDef().modular && st.arch.powerless && st.arch.powerless.on && st.arch.powerless.a && st.arch.powerless.b ? `<div class="hs-card"><div class="hs-h">${tr('Powerless Mode')}</div><div>${esc(traitName(st.arch.powerless.a))} ${die('d6', 'sm')} · ${esc(traitName(st.arch.powerless.b))} ${die('d10', 'sm')}</div><small class="muted">${tr('Only your principle abilities can be used in this mode.')}</small></div>` : ''}
            ${st.arch.notes ? `<div class="hs-card"><div class="hs-h">${tr('Forms and modes')}</div><div class="hs-pre">${esc(st.arch.notes)}</div></div>` : ''}
            ${log.length ? `<div class="hs-card"><div class="hs-h"${tip(tr('Changes made between collections (Sheet page, “Evolve your champion” tab).'))}>${tr('Evolution')}</div>${log.map(e => `<div class="hs-evo">${e.coll ? `<small>${esc(e.coll)}</small>` : ''}${e.kind === 'rewrite' ? esc(tr('The champion was rewritten from scratch.')) : `${esc(e.from)} → ${esc(e.to)}`}</div>`).join('')}</div>` : ''}`.trim();
    return `<div class="hs-page hs-aux" id="hs-p3">
        <div class="hs-card hs-3"><div><div class="hs-h">${tr('Alias')}</div>${esc(i.alias || '')}</div><div><div class="hs-h">${tr('Hero Name')}</div>${esc(i.name || '')}</div><div><div class="hs-h">${tr('Player')}</div>${esc(i.player || '')}</div></div>
        <div class="hs-aux-grid${side ? '' : ' solo'}">
          <div class="hs-card hs-bio"><div class="hs-h">${tr('Biography')}</div>${paras.length ? paras.map(p => `<p>${esc(p)}</p>`).join('') : lines(12)}</div>
          ${side ? `<div class="hs-aux-side">${side}</div>` : ''}
        </div>
        <div class="hs-card"><div class="hs-h">${tr('Table notes')}</div><div class="hs-notes">${Array.from({ length: 10 }, (_, n) => line('play.notes', n, tr('Note line {n}', { n: n + 1 }))).join('')}</div></div>
      </div>`;
  }

  // ------------------------------------------------------------------ PDF export
  const downloadPdf = (bytes, suffix) => {
    const blob = new Blob([bytes], { type: 'application/pdf' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = fileBase().replace(/[^\w-]+/g, '_') + suffix;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  };

  // The sheet exactly as previewed, drawn into a PDF with clickable hero points and editable play fields.
  async function exportPdf() {
    const status = document.getElementById('pdf-status');
    const say = (msg, isErr) => { if (status) { status.innerHTML = msg; status.className = isErr ? 'issues' : 'okbox'; } };
    // The PDF library is big (half a megabyte), so it is only fetched the first time someone exports.
    if (!window.PDFLib) {
      const ref = document.querySelector('script[src*="sheet-pdf.js"]');
      await new Promise(done => {
        const sc = document.createElement('script');
        sc.src = ref ? ref.src.replace('sheet-pdf.js', 'vendor/pdf-lib.min.js') : 'js/vendor/pdf-lib.min.js';
        sc.onload = sc.onerror = done; document.head.appendChild(sc);
      });
    }
    if (!window.PDFLib || !window.SheetPDF) { say(tr('The PDF library failed to load.'), true); return; }
    const link = sel => { const l = document.querySelector(sel); return l ? l.href : ''; };
    try {
      const bytes = await window.SheetPDF.render({
        html: sheetHtml(compute()),
        cssHref: link('link[href*="style.css"]'),
        fontBase: new URL('assets/fonts/', location.href).href,
        fontkitSrc: 'js/vendor/fontkit.umd.min.js',
        pageBg: getComputedStyle(document.body).backgroundColor,
        onStatus: m => say(esc(tr(m)))
      });
      downloadPdf(bytes, tr('_hero_sheet.pdf'));
      say(tr('Hero sheet PDF downloaded — hero points, collections, back issues and current Health can be clicked and typed into in any PDF reader.'));
    } catch (e) {
      say(tr('Could not build the PDF:') + ' ' + esc(e.message), true);
    }
  }

  function renderFinish() {
    const R = R0;
    const i = st.info;
    const field = (k, label, ph = '', commit = false) => `<label class="field"><span>${label}</span><input type="text" data-bind="info.${k}" data-live="1"${commit ? ' data-commit="1"' : ''} value="${esc(i[k])}" placeholder="${esc(ph)}"></label>`;
    const abs = allAbilities(R).filter(x => x.name !== 'Out' && x.src !== 'Principle');
    const renameTraits = Object.keys(R.T).filter(k => k !== 'rp-quality');
    const H = {
      name: () => `<div class="grid3">${field('alias', tr('Alias / true name'), tr('e.g. Kaelis Du Morne'))}${field('name', tr('Hero name'), tr('Type a name, then press Enter'), true)}${field('player', tr('Player'))}</div>`,
      describe: () => `<div class="grid3">${field('gender', tr('Gender'))}${field('age', tr('Age'), tr('e.g. mid-thirties, or 2,000 years'))}${field('height', tr('Height'))}${field('eyes', tr('Eyes'), tr('e.g. glowing Hextech blue'))}${field('hair', tr('Hair'))}${field('skin', tr('Skin'), tr('e.g. sun-bronzed, bioluminescent'))}</div>
        ${field('build', tr('Build'), tr('e.g. wiry, towering, clockwork'))}
        <label class="field"><span>${tr('Costume / equipment')}</span><textarea data-bind="info.costume" data-live="1" placeholder="${tr('What do they wear and carry into battle?')}">${esc(i.costume)}</textarea></label>
        <div class="portrait-row"><div class="hs-portrait small">${i.portrait ? `<img src="${i.portrait}" alt="${tr('Portrait')}">` : `<span class="muted">${tr('No portrait')}</span>`}</div>
          <div><label class="btn small" for="portrait-file">${tr(i.portrait ? 'Change portrait' : 'Add portrait')}</label> ${i.portrait ? `<button class="btn small ghost" data-act="clearPortrait">${tr('Remove')}</button>` : ''}<input id="portrait-file" type="file" accept="image/*" hidden></div></div>`,
      bio: () => `<div class="bio-grid">
        <div class="bio-write"><label class="field"><span>${tr('Biography')}</span><textarea id="bio-text" data-bind="info.notes" data-live="1" placeholder="${tr('Where did they come from? Who do they fight for? What do they want?')}">${esc(i.notes)}</textarea></label></div>
        <div class="bio-guide"><div class="bio-guide-h">${ico('map')} ${tr('Lore guide')}</div>${loreGuide().map(c => `<section class="guide-card"${c.color ? ` style="--rc:${c.color}"` : ''}>
          <div class="gc-k">${esc(c.kicker)}</div><h4>${esc(c.title)}</h4>${c.text ? `<p>${c.text}</p>` : ''}
          <div class="gc-qs">${c.qs.filter(Boolean).map(q => `<button type="button" class="bio-q" data-act="bioQ" data-q="${esc(q)}">${ico('next')}<span>${esc(q)}</span></button>`).join('')}</div>
          ${c.link ? `<a class="gc-link" href="${c.link}">${tr('Read in the Lore')} ${ico('next')}</a>` : ''}</section>`).join('')}</div></div>`,
      abilities: () => `        <div class="rename-grid">${abs.map(x => { const ab = A[x.name] || {}; return `<label class="rename-card ${x.color}"><span class="rn-h"><b>${esc(abName(x.name))}</b> <span class="pill ${x.color}">${tr(x.color)}</span>${ab.type ? `<span class="rn-type">${esc(ab.type)}</span>` : ''}</span><input type="text" data-rename="${esc(x.iid)}" data-bind="renames" data-live="1" value="${esc(st.renames[x.iid] || '')}" placeholder="${tr('Your name for it (optional)')}"><span class="rn-d">${rulesText(ab.text || '', x.entry)}</span></label>`; }).join('') || `<small class="muted">${tr('No abilities yet.')}</small>`}</div>`,
      gear: () => `        <div class="rename-grid">${renameTraits.map(k => `<label class="rename-card"><span class="rn-h"><b>${esc(baseTraitName(k))}</b> ${die(R.T[k].die, 'sm')}<span class="rn-type">${tr(TRAIT[k].kind)} · ${esc(catName(TRAIT[k].cat))}</span></span><input type="text" data-bind="traitNames.${k}" data-live="1" value="${esc(st.traitNames[k] || '')}" placeholder="${tr('Your name for it (optional)')}"><span class="rn-d">${esc(TRAIT[k].desc || '')}</span></label>`).join('')}</div>`
    };
    const done = !stepIssues('finish', R).length;
    return `<div class="panel no-print">${chapterHead(tr('Legend'))}
      <p class="chapter-lede">${window.STEP_INTROS.finish}</p>
      ${flowHtml('finish', sectionsFor('finish', R), H, true)}
      <section class="flow-sec ${done ? 'current' : 'locked'}" id="flow-finish-export"><div class="flow-head"><span class="flow-num">${done ? ico('mark') : ico('lock')}</span><h3>${tr('Your hero sheet')}</h3>${done ? '' : `<span class="flow-lock">${tr('Sealed — name your champion first')}</span>`}</div>
      ${done ? `<div class="flow-body"><input id="template-file" type="file" accept="application/pdf,.pdf" hidden>
        <div class="export-row"><button class="btn" data-act="print">${tr('Print')}</button><button class="btn" data-act="export">${tr('Export JSON')}</button></div></div>` : ''}</section>
      ${done ? `<div class="sheet-cta"><div><b>${tr('Your sheet has its own page')}</b><p class="muted">${tr(WIP ? 'Full screen, with the Health tracker always at hand for play and the Evolve your champion tools.' : 'Full screen, with the Health tracker always at hand for play.')}</p></div>
        <div class="export-row"><a class="btn primary" href="ficha.html">${ico('file')} ${tr('Open the sheet')}</a>${WIP ? `<a class="btn" href="ficha.html?wip#evoluir">${ico('reset')} ${tr('Evolve your champion')}</a>` : ''}</div></div>` : ''}
      ${done ? `<div class="finish-bar"><div class="fb-t">${esc(i.name || tr('Your champion'))}<small>${tr('Ready for the table. Everything above is optional.')}</small></div>
        <button class="btn primary" data-act="pdf">${ico('download')} ${tr('Export PDF hero sheet')}</button><button class="btn" data-act="toSheet">${ico('file')} ${tr('See the sheet')}</button><a class="btn" href="ficha.html">${tr('Open the sheet')}</a><div id="pdf-status"></div></div>` : ''}
      <div class="step-footer"><button class="btn ghost" data-act="back">${ico('prev')} ${tr('Back')}</button><span></span></div></div>
      <div class="panel" id="sheet-preview">${sheetHtml(R)}</div>`;
  }

  function lockedPanel(title, msg, step) {
    return `<div class="panel">${chapterHead(title)}<p class="chapter-lede">${esc(msg)}</p><button class="btn primary" data-act="go" data-step="${step}">${tr('Go there')} ${ico('next')}</button></div>`;
  }
  const stepIndex = id => STEPS.findIndex(x => x.id === id);
  // Back / Next. Next only works once the current step is complete.
  function navFooter() {
    const i = stepIndex(st.step);
    const next = STEPS[i + 1];
    const P = flowPos && flowPos.step === st.step && !flowPos.open && flowPos.c < flowPos.n - 1 ? flowPos : null;   // more sections to go in this chapter
    const ready = P ? !P.secs[P.c].issues.length : !stepIssues(st.step, R0).length;
    if (P) return `<div class="step-footer"><div class="footer-left"><button class="btn ghost" data-act="back">${ico('prev')} ${tr('Back')}</button></div>
      <div class="next-wrap"><button class="btn primary${ready ? '' : ' is-disabled'}" data-act="next" aria-disabled="${!ready}"><span class="btn-kicker">${esc(P.secs[P.c + 1].title)}</span>${tr('Continue')} ${ico('next')}</button></div></div>`;
    return `<div class="step-footer"><div class="footer-left"><button class="btn ghost" data-act="back">${ico('prev')} ${tr('Back')}</button></div>
      <div class="next-wrap"><button class="btn primary${ready ? '' : ' is-disabled'}" data-act="next" aria-disabled="${!ready}"><span class="btn-kicker">${next ? tr('Chapter') + ' ' + ROMAN[i + 1] : ''}</span>${next ? esc(next.name) : tr('Next')} ${ico('next')}</button></div></div>`;
  }

  // ------------------------------------------------------------------ nav + side
  function renderNav() {
    const R = R0;
    return `<div class="rail-title">${tr('The Chronicle')}</div><ol class="rail">${STEPS.map((s, i) => {
      const locked = i > st.maxStep;
      const I = s.id === 'intro' || locked ? [] : stepIssues(s.id, R);
      const cls = ['rail-item', st.step === s.id ? 'active' : '', locked ? 'locked' : I.length ? 'open' : 'done'].join(' ');
      const status = tr(locked ? 'Sealed' : st.step === s.id ? 'You are here' : s.id === 'intro' ? '' : I.length ? 'Unfinished' : 'Complete');
      return `<li class="${cls}"><button data-act="go" data-step="${s.id}"${locked ? ` disabled title="${tr('Complete the previous chapters first')}"` : ''}${st.step === s.id ? ' aria-current="step"' : ''}>
        <span class="rail-mark"><span>${i === 0 ? '·' : ROMAN[i]}</span></span>
        <span class="rail-label"><span class="rail-name">${esc(s.name)}</span><span class="rail-sub">${esc(status || s.sub)}</span></span></button></li>`;
    }).join('')}</ol>`;
  }

  // ------------------------------------------------------------------ main render
  const RENDER = { intro: renderIntro, people: renderPeople, region: renderRegion, background: renderBackground, powersource: renderPowerSource, archetype: renderArchetype, personality: renderPersonality, red: renderRed, health: renderHealth, finish: renderFinish };
  // For saves made before step locking existed: unlock up to the first incomplete step.
  function reachedStep() {
    const R = compute();
    for (let i = 1; i < STEPS.length; i++) if (stepIssues(STEPS[i].id, R).length) return i;
    return STEPS.length - 1;
  }
  let lastFlow = null;
  let lastStep = null;
  // ficha.html: the finished champion's sheet on its own page (no chapters), with a play rail and the Evolve tab.
  const SHEET_PAGE = document.body.classList.contains('page-sheet');
  const zoneName = z => ({ green: tr('Green zone'), yellow: tr('Yellow zone'), red: tr('Red zone'), out: tr('Out of the fight') }[z] || '');
  function sheetRailHtml() {
    const rg = regionDef(), i = st.info;
    return `<div class="sp-id">
        <div class="sp-portrait">${i.portrait ? `<img src="${i.portrait}" alt="">` : sigil(rg ? rg.id : 'compass', 'dos-sigil')}</div>
        <div><div class="sp-name">${esc(i.alias || i.name || tr('Unnamed Champion'))}</div><div class="sp-sub">${esc([i.alias && i.name, peopleDef() && peopleDef().name, rg && rg.name].filter(Boolean).join(' · '))}</div></div></div>
      ${ui.sheetTab === 'evolve' ? '' : `<nav class="sp-nav" aria-label="${tr('Sheet pages')}"><a href="#hs-p1"><span>1</span>${tr('Identity and principles')}</a><a href="#hs-p2"><span>2</span>${tr('Powers and abilities')}</a><a href="#hs-p3"><span>3</span>${tr('Auxiliary sheet')}</a></nav>`}
      <div class="sp-actions"><button class="btn primary" data-act="pdf">${ico('download')} ${tr('Export PDF hero sheet')}</button><button class="btn" data-act="print">${ico('print')} ${tr('Print')}</button><button class="btn" data-act="export">${ico('file')} ${tr('Export JSON')}</button><a class="btn ghost" href="index.html">${ico('prev')} ${tr('Edit in the Forge')}</a></div>
      <div id="pdf-status"></div>`;
  }
  function renderSheetPage() {
    const app = document.getElementById('sheet-app');
    const ready = st.maxStep >= stepIndex('finish') && !stepIssues('finish', R0).length;
    if (!ready) {
      app.innerHTML = `<div class="sp-empty"><span class="gm-seal" aria-hidden="true">${ico('file')}</span><h1>${tr('Your sheet is not ready yet')}</h1>
        <p class="muted">${tr('Finish creating your champion in the Forge (the last chapter asks for a name) and the complete sheet appears here.')}</p>
        <a class="btn primary" href="index.html">${ico('prev')} ${tr('Go to the Forge')}</a></div>`;
      return;
    }
    if (!ui.sheetTab) ui.sheetTab = WIP && location.hash === '#evoluir' ? 'evolve' : 'sheet';
    const n = st.evo.log.length;
    app.innerHTML = `<div class="sp">
      <aside class="sp-rail no-print" id="sp-rail" aria-label="${tr('Champion at the table')}">${sheetRailHtml()}</aside>
      <main class="sp-main">
        ${WIP ? `<div class="sp-tabs no-print" role="tablist">
          <button type="button" role="tab" class="sp-tab${ui.sheetTab === 'sheet' ? ' on' : ''}" aria-selected="${ui.sheetTab === 'sheet'}" data-act="sheetTab" data-tab="sheet">${ico('file')} ${tr('Sheet')}</button>
          <button type="button" role="tab" class="sp-tab${ui.sheetTab === 'evolve' ? ' on' : ''}" aria-selected="${ui.sheetTab === 'evolve'}" data-act="sheetTab" data-tab="evolve">${ico('reset')} ${tr('Evolve your champion')}${n ? `<span class="sp-count">${n}</span>` : ''}</button>
        </div>` : ''}
        ${ui.sheetTab === 'evolve' ? `<div class="sp-evolve">${evolveHtml()}</div>` : `<div class="sp-sheet" id="sheet-preview">${sheetHtml(R0)}</div>`}
      </main></div>`;
  }
  // Guided tour: the first time a new champion reaches a chapter, a short popup explains it and the key area glows.
  // The guide: a few short steps per chapter. Each step points at a part of the page (a highlighted
  // "spotlight" with the popup beside it); steps without a target show the popup in the middle.
  const tourTarget = sel => {
    // "a || b": try a first, then b (a comma list would pick whichever comes first in the page)
    for (const one of (sel || '').split('||').map(x => x.trim()).filter(Boolean))
      for (const e of document.querySelectorAll(one)) { const r = e.getBoundingClientRect(); if (r.width > 0 && r.height > 0) return e; }
    return null;
  };
  // A chapter's guide comes in phases: steps with a 4th entry (a selector, usually "#flow-…-assign.current")
  // wait until that part of the chapter opens, and then show up on their own, once.
  // The Guide button replays every step that fits what is on screen now.
  const tourKey = g => st.step + (g ? '|' + g : '');
  function tourSteps() {
    const on = ((window.TOUR || {})[st.step] || []).filter(s => !s[3] || tourTarget(s[3]));
    if (ui.tourForce) { ui.tourPhase = null; return on; }
    if (!st.tour || !st.tour.on) return [];
    const g = on.map(s => s[3] || '').find(g => !st.tour.seen[tourKey(g)]);
    if (g === undefined) return [];
    if (ui.tourPhase !== g) ui.tourIdx = 0;
    ui.tourPhase = g;
    return on.filter(s => (s[3] || '') === g);
  }
  function tourDone() {
    const phases = ui.tourForce ? ((window.TOUR || {})[st.step] || []).filter(s => !s[3] || tourTarget(s[3])).map(s => s[3] || '') : [ui.tourPhase || ''];
    for (const g of phases) st.tour.seen[tourKey(g)] = true;
    ui.tourForce = false; ui.tourIdx = 0; ui.tourPhase = null; save(); showTour();
  }
  function placeTour() {
    const box = document.getElementById('tour');
    if (!box) return;
    const steps = ui.tourList || [], s = steps[ui.tourIdx || 0];
    const spot = box.querySelector('.tour-spot'), pop = box.querySelector('.tour');
    const t = s && tourTarget(s[2]);
    box.classList.toggle('no-target', !t);
    if (!t) { pop.style.left = pop.style.top = ''; return; }
    const pad = 8, vw = innerWidth, vh = innerHeight, r = t.getBoundingClientRect();
    const R = { left: r.left - pad, top: r.top - pad, width: r.width + pad * 2, height: r.height + pad * 2 };
    Object.assign(spot.style, { left: R.left + 'px', top: R.top + 'px', width: R.width + 'px', height: R.height + 'px' });
    if (vw < 700) { pop.style.left = pop.style.top = ''; return; }   // phones: the popup is a bottom sheet (CSS)
    const pw = pop.offsetWidth, ph = pop.offsetHeight, gap = 16;
    let x, y;
    if (R.left + R.width + gap + pw <= vw - 12) { x = R.left + R.width + gap; y = R.top; }            // right of the target
    else if (R.top + R.height + gap + ph <= vh - 12) { x = R.left; y = R.top + R.height + gap; }     // below
    else if (R.top - gap - ph >= 12) { x = R.left; y = R.top - gap - ph; }                           // above
    else if (R.left - gap - pw >= 12) { x = R.left - gap - pw; y = R.top; }                          // left
    else { x = vw - pw - 12; y = vh - ph - 12; }
    pop.style.left = Math.max(12, Math.min(x, vw - pw - 12)) + 'px';
    pop.style.top = Math.max(12, Math.min(y, vh - ph - 12)) + 'px';
  }
  function showTour() {
    // ui.tourForce: opened from the chapter's Guide button, shown even when the guide is off or already seen
    const steps = ui.tourList = tourSteps();
    let box = document.getElementById('tour');
    if (!steps.length) { if (box) box.remove(); ui.tourIdx = 0; document.body.classList.remove('tour-open'); return; }
    document.body.classList.add('tour-open');   // phones: room below the page so any target can scroll above the guide
    const n = steps.length, k = Math.min(ui.tourIdx || 0, n - 1), s = steps[k];
    if (!box) { box = document.createElement('div'); box.id = 'tour'; box.className = 'tour-layer'; document.body.appendChild(box); }
    const i = stepIndex(st.step);
    box.innerHTML = `<div class="tour-spot" aria-hidden="true"></div><div class="tour" role="dialog" aria-modal="true" aria-label="${tr('Guide')}">
      <div class="tour-k">${ico('codex')} ${tr('Guide')} · ${i ? tr('Chapter') + ' ' + ROMAN[i] : esc(STEPS[0].name)}<span>${k + 1}/${n}</span></div>
      <div class="tour-dots">${steps.map((_, j) => `<i class="${j === k ? 'on' : j < k ? 'past' : ''}"></i>`).join('')}</div>
      <h4>${s[0]}</h4><div class="tour-body">${s[1]}</div>
      <div class="tour-row">${k ? `<button type="button" class="btn small ghost" data-act="tourPrev">${ico('prev')} ${tr('Back')}</button>` : ''}
        ${k < n - 1 ? `<button type="button" class="btn small primary" data-act="tourNext">${tr('Next')} ${ico('next')}</button><button type="button" class="linkbtn" data-act="tourOk">${tr('Skip')}</button>`
          : `<button type="button" class="btn small primary" data-act="tourOk">${tr('Got it')}</button>`}</div></div>`;
    const t = tourTarget(s[2]);
    if (t) {
      const r = t.getBoundingClientRect();
      if (innerWidth < 700) { if (r.top < 70 || r.bottom > innerHeight * .5) { t.scrollIntoView({ block: 'start' }); scrollBy(0, -80); } }   // phones: above the bottom sheet
      else if (r.top < 90 || r.bottom > innerHeight - 40) { t.scrollIntoView({ block: r.height > innerHeight * .6 ? 'start' : 'center' }); if (r.height > innerHeight * .6) scrollBy(0, -90); }
    }
    placeTour();
    requestAnimationFrame(placeTour);
    const go = box.querySelector('[data-act="tourNext"], [data-act="tourOk"]'); if (go && document.activeElement !== go) go.focus({ preventScroll: true });
  }
  addEventListener('scroll', () => { if (document.getElementById('tour')) requestAnimationFrame(placeTour); }, { passive: true });
  addEventListener('resize', () => { if (document.getElementById('tour')) placeTour(); });

  function render() {
    pendingRender = false;
    tipHooks.reset();
    R0 = compute();
    if (SHEET_PAGE) {
      const rg = regionDef();
      document.body.style.setProperty('--region', rg ? rg.color : '');
      if (st.maxStep < 0) st.maxStep = reachedStep();
      renderSheetPage(); save(); return;
    }
    flowCurrent = null;
    flowPos = null;
    socketAuto = false;
    if (lastStep !== st.step) { ui.socket = null; ui.tourForce = false; ui.tourIdx = 0; ui.tourPhase = null; lastStep = st.step; }
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
    save();
    // Guide the eye: when a section is completed, scroll to the newly unlocked one.
    if (lastFlow && flowCurrent && lastFlow !== flowCurrent && lastFlow.split(':')[0] === flowCurrent.split(':')[0] && !flowCurrent.endsWith(':done')) {
      const [sid, sec] = flowCurrent.split(':');
      const el = document.getElementById(`flow-${sid}-${sec}`);
      if (el) setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60);
    }
    lastFlow = flowCurrent;
    trackHistory();
    warmImages();
    showTour();
  }
  // Next inside a chapter: open the section after the current one (optional sections count as seen).
  // Returns false when the chapter is over, so Next moves on to the next chapter.
  function flowNext() {
    const P = flowPos;
    if (!P || P.open || P.step !== st.step || P.c >= P.n) return false;
    const s = P.secs[P.c];
    if (s.issues.length) {
      const cur = document.querySelector('.flow-sec.current');
      if (cur) { cur.scrollIntoView({ behavior: 'smooth', block: 'start' }); cur.classList.remove('pulse'); void cur.offsetWidth; cur.classList.add('pulse'); }
      return true;
    }
    if (s.opt) ui.passed[P.step + ':' + s.id] = true;
    if (P.c + 1 >= P.n) return false;
    ui.at[P.step] = P.c + 1; render();
    return true;
  }
  // Back: reopen the previous section; from the first one, go to the previous chapter's last section.
  function flowBack() {
    const P = flowPos;
    if (P && !P.open && P.step === st.step && P.c > 0) { ui.at[P.step] = Math.min(P.c, P.n) - 1; render(); return; }
    const i = stepIndex(st.step);
    if (i > 0) { ui.at[STEPS[i - 1].id] = 'last'; goToStep(STEPS[i - 1].id); }
    else ui.popping = false;
  }
  // The browser's back button walks back the same way: every move forward adds a history entry.
  function trackHistory() {
    if (SHEET_PAGE || !history.pushState) return;
    const pos = st.step + ':' + (flowPos && !flowPos.open ? flowPos.c : '');
    if (ui.pos == null) {   // first render; after a reload the history entries are still there, so keep counting from this one
      if (history.state && typeof history.state.forja === 'number') ui.hidx = history.state.forja;
      else { ui.hidx = 0; history.replaceState({ forja: 0 }, ''); }
    }
    else if (pos !== ui.pos && !ui.popping) { ui.hidx++; history.pushState({ forja: ui.hidx }, ''); }
    ui.popping = false;
    ui.pos = pos;
  }
  addEventListener('popstate', ev => {
    if (SHEET_PAGE) return;
    const to = ev.state && typeof ev.state.forja === 'number' ? ev.state.forja : 0, fwd = to > ui.hidx;
    ui.hidx = to;
    ui.popping = true; hideTip();
    if (document.getElementById('tour')) { ui.tourForce = false; document.getElementById('tour').remove(); document.body.classList.remove('tour-open'); }
    if (!fwd) return flowBack();
    // forward: the same as Next, when the current part is finished
    const was = ui.pos;
    if (flowNext()) { if (ui.pos === was) ui.popping = false; return; }
    const i = stepIndex(st.step);
    if (!stepIssues(st.step, R0).length && i < STEPS.length - 1) { st.maxStep = Math.max(st.maxStep, i + 1); goToStep(STEPS[i + 1].id); }
    else ui.popping = false;
  });

  // Chapter change: fade the old chapter out, jump to the top while it is hidden, then fade the new one in,
  // so the page never swaps content under the reader mid-scroll. Focus moves to the new chapter title.
  let turning = false;
  function goToStep(id) {
    if (turning || id === st.step) return;
    const stage = document.getElementById('stage');
    const reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    hideTip();
    const swap = () => {
      st.step = id; render();
      window.scrollTo({ top: 0, behavior: 'instant' });
      const title = stage.querySelector('.chapter-title, .tp-title');
      if (title) { title.setAttribute('tabindex', '-1'); title.focus({ preventScroll: true }); }
      if (reduce) { turning = false; return; }
      stage.classList.remove('leaving'); stage.classList.add('entering');
      requestAnimationFrame(() => requestAnimationFrame(() => { stage.classList.remove('entering'); turning = false; }));
    };
    if (reduce) { swap(); return; }
    turning = true;
    stage.classList.add('leaving');
    setTimeout(swap, 180);
  }

  // "Change last choice" in the footer: reopens the most recent choice of this chapter.
  function renderSideOnly(fromSheet) {
    R0 = compute();
    if (SHEET_PAGE) {
      const rail = document.getElementById('sp-rail');
      if (rail) rail.innerHTML = sheetRailHtml();
    }
    const sheet = document.getElementById('sheet-preview');
    if (sheet && !fromSheet) sheet.innerHTML = sheetHtml(R0);
    save();
  }

  // ------------------------------------------------------------------ events
  function roll(sizes) { return sizes.map(d => 1 + Math.floor(Math.random() * dn(d))); }

  function pick(kind, id) {
    if (kind === 'people') st.people = st.people === id ? null : id;
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
    if (kind === 'pers' && st.pers.id !== id) { st.pers.id = id; st.pers.outTrait = null; st.pers.upgrade = null; if (st.pers.id2 === id) st.pers.id2 = null; }
    if (kind === 'pers2') st.pers.id2 = st.pers.id2 === id ? null : id;
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

  // Password for a locked homeland or people (see LOCKED_REGIONS, LOCKED_PEOPLES)
  document.addEventListener('submit', ev => {
    const f = ev.target.closest && ev.target.closest('form[data-lock]');
    if (!f) return;
    ev.preventDefault();
    const id = f.dataset.lock, kind = f.dataset.lockKind || 'region', pw = (f.elements.pw.value || '').trim().toLowerCase();
    const want = (LOCKS[kind] || {})[id];
    if (want && sha256(pw) === want) {
      st.unlocked = Object.assign({}, st.unlocked, { [id]: true });
      ui.lockAsk = null; ui.lockKind = null; ui.lockErr = false;
      st[kind] = id; ui.advance = true; ui.lastPick[st.step] = kind; render();
    } else {
      ui.lockErr = true; render();
      const inp = document.querySelector('.lock-form input'); if (inp) inp.focus();
    }
  });
  document.addEventListener('click', ev => {
    const el = ev.target.closest('[data-act]');
    if (!el) return;
    const act = el.dataset.act;
    if (el.tagName === 'A') ev.preventDefault();
    if (act === 'go') {
      const i = stepIndex(el.dataset.step);
      if (i < 0 || i > st.maxStep) return;                     // can't jump ahead to a step never reached
      goToStep(el.dataset.step); return;
    }
    if (act === 'back') { if (ui.hidx > 0) history.back(); else { ui.popping = true; flowBack(); } return; }
    if (act === 'qok') { confirmQname(); return; }
    if (act === 'powerless') { st.arch.powerless = Object.assign({}, st.arch.powerless, { on: !!el.dataset.v }); render(); return; }
    if (act === 'pers2') { st.pers.id2 = el.dataset.id || null; render(); return; }
    if (act === 'redCat') { const c = el.dataset.cat, now = el.getAttribute('aria-expanded') === 'true'; ui.redOpen[c] = !now; render(); return; }
    if (act === 'setBind') { if (el.disabled) return; setPath(st, el.dataset.bind, el.dataset.val); hideTip(); render(); return; }
    if (act === 'flowGo') { ui.at[st.step] = +el.dataset.i; render(); return; }
    if (act === 'next') {
      if (flowNext()) return;
      const i = stepIndex(st.step);
      if (stepIssues(st.step, R0).length) {                    // not finished: point at what's missing
        const cur = document.querySelector('.flow-sec.current');
        if (cur) { cur.scrollIntoView({ behavior: 'smooth', block: 'start' }); cur.classList.remove('pulse'); void cur.offsetWidth; cur.classList.add('pulse'); }
        return;
      }
      if (i < STEPS.length - 1) { st.maxStep = Math.max(st.maxStep, i + 1); goToStep(STEPS[i + 1].id); }
      return;
    }
    if (act === 'socketOpen') { ui.socket = el.getAttribute('aria-expanded') === 'true' ? '' : el.dataset.bind; render(); return; }
    if (act === 'socket') {
      if (el.getAttribute('aria-disabled') === 'true') {
        el.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-4px)' }, { transform: 'translateX(4px)' }, { transform: 'translateX(0)' }], { duration: 220 });
        showTipFor(el, `<h5>${tr('Not available')}</h5>` + esc(el.dataset.why || '')); setTimeout(hideTip, 2200); return;
      }
      setPath(st, el.dataset.bind, el.dataset.val || null); ui.socket = null; hideTip(); render();
      const next = document.querySelector('.socket.open .rune');           // keyboard users land in the next tray
      if (next && document.activeElement === document.body) next.focus({ preventScroll: true });
      return;
    }
    if (act === 'expand' || act === 'collapse') { ui.expand[el.dataset.key] = act === 'expand'; render(); return; }
    if (act === 'jump') { const t = document.getElementById(el.dataset.target); if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' }); return; }
    if (act === 'roll') {
      const key = el.dataset.key;
      if (el.dataset.re) st.rerolls[key] = (st.rerolls[key] || 0) + 1;
      st.rolls[key] = roll(el.dataset.sizes.split(','));
      render(); return;
    }
    if (act === 'lockCancel') { ui.lockAsk = null; ui.lockKind = null; ui.lockErr = false; render(); return; }
    if (act === 'pick') {
      if (el.dataset.locked && st.method === 'guided') { flash(el); return; }
      const k = el.dataset.kind, lockedPick = k === 'region' ? regionLocked : k === 'people' ? peopleLocked : null;
      if (lockedPick && lockedPick(el.dataset.id) && st[k] !== el.dataset.id) {
        ui.lockAsk = el.dataset.id; ui.lockKind = k; ui.lockErr = false; render();
        const inp = document.querySelector('.lock-form input'); if (inp) inp.focus();
        return;
      }
      if (lockedPick) { ui.lockAsk = null; ui.lockKind = null; ui.lockErr = false; }
      pick(el.dataset.kind, el.dataset.id); ui.advance = true; ui.lastPick[st.step] = el.dataset.kind; render(); return;
    }
    if (act === 'toggleAb') {
      const { g, name, cat } = el.dataset;
      toggleAb(g, name, cat); render();
      // just picked: bring its choices (which trait it uses, which element…) into view if they fell below the screen
      const q = `[data-act=toggleAb][data-g="${g}"][data-name="${CSS.escape(name)}"]${cat ? `[data-cat="${CSS.escape(cat)}"]` : ''}`;
      const box = document.querySelector(q + ':checked');
      const card = box && box.closest('.ab'), cfg = card && card.querySelector('.ab-cfg');
      if (cfg && cfg.getBoundingClientRect().bottom > window.innerHeight - 16) card.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      return;
    }
    if (act === 'principle') { ui.advance = !(el.dataset.id === 'energy-element'); if (el.dataset.slot === 'bg') st.bg.principle = el.dataset.id; else st.arch.principle = el.dataset.id; ui.expand['pr-' + el.dataset.slot] = false; ui.lastPick[st.step] = 'pr-' + el.dataset.slot; render(); return; }
    if (act === 'divMethod') { ui.advance = true; st.arch.divMethod = el.dataset.id; delete st.sel['arch-divmethod']; render(); return; }
    if (act === 'minionForm') {
      const f = st.arch.minionForms = st.arch.minionForms || [];
      const i = f.indexOf(el.dataset.name);
      if (i >= 0) f.splice(i, 1); else f.push(el.dataset.name);
      render(); return;
    }
    if (act === 'hmode') { if (st.health.roll) return; st.health.mode = el.dataset.m; if (el.dataset.m === 'roll') { st.health.roll = roll(['d8'])[0]; st.health.rerolled = false; } render(); return; }
    if (act === 'hroll') { if (st.health.roll && st.health.rerolled) return; if (st.health.roll) st.health.rerolled = true; st.health.roll = roll(['d8'])[0]; render(); return; }
    if (act === 'hpStep') {   // table mode: − / + / full Health on the sheet
      const h = healthCalc(compute());
      if (!h) return;
      const d = el.dataset.d;
      st.play.current = String(d === 'max' ? h.max : Math.max(0, Math.min(h.max, curHealth(h) + Number(d))));
      const where = el.closest('#sp-rail') ? '#sp-rail' : '#sheet-preview';
      renderSideOnly(false);
      const again = document.querySelector(`${where} [data-act="hpStep"][data-d="${d}"]`);
      if (again) again.focus();
      return;
    }
    if (act === 'evoTab') { ui.evo = { tab: el.dataset.tab, from: '', to: '', ch: {} }; render(); return; }
    if (act === 'evoApply') { evoApply(); return; }
    if (act === 'evoUndo') { evoUndo(); return; }
    if (act === 'evoRewrite') { evoRewrite(); return; }
    if (act === 'export') { exportJson(); return; }
    if (act === 'toSheet') { const sp = document.getElementById('sheet-preview'); if (sp) sp.scrollIntoView({ behavior: 'smooth', block: 'start' }); return; }
    if (act === 'pdf') { exportPdf(); return; }
    if (act === 'clearPortrait') { st.info.portrait = null; render(); return; }
    if (act === 'bioQ') {   // add a guide question to the biography, ready to be answered
      const ta = document.getElementById('bio-text');
      if (!ta) return;
      ta.value = (ta.value.trim() ? ta.value.replace(/\s+$/, '') + '\n\n' : '') + el.dataset.q + '\n';
      ta.dispatchEvent(new Event('input', { bubbles: true }));
      ta.focus(); ta.setSelectionRange(ta.value.length, ta.value.length); ta.scrollTop = ta.scrollHeight;
      el.classList.add('used');
      return;
    }
    if (act === 'tourOk') { tourDone(); return; }
    if (act === 'tourNext') { ui.tourIdx = (ui.tourIdx || 0) + 1; showTour(); return; }
    if (act === 'tourPrev') { ui.tourIdx = Math.max(0, (ui.tourIdx || 0) - 1); showTour(); return; }
    if (act === 'tourShow') { ui.tourForce = true; ui.tourIdx = 0; showTour(); return; }
    if (act === 'tourOn') { st.tour = { on: true, seen: {} }; save(); if (SHEET_PAGE) location.href = 'index.html'; else showTour(); return; }
    if (act === 'sheetTab') {
      ui.sheetTab = el.dataset.tab;
      history.replaceState(null, '', ui.sheetTab === 'evolve' ? '#evoluir' : location.pathname + location.search);
      render(); window.scrollTo({ top: 0, behavior: 'instant' });
      const t = document.querySelector(`[data-act="sheetTab"][data-tab="${ui.sheetTab}"]`); if (t) t.focus();
      return;
    }
    if (act === 'print' && SHEET_PAGE) {
      if (ui.sheetTab !== 'sheet') { ui.sheetTab = 'sheet'; render(); }
      setTimeout(() => window.print(), 150); return;
    }
    if (act === 'print') {
      if (stepIndex('finish') > st.maxStep) { showTipFor(el, tr('<h5>Not yet</h5>Finish creating your champion first — the sheet is printed from the last step.')); setTimeout(hideTip, 2200); return; }
      st.step = 'finish'; render(); setTimeout(() => window.print(), 150); return;
    }
    if (act === 'reset') { if (confirm(tr('Start over? This clears your current champion.'))) { const id = st.cid, tour = st.tour; st = blank(); st.cid = id; st.tour = tour; render(); } return; }
  });

  function bindValue(el) {
    let v = el.type === 'checkbox' ? el.checked : el.value;
    if (v === '') v = null;
    let path = el.dataset.bind;
    if (el.dataset.rename) { st.renames[el.dataset.rename] = el.value; return; }
    if (path.startsWith('pers.qname') || path === 'pers.qdesc' || path.startsWith('info.') || path.startsWith('traitNames.') || path === 'arch.notes' || (path.startsWith('play.') && el.type !== 'checkbox')) v = el.value;
    setPath(st, path, v);
  }
  document.addEventListener('change', ev => {
    const el = ev.target;
    if (el.id === 'import-file') { importJson(el.files[0]); el.value = ''; return; }
    if (el.id === 'portrait-file') { loadPortrait(el.files[0]); el.value = ''; return; }
    if (el.dataset.evo) {   // Evolve form: picking what to swap resets what it becomes
      const f = el.dataset.evo;
      if (f.startsWith('ch.')) ui.evo.ch[f.slice(3)] = el.value;
      else { ui.evo[f] = el.value; if (f === 'from') { ui.evo.to = ''; ui.evo.ch = {}; } if (f === 'to') ui.evo.ch = {}; }
      if (el.tagName === 'SELECT') render();
      return;
    }
    if (!el.dataset.bind) return;
    bindValue(el);
    // The Signature Quality's name and description are kept by Confirm: leaving one for the other must not redraw (and drop the focus)
    if (el.dataset.bind === 'pers.qname' || el.dataset.bind === 'pers.qdesc') { renderSideOnly(false); return; }
    if (el.dataset.commit && pointerDown) { pendingRender = true; renderSideOnly(false); return; }
    if (el.dataset.live && !el.dataset.commit) { renderSideOnly(!!el.closest('#sheet-preview')); if (!SHEET_PAGE) document.getElementById('nav').innerHTML = renderNav(); return; }
    render();
  });
  document.addEventListener('keydown', ev => {
    if (ev.key === 'Enter' && ev.target.dataset && (ev.target.dataset.bind === 'pers.qname' || ev.target.dataset.bind === 'pers.qdesc')) {
      ev.preventDefault();
      // Enter on the name moves to the description while that is still empty
      const d = document.querySelector('input[data-bind="pers.qdesc"]');
      if (ev.target.dataset.bind === 'pers.qname' && d && !d.value.trim()) { d.focus(); return; }
      confirmQname(); return;
    }
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
    if (el.dataset.evo && el.tagName === 'INPUT') {   // typed choices (element, action…) enable Apply as you type
      const f = el.dataset.evo;
      if (f.startsWith('ch.')) ui.evo.ch[f.slice(3)] = el.value; else ui.evo[f] = el.value;
      const texts = [...document.querySelectorAll('.evo-form input[data-evo]')];
      const b = document.querySelector('[data-act="evoApply"]');
      if (b && ui.evo.to) b.disabled = texts.some(t => !t.value.trim()) || [...document.querySelectorAll('.evo-form select[data-evo]')].some(s => !s.value);
      return;
    }
    if (!el.dataset.bind || !el.dataset.live) return;
    bindValue(el);
    if (el.dataset.bind === 'pers.qname' || el.dataset.bind === 'pers.qdesc') {   // a new name or description needs confirming again
      st.pers.qok = false;
      const b = document.querySelector('[data-act="qok"]'); if (b) b.disabled = !qReady();
      const n = document.querySelector('.qdesc-n'); if (n) n.textContent = `${(st.pers.qdesc || '').length}/${QDESC_MAX}`;
      const sec = sectionsFor('personality', compute()).find(x => x.id === 'qname'), ul = document.querySelector('#flow-personality-qname .flow-todo ul');
      if (sec && ul && sec.issues.length) ul.innerHTML = sec.issues.map(x => `<li>${esc(x)}</li>`).join('');   // "still to do" follows the typing
    }
    if (el.dataset.bind === 'play.current' && el.closest('#sheet-preview')) {   // redraw zones as Health is typed, keeping the caret
      const pos = el.selectionStart;
      renderSideOnly(false);
      const again = document.querySelector('#sheet-preview [data-bind="play.current"]');
      if (again) { again.value = el.value; again.focus(); again.setSelectionRange(pos, pos); }
      return;
    }
    const before = el.dataset.commit ? stepIssues(st.step, R0).length : 0;
    renderSideOnly(!!el.closest('#sheet-preview'));
    if (!el.dataset.commit) return;
    if (stepIssues(st.step, R0).length !== before) {   // the section just became done (or not): redraw it, keeping the caret
      const bind = el.dataset.bind, pos = el.selectionStart;
      render();
      const again = document.querySelector(`input[data-bind="${bind}"]`);
      if (again) { again.focus(); again.setSelectionRange(pos, pos); }
    } else syncNext();
  });
  // Typed answers (Signature Quality, name…) unlock "Next" as soon as they are not empty, without waiting for Enter.
  function syncNext() {
    const b = document.querySelector('.step-footer [data-act="next"]');
    if (!b) return;
    const ready = !stepIssues(st.step, R0).length;
    b.classList.toggle('is-disabled', !ready); b.setAttribute('aria-disabled', String(!ready));
    const hint = document.querySelector('.step-footer .next-hint'); if (hint) hint.hidden = ready;
  }
  // A typed field commits (and re-renders) on blur. If that blur comes from pressing a button, wait for the
  // click to land first, otherwise the button would be replaced under the pointer and the click lost.
  document.addEventListener('pointerdown', () => { pointerDown = true; }, true);
  document.addEventListener('pointerup', () => { pointerDown = false; if (pendingRender) setTimeout(() => { if (pendingRender) render(); }, 0); }, true);

  // Signature Quality: the Confirm button (or Enter) keeps the typed name and description and moves on.
  function confirmQname() {
    for (const inp of document.querySelectorAll('input[data-bind="pers.qname"], input[data-bind="pers.qdesc"]')) {
      bindValue(inp); if (document.activeElement === inp) inp.blur();   // blur first: its own redraw must not land inside ours
    }
    if (!qReady()) return;
    st.pers.qok = true; pendingRender = false; render();
  }

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
    showTipFor(el, tr('<h5>Not available with this roll</h5>Guided method: pick an entry matching one die or the sum of two dice. Use your one re-roll, or switch to the Constructed method.'));
    setTimeout(hideTip, 1800);
  }

  function exportJson() {
    const blob = new Blob([JSON.stringify(st, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = fileBase().replace(/[^\w-]+/g, '_') + '.json';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }
  function importJson(file) {
    if (!file) return;
    const r = new FileReader();
    r.onload = () => {
      try {
        const s = JSON.parse(r.result);
        if (!s || s.v !== 1) throw new Error(tr('Not a Champion Forge file'));
        save();   // the champion open now stays in the roster; the file comes in as a new one
        s.cid = newId();
        st = upgradeState(s); rosterHooks.opened(); render();
        rosterHooks.say(tr('Imported as a new champion. The others are in Champions.'));
      } catch (e) { alert(tr('Could not import:') + ' ' + e.message); }
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
  // A redraw puts new elements under a still pointer, and a tap on a phone also fires mouseover: neither is the
  // player pointing at something, so hover tooltips wait for a real mouse move (taps use the touch handler below).
  let pointerMoved = true, lastTouch = 0;
  tipHooks.reset = () => { hideTip(); pointerMoved = false; };
  document.addEventListener('mouseover', ev => {
    if (!pointerMoved || Date.now() - lastTouch < 1000) return;
    const el = ev.target.closest('[data-tip]');
    if (!el) { if (tipTarget) hideTip(); return; }
    if (el === tipTarget) return;
    tipTarget = el;
    showTipFor(el, el.dataset.tip, ev.clientX, ev.clientY);
  });
  document.addEventListener('mousemove', ev => {
    if (Date.now() - lastTouch < 1000) return;
    if (!pointerMoved) { pointerMoved = true; const el = ev.target.closest('[data-tip]'); if (el) { tipTarget = el; showTipFor(el, el.dataset.tip, ev.clientX, ev.clientY); } return; }
    if (tipTarget) place(ev.clientX, ev.clientY);
  });
  document.addEventListener('scroll', () => { if (tipTarget) hideTip(); }, { passive: true });
  // Touch: tap an info/term element to toggle its tooltip.
  document.addEventListener('touchstart', ev => {
    lastTouch = Date.now();
    const el = ev.target.closest('.term, .info, .die, .ab-type, .pill, .slot-chip, .muted[data-tip], .sock-name');
    if (el && el.dataset.tip) {
      if (tipTarget === el) { hideTip(); return; }
      tipTarget = el;
      const t = ev.touches[0];
      showTipFor(el, el.dataset.tip, t.clientX, t.clientY);
    } else if (tipTarget) hideTip();
  }, { passive: true });

  // Lore and Regras are their own pages. Links in the texts use data-act="lore" (with an optional
  // data-section="lore-<id>") and data-act="rules"; "?" opens the rules from anywhere in the Forge.
  window.LORE_FOR_REGION = Object.fromEntries((window.LORE_SECTIONS_PT || []).filter(s => s.region).map(s => [s.region, 'lore-' + s.id]));
  document.addEventListener('click', ev => {
    const a = ev.target.closest('[data-act="lore"], [data-act="rules"]');
    if (!a) return;
    ev.preventDefault();
    location.href = a.dataset.act === 'rules' ? 'regras.html' : 'lore.html' + (a.dataset.section ? '#' + a.dataset.section.replace(/^lore-/, '') : '');
  });
  document.addEventListener('keydown', ev => {
    if (ev.key === '?' && !/^(INPUT|TEXTAREA|SELECT)$/.test(ev.target.tagName || '')) location.href = 'regras.html';
  });

  // Header "Arquivo" menu: export, import, print and start over live behind one button.
  const fileBtn = document.getElementById('file-btn'), filePop = document.getElementById('file-pop');
  if (fileBtn && filePop) {
    const items = () => [...filePop.querySelectorAll('[role="menuitem"]')];
    const setOpen = (open, focus) => {
      filePop.hidden = !open;
      fileBtn.setAttribute('aria-expanded', String(open));
      if (open && focus) items()[0].focus();
      if (!open && focus) fileBtn.focus();
    };
    fileBtn.addEventListener('click', ev => { ev.stopPropagation(); setOpen(filePop.hidden, ev.detail === 0); });
    document.addEventListener('click', ev => {   // any click outside closes it; picking an item closes it after the action runs
      if (filePop.hidden) return;
      if (!filePop.contains(ev.target) || ev.target.closest('[role="menuitem"]')) setTimeout(() => setOpen(false), 0);
    });
    filePop.addEventListener('keydown', ev => {
      const list = items(), i = list.indexOf(document.activeElement);
      if (ev.key === 'ArrowDown' || ev.key === 'ArrowUp') { ev.preventDefault(); list[(i + (ev.key === 'ArrowDown' ? 1 : list.length - 1)) % list.length].focus(); }
      if ((ev.key === 'Enter' || ev.key === ' ') && document.activeElement.tagName === 'LABEL') { ev.preventDefault(); document.activeElement.click(); }
    });
    document.addEventListener('keydown', ev => { if (ev.key === 'Escape' && !filePop.hidden) setOpen(false, true); });
  }
  document.addEventListener('keydown', ev => {   // Escape also closes the guide popup for this chapter
    if (ev.key === 'Escape' && document.getElementById('tour') && st.tour) tourDone();
    if (document.getElementById('tour') && (ev.key === 'ArrowRight' || ev.key === 'ArrowLeft')) { const b = document.querySelector(`#tour [data-act="${ev.key === 'ArrowRight' ? 'tourNext' : 'tourPrev'}"]`); if (b) b.click(); }
  });

  // First visit on a touch screen: explain that underlined terms open their explanation with a tap.
  try {
    if (matchMedia('(hover: none)').matches && !localStorage.getItem('runeterra-touch-hint')) {
      localStorage.setItem('runeterra-touch-hint', '1');
      const toast = document.createElement('div');
      toast.className = 'touch-hint';
      toast.setAttribute('role', 'status');
      toast.innerHTML = `<span>${ico('codex')}</span><p>Toque em qualquer termo <u>sublinhado</u> para ver o que ele significa. Toque de novo para fechar.</p><button type="button" aria-label="Fechar">✕</button>`;
      document.body.appendChild(toast);
      const close = () => { toast.classList.add('out'); setTimeout(() => toast.remove(), 300); };
      toast.querySelector('button').addEventListener('click', close);
      setTimeout(close, 9000);
    }
  } catch (e) { /* storage blocked: skip the hint */ }

  // ------------------------------------------------------------------ undo & change notices
  // Every choice that changes the champion can be undone (the notice, Arquivo › Desfazer, or Ctrl+Z). When a choice
  // clears choices already made, or leaves a chapter you had finished incomplete, a notice says so, with a link to it.
  // The Health roll is never undone (the book makes it final), nor are names and notes (they are not tracked).
  const UNDO = [];
  const CH_STEPS = ['background', 'powersource', 'archetype', 'personality', 'red', 'health'];
  const creationKey = s => JSON.stringify([s.people, s.region, s.bg, s.ps, s.arch, s.pers, s.health && s.health.trait, s.pch, s.sel]);
  function issueCounts(s) {
    const keep = st;
    try { st = upgradeState(JSON.parse(JSON.stringify(s))); const R = compute(); return Object.fromEntries(CH_STEPS.map(id => [id, stepIssues(id, R).length])); } finally { st = keep; }
  }
  // Choices the change wiped out (a new Origin clears its dice, a new Path its abilities…)
  function clearedBy(a, b) {
    const had = x => x && (typeof x !== 'object' || Object.keys(x).length > 0), gone = (x, y) => had(x) && !had(y);
    const selGone = pre => Object.keys(a.sel || {}).some(k => k.startsWith(pre) && (a.sel[k] || []).length && !((b.sel || {})[k] || []).length);
    return [
      gone(a.bg.assign, b.bg.assign) && tr('your quality dice'), gone(a.bg.principle, b.bg.principle) && tr('your first principle'),
      gone(a.ps.assign, b.ps.assign) && tr('your power dice'), gone(a.ps.extra, b.ps.extra) && tr('your Source bonus'), selGone('ps-') && tr('your Source abilities'),
      gone(a.arch.assign, b.arch.assign) && tr('your Path dice'), (selGone('arch-') || gone(a.arch.minionForms, b.arch.minionForms)) && tr('your Path abilities'),
      gone(a.arch.principle, b.arch.principle) && tr('your second principle'),
      gone(a.pers.outTrait, b.pers.outTrait) && tr('your Out ability trait'), gone(a.pers.upgrade, b.pers.upgrade) && tr('your Reckless upgrade')
    ].filter(Boolean);
  }
  let noteTimer = null;
  function showNote(html, go) {
    let n = document.getElementById('change-note');
    if (!n) { n = document.createElement('div'); n.id = 'change-note'; n.className = 'change-note'; n.setAttribute('role', 'status'); document.body.appendChild(n); }
    n.innerHTML = `<span class="cn-ico">${ico('warn')}</span><p>${html}</p><div class="cn-acts">${go ? `<button type="button" class="linkbtn" data-note="go" data-step="${go}">${tr('Open {ch}', { ch: esc(STEPS[stepIndex(go)].name) })}</button>` : ''}${UNDO.length ? `<button type="button" class="linkbtn" data-note="undo">${ico('undo')} ${tr('Undo')}</button>` : ''}<button type="button" class="cn-x" data-note="close" aria-label="${tr('Close')}">✕</button></div>`;
    n.classList.remove('out');
    clearTimeout(noteTimer); noteTimer = setTimeout(hideNote, 12000);
  }
  function hideNote() { const n = document.getElementById('change-note'); if (n) n.classList.add('out'); }
  function syncUndo() { const b = document.getElementById('undo-btn'); if (b) b.disabled = !UNDO.length; }
  function afterChange(prevJson) {
    UNDO.push(prevJson); if (UNDO.length > 40) UNDO.shift();
    syncUndo();
    const prev = upgradeState(JSON.parse(prevJson));
    const before = issueCounts(prev), after = issueCounts(st), here = st.step;
    const hit = CH_STEPS.filter(id => id !== here && stepIndex(id) <= st.maxStep && before[id] === 0 && after[id] > 0);
    const lost = clearedBy(prev, st);
    if (!hit.length && !lost.length) return;
    const parts = [], and = l => (l.length > 1 ? l.slice(0, -1).join(', ') + tr(' and ') + l[l.length - 1] : l[0]);
    if (lost.length) parts.push(tr('This change cleared {list}.', { list: and(lost) }));
    if (hit.length) parts.push(tr('Now incomplete: {list}.', { list: and(hit.map(id => `<b>${esc(STEPS[stepIndex(id)].name)}</b>`)) }));
    showNote(parts.join(' '), hit[0] || null);
  }
  function undo() {
    const prev = UNDO.pop();
    if (!prev) return;
    const keep = { health: st.health, info: st.info, play: st.play, evo: st.evo, tour: st.tour, renames: st.renames, traitNames: st.traitNames };
    st = upgradeState(JSON.parse(prev));
    // the Health roll stays as rolled; names, notes and table state are not part of the undo
    st.health = Object.assign({}, st.health, { mode: keep.health.mode, roll: keep.health.roll, rerolled: keep.health.rerolled });
    Object.assign(st, { info: keep.info, play: keep.play, evo: keep.evo, tour: keep.tour, renames: keep.renames, traitNames: keep.traitNames });
    syncUndo(); render();
    showNote(tr('Undone.'), null);
  }
  // Take a snapshot before each click or change, and look after every handler has run.
  let snapPending = false;
  const snapChange = ev => {
    if (SHEET_PAGE || snapPending || (ev.target.closest && ev.target.closest('#change-note, [data-act="undo"], #roster, [data-act="roster"]'))) return;
    snapPending = true;
    const json = JSON.stringify(st), key = creationKey(st);
    setTimeout(() => { snapPending = false; if (creationKey(st) !== key) afterChange(json); }, 0);
  };
  document.addEventListener('click', snapChange, true);
  document.addEventListener('change', snapChange, true);
  document.addEventListener('click', ev => {
    const b = ev.target.closest('[data-note]');
    if (b) {
      const a = b.dataset.note;
      if (a === 'close') hideNote();
      if (a === 'undo') undo();
      if (a === 'go') { hideNote(); goToStep(b.dataset.step); }
      return;
    }
    if (ev.target.closest('[data-act="undo"]')) undo();
  });
  document.addEventListener('keydown', ev => {
    if ((ev.ctrlKey || ev.metaKey) && !ev.shiftKey && ev.key.toLowerCase() === 'z' && !ev.target.closest('input, textarea, select, [contenteditable]')) { ev.preventDefault(); undo(); }
  });
  syncUndo();

  // ------------------------------------------------------------------ my champions (several, kept in this browser)
  var rosterHooks = {
    warn: () => showNote(tr('This browser is out of space: the latest change may not be saved. Export your champions (Arquivo) and remove portraits or old champions.'), null),
    say: msg => showNote(esc(msg), null),
    opened: () => { UNDO.length = 0; syncUndo(); Object.assign(ui, { at: {}, passed: {}, expand: {}, lastPick: {}, redOpen: {}, socket: null }); save(); syncRosterCount(); }
  };
  const readSlot = id => { try { return JSON.parse(localStorage.getItem(SLOT(id))); } catch (e) { return null; } };
  function allChampions() {
    const ids = rosterIds();
    if (!ids.includes(st.cid)) ids.push(st.cid);
    return ids.map(id => (id === st.cid ? st : readSlot(id))).filter(Boolean);
  }
  function syncRosterCount() { const c = document.getElementById('roster-count'); if (c) c.textContent = String(allChampions().length); }
  // exported files are named after the champion's Name (the Title only when there is no Name)
  const fileBase = () => ((st.info.alias || '').trim() || (st.info.name || '').trim() || 'runeterra-champion');
  const champName = c => (c.info && c.info.name && c.info.name.trim()) || tr('Unnamed champion');
  function champLine(c) {
    const f = (list, id) => (id && (list || []).find(x => x.id === id)) || null;
    const ar = f(window.ARCHETYPES, c.arch && c.arch.id), base = f(window.ARCHETYPES, c.arch && c.arch.base), bg = f(window.BACKGROUNDS, c.bg && c.bg.id), ps = f(window.POWER_SOURCES, c.ps && c.ps.id), rg = f(window.REGIONS, c.region);
    return [ar && (ar.rt + (base ? ' · ' + base.rt : '')), bg && bg.rt, ps && ps.rt, rg && rg.rt].filter(Boolean).join(' · ') || tr('Just started');
  }
  function champStatus(c) {
    const fin = stepIndex('finish');
    if ((c.maxStep || 0) >= fin) return `<span class="ro-pill done">${tr('Ready for the table')}</span>`;
    const at = Math.max(0, stepIndex(c.step || 'intro'));
    return `<span class="ro-pill">${tr('Chapter {n} of IX', { n: ROMAN[Math.max(1, at)] })}</span>`;
  }
  function rosterHtml() {
    const list = allChampions().sort((a, b) => (b.cid === st.cid) - (a.cid === st.cid) || (b.updated || 0) - (a.updated || 0));
    const when = t => (t ? new Date(t).toLocaleDateString(PT ? 'pt-BR' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '');
    return `<div class="ro-back" data-act="rosterClose"></div><section class="ro-panel" role="dialog" aria-modal="true" aria-labelledby="ro-title">
      <header class="ro-head"><div><h2 id="ro-title">${tr('My champions')}</h2><p class="muted">${tr('Kept in this browser. Export them (Arquivo) to keep a copy or move them to another device.')}</p></div>
        <button type="button" class="btn primary" data-act="rosterNew">${ico('mark')} ${tr('New champion')}</button>
        <button type="button" class="ro-x" data-act="rosterClose" aria-label="${tr('Close')}">✕</button></header>
      <ul class="ro-list">${list.map(c => {
        const on = c.cid === st.cid, pic = c.info && c.info.portrait, rg = c.region && (window.REGIONS || []).find(r => r.id === c.region);
        return `<li class="ro-item${on ? ' on' : ''}">
          <div class="ro-pic">${pic ? `<img src="${pic}" alt="">` : sigil(rg ? rg.sigil || rg.id : 'compass')}</div>
          <div class="ro-main"><div class="ro-name">${esc((c.info && c.info.alias && c.info.alias.trim()) || champName(c))}${c.info && c.info.alias && c.info.alias.trim() && c.info.name ? ` <small>${esc(c.info.name)}</small>` : ''}</div>
            <div class="ro-line">${esc(champLine(c))}</div>
            <div class="ro-meta">${champStatus(c)}<span>${tr('Edited {d}', { d: when(c.updated) })}</span></div></div>
          <div class="ro-acts">${on ? `<span class="ro-open">${tr('Open now')}</span>` : `<button type="button" class="btn small" data-act="rosterOpen" data-id="${c.cid}">${tr('Open')}</button>`}
            <button type="button" class="linkbtn" data-act="rosterDup" data-id="${c.cid}">${tr('Duplicate')}</button>
            <button type="button" class="linkbtn danger" data-act="rosterDel" data-id="${c.cid}">${tr('Delete')}</button></div></li>`;
      }).join('')}</ul></section>`;
  }
  function showRoster() {
    let r = document.getElementById('roster');
    if (!r) { r = document.createElement('div'); r.id = 'roster'; r.className = 'roster'; document.body.appendChild(r); }
    r.innerHTML = rosterHtml(); r.hidden = false;
    document.body.classList.add('ro-lock');
    const b = r.querySelector('[data-act="rosterNew"]'); if (b) b.focus();
  }
  function hideRoster() { const r = document.getElementById('roster'); if (r) r.hidden = true; document.body.classList.remove('ro-lock'); }
  function openChampion(id) {
    if (id === st.cid) { hideRoster(); return; }
    const c = readSlot(id);
    if (!c) return;
    save();
    st = upgradeState(c);
    rosterHooks.opened(); hideRoster(); render(); scrollTo(0, 0);
    rosterHooks.say(tr('Now editing {name}.', { name: champName(st) }));
  }
  function newChampion() {
    save();
    const tour = st.tour;   // the guide stays as it was: no need to see the same tips again
    st = blank(); st.tour = tour;
    rosterHooks.opened(); hideRoster(); render(); scrollTo(0, 0);
  }
  function duplicateChampion(id) {
    save();
    const c = id === st.cid ? JSON.parse(JSON.stringify(st)) : readSlot(id);
    if (!c) return;
    c.cid = newId(); c.updated = Date.now();
    c.info = Object.assign({}, c.info, { name: (c.info && c.info.name ? c.info.name : tr('Unnamed champion')) + ' ' + tr('(copy)') });
    try { localStorage.setItem(SLOT(c.cid), JSON.stringify(c)); const ids = rosterIds(); ids.push(c.cid); localStorage.setItem(ROSTER, JSON.stringify(ids)); } catch (e) { rosterHooks.warn(); }
    syncRosterCount(); showRoster();
  }
  function deleteChampion(id) {
    const c = id === st.cid ? st : readSlot(id);
    if (!c || !confirm(tr('Delete {name}? This cannot be undone. Export it first if you want to keep a copy.', { name: champName(c) }))) return;
    try { localStorage.removeItem(SLOT(id)); localStorage.setItem(ROSTER, JSON.stringify(rosterIds().filter(x => x !== id))); } catch (e) { /* ignore */ }
    if (id === st.cid) {   // the open one: go to the most recent other, or start a new one
      const rest = allChampions().filter(x => x.cid !== id).sort((a, b) => (b.updated || 0) - (a.updated || 0));
      st = rest.length ? upgradeState(rest[0]) : Object.assign(blank(), { tour: st.tour });
      rosterHooks.opened(); render();
    }
    syncRosterCount(); showRoster();
  }
  document.addEventListener('click', ev => {
    const el = ev.target.closest('[data-act^="roster"]');
    if (!el) return;
    const a = el.dataset.act, id = el.dataset.id;
    if (a === 'roster') showRoster();
    if (a === 'rosterClose') hideRoster();
    if (a === 'rosterOpen') openChampion(id);
    if (a === 'rosterNew') newChampion();
    if (a === 'rosterDup') duplicateChampion(id);
    if (a === 'rosterDel') deleteChampion(id);
  });
  document.addEventListener('keydown', ev => { if (ev.key === 'Escape' && document.getElementById('roster') && !document.getElementById('roster').hidden) hideRoster(); });
  save(); syncRosterCount();   // a champion from before the roster joins it

  // Read-only view of the computed champion, used by the test suite and the creation simulator.
  window.ForgeDebug = {
    state: () => JSON.parse(JSON.stringify(st)),
    issues: step => stepIssues(step, compute()),
    traits: () => Object.values(compute().T).map(t => ({ key: t.key, die: t.die, kind: TRAIT[t.key].kind, cat: TRAIT[t.key].cat })),
    status: () => compute().status,
    status2: () => compute().status2 || null,
    health: () => { const h = healthCalc(compute()); return h && { max: h.max, red: h.red, traitMax: h.traitMax, roll: h.roll, trait: h.chosen && h.chosen.key, green: h.green, yellow: h.yellow, redR: h.redR }; },
    abilities: () => allAbilities(compute()).map(a => ({ name: a.name, color: a.color, src: a.src, trait: a.entry && a.entry.trait, trait2: a.entry && a.entry.trait2 })),
    principles: () => principlesFinal().map(x => x.id || (x.p && x.p.id)),
    champions: () => allChampions().map(c => ({ id: c.cid, name: champName(c), open: c.cid === st.cid })),
    // Validate any saved state without showing it: the issues of every chapter and the computed values.
    check: s => {
      const keep = st;
      try {
        st = upgradeState(JSON.parse(JSON.stringify(s)));
        const R = compute(), h = healthCalc(R), issues = {};
        for (const id of ['background', 'powersource', 'archetype', 'personality', 'red', 'health']) issues[id] = stepIssues(id, R);
        const T = {};
        for (const t of Object.values(R.T)) T[t.key] = t.die;
        return { issues, T, status: R.status || null, status2: R.status2 || null, health: h ? h.max : null };
      } finally { st = keep; }
    }
  };

  render();
})();