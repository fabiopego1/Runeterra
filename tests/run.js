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
const STEPS = ['intro', 'people', 'region', 'background', 'powersource', 'archetype', 'personality', 'red', 'health', 'finish'];

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
    const next = async () => { await p.click('[data-act=next]', { force: true }); await p.waitForTimeout(450); if (await p.$('#tour') && !guideCheck) { await p.click('#tour [data-act=tourOk]'); await p.waitForTimeout(100); } };
    let guideCheck = true;   // the first chapters check the guide themselves
    const sel = async (bd, v) => {
      if (await p.$(`select[data-bind="${bd}"]`)) return p.selectOption(`select[data-bind="${bd}"]`, v);
      if (await p.$(`.tchip[data-bind="${bd}"]`)) { await p.click(`.tchip[data-bind="${bd}"][data-val="${v}"]`); await p.waitForTimeout(30); return; }
      if (!(await p.$(`.rune[data-bind="${bd}"][data-val="${v}"]`))) await p.click(`.sock-slot[data-bind="${bd}"]`);
      await p.click(`.rune[data-bind="${bd}"][data-val="${v}"]`); await p.waitForTimeout(30);
    };
    const ab = async (g, n, cat) => {
      const q = `[data-act=toggleAb][data-g=${g}][data-name="${n}"]${cat ? `[data-cat="${cat}"]` : ''}`;
      if (!(await p.$(q)) && cat && await p.$(`[data-act=redCat][data-cat="${cat}"]`)) { await p.click(`[data-act=redCat][data-cat="${cat}"]`); await p.waitForTimeout(50); }
      return p.click(q);
    };

    ok(!(await p.$('#tour')) && !(await p.$('[data-act=tourShow]')), 'no guide on the welcome page');
    ok(!(await p.$('[data-act=method]')) && !(await p.$('[data-act=tourOff]')), 'no method choice and no option to turn the guide off');
    ok(await p.$$eval('.rail-item.locked', e => e.length) > 0, 'later chapters are locked on a fresh start');
    await next();
    ok(!(await p.$('#tour')), 'no guide on the People chapter');
    const peopleStep = await step();
    await next();
    ok(await step() === peopleStep, 'cannot advance without picking a people');
    await p.click('[data-kind=people][data-id=vastaya]');
    ok(await p.$eval('[data-kind=people].selected', e => e.dataset.id === 'vastaya') && await p.$$eval('[data-kind=people]', e => e.length) > 5, 'people chapter keeps every card on screen and highlights the chosen one');
    await next();
    ok(await p.$$eval('.region-card .fit', e => e.some(x => x.textContent.includes('Vastaya'))), 'homelands that suit the people are marked');
    const regionStep = await step();
    await next();
    ok(await step() === regionStep, 'cannot advance without picking a region');
    await p.click('[data-kind=region][data-id=zaun]'); await next();
    ok(await p.$eval('#tour h4', e => e.textContent.includes('dados')), 'the Origin guide opens by explaining what the dice do');
    await p.click('#tour [data-act=tourNext]');
    ok(await p.$eval('#tour .tour-dots i.on', e => !!e) && await p.$eval('#tour h4', e => e.textContent.includes('Qualidades')), 'the guide moves to its next step');
    ok(await p.$$eval('#tour .tour-dots i', e => e.length) === 3, 'the dice-binding steps are not shown before an Origin is chosen');
    await p.click('#tour [data-act=tourOk]');
    ok(!(await p.$('#tour')), '"Pular" closes the guide');
    await p.click('[data-kind=bg][data-id=anachronistic]'); await p.waitForTimeout(150);
    ok(await p.$eval('#tour h4', e => e.textContent.includes('Ligue os dados')), 'once the dice section opens, its guide steps appear');
    await p.click('#tour [data-act=tourOk]');
    ok(!!(await p.$('#flow-background-pick.folded')) && !(await p.$('[data-act=expand]')), 'the chosen Origin folds into a summary, with no "change" button');
    await sel('bg.assign.b0', 'magical-lore'); await sel('bg.assign.b1', 'history'); await p.waitForTimeout(150);
    ok(await p.$eval('#tour h4', e => e.textContent.includes('Princípio')), 'the principle guide waits for the principle section');
    await p.click('#tour [data-act=tourOk]');
    const origHover = await p.$eval('[data-act=principle][data-id=magic]', e => e.dataset.tip);
    ok(!/Reviravolta|Habilidade verde|Green ability/i.test(origHover) && /Em Runeterra/.test(origHover), 'principle hover keeps only the roleplaying part and the Runeterra example');
    await p.evaluate(() => { const s = JSON.parse(localStorage.getItem('runeterra-forge-v1')); s.tour.on = false; localStorage.setItem('runeterra-forge-v1', JSON.stringify(s)); });
    await p.reload(); await p.waitForTimeout(300);
    guideCheck = false;
    await p.goBack(); await p.waitForTimeout(250);
    ok(!!(await p.$('#flow-background-assign.current')) && await step() === 'Origem', "the browser's back button reopens the previous section");
    await p.goBack(); await p.waitForTimeout(250);
    ok(!!(await p.$('#flow-background-pick.current')), 'and keeps walking back one section at a time');
    await p.goForward(); await p.waitForTimeout(250); await p.goForward(); await p.waitForTimeout(250);
    ok(!!(await p.$('#flow-background-principle.current')), "the browser's forward button moves on again");
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
    ok(!(await p.$('.status-trend')) && await p.$$eval('.zc', e => e.length) > 30, 'Temperament cards show the three zone dice, without trend tags');
    await p.click('[data-act=tourShow]');
    await p.click('#tour [data-act=tourNext]');
    ok(await p.$eval('#tour h4', e => e.textContent.includes('Dados de status')), 'the Guide button reopens the chapter guide, whose steps explain the status dice');
    ok(await p.$eval('#tour', e => !e.classList.contains('no-target')) && await p.$eval('#tour .tour-spot', e => e.getBoundingClientRect().width > 0), 'the guide step highlights the part of the page it talks about');
    await p.click('#tour [data-act=tourPrev]');
    ok(await p.$eval('#tour h4', e => e.textContent.includes('Temperamento')), 'the guide can go back a step');
    await p.click('[data-act=tourOk]');
    await p.click('[data-kind=pers][data-id=decisive]');
    await p.fill('input[data-bind="pers.qname"]', 'Dom dos Imaginais'); await p.waitForTimeout(100);
    ok(!!(await p.$('#flow-personality-qname.current')) && await p.$eval('[data-act=qok]', b => !b.disabled), 'the Signature Quality waits for the Confirm button');
    await p.click('[data-act=qok]'); await p.waitForTimeout(150);
    ok(!!(await p.$('#flow-personality-qname.folded')), 'Confirm keeps the name and moves on');
    await sel('pers.outTrait', 'cosmic');
    await next();
    ok(await p.$$eval('.redcat', e => e.length) > 2 && !(await p.$('.redcat .ab')), 'Ultimates list their categories closed, so the page is not a wall of abilities');
    await ab('red', 'Purification', 'Q:mental'); await ab('red', 'Summoned Allies', 'P:elemental'); await sel('sel.red.1.trait', 'cosmic');
    await next();
    ok(!(await p.$$eval('.rail-name', e => e.some(x => /Reviravolta/.test(x.textContent)))), 'there is no Twist of Fate chapter');
    ok(await p.$eval('.hchoice', e => /Definitivo/.test(e.textContent)), 'rolling for Health warns it cannot be undone');
    await p.click('.step-footer [data-act=back]'); await p.waitForTimeout(600);
    ok(await step() === 'Supremas', 'Back from the first section goes to the previous chapter');
    await next(); await next();
    ok(!(await p.$('#stage .flow-todo')) && await p.$eval('.step-footer', f => !!f), 'nothing in the Legend chapter is required');
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

  // Everything under assets/ must reach GitHub Pages (the tooltip art once went missing there).
  {
    const wf = fs.readFileSync(path.join(__dirname, '..', '.github', 'workflows', 'pages.yml'), 'utf8');
    const mk = wf.indexOf('mkdir -p _site'), cp = wf.indexOf('cp index.html');
    ok(/cp -r assets _site\//.test(wf) && mk >= 0 && mk < cp, 'the Pages deploy creates _site first and copies the whole assets folder');
  }
  {
    global.window = {}; for (const f of ['data-tables.js', 'lore-images.js']) require(path.join(__dirname, '..', 'js', f));
    const W = global.window, miss = [];
    for (const [k, list] of [['bg', W.BACKGROUNDS], ['ps', W.POWER_SOURCES], ['ar', W.ARCHETYPES], ['pe', W.PERSONALITIES]])
      for (const x of list) if (!fs.existsSync(path.join(__dirname, '..', 'assets', 'cards', `${k}-${x.id}.webp`))) miss.push(`${k}-${x.id}`);
    for (const slot of Object.keys(W.LORE_IMAGES)) if (/^(r-|race-)/.test(slot) && !fs.existsSync(path.join(__dirname, '..', 'assets', 'tip', slot + '.webp'))) miss.push('tip/' + slot);
    ok(!miss.length, `every hover card has its picture${miss.length ? ' (missing: ' + miss.join(', ') + ')' : ''}`);
    // No picture is used twice on the site: Lore page slots point at different files, and no two image files are the same bytes.
    const loreSrc = Object.values(W.LORE_IMAGES).map(im => im.src);
    const dupSrc = loreSrc.filter((x, i) => loreSrc.indexOf(x) !== i);
    const crypto = require('crypto'), seen = {}, dupFile = [];
    for (const dir of ['lore', 'cards', 'tip']) for (const f of fs.readdirSync(path.join(__dirname, '..', 'assets', dir)).filter(f => f.endsWith('.webp'))) {
      const h = crypto.createHash('sha1').update(fs.readFileSync(path.join(__dirname, '..', 'assets', dir, f))).digest('hex');
      if (seen[h]) dupFile.push(`${seen[h]} = ${dir}/${f}`); else seen[h] = `${dir}/${f}`;
    }
    // Size budget: hover art must stay small so it shows at once; Lore pictures are sized to how big they are drawn.
    const big = [];
    for (const [dir, max] of [['cards', 30], ['tip', 30], ['lore', 90]]) for (const f of fs.readdirSync(path.join(__dirname, '..', 'assets', dir)).filter(f => f.endsWith('.webp'))) {
      const kb = fs.statSync(path.join(__dirname, '..', 'assets', dir, f)).size / 1024;
      if (kb > max) big.push(`${dir}/${f} ${Math.round(kb)} KB`);
    }
    ok(!big.length, `every picture is within its size budget${big.length ? ': ' + big.join(', ') : ''}`);
    ok(!dupSrc.length && !dupFile.length, `no picture is used twice${dupSrc.length || dupFile.length ? ': ' + dupSrc.concat(dupFile).join(', ') : ''}`);
  }
  errors.forEach(e => console.log('     ', e));
  // Book p.44 "I've Already Got That": a Path's required trait you already have can take a bigger new die,
  // and its old die comes back to be used in the same step.
  {
    const p = await newPage();
    await p.goto(`${BASE}/index.html`);
    const S = JSON.parse(FIXTURE);
    Object.assign(S, { step: 'archetype', maxStep: 9, tour: { on: false, seen: {} }, noRetcon: true });
    S.bg = { id: 'struggling', assign: { b0: 'banter', b1: 'underworld', b2: 'acrobatics' }, principle: S.bg.principle };
    S.ps = { id: 'genetic', assign: { p0: 'agility', p1: 'flight', p2: 'strength' }, extra: {} };
    S.arch = { id: 'powerhouse', base: null, assign: { a0: 'strength' }, principle: null, extra: {}, notes: '' };
    S.sel = { 'ps-yellow': [], 'ps-green': [] };
    await p.evaluate(s => localStorage.setItem('runeterra-forge-v1', JSON.stringify(s)), S);
    await p.reload(); await p.waitForTimeout(400);
    const tr = await p.evaluate(() => window.ForgeDebug.traits().find(t => t.key === 'strength'));
    ok(tr && tr.die === 'd10', 'a required trait you already have (Strength d6) can take the bigger new die (d10)');
    ok(!!(await p.$('.sock-slot[data-bind="arch.assign.fa0"]')), 'and its old d6 comes back as a die to use in the same step');
    await p.evaluate(() => { const s = JSON.parse(localStorage.getItem('runeterra-forge-v1')); s.arch.assign.a0 = 'agility'; localStorage.setItem('runeterra-forge-v1', JSON.stringify(s)); });
    await p.reload(); await p.waitForTimeout(300);
    ok(/Força|Strength/.test(await p.$eval('#flow-archetype-assign', e => e.textContent)) && !(await p.$('.sock-slot[data-bind="arch.assign.fa0"]')), 'any other trait you already have still cannot be taken again');
    await p.context().close();
  }
  // Armored (p.79): three Green abilities using at least two different powers, even when one of them (Deflect) uses none.
  {
    const p = await newPage();
    await p.goto(`${BASE}/index.html`);
    const S = JSON.parse(FIXTURE);
    Object.assign(S, { step: 'archetype', maxStep: 9, tour: { on: false, seen: {} }, noRetcon: true });
    S.arch = { id: 'armored', base: null, assign: {}, principle: null, extra: {}, notes: '' };
    await p.evaluate(s => localStorage.setItem('runeterra-forge-v1', JSON.stringify(s)), S);
    await p.reload(); await p.waitForTimeout(300);
    const owned = await p.evaluate(() => window.ForgeDebug.traits().filter(t => t.kind === 'power').map(t => t.key));
    const iss = await p.evaluate(pw => { const s = JSON.parse(localStorage.getItem('runeterra-forge-v1')); s.sel['arch-green'] = [{ name: 'Deflect', ch: {} }, { name: 'Dual Offense', ch: {}, trait: pw }, { name: 'Repair', ch: {}, trait: pw }]; localStorage.setItem('runeterra-forge-v1', JSON.stringify(s)); return true; }, owned[0]);
    await p.reload(); await p.waitForTimeout(300);
    const issues = await p.evaluate(() => window.ForgeDebug.issues('archetype').join(' | '));
    ok(/pelo menos 2 poderes diferentes|at least 2 different powers/.test(issues), 'Armored Green abilities must use two different powers even with Deflect picked');
    await p.context().close();
  }
  // Special cases from the book: Divided's second Temperament and Split Form (p.95), Modular's Powerless Mode (p.96).
  {
    const p = await newPage();
    await p.goto(`${BASE}/index.html`);
    const put = async f => { await p.evaluate(src => { const s = JSON.parse(localStorage.getItem('runeterra-forge-v1')); new Function('S', src)(s); localStorage.setItem('runeterra-forge-v1', JSON.stringify(s)); }, f); await p.reload(); await p.waitForTimeout(300); };
    const S = JSON.parse(FIXTURE);
    Object.assign(S, { step: 'personality', maxStep: 9, tour: { on: false, seen: {} }, noRetcon: true });
    await p.evaluate(s => localStorage.setItem('runeterra-forge-v1', JSON.stringify(s)), S);
    await put("S.arch.id='divided'; S.arch.base='cqc'; S.arch.divMethod='controllable'; S.sel['arch-divafter']=[{name:'Split Form',ch:{}}]; S.pers.id2='arrogant';");
    const st2 = await p.evaluate(() => window.ForgeDebug.status2());
    ok(JSON.stringify(st2) === '["d10","d8","d6"]', 'Divided: a second Temperament gives the other form its own status dice');
    ok(!!(await p.$('#flow-personality-pers2')), 'Divided: the Temperament chapter offers the optional second Temperament');
    const iss = await p.evaluate(() => window.ForgeDebug.issues('archetype').join(' | '));
    ok(/duas formas|both forms/.test(iss), 'Split Form: powers and qualities must be divided between the forms');
    await put("S.arch.id='modular'; S.arch.base='cqc'; S.pers.id2='arrogant'; S.arch.powerless={on:true,a:S.ps.assign.p0};");
    ok(await p.evaluate(() => window.ForgeDebug.status2()) === null, 'the second Temperament only applies to Divided heroes');
    ok(/Modo sem Poderes|Powerless Mode/.test(await p.evaluate(() => window.ForgeDebug.issues('archetype').join(' | '))), 'Modular: a Powerless Mode needs two different powers');
    await p.context().close();
  }
  ok(errors.length === 0, 'no JavaScript errors or missing files');
  await browser.close();
  console.log(failures ? `\n${failures} failing` : '\nall passing');
  process.exit(failures ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
