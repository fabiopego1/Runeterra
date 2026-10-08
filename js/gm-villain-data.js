/* GM Screen: the villain building blocks of the rulebook (Chapter 5, "Creating Villains"), in Portuguese:
   approaches (how a villain acts), archetypes (what it cares about in a scene), upgrades and masteries.
   Used by the villain builder in gm-bullpen.js. Ability types: A = action, R = reaction, I = passive.
   In ability texts, [poder], [qualidade] and [poder/qualidade] are filled in by the builder with the trait
   the Game Master picks. Dice in the lists are the ones the rulebook gives the villain to assign. */
window.GM_VDATA = (() => {
  const A = (n, t, x) => ({ n, t, x });

  const approaches = [
    { id: 'adaptive', n: 'Adaptável', d: 'Vilões adaptáveis se reconfiguram conforme a situação, para nunca serem pegos desprevenidos pelos campeões.',
      P: ['d10', 'd8', 'd8', 'd6'], Q: ['d10', 'd8', 'd8'], sp: 'Traje de Poder, Robótica, Metamorfose, Mudança de Tamanho', sq: 'Criatividade, Ciência, Autodisciplina, Tecnologia', hp: 15, pick: 3,
      ab: [
        A('Adaptar-se e Prosperar', 'R', 'Quando for Atacado, Defenda-se rolando só o seu dado de [poder]. Também Fortaleça a si mesmo com o resultado desse dado.'),
        A('Diversidade pela Adversidade', 'I', 'No seu turno, sempre que Atacar um alvo que ainda não sofreu dano seu nesta cena, também Fortaleça a si mesmo usando o dado Máx.'),
        A('Reconfiguração Eficiente', 'A', 'Reduza dois dos seus poderes em um tamanho de dado cada. Suba um dos seus outros poderes para d12. Depois, faça uma ação básica usando esse poder.'),
        A('Iniciar Procedimento de Melhoria', 'A', 'Fortaleça usando [poder] e o dado Máx. Ataque com o dado Médio. Defenda com o dado Mín.'),
        A('Imitação Poderosa', 'A', 'Use uma habilidade de ação de um dos seus aliados.'),
        A('A Dor da Perfeição', 'A', 'Role um d6 e sofra esse dano irredutível. Suba todos os seus poderes em um tamanho de dado até o fim da cena.')
      ] },
    { id: 'ancient', n: 'Ancestral', d: 'Vilões ancestrais vêm de muito, muito tempo atrás. Muitos são imortais por causa dos seus poderes; outros são criaturas de além, que não sentem o tempo como nós.',
      P: ['d12', 'd10', 'd10', 'd8'], Q: ['d12', 'd12', 'd10', 'd8'], sp: 'Cósmico, Sombras, Presença, Vitalidade', sq: 'História, Perspicácia, Saber Mágico, Saber Esotérico', hp: 30, pick: 2,
      ab: [
        A('Contemplem Minha Glória Imortal', 'A', 'Atrapalhe vários alvos usando [poder] e o dado Máx. Ataque cada um com os dados Médio+Mín.'),
        A('De Antes do Espaço e do Tempo', 'R', 'Sofra 1 de dano irredutível para rolar de novo o conjunto de dados de quem estiver Atacando ou Atrapalhando você.'),
        A('Vitalidade Imortal', 'I', 'Se sua Vida fosse a 0 e você não tiver penalidade, role só o seu dado de [poder] e fique com essa Vida.'),
        A('Ação Ideal', 'A', 'Faça uma ação básica usando [qualidade] e o dado Máx.'),
        A('Fora do Tempo', 'A', 'Fortaleça a si mesmo usando [poder]. Se algum campeão estiver com a Vida na Zona Amarela, use os dados Médio+Mín. Se algum estiver na Zona Vermelha, use Máx+Médio+Mín.'),
        A('Dor Insondável', 'A', 'Ataque usando [poder] e o dado Máx. Atrapalhe o alvo que sofreu dano assim usando Máx+Mín.')
      ] },
    { id: 'bully', n: 'Valentão', d: 'Valentões têm alguns poderes em que confiam para machucar quem é mais fraco, mas no fundo são inseguros.',
      P: ['d10', 'd8', 'd8'], Q: ['d8', 'd8'], sp: 'Fogo, Presença, Força, Vitalidade', sq: 'Informações do Submundo, Combate Corpo a Corpo, Condicionamento Físico, Imponente', hp: 25, pick: 2,
      ab: [
        A('Quebrar Cabeças', 'A', 'Ataque dois alvos próximos usando [poder]: o dado Máx contra um e Médio+Mín contra o outro. Se um dos alvos Defender, essa Defesa vale contra os dois ataques.'),
        A('Cruel e Incomum', 'I', 'Sempre que você ou seus aliados próximos Atrapalharem, aumente a penalidade criada em 1.'),
        A('Esmague o Pequeno', 'A', 'Ataque usando [poder] e o dado Máx. Defenda-se contra todos os Ataques desse alvo com o dado Médio até o início do seu próximo turno.'),
        A('Birra de Ferido', 'A', 'Ataque usando [poder] e o dado Máx. Atrapalhe também esse alvo: se o dado de status dele for d6 ou menor, use Máx+Mín; se for d8, use o Máx; se for maior que d8, use o Médio.'),
        A('Punir a Fraqueza', 'A', 'Fortaleça a si mesmo usando [poder]. Se algum campeão estiver com a Vida na Zona Amarela, use Médio+Mín. Se algum estiver na Zona Vermelha, use Máx+Médio+Mín.'),
        A('Casca Grossa', 'I', 'Reduza em 2 todo o dano que você sofre.')
      ] },
    { id: 'creator', n: 'Criador', d: 'Criadores podem formar um exército sob comando.',
      P: ['d10', 'd8', 'd8', 'd6'], Q: ['d10', 'd8', 'd8', 'd8'], sp: 'Elemental/Energia, Materiais, Robótica', sq: 'Criatividade, Liderança, Saber Mágico, Tecnologia', hp: 15, pick: 2,
      ab: [
        A('Colher Seu Poder', 'R', 'Quando um dos seus lacaios for destruído, role o dado dele e Recupere essa quantidade de Vida.'),
        A('Chicote Retributivo', 'R', 'Quando um dos seus lacaios for destruído, role o dado dele e cause esse dano a outro alvo.'),
        A('Aliado Poderoso', 'A', 'Use [poder/qualidade] para criar um tenente com dado do mesmo tamanho do seu dado Máx.'),
        A('Poder Compartilhado', 'A', 'Fortaleça um dos seus lacaios usando [poder] e o dado Máx. Se for seu único lacaio, Fortaleça também a si mesmo com o dado Médio. Se não, Fortaleça cada um dos outros lacaios com o dado Mín.'),
        A('Convocar Horda', 'A', 'Use [poder/qualidade] para criar uma quantidade de lacaios igual ao valor do seu dado Máx. O dado inicial desses lacaios é do tamanho do seu dado Mín.'),
        A('Ataque de Enxame', 'A', 'Ataque usando [poder] e o dado Máx, com um bônus igual ao número de lacaios que você controla.')
      ] },
    { id: 'dampening', n: 'Enfraquecedor', d: 'Vilões enfraquecedores não só atrapalham os campeões: reduzem ativamente a força e a capacidade deles de funcionar.',
      P: ['d10', 'd8', 'd8'], Q: ['d10', 'd8', 'd8'], sp: 'Cósmico, Sugestão, Transmutação', sq: 'Gracejos, Medicina, Ciência, Autodisciplina', hp: 25, pick: 2,
      ab: [
        A('Aproveitar o Fracasso', 'R', 'Quando um campeão próximo que você enxerga invocar uma reviravolta, role seu dado de [poder] como Atrapalhar contra ele.'),
        A('Maldição da Fraqueza', 'A', 'Atrapalhe usando [poder] e o dado Máx; essa penalidade é persistente e exclusiva. Enquanto ela estiver no alvo, reduza em um tamanho o maior poder dele que você escolher. Ataque usando o dado Médio.'),
        A('Campo de Aflição', 'A', 'Atrapalhe vários alvos usando [poder]. Enquanto um campeão tiver essa penalidade, reduza todos os poderes dele em um tamanho.'),
        A('Retorno Anulador', 'R', 'Quando for Atacado por um campeão com uma penalidade, ignore o dano dele e remova uma penalidade desse campeão.'),
        A('Golpe Embaralhador', 'A', 'Ataque usando [poder]. Reduza em um tamanho todas as qualidades do alvo até o seu próximo turno.'),
        A('Terror da Insuficiência', 'A', 'Ataque usando [qualidade] e o dado Máx. Atrapalhe cada oponente que enxergue ou ouça o alvo do seu Ataque usando o dado Mín.')
      ] },
    { id: 'disruptive', n: 'Disruptivo', d: 'Um vilão disruptivo causa caos entre grupos e aproveita o caos para atacar. Costuma causar todo tipo de dano colateral ao perseguir seu objetivo.',
      P: ['d10', 'd10', 'd8', 'd8'], Q: ['d10', 'd8', 'd8'], sp: 'Elemental/Energia, Ilusões, Sugestão, Transmutação', sq: 'Prontidão, Perspicácia, Persuasão, Combate à Distância', hp: 20, pick: 2,
      ab: [
        A('Caos Benéfico', 'A', 'Atrapalhe usando [poder] e o dado Máx. Recupere Vida usando os dados Mín+Médio.'),
        A('Fogo de Cobertura', 'A', 'Atrapalhe vários alvos usando [qualidade]. Você e seus aliados próximos Defendem usando o dado Máx.'),
        A('Toque Enfurecedor', 'A', 'Ataque usando [poder] e o dado Máx. O alvo que sofrer dano assim Ataca um aliado rolando seu maior dado de poder.'),
        A('Explosão Descuidada', 'A', 'Ataque vários alvos usando [qualidade] e o dado Mín. Atrapalhe cada alvo com o dado Máx. Se um deles tirar dados iguais no próximo turno, sofre dano igual à penalidade.'),
        A('Interrupção Dolorosa', 'R', 'Quando for Atacado por um campeão com uma penalidade, esse campeão sofre dano igual ao tamanho da penalidade.'),
        A('Provar a Loucura', 'R', 'Sempre que um alvo fizer uma ação de Atrapalhar contra você, você pode antes rolar seu dado de [poder] como Atrapalhar contra ele.')
      ] },
    { id: 'focused', n: 'Focado', d: 'Um vilão focado tem um poder principal forte, que usa de várias maneiras.',
      P: ['d12', 'd8'], Q: ['d10', 'd8'], sp: 'Elemental/Energia, Materiais', sq: 'Criatividade, Combate à Distância, Autodisciplina', hp: 15, pick: 3, rule: 'two-one', kind: 'poder', note: 'Escolha três habilidades: duas usando o mesmo poder e uma terceira usando um poder diferente.',
      ab: [
        A('Absorção Elemental', 'R', 'Quando for Atacado com [energia/elemento], Recupere essa quantidade de Vida em vez de sofrer dano. Quando for Atrapalhado com [energia/elemento], Fortaleça a si mesmo em vez disso.'),
        A('Carga Defensiva', 'A', 'Defenda a si mesmo usando [poder]. Essa Defesa dura até o seu próximo turno. Se um Ataque causar mais dano que o valor da Defesa, encerre a Defesa e Ataque o atacante com o valor dela.'),
        A('Alinhamento Perfeito', 'I', 'Ignore todo o dano de [energia/elemento].'),
        A('Despejar de Uma Vez', 'A', 'Ataque um alvo usando [poder] e o dado Máx. Esse alvo não pode Defender nem usar reações contra este Ataque. Ataque vários outros alvos próximos com o dado Mín.'),
        A('Escudo Solidário', 'R', 'Defenda-se de um Ataque que mire só você rolando só o seu dado de [poder]. Fortaleça a si mesmo com o dano reduzido.'),
        A('Emaranhado Cruel', 'A', 'Atrapalhe um alvo usando [poder] e o dado Máx. Ataque esse alvo com o dado Médio.')
      ] },
    { id: 'generalist', n: 'Generalista', d: 'O generalista funciona em vários cenários, com um bom leque de poderes e qualidades à disposição.',
      P: ['d10', 'd8', 'd8', 'd6'], Q: ['d10', 'd8', 'd6'], sp: 'Materiais, Mobilidade, Força, Vitalidade', sq: 'Combate Corpo a Corpo, Convicção, Informações do Submundo, Condicionamento Físico', hp: 25, pick: 3,
      ab: [
        A('Guarda-Costas', 'R', 'Quando um aliado for Atacado, Defenda-o rolando só o seu dado de [poder]. Fortaleça a si mesmo com esse valor.'),
        A('Confiável', 'I', 'Sempre que tirar 1 em um dado, role-o de novo uma vez.'),
        A('Golpe Pesado', 'A', 'Ataque usando [qualidade] e o dado Máx. Recupere Vida igual ao seu dado Mín.'),
        A('Combatente Firme', 'A', 'Fortaleça usando [poder] e o dado Máx. Defenda com o dado Médio.'),
        A('Cliente Casca-Grossa', 'I', 'Reduza o dano físico e de energia que você sofre em 1 se a cena estiver na Zona Verde, 2 na Amarela ou 3 na Vermelha.'),
        A('Aura Devastadora', 'A', 'Atrapalhe vários alvos próximos usando [poder]. Fortaleça a si mesmo usando o dado Máx.')
      ] },
    { id: 'leech', n: 'Parasita', d: 'Vilões parasitas drenam a força das vítimas para se fortalecer.',
      P: ['d10', 'd8', 'd6'], Q: ['d8', 'd8', 'd8'], sp: 'Elemental/Energia, Metamorfose, Tóxico', sq: 'Combate Corpo a Corpo, Medicina, Persuasão, Furtividade', hp: 15, pick: 2,
      ab: [
        A('Olhar Hipnótico', 'R', 'Quando for Atacado, Defenda-se rolando só o seu dado de [poder]. Se isso anular o Ataque por completo, Atrapalhe o atacante e Fortaleça a si mesmo com o mesmo resultado.'),
        A('Drenar a Vida', 'A', 'Ataque usando [poder/qualidade] e o dado Máx. Atrapalhe esse alvo com o dado Médio. Recupere Vida igual ao seu dado Mín.'),
        A('Consumir Poder', 'R', 'Quando um bônus for usado contra você num Ataque ou ao Atrapalhar, você pode antes destruir esse bônus. Se fizer isso, role seu dado de [poder] e Recupere Vida igual ao resultado mais o bônus destruído.'),
        A('Definhamento Sifonante', 'A', 'Atrapalhe usando [poder] e os dados Máx+Mín. Fortaleça com o dado Médio.'),
        A('Sussurros Inquietantes', 'A', 'Atrapalhe vários alvos usando [poder]. Recupere Vida igual ao seu dado Mín. Se tirar dados iguais, também Ataque um desses alvos usando o dado Máx.'),
        A('Vitalidade Violenta', 'A', 'Ataque usando [poder] e o dado Máx. Fortaleça com o dado Mín. Esse bônus é persistente e exclusivo.')
      ] },
    { id: 'mastermind', n: 'Mente Mestra', d: 'A mente mestra tem um plano para tudo e o executa no calor da batalha.',
      P: ['d12', 'd10', 'd8'], Q: ['d10', 'd8', 'd8', 'd8'], sp: 'Dedução, Invenções, Cálculo Relâmpago, Traje de Poder', sq: 'Criatividade, Perspicácia, Investigação, Ciência, Tecnologia', hp: 20, pick: 2,
      ab: [
        A('Contingências sobre Contingências', 'A', 'Fortaleça a si mesmo usando [qualidade] e o dado Máx. Torne esse bônus persistente e exclusivo, ou Fortaleça-se de novo usando Mín+Médio.'),
        A('Se Meus Cálculos Estiverem Certos…', 'R', 'Sofra 1 de dano irredutível para rolar de novo o seu conjunto de dados no seu turno, ou o de um campeão que Ataque ou Atrapalhe você.'),
        A('Explorar a Fraqueza', 'A', 'Ataque um campeão usando [qualidade]. Atrapalhe todos os campeões usando o dado Máx.'),
        A('Reviravolta da Sorte', 'R', 'Quando for Atacado, Fortaleça a si mesmo usando o dado Máx do atacante.'),
        A('Preparado para Tudo', 'R', 'No início do seu turno, se não tiver bônus em jogo, role só o seu dado de [qualidade] como Fortalecer em si mesmo.'),
        A('Monólogo Vilanesco', 'A', 'Atrapalhe todos os oponentes que o vejam ou ouçam usando [qualidade]. Fortaleça a si mesmo usando o dado Máx.')
      ] },
    { id: 'ninja', n: 'Ninja', d: 'Vilões ninja focam em ataques furtivos e proezas marciais. E em espadas incríveis.',
      P: ['d10', 'd10', 'd8', 'd8', 'd6'], Q: ['d10', 'd10', 'd8', 'd8'], sp: 'Agilidade, Arma Emblemática, Força, Escalar Paredes', sq: 'Prontidão, Combate Corpo a Corpo, Informações do Submundo, Furtividade', hp: 20, pick: 2,
      ab: [
        A('Piscada Mortal', 'A', 'Ataque vários alvos próximos usando [qualidade]. Depois, vá parar onde quiser na cena.'),
        A('Arrancada Defensiva', 'R', 'Quando for Atacado, Defenda-se rolando só o seu dado de [qualidade]. Fortaleça a si mesmo com o dano reduzido.'),
        A('Sumir da Vista', 'I', 'Se fizer no seu turno uma ação que não seja Atacar nem Atrapalhar, também use o dado Mín para Defender contra todos os Ataques contra você até o seu próximo turno.'),
        A('Ventos que Sobem, Ondas que Quebram', 'A', 'Ataque usando [qualidade]: o dado Máx contra um alvo, o Médio contra outro e o Mín contra qualquer alvo.'),
        A('Cortar os Tendões', 'A', 'Ataque usando [qualidade]. Atrapalhe esse alvo usando Máx+Mín.'),
        A('Lâmina da Sombra', 'A', 'Ataque usando [qualidade] e o dado Máx. Defenda-se de todos os Ataques contra você com o dado Médio até o início do seu próximo turno.')
      ] },
    { id: 'overpowered', n: 'Sobrepoderoso', d: 'Vilões sobrepoderosos têm poderes enormes e são um grande desafio sempre que entram em cena. Em geral, a chave para vencê-los é enganá-los, não lutar de frente.',
      P: ['d12', 'd10', 'd10'], Q: ['d8', 'd6'], sp: 'Elemental/Energia, Presença, Psíquicos', sq: 'Convicção, Delicadeza, Imponente, Autodisciplina', hp: 35, pick: 2,
      ab: [
        A('Não Ouse Me Tocar', 'R', 'Quando for Atacado, Defenda-se rolando só o seu dado de [poder]. Cause esse dano a outro alvo próximo.'),
        A('Enfrentem Todo o Meu Poder', 'A', 'Ataque usando [poder] e os dados Máx+Médio+Mín. Atrapalhe a si mesmo usando o dado Máx. Sofra dano igual a Médio+Mín.'),
        A('Temam Meu Poder Esmagador', 'A', 'Atrapalhe usando [poder] e o dado Máx. Ataque esse alvo usando Médio+Mín.'),
        A('Poder Bruto', 'I', 'Sempre que tirar 1, role aquele dado de novo.'),
        A('Alegrem-se, Meus Seguidores', 'A', 'Fortaleça usando [poder]. Recupere Vida igual ao seu dado Máx. Cada aliado próximo Recupera Vida igual ao seu dado Mín. Cada lacaio e tenente próximo que tenha perdido tamanho de dado sobe um tamanho.'),
        A('Vocês Não São Dignos do Meu Poder', 'A', 'Ataque vários alvos usando [poder] e o dado Máx. Atrapalhe cada alvo com o dado Médio.')
      ] },
    { id: 'prideful', n: 'Orgulhoso', d: 'O vilão orgulhoso luta para provar a própria superioridade, em geral enfrentando um a um os campeões mais poderosos.',
      P: ['d10', 'd10', 'd10', 'd8'], Q: ['d10', 'd10', 'd8', 'd8'], sp: 'Percepção, Engenhocas, Traje de Poder, Força', sq: 'Combate Corpo a Corpo, Convicção, Imponente, Autodisciplina', hp: 25, pick: 2, rule: 'all-diff', note: 'Escolha duas habilidades, usando poderes ou qualidades diferentes.',
      ab: [
        A('Eu Conheço a Sua Fraqueza', 'R', 'Quando um campeão próximo tirar 1 em um dos dados no turno dele, role só o seu dado de [poder/qualidade] como Ataque contra ele.'),
        A('Cuido do Resto de Vocês Depois', 'A', 'Ataque um alvo usando [poder/qualidade] e os dados Máx+Mín. Defenda-se de todos os Ataques de todos os outros alvos com o dado Médio até o início do seu próximo turno.'),
        A('Minha Grandeza Não Pode Ser Negada', 'A', 'Ataque um alvo usando [poder/qualidade] e os dados Máx+Mín. Se o Ataque fizer o alvo mudar de zona, Fortaleça usando o dado Médio. Esse bônus é persistente e exclusivo.'),
        A('Zombaria Sustentada', 'A', 'Atrapalhe usando [poder/qualidade] e o dado Máx. Essa penalidade é persistente e exclusiva.'),
        A('Poder Inquestionável', 'I', 'Reduza em 2 todo o dano que você sofre.'),
        A('Vocês Não Vão Sobreviver', 'R', 'Se um oponente terminar o turno perto de você, role só o seu dado de [poder] como Atrapalhar contra ele.')
      ] },
    { id: 'relentless', n: 'Implacável', d: 'Vilões implacáveis focam em um alvo e o caçam repetidas vezes, trocando de alvo só quando o atual está acabado.',
      P: ['d10', 'd8', 'd6'], Q: ['d10', 'd8', 'd6'], sp: 'Intuição, Mobilidade, Arma Emblemática, Velocidade', sq: 'Prontidão, Convicção, Investigação, Combate à Distância', hp: 20, pick: 2,
      ab: [
        A('Perseguição Obstinada', 'R', 'Quando um oponente se afastar de você, você pode segui-lo e rolar só o seu dado de status como Atrapalhar contra ele.'),
        A('Presa Fácil', 'A', 'Ataque e Atrapalhe usando [qualidade]. Se o alvo tiver dado de status d6 ou menor, use Máx+Mín; se for d8, use o Máx; se for maior que d8, use o Médio.'),
        A('Punição Repetida', 'R', 'Depois de fazer uma ação de Atacar no seu turno, use o dado Médio para fazer outro Ataque contra um dos alvos do primeiro.'),
        A('Perto Demais para Conforto', 'I', 'Sempre que um oponente próximo for Atacar você, você pode destruir um bônus seu ou uma penalidade dele para reduzir o Ataque pelo valor do que destruiu.'),
        A('Girar a Faca', 'R', 'Quando um aliado seu Atacar um oponente, role só o seu dado de [qualidade] e some esse dano ao Ataque.'),
        A('Na Sua Cara', 'A', 'Ataque usando [qualidade] e o dado Máx. Se o alvo não Atacar você no turno seguinte, Atrapalhe-o usando o dado Médio.')
      ] },
    { id: 'skilled', n: 'Habilidoso', d: 'Vilões habilidosos têm um conjunto particular de perícias que lhes dá muitas opções para concluir seus planos sinistros.',
      P: ['d10', 'd8', 'd6'], Q: ['d10', 'd10', 'd8', 'd8', 'd8'], sp: 'Poderes Intelectuais, Poderes Tecnológicos', sq: 'Qualidades Mentais, Qualidades Físicas', hp: 15, pick: 2,
      ab: [
        A('O Melhor do Ramo', 'A', 'Atrapalhe usando [poder] e o dado Mín. Fortaleça a si mesmo usando o dado Máx.'),
        A('Esquivar e Girar', 'R', 'Quando for Atacado, Defenda-se rolando só o seu dado de [qualidade]. Cause esse dano a outro alvo.'),
        A('Sempre Capaz', 'I', 'Sempre que receber uma penalidade, reduza o tamanho dela em 1.'),
        A('Perícia Flexível', 'A', 'Faça qualquer ação básica usando o dado Máx. Recupere Vida igual ao seu dado Médio.'),
        A('Desigualdade Incomparável', 'A', 'Atrapalhe usando [qualidade] e os dados Máx+Mín. Essa penalidade é persistente e exclusiva.'),
        A('Despistar', 'A', 'Atrapalhe vários alvos usando [qualidade] e o dado Máx. Se tirar dados iguais, também Ataque cada alvo com o dado Médio.')
      ] },
    { id: 'specialized', n: 'Especialista', d: 'Um vilão especialista é de nível mundial em uma perícia e a explora ao máximo para cumprir a tarefa.',
      P: ['d10', 'd8'], Q: ['d12', 'd8'], sp: 'Poderes Atléticos, Poderes Intelectuais', sq: 'Qualidades Mentais, Qualidades Físicas', hp: 20, pick: 3, rule: 'two-one', kind: 'qualidade', note: 'Escolha três habilidades: duas usando a mesma qualidade e uma terceira usando uma qualidade diferente.',
      ab: [
        A('Cobertura Ativa', 'R', 'Defenda-se de um Ataque em que você seja o único alvo rolando só o seu dado de [qualidade]. Outro alvo próximo sofre dano igual ao dano reduzido.'),
        A('Corte Amplo', 'A', 'Ataque usando [qualidade]: um alvo com o dado Máx, outro com o Médio e um terceiro com o Mín.'),
        A('Ataque Focado', 'A', 'Ataque usando [qualidade] e os dados Máx+Mín. Defenda-se usando o dado Médio.'),
        A('Alvo Conhecido', 'I', 'Sempre que Atacar um alvo que já sofreu dano seu nesta cena, ganhe +1 de bônus persistente e exclusivo contra ele.'),
        A('Golpe Neutralizante', 'A', 'Ataque um alvo usando [qualidade] e os dados Máx+Mín. Esse alvo não pode Defender nem usar reações contra este Ataque.'),
        A('Tormento Emaranhado', 'A', 'Atrapalhe um alvo usando [qualidade] e o dado Máx. Ataque esse alvo usando o dado Médio.')
      ] },
    { id: 'tactician', n: 'Tático', d: 'O tático organiza aliados e coordena planos de batalha para usar o time contra os campeões.',
      P: ['d8', 'd8', 'd6', 'd6'], Q: ['d10', 'd8', 'd6'], sp: 'Percepção, Voo, Intuição, Montaria/Veículo Emblemático', sq: 'Prontidão, Perspicácia, Liderança, Combate à Distância', hp: 20, pick: 2,
      ab: [
        A('Juntar Forças', 'A', 'Ataque usando [qualidade] e o dado Máx. Some 1 ao Ataque por cada outro aliado que atacou esse alvo desde o seu último turno.'),
        A('Eu Apoio Vocês', 'R', 'Quando um aliado próximo fizer um Ataque, você pode também Atacar o mesmo alvo rolando só o seu dado de [qualidade].'),
        A('Ação Conjunta', 'A', 'Faça uma ação básica usando [qualidade] e o dado Máx. Um aliado próximo faz a mesma ação básica como reação.'),
        A('Marcha Organizada', 'A', 'Fortaleça usando [qualidade] e o dado Máx. Esse bônus vale para a ação de todos os aliados até o início do seu próximo turno.'),
        A('Tente de Novo', 'R', 'Sofra 1 de dano irredutível para rolar de novo o conjunto de dados de um aliado.'),
        A('Trabalhando Juntos', 'I', 'Enquanto tiver pelo menos 1 aliado próximo, você pode rolar de novo todos os 1 dos seus dados.')
      ] },
    { id: 'underpowered', n: 'Subpoderoso', d: 'Vilões subpoderosos provavelmente não deveriam estar lutando na primeira divisão… mas não percebem. Seus poderes não estão na escala dos outros, mas ainda podem ser uma ameaça na situação certa.',
      P: ['d8', 'd6', 'd6', 'd6'], Q: ['d10', 'd8', 'd6'], sp: 'Elemental/Energia, Poderes Tecnológicos', sq: 'Gracejos, Convicção, Informações do Submundo, Tecnologia', hp: 10, pick: 3, rule: 'all-diff', note: 'Escolha três habilidades, todas usando poderes e qualidades diferentes.',
      ab: [
        A('Evitar o Inevitável', 'I', 'Sempre que sua Vida fosse a 0 ou menos, evite esse dano e reduza todos os seus poderes em um tamanho. Se isso reduzir algum dado para menos que d4, você é nocauteado.'),
        A('Não Me Subestime', 'A', 'Ataque usando [poder] e os dados Máx+Médio. Sofra dano irredutível igual ao seu dado Mín. Se tirar dados iguais, não pode usar esta habilidade de novo nesta cena.'),
        A('Eu Posso Fazer Tudo', 'A', 'Fortaleça usando [qualidade] e o dado Máx. Atrapalhe usando o dado Médio. Ataque usando o dado Mín.'),
        A('Último Recurso', 'R', 'Quando for Atacado, Defenda-se rolando só o seu dado de [poder]. Se a sua rolagem reduzir o dano exatamente a 0, Recupere Vida igual ao dano reduzido, Fortaleça com esse valor e Atrapalhe a fonte do Ataque com esse valor.'),
        A('Sorte? Ou Genialidade?', 'A', 'Ataque usando [poder]. Se tirar dados iguais, some esse valor ao Ataque. Se tirar três iguais, some os três dados ao Ataque.'),
        A('Ainda uma Ameaça', 'A', 'Ataque vários alvos usando [qualidade]. Defenda-se de todos os Ataques contra você até o seu próximo turno usando o dado Mín.')
      ] }
  ];

  // status: [[condition, die], …], read from top (first) to bottom
  const archetypes = [
    { id: 'bruiser', n: 'Brutamontes', hp: 20, pick: 2, pairs: 'Valentão, Disruptivo, Generalista, Orgulhoso',
      d: 'Os brutamontes são melhores na linha de frente, aguentando pancada. Quanto mais dano sofrem, mais assustadores ficam. Como os campeões, o status deles vem da própria Vida (veja a tabela de Vida).',
      status: [['Zona Verde (Vida)', 'd6'], ['Zona Amarela (Vida)', 'd8'], ['Zona Vermelha (Vida)', 'd10']],
      ab: [
        A('Vem Pra Cima!', 'R', 'Quando for Atacado, use a quantidade de dano sofrido pelo Ataque para Fortalecer a si mesmo.'),
        A('Não Sinto Dor', 'I', 'Reduza em 1 o dano físico e de energia que sofre na Zona Verde, 2 na Amarela e 3 na Vermelha.'),
        A('Sorria e Aguente', 'A', 'Defenda usando [qualidade] e os dados Médio+Mín. Recupere Vida igual ao seu dado Máx.'),
        A('Descontar', 'A', 'Ataque usando [poder]. Se estiver em status Verde, use o dado Máx. Se estiver em Amarelo, use Máx+Mín. Se estiver em Vermelho, use Máx+Mín contra um alvo e o Médio contra outro.'),
        A('Muralha Viva', 'R', 'Quando um aliado próximo for Atacado, você pode se tornar o alvo desse Ataque. Pode usar esta reação quantas vezes quiser na rodada, sofrendo 1 de dano irredutível por cada vez além da primeira.'),
        A('Arremessar Campeão', 'A', 'Ataque usando [poder] e o dado Máx. Atrapalhe esse alvo com o dado Médio, ou Ataque outro alvo próximo com o Médio.')
      ] },
    { id: 'domain', n: 'Domínio', hp: 30, pick: 3, pairs: 'Enfraquecedor, Sobrepoderoso',
      d: 'Vilões de Domínio estão em sintonia com o entorno ou sabem distorcer o ambiente a seu favor. Vilões ecológicos, ou que alteram a realidade para atacar, são de Domínio. O status vem do ambiente.',
      status: [['3 ou mais lacaios, tenentes e/ou desafios do ambiente', 'd10'], ['1 a 2 lacaios, tenentes e/ou desafios do ambiente', 'd8'], ['Nenhum lacaio, tenente ou desafio do ambiente', 'd6']],
      ab: [
        A('Subir do Meu Reino', 'I', 'Ignore o dano de uma fonte do ambiente durante o turno do ambiente.'),
        A('A Terra Treme ao Seu Redor', 'A', 'Role quantos dados de lacaios do ambiente quiser. Ataque todos os alvos da cena (exceto você) com esses dados. Remova esses lacaios.'),
        A('O Poder Atende a Todas as Formas', 'A', 'Remova quantos bônus criados pelo ambiente quiser. Para cada bônus removido, você pode Atacar um alvo com o dado Médio, usando um bônus diferente em cada um.'),
        A('Este Lugar Me Obedece', 'A', 'Ative uma das reviravoltas do ambiente na zona atual ou numa zona mais perto do vermelho.'),
        A('A Mim, Meus Lacaios', 'A', 'Role quantos dados de lacaios do ambiente quiser e Recupere essa quantidade de Vida. Remova esses lacaios.'),
        A('O Mundo Se Move para Me Defender', 'R', 'Quando for Atacado, redirecione o Ataque para um lacaio do ambiente.')
      ] },
    { id: 'formidable', n: 'Formidável', hp: 25, pick: 2, pairs: 'Ancestral, Disruptivo, Sobrepoderoso',
      d: 'Vilões formidáveis têm poderes incríveis, difíceis de deter, mas a fonte deles deixa uma fraqueza crítica. Se os campeões explorarem esse calcanhar de Aquiles, levam vantagem. O status vem das penalidades e bônus ligados à fraqueza.',
      status: [['O vilão tem penalidades ligadas à fraqueza e nenhum bônus', 'd4'], ['Tem penalidades ligadas à fraqueza, mas também bônus que a atenuam', 'd8'], ['Não tem penalidades ligadas à fraqueza', 'd12']],
      ab: [
        A('Canalizar a Grandeza', 'A', 'Fortaleça usando [poder] e o dado Máx. Esse bônus é persistente e exclusivo. Também Ataque com o dado Médio.'),
        A('Elevação Purificadora', 'A', 'Fortaleça usando [poder] e os dados Máx+Mín. Remova todas as penalidades de si mesmo.'),
        A('Negação Consumida', 'A', 'Destrua um dos seus bônus. Cause a cada oponente dano igual ao valor desse bônus.'),
        A('Dividir a Sua Glória', 'A', 'Fortaleça a si mesmo usando [poder] e o dado Máx. Fortaleça um aliado próximo com o dado Médio e outro aliado próximo com o Mín.'),
        A('Modelo Insuperável', 'A', 'Faça qualquer ação básica e use o dado Máx.'),
        A('Fibra Indomada', 'R', 'Ignore todas as penalidades sobre você para a sua ação. Sofra dano irredutível igual ao total dessas penalidades.')
      ] },
    { id: 'fragile', n: 'Frágil', hp: -5, pick: 2, pairs: 'Focado, Subpoderoso',
      d: 'Vilões frágeis dão um belo soco, mas, quando entram na confusão e levam alguns golpes, ficam bem menos eficazes. Como os campeões, o status vem da própria Vida (veja a tabela de Vida).',
      status: [['Zona Verde (Vida)', 'd10'], ['Zona Amarela (Vida)', 'd8'], ['Zona Vermelha (Vida)', 'd6']],
      ab: [
        A('Pancada Descuidada', 'A', 'Ataque usando [poder] e os dados Máx+Médio. Atrapalhe a si mesmo com o dado Mín.'),
        A('Vazando!', 'R', 'Quando for Atacado, Defenda-se rolando só o seu dado de status. Se o dano for reduzido a 0, você pode ir para qualquer outro lugar da cena.'),
        A('Golpe Desmontador', 'A', 'Ataque usando [qualidade]. Depois, remova todos os bônus do alvo.'),
        A('Plano de Fuga', 'I', 'Sempre que a sua zona pessoal mudar, você pode se mover imediatamente para outro lugar da cena.'),
        A('Ataque Encoberto', 'A', 'Ataque usando [qualidade] e o dado Máx. Defenda-se de todos os Ataques contra você com o dado Mín até o início do seu próximo turno.'),
        A('Golpe Versátil', 'A', 'Ataque usando [qualidade] e o dado Máx. Se estiver com a Vida cheia, este Ataque causa dano irredutível e não pode sofrer reações. Se estiver na Zona Verde sem a Vida cheia, Defenda-se com o dado Mín. Se estiver na Amarela, Fortaleça a si mesmo com o dado Mín. Se estiver na Vermelha, Recupere Vida igual ao seu dado Mín.')
      ] },
    { id: 'guerrilla', n: 'Guerrilheiro', hp: 20, pick: 2, pairs: 'Ninja, Orgulhoso',
      d: 'Guerrilheiros são mais eficazes contra um grupo: usam táticas variadas para quebrar a união do time e transformam fogo amigo em arma. O status vem do número de oponentes engajados com eles.',
      status: [['4 ou mais oponentes engajados', 'd10'], ['2 a 3 oponentes engajados', 'd8'], ['0 a 1 oponente engajado', 'd6']],
      ab: [
        A('Combate Corpo a Corpo Cerrado', 'A', 'Ataque vários alvos próximos usando [qualidade]. Atrapalhe cada alvo usando o dado Mín.'),
        A('Chances Iguais', 'I', 'No início do seu turno, ganhe um bônus igual ao número de oponentes que o Atacaram desde o seu último turno.'),
        A('Ritmo de Luta', 'A', 'Ataque usando [qualidade]: o dado Máx contra um alvo, o Médio contra outro e o Mín contra um terceiro. Se Atacar três alvos diferentes, o dano é irredutível.'),
        A('Escudo Humano', 'A', 'Ataque um alvo usando [qualidade] e os dados Máx+Mín. Defenda-se de todos os Ataques de outros alvos com o dado Médio até o início do seu próximo turno. Todo o dano Defendido é causado ao alvo do seu Ataque.'),
        A('Desvio Malicioso', 'R', 'Defenda-se de um Ataque rolando só o seu dado de status. Cause esse dano a outro alvo próximo.'),
        A('Confusão Emaranhada', 'I', 'Se você estiver em desvantagem numérica contra oponentes próximos, reduza em 2 todo o dano que sofre.')
      ] },
    { id: 'indomitable', n: 'Indomável', hp: 20, pick: 2, pairs: 'Generalista, Implacável',
      d: 'Vilões indomáveis são sólidos, confiáveis ou simplesmente não se importam com o que acontece. Funcionam do mesmo jeito até terminar o serviço, então não precisam acompanhar o status.',
      status: [['Sempre', 'd8']],
      ab: [
        A('Absorver Energia', 'R', 'Defenda rolando só o seu dado de status. Se a Defesa reduzir o dano a 0, Fortaleça usando o dano evitado.'),
        A('Agarrar e Arrastar', 'A', 'Ataque usando [poder]. Atrapalhe esse alvo com o dado Máx, ou Defenda a si mesmo com o dado Mín e vocês dois vão parar em outro lugar da cena.'),
        A('Serviço Pesado', 'I', 'Reduza em 2 o dano que você sofre.'),
        A('Preparar-se para o Pior', 'A', 'Fortaleça a si mesmo usando [qualidade] e o dado Máx. Esse bônus é persistente e exclusivo.'),
        A('Fogo de Supressão', 'A', 'Ataque vários alvos usando [qualidade]. Atrapalhe esses alvos usando o dado Mín.'),
        A('Incansável', 'A', 'Ataque usando [poder] e o dado Máx. Recupere Vida igual ao seu dado Mín.')
      ] },
    { id: 'inhibitor', n: 'Inibidor', hp: 10, pick: 2, pairs: 'Enfraquecedor, Focado',
      d: 'Vilões inibidores aproveitam as fraquezas dos campeões… e criam fraquezas onde não havia. O status vem do número de campeões com penalidades.',
      status: [['3 ou mais campeões com pelo menos uma penalidade', 'd10'], ['1 a 2 campeões com pelo menos uma penalidade', 'd8'], ['Nenhum campeão com penalidade', 'd6']],
      ab: [
        A('Supressão de Área', 'A', 'Atrapalhe vários alvos usando [poder] e o dado Máx. Ataque um desses alvos com o dado Médio.'),
        A('Sifão Esmagador', 'A', 'Cada campeão perde Vida igual ao total de penalidades sobre ele. Recupere a mesma quantidade de Vida. Remova essas penalidades.'),
        A('Dreno Direcionado', 'A', 'Atrapalhe usando [poder] e os dados Máx+Médio, ou use o dado Máx e torne a penalidade persistente e exclusiva.'),
        A('Vida Atada', 'A', 'Atrapalhe usando [poder]. Essa penalidade é persistente e exclusiva. Enquanto ela estiver em jogo, reduza em 1 o dano que sofre e, sempre que você sofrer dano, o alvo com essa penalidade sofre 1 de dano irredutível.'),
        A('Destino Torcido', 'A', 'Escolha um alvo próximo. Transforme todos os bônus dele em penalidades equivalentes, ou mova uma penalidade dele para outro alvo que você enxergue.'),
        A('Golpe de Quem Está por Cima', 'R', 'Quando for Atacado por alguém com uma penalidade criada por você, Defenda-se rolando só o seu dado de status, e o atacante também sofre esse tanto de dano.')
      ] },
    { id: 'inventor', n: 'Inventor', hp: 10, pick: 2, pairs: 'Mente Mestra, Subpoderoso',
      d: 'Inventores dependem de preparação e invenções sob medida para ficar em pé de igualdade com os campeões. Conte os bônus e penalidades em jogo que o vilão criou com Invenções e/ou Ciência, e as invenções em cena (inclusive as de lacaios, tenentes e reviravoltas).',
      status: [['4 ou mais invenções e bônus/penalidades', 'd12'], ['2 a 3 invenções e bônus/penalidades', 'd10'], ['1 invenção e bônus/penalidade', 'd8'], ['Nenhuma invenção nem bônus/penalidade', 'd6']],
      ab: [
        A('Criador Capaz', 'I', 'Sempre que criar um bônus, aumente esse bônus em 1.'),
        A('Corta dos Dois Lados', 'A', 'Fortaleça usando [poder]. Atrapalhe com o dado Máx. Ataque com o dado Mín.'),
        A('Destruição Potencializada', 'A', 'Ataque usando [poder] e pelo menos um bônus. Use Máx+Médio+Mín e some todos os seus bônus, destruindo-os.'),
        A('Aproveitar a Vantagem', 'A', 'Ataque usando [poder] e pelo menos um bônus. Se tiver vários bônus, também pode Atacar outro alvo usando o dado Mín e outro bônus, e um terceiro alvo usando o dado Máx e um terceiro bônus.'),
        A('Servir ao Criador', 'R', 'Descarte um dos seus bônus para Defender contra todos os Ataques contra você até o seu próximo turno, usando o valor do bônus como resultado da Defesa.'),
        A('Criação Variável', 'A', 'Fortaleça usando [poder] e o dado Máx, e também Fortaleça com o dado Médio. Torne um desses bônus persistente e exclusivo, ou Ataque com o dado Mín.')
      ] },
    { id: 'legion', n: 'Legião', hp: -5, pick: 2, pairs: 'Adaptável, Criador (escolha com cuidado para não repetir habilidades), Tático',
      d: 'Vilões de Legião trabalham como uma multidão desordenada. Aproveitam a vantagem numérica, mas, quanto mais tem, mais fraco é cada um. Um vilão de Legião precisa de um jeito de criar mais vilões (uma habilidade de arquétipo, de abordagem ou uma melhoria). Conte os lacaios aliados da Legião na cena.',
      status: [['9 ou mais lacaios', 'd4'], ['5 a 8 lacaios', 'd6'], ['3 a 4 lacaios', 'd8'], ['1 a 2 lacaios', 'd10'], ['Nenhum lacaio', 'd12']],
      ab: [
        A('Dividir e Conquistar', 'R', 'Quando fosse sofrer dano físico, evite esse dano e crie um lacaio com dado do tamanho do seu dado de status atual (inclusive o lacaio recém-criado). Pode usar esta reação mais de uma vez por rodada, mas a cada uso após o primeiro você sofre 1 de dano irredutível.'),
        A('Instabilidade de Forma', 'I', 'Sempre que um lacaio da Legião maior que d4 rolar um salvamento contra dano físico e passar, ele se divide em dois dados de um tamanho menor em vez de perder um tamanho, e você sofre 1 de dano irredutível. Se falhar no salvamento, o lacaio só perde um tamanho, em vez de ser destruído.'),
        A('Partes do Todo', 'A', 'Role seu dado de status único. Sofra essa quantidade de dano irredutível. Crie essa quantidade de lacaios d6.'),
        A('Vitalidade Devolvida', 'R', 'Quando um dos seus lacaios for destruído, role o dado dele. Você Recupera essa quantidade de Vida.'),
        A('Dividir-se', 'A', 'Adicione dois lacaios de tamanho um dado menor que o seu status atual.'),
        A('Combinar', 'A', 'Remova quantos lacaios controlados pela Legião quiser. Role os dados deles e Recupere essa quantidade de Vida.'),
        A('Ações Descoordenadas', 'I', 'Sempre que vários lacaios da Legião fizerem a mesma ação contra o mesmo alvo, você deve rolar todos os dados deles ao mesmo tempo e usar o dado de menor resultado entre eles como resultado de cada lacaio nessa ação.')
      ], gain: 'Ações Descoordenadas' },
    { id: 'loner', n: 'Solitário', hp: 10, pick: 2, pairs: 'Parasita, Implacável, Habilidoso',
      d: 'Um Solitário pode trabalhar com outros vilões, mas não rende o máximo assim. Quando todos os companheiros caem, é a hora dele brilhar. O status vem do número de outros vilões aliados na cena.',
      status: [['Nenhum outro vilão', 'd10'], ['1 a 2 outros vilões', 'd8'], ['3 ou mais outros vilões', 'd6']],
      ab: [
        A('Comportamento Antissocial', 'A', 'Atrapalhe vários alvos usando [poder/qualidade]. Recupere Vida igual ao número de alvos Atrapalhados assim.'),
        A('Melhor Sozinho', 'A', 'Ataque usando [poder] e o dado Máx. Recupere Vida igual aos dados Médio+Mín.'),
        A('Antes Eles que Eu', 'R', 'Quando um aliado que não seja lacaio for derrotado nesta cena, role só o seu dado de [qualidade] como Fortalecer em si mesmo.'),
        A('Força Singular', 'I', 'Enquanto não tiver aliados próximos na cena, aumente em 1 todo o dano que causa e reduza em 1 todo o dano que sofre.'),
        A('Desbastar o Rebanho', 'A', 'Ataque vários alvos usando [poder]. Atrapalhe cada alvo com o dado Máx.'),
        A('Resposta ao Pior Caso', 'R', 'Quando fosse ser Atrapalhado, ou quando um Ataque o reduziria a 0 de Vida, reduza a penalidade para −1 ou reduza o dano para 1.')
      ] },
    { id: 'overlord', n: 'Senhor da Horda', hp: 15, pick: 3, pairs: 'Criador (escolha com cuidado para não repetir habilidades), Mente Mestra, Tático',
      d: 'O Senhor da Horda depende do número de forças (grupos de lacaios e tenentes) sob seu comando na mesma cena. Conte os lacaios e tenentes leais a ele na cena.',
      status: [['9 ou mais lacaios', 'd12'], ['5 a 8 lacaios', 'd10'], ['3 a 4 lacaios', 'd8'], ['1 a 2 lacaios', 'd6'], ['Nenhum lacaio', 'd4']],
      ab: [
        A('Sob o Meu Comando', 'A', 'Fortaleça usando [qualidade] todos os seus lacaios até o início do seu próximo turno.'),
        A('Voltem Para Lá!', 'R', 'Role de novo quantos salvamentos de lacaios quiser contra o mesmo Ataque.'),
        A('Deem-me Sua Força', 'A', 'Role todos os dados dos seus lacaios e some os resultados para Fortalecer. Ataque usando [poder] e use esse bônus.'),
        A('“Cuidado, Chefe!”', 'R', 'Redirecione um Ataque para um dos seus lacaios.'),
        A('Mobilização Rápida', 'A', 'Use [qualidade] para criar uma quantidade de lacaios igual ao valor do seu dado Máx. O dado inicial desses lacaios é do tamanho do seu dado Mín.'),
        A('Formar Fileiras', 'A', 'Ataque usando [poder] e o dado Máx. Defenda-se de todos os Ataques contra você até o início do seu próximo turno usando o número dos seus lacaios.')
      ] },
    { id: 'predator', n: 'Predador', hp: 15, pick: 2, pairs: 'Parasita, Implacável, Especialista',
      d: 'Mestres de armadilhas, emboscadas e assassinatos, os predadores perseguem os oponentes e tentam enfrentá-los um a um. O status vem do número de campeões engajados com eles.',
      status: [['0 a 1 oponente engajado', 'd10'], ['2 a 3 oponentes engajados', 'd8'], ['4 ou mais oponentes engajados', 'd6']],
      ab: [
        A('Armadilha Surpresa', 'R', 'Quando for Atacado, role seu dado de status único. Atrapalhe o Ataque com esse resultado e cause ao atacante dano igual a essa penalidade.'),
        A('Terreno Perigoso', 'A', 'Atrapalhe vários alvos usando [poder] e o dado Máx. Ataque qualquer alvo que ganhe uma penalidade assim e que já tinha uma penalidade sua, usando Médio+Mín.'),
        A('Caçador Oculto', 'I', 'Dobre os bônus ou penalidades que quiser envolvidos em agir contra um alvo que não sabe da sua presença ou se distraiu e esqueceu que você ainda está por perto.'),
        A('Caçar o Fraco', 'A', 'Ataque usando [qualidade] e o dado Máx. Se o alvo tiver uma penalidade criada por você ou estiver na Zona Vermelha, use Máx+Médio.'),
        A('Aproximação Furtiva', 'A', 'Fortaleça a si mesmo usando [qualidade] e o dado Máx. Esse bônus é persistente e exclusivo. Defenda-se de todos os Ataques com o dado Médio até o início do seu próximo turno.'),
        A('Seguir Minha Presa', 'A', 'Atrapalhe usando [poder] e o dado Máx. Essa penalidade dura até o seu próximo turno e, enquanto durar, esse campeão não pode usar reações nem se beneficiar de ações de Defender.')
      ] },
    { id: 'squad', n: 'Esquadrão', hp: 5, pick: 2, pairs: 'Valentão, Focado, Especialista',
      d: 'Um vilão de Esquadrão rende mais em equipe: não é poderoso o bastante para liderar lacaios nem quer trabalhar sozinho, e brilha numa aliança. O status vem do número de vilões na cena.',
      status: [['Nenhum outro vilão', 'd6'], ['1 a 2 outros vilões', 'd8'], ['3 ou mais outros vilões', 'd10']],
      ab: [
        A('Na Minha Marca', 'A', 'Um aliado faz agora uma ação básica, usando o dado Máx. Ele rola de novo todos os 1 dessa ação.'),
        A('Meus Aliados São Minha Força', 'I', 'Aumente o dano que causa pelo número de aliados próximos que não sejam lacaios.'),
        A('Aproveitar a Vantagem', 'A', 'Ataque usando [qualidade] e o dado Máx. Se escolher esse alvo para jogar em seguida, ele deve Atacar você no turno dele, se puder.'),
        A('Proteger os Meus Aliados', 'R', 'Quando outro vilão for Atacado, Defenda contra o Ataque rolando só o seu dado de status. Fortaleça a si mesmo com o dano reduzido.'),
        A('Mantenham a Formação!', 'A', 'Fortaleça usando [qualidade]. Fortaleça outro alvo usando o dado Máx e use o dado Mín para Defender contra todos os Ataques contra você até o seu próximo turno.'),
        A('Ir na Frente', 'A', 'Ataque usando [qualidade] e o dado Máx. Defenda todos os aliados próximos com os dados Médio+Mín até o início do seu próximo turno.')
      ] },
    { id: 'titan', n: 'Titã', hp: 30, pick: 3, pairs: 'Ancestral, Sobrepoderoso',
      d: 'Titãs são ENORMES. O tamanho os torna difíceis de enfrentar e exige medidas extraordinárias. O Titã começa com status d12 e tem um desafio em duas partes para reduzir o status.',
      status: [['Começa em', 'd12']], challenge: ['Duas caixas: exponha uma parte vulnerável do Titã e reduza o status dele em um tamanho de dado.', 'Uma caixa: aproveite a fraqueza exposta e reduza o status do Titã em mais um tamanho de dado.'],
      ab: [
        A('Esmagar Tudo por Baixo', 'A', 'Ataque vários alvos usando [poder]. Atrapalhe esses alvos com o dado Mín.'),
        A('Goela Abaixo', 'A', 'Ataque usando [poder] e o dado Máx. O alvo pode ser Atrapalhado pelos dados Máx+Médio+Mín, ou ficar impedido de fazer qualquer coisa além de um Superar para tentar escapar.'),
        A('Insetos Tolos', 'R', 'Quando um campeão sofrer uma reviravolta menor no desafio do Titã, além da reviravolta escolhida, role também o seu status e cause esse dano a esse campeão.'),
        A('Vocês São Mosquitos para Mim', 'I', 'Reduza o dano que sofre em 6 (se o seu status for d12), 4 (se for d10) ou 2 (se for d8 ou menor).'),
        A('Não Serei Derrotado Tão Fácil', 'R', 'Quando for Atacado por uma rolagem com dados iguais, remova um dos sucessos do desafio do Titã.'),
        A('A Terra Treme Sob os Pés', 'A', 'Ative uma das reviravoltas do ambiente na zona atual.')
      ] }
  ];

  const upgrades = [
    { id: 'mook', n: 'Esquadrão de capangas', hp: 0, when: 'Um grupo de lacaios característicos, num fluxo sem fim a serviço do vilão. Útil no covil.', ab: [A('Alerta!', 'A', 'Reponha o seu esquadrão de lacaios até o número de campeões.')], note: 'Escolha o grupo de lacaios que aparece na cena com o vilão.' },
    { id: 'hardier', n: 'Lacaios reforçados', hp: 5, when: 'Capangas conhecidos por serem mortais ou resistentes: o vilão pode melhorá-los quando precisar.', ab: [A('Fortalecer Lacaios', 'A', 'Escolha um grupo de lacaios na cena. Suba todos os dados deles em um tamanho (máximo d12).')] },
    { id: 'group', n: 'Lutador de grupo', hp: 20, when: 'Equipado com uma melhoria para enfrentar vários campeões.', ab: [A('Ataque Extra', 'I', 'Quando fizer uma ação que permita um Ataque, faça também um Ataque usando o dado Médio.')] },
    { id: 'vehicle', n: 'Veículo vilanesco', hp: 15, when: 'Uma máquina de guerra autônoma. Monte um tenente (com quatro, três ou duas habilidades conforme o número de campeões) e escolha entre estas habilidades.',
      ab: [A('Ataque à Distância', 'I', 'Para atacar este veículo, o campeão precisa fazer um Superar para chegar perto o bastante.'), A('Reforçado', 'I', 'Ao rolar um salvamento de dano, some 2 ao resultado.'), A('Plano de Fuga', 'R', 'Quando o vilão for Atacado, role o dado do veículo. Se tirar mais que a Vida atual do vilão, o vilão e o veículo escapam da cena.'), A('Bombardear', 'A', 'Ataque todos os campeões com a rolagem do veículo. Só pode usar se o veículo estiver abaixo do dado inicial ou a cena estiver na Zona Vermelha.'), A('Reforço de Lacaios', 'A', 'Adicione a um grupo de lacaios existente uma quantidade igual à metade (arredondada para baixo) do tamanho atual do dado do veículo. Esses lacaios têm o maior tamanho de dado já presente no grupo. Se o veículo tiver bônus ou penalidade, ajuste a quantidade por esse valor e remova a modificação.'), A('Confiável', 'I', 'Quando o veículo fizer uma [ação básica] no turno dele, role duas vezes e use o melhor resultado.'), A('Recuperação', 'A', 'Role o dado do veículo. O vilão Recupera essa quantidade de Vida.')] },
    { id: 'power', n: 'Aprimoramento de poder', hp: 20, when: 'O vilão usou um processo, ritual ou aparelho para aumentar seus poderes: todos os dados de poder sobem um tamanho. Se um poder passaria de d12, em vez disso adicione outra habilidade do arquétipo.', ab: [] },
    { id: 'quality', n: 'Aprimoramento de qualidade', hp: 20, when: 'Treino especial que lhe dá uma vantagem distinta e novas perícias: todos os dados de qualidade sobem um tamanho, menos a qualidade de interpretação. Se uma qualidade passaria de d12, em vez disso adicione outra habilidade da abordagem.', ab: [] },
    { id: 'shield', n: 'Escudo de defesa', hp: 0, when: 'Imune a dano enquanto a fonte do escudo estiver intacta.', ab: [A('Escudo de Defesa', 'I', 'Você não sofre dano de ninguém além de você mesmo até o escudo de defesa ser destruído. O escudo tem 40 de Vida, ou pode ser desativado com três sucessos em Superar. Se um campeão sofrer uma reviravolta menor ao mexer no escudo, você pode fazer um Ataque como reação rolando só o seu dado de [poder].'), A('Restabelecer o Escudo', 'A', 'Supere usando [poder] e o dado Máx. Se passar, remova um sucesso do desafio de desativação. Ou, em vez de Superar, use o dado Máx para Recuperar essa quantidade de Vida do escudo. Não pode usar se o escudo tiver sido removido por completo.')] },
    { id: 'calming', n: 'Aura calmante', hp: 10, when: 'Um jeito de passar despercebido ou deixar os campeões menos alertas.', ab: [A('Aura Calmante', 'I', 'Os campeões agem como se estivessem na Zona Verde quanto ao dado de status, ao acesso a habilidades e a todas as habilidades. Eles podem remover esta habilidade com três sucessos em Superar. Se um campeão sofrer uma reviravolta menor, você pode usar uma reação para Atrapalhá-lo rolando só o seu dado de [poder].')] },
    { id: 'dampen', n: 'Campo anulador de poderes', hp: 10, when: 'Reduz os poderes dos campeões e preserva os do vilão.', ab: [A('Campo Anulador de Poderes', 'I', 'Com a cena na Zona Verde, os dados de poder dos campeões em d8 ou mais caem um tamanho. Na Amarela, os de d10 ou mais caem dois tamanhos. Na Vermelha, todos os dados de poder dos campeões valem como d4. Eles podem remover esta habilidade com três sucessos em Superar. Se um campeão sofrer uma reviravolta menor, ele perde o acesso a um poder por completo até removerem a habilidade.')] },
    { id: 'brain', n: 'Zona de lavagem cerebral', hp: 10, when: 'Um jeito de alterar a consciência dos campeões para fins nefastos.', ab: [A('Zona de Lavagem Cerebral', 'I', 'Com a cena na Zona Verde, os dados de qualidade dos campeões em d8 ou mais caem um tamanho. Na Amarela, os de d10 ou mais caem dois tamanhos. Na Vermelha, todos os dados de qualidade dos campeões valem como d4. Eles podem remover esta habilidade com três sucessos em Superar. Se um campeão sofrer uma reviravolta menor, ele perde o acesso a uma qualidade por completo até removerem a habilidade. Se um campeão for nocauteado com a habilidade ativa, você pode criar um lacaio usando o maior dado de poder dele, representando a versão controlada do campeão.')] }
  ];

  const masteries = [
    { n: 'Maestria da Aniquilação', cond: 'Pode causar destruição em massa, sem se importar com as vítimas.', x: 'Se puder causar destruição em massa sem se importar com as vítimas, passa automaticamente em um Superar que uma demonstração de força esmagadora possa resolver.', ex: 'O General Veyra derruba a muralha de uma cidade de fronteira com artilharia pesada. Não há teste: a muralha cai.' },
    { n: 'Maestria dos Bastidores', cond: 'Não está diretamente na briga e age por meios indiretos.', x: 'Enquanto não estiver diretamente na briga e usar a sua influência de forma indireta, passa automaticamente em um Superar para manipular uma situação.', ex: 'A Dra. Kaelor, longe da rua, manipula o conselho de Piltover com cartas anônimas e doações. Os conselheiros fazem o que ela quer.' },
    { n: 'Maestria da Conquista', cond: 'Está no comando das próprias forças.', x: 'Enquanto estiver no comando das próprias forças, passa automaticamente em um Superar que envolva tomar uma área ou capturar civis.', ex: 'Cercado pelos seus soldados, um senhor da guerra toma uma vila e prende os moradores numa noite.' },
    { n: 'Maestria da Ordem Forçada', cond: 'Tem controle total do entorno imediato.', x: 'Se tiver controle total do entorno imediato, passa automaticamente em um Superar para organizar a ralé e cumprir uma tarefa.', ex: 'Dentro do próprio forte, um tirano põe prisioneiros e guardas para erguer uma barricada em poucas horas, sem ninguém desobedecer.' },
    { n: 'Maestria da Ciência Louca', cond: 'Tem acesso a materiais e equipamentos.', x: 'Enquanto tiver acesso a materiais, passa automaticamente em um Superar usando princípios científicos e invenções.', ex: 'No laboratório de Zaun, a Dra. Kaelor improvisa um antídoto, ou uma arma, do que há nas prateleiras. Funciona.' },
    { n: 'Maestria do Mercenário', cond: 'Tem um contrato para uma tarefa específica.', x: 'Se tiver recebido um contrato para uma tarefa específica, passa automaticamente em um Superar numa situação em que a diferença é receber ou não o pagamento.', ex: 'Contratado para tirar uma carga do porto, o Capitão Dorrick sempre acha um jeito de entregar, porque ser pago depende disso.' },
    { n: 'Maestria do Misticismo', cond: 'Tem os materiais certos para o ritual.', x: 'Se tiver acesso aos materiais certos, passa automaticamente em um Superar numa situação que envolva canalizar forças mágicas.', ex: 'Com as cinzas de um relicário nas mãos, Mareya abre um portal nas Ilhas das Sombras sem erro.' },
    { n: 'Maestria da Lucratividade', cond: 'Tem acesso a muita riqueza e recursos.', x: 'Se tiver acesso a muita riqueza e outros recursos, passa automaticamente em um Superar para usá-los e ficar ainda mais rico, não importa quem pague a conta.', ex: 'Um barão do contrabando compra a guarda do porto e dobra a fortuna com a mesma carga, sem rolar.' },
    { n: 'Maestria da Superioridade', cond: 'Usa um poder que tenha em d12.', x: 'Enquanto manifestar efeitos de um poder que tenha em d12, passa automaticamente em um Superar que envolva o uso desses poderes.', ex: 'Karzul, o Colosso de Areia, tem Força d12: arromba qualquer porta de pedra sem teste.' },
    { n: 'Maestria do Caos Total', cond: 'Tudo está fora de controle.', x: 'Numa situação em que tudo foge ao controle, passa automaticamente em um Superar para cumprir uma tarefa jogando as regras fora.', ex: 'No meio de um motim no porto, o vilão faz uma proeza impossível na base da sorte e da loucura e sai ileso.' },
    { n: 'Maestria do Inconcebível', cond: 'Está numa situação com forças sombrias e perturbadoras.', x: 'Numa situação que envolva forças sombrias e perturbadoras, passa automaticamente em um Superar para cumprir a vontade de um ser além da compreensão humana.', ex: 'Ykara, a Voz do Abismo, cumpre o desejo de algo que mora do outro lado de uma fenda do Vazio: o pedido é atendido.' }
  ];

  return { approaches, archetypes, upgrades, masteries };
})();
