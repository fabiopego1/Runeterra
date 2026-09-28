/* GM Screen: twist ideas by region, for the twist generator. Minor twists are hassles solved in the scene;
   major twists are big complications that last the whole issue. */
window.GM_TWISTS = {
  any: {
    minor: ['Um inocente entra na linha de fogo e precisa ser tirado dali.', 'Uma arma, ferramenta ou foco quebra: o herói perde um bônus ou sofre −2 na próxima ação.', 'Chega mais um lacaio, do tamanho do dado Médio de quem pagou a reviravolta.', 'O herói fica separado do grupo, num local diferente da cena.', 'Um segredo pequeno escapa na frente de alguém que não devia ouvir.', 'O marcador de cena avança um espaço.'],
    major: ['Um aliado importante é capturado ou gravemente ferido.', 'O vilão descobre algo pessoal sobre um herói e vai usar isso.', 'A estrutura desaba: a cena muda de lugar e todos sofrem dano igual ao Mín.', 'Um esquadrão de reforços chega: um lacaio por herói.', 'O objetivo da cena muda: o que precisava ser protegido já foi perdido, e agora é preciso recuperar.']
  },
  bilgewater: {
    minor: ['Um bando de piratas decide que a briga é deles também e ataca quem estiver mais perto.', 'O píer cede e alguém cai na água suja do porto.', 'Um credor reconhece o herói e cobra uma dívida bem na hora errada.', 'Serpentes marinhas se agitam perto do cais: −2 para quem estiver na beira da água.'],
    major: ['A Névoa Negra sobe do mar e traz almas famintas para a cena.', 'O navio onde estão pega fogo e começa a afundar.', 'Um capitão poderoso coloca uma recompensa pela cabeça do herói.']
  },
  bandle: {
    minor: ['Um portal yordle se abre sozinho e cospe algo (ou alguém) inesperado.', 'Uma travessura mágica troca de lugar dois objetos importantes.', 'O herói encolhe ou cresce por alguns turnos: −2 em ações que dependem do tamanho.', 'Um yordle curioso gruda no herói e não para de fazer perguntas.'],
    major: ['O grupo é arrastado para os caminhos entre mundos e se perde no tempo.', 'Uma magia de Bandópolis vaza para o mundo material e começa a transformar tudo em volta.', 'Alguém importante esquece quem é o herói por causa de um feitiço yordle.']
  },
  demacia: {
    minor: ['Um caçador de magos da Ordem dos Caçadores de Magos aparece para investigar.', 'Petricita por perto abafa a magia: habilidades mágicas sofrem −2 nesta rodada.', 'Um nobre ofendido exige satisfação na frente de todos.', 'Uma patrulha da Vanguarda confunde o herói com um inimigo.'],
    major: ['A magia de um herói é descoberta por uma autoridade demaciana.', 'A casa nobre que apoiava o grupo retira seu apoio publicamente.', 'Um mago escondido perde o controle do próprio poder no meio da cidade.']
  },
  'shadow-isles': {
    minor: ['Um sussurro da Névoa mostra ao herói uma lembrança dolorosa: −2 na próxima ação.', 'Um espírito preso a um objeto se liga ao herói e o segue.', 'A luz se apaga e todos precisam se orientar na escuridão.', 'Mortos inquietos se levantam do chão: um lacaio d6 por herói.'],
    major: ['A Névoa Negra toca um herói e parte da alma dele fica presa nas Ilhas.', 'Um espectro poderoso reconhece o grupo e passa a caçá-lo pela edição inteira.', 'A Ruína se espalha e a saída desaparece.']
  },
  ionia: {
    minor: ['Espíritos da natureza se irritam com a luta e atrapalham todos os lados.', 'Um monge da Ordem Kinkou exige que o herói respeite o equilíbrio.', 'Uma ponte de corda se rompe sobre o desfiladeiro.', 'Uma plantação sagrada é pisoteada e a vila local se volta contra o grupo.'],
    major: ['O Espírito da terra acorda furioso e a paisagem começa a mudar.', 'Uma facção rebelde acusa os heróis de trabalharem para Noxus.', 'Um templo antigo é profanado e uma maldição cai sobre um herói.']
  },
  ixtal: {
    minor: ['A selva muda os caminhos: o herói se perde por um turno.', 'Um elementalista ixtaliano testa o herói antes de ajudar.', 'Plantas carnívoras prendem alguém: Atrapalhado −2.', 'O calor e a umidade estragam equipamento: −1 em ações com tecnologia.'],
    major: ['A cidade escondida decide que o grupo viu demais e não pode sair.', 'Um ritual elemental dá errado e um elemento sai de controle na região.', 'Um guardião ancestral da selva desperta e vira um tenente contra o grupo.']
  },
  nazumah: {
    minor: ['Uma tempestade de areia cobre a cena: −2 para ações à distância.', 'A água do grupo acaba ou é roubada.', 'Uma caravana pede ajuda no pior momento possível.', 'Um espírito do deserto engana o herói com uma miragem.'],
    major: ['Uma disputa entre tribos coloca o grupo no meio de uma guerra.', 'O oásis que todos precisavam é envenenado.', 'Uma relíquia de Shurima é roubada da proteção de Nazumah.']
  },
  freljord: {
    minor: ['O gelo racha e alguém afunda até a cintura: Atrapalhado −2.', 'Uma nevasca apaga as trilhas e separa o grupo.', 'Um guerreiro de outra tribo desafia o herói para um duelo de honra.', 'Lobos famintos cercam a cena: um lacaio d6 por herói.'],
    major: ['Uma avalanche soterra parte da cena e alguém fica preso.', 'A Garra do Inverno declara o grupo inimigo.', 'Um semideus antigo desperta sob o gelo, atraído pela luta.']
  },
  noxus: {
    minor: ['Um oficial noxiano exige documentos e ameaça prender todos.', 'Um rival da mesma legião aproveita para sabotar o herói.', 'A multidão da arena exige sangue e fica do lado do adversário.', 'Um corvo de Swain observa a cena: alguém vai saber o que aconteceu.'],
    major: ['A Rosa Negra decide usar os heróis como peças num jogo político.', 'Uma legião inteira marcha na direção da cena.', 'Um herói é acusado de traição ao Império e vira procurado.']
  },
  piltover: {
    minor: ['Os Guardiões de Piltover chegam e querem explicações.', 'Um invento hextec falha e dá choque em quem estiver perto.', 'Um conselheiro rico oferece dinheiro para o grupo largar o caso.', 'Uma ponte levadiça sobe e divide a cena em duas.'],
    major: ['Um cristal hextec instável ameaça explodir o distrito.', 'Um clã mercante poderoso passa a financiar os inimigos do grupo.', 'Um segredo de Piltover vaza e culpam os heróis.']
  },
  zaun: {
    minor: ['Um cano de química estoura: dano igual ao Mín para quem estiver perto.', 'O ar fica tóxico: −2 em ações físicas até alguém abrir as passagens de ar.', 'Uma gangue de Zaun vê a chance de saquear no meio da confusão.', 'Um capanga toma cintilante e fica um tamanho de dado maior.'],
    major: ['Um Barão Químico decide que o grupo é problema e manda seus melhores homens.', 'Uma nuvem cinzenta desce sobre o Entresol e a cena vira uma evacuação.', 'Um herói é exposto a uma química que muda o corpo dele até o fim da edição.']
  },
  shurima: {
    minor: ['A areia engole uma entrada e a saída fica bloqueada.', 'Uma armadilha antiga dispara: dano igual ao Médio para o herói da frente.', 'Saqueadores de tumbas chegam para disputar o tesouro.', 'O sol castiga: −1 em todas as ações até achar sombra.'],
    major: ['Um Ascendido desperta e vê o grupo como invasor.', 'A tumba começa a desabar enquanto o grupo ainda está lá dentro.', 'Uma relíquia amaldiçoada se prende a um herói.']
  },
  targon: {
    minor: ['A subida fica traiçoeira: quem falhar escorrega e perde terreno.', 'O ar rarefeito cansa: −2 na próxima ação de quem fizer esforço.', 'Uma estrela cadente ilumina a cena e revela todos os escondidos.', 'Um Rakkor desafia o herói a provar seu valor.'],
    major: ['Um Aspecto escolhe um herói como hospedeiro, queira ele ou não.', 'O Monte Targon fecha o caminho e só deixa passar quem abrir mão de algo.', 'Uma batalha celestial acontece no céu e fragmentos caem sobre a cena.']
  },
  void: {
    minor: ['Uma fenda se abre no chão e algo do Vazio espia: −2 para quem estiver perto.', 'Um sussurro do Vazio confunde um herói, que ataca o alvo errado.', 'Crias do Vazio surgem da terra: um lacaio d6 por herói.', 'O metal por perto começa a se corroer e as armas perdem o fio.'],
    major: ['Uma fenda grande se abre e um tenente do Vazio atravessa.', 'Um herói é marcado pelo Vazio e ouve vozes até o fim da edição.', 'A região inteira começa a ser consumida: a cena vira uma fuga.']
  }
};
