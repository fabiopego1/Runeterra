// pt-BR: traços, categorias, dados, glossário, regiões e textos de passo.
// Os nomes do livro (sc) ficam em inglês só para uso interno e para o Escudo do Mestre; o resto é adaptado.
(() => {
  'use strict';
  const W = window;

  W.DICE_INFO = {
    d4: { power: 'Quase nada', quality: 'Sem treino', status: 'não se aplica', note: 'O menor dado. Normalmente só aparece por penalidades, modos do Mestre das Posturas ou quando você não tem poder/qualidade para usar (ex.: a Vida usa d4 se você não tiver poder Atlético nem qualidade Mental).' },
    d6: { power: 'Acima da média', quality: 'Competência sólida', status: 'Vacilante' },
    d8: { power: 'Impressionante', quality: 'Habilidoso', status: 'Firme' },
    d10: { power: 'Excepcional', quality: 'Especialista', status: 'Determinado' },
    d12: { power: 'Divino, digno de Ascendentes e Aspectos', quality: 'Nível mundial', status: 'Disposto a dar tudo' }
  };

  // Categorias: nome runeterrano + nota. Itens: [nome, descrição, exemplo em Runeterra].
  const CAT = {
    'P:athletic': ['Corpo & Proeza', 'Capacidade física bruta, muito além do comum. Conta para a Vida inicial.'],
    'P:elemental': ['Elementos & Energias', 'Domínio sobre um elemento ou tipo de energia. Muitas habilidades pedem que você escolha um ([energia/elemento]).'],
    'P:hallmark': ['Equipamento Emblemático', 'Itens ou poderes que são só seus. Dê um nome a eles na ficha (ex.: "Rifle Hextec", "Rhaast", "Valor").'],
    'P:intellectual': ['Mente & Sentidos'],
    'P:materials': ['Matéria & Terra'],
    'P:mobility': ['Movimento'],
    'P:psychic': ['Magia Mental'],
    'P:selfcontrol': ['Magia Corporal'],
    'P:technological': ['Hextec & Quimtec'],
    'Q:information': ['Conhecimento'],
    'Q:mental': ['Vontade & Astúcia', 'Conta para a Vida inicial.'],
    'Q:physical': ['Combate & Ofício'],
    'Q:social': ['Presença & Carisma']
  };
  const ITEM = {
    agility: ['Agilidade', 'Seus reflexos são afiados.', 'A Akali saltando entre suas cortinas de fumaça; o jogo de pés líquido da Nilah.'],
    speed: ['Ligeireza', 'Você é rápido nos pés.', 'A investida Highlander do Master Yi; as arrancadas elétricas da Zeri.'],
    strength: ['Força', 'Você é forte e não tem problema em levantar peso.', 'A investida imparável do Sion; o Braum erguendo uma porta-escudo como se fosse uma bandeja.'],
    vitality: ['Vitalidade', 'Você está em ótima forma e saúde. Em níveis altos, pode até se regenerar.', 'O Dr. Mundo ignorando qualquer coisa; a cura movida a sangue do Warwick.'],
    cold: ['Gelo & Gelo Verdadeiro', 'Você baixa a temperatura drasticamente e molda o gelo como quiser.', 'O Gelo Verdadeiro da Lissandra; as flechas congelantes da Ashe; a tempestade glacial da Anivia.'],
    cosmic: ['Poder Celestial', 'As energias primordiais do próprio universo obedecem a você.', 'A forja estelar do Aurelion Sol; os Aspectos de Targon; as travessuras cintilantes da Zoe.'],
    electricity: ['Relâmpago', 'Você comanda o raio.', 'O rifle-faísca da Zeri; as shurikens trovejantes do Kennen; as garras de tempestade do Volibear.'],
    fire: ['Chama', 'Você faz tudo pegar fogo.', 'O fogo rúnico do Brand; a Annie e o Tibbers; o fogo de dragão da Shyvana.'],
    infernal: ['Sombra & Névoa Negra', 'Você comanda energias sombrias e corruptoras do submundo.', 'A Névoa Negra das Ilhas das Sombras; a magia sombria da Morgana; a essência demoníaca da Evelynn.'],
    nuclear: ['Energia Hextec Bruta', 'Você canaliza poder bruto, volátil, e radiação.', 'Cristais hextec instáveis; o raio da morte do Viktor; o brilho de um núcleo rachado.'],
    radiant: ['Luz', 'A luz sagrada está na ponta dos seus dedos, pronta para expurgar o mal.', 'A luz prismática da Lux; o clarão solar da Leona; a luz da relíquia da Senna contra a Névoa.'],
    sonic: ['Canção & Som', 'Ondas sonoras concentradas, destrutivas ou imitadoras.', 'O etwahl da Sona; a voz da Seraphine; os... barulhos do Kog\'Maw.'],
    weather: ['Tempestade & Vento', 'Você controla o clima, tempestades e ventos.', 'As tempestades da Janna; a técnica do vento do Yasuo; o trovão do Volibear.'],
    'sig-vehicle': ['Montaria / Veículo Emblemático', 'Um veículo personalizado quase sempre à mão. Dê a ele o nome que tiver.', 'A Valquíria do Corki, a águia Valor da Quinn, a javalina de guerra Bristle da Sejuani, o cavalo da Rell.'],
    'sig-weapon': ['Arma Emblemática', 'Uma arma que é quase parte de você. Dê a ela o nome que tiver.', 'O rifle hextec da Caitlyn, a espada do Garen, a Sussurro do Jhin, uma lâmina Darkin.'],
    invented: ['Poder Personalizado (aprovação do Mestre)', 'Um poder que não está na lista, adicionado com a permissão do Mestre.', 'Qualquer coisa única, como os sinos do Bard ou as armas lunares do Aphelios.'],
    awareness: ['Sentidos Aguçados', 'Sentidos ampliados: sexto sentido para perigo, visão e audição superiores.', 'Os sentidos de caçador do Rengar; o olhar dos Kindred para quem está morrendo.'],
    deduction: ['Dedução', 'Sua mente dá saltos lógicos analisando detalhes.', 'A Caitlyn resolvendo um caso de Piltover a partir de uma única pegada.'],
    intuition: ['Intuição', 'Pressentimentos fortes que costumam se provar certos.', 'O senso de desequilíbrio de um Kinkou; a Ashe lendo o Freljord.'],
    'lightning-calculator': ['Mente Calculista', 'Matemática intensa num piscar de olhos.', 'As trajetórias instantâneas do Heimerdinger; a precisão de relojoaria da Orianna.'],
    presence: ['Presença Imponente', 'Você projeta sua personalidade com força sobre quem encontra.', 'O olhar do Swain; a postura imperial do Azir.'],
    metal: ['Moldar Metal', 'Você comanda e molda metais.', 'O ferro do Mordekaiser; a arte da forja do Ornn.'],
    plants: ['Crescimento Verdejante', 'As plantas respondem aos seus pensamentos e crescem como você quiser.', 'Os espinhos da Zyra; os amigos do Ivern; as mudas do Maokai.'],
    stone: ['Moldar a Terra', 'Você molda a pedra para construir e destruir.', 'A pedra tecida da Taliyah; o próprio Malphite; a rocha da Qiyana.'],
    toxic: ['Toxinas & Quimtec', 'Você manipula substâncias tóxicas e gases venenosos.', 'O rastro químico do Singed; a praga do Twitch; a Névoa Cinza de Zaun.'],
    transmutation: ['Transmutação', 'Você transforma materiais não vivos de um tipo em outro.', 'Areia virando pedra em Shurima; o Zilean envelhecendo objetos.'],
    flight: ['Voo', 'Você consegue voar.', 'As asas da Kayle; o Aurelion Sol cruzando os céus.'],
    leaping: ['Salto', 'Você salta pelo ar com facilidade.', 'O salto-foguete da Tristana; o bote do Rengar.'],
    momentum: ['Impulso', 'Você ganha impulso ao se mover e o canaliza com eficiência.', 'A bola de força do Rammus; o avanço devastador do Hecarim.'],
    swimming: ['Natação', 'À vontade na água (em d8+ você respira debaixo d\'água).', 'A Nami dos Marai; o Fizz na baía de Águas de Sentina.'],
    swinging: ['Gancho & Balanço', 'Com cordas ou engenhocas, você se balança pela cidade.', 'O gancho da Camille; a Jinx se balançando pelas profundezas de Zaun.'],
    teleportation: ['Lampejo & Portal', 'Some e reaparece em outro lugar; dados maiores dão mais alcance e controle.', 'O salto arcano do Ezreal; a caminhada pela fenda do Kassadin; o Destino do Twisted Fate.'],
    'wall-crawling': ['Escalada', 'Você gruda nas paredes e anda por elas rapidamente.', 'A Elise aranha; o Kha\'Zix correndo pelas ruínas.'],
    'animal-control': ['Fala das Feras', 'Você conversa com animais não racionais e os comanda.', 'O vínculo da Nidalee com a selva; os bichinhos do Ivern.'],
    illusions: ['Ilusões', 'Você tece imagens mentais convincentes.', 'As imagens espelhadas da LeBlanc; os disfarces da Neeko; a alucinação do Shaco.'],
    postcognition: ['Ecos do Passado', 'Você vê visões do que aconteceu com uma pessoa, lugar ou objeto.', 'Ler as memórias deixadas nas ruínas de Shurima.'],
    precognition: ['Presciência', 'Você vislumbra um futuro possível.', 'As visões da Karma; as profecias de Targon.'],
    'remote-viewing': ['Visão Distante', 'Você projeta seus sentidos para outro lugar.', 'Uma jornada espiritual Kinkou; os Kindred observando de longe.'],
    suggestion: ['Encanto & Compulsão', 'Você influencia mentes para que ajam segundo sua vontade.', 'O Encanto da Ahri; a sedução da Evelynn.'],
    telekinesis: ['Telecinese', 'Você move coisas com a mente.', 'As Esferas Sombrias da Syndra; as lâminas flutuantes da Irelia.'],
    telepathy: ['Fala Mental', 'Você envia pensamentos e lê mentes.', 'O Tahm Kench sussurrando barganhas; os sussurros do Vazio do Malzahar.'],
    absorption: ['Absorção', 'Você absorve a energia lançada contra você e a canaliza em outras formas.', 'A esfera nula do Kassadin; o Sylas roubando feitiços.'],
    'density-control': ['Controle de Densidade', 'Fique mais denso para resistir a danos, ou mais leve para flutuar.', 'O Galio endurecendo sua petricita; o escudo de granito do Malphite.'],
    duplication: ['Duplicação', 'Você cria cópias de si mesmo.', 'As sombras vivas do Zed; o chamariz do Wukong; o mímico da LeBlanc.'],
    elasticity: ['Elasticidade', 'Você consegue esticar o corpo inteiro.', 'O Zac, a Arma Secreta, quicando por Zaun.'],
    intangibility: ['Intangibilidade', 'Você atravessa objetos sólidos.', 'Espíritos das Ilhas das Sombras; o Nocturne deslizando através de paredes.'],
    invisibility: ['Camuflagem', 'Você se torna invisível.', 'A guerrilha do Teemo; a camuflagem do Vazio do Kha\'Zix; o Twitch.'],
    'part-detachment': ['Partes Destacáveis', 'Você pode dar uma mão a alguém. Literalmente.', 'O Soco-Foguete do Blitzcrank; a âncora do Nautilus, mais ou menos.'],
    shapeshifting: ['Metamorfose', 'Você muda para formas de tamanho parecido.', 'A forma de puma da Nidalee; o mimetismo da Neeko; a forma de aranha da Elise.'],
    'size-changing': ['Mudança de Tamanho', 'Cresça até virar um gigante ou encolha até o tamanho de um inseto.', 'O Gnar virando Mega Gnar; o Cho\'Gath se banqueteando; o Crescimento Selvagem da Lulu.'],
    gadgets: ['Engenhocas Hextec', 'Um monte de ferramentas úteis, geralmente feitas por outra pessoa.', 'As armadilhas de yordle da Caitlyn; o kit de um Xerife de Piltover.'],
    inventions: ['Invenções', 'Você inventa as próprias ferramentas e sempre carrega algumas.', 'O Z-Drive do Ekko; as cargas explosivas do Ziggs.'],
    'power-suit': ['Traje Hextec', 'Um traje tecnológico com muitas funções embutidas.', 'O mecha Tristy do Rumble; o corpo aprimorado do Viktor.'],
    robotics: ['Constructos & Torretas', 'Você constrói seus próprios servos robóticos.', 'As torretas H-28G do Heimerdinger; a Bola da Orianna.'],
    underworld: ['Contatos do Submundo', 'Você sempre conhece alguém que conhece alguém, seja receptador, contrabandista ou barão químico.', 'As docas de Águas de Sentina; os antros químicos de Zaun; os sussurros da Rosa Negra.'],
    'deep-space': ['Saber Celestial', 'Conhecimento dos céus e de seres além deste mundo.', 'A astrologia de Targon; os Celestiais e suas constelações.'],
    history: ['História', 'Conhecimento profundo de fatos históricos do mundo todo.', 'As Guerras Rúnicas, a queda de Shurima, a Ruína.'],
    'magical-lore': ['Saber Arcano', 'Tomos ocultos e os detalhes do místico e do arcano.', 'Runas Globais, a lore dos Darkin, a magia espiritual de Ionia.'],
    medicine: ['Medicina', 'Treinamento para tratar doenças e ferimentos.', 'Cirurgia zaunita; herbalismo ioniano; a cura da Soraka.'],
    'otherworldly-mythos': ['Mitos do Espírito & do Vazio', 'Conhecimento estranho, fruto de olhar para outros reinos.', 'O Reino Espiritual, o Vazio sob Icathia, as Ilhas das Sombras.'],
    science: ['Filosofia Natural', 'Ciências físicas como física, biologia e química.', 'A teoria da Academia de Piltover; a química zaunita.'],
    technology: ['Engenharia Hextec', 'Especialidade em engenharia e máquinas.', 'Cristais hextec, motores quimtec, mecanismos de relojoaria.'],
    alertness: ['Prontidão', 'Seus sentidos estão treinados para ficar alertas o tempo todo.', 'Um batedor freljordiano sobre o gelo.'],
    conviction: ['Convicção', 'Uma causa ou fé te leva a grandes alturas.', 'O fervor Solari; os ideais demacianos; a fé da Illaoi em Nagakabouros.'],
    creativity: ['Criatividade', 'Você pratica uma arte criativa.', 'As canções da Seraphine; a... arte do Jhin.'],
    investigation: ['Investigação', 'Coleta de provas, perícia, dedução em campo.', 'A Caitlyn e os Xerifes de Piltover.'],
    'self-discipline': ['Autodisciplina', 'Meditação e força de vontade lapidada te dão domínio das emoções.', 'O equilíbrio Kinkou do Shen; o foco Wuju do Master Yi.'],
    acrobatics: ['Acrobacia', 'Manobras de ginástica e aéreas.', 'A dança da Nilah; as piruetas com penas da Xayah.'],
    'close-combat': ['Combate Corpo a Corpo', 'Luta de perto, com lâminas, artes marciais ou os próprios punhos.', 'A réplica da Fiora; os chutes do Lee Sin; as manoplas da Vi.'],
    finesse: ['Delicadeza', 'Mãos precisas: desarmar uma bomba, bater uma carteira.', 'Um batedor de carteiras zaunita; um relojoeiro de Piltover.'],
    fitness: ['Resistência', 'Forma física de ponta; você corre quilômetros sem cansar.', 'Um legionário noxiano numa marcha forçada.'],
    'ranged-combat': ['Combate à Distância', 'Ataques de longe com armas de fogo, arcos ou lâminas arremessadas.', 'O arco da Ashe; as pistolas da Miss Fortune; as adagas da Katarina.'],
    stealth: ['Furtividade', 'Esgueirar-se em qualquer ambiente.', 'A Akali na fumaça; o Talon pelos telhados.'],
    banter: ['Lábia', 'Um dom para a conversa que irrita os inimigos (e os amigos).', 'As tiradas do Ezreal; o... gnar do Gnar.'],
    imposing: ['Intimidação', 'Você sabe ser intimidador.', 'O olhar do Darius; a voz do Mordekaiser.'],
    insight: ['Perspicácia', 'Ler as pessoas e o que elas escondem.', 'O olho demoníaco do Swain; a sabedoria da Karma.'],
    leadership: ['Liderança', 'Liderar e dirigir aliados com eficiência.', 'O Jarvan IV reunindo Demacia; a Garra do Inverno da Sejuani.'],
    persuasion: ['Persuasão', 'Convencer os outros de que é do interesse deles.', 'Os acordos da Renata Glasc; os golpes do Twisted Fate.']
  };
  for (const [c, def] of Object.entries(W.TRAIT_CATEGORIES)) {
    const t = CAT[c];
    if (t) { def.rt = t[0]; if (t[1]) def.note = t[1]; }
    for (const it of def.items) { const p = ITEM[it[0]]; if (p) { it[2] = p[0]; it[3] = p[1]; it[4] = p[2]; } }
  }
  // ---------------------------------------------------------------- glossário (chaves em inglês, texto em pt)
  W.GLOSSARY = Object.assign(W.GLOSSARY, {
    'Attack': 'Ação básica: cause dano igual ao seu dado de efeito a um alvo. <em>Runeterra:</em> o golpe de um machado noxiano, uma rajada de fogo rúnico.',
    'Defend': 'Ação básica: reduza o dano de um Ataque recebido pelo seu dado de efeito. <em>Runeterra:</em> o Inquebrável do Braum, uma barreira de petricita.',
    'Overcome': 'Ação básica: lide com um obstáculo ou desafio da cena (uma ruína desabando, um cofre hextec trancado). Seu total define o quão bem você se sai.',
    'Boost': 'Ação básica: crie um <b>bônus</b> (+1 a +4, conforme o dado de efeito) que você ou um aliado soma numa rolagem futura. <em>Runeterra:</em> o Olho da Tempestade da Janna, as travessuras da Lulu.',
    'Hinder': 'Ação básica: crie uma <b>penalidade</b> (-1 a -4) nas rolagens de um alvo. <em>Runeterra:</em> o gelo da Ashe, a prisão sombria da Morgana.',
    'Recover': 'Recupere Vida até o seu máximo. <em>Runeterra:</em> o chamado estelar da Soraka, um gole de estimulante zaunita.',
    'Min die': 'Role sua reserva (poder + qualidade + status) e ordene os dados pelo resultado: o menor é o <b>Mín</b>, o do meio é o <b>Médio</b>, o maior é o <b>Máx</b>. As ações básicas normais usam o dado Médio como "efeito".',
    'Mid die': 'O resultado do meio da sua reserva de três dados. As ações básicas usam ele por padrão.',
    'Max die': 'O maior resultado da sua reserva de três dados. Habilidades que "usam seu dado Máx" são bem mais fortes que uma ação básica.',
    'Max+Mid+Min': 'Some os três dados. É o efeito mais poderoso possível e costuma ficar reservado às habilidades Vermelhas.',
    'Max+Mid': 'Some seus resultados Máx e Médio para o efeito.',
    'Max+Min': 'Some seus resultados Máx e Mín para o efeito.',
    'Mid+Min': 'Some seus resultados Médio e Mín para o efeito.',
    'persistent': 'Um bônus ou penalidade persistente não se gasta depois de uma rolagem. Ele continua valendo até ser removido ou até o fim da cena.',
    'exclusive': 'Um bônus exclusivo só pode ser usado por você (não dá para passar a aliados).',
    'irreducible': 'Dano irredutível não pode ser diminuído por Defesa nem por redução de dano.',
    'bonus': 'Um modificador (+1 a +4) criado com Fortalecer e somado a uma rolagem futura.',
    'penalty': 'Um modificador (-1 a -4) criado com Atrapalhar e subtraído das rolagens de um alvo.',
    'minion': 'Inimigos (ou aliados) fracos representados por um único dado. Ao serem atingidos, rolam para "resistir"; se falharem, saem de cena; se passarem, o dado deles diminui.',
    'lieutenant': 'Um inimigo mais duro que um lacaio, mas que não chega a ser um vilão de verdade.',
    'Green zone': 'Seu status com Vida alta: você rola seu dado de status Verde e usa habilidades Verdes. <em>Runeterra:</em> descansado, começando a luta.',
    'Yellow zone': 'Vida média: você rola seu dado de status Amarelo e libera as habilidades Amarelas (além das Verdes).',
    'Red zone': 'Vida baixa: você rola seu dado de status Vermelho e libera suas habilidades Vermelhas, as mais poderosas. Heróis dão o seu melhor quando estão desesperados.',
    'status die': 'O terceiro dado da sua reserva, definido pelo seu Temperamento e pela sua zona atual (Verde/Amarela/Vermelha).',
    'minor twist': 'Uma complicação com consequências limitadas. O Mestre pode se inspirar na pergunta de Reviravolta Menor do seu princípio.',
    'major twist': 'Uma complicação que muda os rumos da história. O Mestre pode se inspirar na pergunta de Reviravolta Maior do seu princípio.',
    'twist': 'Uma complicação narrativa que o Mestre introduz, muitas vezes inspirada nos seus princípios.',
    'hero point': 'Um recurso ganho principalmente pelos princípios; gaste para rolar de novo, somar um bônus ou dobrar a cena a seu favor.',
    'Reaction': 'Uma habilidade que dispara fora do seu turno, em resposta a algo. Normalmente uma Reação por turno.',
    'doubles': 'Quando dois dados da sua reserva mostram o mesmo número. Algumas habilidades têm efeitos extras (bons ou ruins) com dados iguais.',
    'nearby': 'Na mesma área da cena, perto o bastante para chegar rápido.',
    'close': 'Colado no alvo, ao alcance do braço.',
    'scene': 'Um único encontro ou situação, como uma página dupla de gibi: uma luta nas pontes de Piltover, uma negociação em Noxus.',
    'collection': 'Um arco de história de várias edições. Seu herói evolui ao final das coleções.',
    'Health': 'Seus pontos de vida. Conforme caem, você passa da zona Verde para a Amarela e depois para a Vermelha. Em 0 você fica incapacitado (e pode usar sua habilidade de Nocaute).',
    'environment': 'A própria cena, que age no seu próprio turno (uma tempestade de areia em Shurima, a Névoa Negra avançando).'
  });
  W.I18N.glossLabel = {
    'Attack': 'Atacar', 'Defend': 'Defender', 'Overcome': 'Superar', 'Boost': 'Fortalecer', 'Hinder': 'Atrapalhar', 'Recover': 'Recuperar',
    'Min die': 'Dado Mín', 'Mid die': 'Dado Médio', 'Max die': 'Dado Máx', 'Max+Mid+Min': 'Máx+Médio+Mín', 'Max+Mid': 'Máx+Médio', 'Max+Min': 'Máx+Mín', 'Mid+Min': 'Médio+Mín',
    'persistent': 'persistente', 'exclusive': 'exclusivo', 'irreducible': 'irredutível', 'bonus': 'bônus', 'penalty': 'penalidade', 'minion': 'lacaio', 'lieutenant': 'tenente',
    'Green zone': 'Zona Verde', 'Yellow zone': 'Zona Amarela', 'Red zone': 'Zona Vermelha', 'status die': 'dado de status', 'minor twist': 'reviravolta menor', 'major twist': 'reviravolta maior',
    'twist': 'reviravolta', 'hero point': 'ponto de herói', 'Reaction': 'Reação', 'doubles': 'dados iguais', 'nearby': 'próximo', 'close': 'colado', 'scene': 'cena',
    'collection': 'coleção', 'Health': 'Vida', 'environment': 'ambiente'
  };

  W.ABILITY_TYPES = {
    A: 'Ação: usada no seu turno, no lugar de uma ação básica.',
    R: 'Reação: dispara em resposta a algo, mesmo fora do seu turno (normalmente uma vez por turno).',
    I: 'Inerente: sempre ativa, sem exigir rolagem nem ação.',
    'A/I': 'Uma Ação e também um efeito Inerente.'
  };
  W.COLOR_INFO = {
    green: 'Habilidades Verdes podem ser usadas em qualquer zona. A maioria dos heróis tem várias: da Fonte de Poder, do Caminho e dos dois princípios.',
    yellow: 'Habilidades Amarelas são liberadas quando você cai para a zona Amarela (ou Vermelha). Quanto mais a luta vira contra você, mais forte você fica.',
    red: 'Habilidades Vermelhas só liberam na zona Vermelha. São suas supremas: desesperadas, dramáticas, decisivas.',
    out: 'Sua habilidade de Nocaute é usada quando você está incapacitado (0 de Vida): mesmo nocauteado, você ainda ajuda o grupo uma vez por rodada.'
  };
  W.PRINCIPLE_CATEGORIES = {
    Esoteric: 'Algo estranho e sobrenatural te define, seja o destino, a magia, os mortos ou as estrelas.',
    Expertise: 'Existe algo em que você é muito bom, uma habilidade ou talento que você internalizou e que também revela o que te preocupa.',
    Ideals: 'Aquilo em que você acredita e pelo que luta.',
    Identity: 'Como você se apresenta e quem você é por fora.',
    Responsibility: 'O peso da sua vida longe da luta, como uma família, uma guilda, uma dívida ou uma máscara.'
  };

  // Nomes runeterranos dos princípios (sempre "Princípio" + artigo, para a ficha ficar natural).
  const PL = {
    destiny: ['Princípio do Destino', 'A profecia te segue como os Aspectos seguem os escolhidos. Ótimo para Targon ou Shurima.'],
    'energy-element': ['Princípio do [Elemento]', 'Escolha seu elemento: Gelo (Verdadeiro), Chama, Luz, Tempestade... Você vive e respira isso.'],
    exorcism: ['Princípio do Caçador da Névoa', 'Você pressente a Névoa Negra, os espíritos e a mácula do Vazio com o instinto de um Sentinela da Luz.'],
    fauna: ['Princípio da Fera', 'As criaturas selvagens de Ionia, do Freljord ou de Ixtal te reconhecem como parente.'],
    flora: ['Princípio do Crescimento Selvagem', 'O dom do Ivern: toda raiz e toda flor te respondem.'],
    future: ['Princípio do Futuro', 'Você vislumbra futuros que ainda não chegaram, um dom que é o fardo do Zilean e o sonho da Karma.'],
    immortality: ['Princípio do Imortal', 'Seja Ascendente, Darkin ou espírito, você não envelhece e os males comuns não te atingem.'],
    'inner-demon': ['Princípio da Escuridão Interior', 'Uma voz Darkin, uma fome do Vazio ou um demônio das Ilhas das Sombras vive dentro de você. Por enquanto, está contido.'],
    magic: ['Princípio do Arcano', 'Você sente o fluxo da magia em toda parte, do zumbido das Runas às correntes do Reino Espiritual.'],
    sea: ['Princípio das Profundezas', 'Escolhido de Nagakabouros, nascido entre os Marai ou sal de Águas de Sentina: o mar é o seu lar.'],
    space: ['Princípio do Cume', 'Você aguenta as alturas mortais do Monte Targon e o vazio entre as estrelas.'],
    'time-traveler': ['Princípio da Era Perdida', 'Você vem de outra época, seja a Shurima imperial, as Guerras Rúnicas ou um futuro ainda não escrito.'],
    undead: ['Princípio da Névoa Negra', 'Você morreu, mas não partiu. É um espectro da Ruína.'],
    clockwork: ['Princípio da Relojoaria', 'Precisão piltovana: você vê como cada engrenagem deveria girar.'],
    gearhead: ['Princípio do Inventor Hextec', 'Você sabe o que há de errado com qualquer máquina, de uma caixinha de música a um Portal Hextec.'],
    history: ['Princípio do Saber', 'Arquivos, ruínas, línguas esquecidas: você conhece a história de Runeterra.'],
    indestructible: ['Princípio do Indestrutível', 'Espadas ricocheteiam em você como granizo no Galio.'],
    lab: ['Princípio da Oficina', 'Seu santuário pode ser um laboratório em Piltover, um antro químico em Zaun ou uma torre no Freljord.'],
    mastery: ['Princípio da Maestria', 'Você estudou o próprio dom como o Ryze estuda as Runas.'],
    mentor: ['Princípio do Mentor', 'Você ensina a próxima geração, como o Shen, a Karma ou o Master Yi.'],
    powerless: ['Princípio dos Sem-Poder', 'Nada de magia, só garra, como um Caçador de Magos ou um xerife que sabe vencer quem usa feitiços.'],
    science: ['Princípio da Filosofia Natural', 'A teoria da Academia e a química zaunita na ponta dos dedos.'],
    speed: ['Princípio da Velocidade', 'Mais rápido que os corvos mensageiros de Noxus.'],
    stealth: ['Princípio da Furtividade', 'Toda porta Kinkou e da Rosa Negra se abre para você.'],
    strength: ['Princípio da Força', 'Força bruta nível Sion; você nunca rola para proezas comuns de força.'],
    tactician: ['Princípio do Estrategista', 'As mesas de guerra do Jarvan, as tramas do Swain: sempre um plano, e um plano B.'],
    whispers: ['Princípio dos Sussurros', 'Você ouve uma voz que mais ninguém escuta, vinda de uma arma Darkin, de um murmúrio do Vazio ou de um ancestral morto.'],
    chaos: ['Princípio do Caos', 'Imprevisibilidade nível Jinx.'],
    compassion: ['Princípio da Compaixão', 'A Soraka chora por cada ferida.'],
    defender: ['Princípio do Defensor', 'Como a porta do Braum ou o escudo do Taric, você se coloca entre os outros e o perigo.'],
    dependence: ['Princípio da Dependência', 'Você precisa de algo: um coração hextec, uma relíquia, Cintilante...'],
    equality: ['Princípio da Igualdade', 'Pelos becos de Zaun, pelos nascidos com magia, pelos oprimidos.'],
    'great-power': ['Princípio do Grande Poder', 'Sua magia assusta até você, como a luz ofuscante da Lux ou as esferas da Syndra.'],
    hero: ['Princípio do Campeão', 'Você tem a vocação de proteger os outros.'],
    honor: ['Princípio da Honra', 'Códigos demacianos, votos ionianos, juramentos freljordianos.'],
    justice: ['Princípio da Justiça', 'Sempre atento à injustiça e a quem a cometeu.'],
    liberty: ['Princípio da Liberdade', 'As correntes do Sylas foram quebradas; nenhuma mente consegue te prender.'],
    order: ['Princípio da Ordem', 'Com disciplina noxiana ou lei demaciana, você mantém a cabeça no lugar em meio ao caos.'],
    'self-preservation': ['Princípio da Autopreservação', 'Primeiro sobreviver. Heroísmo depois.'],
    zealot: ['Princípio do Fanático', 'O fogo Solari, a fé na Serpente Mãe, a crença na Evolução Gloriosa.'],
    ambition: ['Princípio da Ambição', 'Noxus recompensa os fortes, e você pretende chegar ao topo.'],
    amnesia: ['Princípio da Amnésia', 'Seu passado se perdeu, e os outros têm dificuldade em te rastrear.'],
    detachment: ['Princípio do Desapego', 'A calma Kinkou, a distância de um Aspecto.'],
    discovery: ['Princípio da Descoberta', 'A sede de aventura do Ezreal; o eureca do Heimerdinger.'],
    loner: ['Princípio do Solitário', 'Você dá o seu melhor quando ninguém está olhando.'],
    nomad: ['Princípio do Nômade', 'Caravanas shurimanes, ronins errantes, as jornadas sem fim do Bard.'],
    peace: ['Princípio da Paz', 'Equilíbrio ioniano: a violência raramente é a resposta.'],
    rage: ['Princípio da Fúria', 'Você tem a fúria do Tryndamere e a loucura do Renekton, mas sabe apontá-las para o alvo certo.'],
    split: ['Princípio da Cisão', 'Duas almas, duas visões: o Kayn e o Rhaast discutindo na mesma cabeça.'],
    savagery: ['Princípio da Selvageria', 'Você pertence às terras selvagens do Freljord e às selvas de Ixtal. A civilização não é para você.'],
    levity: ['Princípio do Bom Humor', 'Piadas diante da Ruína.'],
    'spotless-mind': ['Princípio da Mente Limpa', 'Rancores escorregam em você como água em escama de Marai.'],
    business: ['Princípio dos Negócios', 'Uma casa comercial de Piltover, uma taverna de Águas de Sentina, um império químico zaunita.'],
    debtor: ['Princípio do Devedor', 'Você deve ao Tahm Kench, a um barão químico ou a coisa pior.'],
    detective: ['Princípio do Detetive', 'Você sempre sabe quando algo está sendo escondido.'],
    'double-agent': ['Princípio do Agente Duplo', 'Na Rosa Negra, entre os Kinkou ou nos Caçadores de Magos, você serve a dois senhores.'],
    everyman: ['Princípio da Pessoa Comum', 'Só uma pessoa normal metida em algo grande demais.'],
    family: ['Princípio da Família', 'Nas Grandes Casas, nos clãs e nas tribos, a família vem primeiro.'],
    mask: ['Princípio da Máscara', 'Um mago escondido em Demacia jamais pode ser descoberto.'],
    sidekick: ['Princípio do Parceiro', 'Você está sempre onde a confusão acontece, como a turma do Ekko ou a sombra da Jinx.'],
    team: ['Princípio do Bando', 'Você tem um posto oficial: Xerifes de Piltover, Vanguarda Destemida, Garra do Inverno.'],
    underworld: ['Princípio do Submundo', 'Contatos em toda espelunca de Águas de Sentina e todo antro químico de Zaun.'],
    veteran: ['Princípio do Veterano', 'A invasão de Ionia, as Guerras Rúnicas, a Ruína: você já viu a guerra.'],
    youth: ['Princípio da Juventude', 'Jovem, brilhante e subestimado, como a Zoe, a Lulu ou um yordle novinho.']
  };
  for (const [id, v] of Object.entries(PL)) if (W.PRINCIPLE_LORE[id]) W.PRINCIPLE_LORE[id] = v;

  // Regiões: textos adaptados das notas de lore da campanha.
  const RG = {
    bilgewater: ['Águas de Sentina', 'Onde fortunas são feitas e ambições destruídas num piscar de olhos.', 'Um refúgio para contrabandistas, saqueadores e gente sem escrúpulos. Para quem foge da justiça, de dívidas ou de perseguição, é uma cidade de recomeços, onde ninguém nas ruas sinuosas liga para o seu passado. Quase tudo se compra por aqui, mas ao amanhecer os incautos aparecem boiando no porto.'],
    bandle: ['Bandópolis', 'O lar atemporal dos yordles, além do reino material.', 'Uma terra de magia desenfreada, alcançada por caminhos invisíveis. Cada sensação é aguçada, a luz do sol é eternamente dourada. Pelo menos é o que dizem os contadores de histórias, embora nenhum deles concorde sobre o que viu. Os mortais que voltam parecem ter envelhecido muito; muitos jamais voltam.'],
    demacia: ['Demacia', 'Um reino orgulhoso de justiça, honra e dever, agora em turbulência.', 'Um reino forte e regido pela lei, com uma história militar prestigiosa, erguido sobre a petricita, uma pedra branca que atenua a magia. Cada vez mais isolado, dilacerado pela Rebelião dos Magos e por uma sucessão disputada, Demacia pode não sobreviver à própria rigidez, e nem toda a petricita do reino vai protegê-la de si mesma.'],
    'shadow-isles': ['As Ilhas das Sombras', 'Um reino outrora belo, envolto para sempre pela Névoa Negra.', 'Devastadas por um cataclismo mágico, as ilhas estão cobertas por uma Névoa Negra que drena a vida de quem vive ali. Quem morre na Névoa assombra a terra pela eternidade, e o poder dela cresce a cada ano, estendendo-se para ceifar almas por toda Runeterra.'],
    ionia: ['Ionia', 'As Primeiras Terras, de beleza intocada e magia natural.', 'Um povo espiritual que vive em harmonia e equilíbrio por um vasto arquipélago, com muitas ordens e seitas (frequentemente em conflito). Neutra por séculos até a invasão noxiana, Ionia agora enfrenta a militarização, o vigilantismo e uma sede crescente pelas artes das trevas.'],
    ixtal: ['Ixtal', 'Mestres da magia elemental, escondidos nas profundezas da selva.', 'Uma cultura antiga da grande diáspora para o oeste, que sobreviveu ao Vazio e aos Darkin recolhendo-se atrás da selva selvagem. Da cidade-arcologia de Ixaocan, os ixtali veem todas as outras facções como usurpadoras e mantêm os intrusos à distância com magia poderosa.'],
    nazumah: ['Nazumah', 'Caçadores livres de feras gigantes, que se libertaram dos deuses guerreiros.', 'Uma terra de guerreiros valorosos e caçadores de monstros que celebra a liberdade conquistada dos "deuses guerreiros". Um caldeirão de povos que fugiram da Guerra Darkin, com mercados onde circulam os melhores produtos de Shurima. Por lá, passar a perna num comerciante nazumita pode render banimento. Os nazumitas ajudam qualquer "irmão das areias" a escapar da servidão.'],
    freljord: ['O Freljord', 'Uma terra implacável de guerreiros natos e o único lar do Gelo Verdadeiro.', 'Tribos orgulhosas e ferozmente independentes, com forte cultura de pilhagem, estão sendo arrastadas para uma guerra civil entre três facções: uma honra as velhas tradições, outra segue o sonho de união de uma jovem idealista e a terceira venera um poder enigmático.'],
    noxus: ['Noxus', 'Um império temível onde a força, seja qual for a sua forma, é tudo.', 'Brutal e expansionista para quem está de fora, mas surpreendentemente inclusivo por dentro: qualquer um pode chegar ao poder e ao respeito se provar sua aptidão, não importa o berço, a terra natal ou a riqueza.'],
    piltover: ['Piltover', 'A Cidade do Progresso.', 'Uma cidade próspera e progressista, centro cultural de Valoran, movida pelo comércio e pelo pensamento visionário em vez de exércitos. Seus portões marítimos trazem mercadorias do mundo todo, e seus clãs mercantes financiam arte, arquitetura e pesquisas esotéricas em hextecnologia.'],
    zaun: ['Zaun', 'A Cidade de Ferro e Vidro.', 'Um vasto distrito subterrâneo nos cânions sob Piltover, vivendo num crepúsculo esfumaçado perpétuo. Vibrante e rica em cultura, acolhe as pesquisas perigosas que Piltover proíbe, e paga caro por elas com poluição e rios de lodo tóxico.'],
    shurima: ['Shurima', 'Um império do deserto que caiu, mas cuja capital ressurgiu.', 'Outrora uma civilização próspera, sua capital gloriosa virou mito depois da queda. Nômades sobrevivem ao redor dos oásis, caçam tesouros entre ruínas ou vendem suas espadas. Agora, sussurros vindos do coração do deserto dizem que a capital ressuscitou.'],
    targon: ['Targon', 'O pico mais alto de Runeterra, uma porta para o Reino Celestial.', 'Um farol para sonhadores, loucos e aventureiros. Os poucos que sobrevivem à escalada encontram um céu de corpos celestes cintilantes e voltam assombrados e vazios, ou tão transformados que ficam irreconhecíveis.'],
    void: ['O Vazio', 'O Reino do Nada, faminto além do Reino Material.', 'Uma força de fome insaciável, à espera de que seus mestres, os Observadores, marquem o momento final da destruição. Ser tocado por ele é vislumbrar a irrealidade eterna, o que basta para quebrar até a mente mais forte.']
  };
  for (const r of W.REGIONS) { const v = RG[r.id]; if (v) { r.name = v[0]; r.tag = v[1]; r.lore = v[2]; } }

  // Perguntas de biografia por Terra Natal (Capítulo IX, Guia de lore).
  W.BIO_REGION = {
    bilgewater: ['Você nasceu nas docas de Águas de Sentina ou chegou fugindo de alguém?', 'A quem você deve dinheiro, um favor ou a própria vida?'],
    bandle: ['O que te fez atravessar os caminhos invisíveis e deixar Bandópolis?', 'Que coisa do mundo material ainda te parece absurda ou encantadora?'],
    demacia: ['Como você lida com a lei de Demacia contra a magia?', 'Que Grande Casa, ordem ou vilarejo você chama de seu?'],
    'shadow-isles': ['O que a Névoa Negra tirou de você, ou o que ela te deu?', 'O que te prende às Ilhas das Sombras: uma promessa, uma maldição ou alguém que você perdeu?'],
    ionia: ['A que ordem, seita ou vilarejo você pertence, e o que ele espera de você?', 'O que a invasão noxiana mudou na sua vida?'],
    ixtal: ['Qual elemento a sua casa domina, e que lugar você ocupa nela?', 'Por que você saiu do isolamento das selvas de Ixtal?'],
    nazumah: ['Que fera gigante, ou que deus guerreiro, marcou a história da sua família?', 'Quem você ajudou a escapar da servidão, ou quem te ajudou?'],
    freljord: ['A que tribo você jurou lealdade: Avarosanos, Garra do Inverno ou Guarda Gélida?', 'Que semideus você honra, teme ou já encontrou pessoalmente?'],
    noxus: ['Como você provou sua força para subir em Noxus?', 'Qual o seu lugar no Trifarix, na legião ou nas sombras da Rosa Negra?'],
    piltover: ['Que clã mercante te patrocina, te deve ou te persegue?', 'Qual invenção ou descoberta você ainda sonha em concluir?'],
    zaun: ['Em que nível de Zaun você cresceu, e o que ele te ensinou para sobreviver?', 'Que barão químico conhece o seu nome?'],
    shurima: ['Você acredita que o Imperador voltou? O que isso significa para você?', 'Que ruína, oásis ou tesouro enterrado faz parte da sua história?'],
    targon: ['Você chegou a escalar o Monte Targon? O que encontrou lá em cima?', 'Que Aspecto observa você, com ou sem o seu consentimento?'],
    void: ['Como o Vazio te tocou e deixou você ainda de pé?', 'Quem sabe o que você realmente é?']
  };


  // Guia: etapas curtas por capítulo, cada uma apontando para uma parte da página: [título, texto, seletor, fase].
  // Sem seletor, o popup aparece no centro. Com fase (um seletor como "#flow-background-assign.current"), a etapa
  // espera aquela parte do capítulo abrir e só então aparece, uma vez. O botão "Guia" repete o que cabe na tela.
  // Boas-vindas, Povo e Terra Natal não têm guia.
  W.TOUR = {
    background: [
      ['Origem', 'Quem seu campeão era <b>antes</b> dos poderes. A partir daqui cada escolha vira um <b>dado</b> na ficha.', '.chapter'],
      ['Para que servem os dados', 'Quando seu herói tenta algo arriscado, você rola <b>três dados</b>: um <b>poder</b>, uma <b>qualidade</b> e o seu <b>dado de status</b>. Não se soma nada: a habilidade diz se vale o <b>maior</b> dado (Máx), o do <b>meio</b> (Médio) ou o <b>menor</b> (Mín).<span class="tour-ex">Força d10, Combate d8 e status d6 tiram 7, 5 e 2. Um Ataque com o dado Máx causa 7 de dano.</span>', ''],
      ['Qualidades e poderes', '<b>Qualidades</b> são o que você sabe fazer: lutar, convencer, investigar. <b>Poderes</b> são o que te torna extraordinário: voar, magia, força sobre-humana. Cada um tem o seu dado.', ''],
      ['Tamanho do dado', 'Dado maior tira número maior. <b>d6</b> é bom, <b>d8</b> ótimo, <b>d10</b> excelente, <b>d12</b> lendário.<span class="tour-ex">Combate d10 acerta mais forte que Combate d6.</span>', ''],
      ['Passe o mouse', 'Cada cartão mostra a história e campeões parecidos. Escolha o que combina com o seu herói: os números aparecem depois.', '.cards'],
      ['Ligue os dados', 'Sua Origem te deu estes dados. Clique num <b>dado</b> e escolha a <b>qualidade</b> que ele vira.<span class="tour-ex">d10 em Medicina e d8 em Ciência: seu herói é um curandeiro excelente e um cientista ótimo.</span>', '#flow-background-assign', '#flow-background-assign.current'],
      ['O dado maior', 'Coloque o <b>dado maior</b> naquilo em que seu herói é melhor. Ele vai entrar nas rolagens dessa qualidade o jogo todo.', '#flow-background-assign .socket', '#flow-background-assign.current'],
      ['Princípio', 'Aquilo em que seu herói acredita. Não é um dado: é um guia para interpretar.', '#flow-background-principle', '#flow-background-principle.current'],
      ['Pontos de herói', 'Quando você age de acordo com o princípio mesmo quando custa caro, o Mestre te dá <b>pontos de herói</b>, que melhoram rolagens.<span class="tour-ex">Princípio da Honra: você cumpre sua palavra mesmo quando custa caro.</span>', '#flow-background-principle .principles', '#flow-background-principle.current']
    ],
    powersource: [
      ['Fonte de Poder', 'O que <b>transformou</b> seu campeão: magia, hextec, um espírito, treino extremo. Aqui nascem os seus <b>poderes</b>.', '.chapter'],
      ['Dados vindos da Origem', 'Os dados deste capítulo vêm da <b>Origem</b> que você escolheu. Cada Origem dá tamanhos diferentes.', ''],
      ['Passe o mouse', 'Cada cartão mostra a história e campeões parecidos. Os poderes aparecem depois que você escolhe.', '.cards'],
      ['Poderes', 'Clique num <b>dado</b> e escolha o <b>poder</b> que ele vira. Quanto maior o dado, mais forte o poder.<span class="tour-ex">Chama d10: seu fogo é excelente. Voo d6: você voa, mas sem muita graça.</span>', '#flow-powersource-assign', '#flow-powersource-assign.current'],
      ['Habilidades', 'Golpes e truques especiais. A <b>cor</b> diz quando ficam liberadas: <b>Verde</b> sempre, <b>Amarela</b> quando a luta aperta, <b>Vermelha</b> por um fio.', '[id^="flow-powersource-g-"].current', '[id^="flow-powersource-g-"].current'],
      ['Qual dado ela usa', 'Depois de marcar uma habilidade, clique no <b>poder ou qualidade</b> que ela usa. É o dado dele que entra na rolagem.', '[id^="flow-powersource-g-"].current .ab-list', '[id^="flow-powersource-g-"].current'],
      ['Tipos de habilidade', '<b>A</b> é uma ação no seu turno. <b>R</b> é uma reação, fora do turno. <b>I</b> fica sempre ativa.<span class="tour-ex">Campo Reativo (R): quem te ataca de perto sofre o mesmo dano.</span>', '[id^="flow-powersource-g-"].current', '[id^="flow-powersource-g-"].current'],
      ['As seis ações', 'Toda ação é uma de seis: <b>Atacar</b>, <b>Defender</b>, <b>Superar</b> um obstáculo, <b>Fortalecer</b> um aliado, <b>Atrapalhar</b> um inimigo e <b>Recuperar</b> Vida.', '', '[id^="flow-powersource-g-"].current']
    ],
    archetype: [
      ['Caminho', 'Seu <b>estilo de luta</b>, como as funções de League of Legends: tanque, atirador, mago. Dá mais <b>poderes e qualidades</b>.', '.chapter'],
      ['Passe o mouse', 'Cada cartão mostra a história e campeões parecidos. As regras do Caminho aparecem depois que você escolhe.', '.cards'],
      ['Regras do Caminho', 'Cada Caminho tem regras para os dados. Leia a lista acima deles antes de ligar.<span class="tour-ex">Duelista: um dado precisa ir para Combate Corpo a Corpo.</span>', '#flow-archetype-assign .rules-list || #flow-archetype-assign', '#flow-archetype-assign.current'],
      ['Poder ou qualidade', 'Aqui um dado pode virar <b>poder</b> ou <b>qualidade</b>. Algo que você já tem não pode ser escolhido de novo.', '#flow-archetype-assign .socket', '#flow-archetype-assign.current'],
      ['Habilidades Verdes', 'Sempre disponíveis. Marque as habilidades e clique no <b>poder ou qualidade</b> que cada uma usa.', '[id^="flow-archetype-g-"].current', '[id^="flow-archetype-g-"].current'],
      ['Segundo princípio', 'Outra coisa em que seu herói acredita. Precisa ser <b>diferente</b> do primeiro.', '#flow-archetype-principle', '#flow-archetype-principle.current']
    ],
    personality: [
      ['Temperamento', 'Como seu campeão reage <b>sob pressão</b>. Ele define os seus <b>dados de status</b>.', '.chapter'],
      ['Dados de status', 'O terceiro dado de <b>toda rolagem</b>. Qual você usa depende da sua Vida: o <b>Verde</b> enquanto está inteiro, o <b>Amarelo</b> ferido, o <b>Vermelho</b> por um fio.', '.card .status-row'],
      ['Tendência', '<b>Cresce sob pressão</b>: perigoso quando tudo dá errado. <b>Forte no começo</b>: bate forte cedo. <b>Constante</b>: nunca muda.', '.card .status-trend'],
      ['Qualidade Marcante', 'Uma frase que resume seu herói. Vale como uma qualidade <b>d8</b> que você pode usar nas rolagens.<span class="tour-ex">Última Lâmina da Guarda de Ferro.</span>', '#flow-personality-qname', '#flow-personality-qname.current'],
      ['Nocaute', 'Com a Vida em 0 você cai, mas ainda faz uma coisa por turno: a habilidade de <b>Nocaute</b>. Escolha o que ela usa.', '#flow-personality-out', '#flow-personality-out.current']
    ],
    red: [
      ['Supremas', 'Suas duas habilidades <b>Vermelhas</b>: as mais fortes, liberadas só na <b>Zona Vermelha</b>.', '.chapter'],
      ['Escolha duas', 'Só aparecem categorias em que você tem algo <b>d6 ou maior</b>. Marque <b>duas</b> e escolha o que cada uma usa.', '.flow-sec.current'],
      ['Palavras sublinhadas', 'Passe o mouse para ler a regra.<span class="tour-ex">Dado Máx: o maior dos três dados que você rolou.</span>', '.flow-sec.current .term']
    ],
    retcon: [
      ['Reviravolta do Destino', 'Uma chance de <b>corrigir</b> algo na ficha antes de jogar. Escolha <b>uma</b> opção.', '.principles'],
      ['Na dúvida', '<b>Talento Oculto</b> dá um poder ou qualidade <b>d6</b> novo. É a opção mais simples.', '.principles [data-id="add-d6"]']
    ],
    health: [
      ['Vida', 'Quanto <b>dano</b> seu campeão aguenta. A Forja faz a conta.', '.flow-sec'],
      ['Zonas', 'Conforme a Vida cai, você passa de <b>Verde</b> para <b>Amarela</b> e <b>Vermelha</b>. Cada zona libera habilidades e troca o dado de status.<span class="tour-ex">Com Vida 30: Verde de 30 a 23, Amarela de 22 a 12, Vermelha de 11 a 1.</span>', '.hs-health'],
      ['Fixo ou rolado', 'Decida <b>antes</b>: ficar com <b>4</b> ou rolar um <b>d8</b>. Rolando, dá para rolar de novo <b>uma vez</b>.', '.flow-body .method']
    ],
    finish: [
      ['Nome', 'Só o <b>nome</b> é obrigatório. O resto pode ser preenchido em qualquer ordem.', '#flow-finish-name'],
      ['História', 'Clique numa pergunta do <b>Guia de Lore</b> para usá-la na biografia.', '.bio-guide'],
      ['Nomes próprios', 'Renomeie as habilidades como as de um campeão. Deixe vazio para manter o original.<span class="tour-ex">Golpe Duplo vira Dança das Lâminas.</span>', '#flow-finish-abilities'],
      ['Na mesa', 'Exporte o <b>PDF</b> ou abra a página <b>Ficha</b>: os botões − e + da Vida mudam sua zona e liberam as habilidades.', '.sheet-cta || .export-row']
    ]
  };

  W.STEP_INTROS = {
    people: 'Escolha o <b>povo</b> do seu campeão: humano, vastaya, yordle, espírito e outros. Serve <b>só para a interpretação</b> e não muda nenhuma regra.',
    region: 'Escolha a <b>terra</b> que moldou seu campeão. Também serve <b>só para a interpretação</b>.',
    background: 'De onde seu campeão veio antes de virar uma lenda. Dá <b>2 qualidades</b>, seu <b>primeiro princípio</b> e os <b>dados da Fonte de Poder</b>.',
    powersource: 'O que transformou seu campeão. Dá <b>poderes</b>, habilidades <b>Amarelas</b> e os <b>dados do Caminho</b>.',
    archetype: 'Como seu campeão luta e que papel cumpre no grupo. Dá mais <b>poderes e qualidades</b>, habilidades <b>Verdes</b> e o <b>segundo princípio</b>.',
    personality: 'Como seu campeão reage sob pressão. Dá os <b>dados de status</b>, a <b>Qualidade Marcante</b> e a habilidade de <b>Nocaute</b>.',
    red: 'Suas duas habilidades <b>mais fortes</b>, liberadas quando você está <b>por um fio</b>.',
    retcon: 'Um último <b>ajuste</b> antes de fechar a ficha.',
    health: 'Quanto <b>dano</b> seu campeão aguenta. A conta é feita sozinha; você só escolhe o que entra nela e se quer <b>rolar</b>.',
    finish: 'Dê <b>nome</b> e história ao seu campeão. Só o <b>nome</b> é obrigatório; o resto pode ser preenchido em qualquer ordem.'
  };
})();
