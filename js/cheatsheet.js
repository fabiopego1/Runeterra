/* Rules cheat sheet: a slide-in reference panel available from every step. */
(() => {
  'use strict';

  const effectChart = (head, rows) => `<table class="cs-table"><thead><tr><th>Effect die result</th><th>${head}</th></tr></thead><tbody>${rows.map(r => `<tr><td>${r[0]}</td><td>${r[1]}</td></tr>`).join('')}</tbody></table>`;
  const ic = a => `<span class="act-ic act-${a.toLowerCase()}">${{ Attack: 'ATK', Defend: 'DEF', Overcome: 'OVR', Boost: 'BST', Hinder: 'HIN', Recover: 'REC' }[a]}</span>`;

  const SECTIONS = [
    { id: 'turn-pc', title: 'How a Turn Works (Player Characters)', body: `
      <ol class="cs-steps">
        <li>The player whose turn it is <b>explains the action</b> they want to take.</li>
        <li>Using this, the player decides which <b>Power</b> and <b>Quality</b> most closely relate to the action.</li>
        <li>If no power and/or quality relates to the action, <b>default to a d6</b>.</li>
        <li>Decide if an <b>ability</b> is applicable and if one will be used.</li>
        <li>Decide if it will be a <a href="#cs-terms" data-cs-jump="cs-terms">Risky Action</a>.</li>
        <li>Combine the Power and Quality dice with your current <b>Status die</b>. This forms your <b>dice pool</b>.</li>
        <li>Roll the dice and apply the results, including any <a href="#cs-terms" data-cs-jump="cs-terms">Mods</a>. Order the dice by rolled value: <b>Min</b>, <b>Mid</b>, <b>Max</b>. The <b>effect die is the Mid result</b> unless stated otherwise (usually by an ability).</li>
      </ol>
      <div class="cs-callout">Pool = <b>Power</b> + <b>Quality</b> + <b>Status</b> → sort → effect die = <b>Mid</b></div>` },
    { id: 'turn-enemy', title: 'How a Turn Works (Enemies)', body: `
      <p>Villain turns work the same way as player characters' turns. The key difference is the <b>Status die</b>: a villain's status can be decided in several ways, listed on their sheet.</p>
      <p><b>Minions and Lieutenants</b> only have a single die and use it for all rolls. This die equals their current size. When multiple minions perform the same action, they act in a single turn and roll all their dice at once.</p>` },
    { id: 'movement', title: 'Movement', body: `
      <p>This is a <b>theatre of the mind</b> system: distance, movement and locations aren't tracked on battle maps. The narrative decides whether a character is close enough to act. For example, in a battle spread across a city, a hero guarding the mayor at City Hall is too far away to deal with a villain attacking the prison across town.</p>
      <p>Instead of performing an action, a character can <b>move from one location to another</b> within a scene. This usually prevents taking an action, but the GM may allow movement combined with an action (such as an Attack, a Boost, or a Hinder), depending on how the player describes it.</p>` },
    { id: 'ability-types', title: 'Ability Types', body: `
      <p>All abilities fall into three categories. On your hero sheet, record the <b>Type</b> as the letter:</p>
      <table class="cs-table"><tbody>
        <tr><td><b>A</b> — Action</td><td>Used on your turn instead of a basic action.</td></tr>
        <tr><td><b>R</b> — Reaction</td><td>Triggers in response to something, even outside your turn.</td></tr>
        <tr><td><b>I</b> — Inherent</td><td>Always on; no roll or action needed.</td></tr></tbody></table>
      <p>Abilities usually involve one or more action types, shown in the <b>Icon</b> column:
        ${['Attack', 'Defend', 'Overcome', 'Boost', 'Hinder', 'Recover'].map(a => `${ic(a)} ${a}`).join(' · ')}</p>` },
    { id: 'actions', title: 'Actions', body: `
      <p>For all actions, the <b>Mid die is the effect die</b> unless another effect (such as an ability) says otherwise.</p>
      <h4>${ic('Attack')} Attack</h4>
      <p>Damage equals the <b>effect die</b>. Attacks always hit: you don't roll to hit, only for damage. Damage is reduced by any innate defenses a character has, and by the value of a <b>Defend</b> action.</p>
      <h4>${ic('Overcome')} Overcome</h4>
      <p>Deal with an ongoing complication: something in the scene, an introduced twist, or removing a Mod. The effect die decides the outcome:</p>
      ${effectChart('Outcome', [['0 or less', 'Action utterly, spectacularly fails'], ['1–3', 'Action fails, or succeeds with a major twist'], ['4–7', 'Action succeeds, but with a minor twist'], ['8–11', 'Action completely succeeds'], ['12+', 'Action succeeds beyond expectations']])}
      <h4>${ic('Boost')} Boost / ${ic('Hinder')} Hinder</h4>
      <p>Two sides of the same coin: you actively help or hinder another character's next action. The result is a <b>Mod</b>, sized by the effect die:</p>
      ${effectChart('Mod size', [['0 or less', 'No bonus or penalty is created'], ['1–3', '+1 / −1'], ['4–7', '+2 / −2'], ['8–11', '+3 / −3'], ['12+', '+4 / −4']])}
      <h4>${ic('Recover')} Recover</h4>
      <p>Healing yourself or another target. Unlike the other actions, Recover <b>requires a specific ability</b> that lets you take it. The ability explains how it works.</p>` },
    { id: 'minions', title: 'Defeating Minions and Lieutenants', body: `
      <p>Minions and Lieutenants don't have health pools; they use their <b>current die size</b>.</p>
      <p>When attacked, they roll their current size against the attack roll:</p>
      <table class="cs-table"><thead><tr><th>Result</th><th>Minion</th><th>Lieutenant</th></tr></thead><tbody>
        <tr><td>Attack succeeds</td><td>Defeated immediately</td><td>Die size drops by one</td></tr>
        <tr><td>Attack fails</td><td>Die size drops by one (minimum d4)</td><td>Unaffected</td></tr></tbody></table>
      <div class="cs-callout">If an attack deals <b>twice a Lieutenant's die size</b> or more, the Lieutenant is defeated outright: no save and no downgrade to d4. <i>E.g. a d6 Lieutenant hit for 12 is defeated.</i></div>` },
    { id: 'hit-the-deck', title: 'Hit The Deck!', body: `
      <p>A single <b>Defend</b> action can be performed as a reaction <b>once per round</b>. Doing so applies a <b>Minor Twist</b>.</p>` },
    { id: 'initiative', title: 'Initiative', body: `
      <p>There is no traditional initiative. Each round, the players (and the GM) decide when they want to take their turn, so the order of player characters, enemies and the environment can change every round.</p>
      <p><b>Careful:</b> "bunching up" is risky. The players can all act at once before the enemy, but after they do, the GM may activate every enemy in the following turn, so the enemies act back to back.</p>` },
    { id: 'terms', title: 'Terminology', body: `
      <h4>Mods</h4>
      <p>Modifiers from bonuses or penalties, usually created by Boost or Hinder actions. Mods range from <b>−4 to +4</b>. Unless a Mod is <b>Persistent</b>, it's removed after being used. If a roll has both positive and negative Mods, apply the difference (e.g. −2 and +3 → <b>+1</b>). All Mods apply to the character's next roll, except that only <b>one positive and one negative Exclusive Mod</b> can be used in a roll.</p>
      <h4>Status</h4>
      <p>The currently active <b>GYRO</b> (Green, Yellow, Red, Out) for the scene. It's set by either the scene tracker or the character's current health, <b>whichever has progressed further</b>.</p>
      <h4>Twists</h4>
      <p>Ongoing effects that complicate the scene, narratively and mechanically. They come from: an Overcome result that requires them, the cost of certain actions (a Risky Action or Hit The Deck!), the cost of some abilities, and the Environment itself.</p>
      <h4>Basic Action</h4>
      <p>An action without an ability applied to it.</p>
      <h4>Risky Action</h4>
      <p>When performing a Basic Action, you may make it a <b>Risky Action</b> instead: use part of the ongoing narrative to add an extra effect to your action. Taking a Risky Action also applies a <b>Minor Twist</b>.</p>` }
  ];

  const panel = document.createElement('aside');
  panel.id = 'cheatsheet';
  panel.setAttribute('aria-label', 'Rules cheat sheet');
  panel.setAttribute('aria-hidden', 'true');
  panel.innerHTML = `
    <div class="cs-head">
      <div><div class="eyebrow">Quick reference</div><h2>Rules Cheat Sheet</h2></div>
      <button class="btn small" data-cs-close aria-label="Close cheat sheet">✕</button>
    </div>
    <input type="search" class="cs-search" placeholder="Search rules… (e.g. minion, twist, mod)" aria-label="Search rules">
    <nav class="cs-index">${SECTIONS.map(s => `<a href="#cs-${s.id}" data-cs-jump="cs-${s.id}">${s.title.replace(/ \(.*\)/, m => m.includes('Player') ? ' (PCs)' : ' (Enemies)')}</a>`).join('')}</nav>
    <div class="cs-body">${SECTIONS.map(s => `<section class="cs-sec" id="cs-${s.id}"><h3>${s.title}</h3>${s.body}</section>`).join('')}
      <p class="cs-empty" hidden>No rules match your search.</p>
    </div>`;
  const backdrop = document.createElement('div');
  backdrop.className = 'cs-backdrop';
  document.body.append(backdrop, panel);

  const search = panel.querySelector('.cs-search');
  const open = () => {
    panel.classList.add('open'); backdrop.classList.add('open');
    panel.setAttribute('aria-hidden', 'false');
    setTimeout(() => search.focus(), 50);
  };
  const close = () => { panel.classList.remove('open'); backdrop.classList.remove('open'); panel.setAttribute('aria-hidden', 'true'); };
  window.openCheatSheet = open;

  document.addEventListener('click', ev => {
    if (ev.target.closest('[data-act="rules"]')) { open(); return; }
    if (ev.target.closest('[data-cs-close]') || ev.target === backdrop) { close(); return; }
    const j = ev.target.closest('[data-cs-jump]');
    if (j && panel.contains(j)) {
      ev.preventDefault();
      const t = panel.querySelector('#' + j.dataset.csJump);
      if (t) { t.hidden = false; t.scrollIntoView({ behavior: 'smooth', block: 'start' }); t.classList.add('flash'); setTimeout(() => t.classList.remove('flash'), 900); }
    }
  });
  document.addEventListener('keydown', ev => {
    if (ev.key === 'Escape' && panel.classList.contains('open')) close();
    const typing = /^(INPUT|TEXTAREA|SELECT)$/.test((ev.target.tagName || ''));
    if (ev.key === '?' && !typing) { ev.preventDefault(); panel.classList.contains('open') ? close() : open(); }
  });
  search.addEventListener('input', () => {
    const q = search.value.trim().toLowerCase();
    let any = false;
    panel.querySelectorAll('.cs-sec').forEach(sec => {
      const hit = !q || sec.textContent.toLowerCase().includes(q);
      sec.hidden = !hit; any = any || hit;
    });
    panel.querySelector('.cs-empty').hidden = any;
  });
})();
