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
const STEPS = ['intro', 'people', 'region', 'background', 'powersource', 'archetype', 'personality', 'red', 'retcon', 'health', 'finish'];

let failures = 0;
const ok = (cond, msg) => { console.log(`${cond ? 'ok  ' : 'FAIL'} ${msg}`); if (!cond) failures++; };

(async () => {
  const browser = await playwright.chromium.launch();
  const errors = [];
  const newPage = async (viewport = { width: 1440, height: 1000 }) => {
    const ctx = await browser.newContext({ viewport, acceptDownloads: true });
    const p = await ctx.newPage();
    p.on('pageerror', e => errors.push(`${p.url()}: ${e.message}`));
    p.on('requestfailed', r => {   // requests cancelled by leaving the page (lazy images) are not missing files
      if (r.url().startsWith(BASE) && !/ERR_ABORTED/.test((r.failure() || {}).errorText || '')) errors.push(`failed: ${r.url()} ${(r.failure() || {}).errorText}`);
    });
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

    ok(await p.$eval('#tour h4', e => e.textContent.includes('Bem-vindo')), 'the guide greets a new champion on the welcome page');
    await p.click('[data-act=tourOk]');
    ok(!(await p.$('#tour')), '"Entendi" closes the guide for this chapter');
    ok(await p.$eval('[data-act=method][data-m=constructed]', e => e.getAttribute('aria-pressed') === 'true' || e.classList.contains('on') || e.classList.contains('active')), 'Construído is the default method');
    ok(await p.$$eval('.rail-item.locked', e => e.length) > 0, 'later chapters are locked on a fresh start');
    await next();
    ok(await p.$eval('#tour h4', e => e.textContent.includes('Povo')), 'the guide explains the next chapter');
    await p.click('[data-act=tourOff]');
    ok(!(await p.$('#tour')), 'the guide can be turned off');
    const peopleStep = await step();
    await next();
    ok(await step() === peopleStep, 'cannot advance without picking a people');
    await p.click('[data-kind=people][data-id=vastaya]');
    ok(await p.$eval('.chosen-region', e => e.textContent.includes('Vastaya')), 'people chapter shows the chosen people');
    await next();
    ok(await p.$$eval('.region-card .fit', e => e.some(x => x.textContent.includes('Vastaya'))), 'homelands that suit the people are marked');
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
    ok(await p.$$eval('.status-explain', e => e.length) === 1 && await p.$$eval('.status-trend', e => e.length) > 10, 'Temperament explains the status dice and tags each card');
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

    // Ficha page: the Forge links to it; full-screen sheet with a play rail
    ok(!!(await p.$('.sheet-cta a[href="ficha.html"]')), 'the Legend chapter links to the Ficha page');
    await p.goto(`${BASE}/ficha.html`);
    await p.waitForSelector('#sp-rail');
    ok(await p.$$eval('#sheet-preview .hs-page', e => e.length) === 3, 'Ficha shows the three sheet pages');
    const railHp = () => p.$eval('.sp-hp-n b', e => Number(e.textContent));
    const hp0 = await railHp();
    await p.click('#sp-rail [data-act=hpStep][data-d="-1"]');
    ok(await railHp() === hp0 - 1 && await p.$eval('#sheet-preview [data-bind="play.current"]', e => Number(e.value)) === hp0 - 1, 'the rail − button updates Health on the rail and on the sheet');
    await p.click('#sp-rail [data-act=hpStep][data-d=max]');

    // Evolve tab: swap a power, an ability and a principle; undo; history on page 3
    const stored = () => p.evaluate(() => JSON.parse(localStorage.getItem('runeterra-forge-v1')));
    await p.click('[data-act=sheetTab][data-tab=evolve]');
    ok(!!(await p.$('#flow-evolve')), 'Evolve tab opens the evolve tools');
    await p.selectOption('[data-evo=from]', 'flight');
    const to = await p.$eval('[data-evo=to]', s => { const o = [...s.options].find(x => x.value); return { v: o.value, t: o.textContent }; });
    await p.selectOption('[data-evo=to]', to.v);
    await p.click('[data-act=evoApply]');
    ok((await stored()).evo.traits.flight === to.v, `power swap saved (Voo → ${to.t})`);
    await p.click('[data-act=evoTab][data-tab=ability]');
    await p.selectOption('[data-evo=from]', { index: 1 });
    if (await p.$('[data-evo=to]')) {
      await p.selectOption('[data-evo=to]', { index: 1 });
      for (const inp of await p.$$('.evo-form input[data-evo]')) await inp.fill('fogo');
      for (const s of await p.$$('.evo-form select[data-evo^="ch."]')) await s.selectOption({ index: 1 });
      await p.click('[data-act=evoApply]');
    }
    const afterAb = (await stored()).evo.log.length;
    ok(afterAb === 2, `ability swap recorded (${afterAb} changes)`);
    await p.click('[data-act=evoUndo]');
    ok((await stored()).evo.log.length === 1, 'undo removes the last change');
    await p.click('[data-act=evoTab][data-tab=principle]');
    await p.selectOption('[data-evo=from]', 'bg');
    const pr = await p.$eval('[data-evo=to]', s => [...s.options].find(x => x.value && x.value !== 'energy-element').value);
    await p.selectOption('[data-evo=to]', pr);
    await p.click('[data-act=evoApply]');
    ok((await stored()).evo.principles.bg === pr, 'principle swap saved');
    await p.click('[data-act=sheetTab][data-tab=sheet]');
    ok(await p.$eval('#sheet-preview', (e, t) => e.textContent.includes(t), to.t), 'swapped power shows on the sheet');
    ok(await p.$$eval('#sheet-preview .hs-evo', e => e.length) === 2, 'page 3 lists the evolution history');
    await p.goto(`${BASE}/index.html`);
    const issues = await p.evaluate(() => document.querySelectorAll('.rail-item.locked').length);
    ok(issues === 0, 'evolving keeps every chapter valid');

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

    // Major rewrite: back to the chapters with Construído, history kept
    await p.goto(`${BASE}/ficha.html#evoluir`);
    p.once('dialog', d => d.accept());
    await Promise.all([p.waitForURL(/index\.html/), p.click('[data-act=evoRewrite]')]);
    const rw = await stored();
    ok(rw.step === 'background' && rw.method === 'constructed' && rw.info.name === 'Bruxaria' && rw.evo.log.slice(-1)[0].kind === 'rewrite' && !rw.bg.id, 'rewrite restarts creation and keeps name and history');
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
    for (const page of ['index.html', 'ficha.html', 'lore.html', 'regras.html', 'resumo.html', 'gm.html']) {
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
    ok(await p.$$eval('.rules-part', e => e.length) === 4 && !!(await p.$('#cs-example')), 'Regras has Part IV (Para o Mestre) with the play example');
    for (const pg of ['regras.html', 'resumo.html', 'lore.html']) {
      await p.goto(`${BASE}/${pg}`);
      const bad = await p.evaluate(() => { const t = document.body.innerText; const m = t.match(/—|Sentinel(?!as? da Luz)|SCRPG|Greater Than Games/); return m ? t.slice(Math.max(0, m.index - 40), m.index + 40) : ''; });
      ok(!bad, `${pg} text has no "—" and no references to the original system${bad ? ` (…${bad}…)` : ''}`);
    }
    await p.goto(`${BASE}/resumo.html`);
    await p.evaluate(() => document.fonts.ready);
    await p.emulateMedia({ media: 'print' });
    const a4 = await p.pdf({ format: 'A4', preferCSSPageSize: true });
    const pages = (a4.toString('latin1').match(/\/Type\s*\/Page[^s]/g) || []).length;
    ok(pages === 1, `the table summary prints on one A4 page (${pages})`);
    await p.emulateMedia({ media: 'screen' });
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

    // Table tools
    await p.click('[data-gm=preset][data-p=standard]');
    for (let k = 0; k < 2; k++) await p.click('[data-gm=advance]');
    ok(await p.$eval('.gmt-status', e => e.textContent.includes('Amarela')), 'scene tracker turns Yellow after the two Green spaces');
    await p.fill('[data-gm-form=turn] input[name=name]', 'Aldric'); await p.press('[data-gm-form=turn] input[name=name]', 'Enter');
    await p.click('[data-gm=addTracker]');
    await p.click('.gmt-list [data-gm=acted]');
    ok(await p.$$eval('.gmt-list li.done', e => e.length) === 1, 'turn order marks who already acted');
    await p.click('[data-gm=newRound]');
    ok(await p.$$eval('.gmt-list li.done', e => e.length) === 0 && await p.$eval('.gmt-turns h3 small', e => e.textContent.includes('2')), 'new round clears the turn order');
    await p.fill('[data-gm-form=challenge] input[name=name]', 'Vazamento'); await p.fill('[data-gm-form=challenge] input[name=timer]', '2'); await p.press('[data-gm-form=challenge] input[name=name]', 'Enter');
    await p.click('[data-gm=chTick][data-i="1"]');
    ok(await p.$eval('.gmt-challenges .gmt-card', e => e.classList.contains('bad')), 'a challenge fires when its timer runs out');
    await p.fill('[data-gm-form=foe] input[name=name]', 'Capangas'); await p.press('[data-gm-form=foe] input[name=name]', 'Enter');
    await p.fill('[data-dmg]', '99'); await p.click('[data-gm=foeHit]');
    ok(await p.$$eval('.gmt-foe .gmt-die', e => e.length) === 2 && await p.$eval('.gmt-result', e => e.textContent.includes('derrotado')), 'a minion that fails its save is removed');
    await p.selectOption('.gmt-foes select[name=kind]', 'lieutenant'); await p.selectOption('.gmt-foes select[name=die]', 'd10');
    await p.fill('[data-gm-form=foe] input[name=name]', 'Gorn'); await p.press('[data-gm-form=foe] input[name=name]', 'Enter');
    const lt = (await p.$$('[data-dmg]'))[1];
    await lt.fill('20'); await (await p.$$('[data-gm=foeHit]'))[1].click();
    ok(await p.$$eval('.gmt-result', e => e.some(x => x.textContent.includes('sem rolar'))), 'massive damage defeats a lieutenant without a roll');
    await p.click('[data-gm=twist][data-t=major]');
    ok(await p.$eval('.gmt-twist p', e => e.textContent.length > 10), 'twist generator draws a twist');
    await p.fill('#gmt-notes', 'O Capataz trabalha para Singed.'); await p.waitForTimeout(1200);
    const stored = await p.evaluate(() => localStorage.getItem('runeterra-gm-notes-v1'));
    ok(stored && !stored.includes('Singed') && JSON.parse(stored).ct, 'GM notes are stored encrypted');
    await p.reload(); await p.waitForSelector('#gmt-notes'); await p.waitForTimeout(800);
    ok(await p.$eval('#gmt-notes', e => e.value) === 'O Capataz trabalha para Singed.' && await p.$$eval('.gmt-foe', e => e.length) === 2, 'notes and table come back after a reload');
    const [bk] = await Promise.all([p.waitForEvent('download'), p.click('[data-gm=backup]')]);
    const bkText = fs.readFileSync(await bk.path(), 'utf8');
    ok(/runeterra-gm-backup/.test(bkText) && !bkText.includes('Singed'), 'backup is exported encrypted');
    await p.context().close();
  } else console.log('skip GM Screen unlock (GM_PASSWORD not set)');

  errors.forEach(e => console.log('     ', e));
  ok(errors.length === 0, 'no JavaScript errors or missing files');
  await browser.close();
  console.log(failures ? `\n${failures} failing` : '\nall passing');
  process.exit(failures ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
