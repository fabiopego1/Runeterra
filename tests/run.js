/* Site smoke tests (Playwright). Serve the repo root first:
     python3 -m http.server 8765 &
     node tests/run.js
   BASE_URL overrides the address. GM_PASSWORD (optional) also tests unlocking the GM Screen. */
'use strict';
const fs = require('fs');
const path = require('path');
let playwright;
try { playwright = require('playwright'); } catch (e) { playwright = require(require('child_process').execSync('npm root -g').toString().trim() + '/playwright'); }

const BASE = (process.env.BASE_URL || 'http://localhost:8765').replace(/\/$/, '');
const FIXTURE = fs.readFileSync(path.join(__dirname, 'fixtures', 'champion.json'), 'utf8');
const STEPS = ['intro', 'region', 'background', 'powersource', 'archetype', 'personality', 'red', 'retcon', 'health', 'finish'];

let failures = 0;
const ok = (cond, msg) => { console.log(`${cond ? 'ok  ' : 'FAIL'} ${msg}`); if (!cond) failures++; };

(async () => {
  const browser = await playwright.chromium.launch();
  const errors = [];
  const newPage = async (viewport = { width: 1440, height: 1000 }) => {
    const ctx = await browser.newContext({ viewport, acceptDownloads: true });
    const p = await ctx.newPage();
    p.on('pageerror', e => errors.push(`${p.url()}: ${e.message}`));
    p.on('requestfailed', r => { if (r.url().startsWith(BASE)) errors.push(`404/failed: ${r.url()}`); });
    p.on('response', r => { if (r.url().startsWith(BASE) && r.status() >= 400) errors.push(`${r.status()}: ${r.url()}`); });
    return p;
  };

  // 1. Full Guided/Constructed flow up to the PDF.
  {
    const p = await newPage();
    await p.goto(`${BASE}/index.html`);
    await p.evaluate(() => localStorage.clear()); await p.reload();
    await p.evaluate(() => document.fonts.ready);
    const step = () => p.$eval('.rail-item.active .rail-name', e => e.textContent.trim());
    const next = async () => { await p.click('[data-act=next]', { force: true }); await p.waitForTimeout(450); };
    const sel = async (bd, v) => {
      if (await p.$(`select[data-bind="${bd}"]`)) return p.selectOption(`select[data-bind="${bd}"]`, v);
      if (!(await p.$(`.rune[data-bind="${bd}"][data-val="${v}"]`))) await p.click(`.sock-slot[data-bind="${bd}"]`);
      await p.click(`.rune[data-bind="${bd}"][data-val="${v}"]`); await p.waitForTimeout(30);
    };
    const ab = (g, n, cat) => p.click(`[data-act=toggleAb][data-g=${g}][data-name="${n}"]${cat ? `[data-cat="${cat}"]` : ''}`);

    ok(await p.$eval('[data-act=method][data-m=constructed]', e => e.getAttribute('aria-pressed') === 'true' || e.classList.contains('on') || e.classList.contains('active')), 'Construído is the default method');
    ok(await p.$$eval('.rail-item.locked', e => e.length) > 0, 'later chapters are locked on a fresh start');
    await next();
    const regionStep = await step();
    await next();
    ok(await step() === regionStep, 'cannot advance without picking a region');
    await p.click('[data-kind=region][data-id=zaun]'); await next();
    await p.click('[data-act=method][data-m=guided]');
    await p.click('[data-act=roll]');
    ok(await p.$$eval('.card.valid', e => e.length) > 0, 'guided roll marks valid origins');
    await p.click('[data-act=method][data-m=constructed]');
    await p.click('[data-kind=bg][data-id=anachronistic]');
    await sel('bg.assign.b0', 'magical-lore'); await sel('bg.assign.b1', 'history');
    await p.click('[data-act=principle][data-slot=bg][data-id=magic]');
    await next();
    await p.click('[data-kind=ps][data-id=mystical]');
    await sel('ps.assign.p0', 'cosmic'); await sel('ps.assign.p1', 'transmutation'); await sel('ps.assign.p2', 'flight');
    await sel('ps.extra.key', 'otherworldly-mythos');
    await ab('ps-yellow', 'Modification Wave'); await ab('ps-yellow', 'Sever Link');
    await sel('sel.ps-yellow.0.trait', 'cosmic'); await sel('sel.ps-yellow.1.trait', 'transmutation');
    await next();
    await p.click('[data-kind=arch][data-id=sorcerer]');
    await sel('arch.assign.a0', 'conviction'); await sel('arch.assign.a1', 'illusions'); await sel('arch.assign.a2', 'remote-viewing');
    await ab('arch-green', 'Energy Jaunt'); await ab('arch-green', 'Subdue');
    await sel('sel.arch-green.0.trait', 'remote-viewing'); await sel('sel.arch-green.1.trait', 'cosmic');
    await ab('arch-yellow', 'Cords of Magic'); await sel('sel.arch-yellow.0.trait', 'cosmic');
    await p.click('[data-act=principle][data-slot=arch][data-id=destiny]');
    await next();
    await p.click('[data-kind=pers][data-id=decisive]');
    await p.fill('input[data-bind="pers.qname"]', 'Dom dos Imaginais'); await p.press('input[data-bind="pers.qname"]', 'Enter'); await p.waitForTimeout(100);
    await sel('pers.outTrait', 'cosmic');
    await next();
    await ab('red', 'Purification', 'Q:mental'); await ab('red', 'Summoned Allies', 'P:elemental'); await sel('sel.red.1.trait', 'cosmic');
    await next();
    await p.click('[data-act=retcon][data-id=red-up]');
    await next(); await next();
    await p.fill('input[data-bind="info.name"]', 'Bruxaria'); await p.press('input[data-bind="info.name"]', 'Enter'); await p.waitForTimeout(100);
    ok(await p.$$eval('.rail-item.locked', e => e.length) === 0, 'every chapter unlocked at the end');
    ok(!!(await p.$('[data-act=pdf]')), 'PDF export available');
    const [dl] = await Promise.all([p.waitForEvent('download', { timeout: 60000 }), p.click('[data-act=pdf]')]);
    const pdf = path.join(require('os').tmpdir(), 'forja-test.pdf');
    await dl.saveAs(pdf);
    ok(fs.statSync(pdf).size > 20000, `PDF generated (${fs.statSync(pdf).size} bytes)`);

    // Table mode: − lowers Health, the zone follows and higher zones unlock
    const zoneNow = () => p.$eval('#sheet-preview .hs-znow', e => e.className.replace(/.*z-/, ''));
    ok(await zoneNow() === 'green', 'sheet starts in the green zone');
    ok(await p.$$eval('#sheet-preview .hs-zone.locked', e => e.length) === 2, 'yellow and red abilities are locked at full Health');
    await p.fill('#sheet-preview [data-bind="play.current"]', '5'); await p.waitForTimeout(100);
    ok(await zoneNow() === 'red', 'typing a low Health moves to the red zone');
    ok(await p.$$eval('#sheet-preview .hs-zone.locked', e => e.length) === 0, 'red zone unlocks every ability');
    ok(await p.$eval('#sheet-preview .hs-sd.red', e => e.classList.contains('current')), 'red status die is highlighted');
    for (let k = 0; k < 6; k++) await p.click('#sheet-preview [data-act=hpStep][data-d="-1"]');
    ok(await zoneNow() === 'out' && await p.$eval('#sheet-preview .hs-out', e => e.classList.contains('on')), 'Health 0 puts the champion out of the fight');
    await p.click('#sheet-preview [data-act=hpStep][data-d=max]');
    ok(await zoneNow() === 'green', 'full Health button restores the green zone');
    await p.click('#sheet-preview [data-act=hpStep][data-d="-1"]');
    const saved = await p.evaluate(() => JSON.parse(localStorage.getItem('runeterra-forge-v1')).play.current);
    ok(saved && Number(saved) > 0, `current Health is saved (${saved})`);
    ok(await p.$$eval('#sheet-preview .hs-page', e => e.length) === 3, 'sheet has three pages');
    await p.fill('#sheet-preview [data-bind="play.mname.0"]', 'Golem de sucata');
    await p.fill('#sheet-preview [data-bind="play.notes.0"]', 'Deve um favor a Silco');
    ok(await p.evaluate(() => JSON.parse(localStorage.getItem('runeterra-forge-v1')).play.notes[0] === 'Deve um favor a Silco'), 'table notes on page 3 are saved');
    const [dl3] = await Promise.all([p.waitForEvent('download', { timeout: 60000 }), p.click('[data-act=pdf]')]);
    await dl3.saveAs(pdf);
    const info = await p.evaluate(async b64 => {   // read it back with the page's own pdf-lib
      const doc = await window.PDFLib.PDFDocument.load(Uint8Array.from(atob(b64), c => c.charCodeAt(0)));
      const f = doc.getForm().getFields();
      return { pages: doc.getPageCount(), notes: f.filter(x => /play_notes_/.test(x.getName())).length, note0: (f.find(x => /play_notes_0$/.test(x.getName())) || { getText: () => '' }).getText() };
    }, fs.readFileSync(pdf).toString('base64'));
    ok(info.pages === 3, `PDF has three pages (${info.pages})`);
    ok(info.notes === 10 && info.note0 === 'Deve um favor a Silco', 'PDF keeps the table notes as fillable fields');

    // Arquivo menu
    await p.evaluate(() => scrollTo(0, 0));
    await p.click('#file-btn');
    ok(await p.$eval('#file-pop', e => !e.hidden), 'Arquivo menu opens');
    await p.keyboard.press('Escape');
    ok(await p.$eval('#file-pop', e => e.hidden), 'Escape closes the Arquivo menu');
    await p.click('#file-btn');
    const [json] = await Promise.all([p.waitForEvent('download'), p.click('#file-pop [data-act=export]')]);
    ok(/\.json$/.test(json.suggestedFilename()), 'Exportar campeão downloads a .json');
    await p.waitForTimeout(50);
    ok(await p.$eval('#file-pop', e => e.hidden), 'menu closes after an action');
    await p.context().close();
  }

  // 2. Text scans on every chapter: no "—" and no mention of the original system's name.
  {
    const p = await newPage();
    await p.goto(`${BASE}/index.html`);
    const hits = new Set();
    for (const mode of ['filled', 'blank']) for (const s of STEPS) {
      await p.evaluate(([fx, s, mode]) => {
        localStorage.clear();
        if (mode === 'filled') { const o = JSON.parse(fx); o.step = s; localStorage.setItem('runeterra-forge-v1', JSON.stringify(o)); }
      }, [FIXTURE, s, mode]);
      await p.reload(); await p.waitForTimeout(150);
      (await p.evaluate(() => {
        const out = [];
        const bad = /—|Sentinel(?!as? da Luz)|SCRPG|Greater Than Games/;
        const check = (where, t) => { const m = t && t.match(bad); if (m) out.push(`${where}: …${t.slice(Math.max(0, m.index - 40), m.index + 40)}…`); };
        const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        let n; while ((n = w.nextNode())) if (!n.parentElement.closest('script,style')) check('text', n.nodeValue);
        document.querySelectorAll('[data-tip],[title],[aria-label],[placeholder]').forEach(e => ['data-tip', 'title', 'aria-label', 'placeholder'].forEach(a => check(a, e.getAttribute(a))));
        return out;
      })).forEach(h => hits.add(`${mode}/${s} ${h}`));
    }
    hits.forEach(h => console.log('     ', h));
    ok(hits.size === 0, 'Forja text has no "—" and no references to the original system');
    await p.context().close();
  }

  // 3. Every page loads, and none scrolls sideways on a phone.
  for (const vp of [{ width: 1440, height: 1000 }, { width: 390, height: 844 }]) {
    const p = await newPage(vp);
    for (const page of ['index.html', 'lore.html', 'regras.html', 'gm.html']) {
      await p.goto(`${BASE}/${page}`);
      if (page === 'index.html') { await p.evaluate(fx => { const o = JSON.parse(fx); o.step = 'finish'; localStorage.setItem('runeterra-forge-v1', JSON.stringify(o)); }, FIXTURE); await p.reload(); }
      await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(200);
      const sw = await p.evaluate(() => document.documentElement.scrollWidth);
      ok(sw <= vp.width, `${page} @${vp.width}px has no horizontal scroll (${sw})`);
    }
    await p.context().close();
  }

  // 4. Rules page search and Lore page content.
  {
    const p = await newPage();
    await p.goto(`${BASE}/regras.html`);
    ok(await p.$$eval('.rule-card', e => e.length) > 10, 'Regras renders its sections');
    await p.fill('.page-search', 'lacaio');
    ok(await p.$$eval('.rule-card:not([hidden])', e => e.length) > 0, 'Regras search finds "lacaio"');
    await p.goto(`${BASE}/lore.html`);
    ok(await p.$$eval('img', e => e.length) > 5, 'Lore shows its images');
    await p.context().close();
  }

  // 5. GM Screen (only with the password in the environment; never commit it).
  if (process.env.GM_PASSWORD) {
    const p = await newPage();
    await p.goto(`${BASE}/gm.html`);
    await p.fill('#gm-pass', process.env.GM_PASSWORD);
    await p.press('#gm-pass', 'Enter');
    await p.waitForSelector('#gm-room:not([hidden])', { timeout: 15000 }).catch(() => {});
    ok(await p.evaluate(() => !document.getElementById('gm-room').hidden && document.getElementById('gm-flavour').children.length > 0), 'GM Screen unlocks with the password');
    await p.context().close();
  } else console.log('skip GM Screen unlock (GM_PASSWORD not set)');

  errors.forEach(e => console.log('     ', e));
  ok(errors.length === 0, 'no JavaScript errors or missing files');
  await browser.close();
  console.log(failures ? `\n${failures} failing` : '\nall passing');
  process.exit(failures ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
