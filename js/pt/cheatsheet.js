// pt-BR: resumo de regras (mesmos ids das seções em inglês).
(() => {
  'use strict';
  const effectChart = (head, rows) => `<table class="cs-table"><thead><tr><th>Resultado do dado de efeito</th><th>${head}</th></tr></thead><tbody>${rows.map(r => `<tr><td>${r[0]}</td><td>${r[1]}</td></tr>`).join('')}</tbody></table>`;
  const ic = a => `<span class="act-ic act-${a.toLowerCase()}">${{ Attack: 'ATQ', Defend: 'DEF', Overcome: 'SUP', Boost: 'FOR', Hinder: 'ATR', Recover: 'REC' }[a]}</span>`;
  const NOME = { Attack: 'Atacar', Defend: 'Defender', Overcome: 'Superar', Boost: 'Fortalecer', Hinder: 'Atrapalhar', Recover: 'Recuperar' };

  window.CHEAT_SECTIONS_PT = [
    { id: 'turn-pc', title: 'Como funciona um turno (Personagens dos Jogadores)', nav: 'Turno (PJs)', body: `
      <ol class="cs-steps">
        <li>O jogador da vez <b>descreve a ação</b> que quer fazer.</li>
        <li>A partir disso, o jogador decide qual <b>Poder</b> e qual <b>Qualidade</b> mais combinam com a ação.</li>
        <li>Se nenhum poder e/ou qualidade combinar com a ação, <b>use um d6 no lugar</b>.</li>
        <li>Decida se alguma <b>habilidade</b> se aplica e se ela vai ser usada.</li>
        <li>Decida se vai ser uma <a href="#cs-terms" data-cs-jump="cs-terms">Ação Arriscada</a>.</li>
        <li>Junte os dados de Poder e de Qualidade com o seu <b>dado de Status</b> atual. Isso forma a sua <b>reserva de dados</b>.</li>
        <li>Role os dados e aplique os resultados, incluindo quaisquer <a href="#cs-terms" data-cs-jump="cs-terms">Mods</a>. Ordene os dados pelo valor rolado: <b>Mín</b>, <b>Médio</b>, <b>Máx</b>. O <b>dado de efeito é o resultado Médio</b>, a não ser que algo diga o contrário (normalmente uma habilidade).</li>
      </ol>
      <div class="cs-callout">Reserva = <b>Poder</b> + <b>Qualidade</b> + <b>Status</b> → ordene → dado de efeito = <b>Médio</b></div>` },
    { id: 'turn-enemy', title: 'Como funciona um turno (Inimigos)', nav: 'Turno (Inimigos)', body: `
      <p>O turno dos vilões funciona igual ao dos personagens dos jogadores. A diferença principal é o <b>dado de Status</b>: o status de um vilão pode ser definido de várias formas, indicadas na ficha dele.</p>
      <p><b>Lacaios e Tenentes</b> têm um único dado e o usam em todas as rolagens. Esse dado é igual ao tamanho atual deles. Quando vários lacaios fazem a mesma ação, eles agem num único turno e rolam todos os dados de uma vez.</p>` },
    { id: 'movement', title: 'Movimento', body: `
      <p>Este é um sistema de <b>teatro da mente</b>: distância, movimento e posições não são controlados em mapas de batalha. A narrativa decide se um personagem está perto o bastante para agir. Por exemplo, numa batalha espalhada por uma cidade, um herói protegendo o prefeito na Prefeitura está longe demais para lidar com um vilão atacando a prisão do outro lado da cidade.</p>
      <p>Em vez de fazer uma ação, um personagem pode <b>se mover de um local para outro</b> dentro de uma cena. Normalmente isso impede de fazer uma ação, mas o Mestre pode permitir movimento junto com uma ação (como Atacar, Fortalecer ou Atrapalhar), dependendo de como o jogador descrever.</p>` },
    { id: 'ability-types', title: 'Tipos de Habilidade', body: `
      <p>Todas as habilidades se encaixam em três categorias. Na ficha de herói, anote o <b>Tipo</b> pela letra:</p>
      <table class="cs-table"><tbody>
        <tr><td><b>A</b> — Ação</td><td>Usada no seu turno, no lugar de uma ação básica.</td></tr>
        <tr><td><b>R</b> — Reação</td><td>Dispara em resposta a algo, mesmo fora do seu turno.</td></tr>
        <tr><td><b>I</b> — Inerente</td><td>Sempre ativa; não precisa de rolagem nem de ação.</td></tr></tbody></table>
      <p>As habilidades normalmente envolvem um ou mais tipos de ação, mostrados na coluna <b>Ícone</b>:
        ${['Attack', 'Defend', 'Overcome', 'Boost', 'Hinder', 'Recover'].map(a => `${ic(a)} ${NOME[a]}`).join(' · ')}</p>` },
    { id: 'actions', title: 'Ações', body: `
      <p>Em todas as ações, o <b>dado Médio é o dado de efeito</b>, a não ser que outro efeito (como uma habilidade) diga o contrário.</p>
      <h4>${ic('Attack')} Atacar</h4>
      <p>O dano é igual ao <b>dado de efeito</b>. Ataques sempre acertam: você não rola para acertar, só para o dano. O dano é reduzido pelas defesas inatas do personagem e pelo valor de uma ação de <b>Defender</b>.</p>
      <h4>${ic('Overcome')} Superar</h4>
      <p>Lide com uma complicação em andamento: algo na cena, uma reviravolta que surgiu ou a remoção de um Mod. O dado de efeito decide o resultado:</p>
      ${effectChart('Resultado', [['0 ou menos', 'A ação falha de forma completa e espetacular'], ['1–3', 'A ação falha, ou dá certo com uma reviravolta maior'], ['4–7', 'A ação dá certo, mas com uma reviravolta menor'], ['8–11', 'A ação dá completamente certo'], ['12+', 'A ação dá certo além das expectativas']])}
      <h4>${ic('Boost')} Fortalecer / ${ic('Hinder')} Atrapalhar</h4>
      <p>Dois lados da mesma moeda: você ajuda ou atrapalha ativamente a próxima ação de outro personagem. O resultado é um <b>Mod</b>, cujo tamanho depende do dado de efeito:</p>
      ${effectChart('Tamanho do Mod', [['0 ou menos', 'Nenhum bônus ou penalidade é criado'], ['1–3', '+1 / −1'], ['4–7', '+2 / −2'], ['8–11', '+3 / −3'], ['12+', '+4 / −4']])}
      <h4>${ic('Recover')} Recuperar</h4>
      <p>Curar a si mesmo ou a outro alvo. Diferente das outras ações, Recuperar <b>exige uma habilidade específica</b> que permita fazê-la. A habilidade explica como funciona.</p>` },
    { id: 'minions', title: 'Derrotando Lacaios e Tenentes', nav: 'Lacaios e Tenentes', body: `
      <p>Lacaios e Tenentes não têm pontos de vida; eles usam o <b>tamanho atual do dado</b>.</p>
      <p>Quando atacados, rolam o tamanho atual contra a rolagem de ataque:</p>
      <table class="cs-table"><thead><tr><th>Resultado</th><th>Lacaio</th><th>Tenente</th></tr></thead><tbody>
        <tr><td>O ataque dá certo</td><td>Derrotado na hora</td><td>O dado diminui um tamanho</td></tr>
        <tr><td>O ataque falha</td><td>O dado diminui um tamanho (mínimo d4)</td><td>Nada acontece</td></tr></tbody></table>
      <div class="cs-callout">Se um ataque causar <b>o dobro do tamanho do dado de um Tenente</b> ou mais, o Tenente é derrotado na hora: sem resistência e sem cair para d4. <i>Ex.: um Tenente d6 atingido por 12 é derrotado.</i></div>` },
    { id: 'hit-the-deck', title: 'Todo Mundo no Chão!', body: `
      <p>Uma única ação de <b>Defender</b> pode ser feita como reação <b>uma vez por rodada</b>. Fazer isso aplica uma <b>Reviravolta Menor</b>.</p>` },
    { id: 'initiative', title: 'Iniciativa', body: `
      <p>Não existe iniciativa tradicional. A cada rodada, os jogadores (e o Mestre) decidem quando querem fazer seu turno, então a ordem entre personagens, inimigos e ambiente pode mudar toda rodada.</p>
      <p><b>Cuidado:</b> "agrupar" os turnos é arriscado. Os jogadores podem agir todos de uma vez antes do inimigo, mas, depois disso, o Mestre pode ativar todos os inimigos no turno seguinte, e eles agem um atrás do outro.</p>` },
    { id: 'terms', title: 'Terminologia', body: `
      <h4>Mods</h4>
      <p>Modificadores vindos de bônus ou penalidades, normalmente criados por ações de Fortalecer ou Atrapalhar. Os Mods vão de <b>−4 a +4</b>. A não ser que um Mod seja <b>Persistente</b>, ele é removido depois de usado. Se uma rolagem tiver Mods positivos e negativos, aplique a diferença (ex.: −2 e +3 → <b>+1</b>). Todos os Mods valem para a próxima rolagem do personagem, exceto que só <b>um Mod Exclusivo positivo e um negativo</b> podem ser usados numa rolagem.</p>
      <h4>Status</h4>
      <p>O <b>VAVN</b> (Verde, Amarelo, Vermelho, Nocaute) ativo na cena. Ele é definido pelo marcador da cena ou pela Vida atual do personagem, <b>o que tiver avançado mais</b>.</p>
      <h4>Reviravoltas</h4>
      <p>Efeitos contínuos que complicam a cena, na narrativa e na mecânica. Elas vêm de: um resultado de Superar que as exija, o custo de certas ações (uma Ação Arriscada ou Todo Mundo no Chão!), o custo de algumas habilidades e o próprio Ambiente.</p>
      <h4>Ação Básica</h4>
      <p>Uma ação sem nenhuma habilidade aplicada.</p>
      <h4>Ação Arriscada</h4>
      <p>Ao fazer uma Ação Básica, você pode torná-la uma <b>Ação Arriscada</b>: use parte da narrativa em andamento para somar um efeito extra à sua ação. Fazer uma Ação Arriscada também aplica uma <b>Reviravolta Menor</b>.</p>` }
  ];
})();
