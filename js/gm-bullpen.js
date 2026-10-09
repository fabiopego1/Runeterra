/* GM Screen: "A Bancada do Mestre": the Bullpen, Adventure Issues and Archives chapters of the book (5 to 7),
   adapted to Runeterra. Part 1 teaches how to build scenes, challenges, twists, minions, lieutenants, villains and
   environments; part 2 shows how to shape a session (an "issue"); part 3 is a shelf of ready examples. Minions,
   lieutenants and villains can be sent straight to the table tools above. Examples are original; the numbers
   (die sizes, Health) follow the rulebook's building rules. */
(() => {
  'use strict';
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const VD = window.GM_VDATA;
  const die = d => `<span class="die ${d}">${d.slice(1)}</span>`;
  const dt = t => esc(t).replace(/\bd(4|6|8|10|12)\b/g, (m, n) => die('d' + n));   // "d8" in running text becomes a die

  // ------------------------------------------------------------------ part 1: how to build
  const SCENE_ROWS = [
    ['Fácil', '1 a 2 sucessos, ou 1 sucesso com um agravante (um cronômetro, por exemplo)', 'N lacaios, ou N/2 se trocar por tenentes', 'Nenhum', 'Nenhum'],
    ['Moderada', '3 a 4 sucessos, ou 1 a 2 com agravante', 'Mais lacaios, um tenente no lugar de cada 2 lacaios', 'Antagonista menor (sem melhorias nem maestria)', 'Ambiente comum'],
    ['Difícil', '5 ou mais sucessos, ou 3 a 4 com agravante', 'Grupos maiores e tenentes de dado alto', 'Antagonista maior (com melhorias e maestria)', 'Ambiente hostil']
  ];
  const MINION_DICE = [
    ['d4', 'Multidões em pânico, ratos de esgoto, aldeões sem treino, poros famintos'],
    ['d6', 'Bandidos armados, guardas de rua, contrabandistas, Crias do Vazio'],
    ['d8', 'Soldados profissionais, mercenários, caçadores de magos, assassinos de aluguel'],
    ['d10', 'Soldados de elite, autômatos hextec, espectros da Névoa Negra, comandos'],
    ['d12', 'Colossos, máquinas de guerra, monstros do Abismo, gigantes de pedra viva']
  ];
  const MINION_ABILITIES = [
    'Bônus numa ação básica quando uma condição é cumprida',
    'Bônus em Fortalecer um aliado no mesmo local, ou em Atrapalhar um inimigo',
    'Bônus em Defender um aliado, em dano ou no salvamento',
    'Atacar um alvo extra (normalmente com penalidade)',
    'Mudar de local sem gastar ação',
    'Sacrificar-se: proteger o antagonista de uma fonte de dano, atacar todos no local (com penalidade), dar bônus aos aliados, impor penalidade aos inimigos, curar o antagonista, ativar uma ameaça do ambiente ou se dividir em lacaios menores'
  ];
  const APPROACHES = [
    // [nome, poderes sugeridos, qualidades sugeridas, vida base]
    ['Adaptável', 'Traje de Poder, Robótica, Metamorfose, Mudança de Tamanho', 'Criatividade, Ciência, Autodisciplina, Tecnologia', 15],
    ['Ancestral', 'Cósmico, Fogo/Sombras (um elemento antigo), Presença, Vitalidade', 'História, Perspicácia, Saber Mágico, Saber Esotérico', 30],
    ['Valentão', 'Força, Vitalidade, Impulso', 'Combate Corpo a Corpo, Imponente, Condicionamento Físico', 25],
    ['Criador', 'Elemental/Energia, Materiais, Robótica', 'Criatividade, Liderança, Saber Mágico, Tecnologia', 15],
    ['Enfraquecedor', 'Cósmico, Sugestão, Transmutação', 'Gracejos, Medicina, Ciência, Autodisciplina', 25],
    ['Disruptivo', 'Elemental/Energia, Ilusões, Sugestão, Transmutação', 'Prontidão, Perspicácia, Persuasão, Combate à Distância', 20],
    ['Focado', 'Elemental/Energia, Materiais', 'Criatividade, Combate à Distância, Autodisciplina', 15],
    ['Generalista', 'Materiais, Mobilidade, Força, Vitalidade', 'Combate Corpo a Corpo, Convicção, Informações do Submundo, Condicionamento Físico', 25],
    ['Parasita', 'Elemental/Energia, Metamorfose, Tóxico', 'Combate Corpo a Corpo, Medicina, Persuasão, Furtividade', 15],
    ['Mente Mestra', 'Dedução, Invenções, Cálculo Relâmpago, Traje de Poder', 'Criatividade, Perspicácia, Investigação, Ciência, Tecnologia', 20],
    ['Ninja', 'Agilidade, Arma Emblemática, Força, Escalar Paredes', 'Prontidão, Combate Corpo a Corpo, Informações do Submundo, Furtividade', 20],
    ['Sobrepoderoso', 'Elemental/Energia, Presença, Psíquicos', 'Convicção, Delicadeza, Imponente, Autodisciplina', 35],
    ['Orgulhoso', 'Percepção, Engenhocas, Traje de Poder, Força', 'Combate Corpo a Corpo, Convicção, Imponente, Autodisciplina', 25],
    ['Implacável', 'Intuição, Mobilidade, Arma Emblemática, Velocidade', 'Prontidão, Convicção, Investigação, Combate à Distância', 20],
    ['Habilidoso', 'Poderes Intelectuais ou Tecnológicos', 'Qualidades Mentais ou Físicas', 15],
    ['Especialista', 'Poderes Atléticos ou Intelectuais', 'Qualidades Mentais ou Físicas', 20],
    ['Tático', 'Percepção, Voo, Intuição, Montaria/Veículo Emblemático', 'Prontidão, Perspicácia, Liderança, Combate à Distância', 20],
    ['Subpoderoso', 'Elemental/Energia ou Tecnológicos', 'Gracejos, Convicção, Informações do Submundo, Tecnologia', 10]
  ];
  const ARCHETYPES = [
    // [nome, com o que se importa, vida]
    ['Brutamontes', 'Muda conforme sua própria Vida: quanto mais apanha, mais perigoso fica', '+20'],
    ['Domínio', 'Seu status vem do ambiente: luta melhor em casa', '+30'],
    ['Formidável', 'Fica forte enquanto não sofre penalidades ligadas à sua fraqueza', '+25'],
    ['Frágil', 'Muito perigoso no começo, enfraquece rápido', '−5'],
    ['Guerrilheiro', 'Quanto mais oponentes, melhor para ele', '+20'],
    ['Indomável', 'Status constante, sem altos e baixos', '+20'],
    ['Inibidor', 'Vive de penalidades aplicadas nos campeões', '+10'],
    ['Inventor', 'Depende de invenções e de bônus e penalidades em jogo', '+10'],
    ['Legião', 'Antagonista de multidão: quanto mais lacaios, mais difícil de controlar', '−5'],
    ['Solitário', 'Quanto menos outros antagonistas na cena, melhor', '+10'],
    ['Senhor da Horda', 'Antagonista de multidão: quanto mais lacaios, melhor', '+15'],
    ['Predador', 'Quanto menos oponentes, melhor: caça um alvo por vez', '+15'],
    ['Esquadrão', 'Quanto mais aliados, melhor', '+5'],
    ['Titã', 'Gigantesco, com um desafio embutido para reduzir seu status', '+30']
  ];
  const UPGRADES = [
    ['Esquadrão de capangas', 'Um grupo de lacaios que o acompanha e se renova (“Alerta!”: repõe lacaios até o número de campeões)', '+0'],
    ['Lacaios reforçados', 'Capangas mortais ou resistentes: o antagonista pode subir o dado de um grupo (“Fortalecer Lacaios”)', '+5'],
    ['Lutador de grupo', 'Equipado para enfrentar vários campeões ao mesmo tempo', '+20'],
    ['Veículo antagonista', 'Máquina de guerra autônoma, feita como um tenente com 2 a 4 habilidades', '+15'],
    ['Aprimoramento de poder', 'Ritual, aparelho ou processo: todos os dados de poder sobem um tamanho', '+20'],
    ['Aprimoramento de qualidade', 'Treino especial com uma vantagem distinta e novas perícias', '+20'],
    ['Escudo de defesa', 'Imune a dano enquanto o escudo estiver de pé', '+0'],
    ['Aura calmante', 'Um jeito de passar despercebido', '+10'],
    ['Campo anulador de poderes', 'Reduz os poderes dos campeões e preserva os seus', '+10'],
    ['Zona de lavagem cerebral', 'Altera a consciência dos campeões; quem cai pode virar um lacaio', '+10']
  ];
  const HEALTH_CHART = [
    ['100+', 'Máx−75', '74−26', '25−1'], ['90', '90−66', '65−23', '22−1'], ['80', '80−55', '54−21', '20−1'], ['70', '70−50', '49−18', '17−1'],
    ['60', '60−41', '40−17', '16−1'], ['50', '50−35', '34−16', '15−1'], ['40', '40−30', '29−15', '14−1'], ['30', '30−23', '22−12', '11−1'],
    ['20', '20−16', '15−8', '7−1'], ['10', '10', '9−5', '4−1']
  ];
  const ENV_DICE = [['d4', 'Mínimo'], ['d6', 'Médio'], ['d8', 'Desafiador'], ['d10', 'Perigoso'], ['d12', 'Catastrófico']];

  // ------------------------------------------------------------------ part 3: the shelf of examples
  const MINIONS = [
    { n: 'Multidão em Pânico', d: 'd4', t: 'Civis tentando fugir do que quer que esteja destruindo a rua.', a: null, tac: 'Atrapalham mais do que atacam: bloqueiam o caminho e escondem os alvos.' },
    { n: 'Poros Famintos', d: 'd4', t: 'Um bando de poros que invadiu o acampamento e só pensa em comida.', a: ['Roer Equipamento', 'Bônus +1 em Atrapalhar contra quem usa uma Arma Emblemática.'], tac: 'Pulam em quem carrega suprimentos e fogem quando levam um golpe.' },
    { n: 'Contrabandistas de Sentina', d: 'd6', t: 'Marujos com facas e pistolas de pederneira, pagos para guardar uma carga.', a: ['Tiro de Cobertura', 'Bônus +1 em Defender um aliado no mesmo local.'], tac: 'Ficam atrás de caixotes e deixam o mais corajoso ir à frente.' },
    { n: 'Recrutas de Noxus', d: 'd6', t: 'Soldados rasos de uniforme vermelho, treinados para obedecer sem perguntar.', a: ['Pela Expansão!', 'Bônus +1 em Atacar enquanto houver outro lacaio no mesmo local.'], tac: 'Avançam em bloco e miram o campeão que acabou de causar dano.' },
    { n: 'Crias do Vazio', d: 'd6', t: 'Criaturas pequenas e famintas que rasgam a realidade onde pisam.', a: ['Ruptura Final', 'Ao ser derrotada, impõe −1 em um campeão no mesmo local.'], tac: 'Mergulham sobre o alvo mais ferido, sem nenhum medo.' },
    { n: 'Vanguarda Demaciana', d: 'd8', t: 'Soldados com armadura polida, escudos e lança, disciplinados e leais à Coroa.', a: ['Muralha de Escudos', 'Bônus +2 no salvamento contra Ataques à distância.'], tac: 'Avançam em linha e protegem o oficial mais próximo.' },
    { n: 'Caçadores de Magos', d: 'd8', t: 'Agentes com correntes de petricita que perseguem quem usa magia sem autorização.', a: ['Rede de Petricita', 'Bônus +2 em Atrapalhar quem usou um poder Elemental/Energia na rodada anterior.'], tac: 'Escolhem o conjurador e ignoram os demais.' },
    { n: 'Brutamontes Quimtech', d: 'd8', t: 'Capangas inchados por químicos de Zaun, fortes e instáveis.', a: ['Surto Químico', 'Pode Atacar um alvo extra, com −2 em cada ataque.'], tac: 'Avançam no meio da confusão, feridos ou não, e se afastam do fogo.' },
    { n: 'Espectros da Névoa', d: 'd10', t: 'Almas presas à Névoa Negra que atacam qualquer coisa viva.', a: ['Retornar da Névoa', 'Uma vez por cena, ao ser derrotado, volta com o dado um tamanho menor.'], tac: 'Surgem das paredes e fogem da luz forte.' },
    { n: 'Autômatos Hextec', d: 'd10', t: 'Sentinelas de metal e cristal de Piltover, programadas para proteger um cofre.', a: ['Mira Travada', 'Bônus +2 em Atacar o alvo que atacaram na rodada anterior.'], tac: 'Mantêm distância e disparam em linha reta.' },
    { n: 'Colosso de Pedra Viva', d: 'd12', t: 'Um gigante de pedra animado por magia antiga, guardião de uma ruína.', a: ['Esmagar', 'Ao Atacar, atinge todos os alvos no mesmo local, mas rola um dado a menos.'], tac: 'Avança devagar, mas sempre; ignora os lacaios menores.' }
  ];
  const LIEUTENANTS = [
    { n: 'Comandante da Legião', d: 'd8', t: 'Oficial noxiano que luta junto das próprias tropas.', a: [['Manter a Linha', 'Lacaios aliados próximos ganham +1 em Atacar e em salvamentos.'], ['Golpe de Contra-Ataque', 'Sempre que rolar um salvamento, usa o mesmo dado para Atacar um inimigo próximo.']], tac: 'Fica no meio dos soldados, perto o bastante para golpear quem passar.' },
    { n: 'Alquimista Quimtech', d: 'd10', t: 'Químico de Zaun que lança frascos instáveis.', a: [['Frasco Instável', 'Ataca um alvo; todos os outros no mesmo local sofrem a metade do dano (arredondada para baixo).'], ['Antídoto de Emergência', 'Uma vez por rodada, cura um lacaio aliado com o valor do próprio dado.']], tac: 'Fica atrás dos brutamontes e arremessa por cima deles.' },
    { n: 'Capitão de Abordagem', d: 'd10', t: 'Pirata veterano que lidera ataques a navios.', a: [['Abordar!', 'Muda de local sem gastar ação.'], ['Saque Rápido', 'Ao causar dano, impõe uma penalidade persistente e exclusiva de −1.']], tac: 'Prefere os campeões isolados, longe da luz do farol.' },
    { n: 'Arauto do Vazio', d: 'd10', t: 'Cultista que abre fendas e chama as Crias.', a: [['Chamado das Fendas', 'Adiciona Crias do Vazio a um grupo, em número igual à metade do tamanho do dado, arredondado para baixo.'], ['Sacrifício Final', 'Ao ser derrotado, impõe −2 em todos os campeões no local.']], tac: 'Permanece onde a fenda está aberta e recua se ela fechar.' },
    { n: 'Sentinela Elemental de Ixtal', d: 'd12', t: 'Guardiã de uma ruína de Ixtal, tecida de elementos antigos.', a: [['Eco Elemental', 'Quando um campeão usa um poder Elemental/Energia, ela rola o dado e devolve o resultado como Ataque.'], ['Terreno Vivo', 'Uma vez por rodada, Defende um aliado usando o próprio dado.']], tac: 'Reage ao que o grupo faz; paga caro por quem ataca com elementos.' }
  ];
  const VILLAINS = [
    { n: 'General Veyra, a Lâmina de Ferro', where: 'Noxus', ap: 'Orgulhoso', arch: 'Predador', baseH: 25, archH: 15, up: [],
      sum: 'Veterana de duas guerras de fronteira, escolhe o campeão mais forte do grupo e o desafia à frente das tropas.',
      pq: 'Força d10 · Arma Emblemática d8 · Combate Corpo a Corpo d10 · Imponente d8 · Convicção d8 · Qualidade de interpretação: Disciplina Implacável d8',
      ab: [['Duelo à Vista de Todos', 'A', 'Ataque usando Arma Emblemática, dado Máx. Atrapalhe o alvo com o dado Mín.'], ['Recusar a Ajuda', 'I', 'Enquanto atacar um único alvo, ganha +2 em salvamentos.']],
      mastery: null, tip: 'Comece com um duelo; se mais de um campeão a ataca, ela ordena que os lacaios se afastem e tenta isolar um deles.' },
    { n: 'Dra. Kaelor, a Boticária de Zaun', where: 'Zaun', ap: 'Mente Mestra', arch: 'Inventor', baseH: 20, archH: 10, up: [['Esquadrão de capangas', 0]],
      sum: 'Inventora brilhante, cobra a cidade por antídotos de uma doença que ela mesma espalhou.',
      pq: 'Invenções d10 · Robótica d8 · Ciência d10 · Tecnologia d8 · Perspicácia d8 · Qualidade de interpretação: Cálculo Frio d8',
      ab: [['Frasco Experimental', 'A', 'Atrapalhe um campeão usando Invenções, dado Máx. Fortaleça a si mesma com o dado Mín.'], ['Plano B', 'R', 'Quando for Atacada, role o dado de Ciência e Defenda-se com o resultado; se passar de 6, um capanga se sacrifica por ela.']],
      mastery: 'Maestria da Ciência Louca', tip: 'Dê a ela um esquadrão de Brutamontes Quimtech e uma saída pelas tubulações.' },
    { n: 'Mareya, Rainha-Espectro', where: 'Ilhas das Sombras', ap: 'Ancestral', arch: 'Domínio', baseH: 30, archH: 30, up: [['Aprimoramento de poder', 20]],
      sum: 'Uma governante morta há séculos, presa à Névoa que atende a cada capricho dela.',
      pq: 'Sombras d12 · Presença d10 · Vitalidade d8 · História d10 · Saber Esotérico d10 · Qualidade de interpretação: Luto Eterno d8',
      ab: [['Sussurro da Névoa', 'A', 'Atrapalhe todos os campeões no ambiente usando Presença, dado Máx.'], ['Imortal na Névoa', 'I', 'Se a Vida chegar a 0 e não houver penalidade sobre ela, role o dado de Sombras e volte com esse valor.']],
      mastery: 'Maestria do Inconcebível', tip: 'Use junto do ambiente “A Névoa Negra”: a Rainha ganha forças a cada reviravolta que a Névoa causa.' },
    { n: 'Ykara, a Voz do Abismo', where: 'Vazio', ap: 'Enfraquecedor', arch: 'Senhor da Horda', baseH: 25, archH: 15, up: [['Lacaios reforçados', 5]],
      sum: 'Uma ex-acadêmica que ouviu o chamado e agora abre fendas pelo continente.',
      pq: 'Cósmico d10 · Transmutação d8 · Persuasão d8 · Ciência d8 · Autodisciplina d10 · Qualidade de interpretação: Fé no Fim d8',
      ab: [['Corroer a Esperança', 'A', 'Atrapalhe um campeão usando Cósmico, dado Máx. Reduza em um tamanho uma qualidade dele até o fim da cena.'], ['Mais Fome, Mais Fendas', 'A', 'Escolha um grupo de lacaios na cena e suba todos os seus dados um tamanho (máximo d12).']],
      mastery: 'Maestria do Inconcebível', tip: 'Cada Cria derrotada alimenta uma fenda no ambiente; ela só fica vulnerável quando as fendas se fecham.' },
    { n: 'Capitão Dorrick Maré-Negra', where: 'Águas de Sentina', ap: 'Tático', arch: 'Esquadrão', baseH: 20, archH: 5, up: [['Veículo antagonista', 15]],
      sum: 'Pirata que comanda uma frota dispersa e só ataca quando conhece o ponto fraco da vítima.',
      pq: 'Percepção d8 · Montaria/Veículo Emblemático d10 · Liderança d10 · Prontidão d8 · Combate à Distância d8 · Qualidade de interpretação: Sorriso Calculado d8',
      ab: [['Ordem de Fogo', 'A', 'Fortaleça todos os lacaios no local usando Liderança, dado Mín.'], ['Escapar na Maré', 'R', 'Quando for Atacado, o veículo (tenente) rola o dado; se o resultado superar a Vida atual do capitão, ele escapa da cena.']],
      mastery: 'Maestria do Mercenário', tip: 'O navio é um tenente: derrubá-lo antes do capitão tira a rota de fuga dele.' },
    { n: 'Karzul, o Colosso de Areia', where: 'Shurima', ap: 'Sobrepoderoso', arch: 'Titã', baseH: 35, archH: 30, up: [],
      sum: 'Um guardião ancestral despertado antes da hora, que ainda acha que está defendendo um imperador.',
      pq: 'Força d12 · Controle de Densidade d10 · Vitalidade d10 · Convicção d10 · Imponente d10 · Qualidade de interpretação: Lealdade Cega d8',
      ab: [['Passo do Colosso', 'A', 'Ataque todos os campeões no mesmo local usando Força, dado Máx.'], ['Sob o Peso dos Séculos', 'I', 'Enquanto a cena estiver na Zona Verde, ignora uma penalidade imposta sobre ele por rodada.']],
      mastery: null, tip: 'Dê aos campeões um desafio embutido (os glifos nas costas), como pede o arquétipo Titã.' }
  ];
  const ENVS = [
    { n: 'Ruas de Zaun em Chamas', where: 'Zaun', tr: [['Fumaça Tóxica', 'd8'], ['Tubulações Instáveis', 'd6'], ['Multidão em Pânico', 'd6']],
      st: [['Verde', 'Menor: tosse e vista turva: Atrapalhe um campeão com o dado Mín (persistente e exclusivo).', 'Maior: um cano estoura: Ataque todos os campeões do local com o dado Mín.'],
        ['Amarela', 'Menor: o povo enche as ruas: adicione o desafio “Multidão em Pânico”.', 'Maior: a fumaça fica espessa: Atrapalhe todos os campeões com o dado Máx.'],
        ['Vermelha', 'Menor: uma explosão no andar de cima: Ataque um campeão com o dado Médio.', 'Maior: a rua desaba em parte: adicione lacaios (Médio) e o desafio “Fuga pelo Esgoto”.']] },
    { n: 'A Névoa Negra', where: 'Ilhas das Sombras', tr: [['Névoa que Sussurra', 'd10'], ['Terreno Corrompido', 'd8'], ['Almas Famintas', 'd8']],
      st: [['Verde', 'Menor: sussurros: Atrapalhe um campeão (dado Mín) usando as lembranças dele.', 'Maior: o chão se abre: Ataque um campeão com Máx+Mín.'],
        ['Amarela', 'Menor: almas se agarram: adicione Espectros da Névoa (quantidade = dado Mín).', 'Maior: a névoa engole a luz: todos os campeões perdem acesso a uma habilidade Verde.'],
        ['Vermelha', 'Menor: o fantasma de um ente querido: Atrapalhe um campeão (dado Médio).', 'Maior: um coro de almas: Ataque todos os campeões com o dado Máx e Fortaleça os antagonistas com o Mín.']] },
    { n: 'Praça Real sob Cerco', where: 'Demacia', tr: [['Muralhas Ruindo', 'd8'], ['Fogo de Artilharia', 'd10'], ['Civis em Fuga', 'd6']],
      st: [['Verde', 'Menor: pedras caem: Ataque um campeão com o dado Mín.', 'Maior: a muralha cede: adicione o desafio “Salvar os Civis”.'],
        ['Amarela', 'Menor: bola de fogo à vista: Atrapalhe um campeão com Máx.', 'Maior: o portão cai: lacaios inimigos entram (quantidade = dado Médio).'],
        ['Vermelha', 'Menor: a bandeira pega fogo: todos perdem um bônus.', 'Maior: a torre desaba: Ataque todos os campeões com Máx+Mín.']] },
    { n: 'Convés da Perdição', where: 'Bilgewater', tr: [['Mar Revolto', 'd8'], ['Cordas e Canhões', 'd6'], ['Monstros Abissais', 'd10']],
      st: [['Verde', 'Menor: uma onda varre o convés: Atrapalhe um campeão com Mín.', 'Maior: um canhão se solta: Ataque um campeão com Máx.'],
        ['Amarela', 'Menor: um tentáculo agarra um barril: adicione um desafio simples.', 'Maior: o casco racha: Atrapalhe todos com Mín e adicione o desafio “Tapar o Rombo”.'],
        ['Vermelha', 'Menor: um monstro ataca o mastro: Ataque um campeão com Médio.', 'Maior: o navio emborca: Ataque todos com Máx+Mín e mude o ambiente para a água.']] },
    { n: 'Templo em Colapso', where: 'Shurima', tr: [['Areia Movediça', 'd8'], ['Armadilhas Antigas', 'd10'], ['Poder Adormecido', 'd8']],
      st: [['Verde', 'Menor: a areia puxa: Atrapalhe um campeão com Mín.', 'Maior: uma armadilha dispara: Ataque um campeão com Máx.'],
        ['Amarela', 'Menor: runas acendem: Fortaleça um antagonista com Mín.', 'Maior: o piso se abre: Atrapalhe todos com Máx e adicione o desafio “Cruzar o Abismo”.'],
        ['Vermelha', 'Menor: o poder adormecido ruge: Ataque um campeão com Médio.', 'Maior: o templo desmorona: Ataque todos com Máx+Mín; o grupo precisa escapar ou se proteger.']] }
  ];
  const ADVENTURES = [
    { n: 'O Carregamento Perdido de Piltover', hook: 'Uma carga de cristais hextec some no caminho entre Piltover e Zaun, e cada lado acusa o outro.',
      scenes: [['1', 'Social', 'Interrogar o guarda sobrevivente e o contrabandista que o denunciou. Um desafio de 2 sucessos para obter a pista.'],
        ['2', 'Ação · Moderada', 'Perseguição pelas escadarias de Zaun: Brutamontes Quimtech (1 por campeão) e o ambiente “Ruas de Zaun em Chamas”.'],
        ['3', 'Montagem', 'O grupo levanta dinheiro, informação e aliados antes da noite.'],
        ['4', 'Ação · Difícil', 'A Dra. Kaelor, com esquadrão e um Alquimista Quimtech; o carregamento é o desafio central: 4 sucessos antes de a cena chegar à Zona Vermelha.']],
      end: 'Entregar o carregamento a um dos lados cobra um preço do outro. Anote a escolha: ela vira gancho na próxima sessão.' },
    { n: 'A Maré dos Mortos', hook: 'Um vilarejo costeiro vê a Névoa Negra avançar sobre a baía, e os mortos acordam com ela.',
      scenes: [['1', 'Social', 'O pescador mais velho conta a lenda do farol. Desafio de 1 sucesso para encontrar o mapa.'],
        ['2', 'Ação · Fácil', 'Defender o vilarejo de Espectros da Névoa (metade do número de campeões) sem antagonista.'],
        ['3', 'Montagem', 'Reparar o farol enquanto a maré sobe.'],
        ['4', 'Ação · Difícil', 'Mareya, Rainha-Espectro, na “Névoa Negra”: religar o farol é um desafio de 5 sucessos que enfraquece o Domínio dela a cada sucesso.']],
      end: 'Se a Rainha fugir, a Névoa recua mas deixa uma marca: o vilarejo vira ponto de partida para a próxima história.' }
  ];

  // ------------------------------------------------------------------ rendering
  const table = (cols, rows) => `<table class="gm-fl-t gm-bp-t"><thead><tr>${cols.map(c => `<th>${esc(c)}</th>`).join('')}</tr></thead><tbody>${rows.map(r => `<tr>${r.map((v, i) => `<td${i === 0 ? ' class="fl-sc"' : ''}>${dt(v)}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
  const ol = items => `<ol class="gm-bp-steps">${items.map(i => `<li>${i}</li>`).join('')}</ol>`;
  const ul = items => `<ul class="gm-bp-list">${items.map(i => `<li>${i}</li>`).join('')}</ul>`;

  function guide(N) {
    const hp = (ap, ar, ups) => ap + ar + 5 * N + ups;
    return [
      { id: 'cenas', title: 'Montar uma cena de ação', body: `
        <p>Toda cena de ação precisa de duas coisas: que cada campeão tenha algo a fazer na maior parte dos turnos, e que o grupo sinta o tamanho do desafio. Escolha a dificuldade e some elementos de cena: desafios, lacaios, tenentes, antagonistas e ambiente. <b>N</b> é o número de campeões na cena.</p>
        ${table(['Dificuldade', 'Desafios', 'Lacaios e tenentes', 'Antagonista', 'Ambiente'], SCENE_ROWS)}
        <ul class="gm-bp-list">
          <li>Em um grupo de lacaios, <b>dois lacaios viram um tenente</b> de dado um tamanho maior. Para 5 campeões, uma cena moderada pode ter 3 lacaios d8 e 1 tenente d10.</li>
          <li>Um antagonista <b>sem melhorias</b> conta como elemento moderado; com uma melhoria, vira difícil; cada melhoria extra conta como mais um elemento moderado.</li>
          <li>Um ambiente conta como moderado. Se todas as reviravoltas dele forem hostis só aos campeões, conta como difícil. Use no máximo um por cena, a menos que o grupo tenha se dividido.</li>
          <li>Uma sessão tem em geral <b>2 a 3 cenas de ação</b> e as cenas sociais e de montagem que ligam uma à outra.</li>
          <li>Ajuste à vontade: o objetivo é uma boa cena, não a conta perfeita.</li>
        </ul>` },
      { id: 'desafios', title: 'Desafios', body: `
        <p>Um desafio é um obstáculo escrito em poucas palavras: “Uma ponte prestes a ruir”, “Civis presos num prédio em chamas”, “Um sistema de alarme que localiza campeões”. Você <b>não</b> decide quais poderes resolvem. Os jogadores escolhem, e se não tiverem a ferramenta certa, criam bônus em equipe.</p>
        ${ul(['<b>Fácil:</b> 1 a 2 sucessos em Superar, ou 1 sucesso com um agravante (um cronômetro). Quase sempre sem consequência, a menos que a cena acabe sem ele resolvido.', '<b>Moderado:</b> 3 a 4 sucessos, ou 1 a 2 com agravante.', '<b>Difícil:</b> 5 ou mais sucessos, ou 3 a 4 com agravante.', 'Anote junto <b>como o desafio pode piorar</b>: isso vira reviravolta pronta.', 'Exemplos de Runeterra: “Atravessar a Rua dos Cabos em Zaun antes que o gás chegue”, “Convencer a guarda de Demacia a abrir os portões”, “Selar uma fenda do Vazio”.'])}` },
      { id: 'reviravoltas', title: 'Reviravoltas', body: `
        <p>Reviravoltas complicam o sucesso sem apagá-lo: <b>nunca invalidam</b> o que o campeão conseguiu. Elas acrescentam custos, penalidades ou ameaças. Para escolher, combine um tipo com a gravidade (menor ou maior) e use os dados que o jogador rolou:</p>
        ${ul(['<b>Atrapalhar:</b> imponha uma penalidade pelo dado Máx; ou persistente e exclusiva pelo dado Mín; um campeão perde uma habilidade Verde por um tempo; ou um poder/qualidade cai de tamanho. Na maior, use Máx+Mín ou atinja todos no local.', '<b>Fortalecer antagonistas:</b> dê um bônus a um antagonista ou grupo (dado Máx ou Mín persistente e exclusivo); ou suba um dado dele por um tempo.', '<b>Causar dano:</b> um perigo do ambiente atinge um campeão pelo dado Médio (menor) ou mais forte (maior).', '<b>Criar um desafio:</b> um novo problema nasce do que acabou de dar certo.', '<b>Trazer ameaças:</b> chame lacaios em quantidade igual ao dado Mín (menor) ou ao Médio (maior).', '<b>Combinar:</b> misture elementos para criar um momento memorável, como Atrapalhar com o Máx e chamar lacaios iguais ao Mín.'])}
        <p class="muted">Para sortear ideias por região, use o gerador de reviravoltas da Mesa do Mestre, acima.</p>` },
      { id: 'lacaios', title: 'Lacaios', body: `
        <p>Lacaios são ameaças simples que desgastam a Vida dos campeões: <b>1 por campeão</b>, cada um com um dado. Montar um leva alguns segundos:</p>
        ${ol(['<b>Nome e conceito:</b> visualize quem ou o que é.', '<b>Dado:</b> o tamanho do dado define o perigo (tabela abaixo). Dado alto em grande número é perigoso demais: prefira bônus a dados maiores.', '<b>Descrição:</b> como ataca (de perto ou de longe, físico ou energético) e o que o torna uma ameaça.', '<b>Habilidade (opcional):</b> uma, no máximo duas.', '<b>Tática (opcional):</b> um lembrete de como agem.'])}
        ${table(['Dado', 'Exemplos de lacaios'], MINION_DICE)}
        <h4>Habilidades de lacaio</h4>
        ${ul(MINION_ABILITIES)}
        <p class="muted">Bônus e penalidades de lacaios ficam entre +1 e +3; o mais comum é +2 (ou +1 para efeitos mais fortes).</p>` },
      { id: 'tenentes', title: 'Tenentes', body: `
        <p>Tenentes são lacaios mais complexos: <b>um dado maior, uma ou mais habilidades e um papel claro</b> na cena (comandar lacaios, dar apoio, atrapalhar). Um tenente vale por dois lacaios na conta da cena. Crie como um lacaio, com 2 ou 3 habilidades escolhidas da lista acima, e escreva a tática dele em uma linha. Veículos e máquinas de guerra dos antagonistas também entram aqui.</p>` },
      { id: 'viloes', title: 'Antagonistas', body: `
        <p class="muted">Prefere montar direto? Use a <a href="#bp-montador">Oficina de Antagonista</a> logo abaixo: ela traz as listas completas de habilidades de cada abordagem e arquétipo.</p>
        <p>Um antagonista fica entre um campeão e todo o resto: tem poderes, qualidades, um status, Vida e habilidades. É <b>menor</b> se usa só os números básicos e <b>maior</b> se tem melhorias. Passos:</p>
        ${ol(['<b>Conceito:</b> quem é, o que quer e como bate de frente com seus campeões.', '<b>Abordagem:</b> dá poderes, qualidades, Vida base e habilidades da forma como ele age.', '<b>Poderes e qualidades:</b> distribua dados da lista de poderes e qualidades; ele também tem uma qualidade de interpretação.', '<b>Arquétipo:</b> como ele luta e do que se importa numa cena (de que depende seu status). Dá Vida e habilidades.', '<b>Melhorias (opcional):</b> cada uma ajuda a enfrentar mais um campeão.', '<b>Maestria (opcional, só com melhorias):</b> uma opção de Superar automática, como os princípios dos campeões.', '<b>Vida:</b> some os valores (abaixo) e finalize com aparência, jeito de falar e motivos.'])}
        <h4>Abordagens</h4>
        ${table(['Abordagem', 'Poderes sugeridos', 'Qualidades sugeridas', 'Vida base'], APPROACHES)}
        <h4>Arquétipos</h4>
        ${table(['Arquétipo', 'Do que se importa', 'Vida'], ARCHETYPES)}
        <h4>Melhorias</h4>
        ${table(['Melhoria', 'Quando usar', 'Vida'], UPGRADES)}
        <h4>Maestrias</h4>
        <p>A maestria é uma habilidade <b>passiva</b> que só antagonistas <b>com melhorias</b> ganham, no máximo uma. Ela dá um <b>sucesso automático em um Superar</b> (resolver um problema fora do combate: convencer, conquistar, construir, enriquecer, abrir uma fenda) <b>enquanto a condição dela for cumprida</b>. Não se rola dado, e ela não vale para atacar.</p>
        ${ul(['<b>Quando usar:</b> sempre que o antagonista agir entre cenas ou numa cena de desafio, e a condição for verdadeira. É a “marca” dele fora da luta.', '<b>Como os campeões enfrentam:</b> não adianta contestar o resultado, e sim <b>quebrar a condição</b>: cortar o contrato do mercenário, destruir o laboratório, tirar o antagonista do comando da tropa, impedir o ritual.', '<b>Como escolher:</b> combine com o que o antagonista faz fora da briga (a Dra. Kaelor, de Zaun, com a Ciência Louca; Mareya, das Ilhas das Sombras, com o Inconcebível).'])}
        ${table(['Maestria', 'Vale enquanto…', 'Efeito', 'Exemplo em Runeterra'], VD.masteries.map(x => [x.n, x.cond, x.x, x.ex]))}
        <h4>Vida do antagonista</h4>
        <p><b>Vida = Vida da abordagem + Vida do arquétipo + 5 × N + Vida das melhorias.</b> Para ${N} campeões, são ${5 * N} pontos de Vida extras. Exemplo: abordagem Orgulhosa (25) com arquétipo Predador (+15) para ${N} campeões é ${hp(25, 15, 0)}.</p>
        <p>Para saber a zona de um antagonista que muda de status pela Vida (como o Brutamontes), use esta tabela:</p>
        ${table(['Vida máxima', 'Verde', 'Amarela', 'Vermelha'], HEALTH_CHART)}
        <p class="muted">Não existe uma única forma certa de montar um antagonista: troque abordagem e arquétipo entre aparições, se a história pedir.</p>` },
      { id: 'ambientes', title: 'Ambientes', body: `
        <p>Um ambiente é um lugar que vira ameaça: complica a cena e deixa o cenário vivo. Dá mais trabalho que um desafio, então comece adaptando os exemplos da prateleira. Passos:</p>
        ${ol(['<b>Nome:</b> define o tamanho (um mercado, uma torre, uma cidade inteira, outro plano).', '<b>Três traços:</b> características e não ameaças (“Fumaça Tóxica”, não “Tubo de gás”).', '<b>Um dado por traço:</b> mede o impacto na cena (tabela abaixo). Se não souber, use d6 e d8.', '<b>Reviravoltas:</b> 2 a 3 menores e 1 maior por zona (Verde, Amarela e Vermelha). A cena vai de <b>estável</b> para <b>em deterioração</b> e <b>em colapso</b>.'])}
        ${table(['Dado', 'Impacto na cena'], ENV_DICE)}
        <p>As reviravoltas do ambiente funcionam como habilidades: usam ações básicas (Atacar para perigos passivos, Atrapalhar para dificuldades, Fortalecer ou Defender para vantagens, Superar para resolver um desafio) com os dados Mín, Médio e Máx do ambiente.</p>` },
      { id: 'sessoes', title: 'Juntar tudo numa sessão e numa memória', body: `
        <p>Uma <b>sessão</b> reúne 2 a 3 cenas de ação e as cenas sociais e de montagem que as ligam. Cenas sociais e de montagem quase sempre nascem do jogo: improvise e acrescente só o que deixa a cena divertida. Se planejar uma cena social, anote o que ela precisa conseguir, o que cada personagem sabe e que desafios os campeões terão.</p>
        <p>Seis sessões formam uma <b>memória</b>, um arco da história. Faça uma lista de sessões possíveis, mas deixe vários caminhos abertos, porque os jogadores vão para onde você não espera. Antecipe cenas que eles querem viver (o covil do antagonista, aquela luta contra a criatura). Na última sessão da memória, ofereça mudanças: um mentor que deixa um legado, uma descoberta, um sacrifício. Elas não precisam seguir as regras ao pé da letra, desde que combinem com a história.</p>
        <p class="muted">Recompensas alternativas: em vez de pontos de inspiração, você pode oferecer benefícios temporários por uma sessão (uma habilidade Vermelha emprestada, um dado maior), sem repeti-los em sessões seguidas.</p>` }
    ];
  }

  function minionCard(m, kind, N) {
    const abs = kind === 'lieutenant' ? m.a : (m.a ? [m.a] : []);
    return `<article class="gm-bp-card"><header><h4>${esc(m.n)}</h4><span class="gm-bp-tag">${kind === 'lieutenant' ? 'Tenente' : 'Lacaios'} ${die(m.d)}</span></header>
      <p>${esc(m.t)}</p>
      ${abs.map(a => `<p><b>${esc(a[0])}.</b> ${esc(a[1])}</p>`).join('')}
      <p class="muted"><i>Tática:</i> ${esc(m.tac)}</p>
      <button type="button" class="btn small" data-bp="foe" data-kind="${kind}" data-name="${esc(m.n)}" data-die="${m.d}">Adicionar à mesa ${kind === 'lieutenant' ? '(' + Math.max(1, Math.ceil(N / 2)) + ')' : '(' + N + ')'}</button></article>`;
  }
  function villainCard(v, N) {
    const upH = v.up.reduce((s, u) => s + u[1], 0), total = v.baseH + v.archH + 5 * N + upH;
    return `<article class="gm-bp-card gm-bp-villain"><header><h4>${esc(v.n)}</h4><span class="gm-bp-tag">${esc(v.where)}</span></header>
      <p>${esc(v.sum)}</p>
      <p class="muted"><b>Abordagem:</b> ${esc(v.ap)} (${v.baseH}) · <b>Arquétipo:</b> ${esc(v.arch)} (${v.archH >= 0 ? '+' : ''}${v.archH})${v.up.length ? ' · <b>Melhorias:</b> ' + v.up.map(u => esc(u[0]) + (u[1] ? ' (+' + u[1] + ')' : '')).join(', ') : ' · antagonista menor'}${v.mastery ? ' · <b>' + esc(v.mastery) + '</b>' : ''}</p>
      <p><b>Dados:</b> ${dt(v.pq)}</p>
      ${v.ab.map(a => `<p><b>${esc(a[0])}</b> <span class="gm-bp-ty">${a[1]}</span> ${dt(a[2])}</p>`).join('')}
      <p class="muted"><i>Como usar:</i> ${esc(v.tip)}</p>
      <p><b>Vida para ${N} campeões:</b> ${v.baseH} + ${v.archH} + 5×${N}${upH ? ' + ' + upH : ''} = <b>${total}</b></p>
      <button type="button" class="btn small" data-bp="villain" data-name="${esc(v.n)}" data-max="${total}">Adicionar à mesa (Vida ${total})</button></article>`;
  }
  const envCard = e => `<article class="gm-bp-card"><header><h4>${esc(e.n)}</h4><span class="gm-bp-tag">${esc(e.where)}</span></header>
      <p><b>Traços:</b> ${e.tr.map(t => `${esc(t[0])} ${die(t[1])}`).join(' · ')}</p>
      ${e.st.map(s => `<p class="gm-bp-zone z-${({ Verde: 'g', Amarela: 'y', Vermelha: 'r' })[s[0]]}"><b>${s[0]}.</b> ${dt(s[1])}<br>${dt(s[2])}</p>`).join('')}</article>`;
  const advCard = a => `<article class="gm-bp-card"><header><h4>${esc(a.n)}</h4></header><p><i>${esc(a.hook)}</i></p>
      <ol class="gm-bp-scenes">${a.scenes.map(s => `<li><b>${esc(s[1])}.</b> ${esc(s[2])}</li>`).join('')}</ol><p class="muted"><b>Fim:</b> ${esc(a.end)}</p></article>`;

  window.GM_BULLPEN = {
    render(root) {
      let N = 4;
      const draw = () => {
        const G = guide(N);
        const nav = [['bp-guia', 'Como criar'], ['bp-sessao', 'Montar uma sessão'], ['bp-montador', 'Oficina de Antagonista'], ['bp-lacaios', 'Lacaios'], ['bp-tenentes', 'Tenentes'], ['bp-viloes', 'Antagonistas'], ['bp-ambientes', 'Ambientes'], ['bp-aventuras', 'Aventuras']];
        root.innerHTML = `<section class="gm-bp" id="bancada">
          <div class="gm-fl-head"><div><div class="eyebrow">Guia do Mestre</div><h2>Bancada do Mestre</h2>
            <p class="muted">Como criar cenas, desafios, lacaios, tenentes, antagonistas e ambientes, com exemplos prontos de Runeterra. Adapta os capítulos <i>Bullpen</i>, <i>Adventure Issues</i> e <i>The Archives</i> do <em>Sentinel Comics RPG</em>; os exemplos são originais.</p></div>
            <label class="gm-bp-n">Campeões na cena (N)<select data-bp="n">${[2, 3, 4, 5, 6].map(n => `<option${n === N ? ' selected' : ''}>${n}</option>`).join('')}</select></label></div>
          <nav class="gm-fl-index">${nav.map(n => `<a href="#${n[0]}">${n[1]}</a>`).join('')}</nav>
          <div id="bp-guia"><h3>Como criar</h3>${G.map(g => `<details class="gm-bp-sec" id="g-${g.id}"${g.id === 'cenas' ? ' open' : ''}><summary>${esc(g.title)}</summary>${g.body}</details>`).join('')}</div>
          <div id="bp-sessao"><h3>Montar uma sessão</h3>
            <p>Use este molde como ponto de partida: abra com um gancho, alterne cenas sociais, de montagem e de ação, e termine com uma consequência que alimente a próxima sessão.</p>
            ${ol(['<b>Gancho:</b> um problema que os campeões têm motivo para resolver.', '<b>Cena social ou de montagem:</b> informação, aliados, preparação.', '<b>Ação (fácil ou moderada):</b> aquece e mostra o estilo do antagonista ou do ambiente.', '<b>Interlúdio:</b> descanso, escolhas difíceis, uma revelação.', '<b>Ação (difícil):</b> o confronto com o antagonista no ambiente, com um desafio central.', '<b>Desfecho:</b> consequências, anotação na Sessões Anteriores e ganchos para a próxima.'])}
          </div>
          <div id="bp-montador"><h3>Oficina de Antagonista</h3><p class="muted">Monte um antagonista passo a passo, como na Forja de Campeões: abordagem, dados, habilidades, arquétipo, melhorias e maestria, com cartas que mostram tudo antes de você escolher. No fim sai uma ficha para imprimir, exportar em PDF ou salvar em .json, com retrato e nomes só seus para poderes, qualidades e habilidades.</p>
            <div class="gm-bp-btns"><a class="btn primary" href="antagonista.html">${(window.ICO ? window.ICO('codex') : '')} Abrir a Oficina de Antagonista</a></div></div>
          <div id="bp-lacaios"><h3>Exemplos: lacaios</h3><div class="gm-bp-grid">${MINIONS.map(m => minionCard(m, 'minion', N)).join('')}</div></div>
          <div id="bp-tenentes"><h3>Exemplos: tenentes</h3><div class="gm-bp-grid">${LIEUTENANTS.map(m => minionCard(m, 'lieutenant', N)).join('')}</div></div>
          <div id="bp-viloes"><h3>Exemplos: antagonistas</h3><div class="gm-bp-grid">${VILLAINS.map(v => villainCard(v, N)).join('')}</div></div>
          <div id="bp-ambientes"><h3>Exemplos: ambientes</h3><div class="gm-bp-grid">${ENVS.map(envCard).join('')}</div></div>
          <div id="bp-aventuras"><h3>Exemplos: aventuras de uma sessão</h3><div class="gm-bp-grid">${ADVENTURES.map(advCard).join('')}</div></div>
          <p class="muted gm-fl-credit">Regras de <em>Sentinel Comics: The Roleplaying Game</em> © Greater Than Games. Runeterra e League of Legends © Riot Games.</p>
        </section>`;
      };
      const keepOpen = () => [...root.querySelectorAll('details[open]')].map(d => d.id);
      root.addEventListener('change', ev => {
        if (ev.target.dataset.bp !== 'n') return;
        const open = keepOpen(), y = scrollY;
        N = +ev.target.value; draw();
        open.forEach(id => { const d = root.querySelector('#' + id); if (d) d.open = true; });
        scrollTo(0, y);
      });
      root.addEventListener('click', ev => {
        const b = ev.target.closest('[data-bp="foe"], [data-bp="villain"]');
        const a = ev.target.closest('a[href^="#bp-"]');
        if (a) {
          const t = root.querySelector(a.getAttribute('href'));
          if (t) { ev.preventDefault(); scrollTo({ top: scrollY + t.getBoundingClientRect().top - 140, behavior: 'smooth' }); }
          return;
        }
        if (!b || !window.GM_TOOLS) return;
        if (b.dataset.bp === 'foe') window.GM_TOOLS.addFoe(b.dataset.name, b.dataset.kind, b.dataset.die, b.dataset.kind === 'lieutenant' ? Math.max(1, Math.ceil(N / 2)) : N);
        else window.GM_TOOLS.addVillain(b.dataset.name, +b.dataset.max);
        const old = b.textContent; b.textContent = 'Adicionado na Mesa do Mestre'; b.disabled = true;
        setTimeout(() => { b.textContent = old; b.disabled = false; }, 1600);
      });
      draw();
    }
  };
})();
