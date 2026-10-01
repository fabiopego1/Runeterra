/* GM Screen: "Tradutor de Nomes". Shows, from the app's live data, how each Sentinels Comics RPG
   element was re-skinned for Runeterra, so the GM can check any player choice against the book.
   Sentinels names stay in English (as in the rulebook); the Runeterra side is what players see. */
(() => {
  'use strict';
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const W = window, I = window.I18N;
  const ptName = en => (I.names && I.names[en]) || en;

  // Core vocabulary: fixed pairs (Sentinels term → term used in the app).
  const TERMS = [
    ['Background', 'Origem', 'Passo 1 da criação'],
    ['Power Source', 'Fonte de Poder', 'Passo 2'],
    ['Archetype', 'Caminho', 'Passo 3'],
    ['Personality', 'Personalidade', 'Passo 4'],
    ['Red Abilities', 'Supremas', 'Passo 5'],
    ['Retcon', '(não usado)', 'A Forja pula este passo do livro'],
    ['Health', 'Vida', 'Passo 6'],
    ['Finishing Touches', 'Lenda', 'Nome, visual e a ficha'],
    ['(não existe)', 'Povo', 'Passo extra, só para interpretação: humano, vastaya, yordle, espírito e outros'],
    ['(não existe)', 'Terra Natal', 'Passo extra, só para interpretação: a região de Runeterra'],
    ['Power', 'Poder', ''], ['Quality', 'Qualidade', ''], ['Principle', 'Princípio', ''],
    ['Ability', 'Habilidade', ''],
    ['Green / Yellow / Red / Out', 'Verde / Amarelo / Vermelho / Nocaute', 'Zonas de status'],
    ['GYRO', 'VAVN', 'Verde, Amarelo, Vermelho, Nocaute'],
    ['Status die', 'Dado de status', ''],
    ['Min / Mid / Max die', 'Dado Mín / Médio / Máx', ''],
    ['Effect die', 'Dado de efeito', ''],
    ['Attack / Defend / Overcome', 'Atacar / Defender / Superar', 'Ações básicas'],
    ['Boost / Hinder / Recover', 'Fortalecer / Atrapalhar / Recuperar', 'Ações básicas'],
    ['Bonus / Penalty', 'Bônus / Penalidade', 'Mods'],
    ['Minor Twist / Major Twist', 'Reviravolta Menor / Maior', ''],
    ['Risky Action', 'Ação Arriscada', ''],
    ['Hit The Deck!', 'Todo Mundo no Chão!', ''],
    ['Hero Point', 'Ponto de Inspiração', ''],
    ['Minion / Lieutenant / Villain', 'Lacaio / Tenente / Vilão', ''],
    ['Out ability', 'Habilidade de Nocaute', ''],
    ['Signature Weaponry', 'Arma Emblemática', ''],
    ['Signature Vehicle', 'Montaria Emblemática', ''],
    ['Rp quality ("high concept")', 'Qualidade Marcante', 'Conceito central do herói'],
    ['Issue / Back Issues', 'Edição / Edições Anteriores', 'Sessões de jogo'],
    ['Collection', 'Coleção', 'Arco da campanha; é quando o herói evolui'],
    ['GM', 'Mestre', '']
  ];

  const byId = (list, id) => list.find(x => x.id === id);
  const principleName = id => (W.PRINCIPLE_LORE[id] || [id])[0];

  const sections = () => {
    const S = [];
    S.push({ id: 'termos', title: 'Termos do sistema', cols: ['Sentinels', 'Runeterra', 'Nota'], rows: TERMS });
    S.push({ id: 'origens', title: 'Origens', sc: 'Backgrounds', cols: ['Sentinels', 'Runeterra', 'Resumo', 'Campeões'],
      rows: W.BACKGROUNDS.map(b => [b.sc, b.rt, b.sub, b.champs]) });
    S.push({ id: 'fontes', title: 'Fontes de Poder', sc: 'Power Sources', cols: ['Sentinels', 'Runeterra', 'Resumo', 'Campeões'],
      rows: W.POWER_SOURCES.map(p => [p.sc, p.rt, p.sub, p.champs]) });
    S.push({ id: 'caminhos', title: 'Caminhos', sc: 'Archetypes', cols: ['Sentinels', 'Runeterra', 'Papel', 'Campeões'],
      rows: W.ARCHETYPES.map(a => [a.sc, a.rt, a.role, a.champs]) });
    S.push({ id: 'transformacoes', title: 'Transições e modos', sc: 'Divided & Modular', cols: ['Sentinels', 'Runeterra', 'Onde aparece'],
      rows: [
        ...W.DIVIDED.methods.map(m => [m.name, m.rt, 'Caminho Dividido: como a forma muda']),
        ...['green', 'yellow', 'red'].flatMap(z => W.MODULAR[z].map(m => [m.name, ptName(m.name), `Modo do Caminho Modular (${{ green: 'Verde', yellow: 'Amarelo', red: 'Vermelho' }[z]})`]))
      ] });
    S.push({ id: 'temperamentos', title: 'Personalidades', sc: 'Personalities', cols: ['Sentinels', 'Runeterra', 'Dados de status', 'Campeões'],
      rows: W.PERSONALITIES.map(p => [p.sc, p.rt, p.status.join(' · '), p.champs]) });
    const cats = Object.entries(W.TRAIT_CATEGORIES);
    S.push({ id: 'categorias', title: 'Categorias de poderes e qualidades', sc: 'Power & Quality categories', cols: ['Sentinels', 'Runeterra', 'Tipo'],
      rows: cats.map(([, d]) => [d.sc, d.rt, d.kind === 'power' ? 'Poderes' : 'Qualidades']) });
    S.push({ id: 'poderes', title: 'Poderes', sc: 'Powers', cols: ['Sentinels', 'Runeterra', 'Categoria', 'Exemplo em Runeterra'],
      rows: cats.filter(([, d]) => d.kind === 'power').flatMap(([, d]) => d.items.map(i => [i[1], i[2], d.rt, i[4]])) });
    S.push({ id: 'qualidades', title: 'Qualidades', sc: 'Qualities', cols: ['Sentinels', 'Runeterra', 'Categoria', 'Exemplo em Runeterra'],
      rows: cats.filter(([, d]) => d.kind !== 'power').flatMap(([, d]) => d.items.map(i => [i[1], i[2], d.rt, i[4]])) });
    S.push({ id: 'principios', title: 'Princípios', sc: 'Principles', cols: ['Sentinels', 'Runeterra', 'Categoria', 'Leitura em Runeterra'],
      rows: W.PRINCIPLES.map(p => [p.name, principleName(p.id), `${W.T(p.cat)} (${p.cat})`, (W.PRINCIPLE_LORE[p.id] || [])[1]]) });
    const abil = Object.keys(W.ABILITIES).filter(n => I.names[n]).sort((a, b) => a.localeCompare(b));
    S.push({ id: 'habilidades', title: 'Habilidades', sc: 'Abilities', cols: ['Sentinels', 'Runeterra', 'Tipo'],
      rows: abil.map(n => [n, I.names[n], { A: 'Ação', R: 'Reação', I: 'Inerente' }[W.ABILITIES[n].type] || '']) });
    S.push({ id: 'lacaios', title: 'Formas de lacaio', sc: 'Minion Forms', cols: ['Sentinels', 'Runeterra', 'Custo'],
      rows: W.MINION_FORMS.map(f => [f[0], ptName(f[0]), f[2]]) });
    const list = (ids, get) => (ids || []).map(get).filter(Boolean).join(', ');
    S.push({ id: 'terras', title: 'Terras Natais', sc: 'só Runeterra', note: 'Não existem no Sentinels. Cada região só sugere escolhas que combinam com ela; não muda nenhuma regra.',
      cols: ['Região', 'Origens sugeridas', 'Fontes sugeridas', 'Princípios sugeridos'],
      rows: W.REGIONS.map(r => [r.name, list(r.bg, id => (byId(W.BACKGROUNDS, id) || {}).rt), list(r.ps, id => (byId(W.POWER_SOURCES, id) || {}).rt), list(r.pr, principleName)]) });
    return S;
  };

  window.GM_FLAVOUR = {
    render(root) {
      const S = sections();
      const total = S.reduce((n, s) => n + s.rows.length, 0);
      root.innerHTML = `
        <section class="gm-fl" id="tradutor">
          <div class="gm-fl-head">
            <div>
              <div class="eyebrow">Ferramenta do Mestre</div>
              <h2>Tradutor de Nomes</h2>
              <p class="muted">Como cada elemento do <em>Sentinel Comics RPG</em> foi adaptado para Runeterra. A coluna <b>Sentinels</b> mantém o nome do livro, em inglês, para você conferir as regras; a coluna <b>Runeterra</b> é o que os jogadores veem no app. As regras não mudam, só os nomes e a ambientação para o roleplay.</p>
              <p class="muted gm-fl-credit">Regras de <em>Sentinel Comics: The Roleplaying Game</em> © Greater Than Games. Runeterra e League of Legends © Riot Games.</p>
            </div>
            <input type="search" class="gm-fl-search" placeholder="Buscar em ${total} termos… (ex.: Speedster, Vazio, Retcon)" aria-label="Buscar no tradutor">
          </div>
          <nav class="gm-fl-index">${S.map(s => `<a href="#fl-${s.id}">${esc(s.title)}</a>`).join('')}</nav>
          ${S.map(s => `
            <section class="gm-fl-sec" id="fl-${s.id}">
              <h3>${esc(s.title)}${s.sc ? ` <small>${esc(s.sc)}</small>` : ''}<span class="gm-fl-count">${s.rows.length}</span></h3>
              ${s.note ? `<p class="muted">${esc(s.note)}</p>` : ''}
              <table class="gm-fl-t"><thead><tr>${s.cols.map(c => `<th>${esc(c)}</th>`).join('')}</tr></thead>
              <tbody>${s.rows.map(r => `<tr>${r.map((v, i) => `<td data-col="${esc(s.cols[i])}"${i === 0 ? ' class="fl-sc"' : i === 1 ? ' class="fl-rt"' : ''}>${esc(v)}</td>`).join('')}</tr>`).join('')}</tbody></table>
            </section>`).join('')}
          <p class="gm-fl-empty muted" hidden>Nada encontrado.</p>
        </section>`;
      // Keep the section index just under the header when the header is sticky (desktop).
      const idx = root.querySelector('.gm-fl-index');
      const place = () => {
        const h = document.querySelector('.site-header');
        const top = h && getComputedStyle(h).position === 'sticky' ? h.offsetHeight : 0;
        idx.style.top = top + 'px';
      };
      place(); addEventListener('resize', place);
      idx.addEventListener('click', ev => {
        const a = ev.target.closest('a[href^="#fl-"]');
        const sec = a && root.querySelector(a.getAttribute('href'));
        if (!sec) return;
        ev.preventDefault();
        const covered = (parseFloat(idx.style.top) || 0) + idx.offsetHeight; // where the index sits once stuck
        scrollTo({ top: scrollY + sec.getBoundingClientRect().top - covered - 12, behavior: 'smooth' });
      });
      const q = root.querySelector('.gm-fl-search');
      const norm = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
      q.addEventListener('input', () => {
        const t = norm(q.value.trim());
        let any = false;
        root.querySelectorAll('.gm-fl-sec').forEach(sec => {
          let n = 0;
          sec.querySelectorAll('tbody tr').forEach(tr => { const hit = !t || norm(tr.textContent).includes(t); tr.hidden = !hit; if (hit) n++; });
          sec.hidden = n === 0; any = any || n > 0;
        });
        root.querySelector('.gm-fl-empty').hidden = any;
      });
    }
  };
})();
