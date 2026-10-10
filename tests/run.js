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
const PNG_1PX = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');
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
    ok(await p.$$eval('[data-kind=people] .lock-mark', e => e.length) === 1 && !!(await p.$('[data-kind=people][data-id=dragonkin] .lock-mark')), 'Meio-dragão carries a lock');
    await p.click('[data-kind=people][data-id=dragonkin]'); await p.waitForTimeout(150);
    ok(!!(await p.$('.lock-form')) && (await p.evaluate(() => window.ForgeDebug.state().people)) === null, 'a locked people asks for a password before it can be chosen');
    await p.fill('.lock-form input', 'errada'); await p.click('.lock-form [type=submit]'); await p.waitForTimeout(150);
    ok(!!(await p.$('.lock-err')) && (await p.evaluate(() => window.ForgeDebug.state().people)) === null, 'a wrong password keeps the people locked');
    await p.fill('.lock-form input', 'tanquinhodashyvana'); await p.click('.lock-form [type=submit]'); await p.waitForTimeout(150);
    ok((await p.evaluate(() => window.ForgeDebug.state().people)) === 'dragonkin' && !(await p.$('.lock-form')), 'the right password unlocks and chooses Meio-dragão');
    await p.click('[data-kind=people][data-id=vastaya]');
    ok(await p.$eval('[data-kind=people].selected', e => e.dataset.id === 'vastaya') && await p.$$eval('[data-kind=people]', e => e.length) > 5, 'people chapter keeps every card on screen and highlights the chosen one');
    await next();
    ok(await p.$$eval('.region-card .fit', e => e.some(x => x.textContent.includes('Vastaya'))), 'homelands that suit the people are marked');
    const regionStep = await step();
    await next();
    ok(await step() === regionStep, 'cannot advance without picking a region');
    ok(await p.$$eval('.region-card:not(.blocked) .lock-mark', e => e.length) === 2 && await p.$$eval('.region-card.blocked .lock-mark', e => e.length) === 1, 'the Shadow Isles and the Void carry a password lock; Bandle City, closed to this people, carries its own mark');
    await p.click('[data-kind=region][data-id=shadow-isles]'); await p.waitForTimeout(150);
    ok(!!(await p.$('.lock-form')) && (await p.evaluate(() => window.ForgeDebug.state().region)) === null, 'a locked homeland asks for a password before it can be chosen');
    await p.fill('.lock-form input', 'errada'); await p.click('.lock-form [type=submit]'); await p.waitForTimeout(150);
    ok(!!(await p.$('.lock-err')) && (await p.evaluate(() => window.ForgeDebug.state().region)) === null, 'a wrong password keeps the homeland locked');
    await p.fill('.lock-form input', 'viegopelado'); await p.click('.lock-form [type=submit]'); await p.waitForTimeout(150);
    ok((await p.evaluate(() => window.ForgeDebug.state().region)) === 'shadow-isles' && !(await p.$('.lock-form')), 'the right password unlocks and chooses the homeland');
    await p.click('[data-kind=region][data-id=void]'); await p.waitForTimeout(150);
    await p.fill('.lock-form input', 'suordakaisa'); await p.click('.lock-form [type=submit]'); await p.waitForTimeout(150);
    ok((await p.evaluate(() => window.ForgeDebug.state().region)) === 'void', 'the Void has its own password');
    await p.click('[data-kind=region][data-id=bandle]'); await p.waitForTimeout(150);
    ok((await p.evaluate(() => window.ForgeDebug.state().region)) === 'void' && !!(await p.$('.block-note')) && await p.$eval('[data-kind=region][data-id=bandle]', e => e.classList.contains('blocked')), 'Bandle City cannot be chosen by a people other than the Yordles and the Spirits');
    ok(await p.evaluate(() => ['human', 'vastaya', 'dragonkin', 'troll', null].every(x => window.ForgeDebug.regionBlocked('bandle', x)) && ['yordle', 'spirit'].every(x => !window.ForgeDebug.regionBlocked('bandle', x)) && ['demacia', 'zaun', 'void'].every(r => !window.ForgeDebug.regionBlocked(r, 'human'))), 'only Yordles and Spirits may take Bandle City, and every other homeland stays open');
    await p.click('[data-kind=region][data-id=zaun]'); await next();
    ok(await p.$eval('#tour h4', e => e.textContent.includes('dados')), 'the Origin guide opens by explaining what the dice do');
    await p.click('#tour [data-act=tourNext]');
    ok(await p.$eval('#tour .tour-dots i.on', e => !!e) && await p.$eval('#tour h4', e => e.textContent.includes('Ações básicas')), 'the guide moves to its next step, the basic actions');
    ok(await p.$$eval('#tour .tour-dots i', e => e.length) === 4, 'the dice-binding steps are not shown before an Origin is chosen');
    await p.click('#tour [data-act=tourOk]');
    ok(!(await p.$('#tour')), '"Pular" closes the guide');
    await p.click('[data-kind=bg][data-id=anachronistic]'); await p.waitForTimeout(150);
    ok(await p.$eval('#tour h4', e => e.textContent.includes('Ligue os dados')), 'once the dice section opens, its guide steps appear');
    await p.click('#tour [data-act=tourOk]');
    ok(!!(await p.$('#flow-background-pick.folded')) && !(await p.$('[data-act=expand]')), 'the chosen Origin folds into a summary, with no "change" button');
    // A trait that sits on another die of the same step can be picked anyway: the two dice trade places
    await sel('bg.assign.b0', 'history');
    if (!(await p.$('.rune[data-bind="bg.assign.b1"][data-val="history"]'))) await p.click('.sock-slot[data-bind="bg.assign.b1"]');
    ok(await p.$eval('.rune[data-bind="bg.assign.b1"][data-val="history"]', e => e.classList.contains('swap') && !e.classList.contains('off') && e.getAttribute('aria-disabled') !== 'true' && /pegar/i.test(e.textContent)), 'a trait held by another die of the step offers to take it from that die');
    await p.click('.rune[data-bind="bg.assign.b1"][data-val="history"]'); await p.waitForTimeout(100);
    const taken = await p.evaluate(() => { const a = window.ForgeDebug.state().bg.assign; return [a.b0 || '', a.b1 || ''].join(); });
    ok(taken === ',history', `picking it moves the trait to the new die and frees the old one (${taken})`);
    await sel('bg.assign.b0', 'magical-lore'); await p.waitForTimeout(150);
    await p.waitForTimeout(0);
    ok(await p.$eval('#tour h4', e => e.textContent.includes('Princípio')), 'the principle guide waits for the principle section');
    await p.click('#tour [data-act=tourOk]');
    const origHover = await p.$eval('[data-act=principle][data-id=magic]', e => e.dataset.tip);
    ok(!/Reviravolta|Habilidade verde|Green ability|Durante a interpretação/i.test(origHover) && /Em Runeterra/.test(origHover), 'principle hover shows only the Runeterra text');
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
    if (await p.$('.sock-slot[data-bind="ps.assign.p2"]')) {   // both dice already bound: the two trade places
      if (!(await p.$('.rune[data-bind="ps.assign.p2"][data-val="cosmic"]'))) await p.click('.sock-slot[data-bind="ps.assign.p2"]');
      await p.click('.rune[data-bind="ps.assign.p2"][data-val="cosmic"]'); await p.waitForTimeout(100);
      const sw = await p.evaluate(() => { const a = window.ForgeDebug.state().ps.assign; return [a.p0, a.p1, a.p2].join(); });
      ok(sw === 'flight,transmutation,cosmic', `two bound dice trade places when one picks the trait of the other (${sw})`);
      await sel('ps.assign.p0', 'cosmic');
      ok(await p.evaluate(() => { const a = window.ForgeDebug.state().ps.assign; return [a.p0, a.p1, a.p2].join() === 'cosmic,transmutation,flight'; }), 'and trading again restores them');
    }
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
    ok(await p.evaluate(() => { const a = document.querySelector('#tour .tour-spot').getBoundingClientRect(), b = document.querySelector('#tour .tour').getBoundingClientRect(); return Math.abs(a.left - b.left) < 14 || b.left >= a.right; }), 'the guide popup lines up with the left edge of the highlighted item');
    await p.click('#tour [data-act=tourPrev]');
    ok(await p.$eval('#tour h4', e => e.textContent.includes('Personalidade')), 'the guide can go back a step');
    await p.click('[data-act=tourOk]');
    await p.click('[data-kind=pers][data-id=decisive]');
    await p.fill('input[data-bind="pers.qname"]', 'Dom dos Imaginais'); await p.waitForTimeout(100);
    ok(await p.$eval('[data-act=qok]', b => b.disabled), 'the Signature Quality also needs a short description');
    ok(await p.$eval('input[data-bind="pers.qdesc"]', i => i.maxLength === 100), 'the description is limited to 100 characters');
    await p.fill('input[data-bind="pers.qdesc"]', 'Sonhos que ganham forma quando ela acredita neles.'); await p.waitForTimeout(100);
    ok(!!(await p.$('#flow-personality-qname.current')) && await p.$eval('[data-act=qok]', b => !b.disabled), 'the Signature Quality waits for the Confirm button');
    ok(await p.$eval('.qname-have', e => /Convicção/.test(e.textContent) && !/Marcante/.test(e.textContent)), 'naming the Signature Quality shows a reminder of the qualities already taken');
    await p.click('[data-act=qok]'); await p.waitForTimeout(150);
    ok(!!(await p.$('#flow-personality-qname.folded')), 'Confirm keeps the name and moves on');
    await p.click('#flow-personality-pick .flow-head'); await p.waitForTimeout(150);
    await p.click('[data-kind=pers][data-id=distant]'); await p.waitForTimeout(150);
    await p.click('[data-act=qok]'); await p.waitForTimeout(150);
    await p.click('#flow-personality-out .flow-head'); await p.waitForTimeout(150);
    ok(await p.$eval('#flow-personality-out', e => /Sua habilidade de Nocaute/.test(e.textContent) && /Vermelho/.test(e.textContent) && !e.querySelector('.chip, [data-bind="pers.outTrait"]')), 'a Temperament whose Out ability has no trait still shows the Out ability, with nothing to choose');
    await p.click('#flow-personality-pick .flow-head'); await p.waitForTimeout(150);
    await p.click('[data-kind=pers][data-id=decisive]'); await p.waitForTimeout(150);
    await p.click('#flow-personality-qname .flow-head'); await p.waitForTimeout(150);
    await p.fill('input[data-bind="pers.qdesc"]', 'Sonhos que ganham forma quando ela acredita neles!'); await p.waitForTimeout(100);
    await p.click('[data-act=qok]'); await p.waitForTimeout(150);
    await next();
    await sel('pers.outTrait', 'cosmic');
    await next();
    ok(await p.$$eval('.redcat', e => e.length) > 2 && !(await p.$('.redcat .ab')), 'Ultimates list their categories closed, so the page is not a wall of abilities');
    await ab('red', 'Purification', 'Q:mental'); await ab('red', 'Summoned Allies', 'P:elemental'); await sel('sel.red.1.trait', 'cosmic');
    await next();
    await p.click('[data-act=retcon][data-id=change-principle]'); await p.waitForTimeout(100);
    const princ = await p.evaluate(() => { const s = window.ForgeDebug.state(); return [s.bg.principle, s.arch.principle]; });
    const popts = await p.$$eval('[data-act=retconPrinciple]', os => os.map(o => o.dataset.id));
    ok(await p.$$eval('[data-act=retconWhich]', e => e.length === 2 && e.every(x => /\((Origem|Caminho)/.test(x.textContent))), 'Changed Convictions names each current principle and where it came from');
    ok(popts.length > 5 && princ.every(x => !popts.includes(x)), 'Twist of Fate cannot swap in a principle you already have');
    await p.click('.step-footer [data-act=back]'); await p.waitForTimeout(100);
    ok(!!(await p.$('#flow-retcon-pick.current')), 'Back reopens the previous section of the chapter');
    await p.click('[data-act=retcon][data-id=red-up]');
    await next();
    ok(await p.$eval('.hchoice', e => /Definitivo/.test(e.textContent)), 'rolling for Health warns it cannot be undone');
    await p.click('.step-footer [data-act=back]'); await p.waitForTimeout(600);
    ok(await step() === 'Reviravolta do Destino', 'Back from the first section goes to the previous chapter');
    for (let i = 0; i < 5 && !(await p.$('input[data-bind="info.name"]')); i++) await next();   // slow machines need a beat per chapter
    ok(!(await p.$('#stage .flow-todo')) && await p.$eval('.step-footer', f => !!f), 'nothing in the Legend chapter is required');
    await p.fill('input[data-bind="info.name"]', 'Bruxaria'); await p.press('input[data-bind="info.name"]', 'Enter'); await p.waitForTimeout(100);
    ok(await p.$$eval('.grid3 .field span', l => l.slice(0, 2).map(e => e.textContent).join('|')) === 'Nome|Título', 'the Legend asks for the Name first, then the Title');
    ok(await p.$eval('.portrait-hint', e => /3:4/.test(e.textContent)), 'the Legend tells players the portrait shape (3:4) to avoid cropping');
    const gstyle = await p.$eval('.bio-guide', e => { const c = getComputedStyle(e); return { pos: c.position, oy: c.overflowY, mh: parseFloat(c.maxHeight) }; });
    ok(gstyle.pos === 'sticky' && gstyle.oy === 'auto' && gstyle.mh > 0, 'the Lore guide stays in place and scrolls on its own');
    ok(await p.$$eval('.bio-guide .gc-link', e => e.map(x => x.getAttribute('href')).join()).then(h => /lore\.html#r-zaun/.test(h) && /lore\.html\?galeria#r-zaun/.test(h)), 'the Homeland card of the Lore guide links to the nation and to its Grupos, ambientes e criaturas');
    const regionIds = await p.evaluate(() => Object.keys(window.LORE_FOR_REGION));
    const guides = await p.evaluate(ids => ids.map(id => [id, window.ForgeDebug.guideFor(id)]), regionIds);
    ok(regionIds.length >= 14 && guides.every(([id, g]) => g && g.gallery === 'lore.html?galeria#r-' + id) && guides.filter(([id, g]) => g.note).map(x => x[0]).join() === 'nazumah', 'every nation links to its gallery and only Nazumah warns that it is small');
    ok(await p.evaluate(() => fetch('js/pt/data-lore.js').then(r => r.text()).then(t => /Natação[^\]]*em d10\+ você respira debaixo/.test(t))), 'Natação: breathe underwater from d10');
    await p.fill('input[data-bind="info.alias"]', 'Kaelis Du Morne');
    await p.fill('textarea[data-bind="info.costume"]', 'Manto negro.\n\nLâmina rúnica'); await p.waitForTimeout(200);
    ok(await p.$$eval('.rail-item.locked', e => e.length) === 0, 'every chapter unlocked at the end');
    ok(!!(await p.$('[data-act=pdf]')), 'PDF export available');
    const [dl] = await Promise.all([p.waitForEvent('download', { timeout: 60000 }), p.click('[data-act=pdf]')]);
    const pdf = path.join(require('os').tmpdir(), 'forja-test.pdf');
    await dl.saveAs(pdf);
    ok(fs.statSync(pdf).size > 20000, `PDF generated (${fs.statSync(pdf).size} bytes)`);

    // Table mode: − lowers Health, the zone follows and higher zones unlock
    const zoneNow = () => p.$eval('#sheet-preview .hs-znow', e => e.className.replace(/.*z-/, ''));
    ok(await p.$eval('#sheet-preview #hs-p1 .hs-ml', e => e.innerText.includes('\n')), 'the sheet keeps the line breaks typed for Costume/Equipment');
    ok(await p.$$eval('#sheet-preview #hs-p1 .hs-name', l => l.map(e => e.textContent).join('|')) === 'Kaelis Du Morne|Bruxaria', 'the sheet shows the Name, then the Title');
    ok(await p.$eval('#sheet-preview', e => [...e.querySelectorAll('[data-tip]')].some(x => x.textContent === 'Dom dos Imaginais' && x.dataset.tip.includes('Sonhos que ganham forma'))), 'the Signature Quality hover on the sheet shows the description the player wrote');
    ok(await p.$eval('#sheet-preview #hs-p1', e => [...e.querySelectorAll('.term[data-tip]')].some(x => /Decidido/.test(x.textContent) && /Dados de status/.test(x.dataset.tip) && /die /.test(x.dataset.tip))), 'the Personality hover on the sheet shows its status dice');
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
    ok(!!(await p.$('.finish-bar a[href="ficha.html"]')), 'the Legend chapter links to the Ficha page');
    ok(await p.$$eval('#stage a[href="ficha.html"]', e => e.length) === 1 && !(await p.$('.sheet-cta')) && await p.$$eval('#stage .finish-bar [data-act=pdf], #stage .finish-bar [data-act=toSheet]', e => e.length) === 2, 'the Legend chapter has a single block with the sheet actions, without repeated buttons');
    await p.goto(`${BASE}/ficha.html`);
    await p.waitForSelector('#sp-rail');
    ok(await p.$$eval('#sheet-preview .hs-page', e => e.length) === 3, 'Ficha shows the three sheet pages');
    ok(await p.$$eval('#file-pop [role=menuitem]', e => e.map(x => x.textContent).join('|')).then(x => /Exportar campeão/.test(x) && /Importar campeão/.test(x) && /Imprimir ficha/.test(x)) && !!(await p.$('#import-file')), 'the Ficha page keeps the Arquivo menu, with the file upload');
    await p.click('#file-btn');
    ok(!(await p.$eval('#file-pop', e => e.hidden)), 'the Arquivo menu opens on the Ficha page');
    const champsBefore = await p.evaluate(() => window.ForgeDebug.champions().length);
    await p.setInputFiles('#import-file', { name: 'campeao.json', mimeType: 'application/json', buffer: Buffer.from(await p.evaluate(() => localStorage.getItem('runeterra-forge-v1'))) }); await p.waitForTimeout(500);
    ok(await p.evaluate(() => window.ForgeDebug.champions().length) === champsBefore + 1, 'uploading a champion .json from the Ficha page adds it to Campeões');
    ok(!(await p.$('#sp-rail [data-act=hpStep]')) && !(await p.$('#sp-rail .sp-hp')), 'the rail has no Health block: Health is tracked on the sheet itself');

    // Evolve tab: swap a power, an ability and a principle; undo; history on page 3
    const stored = () => p.evaluate(() => JSON.parse(localStorage.getItem('runeterra-forge-v1')));
    ok(!(await p.$('[data-act=sheetTab][data-tab=evolve]')) && !(await p.$('.finish-bar a[href*=evoluir]')), 'Evolve your champion stays hidden from players (work in progress)');
    ok(await p.$eval('#hs-p1 .hs-left', e => !!e.querySelector('.hs-portrait') && !!e.querySelector('[data-bind="play.hp.0"]')) && !!(await p.$('#hs-p1 [data-bind="play.issues.0"]')) && !!(await p.$('#hs-p1 [data-bind="play.coll.0"]')) && (await p.$eval('#hs-p1', e => /Sessões Anteriores/.test(e.textContent) && /Memórias/.test(e.textContent))), 'Inspiration points sit under the portrait; Sessões Anteriores and Memórias are on the sheet');
    await p.goto(`${BASE}/ficha.html?wip`); await p.waitForSelector('#sp-rail');
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
    ok(json.suggestedFilename() === 'Kaelis_Du_Morne.json', 'Exportar campeão downloads a .json named after the Name, not the Title');
    await p.waitForTimeout(50);
    ok(await p.$eval('#file-pop', e => e.hidden), 'menu closes after an action');

    // Major rewrite: back to the chapters with Construído, history kept
    await p.goto(`${BASE}/ficha.html?wip#evoluir`);
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
    const spirit = await p.$eval('#realms', e => ({ html: e.innerHTML, hrefs: [...e.querySelectorAll('li a')].map(a => a.getAttribute('href')) }));
    ok(['#r-ionia', '#r-freljord', '#r-noxus', '#r-bilgewater', '#r-shurima', '#andarilhos'].every(h => spirit.hrefs.includes(h)) && /Mitna Rachnun/.test(spirit.html) && /Cordeira/.test(spirit.html) && (await p.$$eval('#realms li a', e => e.every(a => !!document.querySelector(a.getAttribute('href'))))), 'the Spirit Realm lists how each region sees the afterlife, with links to those regions');
    await p.goto(`${BASE}/lore.html?galeria#r-demacia`); await p.waitForTimeout(500);
    ok(await p.$eval('#r-demacia details.rg', d => d.open) && (await p.$$eval('#r-demacia .rg-th', e => e.length)) > 20, 'lore.html?galeria#section opens that region\'s gallery');
    await p.goto(`${BASE}/lore.html`);
    // Region galleries: Grupos, Ambientes e Criaturas (only for the regions that have one), drawn when opened
    ok(!!(await p.$('#r-demacia details.rg')) && !!(await p.$('#r-void details.rg')) && !!(await p.$('#r-ixtal details.rg')) && !!(await p.$('#r-nazumah details.rg')), 'every region has an inspiration gallery, Nazumah included');
    await p.click('#r-noxus details.rg summary'); await p.waitForTimeout(200);
    ok(await p.$$eval('#r-noxus .rg-tab', e => e.map(x => x.dataset.cat).join()) === 'groups,places,creatures' && await p.$$eval('#r-noxus .rg-group h5', e => e.some(x => x.textContent === 'Trifarix e a Legião Trifariana')), 'a region gallery has Grupos, Ambientes and Criaturas, with its factions');
    await p.click('#r-noxus .rg-tab[data-cat=creatures]');
    ok(await p.$eval('#r-noxus .rg-panel[data-cat=creatures]', e => !e.hidden) && await p.$eval('#r-noxus .rg-panel[data-cat=groups]', e => e.hidden), 'the tabs switch the category');
    await p.click('#r-noxus .rg-panel[data-cat=creatures] .rg-th');
    ok(await p.$eval('dialog.rg-box', d => d.open && !!d.querySelector('img') && !!d.querySelector('figcaption b').textContent), 'a picture opens larger with its name');
    await p.keyboard.press('Escape');
    ok(await p.$eval('#r-noxus .rg-panel[data-cat=creatures] .rg-desc', e => /não sapientes/.test(e.textContent)), 'the Criaturas tab says it is reserved for non-sapient beings');
    // captions: no leftover markup, and their line breaks show (a card's poem keeps its verses on separate lines)
    const txt = await p.evaluate(() => { const bad = []; let withBreaks = null; const walk = (o, path) => { if (Array.isArray(o)) o.forEach((x, i) => walk(x, path + '.' + i)); else if (o && typeof o === 'object') { if (o.s && typeof o.f === 'string') { if (/<|>|&\w+;/.test(o.f)) bad.push(o.n); if (!withBreaks && /\n/.test(o.f) && o.f.split('\n').length > 3) withBreaks = path; } else Object.entries(o).forEach(([k, v]) => walk(v, path + '.' + k)); } }; walk(window.LORE_GALLERY, 'x'); return { bad, withBreaks }; });
    ok(!txt.bad.length, `no gallery caption has leftover markup${txt.bad.length ? ': ' + txt.bad.slice(0, 5).join(', ') : ''}`);
    await p.click('#r-bilgewater details.rg summary'); await p.waitForTimeout(200);
    await p.click('#r-bilgewater .rg-th[title="Navegadora Nativa"]'); await p.waitForTimeout(150);
    ok(await p.$eval('dialog.rg-box figcaption p', e => getComputedStyle(e).whiteSpace === 'pre-line' && e.innerText.split('\n').length >= 4 && !/<br/i.test(e.innerHTML)), 'a caption with verses shows each line on its own line');
    await p.keyboard.press('Escape');
    ok(await p.$$eval('#r-bilgewater .rg-group h5', e => e.map(x => x.textContent)).then(l => l.includes('O Submundo Sentinense') && l.includes('Vida Marinha') && !l.includes('Jogadores e trapaceiros')), 'Águas de Sentina has O Submundo Sentinense and Vida Marinha');
    ok(!!(await p.$('#andarilhos details.rg')), 'Runeterra has its own section for what belongs to no region');
    const galMissing = await p.evaluate(() => { const out = []; const walk = o => { if (Array.isArray(o)) o.forEach(walk); else if (o && typeof o === 'object') { if (o.s) out.push(o.s); Object.values(o).forEach(walk); } }; walk(window.LORE_GALLERY); return out; });
    ok(galMissing.length > 1000 && galMissing.every(k => fs.existsSync(path.join(__dirname, '..', 'assets', 'lore-gallery', k + '.webp'))), `every gallery picture exists (${galMissing.length})`);
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
    // Bancada do Mestre: how to build scenes and foes, and a shelf of ready examples
    ok(await p.$$eval('#bancada .gm-bp-card', e => e.length) >= 25 && await p.$$eval('#bancada details', e => e.length) >= 7, 'the Bancada do Mestre guides the building of scenes, minions, villains and environments, with examples');
    const foesBefore = await p.evaluate(() => JSON.parse(localStorage.getItem('runeterra-gm-table-v1')).foes.length);
    await p.click('#bp-lacaios [data-bp=foe]'); await p.waitForTimeout(200);
    await p.click('#bp-viloes [data-bp=villain]'); await p.waitForTimeout(200);
    const tableNow = await p.evaluate(() => JSON.parse(localStorage.getItem('runeterra-gm-table-v1')));
    ok(tableNow.foes.length === foesBefore + 1 && tableNow.villains.length >= 1 && tableNow.villains[tableNow.villains.length - 1].max > 30, 'an example minion and an example villain go to the table with one click');
    // the Bancada points to the Antagonist Forge, which lives on its own page
    ok(await p.$eval('#bancada #bp-montador a[href="antagonista.html"]', e => !!e), 'the Bancada links to the Antagonist Forge');
    ok(await p.evaluate(() => [...document.querySelectorAll('[data-gm-only]')].every(e => !e.hidden)), 'the "Oficina de Antagonista" header button shows once the GM Screen is unlocked');
    // the Antagonist Workshop, opened with the key the Screen kept for this tab
    await p.goto(`${BASE}/antagonista.html`); await p.waitForSelector('#stage .panel');
    ok(await p.$$eval('#nav .rail-item', e => e.length) === 10 && await p.$eval('#gate', e => e.hidden), 'the Antagonist Forge opens with ten chapters, like the Champion Forge');
    ok(await p.$eval('[data-a=next]', e => e.classList.contains('is-disabled')), 'Continue waits for the name');
    await p.fill('[data-b=name]', 'Capitã Sylva'); await p.fill('[data-b=alias]', 'a Dama da Maré'); await p.fill('[data-b=concept]', 'Contrabandista de Bilgewater');
    // picking an image must stay on this page (the Champion Forge's own file handlers must not run here)
    await p.setInputFiles('#portrait-file', { name: 'retrato.png', mimeType: 'image/png', buffer: PNG_1PX });
    await p.waitForSelector('.hs-portrait.small img');
    ok(/antagonista\.html/.test(p.url()) && await p.$eval('#stage', e => /Dê vida ao antagonista/.test(e.textContent)), 'adding a portrait keeps the Antagonist Workshop on screen');
    await p.click('[data-a=next]');
    ok(await p.$$eval('.card[data-a=ap]', e => e.length) >= 15 && await p.$eval('.card[data-v=tactician]', e => /escolha 2 de 6/.test(e.textContent) && !!e.dataset.tip && /Juntar Forças/.test(e.dataset.tip)), 'approaches are cards that show what each one does, and the hover lists its abilities');
    await p.click('.card[data-v=tactician]'); await p.click('[data-a=next]');
    // dice go into sockets, exactly as in the Champion Forge
    const pick = async (bind, val) => { if (!(await p.$(`.tray [data-bind="${bind}"]`))) await p.click(`.sock-slot[data-bind="${bind}"]`); await p.click(`.rune[data-bind="${bind}"][data-val="${val}"]`); };
    ok(await p.$$eval('.socket', e => e.length) >= 7 && await p.$eval('.tray', e => !!e), 'the dice step uses the Forge sockets, with the first empty one already open');
    for (const [i, k] of ['fire', 'water', 'cosmic', 'vitality'].entries()) await pick('P.' + i, k);
    for (const [i, k] of ['history', 'science', 'leadership'].entries()) await pick('Q.' + i, k);
    ok(await p.$eval('.sock-slot[data-bind="P.0"] .sock-name', e => !!e.dataset.tip && /Fogo|Fire/.test(e.textContent)), 'a chosen trait has its hover');
    // a trait already on another die is traded for with one click: the two dice swap places
    await p.click('.sock-slot[data-bind="P.1"]'); await p.click('.rune[data-bind="P.1"][data-val="fire"]');
    ok(await p.$eval('.sock-slot[data-bind="P.1"] .sock-name', e => /Fogo|Fire/.test(e.textContent)) && await p.$eval('.sock-slot[data-bind="P.0"] .sock-name', e => /Água|Water/.test(e.textContent)), 'clicking a trait that is on another die swaps the two dice, like in the Champion Forge');
    await p.fill('[data-b=rp]', 'Sorriso Calculado'); await p.fill('[data-b=rpDesc]', 'Sempre sorri antes de cobrar o preço.');
    ok(await p.$eval('[data-a=rpok]', e => !e.disabled) && /\d+\/100/.test(await p.$eval('.qdesc-n', e => e.textContent)), 'the interpretation quality has a name, a short description with a counter and a Confirm button, like the Signature Quality');
    await p.click('[data-a=rpok]');
    ok(await p.$eval('#stage .flow-todo', e => false).catch(() => true), 'confirming the quality clears its pending notes');
    const chip = async (id, t, val) => p.click(`.tchip[data-id="${id}"][data-t="${t}"][data-val="${val}"]`);
    const fillChips = async () => { for (let n = 0; n < 12; n++) { const t = await p.evaluate(() => { const e = [...document.querySelectorAll('.ab.picked .ab-cfg, .ab.picked.ant')].map(c => (c.querySelector('.tchip.on') ? null : c.querySelector('.tchip:not([disabled])'))).find(Boolean); return e ? { id: e.dataset.id, t: e.dataset.t, v: e.dataset.val } : null; }); if (!t) return; await chip(t.id, t.t, t.v); } };
    await p.click('[data-a=next]');
    for (const id of ['a:0', 'a:1']) await p.click(`.ab[data-id="${id}"] .ab-name`);
    await p.click('.ab[data-id="a:2"] .ab-name', { force: true });
    ok(await p.$eval('.ab[data-id="a:2"]', e => !e.classList.contains('picked') && e.classList.contains('disabled')) && await p.$$eval('.ab.picked', e => e.length) === 2, 'the forge stops at the number of abilities the approach gives, even when the blocked card is clicked');
    ok(await p.$$eval('.ab[data-id="a:0"] .tchip', e => e.some(x => /Sorriso Calculado/.test(x.textContent))), 'the named interpretation quality is one of the options of a quality ability');
    await chip('a:0', 'qualidade', 'rp-quality'); await fillChips();
    await p.click('[data-a=next]'); await p.click('.card[data-v=squad]'); await p.click('[data-a=next]');
    await p.click('.ab[data-id^="r:"] .ab-name >> nth=0'); await p.click('.ab[data-id^="r:"] .ab-name >> nth=1'); await p.click('.ab[data-id^="r:"] .ab-name >> nth=2', { force: true });
    ok(await p.$$eval('.ab.picked', e => e.length) === 2 && /2\/2/.test(await p.$eval('.count-line', e => e.textContent)), 'the archetype step does not take more abilities than the archetype gives');
    await fillChips();
    await p.click('[data-a=next]'); await p.click('.card[data-id=mook]'); await p.click('[data-a=next]'); await p.click('[data-a=next]');
    ok(await p.$$eval('.rename-card', e => e.length) >= 6, 'powers, qualities and abilities can be renamed');
    await p.fill('[data-b="traitNames.fire"]', 'Chamas de Sentina');
    await p.click('[data-a=next]'); await p.waitForSelector('#sheet-preview .hs-page');
    ok(await p.$eval('#sheet-preview', e => /Chamas de Sentina/.test(e.textContent) && /Capitã Sylva/.test(e.textContent) && /20 \+ 5 \+ 5×4/.test(e.textContent) && /45/.test(e.textContent)), 'the sheet shows the new names and Health = approach + archetype + 5 x heroes + upgrades');
    ok(await p.$$eval('#sheet-preview [data-tip]', e => e.length) > 30 && await p.$$eval('#hs-p2 .hs-ab-t .term', e => e.length) > 3 && await p.$$eval('#sheet-preview .die[data-tip]', e => e.length) > 8, 'the sheet explains terms, traits, dice and ability types on hover');
    const [dl] = await Promise.all([p.waitForEvent('download'), p.click('.export-row [data-a=export]')]);
    const json = JSON.parse(fs.readFileSync(await dl.path(), 'utf8'));
    ok(json.app === 'runeterra-antagonist' && json.name === 'Capitã Sylva' && json.traitNames.fire === 'Chamas de Sentina', 'the antagonist exports to .json');
    const [pdf] = await Promise.all([p.waitForEvent('download', { timeout: 60000 }), p.click('.export-row [data-a=pdf]')]);
    const buf = fs.readFileSync(await pdf.path());
    ok(buf.slice(0, 4).toString() === '%PDF' && buf.length > 20000, 'the antagonist sheet exports to PDF');
    await p.click('.export-row [data-a=toTable]'); await p.waitForTimeout(150);
    ok(await p.evaluate(() => JSON.parse(localStorage.getItem('runeterra-gm-table-v1')).villains.some(v => v.name === 'Capitã Sylva' && v.max === 45)), 'the antagonist goes to the table');
    // the approach's own rule: Focused wants two abilities on one power and one on another
    await p.click('#nav [data-i="1"]'); await p.click('.card[data-v=focused]'); await p.click('[data-a=next]');
    const nP = await p.$$eval('.socket .sock-slot[data-bind^="P."]', e => e.length), nQ = await p.$$eval('.socket .sock-slot[data-bind^="Q."]', e => e.length);
    for (let i = 0; i < nP; i++) await pick('P.' + i, ['fire', 'water', 'cosmic', 'vitality', 'speed'][i]);
    for (let i = 0; i < nQ; i++) await pick('Q.' + i, ['history', 'science', 'leadership', 'banter'][i]);
    await p.click('[data-a=next]');
    for (const [id, k] of [['a:1', 'fire'], ['a:3', 'fire']]) { await p.click(`.ab[data-id="${id}"] .ab-name`); await chip(id, 'poder', k); }
    await p.click('.ab[data-id="a:5"] .ab-name');
    ok(await p.$eval('.tchip[data-id="a:5"][data-val="fire"]', e => e.disabled), 'Focused: a power already used by two abilities cannot be taken by the third');
    await chip('a:5', 'poder', 'water');
    ok(!(await p.$$eval('#stage .flow-todo li', e => e.some(x => /Focado/.test(x.textContent)))), 'two abilities on one power and one on another satisfy the Focused rule');
    await p.click('[data-a=roster]');
    ok(await p.$$eval('#roster .ro-item', e => e.length) === 1, 'the antagonist is in the roster');
    // the Threat Workshop: the bank of minions and lieutenants, with pictures, folders and .json files
    await p.goto(`${BASE}/ameacas.html`); await p.waitForSelector('#stage .panel');
    ok(await p.$eval('#gate', e => e.hidden) && /Banco de ameaças/.test(await p.$eval('#stage', e => e.textContent)), 'the Threat Workshop opens behind the GM Screen');
    await p.click('[data-a=new]');
    await p.fill('[data-thcard] input[data-f=name]', 'Diabretes da Tempestade');
    await p.fill('[data-thcard] input[data-f=desc]', 'Pequenas criaturas elétricas que atacam de perto');
    await p.click('[data-thcard] .tchip[data-a=thDie][data-val="d10"]');
    ok(await p.$eval('[data-thcard] .env-warn', e => /dado alto/.test(e.textContent)), 'a minion with a d10 or d12 gets a warning about large numbers');
    await p.click('[data-thcard] .tchip[data-a=thDie][data-val="d6"]');
    await p.selectOption('[data-thadd]', 'bonus');
    await p.fill('[data-thcard] input[data-ab="0"]', 'Atacar inimigos voadores');
    ok(/\+2 em Atacar inimigos voadores/.test(await p.$eval('[data-thcard] .env-ab .ab-text', e => e.textContent)), 'a minion ability takes the book\'s usual value of 2 and the GM\'s detail');
    await p.selectOption('[data-thadd]', 'dmg');
    ok(await p.$$eval('[data-thadd]', e => e.length) === 0, 'a minion has at most two abilities');
    ok(await p.$eval('[data-thcard] .tchip[data-a=thKind][data-val=minion]', e => /derrotado na hora/.test(e.dataset.tip)), 'the type chips explain how each type takes damage');
    await p.setInputFiles('#portrait-file', { name: 'diabrete.png', mimeType: 'image/png', buffer: PNG_1PX });
    await p.waitForSelector('[data-thcard] .hs-portrait img');
    await p.click('[data-a=editDone]');
    ok(await p.$eval('.th-card .th-pic img', e => !!e.src), 'a threat can have a picture');
    await p.click('[data-a=new]');
    await p.fill('[data-thcard] input[data-f=name]', 'Cria Tentacular');
    await p.click('[data-thcard] .tchip[data-a=thKind][data-val=lieutenant]');
    ok(await p.$eval('.flow-todo', e => /pelo menos uma habilidade/.test(e.textContent)), 'a lieutenant needs at least one ability');
    await p.selectOption('[data-thadd]', 's-heal');
    ok(await p.$$eval('[data-thcard] .env-ab .tchips', e => e.length) === 0, 'an ability with no number has no value picker');
    ok(!(await p.$('.flow-todo')), 'with an ability the lieutenant is complete');
    await p.click('[data-a=editDone]');
    // folders: create, file a threat in it, filter, and export the folder as one master file
    p.once('dialog', d => d.accept('Templo')); await p.click('[data-a=folderNew]');
    ok(await p.$eval('.th-folders .active .rail-name', e => e.textContent === 'Templo'), 'a folder can be created and opens');
    await p.click('[data-a=folder][data-id=all]');
    await p.click('[data-a=edit][data-id]');
    await p.selectOption('[data-thcard] select[data-f=folder]', { label: 'Templo' }); await p.click('[data-a=editDone]');
    await p.click('.th-folders .rail-item >> nth=2 >> button');
    ok(await p.$$eval('.th-card', e => e.length) === 1, 'the folder lists only its threats');
    const [dlF] = await Promise.all([p.waitForEvent('download'), p.click('.th-bar [data-a=exportFolder]')]);
    const mf = JSON.parse(fs.readFileSync(await dlF.path(), 'utf8'));
    ok(mf.app === 'runeterra-threat-library' && mf.items.length === 1 && mf.folders.length === 1 && mf.folders[0].name === 'Templo', 'a folder exports as a master .json with its threats and the folder');
    await p.click('[data-a=folder][data-id=all]');
    ok(await p.$eval('.th-bar [data-a=exportSel]', e => e.classList.contains('is-disabled')), 'exporting a selection is disabled while nothing is checked');
    await p.check('[data-sel] >> nth=0'); await p.check('[data-sel] >> nth=1');
    const [dlS] = await Promise.all([p.waitForEvent('download'), p.click('.th-bar [data-a=exportSel]')]);
    ok(JSON.parse(fs.readFileSync(await dlS.path(), 'utf8')).items.length === 2, 'the checked threats export as one master .json');
    const [dlO] = await Promise.all([p.waitForEvent('download'), p.click('[data-a=exportOne] >> nth=0')]);
    const one = JSON.parse(fs.readFileSync(await dlO.path(), 'utf8'));
    ok(one.app === 'runeterra-threat' && one.name && one.abs, 'one threat exports as its own .json');
    // import: a single file, a master file, and a repeat that changes nothing
    await p.evaluate(() => localStorage.removeItem('runeterra-threat-lib-v1')); await p.reload(); await p.waitForSelector('#stage .panel');
    ok(await p.$$eval('.th-card', e => e.length) === 0, 'the bank starts empty after clearing');
    const fileOf = o => ({ name: 'a.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(o)) });
    await p.setInputFiles('#import-file', [fileOf(one), fileOf(mf)]);
    await p.waitForFunction(() => document.querySelectorAll('.th-card').length >= 1);
    const nAfter = await p.$$eval('.th-card', e => e.length);
    await p.setInputFiles('#import-file', [fileOf(one)]); await p.waitForTimeout(300);
    ok(nAfter >= 1 && await p.$$eval('.th-card', e => e.length) === nAfter, 'importing the same file again changes nothing');
    ok((await p.$$eval('.th-folders .rail-name', e => e.map(x => x.textContent))).includes('Templo'), 'importing a master file brings its folders');
    // rebuild the two threats the environment test needs
    await p.evaluate(() => localStorage.removeItem('runeterra-threat-lib-v1'));
    await p.evaluate(({ a, b }) => { localStorage.setItem('runeterra-threat-lib-v1', JSON.stringify({ folders: [], items: [a, b] })); }, { a: Object.assign({}, one, { app: undefined, id: 'tha1', name: 'Diabretes da Tempestade', kind: 'minion', die: 'd6', desc: 'Pequenas criaturas elétricas', tactics: '', abs: [{ t: 'bonus', v: 2, x: 'Atacar inimigos voadores' }], portrait: null, folder: '' }), b: Object.assign({}, one, { app: undefined, id: 'thb1', name: 'Cria Tentacular', kind: 'lieutenant', die: 'd8', desc: '', tactics: '', abs: [{ t: 's-heal', v: 2, x: '' }], portrait: null, folder: '' }) });
    // the Environment Workshop: traits, one die each, and the twists of each zone built from the rulebook's recipes
    await p.goto(`${BASE}/ambiente.html`); await p.waitForSelector('#stage .panel');
    ok(await p.$$eval('#nav .rail-item', e => e.length) === 7 && await p.$eval('#gate', e => e.hidden), 'the Environment Workshop opens with seven chapters');
    const forgeBefore = await p.evaluate(() => [localStorage.getItem('runeterra-forge-v1'), localStorage.getItem('runeterra-forge-roster-v1')]);
    await p.fill('[data-b=name]', 'Tempestade sobre a Cidade da Torre'); await p.fill('[data-b=scope]', 'a cidade inteira');
    await p.setInputFiles('#portrait-file', { name: 'lugar.png', mimeType: 'image/png', buffer: PNG_1PX });
    await p.waitForSelector('.hs-portrait.small img');
    ok(/ambiente\.html/.test(p.url()) && await p.$eval('#stage', e => /Dê um lugar à cena/.test(e.textContent)), 'adding an image keeps the Environment Workshop on screen');
    ok(JSON.stringify(await p.evaluate(() => [localStorage.getItem('runeterra-forge-v1'), localStorage.getItem('runeterra-forge-roster-v1')])) === JSON.stringify(forgeBefore), 'and the champion saved in the Forge, and its roster, are left untouched');
    await p.click('[data-a=plAdd]'); await p.fill('input[data-pl]', 'Ponte da Torre');
    await p.click('[data-a=plAdd]'); await p.fill('input[data-pl] >> nth=1', 'Porão do Estádio');
    ok(await p.$$eval('input[data-pl]', e => e.length) === 2, 'the concept chapter lists the places of the scene');
    await p.click('[data-a=next]');
    for (let i = 0; i < 3; i++) await p.fill(`[data-b="traits.${i}.name"]`, ['Fendas Dimensionais', 'Distorções Horrendas', 'Caos Malévolo'][i]);
    for (const [i, d] of ['d6', 'd6', 'd10'].entries()) await p.click(`.tchip[data-a=tdie][data-i="${i}"][data-val="${d}"]`);
    ok(/Mín/.test(await p.$eval('.env-dice', e => e.textContent)), 'the three trait dice give the environment its Min, Mid and Max dice');
    await p.click('[data-a=next]');
    // the threat chapter picks threats from the bank (copies), and the bank can refresh a copy
    ok(await p.$eval('.rail-item.active .rail-name', e => e.textContent.trim()) === 'Ameaças' && !(await p.$eval('[data-a=next]', e => e.classList.contains('is-disabled'))), 'the Ameaças chapter comes after the traits and can be skipped');
    const bankVal = name => p.$eval('[data-thbank]', (s, n) => [...s.options].find(o => o.textContent.startsWith(n)).value, name);
    await p.selectOption('[data-thbank]', await bankVal('Diabretes da Tempestade'));
    await p.selectOption('[data-thbank]', await bankVal('Cria Tentacular'));
    ok(await p.$$eval('[data-thcard]', e => e.length) === 2 && !(await p.$('.flow-todo')), 'two threats from the bank are copied into the environment');
    ok(await p.$eval('[data-thcard] >> nth=0 >> .env-thc', e => /Atacar inimigos voadores/.test(e.textContent) && /Salvamento/.test(e.textContent)), 'the environment shows the threat\'s little sheet');
    await p.fill('[data-b=heroes]', '4');
    await p.click('[data-thcard] >> nth=0 >> [data-a=thMesa]');
    await p.click('[data-thcard] >> nth=1 >> [data-a=thMesa]');
    const mesa = await p.evaluate(() => JSON.parse(localStorage.getItem('runeterra-gm-table-v1')).foes);
    const mM = mesa.find(f => f.name === 'Diabretes da Tempestade'), mL = mesa.find(f => f.name === 'Cria Tentacular');
    ok(mM && mM.kind === 'minion' && mM.dice.length === 4 && mL && mL.kind === 'lieutenant' && mL.dice.length === 2, 'the threats go to the GM Table: one minion per hero, half as many lieutenants');
    await p.evaluate(() => { const T = JSON.parse(localStorage.getItem('runeterra-threat-lib-v1')); T.items.find(t => t.name === 'Diabretes da Tempestade').desc = 'Versão nova no banco'; localStorage.setItem('runeterra-threat-lib-v1', JSON.stringify(T)); });
    await p.reload(); await p.waitForSelector('#stage .panel');
    ok(await p.$eval('[data-thcard] >> nth=0', e => /Atualizar do banco/.test(e.textContent)), 'when the bank has a newer version, the copy offers to refresh');
    await p.click('[data-thcard] >> nth=0 >> [data-a=thRefresh]');
    ok(await p.$eval('[data-thcard] >> nth=0 >> .env-thc', e => /Versão nova no banco/.test(e.textContent)), 'refreshing brings the bank\'s version into the environment');
    await p.click('[data-a=next]');
    const lastTw = '[data-twcard] >> nth=-1';
    const buildTw = async (z, sv, name, pick) => {
      await p.click(`[data-a=twAdd][data-z=${z}][data-s=${sv}]`);
      await p.fill(`${lastTw} >> input[data-f=name]`, name);
      if (pick) await pick(); else await p.click(`${lastTw} >> .env-opts .ab >> nth=0`);
    };
    ok(await p.$eval('[data-a=next]', e => e.classList.contains('is-disabled')), 'a zone needs its twists before Continue');
    await buildTw('green', 'minor', 'Uma Fenda se Abre');
    ok(/Role os dados do ambiente\. Atrapalhe um alvo com o dado Médio\./.test(await p.$eval(`${lastTw} >> .env-prev`, e => e.textContent)), 'a recipe from the rulebook becomes the twist\'s game text');
    // Overcome works on challenges, not on targets: it reads as a challenge and is not offered for "everyone"
    await p.click(`${lastTw} >> .tchip[data-a=fxVerb][data-val=overcome]`);
    ok(/Supere um dos desafios restantes da cena/.test(await p.$eval(`${lastTw} >> .env-prev`, e => e.textContent)), 'an environment that Overcomes overcomes a challenge, never a target');
    ok(await p.$eval(`${lastTw} >> .env-warn`, e => /exceção/.test(e.textContent) && /desafio/.test(e.textContent)), 'choosing Overcome for an environment explains that it is an exception, only for a challenge');
    await p.click(`${lastTw} >> .tchip[data-a=fxVerb][data-val=defend]`);
    ok(await p.$eval(`${lastTw} >> .env-warn`, e => /não toma dano/.test(e.textContent) && /Atrapalhar/.test(e.textContent)), 'choosing Defend for an environment explains why the rulebook says to Hinder instead');
    ok(await p.$eval(`${lastTw} >> .tchip[data-a=fxVerb][data-val=defend]`, e => /exceção/.test(e.dataset.tip)), 'the Defend chip explains the exception on hover too');
    await p.click(`${lastTw} >> .tchip[data-a=fxVerb][data-val=hinder]`);
    await buildTw('green', 'minor', 'Ataque dos Diabretes', async () => {
      await p.click(`${lastTw} >> .tchip[data-val=threat]`); await p.click(`${lastTw} >> .env-opts .ab >> nth=0`);
      ok(await p.$eval(`${lastTw} >> .tchip[data-a=fxThreat]`, e => /\+2 em Atacar inimigos voadores/.test(e.dataset.tip) && /Salvamento/.test(e.dataset.tip)), 'the threat chip shows the little sheet on hover');
      await p.click(`${lastTw} >> .tchip[data-a=fxThreat]`); });
    ok(/Adicione um lacaio: Diabretes da Tempestade \(d?6\)/.test(await p.$eval(`${lastTw} >> .env-prev`, e => e.textContent)), 'a threat effect picks the minion from the library');
    await buildTw('green', 'minor', 'Campo de Pacifismo', async () => { await p.click(`${lastTw} >> .env-opts .ab >> nth=-1`); });
    ok(await p.$eval(`${lastTw} >> .env-warn`, e => /fora das tabelas/.test(e.textContent)) && /descreva o efeito personalizado/.test(await p.$eval('.flow-todo', e => e.textContent)), 'a custom recipe warns that it is outside the book\'s tables and asks for its text');
    await p.fill(`${lastTw} >> input[data-f=ctext]`, 'Defenda quem não Atacou no último turno e Atrapalhe os demais');
    await p.click(`${lastTw} >> .tchip[data-a=fxCdice][data-val=mid]`); await p.click(`${lastTw} >> .tchip[data-a=fxCdice][data-val=min]`);
    ok(/Defenda quem não Atacou[\s\S]*Use dado Mín do ambiente/.test(await p.$eval(`${lastTw} >> .env-prev`, e => e.textContent)), 'a custom basic recipe writes the GM\'s text and the environment die it uses');
    await buildTw('green', 'major', 'Socorro, Ele Me Pegou!');
    await p.click(`${lastTw} >> .env-opts .ab >> nth=2`);
    ok(await p.evaluate(() => { const c = [...document.querySelectorAll('[data-twcard]')].pop(); return c.querySelectorAll('.tchip[data-val=overcome]').length === 0 && c.querySelectorAll('.tchip[data-val=hinder]').length === 1; }), 'Overcome is not offered for an action on all targets');
    await p.click(`${lastTw} >> .env-opts .ab >> nth=0`);
    ok(await p.$$eval('[data-a=twAdd][data-s=major]', e => e.length) === 0, 'only one major twist per zone');
    await p.click('[data-a=next]');
    await buildTw('yellow', 'minor', 'O Toque da Vidente'); await buildTw('yellow', 'minor', 'Visão Turva');
    await buildTw('yellow', 'minor', 'A Maré Sobe', async () => {
      await p.click(`${lastTw} >> .tchip[data-val=challenge]`); await p.click(`${lastTw} >> .env-opts .ab >> nth=0`);
      await p.fill(`${lastTw} >> input[data-f=ctext]`, 'Tirar os civis do porão'); await p.click(`${lastTw} >> .tchip[data-a=fxTm][data-val="3"]`); await p.click(`${lastTw} >> .tchip[data-a=fxNeed][data-val="2"]`);
      ok(/diga o que acontece/.test(await p.$eval('.flow-todo', e => e.textContent)), 'a timed challenge needs its consequence'); await p.fill(`${lastTw} >> input[data-f=tcons]`, 'o porão inunda'); });
    ok(/cronômetro \(3 caixinhas\)[\s\S]*Marque uma caixinha por rodada[\s\S]*2 sucessos em Superar[\s\S]*Se o tempo acabar: o porão inunda/.test(await p.$eval(`${lastTw} >> .env-prev`, e => e.textContent)), 'a timed challenge writes its timer, the successes needed and the consequence');
    ok(await p.$$eval(`${lastTw} >> .tchip[data-a=fxNeed]`, e => e.length) === 5, 'successes needed go from 1 to 5, the book\'s maximum');
    await buildTw('yellow', 'major', 'Portal da Tempestade', async () => { await p.click(`${lastTw} >> .env-opts .ab >> nth=4`); });
    ok(/persistente e exclusivo/.test(await p.$eval(`${lastTw} >> .env-prev`, e => e.textContent)), 'persistent and exclusive actions are written out');
    await p.click('[data-a=next]');
    await buildTw('red', 'minor', 'A Bandeira Pega Fogo'); await buildTw('red', 'minor', 'Mãos do Abismo');
    await buildTw('red', 'minor', 'A Ponte Cede', async () => {
      await p.click(`${lastTw} >> .tchip[data-val=challenge]`); await p.click(`${lastTw} >> .env-opts .ab >> nth=-1`);
      await p.fill(`${lastTw} >> input[data-f=ctext]`, 'Atravessar a ponte antes que ela caia'); await p.selectOption(`${lastTw} >> select[data-f=cwhere]`, { label: 'Ponte da Torre' }); await p.selectOption(`${lastTw} >> select[data-f=cblocks]`, { label: 'Porão do Estádio' }); await p.click(`${lastTw} >> .tchip[data-a=fxCtimer][data-val=true]`); await p.fill(`${lastTw} >> input[data-f=tcons]`, 'a ponte cai'); });
    ok(/desafio personalizado[\s\S]*cronômetro|desafio personalizado[\s\S]*caixinha[\s\S]*a ponte cai/.test(await p.$eval(`${lastTw} >> .env-prev`, e => e.textContent)), 'a custom challenge can have a timer');
    ok(/O desafio fica em Ponte da Torre\. Enquanto ninguém o superar, ninguém passa para Porão do Estádio/.test(await p.$eval(`${lastTw} >> .env-prev`, e => e.textContent)), 'a challenge says where it is and which place it blocks');
    await buildTw('red', 'major', 'Está Quase Aqui', async () => {
      await p.click(`${lastTw} >> .tchip[data-val=challenge]`); await p.click(`${lastTw} >> .env-opts .ab >> nth=0`);
      await p.fill(`${lastTw} >> input[data-f=ctext]`, 'Fendas gigantes se abrem por toda a cidade'); });
    await p.click('[data-a=next]'); await p.waitForSelector('#sheet-preview .hs-page');
    ok(await p.$eval('#sheet-preview', e => /Locais da cena/.test(e.textContent) && /Porão do Estádio/.test(e.textContent)), 'the sheet lists the places');
    ok(await p.$eval('#sheet-preview', e => /Tempestade sobre a Cidade da Torre/.test(e.textContent) && /Diabretes da Tempestade/.test(e.textContent) && /Fendas gigantes/.test(e.textContent) && /Cria Tentacular/.test(e.textContent) && /cronômetro: 3 caixinhas/.test(e.textContent)), 'the sheet lists the twists, the threat library, the timed challenge and the doomsday device');
    ok(await p.$$eval('#sheet-preview [data-tip]', e => e.length) > 20, 'the environment sheet explains terms, dice and zones on hover');
    const [dlE] = await Promise.all([p.waitForEvent('download'), p.click('.export-row [data-a=export]')]);
    const jsonE = JSON.parse(fs.readFileSync(await dlE.path(), 'utf8'));
    ok(jsonE.app === 'runeterra-environment' && jsonE.tw.green.minor.length === 3 && jsonE.tw.red.major.length === 1, 'the environment exports to .json');
    const [pdfE] = await Promise.all([p.waitForEvent('download', { timeout: 60000 }), p.click('.export-row [data-a=pdf]')]);
    ok(fs.readFileSync(await pdfE.path()).slice(0, 4).toString() === '%PDF', 'the environment sheet exports to PDF');
    await p.click('[data-a=roster]');
    ok(await p.$$eval('#roster .ro-item', e => e.length) === 1, 'the environment is in its roster');
    // an older environment that carries its threats inside gets them saved into the bank on opening
    await p.evaluate(() => { localStorage.setItem('runeterra-threat-lib-v1', JSON.stringify({ folders: [], items: [] })); const E = JSON.parse(localStorage.getItem('runeterra-environment-v1')); E.threats = [{ id: 'old1', name: 'Saqueador Atirador', kind: 'minion', die: 'd6', desc: 'À distância', tactics: '', abs: [{ t: 's-twist', v: 2, x: '' }] }]; localStorage.setItem('runeterra-environment-v1', JSON.stringify(E)); });
    await p.goto(`${BASE}/ambiente.html`); await p.waitForSelector('#stage .panel');
    ok(await p.evaluate(() => JSON.parse(localStorage.getItem('runeterra-threat-lib-v1')).items.some(t => t.id === 'old1' && t.name === 'Saqueador Atirador')), 'threats an older environment carries inside are saved into the bank');
    // the antagonist brings its own minions and lieutenants from the bank
    await p.goto(`${BASE}/antagonista.html`); await p.waitForSelector('#stage .panel');
    await p.click('#nav [data-i="9"]'); await p.waitForSelector('#crew');
    await p.selectOption('[data-crewadd]', 'old1');
    ok(await p.$eval('#crew [data-crew]', e => /Saqueador Atirador/.test(e.textContent)) && await p.$eval('#sheet-preview', e => /Lacaios e tenentes de/.test(e.textContent) && /Saqueador Atirador/.test(e.textContent)), 'the antagonist picks its minions from the bank and the sheet lists them');
    await p.click('#crew [data-a=crewMesa]');
    ok(await p.evaluate(() => JSON.parse(localStorage.getItem('runeterra-gm-table-v1')).foes.some(f => f.name === 'Saqueador Atirador' && f.dice.length === 4)), 'the antagonist\'s minions go to the table, one per champion');
    await p.context().close();
  } else console.log('skip GM Screen unlock (GM_PASSWORD not set)');

  // The Antagonist Workshop: its own page behind the GM Screen. Locked, it asks for the Screen and stays out of the header.
  {
    const q = await newPage();
    await q.goto(`${BASE}/antagonista.html`); await q.waitForSelector('#gate .sp-empty');
    ok(await q.$eval('#app', e => e.hidden) && /Somente para o Mestre/.test(await q.$eval('#gate', e => e.textContent)), 'the Antagonist Workshop asks for the GM Screen when it is locked');
    ok(!(await q.evaluate(() => !!window.GM_VDATA)), 'the villain data is not on the page while it is locked (it lives in the vault)');
    const vaultText = await (await fetch(`${BASE}/js/gm-vault.js`)).text();
    ok(!/Tático|Adaptável|Esquadrão|Sentinel/.test(vaultText) && (await fetch(`${BASE}/js/gm-villain-data.js`)).status === 404 && (await fetch(`${BASE}/js/gm-bullpen.js`)).status === 404, 'the GM material is only in the sealed vault: no plain file is published');
    await q.goto(`${BASE}/ameacas.html`); await q.waitForSelector('#gate .sp-empty');
    ok(await q.$eval('#app', e => e.hidden) && /Somente para o Mestre/.test(await q.$eval('#gate', e => e.textContent)), 'the Threat Workshop asks for the GM Screen when it is locked');
    await q.goto(`${BASE}/index.html`);
    ok(await q.$eval('[data-gm-only]', e => e.hidden), 'the Oficina de Antagonista header button is hidden while the GM Screen is locked');
    await q.context().close();
  }

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
    for (const dir of ['lore', 'cards', 'tip', 'lore-gallery']) for (const f of fs.readdirSync(path.join(__dirname, '..', 'assets', dir)).filter(f => f.endsWith('.webp'))) {
      const h = crypto.createHash('sha1').update(fs.readFileSync(path.join(__dirname, '..', 'assets', dir, f))).digest('hex');
      if (seen[h]) dupFile.push(`${seen[h]} = ${dir}/${f}`); else seen[h] = `${dir}/${f}`;
    }
    // Size budget: hover art must stay small so it shows at once; Lore pictures are sized to how big they are drawn.
    const big = [];
    for (const [dir, max] of [['cards', 30], ['tip', 30], ['lore', 90], ['lore-gallery', 50]]) for (const f of fs.readdirSync(path.join(__dirname, '..', 'assets', dir)).filter(f => f.endsWith('.webp'))) {
      const kb = fs.statSync(path.join(__dirname, '..', 'assets', dir, f)).size / 1024;
      if (kb > max) big.push(`${dir}/${f} ${Math.round(kb)} KB`);
    }
    ok(!big.length, `every picture is within its size budget${big.length ? ': ' + big.join(', ') : ''}`);
    ok(!dupSrc.length && !dupFile.length, `no picture is used twice${dupSrc.length || dupFile.length ? ': ' + dupSrc.concat(dupFile).join(', ') : ''}`);
  }
  errors.forEach(e => console.log('     ', e));
  // The header is the same on every page: Campeões, Ficha, Lore, Regras and Arquivo; only the Forja button comes and goes.
  {
    const p = await newPage();
    for (const pg of ['index', 'ficha', 'lore', 'regras', 'resumo', 'gm']) {
      await p.goto(`${BASE}/${pg}.html`); await p.waitForTimeout(300);
      const h = await p.$$eval('.site-header .hbtn', e => e.map(x => x.textContent.replace(/\s+/g, ' ').trim().replace(/[?\d]+$/, '').trim()));
      const base = ['Campeões', 'Ficha', 'Lore', 'Regras', 'Arquivo'];
      ok(base.every(x => h.includes(x)) && h.includes('Forja') === (pg !== 'index'), `${pg}: the header has the same buttons (${h.join(', ')})`);
      ok(await p.$eval('.brand-kicker', e => /Criador de Ficha/.test(e.textContent)), `${pg}: the header says Criador de Ficha`);
    }
    await p.goto(`${BASE}/lore.html`); await p.waitForTimeout(300);
    await p.click('.site-header a[href="index.html#campeoes"]'); await p.waitForTimeout(800);
    ok(await p.$eval('#roster', e => !e.hidden), 'Campeões in the header of another page opens the champion list in the Forge');
  }
  // Book p.112, Retcon: "Choose a different power or quality used in one of your abilities" may leave the Path's list.
  {
    const p = await newPage();
    await p.goto(`${BASE}/index.html`);
    const S = JSON.parse(FIXTURE);
    Object.assign(S, { step: 'retcon', maxStep: 10, tour: { on: false, seen: {} }, retcon: { type: null } });
    delete S.noRetcon;
    await p.evaluate(s => localStorage.setItem('runeterra-forge-v1', JSON.stringify(s)), S);
    await p.reload(); await p.waitForTimeout(500);
    ok(await p.$$eval('[data-act=retcon]', e => e.length) === 7, 'Twist of Fate offers all seven options of the book');
    await p.click('[data-act=retcon][data-id=change-ability]'); await p.waitForTimeout(200);
    const abs = await p.$$eval('[data-act=rcPick][data-slot=ab]', e => e.map(o => o.dataset.id));
    ok(abs.length > 2 && (await p.$$eval('[data-act=rcPick][data-slot=ab] .ab-text', e => e.every(x => x.textContent.trim().length > 20))), 'New Technique lists the abilities that use a power or quality, with their text');
    await p.click('[data-act=rcPick][data-slot=ab]'); await p.waitForTimeout(250);
    await p.click('.tchip[data-bind="retcon.trait"]:not([disabled]):not(.on)'); await p.waitForTimeout(300);
    const rc = await p.evaluate(() => window.ForgeDebug.state().retcon);
    ok(rc.type === 'change-ability' && rc.ab === abs[0] && !!rc.trait, 'New Technique stores the ability and its new power or quality');
    ok(!(await p.$('#flow-retcon-cfg .flow-todo, #flow-retcon-cfg.todo')), 'New Technique is complete once both are chosen');
    ok(!(await p.$('[data-slot=ab2]')) && !(await p.$$eval('[data-act=rcPick][data-slot=ab] .pill.red', e => e.length)), 'New Technique changes one ability and leaves the Ultimates out');
    await p.click('#flow-retcon-pick .flow-head'); await p.waitForTimeout(200);
    await p.click('[data-act=retcon][data-id=extra-red]'); await p.waitForTimeout(200);
    await p.click('.redcat-h'); await p.waitForTimeout(200);
    await p.click('[data-act=toggleAb][data-g=red-extra]:not([disabled])'); await p.waitForTimeout(300);
    const rs = await p.evaluate(() => { const x = window.ForgeDebug.state(); return [x.sel.red.length, (x.sel['red-extra'] || []).length]; });
    ok(rs[0] === 2 && rs[1] === 1, 'the extra Red ability of the Twist of Fate is picked on its own, leaving the first two Ultimates alone');
  }
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
    // shown up front: once one power is taken and only one other ability can still bring a second, that power is locked there
    await p.evaluate(() => { const s = JSON.parse(localStorage.getItem('runeterra-forge-v1')); Object.assign(s.arch, { assign: { a0: 'sig-weapon', a1: 'swimming', a2: 'intuition' }, principle: 'powerless' }); s.sel['arch-green'] = [{ name: 'Deflect', ch: {} }, { name: 'Repair', ch: {}, trait: 'sig-weapon' }, { name: 'Living Bulwark', ch: {}, trait: 'swimming' }]; localStorage.setItem('runeterra-forge-v1', JSON.stringify(s)); });
    await p.reload(); await p.waitForTimeout(300);
    await p.click('#flow-archetype-g-arch-green .flow-head'); await p.waitForTimeout(200);
    const chip = (n, k) => p.$eval(`.tchip[data-bind="sel.arch-green.${n}.trait"][data-val="${k}"]`, b => b.disabled);
    ok(await chip(2, 'sig-weapon') && await chip(1, 'swimming') && !(await chip(2, 'swimming')) && !(await chip(2, 'intuition')), 'with Deflect picked, the other two Armored abilities cannot repeat a power');
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
  // Assigning dice lists every quality (Origin) or every power (Source); the ones the chapter does not offer are locked, with why.
  {
    const p = await newPage();
    await p.goto(`${BASE}/index.html`);
    const S = JSON.parse(FIXTURE);
    Object.assign(S, { step: 'background', maxStep: 9, tour: { on: false, seen: {} }, noRetcon: true });
    S.bg = { id: 'struggling', assign: {}, principle: null };
    await p.evaluate(s => localStorage.setItem('runeterra-forge-v1', JSON.stringify(s)), S);
    await p.reload(); await p.waitForTimeout(400);
    if (!(await p.$('.socket.open'))) { await p.click('.sock-slot[data-bind="bg.assign.b0"]'); await p.waitForTimeout(200); }
    const tray = () => p.$$eval('.socket.open .rune', l => ({ n: l.length, powers: l.filter(e => e.classList.contains('k-power')).length, locked: l.filter(e => e.classList.contains('locked')).map(e => e.dataset.val), open: l.filter(e => !e.classList.contains('locked')).map(e => e.dataset.val) }));
    const t = await tray();
    ok(t.powers === 0 && t.locked.includes('medicine') && t.open.includes('banter') && !t.open.includes('medicine'), 'Origin dice list every quality (no powers) and lock the ones the Origin does not offer');
    ok(/capítulo IV|chapter IV/.test(await p.$eval('#flow-background-assign', e => e.textContent)), 'the Origin says powers come in the Source of Power chapter');
    await p.click('.socket.open .rune[data-val="medicine"]', { force: true }); await p.waitForTimeout(200);
    ok(!(await p.evaluate(() => window.ForgeDebug.state().bg.assign.b0)), 'a locked trait cannot be chosen');
    ok(/Origem não oferece|Origin does not offer/.test(await p.$eval('#tip', e => e.textContent)), 'clicking a locked trait says why');
    // Both Origin dice already bound: choosing the trait of the other one trades the two places
    await p.evaluate(() => { const s = JSON.parse(localStorage.getItem('runeterra-forge-v1')); s.step = 'background'; s.bg = { id: 'anachronistic', assign: { b0: 'magical-lore', b1: 'history' }, principle: 'magic' }; localStorage.setItem('runeterra-forge-v1', JSON.stringify(s)); });
    await p.reload(); await p.waitForTimeout(400);
    if (!(await p.$('.sock-slot[data-bind="bg.assign.b1"]'))) { await p.click('#flow-background-assign .flow-head'); await p.waitForTimeout(250); }
    await p.click('.sock-slot[data-bind="bg.assign.b1"]'); await p.waitForTimeout(120);
    ok(await p.$eval('.rune[data-bind="bg.assign.b1"][data-val="magical-lore"]', e => e.classList.contains('swap') && /trocar/i.test(e.textContent)), 'a trait on the other bound die offers "trocar com o seu d..."');
    await p.click('.rune[data-bind="bg.assign.b1"][data-val="magical-lore"]'); await p.waitForTimeout(150);
    ok(await p.evaluate(() => { const a = window.ForgeDebug.state().bg.assign; return a.b0 === 'history' && a.b1 === 'magical-lore'; }), 'picking it trades the places of the two bound dice');
    await p.evaluate(() => { const s = JSON.parse(localStorage.getItem('runeterra-forge-v1')); s.step = 'powersource'; s.bg = { id: 'anachronistic', assign: { b0: 'magical-lore', b1: 'history' }, principle: 'magic' }; s.ps.assign = {}; localStorage.setItem('runeterra-forge-v1', JSON.stringify(s)); });
    await p.reload(); await p.waitForTimeout(400);
    if (!(await p.$('.socket.open'))) { await p.click('.sock-slot[data-bind="ps.assign.p0"]'); await p.waitForTimeout(200); }
    const u = await tray();
    ok(u.n === u.powers && u.n > 30 && u.locked.length > 0 && u.open.length > 0, 'Source dice list every power (no qualities), locking the ones the Source does not offer');
    await p.context().close();
  }
  // Renamed powers, qualities and abilities keep their original name under the new one on the sheet; Legend shows what each one is.
  {
    const p = await newPage();
    await p.goto(`${BASE}/index.html`);
    const S = JSON.parse(FIXTURE);
    Object.assign(S, { step: 'finish', maxStep: 9, tour: { on: false, seen: {} }, noRetcon: true, traitNames: { cosmic: 'Luz das Estrelas' }, renames: { 'arch-green:Subdue': 'Mão de Ferro Estelar' } });
    await p.evaluate(s => localStorage.setItem('runeterra-forge-v1', JSON.stringify(s)), S);
    await p.reload(); await p.waitForTimeout(400);
    const orig = await p.$$eval('#sheet-preview .hs-orig', l => l.map(e => e.textContent));
    ok(orig.includes('Cósmico') && orig.includes('Subjugar') && orig.length === 2, 'the sheet shows the original name under a renamed power and ability');
    ok(await p.$$eval('#flow-finish-abilities .rename-card .rn-d', l => l.length > 3 && l.every(e => e.textContent.trim().length > 5)), 'Legend shows each ability\'s rules next to its name field');
    await p.context().close();
  }
  // Several champions kept in this browser: new, open, duplicate, delete; importing adds one instead of replacing.
  {
    const p = await newPage();
    p.on('dialog', d => d.accept());
    await p.goto(`${BASE}/index.html`);
    const S = JSON.parse(FIXTURE);
    Object.assign(S, { step: 'finish', maxStep: 9, tour: { on: false, seen: {} }, noRetcon: true });
    S.info.name = 'Primeiro';
    await p.evaluate(s => { localStorage.clear(); localStorage.setItem('runeterra-forge-v1', JSON.stringify(s)); }, S);
    await p.reload(); await p.waitForTimeout(400);
    const list = () => p.evaluate(() => window.ForgeDebug.champions());
    ok((await list()).length === 1 && await p.textContent('#roster-count') === '1', 'an existing champion joins the roster');
    await p.click('[data-act=roster]'); await p.waitForTimeout(200);
    await p.click('[data-act=rosterNew]'); await p.waitForTimeout(300);
    const two = await list();
    ok(two.length === 2 && two.find(c => c.open).name !== 'Primeiro' && await p.evaluate(() => window.ForgeDebug.state().step) === 'intro', 'New champion starts a fresh one and keeps the first');
    const first = two.find(c => !c.open).id;
    await p.click('[data-act=roster]'); await p.waitForTimeout(200);
    await p.click(`[data-act=rosterDup][data-id="${first}"]`); await p.waitForTimeout(200);
    ok((await list()).some(c => /cópia|copy/.test(c.name)), 'a champion can be duplicated');
    await p.click(`[data-act=rosterOpen][data-id="${first}"]`); await p.waitForTimeout(300);
    ok(await p.evaluate(() => window.ForgeDebug.state().info.name) === 'Primeiro', 'opening a champion from the list switches to it');
    await p.click('[data-act=roster]'); await p.waitForTimeout(200);
    const copy = (await list()).find(c => /cópia|copy/.test(c.name)).id;
    await p.click(`[data-act=rosterDel][data-id="${copy}"]`); await p.waitForTimeout(200);
    await p.reload(); await p.waitForTimeout(300);
    ok((await list()).length === 2 && await p.evaluate(() => window.ForgeDebug.state().info.name) === 'Primeiro', 'deleting removes it, and the roster survives a reload');
    await p.context().close();
  }
  // Legend keeps the sheet actions at hand; phones get a short header and a two-column People grid.
  {
    const p = await newPage();
    await p.goto(`${BASE}/index.html`);
    const S = JSON.parse(FIXTURE);
    Object.assign(S, { step: 'finish', maxStep: 9, tour: { on: false, seen: {} }, noRetcon: true });
    await p.evaluate(s => localStorage.setItem('runeterra-forge-v1', JSON.stringify(s)), S);
    await p.reload(); await p.waitForTimeout(400);
    await p.evaluate(() => scrollTo(0, 600)); await p.waitForTimeout(200);
    const bar = await p.$eval('.finish-bar', e => { const r = e.getBoundingClientRect(); return r.bottom <= innerHeight + 1 && r.top < innerHeight && !!e.querySelector('[data-act=pdf]'); });
    ok(bar, 'Legend: the PDF export stays on screen while filling in the details');
    await p.click('[data-act=toSheet]'); await p.waitForTimeout(900);
    ok(Math.abs(await p.$eval('#sheet-preview', e => e.getBoundingClientRect().top)) < 80, 'Legend: "Ver a ficha" jumps to the sheet');
    await p.context().close();
    const m = await newPage({ width: 390, height: 844 });
    await m.goto(`${BASE}/index.html`);
    S.step = 'people';
    await m.evaluate(s => localStorage.setItem('runeterra-forge-v1', JSON.stringify(s)), S);
    await m.reload(); await m.waitForTimeout(400);
    ok(await m.$eval('.site-header', e => e.offsetHeight) < 100, 'phone: the header takes one short band');
    ok(await m.$$eval('.cards.regions .card', l => new Set(l.slice(0, 4).map(e => Math.round(e.getBoundingClientRect().top))).size) === 2, 'phone: People cards sit two per row');
    await m.context().close();
  }
  // Going back and changing an earlier choice: a notice says what it cleared or left incomplete, and it can be undone.
  {
    const p = await newPage();
    await p.goto(`${BASE}/index.html`);
    const S = JSON.parse(FIXTURE);
    Object.assign(S, { step: 'background', maxStep: 9, tour: { on: false, seen: {} }, noRetcon: true });
    await p.evaluate(s => localStorage.setItem('runeterra-forge-v1', JSON.stringify(s)), S);
    await p.reload(); await p.waitForTimeout(400);
    ok(await p.$eval('#undo-btn', e => e.disabled), 'nothing to undo on a fresh page');
    await p.click('#flow-background-pick', { force: true }); await p.waitForTimeout(300);
    await p.click('.card[data-id="struggling"]', { force: true }); await p.waitForTimeout(500);
    const note = await p.$eval('#change-note', e => e.textContent).catch(() => '');
    ok(/dados de qualidade|quality dice/.test(note) && /princípio|principle/.test(note), 'changing the Origin says it cleared the quality dice and the principle');
    await p.click('[data-note="undo"]'); await p.waitForTimeout(400);
    const back = await p.evaluate(() => { const s = window.ForgeDebug.state(); return s.bg.id + ' ' + Object.keys(s.bg.assign).length + ' ' + s.bg.principle; });
    ok(back === 'anachronistic 2 magic', 'Undo brings the Origin, its dice and its principle back');
    await p.context().close();
  }
  // Rule fixes found by the rules test (tests/rules.js).
  {
    const p = await newPage();
    await p.goto(`${BASE}/index.html`);
    const check = (f, step) => p.evaluate(([src, fx, step]) => { const S = JSON.parse(fx); new Function('S', src)(S); return window.ForgeDebug.check(S).issues[step].join(' | '); }, [f, FIXTURE, step]);
    // Blaster p.80: already having an Elemental power (Cosmic), the required die may be skipped, so a new Fire is the one other power
    const bl = await check("S.arch={id:'blaster',base:null,assign:{a0:'fire',a1:'alertness',a2:'fitness'},principle:'destiny',extra:{},notes:''}; S.sel['arch-green']=[]; S.sel['arch-yellow']=[];", 'archetype');
    ok(!/dados restantes|remaining dice/.test(bl), 'Blaster: with an Elemental power already, one new Elemental power counts as the other power');
    const bl2 = await check("S.arch={id:'blaster',base:null,assign:{a0:'fire',a1:'cold',a2:'fitness'},principle:'destiny',extra:{},notes:''};", 'archetype');
    ok(!/dados restantes|remaining dice/.test(bl2), 'Blaster: or it is the required die and another Elemental power the other one');
    const bl3 = await check("S.arch={id:'blaster',base:null,assign:{a0:'fire',a1:'cold',a2:'agility'},principle:'destiny',extra:{},notes:''};", 'archetype');
    ok(/dados restantes|remaining dice/.test(bl3), 'Blaster: but never two other powers');
    // Major Regeneration (p.106) names Vitality: there is nothing to pick, so it must not block the Ultimates chapter
    const mr = await check("S.ps.assign.p2='vitality'; S.sel.red=[{name:'Major Regeneration',cat:'P:athletic',use:['vitality'],ch:{}},S.sel.red[0]];", 'red');
    ok(!mr, 'Major Regeneration can be taken without picking a trait');
    // Modular (p.96) only takes its base Path's dice rules: no minion forms from a Minion-Maker base
    const mm = await check("S.arch={id:'modular',base:'minion-maker',assign:{a0:'robotics',a1:'science',a2:'creativity'},principle:'destiny',extra:{},notes:''};", 'archetype');
    ok(!/lacaio|minion/.test(mm), 'Modular with a Minion-Maker base asks for no minion forms');
    // "[element/energy you have a related power for]" needs that power; Ultimates need a d6+ trait of their category
    const ei = el => check(`S.arch.id='blaster'; S.arch.assign={a0:'fire',a1:'alertness',a2:'fitness'}; S.sel['arch-yellow']=[{name:'Energy Immunity',ch:{'element/energy you have a related power for':'${el}'}},{name:'Heedless Blast',ch:{},trait:'fire'}];`, 'archetype');
    ok(/Imunidade|Energy Immunity/.test(await ei('weather')) && !/Imunidade a Energia|Energy Immunity/.test(await ei('cosmic')), 'Energy Immunity only takes an element you have a power for');
    const rc = await check("S.sel.red=[{name:'Book It',cat:'Q:physical',use:null,ch:{},trait:'history'},S.sel.red[0]];", 'red');
    ok(/Física|Physical/.test(rc), 'an Ultimate from a category you have no d6+ trait in is flagged');
    await p.context().close();
  }
  // Older saves stored element choices with the English name, e.g. "Energia Hextec Bruta (Nuclear)", or under an earlier name.
  {
    const p = await newPage();
    await p.goto(`${BASE}/index.html`);
    const S = JSON.parse(FIXTURE);
    S.sel.red = [{ name: 'Improved Immunity', cat: 'P:elemental', ch: { 'element/energy': 'Energia Hextec Bruta (Nuclear)' } }];
    S.pch = { bg: 'Energia Hextec Bruta (Nuclear)' };
    await p.evaluate(s => localStorage.setItem('runeterra-forge-v1', JSON.stringify(s)), S);
    await p.reload(); await p.waitForTimeout(300);
    const st = await p.evaluate(() => window.ForgeDebug.state());
    ok(st.sel.red[0].ch['element/energy'] === 'Rúnica' && st.pch.bg === 'Rúnica', 'old saves get the current element name');
    await p.context().close();
  }
  ok(errors.length === 0, 'no JavaScript errors or missing files');
  await browser.close();
  console.log(failures ? `\n${failures} failing` : '\nall passing');
  process.exit(failures ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
