// pt-BR: regras para a mesa (página regras.html), em três partes lidas em ordem:
// O básico → Na cena de ação → Entre as cenas. Cada seção tem id (âncora #cs-<id>), grupo, título e texto.
(() => {
  'use strict';
  const effectChart = (head, rows) => `<table class="cs-table"><thead><tr><th>Resultado do dado de efeito</th><th>${head}</th></tr></thead><tbody>${rows.map(r => `<tr><td>${r[0]}</td><td>${r[1]}</td></tr>`).join('')}</tbody></table>`;
  const ic = a => `<span class="act-ic act-${a.toLowerCase()}">${{ Attack: 'ATQ', Defend: 'DEF', Overcome: 'SUP', Boost: 'FOR', Hinder: 'ATR', Recover: 'REC' }[a]}</span>`;
  const NOME = { Attack: 'Atacar', Defend: 'Defender', Overcome: 'Superar', Boost: 'Fortalecer', Hinder: 'Atrapalhar', Recover: 'Recuperar' };
  const see = (id, txt) => `<a href="#cs-${id}">${txt}</a>`;
  const BASICO = 'O básico', ACAO = 'Na cena de ação', ENTRE = 'Entre as cenas', MESTRE = 'Para o Mestre';
  const track = (g, y, r) => `<span class="cs-track">${'<i class="g"></i>'.repeat(g)}${'<i class="y"></i>'.repeat(y)}${'<i class="r"></i>'.repeat(r)}</span>`;
  const roll = (dice, note) => `<span class="cs-roll">${dice.map(([d, n]) => `<span class="die ${d}">${d.slice(1)}</span><b>${n}</b>`).join('')}</span>${note ? ` <span class="cs-roll-note">${note}</span>` : ''}`;

  window.CHEAT_GROUPS_PT = [
    { name: BASICO, lede: 'Como o jogo se organiza, como os dados funcionam e o que acontece quando você se machuca.' },
    { name: ACAO, lede: 'Turnos, ações, mods e reviravoltas: tudo o que você usa durante uma luta, perseguição ou resgate.' },
    { name: ENTRE, lede: 'Recuperação, conversas, pontos de herói e coleções: o que acontece entre uma cena de ação e outra.' },
    { name: MESTRE, lede: 'Como montar e conduzir uma cena de ação: marcador, ambiente, desafios, lacaios, tenentes e vilões. Termina com um exemplo de jogo completo.' }
  ];

  window.CHEAT_SECTIONS_PT = [
    // ------------------------------------------------------------------ I · O básico
    { id: 'structure', group: BASICO, title: 'Como o jogo se organiza', nav: 'Estrutura do jogo', body: `
      <p>O jogo usa a linguagem das histórias em quadrinhos para organizar a aventura:</p>
      <table class="cs-table"><tbody>
        <tr><td>Turno</td><td>Um a três quadros de ação de um personagem numa cena de ação.</td></tr>
        <tr><td>Cena</td><td>Um trecho contínuo da história. Pode ser de <b>ação</b> (lutas, perseguições, resgates), ${see('social', 'social')} (conversas e drama) ou de ${see('montage', 'montagem')} (viagem, descanso, investigação).</td></tr>
        <tr><td>Edição</td><td>Uma sessão de jogo, de 2 a 4 horas, que resolve uma aventura. No fim, o grupo dá um título a ela, e cada jogador o anota em <b>Edições Anteriores</b>.</td></tr>
        <tr><td>Coleção</td><td>Um volume com as edições de uma mesma história (normalmente seis). Veja ${see('collections', 'Coleções')}.</td></tr></tbody></table>` },

    { id: 'dice', group: BASICO, title: 'Dados e a reserva', nav: 'Dados e reserva', body: `
      <p>Toda rolagem usa <b>exatamente três dados</b>: o de um <b>Poder</b>, o de uma <b>Qualidade</b> e o seu <b>dado de status</b>. Se nenhum poder ou qualidade combina com o que você quer fazer, use um <b>d6</b> no lugar (pergunte antes ao Mestre: ele pode ter uma ideia com o que você já tem).</p>
      <p>Depois de rolar, ordene os dados pelo número que saiu: o menor é o <b>Mín</b>, o do meio é o <b>Médio</b> e o maior é o <b>Máx</b>. O <b>dado de efeito</b>, que dá o resultado, é o Médio, a não ser que uma habilidade diga outra coisa.</p>
      <ul class="cs-list">
        <li><b>Empates:</b> se dois ou três dados empatarem, você escolhe a ordem entre eles.</li>
        <li><b>Depois de rolar, o tamanho não importa:</b> só conta o número que saiu. Um d12 que tirou 2 pode ser o seu Mín.</li>
        <li><b>À vista de todos:</b> role sempre na mesa, inclusive o Mestre.</li></ul>
      <div class="cs-callout">Reserva = <b>Poder</b> + <b>Qualidade</b> + <b>Status</b> → ordene → dado de efeito = <b>Médio</b></div>` },

    { id: 'zones', group: BASICO, title: 'Vida, zonas e Nocaute', nav: 'Zonas e Nocaute', body: `
      <p>Sua <b>Vida</b> mede ferimentos, cansaço e abalo. Ela atravessa quatro zonas: <b>Verde</b>, <b>Amarela</b>, <b>Vermelha</b> e <b>Nocaute</b> (o VAVN). Cada zona te dá um dado de status diferente e libera novas habilidades.</p>
      <h4>O marcador de cena</h4>
      <p>A maioria das cenas de ação tem um <b>marcador de cena</b>: uma fileira de espaços verdes, amarelos e vermelhos que vão sendo marcados conforme a tensão sobe. Ele tem um turno próprio, que é quando o ambiente age. Quando o último espaço é marcado, algo ruim acontece e a cena muda.</p>
      <div class="cs-callout">Seu status é o que estiver <b>mais perto do Nocaute</b>: a zona da sua Vida ou a do marcador de cena. Ex.: você está sem nenhum ferimento, mas a cena está na Amarela; seu status é Amarelo.</div>
      <h4>Habilidades por zona</h4>
      <ul class="cs-list">
        <li>Na <b>Verde</b>, você usa as habilidades Verdes.</li>
        <li>Na <b>Amarela</b>, as Verdes e as Amarelas.</li>
        <li>Na <b>Vermelha</b>, todas.</li>
        <li>Pagando uma ${see('twists', 'reviravolta menor')}, você pode usar uma habilidade da zona seguinte à sua.</li></ul>
      <h4>Nocaute</h4>
      <p>Chegar a 0 de Vida não é morrer: significa que você não consegue mais agir de forma significativa nesta cena. Talvez tenha desmaiado, ficado preso ou sido arremessado para longe; quem decide é você. Mesmo no Nocaute você ainda tem uma habilidade, a sua <b>habilidade de Nocaute</b>. Com cuidados ou um resgate numa ${see('montage', 'cena de montagem')}, você volta na cena seguinte.</p>` },

    { id: 'ability-types', group: BASICO, title: 'Tipos de habilidade', body: `
      <p>Toda habilidade tem um tipo, marcado na ficha pela letra:</p>
      <table class="cs-table"><tbody>
        <tr><td><b>A</b> (Ação)</td><td>Usada no seu turno, no lugar de uma ação básica. Só uma por turno.</td></tr>
        <tr><td><b>R</b> (Reação)</td><td>Dispara em resposta a algo, mesmo fora do seu turno. Veja ${see('reactions', 'Reações')}.</td></tr>
        <tr><td><b>I</b> (Inerente)</td><td>Sempre ativa; não precisa de rolagem nem de ação.</td></tr></tbody></table>
      <p>As habilidades normalmente envolvem um ou mais tipos de ação, mostrados na coluna <b>Ícone</b>:
        ${['Attack', 'Defend', 'Overcome', 'Boost', 'Hinder', 'Recover'].map(a => `${ic(a)} ${NOME[a]}`).join(' · ')}</p>` },

    // ------------------------------------------------------------------ II · Na cena de ação
    { id: 'turn-pc', group: ACAO, title: 'Seu turno, passo a passo', nav: 'Seu turno', body: `
      <ol class="cs-steps">
        <li><b>Descreva o que quer fazer</b> e qual é o seu objetivo: ferir o vilão, distraí-lo, tirá-lo de perto do painel de controle?</li>
        <li>Escolha a <b>ação</b> que combina com esse objetivo (Atacar, Defender, Superar, Fortalecer, Atrapalhar).</li>
        <li>Decida se vai usar uma <b>habilidade</b> ou fazer uma ${see('basic-risky', 'ação básica')} (que pode ser uma ${see('basic-risky', 'Ação Arriscada')}).</li>
        <li>Monte a ${see('dice', 'reserva')}: o <b>Poder</b> e a <b>Qualidade</b> que mais combinam com a ação, mais o seu <b>dado de status</b>. Se a habilidade pede um poder ou qualidade específico, use esse.</li>
        <li>Role, ordene os dados e aplique o resultado, incluindo os ${see('mods', 'Mods')}.</li>
        <li><b>Passe a vez:</b> escolha quem joga em seguida (veja ${see('turn-order', 'Ordem dos turnos')}).</li>
      </ol>` },

    { id: 'turn-order', group: ACAO, title: 'Ordem dos turnos', body: `
      <p>Não existe iniciativa fixa. O Mestre apresenta a cena e decide quem começa. Depois disso:</p>
      <ul class="cs-list">
        <li>Quem termina o turno <b>escolhe quem joga em seguida</b>: qualquer herói, vilão ou o ambiente que ainda não agiu nesta rodada. Avise antes ("quer ir depois de mim?") para a pessoa já ir pensando; você pode mudar de ideia até passar a vez.</li>
        <li>Uma <b>rodada</b> termina quando todos os heróis, vilões e o ambiente agiram uma vez.</li>
        <li>Quem joga por último escolhe quem abre a próxima rodada, <b>menos a si mesmo</b>: ninguém joga dois turnos seguidos.</li></ul>
      <div class="cs-callout"><b>Cuidado:</b> se todos os heróis jogarem de uma vez antes dos inimigos, o último herói passa a vez a um inimigo, e os inimigos podem terminar esta rodada e abrir a próxima, agindo várias vezes em sequência.</div>` },

    { id: 'movement', group: ACAO, title: 'Movimento', body: `
      <p>O jogo é de <b>teatro da mente</b>: distância e posições não são marcadas num mapa. A narrativa decide se um personagem está perto o bastante para agir. Numa batalha espalhada por Piltover, quem protege o conselheiro no Salão do Conselho está longe demais para lidar com o vilão que ataca as docas.</p>
      <p>Em vez de uma ação, você pode <b>se mover de um local para outro</b> dentro da cena. Normalmente isso ocupa o turno, mas o Mestre pode permitir Fortalecer, Atrapalhar ou Defender no caminho, se você descrever como. Poderes de velocidade, voo ou conhecer um atalho justificam chegar rápido.</p>` },

    { id: 'actions', group: ACAO, title: 'Ações', body: `
      <p>Em todas as ações, o <b>dado Médio é o dado de efeito</b>, a não ser que uma habilidade diga outra coisa.</p>
      <h4>${ic('Attack')} Atacar</h4>
      <p>O dano é igual ao <b>dado de efeito</b>. Ataques sempre acertam: você não rola para acertar, só para o dano. O dano é reduzido pelas defesas do alvo e por uma ação de Defender. Qualquer personagem ou objeto com Vida (ou com dado de lacaio) pode ser atacado; para quebrar algo sem Vida, como uma porta de aço, use Superar.</p>
      <h4>${ic('Defend')} Defender</h4>
      <p>Não existe rolagem de defesa automática: quem é atacado já está tentando se proteger. Use Defender quando quiser se concentrar em se proteger, ou em proteger alguém.</p>
      <ul class="cs-list">
        <li>Role e anote o dado de efeito.</li>
        <li>O <b>próximo dano</b> que você (ou quem você protege) sofreria antes do seu próximo turno é reduzido por esse valor.</li>
        <li>Vale só para o próximo Ataque. Se ninguém atacar até o seu próximo turno, o efeito se perde.</li>
        <li>Dois Defender não se somam: use o melhor.</li></ul>
      <h4>${ic('Overcome')} Superar</h4>
      <p>Lide com um obstáculo em que falhar tenha risco: pular num carro em fuga, decifrar arquivos antes da bomba, convencer um aliado a ajudar, remover um Mod. O dado de efeito decide o resultado:</p>
      ${effectChart('Resultado', [['0 ou menos', 'A ação falha de forma completa e espetacular'], ['1–3', 'A ação falha, ou dá certo com uma reviravolta maior'], ['4–7', 'A ação dá certo, mas com uma reviravolta menor'], ['8–11', 'A ação dá completamente certo'], ['12+', 'A ação dá certo além das expectativas']])}
      <ul class="cs-list">
        <li>Diante de uma reviravolta, você <b>sempre pode escolher falhar</b> em vez de aceitá-la.</li>
        <li><b>12 ou mais:</b> além do que queria, você ganha um extra, como remover uma reviravolta menor anterior. Se nada melhor surgir, vale um bônus de +2 ou recuperar Vida igual ao dado Mín.</li></ul>
      <h4>${ic('Boost')} Fortalecer / ${ic('Hinder')} Atrapalhar</h4>
      <p>Dois lados da mesma moeda: você ajuda um aliado (ou a si mesmo) ou atrapalha um oponente. O resultado é um ${see('mods', 'Mod')}, cujo tamanho depende do dado de efeito. Dê um nome a ele, como "Rifle Hextec +2" ou "Olha o degrau −3".</p>
      ${effectChart('Tamanho do Mod', [['0 ou menos', 'Nenhum bônus ou penalidade é criado'], ['1–3', '+1 / −1'], ['4–7', '+2 / −2'], ['8–11', '+3 / −3'], ['12+', '+4 / −4']])}
      <h4>${ic('Recover')} Recuperar</h4>
      <p>Curar a si mesmo ou outro alvo durante uma cena de ação. Diferente das outras ações, Recuperar <b>exige uma habilidade</b> que permita fazê-la; a habilidade explica como funciona. Fora disso, você recupera Vida nas ${see('montage', 'cenas de montagem')}.</p>` },

    { id: 'basic-risky', group: ACAO, title: 'Ação básica e Ação Arriscada', nav: 'Ação Arriscada', body: `
      <p>Uma <b>ação básica</b> é uma ação sem nenhuma habilidade. Tudo bem: nem sempre existe uma habilidade certa para o momento.</p>
      <p>Numa ação básica, você pode fazer uma <b>Ação Arriscada</b>: soma um efeito extra e paga uma ${see('twists', 'reviravolta menor')}. Alguns exemplos:</p>
      <ul class="cs-list">
        <li>O Ataque atinge um alvo a mais com o mesmo dado.</li>
        <li>O Ataque usa o dado Máx.</li>
        <li>O Ataque também Atrapalha o alvo com o dado Mín (quebrando a arma dele, por exemplo).</li>
        <li>Um Superar também causa dano a alguém com o dado Mín.</li>
        <li>Um Atrapalhar também afasta o alvo, que vai ter trabalho para voltar.</li>
        <li>Um Defender também Fortalece um aliado com o dado Mín.</li></ul>
      <p>Só vale para ações básicas, improvisadas na hora. O que você treinou é uma habilidade.</p>` },

    { id: 'reactions', group: ACAO, title: 'Reações e Todo Mundo no Chão!', nav: 'Reações', body: `
      <p>Reações acontecem em resposta a algo, mesmo fora do seu turno.</p>
      <ul class="cs-list">
        <li><b>Uma por rodada:</b> não importa quantas habilidades de Reação você tenha, só pode fazer uma reação por rodada. Isso reinicia no começo do seu turno.</li>
        <li><b>Um só dado:</b> a maioria das reações rola um único dado (de um poder, de uma qualidade ou de status), não a reserva de três.</li></ul>
      <h4>Todo Mundo no Chão!</h4>
      <p>Quando um Ataque parece sério demais, você pode fazer uma ação básica de <b>Defender</b> fora do seu turno, como reação, <b>uma vez por rodada</b>, pagando uma ${see('twists', 'reviravolta menor')}. Ela só protege você mesmo.</p>` },

    { id: 'mods', group: ACAO, title: 'Mods: bônus e penalidades', nav: 'Mods', body: `
      <p>Mods são bônus (de Fortalecer) e penalidades (de Atrapalhar) que vão de <b>−4 a +4</b> e se somam ao dado de efeito. Anote cada um num cartão, com o nome, na frente de quem ele afeta. Quem cria o mod decide quem pode usá-lo, se fizer sentido na história.</p>
      <h4>Usando mods</h4>
      <ul class="cs-list">
        <li>Declare o mod <b>antes</b> de rolar.</li>
        <li>O mod não muda quem é o Mín, o Médio ou o Máx: isso é decidido antes.</li>
        <li>Um mod altera <b>um só dado de efeito</b>. Se esse dado atinge vários alvos, o valor modificado vale para todos. No bônus, quem usa escolhe o dado; na penalidade, quem a criou escolhe.</li>
        <li>A <b>penalidade</b> vale na próxima rolagem do alvo. O <b>bônus</b> pode ser usado na próxima rolagem ou guardado para depois, se fizer sentido na história.</li>
        <li>Com mods positivos e negativos na mesma rolagem, aplique a diferença (ex.: −2 e +3 viram <b>+1</b>).</li></ul>
      <h4>Quanto tempo duram</h4>
      <ul class="cs-list">
        <li>Normalmente, o mod some depois de um uso. Aceitando uma reviravolta menor ao criá-lo, ele dura dois usos.</li>
        <li><b>Persistente:</b> dura até algo removê-lo ou, no máximo, até o fim da cena.</li>
        <li><b>Exclusivo:</b> só um bônus exclusivo e uma penalidade exclusiva por rolagem. Os bônus de ${see('hero-points', 'pontos de herói')} são exclusivos.</li></ul>
      <h4>Removendo um mod</h4>
      <ul class="cs-list">
        <li>Com uma ação de <b>Superar</b>. Alguns mods, como "Civis presos −3", exigem mais de uma.</li>
        <li>Criando um mod oposto: um +2 contra "Amarrado −3" deixa "Amarrado −1". Se passar do valor, a sobra se perde.</li></ul>
      <p>Mesmo depois de gasto, o que o mod representa continua na história: o bastão ainda está na sua mão.</p>` },

    { id: 'twists', group: ACAO, title: 'Reviravoltas', body: `
      <p>Reviravoltas são complicações e consequências inesperadas que mudam a história. Elas vêm de três lugares:</p>
      <ul class="cs-list">
        <li>um <b>Superar</b> que deu certo com custo (1–3: maior; 4–7: menor);</li>
        <li>o preço de certas escolhas: ${see('basic-risky', 'Ação Arriscada')}, ${see('reactions', 'Todo Mundo no Chão!')}, usar uma habilidade da zona seguinte e algumas habilidades;</li>
        <li>o <b>ambiente</b>, a critério do Mestre.</li></ul>
      <p>Você e o Mestre combinam a reviravolta; as perguntas de reviravolta dos seus princípios servem de inspiração. O Mestre pode vetar o que não fizer sentido, e você <b>sempre pode recusar</b> e ficar com a falha (ou desistir da Ação Arriscada). Uma reviravolta <b>nunca anula o sucesso</b> que ela pagou.</p>
      <table class="cs-table"><thead><tr><th></th><th>Menor</th><th>Maior</th></tr></thead><tbody>
        <tr><td>Peso</td><td>Um incômodo que se resolve na mesma cena</td><td>Uma grande complicação, que pode durar a edição toda</td></tr>
        <tr><td>Duração</td><td>Os efeitos de jogo somem no início da próxima cena de montagem</td><td>Os efeitos de jogo duram até o fim da edição</td></tr></tbody></table>
      <h4>Exemplos de reviravoltas menores</h4>
      <ul class="cs-list">
        <li>Perder Vida igual ao dado Médio, ou ser Atrapalhado com o dado Máx.</li>
        <li>Fazer uma escolha difícil, ou revelar um segredo ou uma fraqueza para conseguir.</li>
        <li>A cena avança um espaço no marcador.</li>
        <li>Ficar separado do grupo, ou chamar atenção de um novo lacaio do tamanho do seu Médio.</li>
        <li>Perder uma habilidade Verde, ou um poder ou qualidade diminuir de tamanho.</li></ul>
      <h4>Exemplos de reviravoltas maiores</h4>
      <ul class="cs-list">
        <li>Perder Vida igual a Máx+Mín, ou ser Atrapalhado com Máx+Mín de forma persistente.</li>
        <li>Sacrificar algo importante, pelo menos até o fim da edição.</li>
        <li>A cena avança vários espaços no marcador.</li>
        <li>Ficar muito longe do grupo, ou atrair um esquadrão de lacaios (um por herói).</li>
        <li>Perder várias habilidades, ou o acesso a poderes e qualidades.</li></ul>` },

    { id: 'enemies', group: ACAO, title: 'Inimigos: vilões, tenentes e lacaios', nav: 'Inimigos', body: `
      <p>O turno dos vilões funciona como o dos heróis. A diferença é o <b>dado de status</b>, que no vilão pode ser definido de várias formas, indicadas na ficha dele.</p>
      <p><b>Tenentes e lacaios</b> têm um único dado, usado em todas as rolagens e igual ao tamanho atual deles. Quando vários lacaios fazem a mesma ação, agem num único turno e rolam todos os dados de uma vez. Eles não têm Vida: quando atacados, rolam o próprio dado contra o dano (é a "defesa" deles).</p>
      <table class="cs-table"><thead><tr><th>Resultado</th><th>Lacaio</th><th>Tenente</th></tr></thead><tbody>
        <tr><td>A defesa falha (rolou menos que o dano)</td><td>Derrotado na hora</td><td>O dado diminui um tamanho; um tenente em d4 é derrotado</td></tr>
        <tr><td>A defesa dá certo (igualou ou passou o dano)</td><td>O dado diminui um tamanho (em d4, continua em d4)</td><td>Nada acontece</td></tr></tbody></table>
      <div class="cs-callout">Se um Ataque causar <b>o dobro do tamanho do dado de um tenente</b> ou mais, ele é derrotado na hora, sem rolar a defesa. <i>Ex.: um tenente d6 atingido por 12 é derrotado.</i></div>` },

    // ------------------------------------------------------------------ III · Entre as cenas
    { id: 'montage', group: ENTRE, title: 'Cena de montagem', nav: 'Montagem', body: `
      <p>Cenas de montagem representam viagem, descanso, conserto, treino e investigação: pequenos momentos que levam a história de um ponto de destaque ao próximo.</p>
      <p>No início da montagem, todas as <b>reviravoltas menores</b> se resolvem e <b>todos os mods</b> somem, até os persistentes. Depois, cada herói descreve <b>uma</b> destas tarefas:</p>
      <table class="cs-table"><tbody>
        <tr><td>Recuperar Vida</td><td>Volte ao máximo da zona acima da sua (ex.: de algum ponto da Vermelha ao máximo da Amarela). Com uma reviravolta menor, suba uma zona a mais. Se estiver no Nocaute, uma reviravolta maior te devolve a Vida cheia. Descreva como: um curandeiro em Ionia é fácil de achar; no meio do deserto de Shurima, nem tanto.</td></tr>
        <tr><td>Ajudar outro herói</td><td>Ele recupera uma zona extra de Vida: primeiros socorros, levá-lo a um curandeiro, um remédio químico de Zaun.</td></tr>
        <tr><td>Se preparar</td><td>Faça um Fortalecer para a próxima cena: pesquisar numa biblioteca, treinar, estudar o inimigo. O bônus não é persistente.</td></tr></tbody></table>` },

    { id: 'social', group: ENTRE, title: 'Cena social', nav: 'Cena social', body: `
      <p>Cenas sociais são conversas, negociações, confissões e discussões, sem turnos nem marcador de cena. Normalmente não há rolagem, mas o Mestre pode pedir um Superar, principalmente quando envolve um princípio.</p>
      <p>Diga quem está na cena, o que acontece e onde. Fale como o seu personagem. Nunca force um confronto com outro herói se o jogador dele não quiser: quem briga são os personagens, não as pessoas.</p>
      <h4>Pontos de herói na cena social</h4>
      <p>Se a cena for marcante, o Mestre dá <b>1 ponto de herói a todos os heróis</b>, até aos que não estavam nela. Conta como marcante quando um herói:</p>
      <ul class="cs-list">
        <li>revela um segredo que o deixa vulnerável;</li>
        <li>cede para resolver um desentendimento com outro herói;</li>
        <li>diz uma verdade incômoda que faz a cena avançar;</li>
        <li>deixa um princípio forçar um confronto ou uma escolha difícil;</li>
        <li>viola um dos próprios princípios, com consequências interessantes.</li></ul>
      <ul class="cs-list">
        <li><b>No máximo 1 ponto por cena.</b></li>
        <li><b>Varie os heróis:</b> uma segunda cena conduzida pelos mesmos heróis, na mesma edição, não rende ponto.</li></ul>` },

    { id: 'hero-points', group: ENTRE, title: 'Pontos de herói', body: `
      <ul class="cs-list">
        <li><b>Como ganhar:</b> sempre que um herói usa um dos seus <b>princípios</b> numa ação de Superar (dando certo ou não), <b>cada herói do grupo</b> ganha 1 ponto. ${see('social', 'Cenas sociais')} marcantes também dão 1 ponto.</li>
        <li><b>Limite:</b> no máximo 5 pontos por herói em cada edição. Marque em <b>Pontos de Herói</b> na ficha.</li>
        <li><b>Trocar:</b> no fim da edição, cada ponto vira 1 ponto de bônus, dividido como você quiser. Com 5 pontos: +3 e +2, ou +4 e +1, ou cinco +1. Marque em <b>Recompensas de Pontos de Herói</b>.</li>
        <li><b>Usar:</b> os bônus são <b>exclusivos</b>. Dê um nome ao usar, lembrando algo da edição anterior (ex.: "Favor da Xerife +3").</li>
        <li><b>Validade:</b> pontos não passam de uma edição para a outra, e os bônus que sobrarem somem no fim da edição em que podiam ser usados.</li></ul>` },

    { id: 'collections', group: ENTRE, title: 'Coleções', body: `
      <p>Quando você junta seis edições (o Mestre pode mudar esse número), elas viram uma <b>coleção</b>: o grupo escolhe um nome, você o anota em <b>Coleções</b> e apaga as Edições Anteriores.</p>
      <p>Você pode usar <b>cada coleção uma vez por sessão</b>, lembrando uma aventura passada, para:</p>
      <ul class="cs-list">
        <li>depois de rolar, mudar o número de um dado para o que quiser (e só então definir Mín, Médio e Máx);</li>
        <li>estabelecer um fato sobre a cena, baseado numa edição anterior;</li>
        <li>evitar uma reviravolta menor, explicando como aquela experiência ajuda agora.</li></ul>
      <p>Justifique com uma lembrança ("Da última vez que enfrentei o Swain, ele estava ferido do lado direito...") e, se quiser, com uma "nota do editor" citando a edição. É também entre coleções que o herói pode ${see('gm-evolution', 'evoluir e mudar de ficha')}.</p>` },

    // ------------------------------------------------------------------ IV · Para o Mestre
    { id: 'gm-scene', group: MESTRE, title: 'Montando uma cena de ação', nav: 'Montando a cena', body: `
      <p>Uma cena de ação é montada com <b>elementos</b>: desafios, lacaios, tenentes, vilões e o ambiente, mais o ${see('gm-tracker', 'marcador de cena')}. A regra de bolso: uma cena tem cerca de <b>H elementos</b>, em que <b>H</b> é o número de heróis. Assim todo mundo tem algo para fazer no próprio turno.</p>
      <div class="cs-scroll"><table class="cs-table cs-wide"><thead><tr><th>Dificuldade</th><th>Desafios</th><th>Lacaios</th><th>Tenentes</th><th>Vilões</th><th>Ambiente</th></tr></thead><tbody>
        <tr><td><b>Fácil</b></td><td>1 a 2 sucessos, ou 1 com dificuldade extra (como um contador)</td><td>H lacaios d6</td><td>½H tenentes d8</td><td>Nenhum</td><td>Nenhum</td></tr>
        <tr><td><b>Moderada</b></td><td>3 a 4 sucessos, ou 1 a 2 com dificuldade extra</td><td>H lacaios d8</td><td>½H tenentes d10</td><td>Vilão menor (sem aprimoramentos)</td><td>Ambiente comum</td></tr>
        <tr><td><b>Difícil</b></td><td>5 ou mais sucessos, ou 3 a 4 com dificuldade extra</td><td>H lacaios d10</td><td>½H tenentes d12</td><td>Vilão maior (com aprimoramentos)</td><td>Ambiente hostil</td></tr></tbody></table></div>
      <p class="cs-note">½H = metade do número de heróis, arredondada para cima. Cada linha é <b>um</b> elemento: "H lacaios d8" conta como um elemento moderado.</p>
      <ul class="cs-list">
        <li><b>Cena fácil:</b> quase só elementos fáceis, nenhum difícil. Serve de aquecimento ou de passagem na história.</li>
        <li><b>Cena moderada:</b> a maioria das cenas de uma edição.</li>
        <li><b>Cena difícil:</b> o grande confronto. Quase só elementos difíceis, nenhum fácil.</li></ul>
      <h4>Trocas que mantêm o equilíbrio</h4>
      <ul class="cs-list">
        <li>Um elemento moderado vale dois fáceis; um difícil vale dois moderados.</li>
        <li>Dois moderados podem virar um fácil e um difícil.</li>
        <li>Num grupo de lacaios, <b>dois lacaios</b> podem virar <b>um tenente</b> de um tamanho de dado acima.</li>
        <li>Tire um elemento moderado para deixar a cena fácil; some um moderado ou difícil para deixá-la difícil.</li></ul>
      <div class="cs-callout"><b>Use cartões.</b> Um cartão para o marcador de cena, um para cada grupo de lacaios, tenente, vilão, desafio e local, e um para cada Mod. Deixe todos no meio da mesa. Vire o cartão de lado quando aquele elemento já agiu na rodada e retire-o quando for resolvido: a mesa vendo os cartões sumirem é a melhor sensação de progresso.</div>` },

    { id: 'gm-tracker', group: MESTRE, title: 'Marcador de cena e ambiente', nav: 'Marcador e ambiente', body: `
      <p>O marcador de cena mede o perigo e a urgência. Ele precisa de pelo menos um espaço de cada cor; comece por um destes e ajuste:</p>
      <table class="cs-table"><tbody>
        <tr><td><b>Padrão</b><br>${track(2, 4, 2)}</td><td>O mais comum. Começa no Verde, logo passa ao Amarelo e só chega ao Vermelho se a cena se arrastar.</td></tr>
        <tr><td><b>Prolongado</b><br>${track(3, 5, 3)}</td><td>Cenas longas, grupos pequenos, perseguições e explorações com muitos desafios.</td></tr>
        <tr><td><b>Épico</b><br>${track(1, 3, 4)}</td><td>Confrontos finais. O Verde quase não existe e o Vermelho é praticamente certo.</td></tr></tbody></table>
      <h4>O turno do marcador</h4>
      <p>O marcador tem um turno na ordem de ação, como qualquer personagem. Nele, faça nesta ordem:</p>
      <ol class="cs-steps">
        <li><b>Avance o marcador:</b> marque o próximo espaço. Ao marcar o último Verde, a cena fica Amarela; ao marcar o último Amarelo, fica Vermelha. Anuncie a mudança: os heróis ganham acesso a novas habilidades.</li>
        <li><b>Ative as ameaças do ambiente</b> que já estão em jogo (lacaios e tenentes do lugar agem agora).</li>
        <li>Se não houver nenhuma ameaça do ambiente, <b>introduza uma nova</b>, liberada pela cor atual da cena.</li>
        <li>Se nenhuma ameaça entrou, <b>dispare uma reviravolta do ambiente</b> da cor atual. Se nenhuma servir, role os três dados do ambiente como um Atacar, Fortalecer ou Atrapalhar.</li></ol>
      <ul class="cs-list">
        <li>Sem ambiente, o turno do marcador é só o passo 1.</li>
        <li>O ambiente nunca faz Defender nem Superar. Cada reviravolta maior do ambiente acontece no máximo uma vez por cena.</li>
        <li>Quando um herói consegue um Superar com reviravolta, você pode sugerir uma reviravolta do ambiente da cor atual.</li></ul>
      <div class="cs-callout"><b>Fim do marcador:</b> quando o último espaço Vermelho é marcado, algo ruim acontece e a cena termina. O plano do vilão avança, alguém não é salvo, a fenda do Vazio se abre de vez. A história segue para uma nova cena, provavelmente com muito mais em jogo.</div>` },

    { id: 'gm-challenges', group: MESTRE, title: 'Desafios', body: `
      <p>Desafios são obstáculos, perigos para inocentes e complicações que precisam ser resolvidos durante a cena: um prédio desabando em Piltover, um vazamento de química em Zaun, um navio pegando fogo em Águas de Sentina. São resolvidos com ações de <b>Superar</b>, e dão aos heróis que não brilham no combate a chance de salvar o dia.</p>
      <table class="cs-table"><tbody>
        <tr><td><b>Simples</b></td><td>Um Superar resolve. Não ameaça ninguém a cada turno, mas se ficar sem solução até o fim da cena, gera consequências na história.</td></tr>
        <tr><td><b>Em etapas</b></td><td>Vários sucessos em ordem (ex.: <i>achar</i> a fábrica de golens, depois <i>destruí-la</i>). Vários heróis podem avançar o mesmo desafio no mesmo turno. Um <b>12+</b> conta como dois sucessos. Mantenha em torno de 3 sucessos, no máximo 5.</td></tr>
        <tr><td><b>Várias soluções</b></td><td>Caminhos que se excluem: <i>hackear</i> a porta hextec <b>ou</b> <i>arrombá-la</i>, não os dois.</td></tr>
        <tr><td><b>Ramificados</b></td><td>Resolver um desafio libera outros, conforme o jeito que foi resolvido. Ótimo para invadir uma base ou explorar uma tumba em Shurima.</td></tr>
        <tr><td><b>Com contador</b></td><td>Tem um turno próprio. A cada turno dele, marque uma caixa; quando marcar a última, as consequências acontecem na hora.</td></tr></tbody></table>
      <h4>Quanto tempo dar ao contador</h4>
      <table class="cs-table"><thead><tr><th>Impacto se disparar</th><th>Contador</th></tr></thead><tbody>
        <tr><td>Pouco impacto em civis, ou perigo para os heróis</td><td>1 a 2 turnos</td></tr>
        <tr><td>Grande impacto em civis, ou grande perigo para os heróis</td><td>Até a próxima mudança de cor da cena</td></tr>
        <tr><td>Catástrofe na região</td><td>Use um Dispositivo do Juízo Final</td></tr></tbody></table>
      <p><b>Dispositivos do Juízo Final</b> são desafios com contador e vários sucessos que, no próprio turno, <b>aceleram o marcador de cena</b> (um espaço, dois, ou direto para a próxima cor). Se o marcador acabar com um deles em jogo, ele dispara e a cena termina, quase sempre de forma catastrófica.</p>
      <p class="cs-note">Um desafio também pode ter uma habilidade própria e agir no turno dele, como uma torre de defesa. Transformar um inimigo em desafio, e não em lacaio, dá chance aos heróis de Superar em cenas cheias de combate.</p>` },

    { id: 'gm-minions', group: MESTRE, title: 'Conduzindo lacaios e tenentes', nav: 'Lacaios e tenentes', body: `
      <p>As regras básicas de dano estão em ${see('enemies', 'Inimigos')}. Do lado do Mestre:</p>
      <table class="cs-table"><thead><tr><th>Dado</th><th>Exemplos em Runeterra</th></tr></thead><tbody>
        <tr><td>d4</td><td>Ratos-químicos de Zaun, turba em pânico, autômatos quebrados</td></tr>
        <tr><td>d6</td><td>Capangas dos Barões Químicos, guardas da cidade, piratas de Águas de Sentina</td></tr>
        <tr><td>d8</td><td>Soldados de Noxus, assassinos da Ordem das Sombras, lobos de Freljord</td></tr>
        <tr><td>d10</td><td>Guarda de elite, capangas turbinados com química, criaturas do Vazio</td></tr>
        <tr><td>d12</td><td>Golens hextec, máquinas de cerco, feras colossais</td></tr></tbody></table>
      <ul class="cs-list">
        <li><b>Em grupo:</b> lacaios iguais agem juntos. Role todos os dados de uma vez e distribua o resultado entre os alvos.</li>
        <li><b>Um dado só</b> para qualquer ação básica. Se tiverem habilidade, ela é a jogada preferida deles.</li>
        <li><b>Não concentre</b> todos os ataques no mesmo herói, principalmente no que está quase em Nocaute, a não ser que o vilão deixe isso claro antes ("Acabem com a Demaciana!").</li>
        <li><b>Superar:</b> lacaios e tenentes nunca aceitam reviravolta maior; com 1 a 3, apenas falham. Com 4 a 7, conseguem com um custo: o lacaio sai de cena, o tenente perde um tamanho de dado. Eles <b>não podem avançar o marcador</b>; isso só os vilões fazem.</li>
        <li>Para lacaios mais perigosos sem aumentar o dado, dê bônus em ações específicas ("+1 para Atacar em bando").</li></ul>
      <h4>Ideias de habilidade para tenentes</h4>
      <ul class="cs-list">
        <li>Bônus em Fortalecer, Atrapalhar ou Defender, ou afetar vários alvos no mesmo local com essas ações.</li>
        <li>Atacar e Fortalecer um aliado (ou Atrapalhar um inimigo) com a mesma rolagem.</li>
        <li>Ação especial: criar lacaios, curar o vilão, trazer uma ameaça do ambiente, levar um herói para outro local.</li>
        <li>Sacrificar-se para o vilão fugir, agir fora de hora ou avançar o marcador um espaço.</li></ul>` },

    { id: 'gm-villains', group: MESTRE, title: 'Vilões, ameaças e reviravoltas', nav: 'Vilões e ameaças', body: `
      <ul class="cs-list">
        <li><b>Vilões</b> agem como heróis: poderes, qualidades, habilidades, Vida e um dado de status próprio, descrito na ficha deles. Cada vilão tem o próprio turno.</li>
        <li>Só vilões podem usar <b>Superar para avançar o marcador de cena</b>, e podem pagar Ações Arriscadas com reviravoltas, como os heróis.</li>
        <li><b>Aprimoramentos</b> tornam o vilão mais forte e dão aos heróis outra forma de vencê-lo, como uma armadura hextec que cai depois de alguns Superar.</li>
        <li><b>Ameaças</b> são lacaios, tenentes ou vilões que entram no meio da cena, trazidos por outro personagem, pelo ambiente ou por uma reviravolta. Começam a agir no turno seguinte ao da entrada.</li>
        <li><b>Personagens da trama</b> aliados podem ser lacaios (civis frágeis) ou tenentes (um guarda de elite amigo). Você pode deixar os jogadores controlarem esses aliados.</li></ul>
      <h4>De onde tirar reviravoltas</h4>
      <ol class="cs-steps">
        <li>Das <b>perguntas de reviravolta dos princípios</b> dos heróis: sempre a primeira opção.</li>
        <li>Do <b>ambiente</b> ou da própria cena (o cano de química que estoura, a ponte que cede).</li>
        <li>Da sua cabeça, misturando os dois. Prefira reviravoltas que tiram a atenção do combate: um inocente em perigo, um segredo exposto, um novo desafio.</li></ol>
      <p class="cs-note">Reviravoltas menores duram até a próxima cena de montagem; as maiores, até o fim da edição. Mesmo resolvidas, podem voltar como gancho para outra cena, edição ou coleção.</p>` },

    { id: 'gm-evolution', group: MESTRE, title: 'Evolução entre coleções', nav: 'Evolução', body: `
      <p>Ao fechar uma ${see('collections', 'coleção')}, o arco de história termina e os heróis podem mudar. Há três tamanhos de mudança:</p>
      <table class="cs-table"><tbody>
        <tr><td><b>Visual</b></td><td>Novo traje, alcunha, cabelo. Livre, sem pedir permissão, mas vale pensar no motivo.</td></tr>
        <tr><td><b>Detalhes</b></td><td>Trocar um poder ou qualidade por outro do <b>mesmo dado</b> (as habilidades passam a usar o novo), trocar um princípio, ou trocar uma habilidade por outra da <b>mesma cor</b>, das mesmas listas da criação, usando o mesmo poder ou qualidade.</td></tr>
        <tr><td><b>Reescrita</b></td><td>Quando muita coisa mudou: refaça a criação pelo método Construído, mantendo a história e as coleções.</td></tr></tbody></table>
      <p>No site, tudo isso fica na aba <a href="ficha.html#evoluir">Evoluir campeão</a> da página Ficha, com histórico das mudanças. Mudanças também podem acontecer no meio de uma coleção, se a história pedir.</p>` },

    { id: 'example', group: MESTRE, title: 'Exemplo de jogo: fumaça nas docas do Entresol', nav: 'Exemplo de jogo', body: `
      <p>Três heróis seguem a pista de um carregamento de química ilegal até as docas do Entresol, em Zaun:</p>
      <table class="cs-table"><tbody>
        <tr><td><b>Rix Ferrugem</b> (Zaun)</td><td>Inventor de dispositivos químicos. Poder <i>Química</i> d10, qualidade <i>Tecnologia</i> d8. Temperamento Imprudente: status Verde d6, Amarelo d6, Vermelho d8.</td></tr>
        <tr><td><b>Aldric Valmont</b> (Demacia)</td><td>Soldado da Vanguarda. Poder <i>Força</i> d10, qualidade <i>Combate</i> d8. Temperamento Comandante Nato: status d6, d8, d10. Vida 28 (Verde 28 a 22, Amarela 21 a 11, Vermelha 10 a 1).</td></tr>
        <tr><td><b>Sen Hayari</b> (Ionia)</td><td>Espiritualista. Poder <i>Energia Espiritual</i> d8, qualidade <i>Percepção</i> d10. Temperamento Curioso: status d6, d8, d10.</td></tr></tbody></table>
      <p><b>A cena (moderada).</b> Marcador padrão ${track(2, 4, 2)}. Três <b>capangas turbinados</b> (lacaios d8), o <b>Capataz Gorn</b> (tenente d10, "+1 para Atacar quem estiver Atrapalhado") e um desafio com contador: <b>vazamento de gás químico</b>, 1 sucesso, contador de 2 turnos. Se disparar, todos na doca sofrem dano.</p>

      <h4>Rodada 1</h4>
      <ol class="cs-steps cs-example">
        <li><b>O Mestre abre a cena</b> e escolhe quem começa: Aldric, que chegou primeiro. Aldric <b>Ataca</b> um capanga com Força, Combate e o status Verde:
          ${roll([['d10', 7], ['d8', 3], ['d6', 5]], 'Ordenando: Mín 3, Médio 5, Máx 7. Dano = 5.')}
          O capanga rola o próprio d8 para resistir e tira 4. Menos que 5: <b>derrotado</b>. Aldric passa a vez para Sen.</li>
        <li><b>Sen tenta fechar a válvula</b> do vazamento (Superar), agindo pelo seu princípio de proteger inocentes:
          ${roll([['d8', 2], ['d10', 9], ['d6', 6]], 'Médio 6: sucesso com reviravolta menor.')}
          O vazamento está resolvido. Como ela usou um princípio num Superar, <b>cada herói ganha 1 ponto de herói</b>. Para a reviravolta, o Mestre propõe e Sen aceita: o assobio da válvula chama atenção, e <b>o marcador avança um espaço</b>. Sen passa a vez para os capangas.</li>
        <li><b>Os dois capangas agem juntos</b>, cada um rolando seu d8: um Ataca Aldric e tira 6; o outro Ataca Rix e tira 3. Aldric cai para 22 de Vida (ainda Verde). Os capangas passam a vez para Rix.</li>
        <li><b>Rix Fortalece Aldric</b> arremessando uma cápsula de fumaça:
          ${roll([['d10', 8], ['d8', 8], ['d6', 4]], 'Dois 8: Rix escolhe a ordem. Médio 8 = bônus de +3.')}
          O Mod vira um cartão na frente de Aldric: <b>"Cortina de fumaça +3"</b>. Rix passa a vez para o marcador.</li>
        <li><b>Turno do marcador:</b> o Mestre marca o segundo espaço Verde. Com os dois Verdes marcados, <b>a cena agora é Amarela</b>. O status de todos passa a ser pelo menos Amarelo, e as habilidades Amarelas ficam liberadas. O marcador passa a vez para Gorn.</li>
        <li><b>Gorn Ataca Aldric</b> com seu d10 e tira 9. Aldric vai para 13: <b>zona Amarela</b> pela própria Vida também. Todos já agiram, a rodada acaba. Gorn escolheria quem abre a próxima, mas não pode escolher a si mesmo: escolhe os capangas.</li></ol>
      <div class="cs-callout">Repare na armadilha: os heróis jogaram todos antes dos inimigos, então os capangas terminam a rodada 1 e abrem a rodada 2, agindo duas vezes seguidas. Na próxima, vale intercalar.</div>

      <h4>Rodada 2</h4>
      <ol class="cs-steps cs-example">
        <li>Os capangas Atacam de novo; Sen e Rix levam 5 e 2 de dano. Passam para Aldric.</li>
        <li><b>Aldric Ataca Gorn</b> usando o Mod de Rix, agora com o status Amarelo (d8):
          ${roll([['d10', 9], ['d8', 6], ['d8', 2]], 'Médio 6 +3 da fumaça = 9 de dano.')}
          O Mod é gasto e o cartão sai da mesa. Gorn rola o d10 para resistir e tira 7, menos que 9: <b>falhou</b>, então o tenente <b>perde um tamanho</b> e vira d8. (Com 20 de dano ou mais, o dobro do d10, ele cairia direto, sem rolar.)</li>
        <li>E a luta continua. Quando o grupo derrubar Gorn, o Mestre retira o último cartão e a cena termina antes do Vermelho. Na <b>cena de montagem</b> seguinte, cada herói recupera Vida e o grupo decide para onde leva a pista do carregamento.</li></ol>` }
  ];
})();
