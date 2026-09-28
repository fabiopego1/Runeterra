// pt-BR: regras para a mesa (página regras.html), em três partes lidas em ordem:
// O básico → Na cena de ação → Entre as cenas. Cada seção tem id (âncora #cs-<id>), grupo, título e texto.
(() => {
  'use strict';
  const effectChart = (head, rows) => `<table class="cs-table"><thead><tr><th>Resultado do dado de efeito</th><th>${head}</th></tr></thead><tbody>${rows.map(r => `<tr><td>${r[0]}</td><td>${r[1]}</td></tr>`).join('')}</tbody></table>`;
  const ic = a => `<span class="act-ic act-${a.toLowerCase()}">${{ Attack: 'ATQ', Defend: 'DEF', Overcome: 'SUP', Boost: 'FOR', Hinder: 'ATR', Recover: 'REC' }[a]}</span>`;
  const NOME = { Attack: 'Atacar', Defend: 'Defender', Overcome: 'Superar', Boost: 'Fortalecer', Hinder: 'Atrapalhar', Recover: 'Recuperar' };
  const see = (id, txt) => `<a href="#cs-${id}">${txt}</a>`;
  const BASICO = 'O básico', ACAO = 'Na cena de ação', ENTRE = 'Entre as cenas';

  window.CHEAT_GROUPS_PT = [
    { name: BASICO, lede: 'Como o jogo se organiza, como os dados funcionam e o que acontece quando você se machuca.' },
    { name: ACAO, lede: 'Turnos, ações, mods e reviravoltas: tudo o que você usa durante uma luta, perseguição ou resgate.' },
    { name: ENTRE, lede: 'Recuperação, conversas, pontos de herói e coleções: o que acontece entre uma cena de ação e outra.' }
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
      <p>Justifique com uma lembrança ("Da última vez que enfrentei o Swain, ele estava ferido do lado direito...") e, se quiser, com uma "nota do editor" citando a edição. É também entre coleções que o herói pode evoluir e mudar de ficha.</p>` }
  ];
})();
