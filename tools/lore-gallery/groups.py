# Groups (factions, orders, families, bands) for the Lore page's region galleries.
# Each group: site region, id, Portuguese name and description, and how cards join it:
#   champs  - champion names (English). Cards of Legends of Runeterra and League of Legends splash arts of
#             champions without a LoR card both join the group through this list (LoR art always wins).
#   match   - regex over the card's English name
#   flavor  - regex over the card's English flavour text (optional, weaker hint)
#   uni     - titles of League Universe gallery pictures that belong here
# A card joins the first group that matches it; anything left in a region goes to its "Outros" bucket.

GROUPS = [
    # ---------------------------------------------------------------- Demacia
    dict(region='demacia', id='vanguard', name='Vanguarda Destemida',
         desc='A elite do exército demaciano, liderada por Garen. Soldados escolhidos a dedo que marcham na frente de cada batalha.',
         champs=['Garen', 'Xin Zhao'], match=r'Vanguard|Dauntless|Bannerman|Scrutinizing Sergeant',
         uni=['Guarda de Elite de Demacia', 'Elite Militar', 'Linha Guerreira e Guarda do Palácio', 'Armas Demacianas', 'Aço de Demacia', 'Equipamentos']),
    dict(region='demacia', id='crown', name='A Coroa e a Casa Lightshield',
         desc='A família real de Demacia. O rei Jarvan III morreu, e a sucessão do jovem Jarvan IV ainda divide as casas nobres.',
         champs=['Jarvan IV'], match=r'Jarvan|Honored Lord|Dawnspeakers', uni=['Príncipe Jarvan IV']),
    dict(region='demacia', id='durand', name='Escultores Durand',
         desc='Herdeiros do escultor que criou Galio. Moldam a petricita que protege Demacia da magia.',
         champs=['Galio'], match=r'Durand|Petricite (?!Hound|Stag|Charger|Broadwing)'),
    dict(region='demacia', id='mageseekers', name='Caça-Magos e os magos perseguidos',
         desc='A ordem que persegue, prende e "protege" os magos de Demacia, odiada por quem tem magia no sangue. Do outro lado estão os perseguidos: Sylas, que escapou da prisão e lidera a rebelião dos magos, e Morgana, nascida em Demacia e marcada pela magia.',
         champs=['Sylas', 'Morgana'], match=r'Mageseeker|Stony Suppressor|Penitent'),
    dict(region='demacia', id='rangers', name='Patrulheiros e Asa-Prateada',
         desc='Batedores e cavaleiros de rapina que vigiam as fronteiras. Quinn e sua águia Valor são os mais famosos.',
         champs=['Quinn'], match=r'Ranger|Silverwing|Swiftwing|Fleetfeather|Tracker|Valor|Jarro', uni=['Cavaleiro de Rapina']),
    dict(region='demacia', id='dragonguard', name='Guarda dos Dragões',
         desc='Os que servem ao lado de Shyvana e protegem (ou caçam) os dragões que ainda voam sobre Demacia.',
         champs=['Shyvana', 'Dragon Shyvana'], match=r'Dragonguard|Dragon Allegiant|Dragon Chow'),
    dict(region='demacia', id='houses', name='Casas Nobres',
         desc='As casas que juraram lealdade à coroa. Os Crownguard guardam o trono (Garen e Lux, que esconde sua magia); os Laurent são duelistas de esgrima, hoje sob Fiora; e há Vayne, a caçadora de monstros, e Sona, virtuose do etwahl.',
         champs=['Lux', 'Lux: Illuminated', 'Vayne', 'Sona', 'Fiora'], match=r'Crownguard|Laurent'),
    # ---------------------------------------------------------------- Noxus
    dict(region='noxus', id='trifarian', name='Trifarix e a Legião Trifariana',
         desc='O núcleo político e militar de Noxus: o Trifarix reúne Força (Darius), Visão (Swain) e Astúcia (o Sem-Rosto), e a Legião é a elite disciplinada do exército.',
         champs=['Darius', 'Kled', 'Swain'], match=r'Trifarian|Legion(?! Deserter)|Iron Ballista|Battering Ram|Citybreaker|Imperial Demolitionist|Captain (Farron|Kalrix)',
         uni=['Os Bandos Guerreiros de Noxus', 'Força na Variedade', 'A Legião Trifariana', 'Armamento Noxiano', 'Armadura Noxiana', 'Machado de Darius', 'Artífices de Guerra']),
    dict(region='noxus', id='blackrose', name='A Rosa Negra',
         desc='Uma sociedade secreta de magos que manipula Noxus nas sombras há séculos, liderada por LeBlanc.',
         champs=['LeBlanc', 'Briar'], match=r'Black Rose|Rose|Runeweaver|Rune Squire|Arachnoid|String-Puller|Tactician|Incisive'),
    dict(region='noxus', id='floricorvus', name='Conservatório Floricorvus',
         desc='Academia fundada em segredo pela Rosa Negra. Annie ateou fogo à escola e fugiu; os alunos se dividem entre a Trifarix e a Rosa Negra.',
         champs=['Annie'], match=r'Tibbers|Floricorvus|Manasoul|Prefect|Headmistress|Spell Slinger'),
    dict(region='noxus', id='ironlegion', name='Legião de Ferro de Mordekaiser',
         desc='O exército de Mordekaiser, o tirano que voltou dos mortos, e Mitna Rachnun, o reino de almas aprisionadas que serve de fortaleza à Legião.',
         champs=['Mordekaiser'], match=r'Iron Legionary|Bladepierced|Iron Conquest|Deathgrasp|Shackled|Severed|Amalgamation|Deathwinder'),
    dict(region='noxus', id='crimson', name='Círculo Carmesim e a Legião Cinza',
         desc='Os hemomantes de Vladimir e a Legião Cinza da Senhora do Sangue, de mortos reerguidos, como Sion.',
         champs=['Vladimir', 'Sion', 'Sion Returned'], match=r'Crimson|Lady of Blood|Grave Physician|Rider|Reckoner|Warmonger|Lost Soul|Reborn Grenadier'),
    dict(region='noxus', id='arena', name='Arenas e gladiadores',
         desc='Nas arenas de Noxus, glória vale tanto quanto ouro. Draven é o astro; muitos lutam para sair da obscuridade.',
         champs=['Draven', 'Samira', 'Alistar'], match=r'Arena|Crowd|Draven|Reckoner|Gloryseeker|Dashing Dandy|Daring Demolisher|Shiraza|Kato'),
    dict(region='noxus', id='renegades', name='Desertores e mercenários',
         desc='Quem largou a Legião ou nunca entrou nela: mercenários, rebeldes e exilados como Riven e Rell, a fugitiva dos laboratórios da Rosa Negra.',
         champs=['Riven', 'Rell'], match=r'Deserter|Defector|Rebel|Mercenary'),
    dict(region='noxus', id='houses', name='Casas Nobres',
         desc='As famílias antigas de Noxus (Darkwill, Swain, Talis), os assassinos da Família Du Couteau, como Katarina, e os Medarda, que ascenderam com Ambessa.',
         champs=['Ambessa', 'Katarina', 'Cassiopeia', 'Talon'], match=r'^Lord (Mallat|Broadmane)|Noble|Elegant Edge'),
    # ---------------------------------------------------------------- Freljord
    dict(region='freljord', id='avarosan', name='Avarosanos',
         desc='A tribo de Ashe, que sonha unir o Freljord em paz. Arqueiros, guardas e caçadores das terras geladas.',
         champs=['Ashe', 'Tryndamere', 'Braum'], match=r'Avarosan|Hearthguard|Icevale Archer|Warden of the Tribes'),
    dict(region='freljord', id='winters-claw', name='Garra do Inverno',
         desc='A tribo guerreira de Sejuani. Saqueadores que acreditam que só os fortes merecem viver.',
         champs=['Sejuani', 'Olaf'], match=r'Scar|Unscarred|Raider|Reaver|Wolfrider|Tuskraider|Ruthless',
         uni=['SAQUEADORES E RAPINADORES', 'ASSENTAMENTOS SAZONAIS', 'TOME O QUE PRECISAR', 'MONTADORES DE FERAS', 'CAÇANDO NAS PROFUNDEZAS', 'UMA TRIBO EM MARCHA']),
    dict(region='freljord', id='frostguard', name='Guarda Gélida e os Observadores',
         desc='Lissandra e seus seguidores guardam o Abismo Uivante. Em segredo, servem às entidades antigas presas sob o gelo.',
         champs=['Lissandra'], match=r'Frostguard|Thrall|Draklorn|Ice Pillar|Watcher|It That Stares|Icevale Cultist|Harbinger',
         uni=['O domínio da Bruxa Gélida', 'Os Draklorn', 'Contendo a escuridão', 'Olhos no Abismo', 'Pedras Mortis']),
    dict(region='freljord', id='ursine', name='Ursine (seguidores de Volibear)',
         desc='Guerreiros ursinos devotos do semideus da tempestade. Selvagens, livres e ferozes.',
         champs=['Volibear'], match=r'Ursine|Stormclaw|Thundersong|Sigil of the Storm'),
    dict(region='freljord', id='hearthblood', name='Ferreiros de Ornn',
         desc='Os que honram Ornn, o semideus da forja: ferreiros, artesãos e os fogos-vivos do Freljord.',
         champs=['Ornn'], match=r'Weaponsmith|Blacksmith|Artisan|Hearthblood|Ember Maiden|Flamecaller|Wrought'),
    dict(region='freljord', id='old-gods', name='Os Deuses Antigos e seus profetas',
         desc='Semideuses como Anivia, Volibear e Ornn, e os xamãs que ainda falam com eles e com os espíritos.',
         champs=['Anivia', 'Eggnivia', 'Udyr'], match=r'Old Ones|Valhir|Augur|Spiritwalker|Shaman|Seer|Scryer|Allseer|Spirit of the Ram|Wyrding|They Who Endure|She Who Wanders|Tusk Speaker'),
    dict(region='freljord', id='trolls', name='Trolls do Gelo',
         desc='Tribos de trolls reunidas em torno do Rei Trundle e de seu porrete de Gelo Verdadeiro.',
         champs=['Trundle'], match=r'Troll'),
    dict(region='freljord', id='wanderers-fr', name='Sem tribo: andarilhos do gelo',
         desc='Quem vive no Freljord sem jurar a nenhuma tribo: Gnar, o yordle que passou milênios congelado em Gelo Verdadeiro, Gragas, o cervejeiro, o menino Nunu e seu amigo yeti Willump, e Aurora, a vastaya que anda entre o mundo material e o espiritual.',
         champs=['Gnar', 'Mega Gnar', 'Gragas', 'Nunu & Willump', 'Aurora']),

    # ---------------------------------------------------------------- Ionia
    dict(region='ionia', id='kinkou', name='Ordem Kinkou',
         desc='Monges-ninjas que guardam o equilíbrio entre o reino espiritual e o mundo físico. Evitam extremos e se opõem à corrupção.',
         champs=['Shen', 'Kennen', 'Akali', 'Yunara'], match=r'Kinkou', uni=['Os Kinkou']),
    dict(region='ionia', id='shadow', name='Ordem das Sombras',
         desc='Fundada por Zed, um ex-Kinkou. Acreditam que o pacifismo enfraqueceu Ionia e usam magia sombria e assassinato para defendê-la.',
         champs=['Zed'], match=r'^Shadow(?!tech)|Shadowblade|Shadowseer|Living Shadow|Ren Shadowblade|Shadow Assassin|The Shadow Assassin'),
    dict(region='ionia', id='navori', name='Irmandade Navori',
         desc='Rebeldes e foras-da-lei da província de Navori. Lutaram contra Noxus; hoje nem sempre se sabe de que lado estão.',
         match=r'Navori|Coastal Defender', uni=['O Placídio de Navori', 'A Grande Resistência']),
    dict(region='ionia', id='dancers', name='Dançarinos do Placídio',
         desc='Os bailarinos e músicos do Placídio, o coração sagrado de Navori: Irelia, que luta como quem dança com suas lâminas, e quem faz da música e da dança uma forma de resistir.',
         champs=['Irelia'], match=r'Ribbon Dancer|Field Musicians|Zinneia'),
    dict(region='ionia', id='monks', name='Mestres e monastérios',
         desc='Monges, mestres de artes marciais e sábios espirituais, como Lee Sin, Master Yi e Karma, e os Seguidores do Dragão, guerreiros que tomam nomes das partes de um dragão (olho, garras, escamas, cauda) e evocam sua força.',
         champs=['Lee Sin', 'Master Yi', 'Karma', 'Wukong'], match=r'Wuju|Monk|Disciple|Student|Mentor|Bingwen|Hirana|Doran|Jun, the Prodigy|Keeper of Masks|of the Dragon|Dragoncaller',
         uni=['Os Grandes Monastérios']),
    dict(region='ionia', id='wanderers', name='Espadachins errantes',
         desc='Lâminas sem mestre que vagam com o vento, como os irmãos Yasuo e Yone.',
         champs=['Yasuo', 'Yone'], match=r'Yone|Windchaser|Windsinger|Windfarer|Blossoming Blade|Blade$|Zephyr'),
    dict(region='ionia', id='pit', name='O Fosso de Sett',
         desc='Lutas clandestinas, apostas e seguranças: o submundo que Sett, meio-vastaya, comanda com os punhos.',
         champs=['Sett'], match=r'Pit|Bout|Accountant|Mixologist|Stagehand'),
    dict(region='ionia', id='vastaya', name='Vastaya de Ionia',
         desc='Os povos-fera que vivem nas florestas e penhascos de Ionia, como Ahri e as tribos de Lhotlan.',
         champs=['Ahri', 'Xayah', 'Rakan'], match=r'Vastayan|Tail-Cloak|Sai\'nen|Yusari|Airis', uni=['Vastaya']),
    dict(region='ionia', id='artists', name='Artistas e visionários',
         desc='Pintores, músicos e atores de Ionia: Hwei, o pintor herdeiro do Templo de Koyehn, e Jhin, o assassino que faz da morte uma obra de arte.',
         champs=['Hwei', 'Jhin']),
    dict(region='ionia', id='spirits', name='Guardiões da natureza e do mundo espiritual',
         desc='Quem cuida das florestas e conversa com os espíritos: Ivern, o Pai Verde, e Lillia, a corça feérica e tímida que procura os sonhos não realizados.',
         champs=['Ivern', 'Lillia']),

    # ---------------------------------------------------------------- Bilgewater
    dict(region='bilgewater', id='buhru', name='Os Buhru (fé de Nagacáburos)',
         desc='O povo das Ilhas das Serpentes, devoto da Mãe Serpente. Illaoi é sua sacerdotisa mais forte.',
         champs=['Illaoi'], match=r'Buhru|Nagakabouros|Tentacle|Dedicant|Idol|Avatar of the Tides|Sea\'s Voice',
         uni=['Templo Buhru', 'As Ilhas das Serpentes', 'Nagacáburos']),
    dict(region='bilgewater', id='pirates', name='Piratas e Tripulações',
         desc='As tripulações que fizeram a fama de Águas de Sentina. Gangplank foi o rei de todas elas.',
         champs=['Gangplank'], match=r'Buccaneer|Corsair|Deckhand|Powder|Plunder|Dreadway|Cutthroat|Petty Officer|Shelly|Helmsman|Lookout|Crusty|Babs|Navigator',
         uni=['Capitães e Tripulação', 'Canhões']),
    dict(region='bilgewater', id='bounty', name='Caçadores de recompensa e pistoleiros',
         desc='Gente que vive de cartazes de "procurado". Miss Fortune é a mais temida.',
         champs=['Miss Fortune'], match=r'Hired Gun|Sheriff|Bounty|Shellshocker|Five-Punch', uni=['Quadro de Recompensas', 'Bacamarte da Miss Fortune', 'Armas']),
    dict(region='bilgewater', id='hunters', name='Caçadores de monstros e açougueiros',
         desc='Os que caçam monstros marinhos e retalham as presas nas Docas da Matança. Pyke era um deles. Também aqui está o grupo de Nilah, que veio de Kathkan, uma terra desconhecida, para desafiar criaturas lendárias.',
         champs=['Pyke'], match=r'Jaull Hunters|Hunting Fleet|Razorscale Hunter|Butcher|Taskmaster|Harpoon|Dreg',
         uni=['Arpoeiros', 'Mestra do Arpão', 'Invocadores de Serpentes', 'Galpões de Matança', 'Baías de Entalhadura', 'Ossos do ofício']),
    dict(region='bilgewater', id='marine', name='Vida Marinha',
         desc='Quem vive do mar e dentro dele: marinheiros, aventureiros das ondas e criaturas simpáticas (ou nem tanto), como Fizz, o trapaceiro das marés, e Nautilus, o Titã das Profundezas.',
         champs=[]),
    dict(region='bilgewater', id='underworld', name='O Submundo Sentinense',
         desc='Apostas, contrabando e lutas clandestinas. Jack, o Rei do Crime, comanda o submundo de Águas de Sentina e as arenas onde se aposta em campeões do fosso. Twisted Fate faz fortuna e inimigos em cada mesa, e Tahm Kench cobra o preço de tudo.',
         champs=['Twisted Fate', 'Graves'], match=r'Gambler|Croupier|Pool Shark|Slotbot|Black Market|Swindler|Pocket Picker|Magician|Perfidious|Grifter'),

    # ---------------------------------------------------------------- Shadow Isles
    dict(region='shadow-isles', id='sentinels', name='Sentinelas da Luz',
         desc='Uma antiga ordem que combate a Névoa Negra e os mortos. Senna, Lucian e Akshan levam sua luz pelo mundo.',
         champs=['Senna', 'Senna, Sentinel of Light', 'Lucian', 'Akshan'], match=r'Sentinel|Rekindler|Redeemed'),
    dict(region='shadow-isles', id='spider', name='Culto da Aranha',
         desc='Elise e seus devotos, que oferecem vidas a Vilemaw, a aranha gigante das Ilhas.',
         champs=['Elise', 'Spider Queen Elise'], match=r'Vilemaw|Cultist|Keeper of the Box'),
    dict(region='shadow-isles', id='helia', name='Os Heliatas',
         desc='Os sábios, escrivães e guardiões de Hélia, a cidade das Ilhas Abençoadas antes da Ruína, e os que sobreviveram a ela: Yorick, o pastor de almas, Gwen, a costureira, Maokai, o treant, e Thresh, o carcereiro que coleciona almas numa lanterna, junto de quem ele guia ou caça.',
         champs=['Yorick', 'Gwen', 'Maokai', 'Thresh'], match=r'Scribe|Chronicler|Archivist|Prodigy|Keeper|Islander|Catalogue|Soul Shepherd|Warden',
         uni=['Escrivão Eterno', 'Cidadãos das Ilhas das Bênçãos']),
    # ---------------------------------------------------------------- Targon
    dict(region='targon', id='solari', name='Os Solari',
         desc='A fé do Sol, guardada por sacerdotes e guerreiros Ra\'Horak. Leona é o Aspecto do Sol.',
         champs=['Leona'], match=r'Solari|Sun|Daylight|Rahvun|Dawn',
         uni=['OS SOLARI', 'TEMPLO DO SOLSTÍCIO', 'SANTUÁRIO DE ORAÇÕES DOS SOLARI', 'ASTROLÁBIO DOURADO', 'ARMAS DOS RA’HORAK']),
    dict(region='targon', id='lunari', name='Os Lunari',
         desc='Os devotos da Lua, perseguidos pelos Solari como hereges. Diana e Aphelios lutam por eles.',
         champs=['Diana', 'Aphelios'], match=r'Lunari|Moon|Crescent|Dusk|Twilit|Eclipse',
         uni=['OS LUNARI', 'ESPERANÇA NO FUTURO', 'ARMAS PROIBIDAS']),
    dict(region='targon', id='aspects', name='Aspectos e Celestiais',
         desc='Mortais que escalaram a montanha e receberam um ser celestial, como Pantheon e Taric, e os próprios Celestiais.',
         champs=['Pantheon', 'Taric', 'Zoe', 'Soraka', 'Aurelion Sol'], match=r'Aspect|Mihira|Celestial|Herald|Star Shepherd|Esmus|Iula|Arbiter'),
    dict(region='targon', id='rakkor', name='Os Rakkor e os peregrinos',
         desc='As tribos que vivem nas encostas do Monte Targon, e os alpinistas que tentam chegar ao topo.',
         match=r'Mountain|Sojourner|Pilgrim|Climber|Scholar|Stargazer|Scryer|Rumul|Mystic|Saga Seeker|Lawkeeper|Divine Clerk',
         uni=['CASA DOS RAKKOR', 'EM TORNO DA MONTANHA', 'OS RAKKOR', 'A VIDA ENTRE AS TRIBOS', 'OS GUERREIROS', 'TALHADO NA MONTANHA', 'VIDA DE PEREGRINO', 'EQUIPAMENTO DE ESCALADA', 'ITENS RELIGIOSOS', 'ARRANJO DO ZÊNITE', 'A DESPEDIDA', 'UMA JORNADA AO PICO DA MONTANHA', 'PADRÕES DOS MORTOS']),

    dict(region='targon', id='marai', name='Os Marai',
         desc='Vastaya de Ionia que, séculos atrás, seguiram até a costa do Monte Targon e construíram uma vila escondida sob um recife de coral. Dependem das pedras da lua para afastar os predadores das profundezas. Nami vem desse povo.',
         champs=['Nami'], match=r'Marai|Abyssal Guard|Sandhopper|Avatar of the Tides'),
    # ---------------------------------------------------------------- Shurima
    dict(region='shurima', id='empire', name='O Império e os Ascendidos',
         desc='Azir voltou e quer reconstruir o império. Ao seu lado e contra ele, os Ascendidos: Nasus, Renekton, Xerath.',
         champs=['Azir', 'Nasus', 'Renekton', 'Xerath', 'Rammus'], match=r'Emperor|Sand Soldier|Golden|Sun Disc|Defenders|Devout|Hierophant|Council|Herald of the Magus|Reconstructor|Ascend|Dunekeeper|Sandcrafter|General of the Dunes|Inspiring Marshal|Priestess'),
    dict(region='shurima', id='darkin', name='Darkin e seus servos',
         desc='As armas vivas da guerra antiga e os cultistas que as libertam. Onde passam, deixam ruínas.',
         champs=['Naafiri'], match=r'Baccai|Darkin|Xolaani|Acolyte|Altar of Blood|Ruinous'),
    dict(region='shurima', id='mercs', name='Mercenários e caçadores de tesouros',
         desc='Gente que vive das ruínas e dos contratos do deserto. Sivir é a mercenária mais cara de Shurima.',
         champs=['Sivir'], match=r'Vekauran|Treasure|Tomb-Raider|Ruin Runner|Profiteer|Acquisitioner|Poacher|Tycoon|Raz Bloodmane|Marauder|Bonecrusher|Merciless'),
    dict(region='shurima', id='nomads', name='Nômades, saqueadores e catadores',
         desc='Os que sobrevivem no deserto: tribos nômades, salteadores, catadores e os montadores de dormuns.',
         match=r'Nomad|Scout|Desert Naturalist|Rockbear Shepherd|Soothsayer|Sandseer',
         uni=['Saqueadores', 'Os Shakkal', 'Montadores de Dormuns', 'Catadores', 'No Topo dos Dormuns', 'Os Perdidos', 'Habitantes de classe alta da cidade', 'Habitantes de classe baixa da cidade']),
    dict(region='shurima', id='time', name='Os guardiões do tempo',
         desc='Zilean e os que estudam a magia do tempo, entre relógios, profecias e ruínas de Urtistan.',
         champs=['Zilean'], match=r'Clock|Chronomancer|Preservationist|Preservarium|Conservator'),
    dict(region='shurima', id='taliyah', name='Taliyah e as tecelãs de pedra',
         desc='A tecelã de pedras que deixou Noxus para proteger seu povo, e quem molda a terra do deserto.',
         champs=['Taliyah'], match=r'Stone|Sandstone|Rock'),
    # ---------------------------------------------------------------- Piltover
    dict(region='piltover', id='academy', name='Academia e inventores',
         desc='A Academia de Piltover reúne gênios, professores e aprendizes. Heimerdinger é o mais antigo deles.',
         champs=['Heimerdinger', 'Orianna'], match=r'Academy|Academic|Professor|Prodigy|Archivist|Apprentice|Experimenter|Perfectionist|Mechanist|Funsmith|Acoustician|Adaptatron|Hextechnician',
         uni=['Oficina do Instituto Horológico', 'Oficinas', 'Vaido Violante']),
    dict(region='piltover', id='clans', name='Clãs mercantes',
         desc='As famílias ricas que governam Piltover pelo comércio: Ferros, Medarda, Kiramman e outras.',
         champs=['Mel', 'Camille'], match=r'Ferros|Medarda|Kiramman|Albus|Financier|Benefactor',
         uni=['Jago Medarda', 'Insígnias de Clãs de Mercadores', 'Riqueza e Status']),
    dict(region='piltover', id='wardens', name='Vigias e investigadores',
         desc='A guarda de Piltover. Caitlyn, a xerife, e Vi, que trocou as ruas de Zaun pelo distintivo.',
         champs=['Caitlyn', 'Vi'], match=r'Sheriff|Officer|Patrol|Warden|Investigator|Sting|Justice Rider|Plaza Guardian', uni=['Vigias', 'Calibre Hexlyene de Vishlaa']),
    dict(region='piltover', id='hextech', name='Hextec e progresso',
         desc='Jayce e os inventores do hextec, a fusão de magia e tecnologia que mudou a Cidade do Progresso.',
         champs=['Jayce'], match=r'Hextech|Hexcore|Forge|Gearhead|Mk\d|Assembly Bot|Ballistic Bot',
         uni=['Hexarco de Ekalavya', 'Manoplas de Atlas', 'Artifício de Piltover', 'Bateria em Cubo Hextec', 'Hextec', 'Veículo Anelar', 'Armas Hextec', 'Conduíte de tubos pneumáticos']),
    dict(region='piltover', id='explorers', name='Exploradores',
         desc='Aventureiros, navegadores e pilotos de balão. Ezreal é o explorador mais famoso (e mais imprudente).',
         champs=['Ezreal'], match=r'Aeronaut|Cartographer|Explorer|Adventurer|Skycruiser|Mariner|Dropboarder|Cloudwinder|Castaway|Travelers'),

    # ---------------------------------------------------------------- Zaun
    dict(region='zaun', id='chempunks', name='Quimiopunks e gangues',
         desc='As gangues das ruas de Zaun, entre explosivos, gás e roubos. Jinx é a mais caótica de todas.',
         champs=['Jinx'], match=r'Chempunk|Urchin|Bouncer|Pickpocket|Gang|Shady|Flashbomb|Caustic|Henchmen|Boom', uni=['Punks Químicos', 'Assassinos de Aluguel', 'Pivetes do Sumidouro']),
    dict(region='zaun', id='barons', name='Barões químicos',
         desc='Os chefões que controlam Zaun por trás das fábricas e do brilho: uma aliança frágil de conveniência. Renata Glasc é a baronesa mais nova, e Urgot, ex-carrasco noxiano libertado da mina-prisão Dredge, impõe sua sombra sobre o submundo.',
         champs=['Renata Glasc', 'Urgot'], match=r'Baron|Diva|Eminent|Mastermind|Corina',
         uni=['Baronesa Velveteen Lenare', 'Barões da Química', 'Barão Wencher Spindlow', 'Barão Saita Takeda', 'Barão Petrok Grime', 'Traficante de brilho']),
    dict(region='zaun', id='firelights', name='Fogos-Vivos e defensores do povo',
         desc='O bando de Ekko, que protege o povo de Zaun e luta contra quem o explora, e outros que defendem os desvalidos da cidade: Janna, o vento que ouve as preces de Zaun, e Zeri, a faísca do Sumidouro.',
         champs=['Ekko', 'Janna', 'Zeri'], match=r'Firelight|Dropboard'),
    dict(region='zaun', id='evolution', name='A Evolução Gloriosa',
         desc='Viktor e seus seguidores, que acreditam que a humanidade deve ser melhorada pela máquina.',
         champs=['Viktor', 'Blitzcrank'], match=r'Augment|Evolution|Clockling|Mechanized|Swapbot'),
    dict(region='zaun', id='sump', name='Trabalhadores do Sumidouro',
         desc='Mecânicos, catadores e encanadores dos níveis mais baixos e tóxicos da cidade.',
         champs=['Twitch'], match=r'Sump|Dredger|Chirean|Scavenger|Forge Worker|Scrap',
         uni=['Mecânico', 'Catador do Sumidouro', 'Respirador do Sumidouro com elmo de Cinza', 'Quimio-encanadores', 'Viginauta', 'Mensageiros do Calçadão', 'Residente do Calçadão', 'Pesquisador Quimtec', 'Mercador horticultor']),
    dict(region='zaun', id='experiments', name='Experimentos e monstros de Zaun',
         desc='O que sai dos laboratórios e do lixo químico da cidade: Singed, o alquimista, Warwick, transformado em monstro por experimentos dolorosos, Zac, nascido de um vazamento tóxico no Sumidouro, e o Dr. Mundo, o louco de Zaun.',
         champs=['Singed', 'Warwick', 'Zac', 'Dr. Mundo']),

    # ---------------------------------------------------------------- Bandle City
    dict(region='bandle', id='squads', name='Batedores e artilheiros',
         desc='Os yordles que protegem Bandópolis e saem para explorar: Teemo, Tristana e seus esquadrões.',
         champs=['Teemo', 'Tristana', 'Poppy'], match=r'Ranger|Gunner|Commando|Captain|Squire|Scout|Explorer|Newbie|Swole Scout|Grenadier|Cavalier'),
    dict(region='bandle', id='monks', name='Monges elementais',
         desc='Yordles que dominam o vento, o fogo e o trovão em monastérios escondidos. Kennen é um deles (e Kinkou).',
         match=r'Monk|Thunder Fist|Tornado|Masa|Rissu|Storm'),
    dict(region='bandle', id='inventors', name='Inventores e mechas',
         desc='Bombas, robôs e máquinas gigantes: Heimerdinger, Ziggs e Rumble não sabem parar quietos.',
         champs=['Ziggs', 'Rumble', 'Corki'], match=r'Mech|Chemist|Smith|Arsenal|Bomb|Blaster|Fix-Em|Inspector|Partsapalooza'),
    dict(region='bandle', id='gloom', name='Os sombrios',
         desc='Yordles que preferem a escuridão: Veigar, o mestre do mal (baixinho), e Vex, que acha tudo um saco.',
         champs=['Veigar', 'Vex', 'Grand Overseer Veigar'], match=r'Darkbulb|Gloom|Shadow|Evil|Imperfectionist'),
    dict(region='bandle', id='artists', name='Artistas e festeiros',
         desc='Músicos, pintores, contadores de histórias e organizadores de festa. Em Bandópolis, sempre há uma comemoração.',
         match=r'Painter|Balladeer|Tenor|Bass of Burden|Promoter|Mayor|Arena|Ava Achiever|Paparo|Tea Maker|Robemaker|Conchologist|Shark Trainer|Uncle'),
    dict(region='bandle', id='fae', name='Magia feérica de Bandópolis',
         desc='A magia que atravessa portais e sonhos: Lulu e seu companheiro feérico Pix, e Norra, a Mestra dos Portais e guardiã da biblioteca mais invejada de Bandópolis, com sua gata mágica Yuumi, que hoje guarda o Livro dos Limiares.',
         champs=['Lulu', 'Norra', 'Yuumi']),

    # ---------------------------------------------------------------- O Vazio
    dict(region='void', id='prophets', name='O culto e o profeta do Vazio',
         desc='Mortais que ouviram o chamado do Vazio e o seguem como profecia. Malzahar, o Profeta do Vazio, guia seus fiéis; o Arauto da Colmeia fala com quem escuta.',
         champs=['Malzahar'], match=r'Hive Herald|Belvethi Elder'),
    dict(region='void', id='touched', name='Tocados pelo Vazio',
         desc='Mortais que carregam o Vazio na própria carne, por escolha ou azar, e quem decidiu enfrentá-lo. Kai\'Sa, a Filha do Vazio, divide o corpo com uma segunda pele viva; Kassadin, o Caminhante do Vazio, caça rupturas pelo mundo; os belvethianos conhecem o enxame de perto.',
         champs=["Kai'Sa", 'Kassadin'], match=r'Belvethi|Void Blaster', uni=['O toque do Vazio', 'Sal na terra']),
    dict(region='void', id='icathia', name='Os últimos de Icathia',
         desc='O reino que o Vazio devorou. Jax, o último guerreiro de Icathia, procura pelo mundo quem tenha a força de enfrentar o que destruiu sua casa.',
         champs=['Jax'], uni=['A Queda de Icathia']),
    dict(region='void', id='voidborn', name='Os Vastinatas',
         desc='Seres construídos pelos Observadores para aprender, consumir e preparar a volta de seus mestres. Vel\'Koz, o Olho do Vazio, Kha\'Zix, o caçador que evolui, e Bel\'Veth, a Imperatriz que devora mundos.',
         champs=['Vel\'Koz', 'Kha\'Zix', 'Bel\'Veth']),

    # ---------------------------------------------------------------- Ixtal
    dict(region='ixtal', id='yuntal', name='Os Yun Tal',
         desc='A casta dominante de Ixtal, formada pelos elementalistas mais sábios e dotados. Vestem roupas tecidas com vidálio para mostrar e amplificar seu poder. Qiyana e Milio vêm dessa herança (cada um à sua maneira).',
         champs=['Qiyana', 'Milio'],
         uni=['CASTA DOMINANTE', 'AS PROVÍNCIAS', 'UMA INFÂNCIA PRIVILEGIADA', 'OS AXIOMATA', 'O VIDÁLIO', 'VESTIDOS DE PODER', 'Conhecimento esotérico', 'Domínio sobre o Reino Material']),
    dict(region='ixtal', id='jungle', name='Vastaya e caçadores da selva',
         desc='Quem vive entre as árvores de Ixtal e conhece a selva como ninguém: Nidalee, a caçadora, Neeko, a camaleoa vastaya, e Rengar, o caçador de troféus.',
         champs=['Nidalee', 'Packmother Nidalee', 'Neeko', 'Rengar'], match=r'Avenging Vastaya|Shadow in the Brush'),
    dict(region='ixtal', id='guardians', name='Guardiões e espíritos elementais',
         desc='Os que guardam a terra de Ixtal: Skarner, o colosso de cristal, Malphite, o fragmento do Monólito, e Zyra, a flor espinhenta.',
         champs=['Skarner', 'Malphite', 'Zyra']),
    dict(region='ixtal', id='people', name='O povo de Ixaocan',
         desc='O dia a dia da cidade-arcologia: cada habitante aprende os Axiomata e a magia faz parte da rotina, do trabalho às mensagens memorizadas.',
         uni=['O povo de Ixaocan']),

    # ---------------------------------------------------------------- Runeterra, sem região fixa
    dict(region='runeterra', id='camavor', name='Camavor, o reino do Trono de Prata',
         desc='Reino extinto a leste, fundado pelos gêmeos Camor e Avora e aliado aos dragões da Vovó Víbora. Ruiu quando o rei Viego deixou de governar para trazer Isolde de volta, e a Ruína levou seu povo junto: Viego, Kalista, Hecarim, o comandante Ledros e o jovem dragão Smolder, herdeiro do antigo juramento.',
         champs=['Viego', 'Kalista', 'Hecarim', 'Smolder'], match=r'Camavor|Ledros|Deathless Knight|Duskrider|Spectral Rider',
         uni=['Hecarim']),
    dict(region='runeterra', id='kathkan', name='Kathkan e a Sétima Camada',
         desc='Nação vizinha e antiga rival de Camavor, que prospera desde a queda dela. Sob a capital, uma ordem secreta de heróis, a Sétima Camada, vigia o demônio Ashlesh. Nilah, hoje sua portadora, foi a primeira kathkani a pisar em Valoran em mais de setecentos anos.',
         champs=['Nilah']),
    dict(region='runeterra', id='legends', name='Lendas',
         desc='Figuras que não pertencem a uma só terra: viajantes, guardiões cósmicos, demônios, feras míticas e pesadelos que aparecem por toda Runeterra, do Bardo e de Ryze a Kindred e Nocturne.',
         champs=['Kindred', 'Nocturne', 'Bard', 'Ryze', 'Evelynn', 'Fiddlesticks', 'Shaco', 'Brand', 'The Poro King', 'Elder Dragon']),
    dict(region='runeterra', id='rt-darkin', name='Os Darkin',
         desc='Antigos Ascendidos de Shurima presos em armas após a guerra contra Icathia. Possuem quem os empunha e espalham ruína por onde passam.',
         champs=['Aatrox', 'Kayn', 'Rhaast', 'The Shadow Assassin', 'Varus', 'Zaahen']),
    dict(region='runeterra', id='rt-shards', name='Runas Globais',
         desc='Fragmentos dos poderes que criaram o mundo. Quem os encontra raramente sai ileso.'),
    # ---------------------------------------------------------------------------------------------------- Nazumah
    dict(region='nazumah', id='ksante', name="K'Sante, o Orgulho de Nazumah",
         desc="Guerreiro-caçador de Nazumah, criado entre histórias dos antepassados que fugiram dos Ascendidos. Seu orgulho quase o separa de Tope, até ele aprender que força sozinha não derruba o baccai.",
         champs=["K'Sante"]),
    dict(region='nazumah', id='tope', name='Tope e a caça ao baccai',
         desc="Tope, de Marrowmark, caçador de longo alcance e parceiro de K'Sante. Seu diário revelou o que a dupla não via sobre o monstro cobra-leão."),
    # ---------------------------------------------------------------- groups added in the Universe review
    dict(region='shadow-isles', id='revelry', name='Festa da Meia-Noite',
         desc='Espíritos que ainda dançam, tocam e brindam nos salões assombrados das Ilhas das Sombras, repetindo as festas de uma vida que já acabou, e o poeta sombrio Grimm.'),
    dict(region='shadow-isles', id='specters', name='Espectros e almas penadas',
         desc='Os mortos das Ilhas das Sombras, presos à Névoa Negra: dos espectros mais fracos aos que ainda lembram quem foram, como Karthus, o cantor da morte.', champs=['Karthus']),
    dict(region='bandle', id='citizens', name='Cidadãos de Bandópolis',
         desc='Prefeitos, empresários da arena, tios e vizinhos: o povo comum de Bandópolis, entre festas e confusões.'),
    dict(region='piltover', id='seraphine', name='Seraphine e o palco de Piltover',
         desc='A jovem cantora que ouve o mundo como música e quem a acompanha do público.'),
    dict(region='shurima', id='baccai', name='Os Baccai',
         desc='Ascendentes falhos de Shurima: quando a ascensão fracassou, sobraram criaturas retorcidas pelo que poderiam ter sido. Alguns ainda guardam santuários e relíquias do império.'),
    dict(region='shurima', id='xerath', name='Xerath e seus acólitos',
         desc='O mago ascendido preso por Azir e os que se entregaram a ele em troca de poder, e agora erguem obeliscos pelo deserto.'),
    dict(region='targon', id='ottrani', name='Os Ottrani e os dragões de Targon',
         desc='Adoradores de dragões das encostas de Targon, os Ottrani, e os sonhadores que ouvem a canção dos dragões celestes.'),
]

# Champions that go to the Criaturas tab of a region (beasts that act on instinct, not sapient beings).
CREATURE_CHAMPS = {'void': ["Cho'Gath", "Kog'Maw", "Rek'Sai"]}
# Legends of Runeterra cards filed under another region by the game: name -> region of the gallery.
FORCE_REGION = {
    'void': ["Rek'Sai", "Xer'sai Caller", "Xer'sai Dunebreaker", "Xer'sai Hatchling", "Xerxa'Reth, The Undertitan", 'Dune Swallower',
             'Void Abomination', 'Hive Herald', "Kai'Sa", 'Belvethi Elder', 'Voidling', 'Void Blaster', 'Void Gate', 'Camouflaged Horror',
             'Xenotype Researchers', 'Stasis Statue'],
    'nazumah': ['Grumpy Rockbear'],
    'runeterra': ['Spectral Rider', 'Commander Ledros', 'Duskrider', 'Camavoran Soldier', 'Camavoran Dragon', 'Deathless Knight',
                  'Erastin, the Disgraced', 'The Iron Conquest'],
    'ixtal': ['Nidalee', 'Packmother Nidalee', 'Pakaa Cub', 'Pakaa Protector', 'Avenging Vastaya', 'Shadow in the Brush', 'Bushwhack Trap', 'Neeko', 'Malphite'],
}
# Cards that are creatures even though their name does not say so
CREATURE_CARDS = {'Grumpy Rockbear', 'Voidling', 'Void Blaster', 'Dune Swallower', "Xerxa'Reth, The Undertitan", 'Elder Dragon', 'The Poro King'}
# Universe galleries without a title on each picture: slug of the gallery -> title
UNI_MODULE_TITLES = {'people-ixaocan': 'O povo de Ixaocan'}

# Universe gallery pictures that are creatures (by title); everything else in a gallery is a place
# unless a group above claims it.
UNI_CREATURES = {
    'A Cria do Vazio', 'Armadura de Trevas', 'Os dragões elementais',
    'Rapinas Demacianas', 'Envergadura da Rapina', 'Ascensão do Ninho de Rapina', 'Cães-dragão', 'Basilisco',
    'FERAS DAS MONTANHAS', 'IBIK', 'TAMU', 'BÓLOR', 'Monstros das Profundezas', 'Bestas Marinhas',
    'Nadadores da Areia', 'Skallashi', 'Obstinados', 'Viúva dos Cantos Esquecidos', 'Igual Atrai Igual',
    'Morte Eterna', 'Além das Ilhas',
}
# Universe pictures that are about the region's people in general (they go to "Outros" in Grupos)
# English titles in the Portuguese Universe feed
UNI_TITLES = {
    'DOMAIN OF THE ICE WITCH': 'O domínio da Bruxa Gélida', 'THE DRAKLORN': 'Os Draklorn', 'HOLDING BACK THE DARKNESS': 'Contendo a escuridão',
    'EYES IN THE ABYSS': 'Olhos no Abismo', 'MORTIS STONES': 'Pedras Mortis',
}
UNI_PEOPLE = {
    'Culturalmente Inclusiva', 'Sangue Velho, Sangue Novo', 'Residentes da Cidade', 'Povos das tribos',
    'Mercador de frutas', 'Diversidade rica', 'Mercador de itens', 'O Barqueiro', 'Um Túmulo na Água',
    'As Aparências Enganam...', 'A Transmogrificação Visual de Heimerdinger', 'Mais Forte que a Vida ou a Morte',
    'Armas Tribais', 'Gelo Verdadeiro', 'Carabina Hex', 'Esofiltros reutilizáveis', 'Quimtec', 'Exofiltrador integral',
    'Nebulizador de gás do Sumidouro', 'Acordos hextec clandestinos', 'A filha de Setaka, ascendeu como Hierofante de Zuretta',
    'Iluminando a Cidade do Progresso', 'A Vida é uma Batalha', 'Interior da casa', 'Criando uma casa',
}


# Hand-made moves, applied after the automatic sorting. Names are matched without accents or capitals and
# every card with that name moves ("todos os itens Nilah"). Targets: a group id, 'creatures' or 'places'.
# Names listed in PULL are also taken from other regions (Fizz is filed under Bandle City by the game).
MOVES = {
    'runeterra': {
        'camavor': ['Hecarim', 'Erastin, o Desonrado', 'A Conquista de Ferro'],
    },
    'bilgewater': {
        'hunters': ['Devoto do Desafio', 'Mestre Vigia', 'Timoneiro Experiente', 'O Dançarino das Marés', 'Dançarina dos Chakrans',
                    'Vikrash, o Exuberante', 'Devoto Dedicado'],
        'buhru': ['Navegadora Nativa'],
        'pirates': ['Estátua de Macaco', 'Rex Correnteza'],
        'marine': ['Almirante Shelly', 'Artilharia Cascuda', 'Fizz', 'Nautilus', 'Zap Nadajato', 'Mergulhador Evasivo',
                   'Aventureiro Saltareias', 'Polvaventureiro'],
        'underworld': ['Babs Delirante', 'Rãdivinha', 'Senhor Resmunguejo', 'Pablo Cinco-Socos', 'A Corte do Rei', 'Anjinho', 'Bull',
                       'Nukkle', 'Polvo Boxeador', 'Mako', 'Sabichão', 'Tahm Kench', 'Jack', 'Jack, o Vencedor'],
        'bounty': ['A Sereia'],
        'creatures': ['Rato do Cais', 'Criaturas Coralinas', 'Dentão'],
    },
}
PULL = {'bilgewater': ['Fizz'], 'runeterra': ['Hecarim']}

# Concept art from the League of Legends wiki, picked by hand: (file name on the wiki, region, bucket, caption).
# bucket is "places", "creatures" or a group id of the region. Captions are numbered per region and bucket.
WIKI_PICKS = [
    ('Void_Armored_In_Darkness.jpg', 'void', 'creatures', 'Guerreiro do Vazio (arte conceitual 1)'),
    ('Void_Warriors_Concept_02.jpg', 'void', 'creatures', 'Guerreiro do Vazio (arte conceitual 2)'),
    ('Void_Facing_The_Void.jpg', 'void', 'places', 'Vazio (arte conceitual 1)'),
    ('Void_Icathia.png', 'void', 'places', 'Vazio (arte conceitual 2)'),
    ('Void_concept_01.jpg', 'void', 'places', 'Vazio (arte conceitual 3)'),
    ('Voidlings-portal.jpg', 'void', 'places', 'Vazio (arte conceitual 4)'),
    ('Voidborn_Concept_01.jpg', 'void', 'voidborn', 'Vastinatas encapuzados (arte conceitual)'),
    ('Shurima_LoR_Concept_79.jpg', 'void', 'creatures', 'Criatura do Vazio (arte conceitual 1)'),
    ('Shurima_LoR_Concept_80.jpg', 'void', 'creatures', 'Criatura do Vazio (arte conceitual 2)'),
    ('Shurima_LoR_Concept_83.jpg', 'void', 'creatures', 'Criatura do Vazio (arte conceitual 3)'),
    ('Shurima_The_Call_Concept_05.jpg', 'void', 'creatures', 'Criatura do Vazio (arte conceitual 4)'),
    ('Ixtal_The_Axiomata_01.jpg', 'ixtal', 'yuntal', 'Os Axiomata (arte conceitual)'),
    ('Ixtal_The_People_of_Ixaocan_01.jpg', 'ixtal', 'people', 'Povo de Ixaocan (arte conceitual 1)'),
    ('Ixtal_The_People_of_Ixaocan_02.jpg', 'ixtal', 'people', 'Povo de Ixaocan (arte conceitual 2)'),
    ('Ixtal_The_People_of_Ixaocan_03.jpg', 'ixtal', 'people', 'Povo de Ixaocan (arte conceitual 3)'),
    ('Ixtal_The_People_of_Ixaocan_04.jpg', 'ixtal', 'people', 'Povo de Ixaocan (arte conceitual 4)'),
    ('Ixtal_The_People_of_Ixaocan_05.jpg', 'ixtal', 'people', 'Povo de Ixaocan (arte conceitual 5)'),
    ('Ixtal_The_People_of_Ixaocan_06.jpg', 'ixtal', 'people', 'Povo de Ixaocan (arte conceitual 6)'),
    ('Ixtal_character_concept_art_1.png', 'ixtal', 'yuntal', 'Yun Tal (arte conceitual 1)'),
    ('Ixtal_character_concept_art_2.png', 'ixtal', 'yuntal', 'Yun Tal (arte conceitual 2)'),
    ('Ixtal_character_concept_art_3.png', 'ixtal', 'yuntal', 'Yun Tal (arte conceitual 3)'),
    ('Demacia_BeforeGlory_Concept_09.jpg', 'demacia', 'places', 'Demacia (arte conceitual 1)'),
    ('Demacia_Before_Glory_Concept_06.jpg', 'demacia', 'places', 'Demacia (arte conceitual 2)'),
    ('Demacia_LND_concept_01.jpg', 'demacia', 'places', 'Demacia (arte conceitual 3)'),
    ('Demacia_LND_concept_02.jpg', 'demacia', 'places', 'Demacia (arte conceitual 4)'),
    ('Demacia_LND_concept_04.jpg', 'demacia', 'places', 'Demacia (arte conceitual 5)'),
    ('Demacia_LoR_Concept_07.jpg', 'demacia', 'places', 'Demacia (arte conceitual 6)'),
    ('Demacia_LoR_Concept_08.jpg', 'demacia', 'places', 'Demacia (arte conceitual 7)'),
    ('Demacia_LoR_Concept_26.jpg', 'demacia', 'places', 'Demacia (arte conceitual 8)'),
    ('Demacia_LoR_Concept_27.jpg', 'demacia', 'places', 'Demacia (arte conceitual 9)'),
    ('Demacia_LoR_Concept_28.jpg', 'demacia', 'places', 'Demacia (arte conceitual 10)'),
    ('Demacia_LoR_Concept_29.jpg', 'demacia', 'places', 'Demacia (arte conceitual 11)'),
    ('Demacia_LoR_Concept_30.jpg', 'demacia', 'places', 'Demacia (arte conceitual 12)'),
    ('Demacia_LoR_Concept_31.jpg', 'demacia', 'places', 'Demacia (arte conceitual 13)'),
    ('Demacia_LoR_Concept_33.jpg', 'demacia', 'places', 'Demacia (arte conceitual 14)'),
    ('Demacia_LoR_Concept_35.jpg', 'demacia', 'places', 'Demacia (arte conceitual 15)'),
    ('Demacia_Still_Here_Concept_04.jpg', 'demacia', 'places', 'Demacia (arte conceitual 16)'),
    ('Demacia_concept_old.jpg', 'demacia', 'places', 'Demacia (arte conceitual 17)'),
    ('Demacia_LoR_Concept_12.jpg', 'demacia', 'creatures', 'Fera de Demacia (arte conceitual 1)'),
    ('Demacia_LoR_Concept_14.jpg', 'demacia', 'creatures', 'Fera de Demacia (arte conceitual 2)'),
    ('Demacia_LoR_Concept_15.jpg', 'demacia', 'creatures', 'Fera de Demacia (arte conceitual 3)'),
    ('Demacia_LoR_Concept_21.jpg', 'demacia', 'creatures', 'Fera de Demacia (arte conceitual 4)'),
    ('Demacia_LoR_Concept_02.jpg', 'demacia', 'mageseekers', 'Magos de Demacia (arte conceitual)'),
    ('Demacia_LoR_Concept_09.png', 'demacia', 'vanguard', 'Vanguarda de Demacia (arte conceitual)'),
    ('Noxus_A_Night_at_the_Inn_Concept_16.jpg', 'noxus', 'places', 'Noxus (arte conceitual 1)'),
    ('Noxus_After_Victory_Concept_04.jpg', 'noxus', 'places', 'Noxus (arte conceitual 2)'),
    ('Noxus_Concept.jpg', 'noxus', 'places', 'Noxus (arte conceitual 3)'),
    ('Noxus_LoR_Concept_16.jpg', 'noxus', 'places', 'Noxus (arte conceitual 4)'),
    ('Noxus_LoR_Concept_17.jpg', 'noxus', 'places', 'Noxus (arte conceitual 5)'),
    ('Noxus_LoR_Concept_19.jpg', 'noxus', 'places', 'Noxus (arte conceitual 6)'),
    ('Noxus_LoR_Concept_21.jpg', 'noxus', 'places', 'Noxus (arte conceitual 7)'),
    ('Noxus_LoR_Concept_63.jpg', 'noxus', 'places', 'Noxus (arte conceitual 8)'),
    ('Noxus_LoR_Concept_64.jpg', 'noxus', 'places', 'Noxus (arte conceitual 9)'),
    ('Noxus_LoR_Concept_65.jpg', 'noxus', 'places', 'Noxus (arte conceitual 10)'),
    ('Noxus_LoR_Concept_67.jpg', 'noxus', 'places', 'Noxus (arte conceitual 11)'),
    ('Noxus_LoR_Concept_69.jpg', 'noxus', 'places', 'Noxus (arte conceitual 12)'),
    ('Noxus_concept_old.jpg', 'noxus', 'places', 'Noxus (arte conceitual 13)'),
    ('Noxus_LoR_Concept_24.jpg', 'noxus', 'creatures', 'Fera de Noxus (arte conceitual 1)'),
    ('Noxus_LoR_Concept_29.jpg', 'noxus', 'creatures', 'Fera de Noxus (arte conceitual 2)'),
    ('Noxus_LoR_Concept_30.jpg', 'noxus', 'creatures', 'Fera de Noxus (arte conceitual 3)'),
    ('Noxus_LoR_Concept_31.jpg', 'noxus', 'creatures', 'Fera de Noxus (arte conceitual 4)'),
    ('Freljord_After_Victory_Concept_08.jpg', 'freljord', 'places', 'Freljord (arte conceitual 1)'),
    ('Freljord_LND_concept_01.jpg', 'freljord', 'places', 'Freljord (arte conceitual 2)'),
    ('Freljord_LND_concept_06.jpg', 'freljord', 'places', 'Freljord (arte conceitual 3)'),
    ('Freljord_LND_concept_07.jpg', 'freljord', 'places', 'Freljord (arte conceitual 4)'),
    ('Freljord_LoR_Concept_23.jpg', 'freljord', 'places', 'Freljord (arte conceitual 5)'),
    ('Freljord_LoR_Concept_24.jpg', 'freljord', 'places', 'Freljord (arte conceitual 6)'),
    ('Freljord_LoR_Concept_41.jpg', 'freljord', 'places', 'Freljord (arte conceitual 7)'),
    ('Freljord_LoR_Concept_43.jpg', 'freljord', 'places', 'Freljord (arte conceitual 8)'),
    ('Freljord_Song_of_Nunu_Concept_02.jpg', 'freljord', 'places', 'Freljord (arte conceitual 9)'),
    ('Freljord_The_Raid_Concept_06.jpg', 'freljord', 'places', 'Freljord (arte conceitual 10)'),
    ('Freljord_The_Raid_Concept_10.jpg', 'freljord', 'places', 'Freljord (arte conceitual 11)'),
    ('Freljord_The_Raid_Concept_11.jpg', 'freljord', 'places', 'Freljord (arte conceitual 12)'),
    ('Freljord_The_Raid_Concept_17.jpg', 'freljord', 'places', 'Freljord (arte conceitual 13)'),
    ('Freljord_LND_concept_10.jpg', 'freljord', 'creatures', 'Fera do Freljord (arte conceitual 1)'),
    ('Freljord_LoR_Concept_16.jpg', 'freljord', 'creatures', 'Fera do Freljord (arte conceitual 2)'),
    ('Freljord_LoR_Concept_25.jpg', 'freljord', 'creatures', 'Fera do Freljord (arte conceitual 3)'),
    ('Freljord_LoR_Concept_26.jpg', 'freljord', 'creatures', 'Fera do Freljord (arte conceitual 4)'),
    ('Freljord_LoR_Concept_47.jpg', 'freljord', 'creatures', 'Fera do Freljord (arte conceitual 5)'),
    ('Ionia_Kin_of_the_Stained_Blade_Concept_01.jpg', 'ionia', 'places', 'Ionia (arte conceitual 1)'),
    ('Ionia_Kin_of_the_Stained_Blade_Concept_03.jpg', 'ionia', 'places', 'Ionia (arte conceitual 2)'),
    ('Ionia_Kin_of_the_Stained_Blade_Concept_09.jpg', 'ionia', 'places', 'Ionia (arte conceitual 3)'),
    ('Ionia_Kin_of_the_Stained_Blade_Concept_10.jpg', 'ionia', 'places', 'Ionia (arte conceitual 4)'),
    ('Ionia_Kin_of_the_Stained_Blade_Concept_12.jpg', 'ionia', 'places', 'Ionia (arte conceitual 5)'),
    ('Ionia_Kin_of_the_Stained_Blade_Concept_13.jpg', 'ionia', 'places', 'Ionia (arte conceitual 6)'),
    ('Ionia_Kin_of_the_Stained_Blade_Concept_16.jpg', 'ionia', 'places', 'Ionia (arte conceitual 7)'),
    ('Ionia_Kin_of_the_Stained_Blade_Concept_20.jpg', 'ionia', 'places', 'Ionia (arte conceitual 8)'),
    ('Ionia_Kin_of_the_Stained_Blade_Concept_24.jpg', 'ionia', 'places', 'Ionia (arte conceitual 9)'),
    ('Ionia_Kin_of_the_Stained_Blade_Concept_25.jpg', 'ionia', 'places', 'Ionia (arte conceitual 10)'),
    ('Ionia_LoR_Concept_28.jpg', 'ionia', 'places', 'Ionia (arte conceitual 11)'),
    ('Ionia_LoR_Concept_65.jpg', 'ionia', 'places', 'Ionia (arte conceitual 12)'),
    ('Ionia_LoR_Concept_67.jpg', 'ionia', 'places', 'Ionia (arte conceitual 13)'),
    ('Ionia_The_Lesson_Concept_03.jpg', 'ionia', 'places', 'Ionia (arte conceitual 14)'),
    ('Ionia_The_Lesson_Concept_05.jpg', 'ionia', 'places', 'Ionia (arte conceitual 15)'),
    ('Ionia_The_Lesson_Concept_06.jpg', 'ionia', 'places', 'Ionia (arte conceitual 16)'),
    ('Ionia_LoR_Concept_35.jpg', 'ionia', 'creatures', 'Espírito de Ionia (arte conceitual 1)'),
    ('Ionia_LoR_Concept_43.jpg', 'ionia', 'creatures', 'Espírito de Ionia (arte conceitual 2)'),
    ('Ionia_LoR_Concept_52.jpg', 'ionia', 'creatures', 'Espírito de Ionia (arte conceitual 3)'),
    ('Ionia_LoR_Concept_54.jpg', 'ionia', 'creatures', 'Espírito de Ionia (arte conceitual 4)'),
    ('Ionia_LoR_Concept_83.jpg', 'ionia', 'creatures', 'Espírito de Ionia (arte conceitual 5)'),
    ('Ionia_The_Lesson_Concept_07.jpg', 'ionia', 'creatures', 'Espírito de Ionia (arte conceitual 6)'),
    ('Ionia_LoR_Concept_73.jpg', 'ionia', 'monks', 'Guardiões do templo (arte conceitual 1)'),
    ('Ionia_LoR_Concept_78.jpg', 'ionia', 'monks', 'Guardiões do templo (arte conceitual 2)'),
    ('Ionia_LoR_Concept_81.jpg', 'ionia', 'kinkou', 'Estudante Kinkou (arte conceitual)'),
    ('Piltover_CONVRGENCE_Concept_01.jpg', 'piltover', 'places', 'Piltover (arte conceitual 1)'),
    ('Piltover_Hextech_Mayhem_Concept_05.jpg', 'piltover', 'places', 'Piltover (arte conceitual 2)'),
    ('Piltover_Hextech_Mayhem_Concept_06.jpg', 'piltover', 'places', 'Piltover (arte conceitual 3)'),
    ('Piltover_LoR_Concept_08.jpg', 'piltover', 'places', 'Piltover (arte conceitual 4)'),
    ('Piltover_LoR_Concept_27.jpg', 'piltover', 'places', 'Piltover (arte conceitual 5)'),
    ('Piltover_LoR_Concept_29.jpg', 'piltover', 'places', 'Piltover (arte conceitual 6)'),
    ('Piltover_LoR_Concept_32.jpg', 'piltover', 'places', 'Piltover (arte conceitual 7)'),
    ('Piltover_LoR_Concept_34.jpg', 'piltover', 'places', 'Piltover (arte conceitual 8)'),
    ('Piltover_LoR_Concept_35.jpg', 'piltover', 'places', 'Piltover (arte conceitual 9)'),
    ('Piltover_LoR_Concept_38.jpg', 'piltover', 'places', 'Piltover (arte conceitual 10)'),
    ('Piltover_True_Genius_Concept_05.jpg', 'piltover', 'places', 'Piltover (arte conceitual 11)'),
    ('Piltover_LoR_Concept_10.jpg', 'piltover', 'creatures', 'Baleias voadoras (arte conceitual)'),
    ('Zaun_CONVRGENCE_Concept_02.png', 'zaun', 'places', 'Zaun (arte conceitual 1)'),
    ('Zaun_Hextech_Mayhem_Concept_01.jpg', 'zaun', 'places', 'Zaun (arte conceitual 2)'),
    ('Zaun_Hextech_Mayhem_Concept_02.jpg', 'zaun', 'places', 'Zaun (arte conceitual 3)'),
    ('Zaun_Hextech_Mayhem_Concept_03.jpg', 'zaun', 'places', 'Zaun (arte conceitual 4)'),
    ('Zaun_LoR_Concept_07.jpg', 'zaun', 'places', 'Zaun (arte conceitual 5)'),
    ('Zaun_LoR_Concept_08.jpg', 'zaun', 'places', 'Zaun (arte conceitual 6)'),
    ('Zaun_LoR_Concept_11.jpg', 'zaun', 'places', 'Zaun (arte conceitual 7)'),
    ('Zaun_LoR_Concept_12.jpg', 'zaun', 'places', 'Zaun (arte conceitual 8)'),
    ('Zaun_LoR_Concept_05.jpg', 'zaun', 'creatures', 'Criatura de Zaun (arte conceitual)'),
    ('Bandle_City_LoR_Concept_02.jpg', 'bandle', 'places', 'Bandópolis (arte conceitual 1)'),
    ('Bandle_City_LoR_Concept_04.jpg', 'bandle', 'places', 'Bandópolis (arte conceitual 2)'),
    ('Bandle_City_LoR_Concept_08.jpg', 'bandle', 'places', 'Bandópolis (arte conceitual 3)'),
    ('Bandle_City_LoR_Concept_09.jpg', 'bandle', 'places', 'Bandópolis (arte conceitual 4)'),
    ('Bandle_City_LoR_Concept_10.jpg', 'bandle', 'places', 'Bandópolis (arte conceitual 5)'),
    ('Bandle_City_LoR_Concept_13.jpg', 'bandle', 'places', 'Bandópolis (arte conceitual 6)'),
    ('Bandle_City_LoR_Concept_21.jpg', 'bandle', 'places', 'Bandópolis (arte conceitual 7)'),
    ('Bandle_City_LoR_Concept_22.jpg', 'bandle', 'places', 'Bandópolis (arte conceitual 8)'),
    ('Bandle_City_LoR_Concept_65.jpg', 'bandle', 'places', 'Bandópolis (arte conceitual 9)'),
    ('Bandle_City_LoR_Concept_66.jpg', 'bandle', 'places', 'Bandópolis (arte conceitual 10)'),
    ('Bandle_City_LoR_Concept_67.jpg', 'bandle', 'places', 'Bandópolis (arte conceitual 11)'),
    ('Bandle_City_LoR_Concept_69.jpg', 'bandle', 'places', 'Bandópolis (arte conceitual 12)'),
    ('Bandle_City_LoR_Concept_72.jpg', 'bandle', 'places', 'Bandópolis (arte conceitual 13)'),
    ('Bandle_City_LoR_Concept_81.jpg', 'bandle', 'places', 'Bandópolis (arte conceitual 14)'),
    ('Bandle_City_LoR_Concept_82.jpg', 'bandle', 'places', 'Bandópolis (arte conceitual 15)'),
    ('Bandle_City_LoR_Concept_83.jpg', 'bandle', 'places', 'Bandópolis (arte conceitual 16)'),
    ('Bandle_City_LoR_Concept_84.jpg', 'bandle', 'places', 'Bandópolis (arte conceitual 17)'),
    ('Bandle_City_LoR_Concept_29.jpg', 'bandle', 'creatures', 'Criatura de Bandópolis (arte conceitual 1)'),
    ('Bandle_City_LoR_Concept_31.jpg', 'bandle', 'creatures', 'Criatura de Bandópolis (arte conceitual 2)'),
    ('Bandle_City_LoR_Concept_32.jpg', 'bandle', 'creatures', 'Criatura de Bandópolis (arte conceitual 3)'),
    ('Bandle_City_LoR_Concept_51.jpg', 'bandle', 'creatures', 'Criatura de Bandópolis (arte conceitual 4)'),
    ('Bandle_City_LoR_Concept_52.jpg', 'bandle', 'creatures', 'Criatura de Bandópolis (arte conceitual 5)'),
    ('Bandle_City_LoR_Concept_53.jpg', 'bandle', 'creatures', 'Criatura de Bandópolis (arte conceitual 6)'),
    ('Shadow_Isles_LoR_Concept_12.jpg', 'shadow-isles', 'places', 'Ilhas das Sombras (arte conceitual 1)'),
    ('Shadow_Isles_LoR_Concept_13.jpg', 'shadow-isles', 'places', 'Ilhas das Sombras (arte conceitual 2)'),
    ('Shadow_Isles_LoR_Concept_14.jpg', 'shadow-isles', 'places', 'Ilhas das Sombras (arte conceitual 3)'),
    ('Shadow_Isles_LoR_Concept_15.jpg', 'shadow-isles', 'places', 'Ilhas das Sombras (arte conceitual 4)'),
    ('Shadow_Isles_None_Escape_Concept_03.jpg', 'shadow-isles', 'places', 'Ilhas das Sombras (arte conceitual 5)'),
    ('Shadow_Isles_LoR_Concept_44.jpg', 'shadow-isles', 'places', 'Ilhas das Sombras (arte conceitual 6)'),
    ("Shadow_Isles_Shadow'sEmbrace_Concept_02.jpg", 'shadow-isles', 'places', 'Ilhas das Sombras (arte conceitual 7)'),
    ("Shadow_Isles_Shadow'sEmbrace_Concept_05.jpg", 'shadow-isles', 'places', 'Ilhas das Sombras (arte conceitual 8)'),
    ('Shadow_Isles_concept_4.jpg', 'shadow-isles', 'places', 'Ilhas das Sombras (arte conceitual 9)'),
    ('Shadow_Isles_concept_5.jpg', 'shadow-isles', 'places', 'Ilhas das Sombras (arte conceitual 10)'),
    ('Shadow_Isles_LoR_Concept_08.jpg', 'shadow-isles', 'creatures', 'Criatura das Ilhas das Sombras (arte conceitual 1)'),
    ('Shadow_Isles_LoR_Concept_24.jpg', 'shadow-isles', 'creatures', 'Criatura das Ilhas das Sombras (arte conceitual 2)'),
    ('Shadow_Isles_LoR_Concept_29.jpg', 'shadow-isles', 'creatures', 'Criatura das Ilhas das Sombras (arte conceitual 3)'),
    ('Shadow_Isles_LoR_Concept_33.jpg', 'shadow-isles', 'creatures', 'Criatura das Ilhas das Sombras (arte conceitual 4)'),
    ('Shadow_Isles_LoR_Concept_28.jpg', 'shadow-isles', 'creatures', 'Criatura das Ilhas das Sombras (arte conceitual 5)'),
    ('Shadow_Isles_LoR_Concept_40.jpg', 'shadow-isles', 'creatures', 'Criatura das Ilhas das Sombras (arte conceitual 6)'),
    ('Shadow_Isles_LoR_Concept_41.jpg', 'shadow-isles', 'creatures', 'Criatura das Ilhas das Sombras (arte conceitual 7)'),
    ('Shadow_Isles_LoR_Concept_37.jpg', 'shadow-isles', 'creatures', 'Criatura das Ilhas das Sombras (arte conceitual 8)'),
    ('Bilgewater_Double-Double_Cross_Concept_15.jpg', 'bilgewater', 'places', 'Águas de Sentina (arte conceitual 1)'),
    ('Bilgewater_LoR_Concept_48.jpg', 'bilgewater', 'places', 'Águas de Sentina (arte conceitual 2)'),
    ('Bilgewater_LoR_Concept_49.jpg', 'bilgewater', 'places', 'Águas de Sentina (arte conceitual 3)'),
    ('Bilgewater_LoR_Concept_50.jpg', 'bilgewater', 'places', 'Águas de Sentina (arte conceitual 4)'),
    ('Bilgewater_LoR_Concept_51.jpg', 'bilgewater', 'places', 'Águas de Sentina (arte conceitual 5)'),
    ('Bilgewater_LoR_Concept_52.jpg', 'bilgewater', 'places', 'Águas de Sentina (arte conceitual 6)'),
    ('Bilgewater_LoR_Concept_53.jpg', 'bilgewater', 'places', 'Águas de Sentina (arte conceitual 7)'),
    ('Bilgewater_LoR_Concept_54.jpg', 'bilgewater', 'places', 'Águas de Sentina (arte conceitual 8)'),
    ('Bilgewater_RuinedKing_Concept_01.jpg', 'bilgewater', 'places', 'Águas de Sentina (arte conceitual 9)'),
    ('Bilgewater_RuinedKing_Concept_02.jpg', 'bilgewater', 'places', 'Águas de Sentina (arte conceitual 10)'),
    ('Bilgewater_RuinedKing_Concept_04.jpg', 'bilgewater', 'places', 'Águas de Sentina (arte conceitual 11)'),
    ('Bilgewater_RuinedKing_Concept_05.jpg', 'bilgewater', 'places', 'Águas de Sentina (arte conceitual 12)'),
    ('Bilgewater_LoR_Concept_40.jpg', 'bilgewater', 'creatures', 'Criatura de Águas de Sentina (arte conceitual 1)'),
    ('Bilgewater_LoR_Concept_24.jpg', 'bilgewater', 'creatures', 'Criatura de Águas de Sentina (arte conceitual 2)'),
    ('Bilgewater_LoR_Concept_27.jpg', 'bilgewater', 'creatures', 'Criatura de Águas de Sentina (arte conceitual 3)'),
    ('Bilgewater_LoR_Concept_10.jpg', 'bilgewater', 'marai', 'Marai (arte conceitual 1)'),
    ('Bilgewater_LoR_Concept_14.jpg', 'bilgewater', 'marai', 'Marai (arte conceitual 2)'),
    ('Bilgewater_LoR_Concept_15.jpg', 'bilgewater', 'marai', 'Marai (arte conceitual 3)'),
    ('Shurima_LoR_Concept_16.jpg', 'shurima', 'places', 'Shurima (arte conceitual 1)'),
    ('Shurima_LoR_Concept_18.jpg', 'shurima', 'places', 'Shurima (arte conceitual 2)'),
    ('Shurima_LoR_Concept_22.jpg', 'shurima', 'places', 'Shurima (arte conceitual 3)'),
    ('Shurima_LoR_Concept_26.jpg', 'shurima', 'places', 'Shurima (arte conceitual 4)'),
    ('Shurima_LoR_Concept_31.jpg', 'shurima', 'places', 'Shurima (arte conceitual 5)'),
    ('Shurima_LoR_Concept_34.jpg', 'shurima', 'places', 'Shurima (arte conceitual 6)'),
    ('Shurima_LoR_Concept_63.jpg', 'shurima', 'places', 'Shurima (arte conceitual 7)'),
    ('Shurima_LoR_Concept_67.jpg', 'shurima', 'places', 'Shurima (arte conceitual 8)'),
    ('Shurima_LoR_Concept_68.jpg', 'shurima', 'places', 'Shurima (arte conceitual 9)'),
    ('Shurima_LoR_Concept_70.jpg', 'shurima', 'places', 'Shurima (arte conceitual 10)'),
    ('Shurima_LoR_Concept_73.jpg', 'shurima', 'places', 'Shurima (arte conceitual 11)'),
    ('Shurima_LoR_Concept_74.jpg', 'shurima', 'places', 'Shurima (arte conceitual 12)'),
    ('Shurima_The_Call_Concept_01.jpg', 'shurima', 'places', 'Shurima (arte conceitual 13)'),
    ('Shurima_The_Call_Concept_03.jpg', 'shurima', 'places', 'Shurima (arte conceitual 14)'),
    ('Shurima_LoR_Concept_20.jpg', 'shurima', 'creatures', 'Criatura de Shurima (arte conceitual 1)'),
    ('Shurima_LoR_Concept_21.jpg', 'shurima', 'creatures', 'Criatura de Shurima (arte conceitual 2)'),
    ('Shurima_LoR_Concept_25.jpg', 'shurima', 'creatures', 'Criatura de Shurima (arte conceitual 3)'),
    ('Targon_Call_of_the_Mountain_Concept_01.jpg', 'targon', 'places', 'Targon (arte conceitual 1)'),
    ('Targon_Call_of_the_Mountain_Concept_03.jpg', 'targon', 'places', 'Targon (arte conceitual 2)'),
    ('Targon_Call_of_the_Mountain_Concept_04.jpg', 'targon', 'places', 'Targon (arte conceitual 3)'),
    ('Targon_Call_of_the_Mountain_Concept_05.jpg', 'targon', 'places', 'Targon (arte conceitual 4)'),
    ('Targon_LoR_Concept_37.jpg', 'targon', 'places', 'Targon (arte conceitual 5)'),
    ('Targon_LoR_Concept_38.jpg', 'targon', 'places', 'Targon (arte conceitual 6)'),
    ('Targon_LoR_Concept_39.jpg', 'targon', 'places', 'Targon (arte conceitual 7)'),
    ('Targon_LoR_Concept_04.jpg', 'targon', 'creatures', 'Criatura de Targon (arte conceitual 1)'),
    ('Targon_LoR_Concept_06.jpg', 'targon', 'creatures', 'Criatura de Targon (arte conceitual 2)'),
    ('Targon_LoR_Concept_07.jpg', 'targon', 'creatures', 'Criatura de Targon (arte conceitual 3)'),
    ('Targon_LoR_Concept_09.jpg', 'targon', 'creatures', 'Criatura de Targon (arte conceitual 4)'),
    ('Targon_LoR_Concept_11.jpg', 'targon', 'creatures', 'Criatura de Targon (arte conceitual 5)'),
    ('Targon_LoR_Concept_13.jpg', 'targon', 'creatures', 'Criatura de Targon (arte conceitual 6)'),
    ('Targon_LoR_Concept_19.jpg', 'targon', 'creatures', 'Criatura de Targon (arte conceitual 7)'),
    ('Targon_LoR_Concept_41.jpg', 'targon', 'creatures', 'Criatura de Targon (arte conceitual 8)'),
    ('Targon_LoR_Concept_01.jpg', 'targon', 'solari', 'Solari (arte conceitual 1)'),
    ('Targon_LoR_Concept_03.jpg', 'targon', 'solari', 'Solari (arte conceitual 2)'),
    ('Targon_LoR_Concept_05.jpg', 'targon', 'solari', 'Solari (arte conceitual 3)'),
    ('Targon_LoR_Concept_34.jpg', 'targon', 'lunari', 'Lunari (arte conceitual 1)'),
    ('Targon_LoR_Concept_35.jpg', 'targon', 'lunari', 'Lunari (arte conceitual 2)'),
    ('Nazumah_Concept_01.jpg', 'nazumah', 'places', 'Nazumah, a cidade-estado do oásis'),
    ("K'Sante_Teaser_01.jpg", 'nazumah', 'places', 'Ruas e bandeiras de Nazumah'),
    ('Baccai_Concept_01.jpg', 'nazumah', 'creatures', 'O baccai cobra-leão (arte conceitual)'),
    ('Tope_Concept_01.jpg', 'nazumah', 'tope', 'Tope (arte conceitual)'),
    ('Tope_Concept_02.jpg', 'nazumah', 'tope', 'O diário de Tope (arte conceitual)'),
    ("K'Sante_Teaser_02.jpg", 'nazumah', 'tope', 'O diário aberto sobre o baccai'),
    ("K'Sante_Concept_01.jpg", 'nazumah', 'ksante', "K'Sante (arte conceitual)"),
    ("K'Sante_Concept_02.jpg", 'nazumah', 'ksante', "K'Sante: retrato (arte conceitual)"),
    ("K'Sante_Defeat_Your_Monster.jpg", 'nazumah', 'ksante', "K'Sante, de volta para vencer seu monstro"),
    ("K'Sante_Everything_We_Should_Have_Said.jpg", 'nazumah', 'ksante', "K'Sante e Tope: tudo o que devíamos ter dito"),
    ("K'Sante_OriginalSkin.jpg", 'nazumah', 'ksante', "K'Sante, o Orgulho de Nazumah"),
    ('RotS_Background_Camavor_Meadow.jpg', 'runeterra', 'places', 'O campo de Camavor'),
    ('Ruination_Novel_Camavor_Map.png', 'runeterra', 'places', 'Mapa de Camavor'),
    ('Ruination_Novel_Camavoran_Continent_Map.png', 'runeterra', 'places', 'Mapa do continente camavorano'),
    ('AS_Background_WR_Camavor_01.png', 'runeterra', 'places', 'Salão do trono de Camavor (arte conceitual)'),
    ('Ledros_RKO_Concept_01.jpg', 'runeterra', 'camavor', 'Comandante Ledros (arte conceitual 1)'),
    ('Ledros_RKO_Concept_02.jpg', 'runeterra', 'camavor', 'Comandante Ledros (arte conceitual 2)'),
    ('Ledros_RKO_Concept_03.jpg', 'runeterra', 'camavor', 'Comandante Ledros (arte conceitual 3)'),
    ('Necrit_RKO_Concept_01.jpg', 'runeterra', 'camavor', 'Necrit, o último conselheiro real (arte conceitual)'),
    ('Necrit_RuinedKing_Concept_01.jpg', 'runeterra', 'camavor', 'Necromantes de Camavor (arte conceitual)'),
    ('Vennix_Concept_01.jpg', 'runeterra', 'camavor', 'Vennix, capitã camavorana (arte conceitual)'),
    ('Kalista_Infantry_RKO_Concept_01.jpg', 'runeterra', 'camavor', 'Infantaria camavorana (arte conceitual 1)'),
    ('Kalista_Infantry_RKO_Concept_02.jpg', 'runeterra', 'camavor', 'Infantaria camavorana (arte conceitual 2)'),
    ('Kalista_Infantry_RKO_Concept_03.jpg', 'runeterra', 'camavor', 'Infantaria camavorana (arte conceitual 3)'),
    ('Viego_King_Concept_01.jpg', 'runeterra', 'camavor', 'Viego, o rei (arte conceitual 1)'),
    ('Viego_King_Concept_02.jpg', 'runeterra', 'camavor', 'Viego, o rei (arte conceitual 2)'),
    ('Viego_Concept_02.jpg', 'runeterra', 'camavor', 'Viego (arte conceitual)'),
    ('Viego_LoR_Concept_01.jpg', 'runeterra', 'camavor', 'Viego, o Rei Arruinado (arte conceitual)'),
    ('Nilah_Concept_02.jpg', 'runeterra', 'kathkan', 'Nilah (arte conceitual 1)'),
    ('Nilah_Concept_04.jpg', 'runeterra', 'kathkan', 'Nilah (arte conceitual 2)'),
    ('Nilah_Concept_06.jpg', 'runeterra', 'kathkan', 'Nilah (arte conceitual 3)'),
    ('Nilah_Concept_07.jpg', 'runeterra', 'kathkan', 'Nilah: retrato (arte conceitual)'),
]

# Champions whose ddragon splash is outdated: use the current art from the Universe champion page.
UNIVERSE_SPLASH = {'fiddlesticks'}
# Champions whose splash art is wanted even though their Legends of Runeterra card art is already used elsewhere on the site.
FORCE_SPLASH = {'Nocturne'}
# Names that differ from the card (one card art for two forms of the same card).
RENAME = {'03MT059': 'A Irmã Dourada e A Irmã Prateada'}

# Relocations decided one by one against the Universe and the wiki (key of the picture -> region, group id | places | creatures).
# The card regions of Legends of Runeterra were chosen for gameplay and are not always the lore.
RELOCATE = {
    '09DE033': ('ionia', 'creatures'),  # ?
    '09DE036': ('ionia', 'creatures'),  # ?
    '09DE029': ('ionia', 'creatures'),  # ?
    '01DE049': ('freljord', 'creatures'),  # ?
    '03DE004': ('demacia', 'vanguard'),  # Capitã Arrika
    '04DE009': ('demacia', 'vanguard'),  # Cavaleiro Galante
    '01DE043': ('demacia', 'outros'),  # Chefs de Guerra
    '06DE006': ('demacia', 'outros'),  # Cozinheiro de Combate
    '01DE034': ('demacia', 'outros'),  # Ferreiro de Batalha
    '01DE052': ('demacia', 'vanguard'),  # Formação Aciária
    '01DE009': ('demacia', 'vanguard'),  # Protetora Aciária
    '06DE025': ('demacia', 'vanguard'),  # Recruta Benevolente
    '06DE019': ('demacia', 'outros'),  # Caçadora Viúva
    '01DE039': ('demacia', 'vanguard'),  # Cithria de Campinuvem
    '04DE005': ('demacia', 'vanguard'),  # Cithria, Dama das Nuvens
    '01DE051': ('demacia', 'vanguard'),  # Cithria, a Audaciosa
    '02DE010': ('demacia', 'rangers'),  # Genevieve Cordielmo
    '02DE004': ('demacia', 'rangers'),  # Guardião da Presa Verde
    '02DE008': ('demacia', 'rangers'),  # Companheiro Chifrídeo
    '03DE005': ('demacia', 'dragonguard'),  # Pesquisador Acadêmico
    '08DE006': ('demacia', 'dragonguard'),  # Pioneiro Erudito
    '07DE016': ('demacia', 'durand'),  # Balen, o Benevolente
    '06SI022': ('shadow-isles', 'revelry'),  # Amante Espectral
    '06SI009': ('shadow-isles', 'revelry'),  # Banda Assombrosa
    '06SI028': ('shadow-isles', 'revelry'),  # Mordomo Espectral
    '01SI038': ('shadow-isles', 'specters'),  # Fantasma Travessa
    '06SI016': ('shadow-isles', 'revelry'),  # Anfitrião Animado
    '06SI013': ('shadow-isles', 'revelry'),  # Eternas Dançarinas
    '06SI026': ('shadow-isles', 'revelry'),  # Regente das Névoas
    '09SI014': ('bandle', 'artists'),  # Tristálio
    '01SI007T1': ('shadow-isles', 'specters'),  # Espírito Libertado
    '01SI009': ('shadow-isles', 'specters'),  # Espíritos Agitados
    '01SI016': ('shadow-isles', 'specters'),  # Evocadora de Espectros
    '01SI044': ('shadow-isles', 'specters'),  # Matrona Espectral
    '06SI034': ('shadow-isles', 'specters'),  # Espectro dos Ecos
    '08SI003': ('noxus', 'ironlegion'),  # Espectros Agrilhoados
    '08SI018': ('shadow-isles', 'specters'),  # Espectrógrafo
    '07SI013': ('shadow-isles', 'specters'),  # Espectreva Proliferante
    '03SI015': ('shadow-isles', 'specters'),  # Observador Inoportuno
    '01SI041': ('shadow-isles', 'specters'),  # O Imortal
    '01SI048T1': ('shadow-isles', 'specters'),  # Aberração Liberta
    'u7e433b8800': ('shadow-isles', 'specters'),  # Além das Ilhas
    'u66e1d9c42d': ('shadow-isles', 'specters'),  # Igual Atrai Igual
    'u49f535288e': ('shadow-isles', 'specters'),  # Morte Eterna
    'u335e87cf52': ('shadow-isles', 'specters'),  # Obstinados
    'uf31b723fcc': ('shadow-isles', 'specters'),  # Viúva dos Cantos Esquecidos
    '01SI011': ('shadow-isles', 'specters'),  # Açougueiro Voraz
    '08SI007': ('noxus', 'ironlegion'),  # Legião dos Desgarrados
    '01SI031': ('shadow-isles', 'specters'),  # Precursor de Ferro
    '01SI035': ('shadow-isles', 'specters'),  # Rhasa, o Ruptor
    '06SI019': ('shadow-isles', 'specters'),  # Sultur
    '06SI046': ('shadow-isles', 'specters'),  # Vigilante Determinado
    '05SI004': ('shadow-isles', 'specters'),  # Vigilante das Ilhas
    '06SI041': ('shadow-isles', 'specters'),  # Vigilante do Vale Enluarado
    '01SI058': ('shadow-isles', 'specters'),  # Mensageiro Etéreo
    '09SI017': ('shadow-isles', 'specters'),  # Kharox
    '04SI045': ('shadow-isles', 'specters'),  # Névoa Invasora
    '01SI014': ('shadow-isles', 'specters'),  # Espectro da Névoa
    '05SI013': ('shadow-isles', 'specters'),  # Guardiões da Névoa
    '02SI004': ('shadow-isles', 'helia'),  # Defensora Arruinada
    '04SI013': ('runeterra', 'legends'),  # Mãe Mascarada
    '04SI014': ('runeterra', 'legends'),  # Presa
    '04SI004': ('runeterra', 'legends'),  # As Asas e a Onda
    '08SI015': ('noxus', 'ironlegion'),  # Amálgama de Ritos Vis
    '03SI001': ('shadow-isles', 'creatures'),  # ?
    '01SI004': ('shadow-isles', 'creatures'),  # ?
    '02SI010': ('shadow-isles', 'creatures'),  # ?
    '01FR021': ('freljord', 'wanderers-fr'),  # Tarkaz, o Desgarrado
    '01FR007': ('freljord', 'wanderers-fr'),  # Bjerg Balbuciador
    '01FR050': ('freljord', 'avarosan'),  # Taverneiro Gentil
    '01FR025': ('freljord', 'wanderers-fr'),  # Pastor de Poros
    '07FR015': ('freljord', 'wanderers-fr'),  # Ingvar, a Jovem
    '06FR028': ('freljord', 'avarosan'),  # Revna, a Guardiã Mitológica
    '03FR011': ('freljord', 'trolls'),  # Uzgar, o Ancião
    '05FR001T1': ('freljord', 'old-gods'),  # Combatente Trevoguari
    '05FR004': ('freljord', 'old-gods'),  # Errante Vulpina
    '01FR047': ('freljord', 'ursine'),  # Místico Selvagem
    '06FR030': ('freljord', 'creatures'),  # ?
    '08FR015': ('freljord', 'old-gods'),  # Rhond, a Serpente de Magma
    '01IO005': ('freljord', 'creatures'),  # ?
    '03IO008T1': ('bandle', 'creatures'),  # ?
    '03IO011': ('bandle', 'creatures'),  # ?
    '03IO001': ('bandle', 'creatures'),  # ?
    '03IO007T1': ('bandle', 'creatures'),  # ?
    '03IO009': ('bandle', 'creatures'),  # ?
    '03IO017': ('bandle', 'fae'),  # Pix!
    '03IO003': ('bandle', 'fae'),  # Guia Feérico
    '03IO018': ('bandle', 'fae'),  # Cuidador Felpudo
    '01IO008': ('bandle', 'fae'),  # Fada das Lâminas
    '03IO010': ('bandle', 'fae'),  # Jovem Bruxa
    '03IO007': ('bandle', 'fae'),  # Trevor Dorminhão
    '01IO036': ('bandle', 'fae'),  # Vigia da Clareira Verdejante
    '01IO031': ('ionia', 'creatures'),  # ?
    '04IO020': ('ionia', 'creatures'),  # ?
    '04IO015': ('ionia', 'creatures'),  # ?
    '06IO004': ('ionia', 'artists'),  # A Criadora
    '06IO015': ('ionia', 'artists'),  # A Testemunha
    '04IO002': ('ionia', 'dancers'),  # Zinneia, Crescendo de Aço
    '04IO009': ('ionia', 'dancers'),  # Dançarina das Fitas
    '04IO001': ('ionia', 'dancers'),  # Músicos de Batalha
    '06IO044': ('ionia', 'artists'),  # Melodia Celeste
    '06IO003': ('ionia', 'artists'),  # A Contrarregra
    '01IO014': ('ionia', 'spirits'),  # Ancião da Clareira Verdejante
    '01IO019': ('ionia', 'spirits'),  # Defensora da Clareira Verdejante
    '01IO006': ('ionia', 'spirits'),  # Dupla da Clareira Verdejante
    '05IO001': ('ionia', 'spirits'),  # Guardiã do Arvoredo
    '01IO023': ('ionia', 'spirits'),  # Protetora Adornada
    '01IO043': ('ionia', 'spirits'),  # Moldador de Rios
    '01IO053': ('ionia', 'spirits'),  # Evocador Esmeralda
    '01IO045': ('ionia', 'spirits'),  # Arauto da Primavera
    '05IO006T1': ('ionia', 'spirits'),  # Guardião Fronteiriço
    '05IO026': ('ionia', 'spirits'),  # Os Lamentados
    '09IO046': ('ionia', 'spirits'),  # Jardineira Ophelis
    '09IO053': ('ionia', 'spirits'),  # Dona Raiz
    '09IO055': ('ionia', 'spirits'),  # Fadinha Floral
    '05IO003': ('ionia', 'spirits'),  # Ancestral Sem Rumo
    '01NX034': ('freljord', 'creatures'),  # ?
    '06NX031': ('freljord', 'creatures'),  # ?
    '05NX005': ('noxus', 'crimson'),  # Belicista Ancestral
    '05NX016': ('noxus', 'crimson'),  # A Senhora do Sangue
    '05NX006': ('noxus', 'crimson'),  # Granadeiro Renascido
    '05NX009': ('noxus', 'crimson'),  # Alma Perdida
    '07NX015': ('noxus', 'renegades'),  # A Dama Saqueadora
    '07NX005': ('noxus', 'renegades'),  # Capitã Indari
    '08NX012': ('noxus', 'renegades'),  # Obtentor Armado
    '07NX004': ('noxus', 'renegades'),  # Artífice Astuta
    '02NX010': ('noxus', 'trifarian'),  # Montapresa Encouraçado
    '06NX015': ('noxus', 'floricorvus'),  # Estudante Manalma
    '06NX028T1': ('noxus', 'floricorvus'),  # Tybaulk
    '07PZ021': ('piltover', 'explorers'),  # Anura e Froop
    '01PZ015': ('piltover', 'hextech'),  # T-Hex
    '01PZ059': ('piltover', 'hextech'),  # Esmagobô Dourado
    '03PZ019': ('piltover', 'hextech'),  # Porobot Recauchutado
    '08PZ025': ('piltover', 'hextech'),  # Protótipo de Porobot
    '01PZ020': ('freljord', 'creatures'),  # ?
    '07PZ017': ('piltover', 'hextech'),  # Comerciante de Bombas de Clarão
    '01PZ025': ('zaun', 'sump'),  # Comerciante de Cogumelos
    '01PZ017': ('zaun', 'sump'),  # Vendedor de Barris Usados
    '08PZ024': ('zaun', 'sump'),  # Peixeiro Picareta
    '06PZ042': ('zaun', 'firelights'),  # Imperfeccionista Maligna
    '06PZ021T2': ('piltover', 'seraphine'),  # Seraphine
    '06PZ014': ('piltover', 'seraphine'),  # Presidente do Fã-clube
    '08PZ006': ('bilgewater', 'creatures'),  # ?
    'lmel': ('noxus', 'houses'),  # Mel
    '04PZ016': ('zaun', 'creatures'),  # ?
    '08PZ008': ('zaun', 'firelights'),  # Maryam, a Protetora do Templo
    '05PZ012': ('piltover', 'wardens'),  # Arquivista da Delegacia
    '05PZ009': ('piltover', 'wardens'),  # Policial Infiltrado
    '01PZ051': ('zaun', 'chempunks'),  # Malucânica
    '01PZ007': ('zaun', 'chempunks'),  # Carro Alegórico
    '05BC160': ('freljord', 'creatures'),  # ?
    '05BC140': ('freljord', 'creatures'),  # ?
    '06BC016': ('bandle', 'fae'),  # Biblioteca Viva
    '05BC020': ('bandle', 'fae'),  # Bibliotecária Assistente
    '07BC018': ('bandle', 'fae'),  # Estudioso do Portal
    '07BC005': ('bandle', 'fae'),  # Fada das Lâminas Esculpida
    '06BC024': ('bandle', 'fae'),  # Guia do Reino
    '05BC183': ('bandle', 'fae'),  # Vovô Feérico
    '05BC066': ('bandle', 'fae'),  # Pena Rápida
    '05BC005': ('bandle', 'fae'),  # Donzelas das Algas
    '06BC026': ('bandle', 'fae'),  # Byrdo, Tocante de Sinos
    '06BC031': ('bandle', 'fae'),  # Maduli, Guarda do Portão
    '07BC020': ('bandle', 'fae'),  # Senhor Catatreco
    '05BC057': ('bandle', 'gloom'),  # Alfaiate Esnobe
    '05BC096': ('bandle', 'gloom'),  # Tenor do Terror
    '05BC119': ('bandle', 'gloom'),  # Tropa
    '09BC003': ('bandle', 'gloom'),  # Presente Grotesco
    '09BC004': ('bandle', 'gloom'),  # Sossega o Facho
    '05BC098': ('bandle', 'gloom'),  # Catalisador Desequilibrado
    '05BC070': ('bandle', 'squads'),  # Ava Dedicada
    '05BC049': ('bandle', 'squads'),  # Conquiliologista
    '05BC129': ('bandle', 'citizens'),  # Mandante da Arena
    '05BC091': ('bandle', 'citizens'),  # Promoter da Arena
    '09BC006': ('bandle', 'citizens'),  # Prefeito Bombadão
    '05BC116': ('bandle', 'citizens'),  # Prefeito de Bandópolis
    '09BC002': ('bandle', 'citizens'),  # Tio Milty
    '05BC086': ('bandle', 'inventors'),  # Abalante
    '05BC079': ('bandle', 'inventors'),  # Escavinho
    '05BC080': ('bandle', 'inventors'),  # Ligeirinho e Bofetão
    '05BC170': ('bandle', 'inventors'),  # Ranzinzim Destruidor
    '05BC173': ('bandle', 'inventors'),  # Roleta Marítima
    '05BC082': ('bandle', 'inventors'),  # Segurança e Parafuso
    '05BC089': ('bandle', 'inventors'),  # Tectrompete
    '05BC050': ('bandle', 'creatures'),  # ?
    '05BC084': ('bandle', 'creatures'),  # ?
    '05BC010T1': ('bandle', 'creatures'),  # ?
    '05BC106': ('bandle', 'creatures'),  # ?
    '02BW010': ('freljord', 'creatures'),  # ?
    '08MT031': ('targon', 'ottrani'),  # Adorante de Dragões Ottrani
    '09MT005': ('targon', 'ottrani'),  # Sonhadora da Canção Dracônica
    '03MT014': ('targon', 'ottrani'),  # Arauta dos Dragões
    '03MT220': ('targon', 'lunari'),  # A Encruzilhada
    '06MT038': ('targon', 'lunari'),  # A Luz Sinuosa
    '03MT221': ('targon', 'lunari'),  # As Presas
    '03MT216': ('targon', 'lunari'),  # Sombras Celestes
    '03MT092': ('targon', 'creatures'),  # ?
    '03MT001': ('targon', 'creatures'),  # ?
    '06MT004': ('targon', 'rakkor'),  # Pastor Errante
    '03MT080': ('targon', 'rakkor'),  # Guardião da Nascente
    '03MT079': ('targon', 'aspects'),  # Pestinha Estelar
    '06MT053': ('targon', 'aspects'),  # Artesã Generosa
    '03MT048': ('targon', 'aspects'),  # Doadora de Dádivas
    '08MT045': ('demacia', 'mageseekers'),  # Conjurador Acorrentado
    '08MT024': ('demacia', 'mageseekers'),  # Conjurador do Olho-Rubi
    '04SH049': ('freljord', 'creatures'),  # ?
    '04SH049T1': ('freljord', 'creatures'),  # ?
    '04SH009': ('shurima', 'baccai'),  # Baccai Enfurecido
    '06SH005': ('shurima', 'baccai'),  # Baccai Esquecido
    '04SH002': ('shurima', 'baccai'),  # Ceifeiro Baccai
    '06SH037': ('shurima', 'baccai'),  # Definharra Baccai
    '04SH081': ('shurima', 'baccai'),  # Fiandeira Baccai
    '04SH097': ('shurima', 'baccai'),  # Guardiã do Sacrário
    '05SH014T1': ('shurima', 'xerath'),  # Xerath
    '05SH014T2': ('shurima', 'xerath'),  # Xerath
    '05SH016': ('shurima', 'xerath'),  # Acólito Ruinoso
    '05SH002': ('shurima', 'xerath'),  # Errante das Ruínas
    '05SH012T1': ('shurima', 'xerath'),  # Dami'yin, o Liberto
    '05SH017': ('shurima', 'xerath'),  # Arauta do Mago
    '05SH011': ('shurima', 'xerath'),  # Devoto Eterno
    'lnaafiri': ('runeterra', 'rt-darkin'),  # Naafiri
    '06SH004T1': ('runeterra', 'rt-darkin'),  # Servo Darkin
    '04SH091': ('shurima', 'time'),  # Khahiri, o Aluno
    '04SH021': ('shurima', 'time'),  # Khahiri, o Regressado
    '07SH023': ('shurima', 'empire'),  # General das Areias Caídas
    '04SH003T8': ('shurima', 'empire'),  # Gladiador Eterno
    '04SH077': ('shurima', 'empire'),  # Voz dos Reerguidos
    '06SI031T1': ('void', 'icathia'),  # Miragem Icathiana
    '04SH076T1': ('shurima', 'places'),  # ?
    '07RU015': ('freljord', 'creatures'),  # ?
    '07RU015T4': ('freljord', 'creatures'),  # ?
    '05BC041T1': ('demacia', 'outros'),  # Poppy
    '05BC163T1': ('zaun', 'chempunks'),  # Ziggs
    '05BC006': ('zaun', 'chempunks'),  # O Arsenal
    '06MT008': ('demacia', 'outros'),  # Kayle
    '06MT008T2': ('demacia', 'outros'),  # Kayle
    '06MT018': ('targon', 'aspects'),  # Guardião da Lei
    '01NX055': ('shadow-isles', 'spider'),  # Aranha Doméstica
    '01NX023': ('shadow-isles', 'spider'),  # Anfitriã Aracnídea
    '01NX046': ('shadow-isles', 'spider'),  # Vigia Aracnídea
    '04NX016': ('shadow-isles', 'spider'),  # Fiandeira Estridente
    '01SI056': ('shadow-isles', 'spider'),  # Predadora Desenfreada
    '07SI010': ('shadow-isles', 'spider'),  # Aracnídeo Necrótico
    '06NX044': ('shadow-isles', 'spider'),  # Urdidora Sorrateira
    '01SI002': ('shadow-isles', 'spider'),  # Cria Aracnídea
    '01SI053T2': ('shadow-isles', 'spider'),  # Elise, a Aranha Rainha
    '01SI039': ('shadow-isles', 'spider'),  # Terror Aracnídeo
    '01NX015': ('shadow-isles', 'spider'),  # Cria Preciosa
    '07SI012': ('shadow-isles', 'spider'),  # Caranguejeira Fiandeira
    '01SI027T1': ('shadow-isles', 'spider'),  # Maldíbula
    '08SI026': ('noxus', 'ironlegion'),  # Cultista do Aperto Mortal
    '06SI006': ('ionia', 'shadow'),  # Guardiã da Caixa
    '01SI043': ('shadow-isles', 'outros'),  # Aristocrata Azarado
    '01SI012': ('shadow-isles', 'outros'),  # Pescador Distraído
    '04SI005T1': ('runeterra', 'legends'),  # Kindred
    '04SI007': ('runeterra', 'legends'),  # O Demônio Etéreo
    '04SI012': ('runeterra', 'legends'),  # Raposa Astral
    '04SI009': ('runeterra', 'legends'),  # Fiandeiro de Almas
    '04SI003': ('runeterra', 'legends'),  # Ícone Decadente
    '01SI052': ('shadow-isles', 'helia'),  # Thresh
    '01SI052T1': ('shadow-isles', 'helia'),  # Thresh
    'ua1295d0f5d': ('shadow-isles', 'helia'),  # Thresh
    '01SI023': ('shadow-isles', 'helia'),  # Pastora de Almas
    'u9b0c6033a8': ('shadow-isles', 'helia'),  # Pastor de Almas
    '01SI026': ('shadow-isles', 'helia'),  # Presa do Guardião
    '08SI037T1': ('noxus', 'ironlegion'),  # Ocasoquilador das Mil Garras
    '09SI013': ('noxus', 'ironlegion'),  # A Conquista de Ferro
    '05SI010': ('shadow-isles', 'sentinels'),  # Dess e Ada
    '06SI003': ('void', 'icathia'),  # Fireth, a Ceifadora das Areias
    '01SI020': ('shadow-isles', 'specters'),  # O Reacendedor
    '06SI038': ('shadow-isles', 'revelry'),  # Prodígio Redimido
    '09DE031': ('demacia', 'outros'),  # Jarro Plumaluz
    '01DE015': ('demacia', 'vanguard'),  # Guardiã Radiante
    '09DE039': ('drop', 'drop'),  # ?
    'uc8d4b4194d': ('demacia', 'places'),  # ?
    '08DE022': ('demacia', 'outros'),  # O Martim-Pescador
    '05DE012': ('demacia', 'durand'),  # Asalonga de Petricita
    '05DE013': ('demacia', 'durand'),  # Cervo de Petricita
    '05DE018': ('demacia', 'durand'),  # Cão de Petricita
    '06DE044': ('demacia', 'durand'),  # Touro de Petricita
    '01DE004': ('demacia', 'rangers'),  # Vanguarda de Rapinas Prateadas
    '06DE010': ('ionia', 'shadow'),  # Desertora dos Cavaleiros-Patrulheiros
    '04IO010': ('drop', 'drop'),  # ?
    '01IO021': ('ionia', 'creatures'),  # ?
    '05IO020': ('ionia', 'vastaya'),  # Cantaventos
    '07IO023': ('ionia', 'pit'),  # Veterano
    '07IO014': ('ionia', 'pit'),  # Mestre Bingwen, o Analista
    'lsyndra': ('ionia', 'outros'),  # Syndra
    '04IO005': ('ionia', 'dancers'),  # Irelia
    '04IO005T2': ('ionia', 'dancers'),  # Irelia
    '04IO013': ('ionia', 'creatures'),  # ?
    '06NX023': ('ionia', 'outros'),  # Pescadora Ioniana
    '06NX019': ('ionia', 'shadow'),  # Desertor Noxiano
    '02FR001': ('freljord', 'winters-claw'),  # Guerreira Incandescente
    '08FR033': ('freljord', 'old-gods'),  # Berserker Vinculâmina
    '05FR014': ('freljord', 'old-gods'),  # Ira de Freljord
    '08FR002': ('freljord', 'ursine'),  # Profetisa de Valhir
    '08FR011': ('freljord', 'ursine'),  # Caprina Chamabrasas
    '04PZ012': ('zaun', 'firelights'),  # Perfeccionista Prática
    '06PZ020': ('piltover', 'seraphine'),  # Bolota, o Hextécnico
    '06PZ010': ('piltover', 'seraphine'),  # Acusticista
    '01PZ021': ('zaun', 'barons'),  # Capangas de Midenstokke
    '06PZ025': ('zaun', 'sump'),  # Solidão
    'u1bace67821': ('piltover', 'places'),  # ?
    'u865c7bec6d': ('piltover', 'places'),  # ?
    '07PZ015T1': ('piltover', 'hextech'),  # Bugiganga Fujona
    '01PZ045': ('zaun', 'sump'),  # Pedinte Zaunita
    '04SH003T14': ('shurima', 'empire'),  # Combatente de Arenito
    '04SH046': ('shurima', 'empire'),  # Quimera de Arenito
    '04SH072': ('shurima', 'empire'),  # Profetisa
    '07SH039': ('piltover', 'outros'),  # Soldado Adaptável
    '07SH005': ('piltover', 'outros'),  # Magnata Magnânimo
    '04SH041': ('shurima', 'taliyah'),  # Vigilante do Sai
    '04SH089': ('shurima', 'taliyah'),  # Naturalista do Deserto
    '06SH051': ('shurima', 'taliyah'),  # Pastora de Pedregursos
    '05SH015': ('shurima', 'xerath'),  # Vidente das Areias
    '04SH042': ('shurima', 'creatures'),  # ?
    'u65e3c56b81': ('shurima', 'creatures'),  # ?
    '04SH011': ('shurima', 'time'),  # Pesquisadoras de Xenótipo
    '05BW004': ('targon', 'marai'),  # Avatar das Marés
    '05BW010': ('targon', 'marai'),  # Grande Mãe Marai
    '05BW008': ('targon', 'marai'),  # Guarda Abissal
    '06BW047': ('targon', 'marai'),  # Marai Arteira
    '05BW005T1': ('targon', 'marai'),  # Nami
    '05BW001': ('targon', 'marai'),  # Vigia Marai
    'wfb0daf437a': ('targon', 'marai'),  # Marai (arte conceitual 1)
    'w46dfca26a8': ('targon', 'marai'),  # Marai (arte conceitual 2)
    'w670fc6a88f': ('targon', 'marai'),  # Marai (arte conceitual 3)
    '05BW002': ('targon', 'marai'),  # Aventureiro Saltareias
    '08BW036': ('targon', 'places'),  # ?
    '06SH008': ('void', 'touched'),  # Anciã Belvethiana
    '06SH016': ('void', 'prophets'),  # Arauto do Enxame
    'u9af8e4424e': ('bilgewater', 'places'),  # ?
    '06NX012T7': ('noxus', 'floricorvus'),  # Annie
    '06NX012T1': ('noxus', 'floricorvus'),  # Tibbers
    '06NX013': ('noxus', 'floricorvus'),  # Lançador de Feitiços
    '06NX008': ('noxus', 'floricorvus'),  # A Monitora
    '08NX014': ('noxus', 'floricorvus'),  # Diretora Telsi
    '05NX001T3': ('noxus', 'crimson'),  # Sion
    '05NX001T1': ('noxus', 'crimson'),  # Sion Reanimado
    '03NX009': ('noxus', 'crimson'),  # Cavaleira Colérica
    '05NX013': ('noxus', 'crimson'),  # Cavaleiro Caído
    '05NX018': ('noxus', 'crimson'),  # Cavaleiro Reerguido
    '05NX015': ('noxus', 'crimson'),  # Desafiador Caído
    '05NX002': ('noxus', 'crimson'),  # Nobre Rebelde
    '08SI042': ('noxus', 'ironlegion'),  # Mordekaiser
    '08SI042T1': ('noxus', 'ironlegion'),  # Mordekaiser
    '08NX024': ('noxus', 'ironlegion'),  # Legionário de Ferro
    '08NX025': ('noxus', 'ironlegion'),  # Revenã Terebrado
    '03NX003': ('noxus', 'trifarian'),  # Escudeiro da Lâmina
    '07NX007': ('noxus', 'renegades'),  # Samira
    '07NX007T1': ('noxus', 'renegades'),  # Samira
    '03NX002': ('noxus', 'trifarian'),  # Arrel, a Rastreadora
    '01NX008': ('noxus', 'trifarian'),  # Basilisqueiro
    '09NX032': ('noxus', 'trifarian'),  # Domador de Yetis
    '03NX005': ('noxus', 'trifarian'),  # Caçadora Brutal
    '04NX007': ('noxus', 'blackrose'),  # Atakhan, Emissário da Devastação
    '04NX008': ('noxus', 'blackrose'),  # Estrategista Indomável
    '02NX007': ('noxus', 'trifarian'),  # Swain
    '02NX007T2': ('noxus', 'trifarian'),  # Swain
    '06SH010': ('void', 'touched'),  # Detonadora do Vazio
    '05NX007': ('noxus', 'crimson'),  # Revenã das Lâminas Gêmeas
    'u70b2411b1d': ('noxus', 'ironlegion'),  # Camadas da História
    '04DE020': ('shadow-isles', 'specters'),  # Dracoguarda Destruído
    '04DE016': ('shadow-isles', 'specters'),  # Kadregrin, o Destruído
    '04NX022': ('shadow-isles', 'specters'),  # Desafiadora Destruída
    '04BW016': ('shadow-isles', 'specters'),  # Rex Destruído
    '04PZ015': ('piltover', 'hextech'),  # Adaptatron 3000
    'lorianna': ('piltover', 'hextech'),  # Orianna
    '01PZ035': ('piltover', 'explorers'),  # Jae Medarda
    '08PZ020': ('piltover', 'creatures'),  # ?
    '01PZ009': ('piltover', 'academy'),  # Aeronauta Amador
    '05PZ022T1': ('piltover', 'academy'),  # Jayce
    '06RU005T8': ('ionia', 'shadow'),  # Kayn
    '06RU005T1': ('ionia', 'shadow'),  # O Assassino das Sombras
    '07IO043': ('ionia', 'monks'),  # Oráculo Que Tudo Vê
    '04IO004': ('ionia', 'dancers'),  # Lâmina Florescente
    '01IO048': ('ionia', 'shadow'),  # Yusari
    '06FR040': ('freljord', 'creatures'),  # ?
    '09DE045': ('demacia', 'mageseekers'),  # Alina Sonhaluz
    '08SI037': ('noxus', 'ironlegion'),  # Caniferrus Espectral
    '07SH003': ('piltover', 'outros'),  # Furtivista de Dirigível
    '03BW002': ('bilgewater', 'underworld'),  # Lagarto Boêmio
    'lkarthus': ('shadow-isles', 'specters'),  # Karthus
}
