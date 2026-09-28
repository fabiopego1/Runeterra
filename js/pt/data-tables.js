// pt-BR: Origens, Fontes de Poder, Caminhos, Temperamentos, Supremas e Reviravoltas.
// Só os textos exibidos mudam; ids, dados e listas (a lógica das regras) ficam intactos.
(() => {
  'use strict';
  const W = window;
  const patch = (list, map, fn) => { for (const x of list) { const v = map[x.id]; if (v) fn(x, v); } };

  // [nome, subtítulo, lore]
  patch(W.BACKGROUNDS, {
    'upper-class': ['Casa Nobre', 'Nascido numa Grande Casa, num Clã piltovano ou numa linhagem noxiana.', 'Você cresceu entre os Coroa-Brava de Demacia, os clãs Kiramman e Medarda de Piltover ou numa casa noxiana gananciosa. Riqueza, etiqueta e expectativas te moldaram muito antes de qualquer poder.'],
    'blank-slate': ['Despertar sem Nome', 'Você não se lembra de nada antes do dia em que acordou.', 'Talvez você tenha rastejado para fora de uma tumba shurimane, sido cuspido na praia pela Névoa Negra ou apagado por um mago noxiano. O que você era se foi; o que você vai ser começa agora.'],
    struggling: ['Sobrevivente das Profundezas', 'Criado nos poços de Zaun ou nas favelas de Águas de Sentina.', 'Sem dinheiro e sem sorte, você respirou a Névoa Cinza, fugiu dos capangas dos barões químicos e aprendeu que ninguém lá de cima viria te salvar.'],
    adventurer: ['Explorador & Caçador de Tesouros', 'Ruínas, relíquias e a emoção do desconhecido.', 'Você já vasculhava ruínas shurimanes, mapeava as selvas de Ixtal ou corria atrás de boatos de Runas perdidas muito antes de o destino te encontrar.'],
    unremarkable: ['Gente Comum', 'Você era fazendeiro, ferreiro, pescador ou pastor. Até que tudo mudou.', 'Você levava uma vida tranquila num vilarejo demaciano, num sítio ioniano ou num forte freljordiano até que a guerra, a magia ou o destino bateram à porta.'],
    law: ['Xerife & Caçador de Magos', 'Xerife de Piltover, Caçador de Magos demaciano, executor noxiano.', 'Você fez carreira mantendo a ordem: perseguindo contrabandistas de químicos por Piltover, caçando magos para a coroa demaciana ou impondo a vontade de Noxus. Talvez ainda carregue o distintivo.'],
    academic: ['Erudito da Academia', 'A Academia de Piltover, um mosteiro ioniano, um arquivo shurimane.', 'Você foi atrás do conhecimento, fosse teoria hextec, saber espiritual ou escrita shurimane antiga, e essa busca te levou direto para o perigo.'],
    tragic: ['Marcado pela Perda', 'Um único acontecimento terrível te define.', 'A Ruína levou alguém que você amava, Noxus queimou seu vilarejo ou um culto Darkin massacrou sua família. A tragédia te move e, ao mesmo tempo, te assombra.'],
    performer: ['Estrela dos Palcos', 'Bardo, dançarino, duelista de espetáculo ou sensação de Piltover.', 'Você nasceu para uma plateia, seja nos salões de música de Piltover, nas danças dos festivais de Ionia ou nas fossas de gladiadores das arenas noxianas.'],
    military: ['Soldado das Legiões', 'Vanguarda Destemida, Legião Noxiana, bando de guerra freljordiano.', 'Você sangrou numa guerra organizada, fosse numa muralha de escudos demaciana, numa legião noxiana ou num saque freljordiano, e ainda se move como um soldado.'],
    retired: ['Velha Lenda, Chamada de Volta', 'Você pendurou a espada há muito tempo. Agora ela te chama de novo.', 'Seus feitos são cantados em tavernas de Águas de Sentina a Rakelstake, mas você deixou essa vida para trás. Algo te arrastou de volta para uma última luta.'],
    criminal: ['Pilantra & Fora da Lei', 'Contrabandista, pirata ou traficante de químicos tentando virar a página.', 'Você passou tempo demais do lado errado da lei nas docas de Águas de Sentina ou nos antros químicos de Zaun. Agora usa seus talentos para algo melhor... quase sempre.'],
    medical: ['Curandeiro & Químico', 'Cirurgião zaunita, herbalista ioniano, curandeiro de Targon.', 'Você remendou os feridos, seja com estimulantes quimtec nas profundezas de Zaun, emplastros de flor espiritual em Ionia ou luz das estrelas no Monte Targon.'],
    anachronistic: ['Relíquia de uma Era Perdida', 'Um Ascendente da antiga Shurima, ou alguém perdido no tempo.', 'Você pertence a outra época, seja a era de ouro de Shurima, as Guerras Rúnicas ou um futuro ainda não escrito. Este tempo não é o seu, mas você luta por ele mesmo assim.'],
    exile: ['Exilado', 'Expulso, fugitivo ou mandado para longe de casa.', 'Sua terra natal te marcou como traidor, desertor ou monstro. Você vaga longe de casa, abrindo o próprio caminho em terras que não confiam em você.'],
    'former-villain': ['Vilão Redimido', 'Você já serviu à Rosa Negra, a um barão químico ou a um Darkin.', 'Você já lutou contra os heróis a serviço de um chefão do crime, de uma cabala noxiana ou de algo mais sombrio. Mudou de lado, mas muita gente ainda não confia em você.'],
    interstellar: ['Filho das Estrelas', 'Visitante celestial, ser forjado nas estrelas ou mistério de Targon.', 'Você vem de além do céu. Pode ser um ser celestial, uma estrela caída ou um mortal que tocou os céus no alto do Monte Targon. Os costumes de Runeterra te parecem estranhos.'],
    dynasty: ['Linhagem de Lendas', 'Sua família produz campeões há gerações.', 'Seja descendente de imperadores shurimanes, herdeiro da linhagem Escudo da Luz ou filho de uma casa elemental de Ixtal, todos esperam heroísmo de você.'],
    otherworldly: ['Sangue Espiritual', 'Vastaya, yordle ou tocado por um semideus. Humano, só em parte.', 'Você carrega o sobrenatural no sangue: um vastaya de Ionia, um yordle de Bandópolis, ou filho de um semideus freljordiano ou de um espírito das Primeiras Terras.'],
    created: ['Constructo Forjado', 'Construído numa oficina zaunita ou desperto por magia antiga.', 'Você foi feito, não nasceu. Pode ser um golem a vapor de Zaun, uma dançarina de relojoaria de Piltover ou um colosso de petricita de Demacia. Ainda assim, algo em você responde ao chamado.']
  }, (x, v) => { x.rt = v[0]; x.sub = v[1]; x.lore = v[2]; });

  // [nome, subtítulo, lore, texto do bônus especial]
  patch(W.POWER_SOURCES, {
    accident: ['Acidente Arcano', 'Um cristal hextec rachou, um fragmento de Runa brilhou, e você estava lá.', 'Um evento externo forçou poder para dentro de você: um derretimento hextec, um contato com uma Runa Global, um vazamento num laboratório de Cintilante. Isso te mudou para sempre.'],
    training: ['Disciplina & Maestria', 'Poder conquistado no suor, seja no Wuju, com os Kinkou ou nas escolas de espada de Demacia.', 'Nada de magia, nada de mutação: seu poder são anos de treino num mosteiro ioniano, num salão de esgrima demaciano ou num fosso de treinamento noxiano.', 'No lugar de uma habilidade Verde: no próximo passo, escolha uma qualidade extra da lista de qualidades do seu Caminho em d8.'],
    genetic: ['Nascido com Magia', 'Você nasceu com magia no sangue, um dom que alguns reinos chamam de maldição.', 'Seu poder se manifestou sozinho, uma herança mágica de nascença. Em Demacia você seria caçado; em Ionia, celebrado; em Noxus, recrutado.'],
    experimentation: ['Cintilante & Experimentos Químicos', 'O laboratório do Singed, os tonéis de um barão químico, um escultor de carne noxiano.', 'Seu poder foi feito em laboratório e veio com efeitos colaterais. Quimtec, Cintilante ou alquimia distorcida reescreveram seu corpo.'],
    mystical: ['Feitiçaria', 'Magia estudada, um pacto com um espírito ou carne inscrita com runas.', 'Você aprendeu magia do jeito difícil, com os ensinamentos da Karma, um grimório da Rosa Negra ou runas entalhadas na sua pele por um mago errante.', 'No lugar de uma habilidade Verde: ganhe uma qualidade de Conhecimento em d10.'],
    nature: ['Espírito Selvagem', 'Os semideuses do Freljord, os espíritos de Ionia, os elementos de Ixtal.', 'O poder primordial de Runeterra corre por você, seja no uivo das tempestades do Volibear, no crescimento dos bosques espirituais de Ionia ou na magia selvagem de Ixtal.'],
    relic: ['Relíquia Ancestral', 'Uma manopla shurimane, uma arma dos Sentinelas da Luz, um fragmento de Gelo Verdadeiro.', 'Um objeto de significado místico te escolheu, ou te refez: uma manopla antiga de uma tumba enterrada, uma arma de pedra-relíquia, uma coroa de Gelo Verdadeiro.'],
    'powered-suit': ['Traje Hextec', 'Um exotraje hextec, um mecha yordle ou uma armadura quimtec te mantêm na luta.', 'Um traje de engenharia te dá seus poderes e talvez até te mantenha vivo. Cristais hextec azuis zumbem no núcleo dele.'],
    radiation: ['Exposição Quimtec', 'A Névoa Cinza, o brilho hextec bruto, um vazamento químico que deveria ter te matado.', 'A exposição tóxica carregou seu corpo com um poder perigoso, seja pela Névoa Cinza sufocante de Zaun, pelo brilho de um núcleo hextec sem blindagem ou pelos resíduos quimtec.'],
    'tech-upgrades': ['Aprimoramentos Hextec', 'Membros hextec, implantes quimtec, uma Evolução Gloriosa.', 'Implantes e aprimoramentos te dão poder: as pernas hextec da Camille, o corpo aumentado do Viktor, o coração bombeado a químicos de um zaunita.'],
    supernatural: ['Além do Véu', 'A morte, a Névoa Negra e o reino dos mortos te deram poder.', 'Você atravessou o véu entre a vida e a morte, seja tocado pela Névoa Negra, negociando com os Kindred ou voltando do Reino da Morte do Mordekaiser.', 'No lugar de uma habilidade Verde: ganhe um poder que NÃO está na lista acima, em d10.'],
    artificial: ['Construído, Não Nascido', 'Feito de relojoaria, vapor, petricita ou hextec, sua própria natureza é o seu poder.', 'Você foi criado, e suas habilidades vêm daquilo de que você é feito: engrenagens de latão, um coração hextec ou petricita viva.'],
    cursed: ['Maldição Darkin', 'Uma arma Darkin, um pacto de sangue, o toque da Ruína.', 'Uma maldição te prende, a você ou à sua linhagem, trazendo bênçãos e desgraças: uma lâmina Darkin sussurrante, um juramento de sangue noxiano, um rastro da Colheita Sombria.'],
    alien: ['Tocado pelo Vazio', 'O Vazio não é deste mundo, mas agora uma parte dele está em você.', 'Seu poder vem de fora da realidade: um simbionte do Vazio grudado na pele, um sussurro vindo de sob Icathia, ou um sangue que simplesmente não é de Runeterra.', 'No lugar de uma habilidade Verde: aumente um poder ou qualidade d6 para d8. Se você não tiver poderes d6, adicione um poder novo da lista acima em d6.'],
    genius: ['Inventor Brilhante', 'A melhor mente de Piltover, ou a mais perigosa de Zaun.', 'Seu intelecto assombroso é a sua arma: protótipos hextec, Z-Drives que dobram o tempo, bombas saltitantes de segurança duvidosa.', 'No lugar de uma habilidade Verde: ganhe uma qualidade extra de Conhecimento ou de Vontade & Astúcia em d10.'],
    cosmos: ['Aspecto Celestial', 'Um Aspecto de Targon desceu sobre você.', 'Você escalou o Monte Targon e as estrelas responderam: o Aspecto do Sol, da Lua, da Guerra ou do Protetor agora divide o corpo com você.', 'No lugar de uma habilidade Verde: diminua um poder d8/d10/d12 em um tamanho e aumente um poder d6/d8/d10 em um tamanho.'],
    extradimensional: ['Reino Espiritual', 'Você andou pelo Reino Espiritual e voltou mudado.', 'A exposição aos reinos do além deixou sua marca em você, seja no mundo espiritual de Ionia, no reino dos Observadores no Freljord ou nos espaços entre as coisas.'],
    unknown: ['Origem Misteriosa', 'Seu poder simplesmente... apareceu. Isso aponta para um mistério maior.', 'Ninguém sabe de onde veio seu poder. Nem os Kinkou, nem a Academia, nem mesmo você. Talvez um fragmento de Runa durma dentro de você.', 'No lugar de uma habilidade Verde: ganhe uma qualidade de Presença & Carisma em d8.'],
    'higher-power': ['Ascendentes & Semideuses', 'A bênção do Disco Solar, o favor de um semideus freljordiano.', 'Você foi escolhido por uma força maior, Ascendido sob o Disco Solar de Shurima ou marcado pelo Ornn, pelo Volibear ou pela Anivia. Ou talvez você SEJA um desses seres.'],
    multiverse: ['Runas da Criação & do Tempo', 'As Runas Globais, o fluxo do tempo, o próprio tecido de Runeterra.', 'Você foi arremessado pelo tempo e pela realidade pelas Runas Globais ou pelas correntes da magia do Zilean. Sem essa ruptura, você não seria quem é.', 'No lugar de uma habilidade Verde: ganhe um poder extra de qualquer categoria em d6.']
  }, (x, v) => { x.rt = v[0]; x.sub = v[1]; x.lore = v[2]; if (v[3] && x.extra) x.extra.text = v[3]; });
  // Caminhos: [nome, papel, lore, rótulo do dado obrigatório, nota Verde, nota Amarela, texto extra]
  patch(W.ARCHETYPES, {
    speedster: ['Borrão', 'Escaramuçador', 'Rápido demais para ser pego: um dançarino de lâminas Wuju, um zaunita que corre a relâmpago, um cavaleiro espectral.', 'Ligeireza (Speed)', 'Cada uma usando um poder ou qualidade diferente da lista do Borrão.'],
    shadow: ['Assassino', 'Assassino', 'Você age nas sombras, com sutileza e astúcia, como um ninja Kinkou, uma faca da Rosa Negra ou um Ceifador de Águas de Sentina.', 'Furtividade (Stealth)', 'Cada uma usando um poder ou qualidade diferente da lista do Assassino.'],
    powerhouse: ['Colosso', 'Colosso', 'Você é a força bruta na linha de frente: o machado de Noxus, o rei morto-vivo imparável, a avalanche ambulante.', 'Força (Strength)', 'Cada uma usando um poder ou qualidade diferente da lista do Colosso (incluindo Força).', 'Uma das habilidades de Colosso acima, na Amarela, usando um poder ou qualidade diferente das suas Verdes.'],
    marksman: ['Atirador', 'Atirador', 'Sua arma é uma extensão da sua vontade: um rifle hextec, um arco de gelo freljordiano, as pistolas-relíquia dos Sentinelas.', 'Arma Emblemática', 'Uma usando sua Arma Emblemática e a outra usando uma das suas qualidades.', 'Usando duas qualidades diferentes.'],
    blaster: ['Mago de Batalha', 'Mago (Explosão / Artilharia)', 'Você arremessa destruição elemental pura: luz demaciana, chama rúnica, lanças arcanas de Shurima.', 'um poder de Elementos & Energias', 'Cada uma usa um poder diferente da sua lista de Mago de Batalha.', 'Usando dois poderes diferentes.'],
    cqc: ['Duelista', 'Lutador / Duelista', 'Aço contra aço. Você é como um duelista demaciano, um espadachim do vento ioniano ou um lutador das arenas noxianas.', 'Combate Corpo a Corpo (qualidade Close Combat)', 'Pelo menos uma usando Combate Corpo a Corpo e outra usando um dos seus poderes.', 'Uma das habilidades de Duelista acima, na Amarela, usando um poder ou qualidade diferente de todas as suas Verdes.'],
    armored: ['Guardião', 'Tanque / Vanguarda', 'Você é a muralha: uma porta-escudo freljordiana, um baluarte de petricita demaciano, o Aspecto do Sol encouraçado.', null, 'Usando pelo menos dois poderes diferentes.'],
    flyer: ['Filho dos Céus', 'Escaramuçador Aéreo', 'O céu é seu campo de batalha, como o de uma patrulheira demaciana e sua águia, de um yordle num girocóptero ou de um Aspecto alado.', 'Voo ou uma Montaria Emblemática', 'Pelo menos uma usando Voo ou sua Montaria Emblemática.', 'Uma das habilidades de Filho dos Céus acima, na Amarela.'],
    elemental: ['Elementalista', 'Mago (Controle)', 'Você dobra os próprios elementos: a terra e a água de Ixtal, o gelo do Freljord, a pedra de Shurima tecida como linha.', 'um poder de Elementos & Energias', 'As duas precisam usar seus poderes de Elementos & Energias.', 'Usando um dos seus poderes de Elementos & Energias.'],
    robot: ['Autômato', 'Constructo / Aprimorado', 'Metal e hextec te definem, seja você construído do zero ou reconstruído pela Evolução Gloriosa.', null, null, 'Uma das habilidades de Autômato acima, na Amarela.', 'Atribua um d8 a um poder de Hextec & Quimtec que você ainda não tenha.'],
    sorcerer: ['Arcanista', 'Mago', 'Você empunha magia bruta em todas as formas, da magia rúnica à feitiçaria sombria e aos encantamentos aprendidos em tomos proibidos.'],
    psychic: ['Tecelão de Mentes', 'Encantador / Mago de Controle', 'Sua mente é a arma, seja pelo encanto de uma vastaya, por esferas telecinéticas de soberania sombria ou por visões do que está por vir.', 'pelo menos dois poderes de Magia Mental (Psychic)', null, 'Só habilidades cujo poder ou qualidade associado você tenha.'],
    transporter: ['Desbravador', 'Andarilho / Tecelão de Portais', 'Você leva a si e aos outros aonde precisam estar, seja pelas Jornadas Mágicas do Bard, por fendas do Vazio ou por uma carta do Destino.', 'uma Montaria Emblemática ou um poder de Movimento', null, 'Uma das habilidades de Desbravador acima, na Amarela.'],
    'minion-maker': ['Invocador', 'Invocador / Conjurador', 'Você nunca luta sozinho: torretas, Donzelas da Névoa, plantas mordedoras ou um urso bem grande pegando fogo.', null, 'Você ganha as duas, cada uma usando um poder diferente.'],
    'wild-card': ['Trapaceiro', 'Trapaceiro', 'Ninguém sabe o que vem a seguir, muito menos você. Caixas-surpresa, mimetismo que muda de forma, caos alegre.'],
    'form-changer': ['Metamorfo', 'Metamorfo', 'Você alterna entre formas: caçadora e puma, guerreira com sangue de dragão, yordle pequenininho e fera enorme.', 'um poder de Magia Corporal'],
    gadgeteer: ['Engenhoqueiro', 'Inventor', 'Bolsos cheios de protótipos: bombas saltitantes, torretas hextec, Z-Drives e bugigangas espertas.', 'um poder de Mente & Sentidos'],
    'reality-shaper': ['Cronomante', 'Dobrador do Destino', 'Você dobra o tempo e a probabilidade, voltando segundos, roubando momentos e reescrevendo o que "acabou de acontecer".'],
    divided: ['Duas Almas', 'Natureza Dupla (avançado)', 'Dois seres dividem uma vida: um assassino das sombras e uma foice Darkin, um estudioso pacato e um monstro, um mortal e o Aspecto que o conduz.'],
    modular: ['Mestre das Posturas', 'Multimodo (avançado)', 'Você troca de modo no meio da luta: martelo para canhão, uma arma lunar para a outra, postura do tigre para postura da fênix.']
  }, (x, v) => {
    x.rt = v[0]; x.role = v[1]; x.lore = v[2];
    if (v[3] && x.req) x.req.label = v[3];
    if (v[4] && x.green) x.green.note = v[4];
    if (v[5] && x.yellow) x.yellow.note = v[5];
    if (v[6] && x.extra) x.extra.text = v[6];
    const needs = x.green && x.green.rules && x.green.rules.needs;
    if (needs) for (const n of needs) n.label = ({ 'your Signature Weapon': 'sua Arma Emblemática', 'one of your qualities': 'uma das suas qualidades', 'Melee Combat (Close Combat)': 'Combate Corpo a Corpo', 'one of your powers': 'um dos seus poderes', 'Flight or your Signature Mount/Vehicle': 'Voo ou sua Montaria Emblemática' })[n.label] || n.label;
  });

  // Duas Almas: métodos de transformação
  patch(W.DIVIDED.methods, {
    controllable: ['Pela Vontade', 'Você troca de forma por meio de algo que sempre controla, como uma palavra de poder, um gesto ritual ou um súbito clarão de luz. A troca sempre leva algum tempo.'],
    device: ['Pela Relíquia', 'Você se transforma por meio de um objeto: um implante hextec, uma arma Darkin, a coroa de um Aspecto. Perdeu o objeto, não consegue mudar.'],
    merging: ['Pelo Vínculo', 'Você precisa de alguém ou de algo: um parceiro disposto a se fundir com você, ou um corpo ou objeto para possuir.'],
    uncontrollable: ['Pela Fúria', 'Você se transforma sob estresse, querendo ou não. O Darkin aflora e a fera se solta.']
  }, (x, v) => { x.rt = v[0]; x.text = v[1]; });

  // Mestre das Posturas: descrição dos modos (o nome do modo é traduzido em I18N.names)
  const MODE = {
    Debilitator: 'Escolha quatro poderes do seu modo padrão: um no mesmo tamanho, um um tamanho abaixo (mín. d4), dois um tamanho acima (máx. d12). Neste modo você não pode Fortalecer, Defender nem Superar.',
    Improvement: 'Escolha quatro poderes: dois no mesmo tamanho, dois um tamanho acima (máx. d12). Neste modo você não pode Atacar nem Atrapalhar.',
    Scout: 'Escolha quatro poderes: dois no mesmo tamanho, um um tamanho abaixo (mín. d4), um um tamanho acima (máx. d12). Neste modo você não pode Atacar nem Fortalecer.',
    Analysis: 'Escolha quatro poderes: mantenha dois e aumente dois em um tamanho (máx. d12). Neste modo você não pode Atacar nem Defender.',
    Bombardment: 'Escolha três poderes: dois um tamanho abaixo (mín. d4) e um vira d12. Neste modo você não pode Fortalecer, Atrapalhar nem Superar.',
    Regeneration: 'Escolha dois poderes: mantenha um e aumente o outro em dois tamanhos (máx. d12). Neste modo você não pode Atacar nem Atrapalhar.',
    Skirmish: 'Escolha quatro poderes: um no mesmo tamanho, um um tamanho abaixo (mín. d4), dois um tamanho acima (máx. d12). Neste modo você não pode Fortalecer, Defender nem Superar.',
    Stalwart: 'Escolha quatro poderes: um no mesmo tamanho, dois um tamanho abaixo (mín. d4), um dois tamanhos acima (máx. d12). Neste modo você não pode Atrapalhar nem Superar.',
    Destroyer: 'Escolha três poderes: mantenha dois e aumente outro em um tamanho (máx. d12). Neste modo você fica imóvel e não pode Fortalecer.',
    'Hunter/Killer': 'Escolha dois poderes e aumente cada um em um tamanho (máx. d12). Neste modo você não pode Defender nem Superar.',
    Shield: 'Escolha quatro poderes: dois no mesmo tamanho, dois um tamanho acima (máx. d12). Neste modo você não pode Atacar.'
  };
  for (const z of ['green', 'yellow', 'red']) for (const m of W.MODULAR[z]) if (MODE[m.name]) m.text = MODE[m.name];

  // Temperamentos: nome runeterrano
  patch(W.PERSONALITIES, {
    'lone-wolf': ['Lobo Solitário'], 'natural-leader': ['Líder Nato'], impulsive: ['Inconsequente'], mischievous: ['Travesso'],
    sarcastic: ['Língua Afiada'], distant: ['Distante'], stalwart: ['Inabalável'], 'fast-talking': ['Lábia de Prata'],
    inquisitive: ['Curioso'], alluring: ['Encantador'], stoic: ['Estoico'], nurturing: ['Protetor'], analytical: ['Calculista'],
    decisive: ['Decidido'], jovial: ['Bonachão'], cheerful: ['Radiante'], naive: ['Ingênuo'], apathetic: ['Indiferente'],
    jaded: ['Desiludido'], arrogant: ['Arrogante']
  }, (x, v) => { x.rt = v[0]; });
  const jovial = W.PERSONALITIES.find(x => x.id === 'jovial');
  if (jovial) jovial.champs = 'Gragas, Braum, Ornn (num dia bom)';

  // Reviravoltas do Destino: nome + descrição em pt (sc continua sendo a regra em inglês)
  patch(W.RETCONS, {
    'swap-powers': ['Dons Trocados', 'Troque dois dados quaisquer entre os seus poderes.'],
    'swap-quals': ['Retreinado', 'Troque dois dados quaisquer entre as suas qualidades.'],
    'change-ability': ['Nova Técnica', 'Escolha um poder ou qualidade diferente para uma das suas habilidades.'],
    'add-d6': ['Talento Oculto', 'Adicione um poder ou qualidade d6 de qualquer categoria.'],
    'red-up': ['Vontade de Ferro', 'Aumente seu dado de status Vermelho em um tamanho (máximo d12).'],
    'change-principle': ['Convicções Mudadas', 'Troque um dos seus princípios por qualquer outro princípio.'],
    'extra-red': ['Reservas Ocultas', 'Ganhe uma habilidade Vermelha extra, como descrito no passo das Supremas.']
  }, (x, v) => { x.rt = v[0]; x.desc = v[1]; });
})();
