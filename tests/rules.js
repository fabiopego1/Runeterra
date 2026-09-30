/* Rules test: the Forge against an independent reading of the Sentinels Comics RPG rulebook.
   For every Source x Path pair (Paths also as the base of Divided and of Modular; Origins and Temperaments cycled
   through them) it builds random champions the book allows and checks that the Forge accepts them with the same
   dice, status and Health, then changes one choice at a time and checks that the Forge and the book agree on
   which chapters are now wrong.
     python3 -m http.server 8765 &
     node tests/rules.js            quick run (a sample of the pairs, used by CI)
     RULES_FULL=1 node tests/rules.js   every pair, more champions and changes each
   RULES_SEED changes the random picks; RULES_OUT writes every disagreement to a JSON file. */
'use strict';
const fs = require('fs');
const path = require('path');
let playwright;
try { playwright = require('playwright'); } catch (e) { playwright = require(require('child_process').execSync('npm root -g').toString().trim() + '/playwright'); }

const BASE = (process.env.BASE_URL || 'http://localhost:8765').replace(/\/$/, '');
const FULL = !!process.env.RULES_FULL;
const SEED = +(process.env.RULES_SEED || 1);
const PER_PAIR = FULL ? 3 : 1;          // legal champions per pair
const MUTATIONS = FULL ? 25 : 6;         // one-change variants per champion
const STRIDE = FULL ? 1 : 5;             // quick run: every fifth pair (all Sources and Paths still appear)

(async () => {
  const browser = await playwright.chromium.launch();
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto(`${BASE}/index.html`);
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  for (const f of ['referee.js', 'generator.js']) await page.addScriptTag({ path: path.join(__dirname, 'rules', f) });
  const all = await page.evaluate(() => window.RulesFuzz.combos());
  const pairs = all.filter((_, i) => (i + SEED) % STRIDE === 0);
  const t0 = Date.now();
  const res = await page.evaluate(({ pairs, PER_PAIR, MUTATIONS, SEED }) => {
    const F = window.RulesFuzz;
    const out = { legal: 0, mutants: 0, nogen: [], diffs: [], mutStats: {} };
    pairs.forEach((c, pi) => {
      for (let n = 0; n < PER_PAIR; n++) {
        const seed = SEED * 100003 + pi * 101 + n;
        let s;
        try { s = F.build(c, seed); } catch (e) { out.nogen.push({ c, seed, msg: e.message, v: (e.violations || []).map(v => v.msg).slice(0, 4) }); continue; }
        out.legal++;
        const r = F.compare(s, true);
        if (r.bookSteps.length) out.diffs.push({ kind: 'generator', c, seed, d: r.bookSteps });
        for (const d of r.diffs) out.diffs.push({ kind: 'legal', c, seed, d, s });
        for (let m = 0; m < MUTATIONS; m++) {
          const mu = F.mutate(s, seed * 31 + m + 1);
          const q = F.compare(mu.s, false);
          out.mutants++;
          const ms = out.mutStats[mu.label] = out.mutStats[mu.label] || { n: 0, illegal: 0 };
          ms.n++; if (q.bookSteps.length) ms.illegal++;
          for (const d of q.diffs) out.diffs.push({ kind: 'mutant', mut: mu.label, c, seed, d, s: mu.s });
        }
      }
    });
    return out;
  }, { pairs, PER_PAIR, MUTATIONS, SEED });

  // Group disagreements by what was said, so one bug shows up once with a count and an example.
  const key = x => x.kind === 'legal' ? `legal champion | ${x.d.step} | ${x.d.step === 'values' ? 'values differ' : 'the Forge objects'}`
    : `${x.d.step}: ${x.d.rules && x.d.rules.length ? 'the book objects (' + x.d.rules.join(', ') + '), the Forge does not' : 'the Forge objects, the book does not'}`;
  const groups = new Map();
  for (const x of res.diffs) { const k = x.kind === 'generator' ? 'generator made a champion the book rejects' : key(x); if (!groups.has(k)) groups.set(k, []); groups.get(k).push(x); }
  console.log(`rules: ${pairs.length}/${all.length} Source x Path pairs, ${res.legal} legal champions, ${res.mutants} changed ones, ${((Date.now() - t0) / 1000).toFixed(1)}s`);
  console.log('changes tried (book says illegal / total): ' + Object.entries(res.mutStats).map(([k, v]) => `${k} ${v.illegal}/${v.n}`).join(', '));
  if (res.nogen.length) {
    console.log(`\nFAIL could not build ${res.nogen.length} champions:`);
    for (const x of res.nogen.slice(0, 10)) console.log(`   ${JSON.stringify(x.c)} ${x.msg}: ${x.v.join(' | ')}`);
  }
  for (const [k, list] of groups) {
    const ex = list[0];
    console.log(`\nFAIL ${list.length}x ${k}`);
    console.log(`   e.g. ${JSON.stringify(ex.c)}${ex.mut ? ' after "' + ex.mut + '"' : ''}`);
    if (ex.d.book) console.log(`   book:  ${ex.d.book.slice(0, 3).join(' | ') || '(nothing wrong)'}`);
    if (ex.d.forge) console.log(`   forge: ${ex.d.forge.slice(0, 3).join(' | ') || '(nothing wrong)'}`);
  }
  if (process.env.RULES_OUT) fs.writeFileSync(process.env.RULES_OUT, JSON.stringify(res.diffs, null, 1));
  for (const e of errors) console.log('FAIL page error: ' + e);
  await browser.close();
  const bad = res.nogen.length + res.diffs.length + errors.length;
  console.log(bad ? `\n${groups.size} kinds of disagreement` : '\nok   the Forge and the book agree on every champion');
  process.exit(bad ? 1 : 0);
})();
