/* World lore panel: Runeterra background for players (translated from the campaign's lore notes). */
(() => {
  'use strict';

  const SECTIONS = [
    { id: 'planet', group: 'The World', title: 'The Planet', body: `
      <p>Runeterra shares many characteristics with Earth, but nothing is currently known about the other planets of its solar system. It is a naturally magical world, above all because the <b>World Runes</b> are foundations of the world itself: their resonance reaches every living being and grants them extraordinary abilities.</p>
      <p>The two continents we focus on are <b>Valoran</b> and <b>Shurima</b>, home to most of the regions, countries, city-states and other organised societies of living beings (not always human). Beyond these two continents lie <b>Ionia</b>, an island continent, and archipelagos such as <b>Bilgewater</b> and <b>the Shadow Isles</b>.</p>
      <p>What is known of Runeterra today covers only about <b>one sixth</b> of the world, mostly in the northern hemisphere. The rest remains practically unknown.</p>` },
    { id: 'runes', group: 'The World', title: 'World Runes', body: `
      <p>Centuries ago, magical artefacts known as the <b>World Runes</b> were rediscovered. In the following decades, knowledge of the Runes grew as more of them were found. The brightest minds in the world studied the ancient glyphs, trying to determine what powers they held. Few could even grasp the importance of their origins or the absolute power they contained.</p>
      <p>Some came to believe the Runes were an integral part of the creation of Runeterra itself. The first uses of these mysterious artefacts proved catastrophic, completely reshaping the landscape of entire nations. Distrust spread quickly as those who knew of the Runes realised such "powers of creation" could be used as weapons. The conflicts that followed became known as <b>the Rune Wars</b>.</p>
      <p>War spread across Runeterra. The first horrors of the Rune Wars bred fear and aggression among those who now understood the power at their command. Scholars say a mage named <b>Ryze</b> and his master <b>Tyrus</b> sought to lock the World Runes away from mortal reach to protect Runeterra. Where the Runes are now is a great mystery, and rumour has it that Ryze still lives, continuing his mission to keep them hidden.</p>` },
    { id: 'realms', group: 'The World', title: 'Realms of Existence', body: `
      <h4>The Material Realm</h4>
      <p>Also called the Elemental Realm, the Material Realm is the physical realm where elements, ideas and spirits manifest. It is also home to mortal creatures, subject to the passage of time and destined to have a brief story amid the vastness of the world. Humans, minotaurs or vastaya: these intelligent humanoid species can be found in every kind of existence.</p>
      <h4>The Spirit Realm</h4>
      <p>The Spirit Realm runs parallel to the Material Realm, and in some places the two can blend together, as in <b>Ionia</b>. There the veil between the realms is thinner, and spirits directly influence local life, both fauna and flora, bringing abundant magic to the land.</p>
      <h4>The Celestial Realm</h4>
      <p>The Celestial Realm, often called the <b>City of Gold and Silver</b>, is a realm beyond Runeterra. Its entrance lies at the summit of <b>Mount Targon</b>, which also serves as the passage for celestial beings into the Material Realm. It is a vast expanse bathed in golden light by day and glittering stars by night.</p>
      <h4>The Void</h4>
      <p>The Void is not a place but what exists <b>between</b> the realms. It has no connection to any specific realm, but it can connect to the Material Realm. There, the hunger to consume is eternal, and every creature born of it when it manifests in the material world shares that hunger. These creatures are known as the <b>Voidborn</b>. Each Voidborn tribe expresses the hunger differently: as food, as evolution through assimilation, or as knowledge through disintegration.</p>` },
    { id: 'primordial', group: 'Timeline', title: 'The Primordial Age', body: `
      <p>The vast period before all recorded history in Runeterra, spanning the creation of the Celestial Realm, the Spirit Realm and the Physical Realm. Before time or space existed, there was only the nothingness of the Void, home to formless entities known as the <b>Watchers</b>.</p>
      <p>That emptiness was consumed by the sudden emergence of reality, giving birth to the universe. Within this universe, the "breath of creation" shaped the Celestial Realm, where <b>Aurelion Sol</b>, a great dragon and father of the cosmos, began to fill the void, forging the first stars and constellations.</p>
      <p>The planet Runeterra was formed when unknown celestial beings used the World Runes to try to create a realm separate from the Celestial. Although the work was interrupted, the Runes were scattered across the world, and the unfinished creation formed the physical and spiritual realms. The Spirit Realm arose as a domain of spirits rich in primordial magic, separated from the Physical Realm by an intangible "veil".</p>
      <p>In this age, many primordial spirits appeared: demons, gods, demigods and yordles. Many of these beings shaped the planet's geography. The first long-lived beings to arise were the <b>Earth Dragons</b>, who imitated the forms of the celestial dragons, and the <b>Brackern</b> clans, scorpion-like creatures. Finally, <b>humans</b> appeared and spread across the world, settling in regions such as Camavor and the Vorrijaard (now the Freljord), where they came to worship the demigods and beings who had shaped the land. Other beings, such as yeti, the Vastayashai'rei, trolls and minotaurs, also formed in this age.</p>` },
    { id: 'titans', group: 'Timeline', title: '~9000 BN — War of the Titans', body: `
      <p>A terrible war between mortals and a race of sky giants ravaged the island continent now known as Ionia. Victory finally came only through the intervention of the <b>Vastayashai'rei</b>, powerful legendary beings who live in the material and spirit realms at once.</p>
      <p>The war began when a race of <b>Titans</b>, described as sky giants, descended upon the First Lands (Ionia). Their size and power were so vast that the mortal forces of the time were completely overwhelmed and unable to put up any real resistance. The exact reasons for their descent and aggression have been forgotten over the millennia.</p>
      <p>In utter desperation to avoid extinction, the most "enlightened" mortals took a drastic step: they drew the power of the Spirit Realm into themselves. The humans who absorbed this magic became the Vastayashai'rei, immortal shapeshifters able to wield the forces of nature as living weapons against the invaders.</p>
      <p>After countless brutal battles across the Ionian archipelago, the Vastayashai'rei were victorious and drove the Titans to total extinction. When the war ended, these powerful beings chose not to rule ordinary humans, but to live among them in harmony.</p>` },
    { id: 'sisters', group: 'Timeline', title: '~8000 BN — War of the Three Sisters', body: `
      <p>In ancient times, in the Vorrijaard (now the Freljord), three sisters were born: <b>Avarosa</b>, <b>Serylda</b> and <b>Lissandra</b>. Born into a world of wild magic, all three devoted their lives to finding a way to control the world's powerful magical forces. Serylda tried to command the skies above them, but lost her voice. At the first dusk, Avarosa stared into the twisting darkness beneath the world and was deafened by its emptiness. Lissandra opposed the world's wild magic, seeking to control the natural magic of the demigods themselves, and lost her sight in a confrontation with <b>Volibear</b>, god of thunder. She made pacts with beings of the Void called the <b>Watchers</b> to gain magic and immortality.</p>
      <p>A rift opened between the sisters and soon became a war. The final battle took place at the gates of Lissandra's citadel, where she sacrificed many allies and her own sisters to entomb the Watchers in <b>True Ice</b>, and worked with <b>Ornn</b>, god of the forge, to build a "prison" around them and prevent the destruction of Runeterra. To this day, the land remains divided into three factions descended from the three sisters.</p>` },
    { id: 'migration', group: 'Timeline', title: '6000–5000 BN — The Westward Migration', body: `
      <p>Settlers from the forgotten continents of the far east reached the shores of Shurima and Valoran, bringing ancient knowledge and wisdom with them. Their descendants would later be among the leaders of the greatest civilisations ever to inhabit Runeterra.</p>
      <h4>Founding of Buhru Island</h4>
      <p>A group of humans called the <b>Buhru</b> settled in the Serpent Isles, worshipping — and eventually learning to channel — the immensely powerful spirit god <b>Nagakabouros</b>.</p>
      <h4>Founding of the Blessed Isles</h4>
      <p>An enlightened society of scholars devoted to studying the mysteries of the world formed on the <b>Blessed Isles</b> after an encounter with the nature spirit <b>Maokai</b>, who gave them knowledge and the location of the blessed <b>Waters of Life</b> as a gift for their respect for the land and its magic.</p>
      <h4>Founding of Ixtal</h4>
      <p>The <b>Cardinal Arcology</b>, in what would become Ixaocan, was built by <b>Skarner</b>, a Brackern, as a gift to the people of Ixtal. Its inhabitants devoted themselves to mastering elemental magic, and the brightest of these practitioners, together with Skarner, became the first generation of the <b>Yun Tal</b>.</p>
      <h4>Founding of Faraj</h4>
      <p>The nation of <b>Faraj</b> was founded in the deserts of the south-west of the Shuriman continent. Its territory eventually stretched east to the slopes of Mount Targon, where the Faraj people founded the city of <b>Nerimazeth</b>. Over a thousand years, Nerimazeth grew in power and influence, giving rise to one of the first Faraj nations — <b>Shurima</b> — with Nerimazeth as its original capital.</p>
      <h4>Founding of the Targonian Tribes</h4>
      <p>Mortals discovered Mount Targon and created a tribal theocracy centred on the celestial powers that made the mountain, coming into contact with the <b>Aspects</b>.</p>
      <h4>Founding of Oshra Va'Zaun</h4>
      <p>A seaport was built between Valoran and the Shuriman continent. Its people came to worship the spirit of the wind, <b>Jan'ahrem</b> — an ancient Shuriman word meaning "guardian" — because she always seemed to appear in times of great need. Over time she became known more simply as <b>Janna</b>.</p>
      <h4>Founding of the Kingdom of Icathia</h4>
      <p>The Icathian magocracy was founded in the southern part of the Shuriman continent under its first <b>Mage-King</b>.</p>` },
    { id: 'golden-age', group: 'Timeline', title: '5000–2500 BN — The Golden Age of Shurima', body: `
      <p>With the help of the Aspects of Targon, the ancient Shurimans built the first <b>Sun Disc</b> in Nerimazeth to create the first <b>Ascended</b>, noble beings worshipped as living gods.</p>
      <h4>3400 BN</h4>
      <p>For unknown reasons, the Sun Disc was destroyed. A second, far larger Sun Disc was raised with the help of Ixtali mages. From this structure sprang the <b>Oasis of the Dawn</b>, whose magical waters transformed the desert and created the <b>Mother of Life</b> river system, which could sustain an immense population.</p>
      <p>In this period, with its Ascended warriors, Shurima expanded aggressively, absorbing nations such as Ixtal and Oshra Va'Zaun. Shurima also conquered Icathia after King <b>Axamuk</b> tried, unsuccessfully, to plead for peaceful coexistence.</p>` },
    { id: 'icathia', group: 'Timeline', title: '2500–2000 BN — The Icathian Rebellion and the Void Unleashed', body: `
      <p>Icathia, then a province of the Shuriman Empire, rebelled against cultural oppression and imperial tyranny.</p>
      <p>The rebellion officially began with the crowning of a new Mage-King and the restoration of the <b>Kohari Order</b>, whose warriors went as far as sacking Shuriman settlements and beheading a warrior-god at Bai-Zhek.</p>
      <p>In response, Shurima sent an army led by ten <b>warrior-gods</b>, including <b>Aatrox</b> and <b>Setaka</b>. During the siege of Icathia's walls, the rebel mages, in an act of desperation, unleashed the power of <b>the Void</b>. It became uncontrollable, destroying Icathia's towers and corrupting the land forever.</p>` },
    { id: 'fall-shurima', group: 'Timeline', title: '2000 BN — The Fall of Shurima', body: `
      <p>After the fall of Icathia, a centuries-long war began to contain the corruption.</p>
      <p>An Ixtali elemental mage named <b>Ne'Zuk</b> created a flying stone fortress called the <b>Monolith</b> to fight the Void, but it was eventually destroyed.</p>
      <p>The warrior-god <b>Horok</b> struck the first decisive blow, facing the Void in its depths with the <b>Aether Blade</b>. Eventually the Ascended sealed the <b>Great Rift</b> created during the Rebellion, and those who survived that war came to call themselves the <b>Sunborn</b>.</p>
      <p>The emperor of Shurima at that time, <b>Azir</b>, sought to perform the ritual of Ascension to become an immortal ruler and raise Shurima to new heights. <b>Xerath</b>, a slave and Azir's childhood friend, secretly plotted to usurp the ritual. At the crucial moment, Xerath pushed Azir from the pedestal, letting the emperor be consumed by the solar flames, and took the power for himself.</p>
      <p>Because the ritual was not meant for Xerath, the celestial energy exploded violently, obliterating the capital and letting the desert swallow the city in a single day. The Sun Disc fell and the empire immediately fractured.</p>
      <p>Two other warrior-gods, <b>Nasus</b> and <b>Renekton</b>, returned to the ruins and confronted Xerath. Unable to destroy him, Renekton dragged Xerath into the <b>Tomb of the Emperors</b> and ordered Nasus to seal the door, trapping them both in eternal combat.</p>` },
    { id: 'darkin', group: 'Timeline', title: '2000–550 BN — The Great Darkin War', body: `
      <p>After the fall of Shurima, the remaining Ascended were left without purpose and traumatised by their past battles against the Void. With no emperor to restrain them, they began fighting among themselves for power and territory. They mastered a forbidden blood magic to reshape their bodies, and mortals cursed them with the name <b>Darkin</b> ("the fallen"). The Darkin enslaved entire nations and spread chaos across Runeterra.</p>
      <p>A celestial of Targon, the <b>Aspect of Twilight</b>, intervened and revealed to mortals the secret of defeating the Darkin: imprisoning them permanently inside their own weapons. The Darkin weapons were hidden in many places across Runeterra and the Spirit Realm so that these beings could never be freed again.</p>` },
    { id: 'revenant', group: 'Timeline', title: '400–100 BN — Reign of the Iron Revenant', body: `
      <p>Centuries before his resurrection, he was <b>Sahn-Uzal</b>, a barbarian king in Valoran who believed slaughter would earn him a place of glory in the hall of the gods. When he died, he found only a grey emptiness and, driven by fury, refused to fade away, learning the language of the dead (<b>Ochnun</b>) to whisper to the living.</p>
      <p>A group of mages brought him back to use as a weapon. Sahn-Uzal tricked them into building a suit of black metal armour to hold his spirit. He killed his masters, forged his mace from their souls, and took the name <b>Mordekaiser</b>. He raised the <b>Immortal Bastion</b>, a monumental fortress, as a symbol of his power and a repository of forbidden knowledge about death and the spirit realm. He commanded an army of demons and fallen soldiers.</p>
      <p>His defeat was orchestrated by <b>LeBlanc</b>, a sorceress of the Noxii tribes who lived around the Bastion, with the help of <b>Vladimir</b>, a hemomancer (blood mage) from Camavor. They took his fortress, which would later become the capital of Noxus. Back in the realm of death, Mordekaiser used the souls of those he had killed to build his own eternal kingdom, <b>Mitna Rachnun</b>. He remains there, gathering power in his "Realm of Death" and preparing for his eventual return and final reign over Runeterra.</p>` },
    { id: 'ruination', group: 'Timeline', title: '25 BN — The Ruination of the Blessed Isles', body: `
      <p>A disaster unleashed by the obsession of King <b>Viego</b> of Camavor (unknown lands in the far east) with resurrecting his wife, <b>Isolde</b>, who had died after being struck by a poisoned dagger meant for the king. Viego sent his niece and general, <b>Kalista</b>, in search of the legendary <b>Waters of Life</b> in the city of <b>Helia</b> on the Blessed Isles.</p>
      <p>When Viego reached the isles with Isolde's body and his army, the masters of Helia refused to let him use the healing waters. Faced with their refusal, Viego went mad and ordered the city sacked. In the chaos, Kalista refused to attack the innocent inhabitants and tried to protect the city, but was betrayed and stabbed in the back by <b>Hecarim</b>, commander of the Iron Order of Camavor's army.</p>
      <p>A local warden named <b>Erlok Grael</b>, seeking personal power, deceived Viego and led him to the <b>Well of Ages</b>, claiming its waters would bring the queen back. Viego submerged Isolde's corpse in the well, but the ritual had a terrible result: the magic of the waters reacted unstably with a World Rune hidden beneath the well. Isolde returned as a spectre in agony and, in her pain, took Viego's sword and pierced the king's heart. The clash between the sword's magic, the World Rune and the waters unleashed <b>the Ruination</b>, a massive explosion of blue-green magical energy that swept across the isles.</p>
      <p>The explosion tore the veil between the material and spirit realms, creating <b>the Black Mist</b>. The inhabitants' souls were trapped in eternal torment and turned into spectres. The isles became a cursed place, now known as <b>the Shadow Isles</b>, while the Kingdom of Camavor fell into total decline after losing its monarchy.</p>` },
    { id: 'rune-wars', group: 'Timeline', title: '25–3 BN — The Rune Wars', body: `
      <p>After the ruin of Helia, the dangerous magical artefacts once guarded on the Blessed Isles were left unwatched and scattered across the world. A series of devastating global conflicts followed, in which the mortals of Runeterra used the World Runes as weapons of war. These conflicts were so brutal that they wiped out many civilisations, reshaped landmasses and erased much of recorded history, plunging the world into civilisational decline and a primitive way of life.</p>
      <p>The first documented devastating attack came when the mage <b>Tyrus</b> and his apprentice <b>Ryze</b> tried to broker peace between two rival Noxii nations. The meeting ended with the total destruction of the village of <b>Khom</b> and its surroundings by the power of two World Runes, officially starting the large-scale wars. During the fighting, the use of extreme magic caused catastrophes such as the destruction of the <b>Gardens of Zyr</b> in the Shuriman jungle, which stayed lifeless for centuries. Cabals of battle-mages dominated the spirit realm with shadow magic, giving rise to the demon <b>Nocturne</b>. Other entities, such as <b>Evelynn</b>, fed on human suffering during this period and grew into powerful demons. When he saw his master Tyrus try to use the Runes' power for his own ends, Ryze was forced to kill him. He swore never to use a World Rune and devoted his life to finding and hiding them to prevent the annihilation of the world.</p>` },
    { id: 'resurgence', group: 'Timeline', title: '0–789 AN — The Resurgence of Civilisation', body: `
      <p>A historical period in which the main modern nations of Runeterra began to emerge and consolidate after the cataclysms of the Rune Wars.</p>
      <h4>Noxus (0–349 AN)</h4>
      <p>The Noxii tribes took refuge inside the Immortal Bastion. With the help of <b>the Black Rose</b>, a group formed by LeBlanc and Vladimir, they fended off the magical devastation and, when the wars ended, united as the empire of <b>Noxus</b>. This marks <b>year 0 of the Noxian calendar</b>.</p>
      <p>In 349 AN, Noxus officially became an imperial power. The noble houses swore to unite all nations under a single banner and elected the first <b>Grand General</b> to lead their conquests, beginning forced annexations such as that of Drakkengate.</p>
      <h4>Demacia (0–292 AN)</h4>
      <p>The nation was founded by refugees from the Rune Wars led by the champion <b>Orlon</b>. They discovered a forest of <b>petricite</b>, which nullifies magic, and founded their first city there: <b>Zeffira</b>.</p>
      <p>At the height of the Rune Wars, a couple (Mihira and Kilam) climbed Mount Targon to escape the war. Mihira was chosen by the <b>Aspect of Justice</b>, and her twin daughters, <b>Kayle</b> and <b>Morgana</b>, were born under that divine influence. During the first centuries, the sisters acted as protectors of Demacia. However, an ideological conflict and their father's death led to a devastating battle that left Zeffira in ruins, and both sisters vanished.</p>
      <p>In 292 AN, the capital moved to the <b>Great City</b> and <b>Argostan</b> was crowned the first king. Demacia was declared an eternal sanctuary against magic, and the sculptor <b>Durand</b> created <b>Galio</b>, the petricite colossus, for its military protection.</p>
      <h4>Piltover and Zaun (772–789 AN)</h4>
      <p>Attempts to build the <b>Sun Gates</b> — a sea passage between Valoran and Shurima — caused catastrophic earthquakes. Large parts of the old port city of Oshra Va'Zaun sank into deep caverns and toxic gases were released; the goddess Jan'ahrem, known today as <b>Janna</b>, intervened to save thousands of citizens. After decades of rebuilding, the new wealthy merchant elite built a district above the river Pilt and named it <b>Piltover</b> ("over the Pilt"). The opening of the Sun Gates brought immense wealth and allowed Noxus to consolidate resources by sea.</p>
      <h4>Bilgewater (787 AN)</h4>
      <p>Missionaries of the native Buhru allowed immigrants and fortune-hunters (called <b>paylangi</b>) to settle in the bays of the Serpent Isles, giving rise to a chaotic and prosperous port city.</p>
      <h4>Nazumah (498 AN)</h4>
      <p>In southern Shurima, a group of people founded a society of monster hunters around an oasis, taming the giant beasts that had plagued the region for years.</p>` },
    { id: 'demacia-noxus-war', group: 'Timeline', title: '892–895 AN — The First Demacian-Noxian War', body: `
      <p>After centuries of annexing territory in central Valoran, the Noxian war fronts marched towards the continent's western coast. There they met resistance for the first time, facing the army of Demacia, whose soldiers specialised in defence. For the first time in its history, Noxian expansion was halted.</p>
      <p>Out-manoeuvred, the Noxians were pushed back south-east and took refuge behind the walls of the fortified settlement of <b>Hvardis</b>. The local commander was willing to let the Demacians leave without further attacks, which enraged the Noxian general <b>Sion</b>, who had returned from a campaign in the Argent Mountains to retake control. Sion executed the commander of Hvardis for his hesitation and led a charge against the Demacian forces. Outnumbered and pierced by many enemy weapons, Sion still reached King <b>Jarvan I</b> of Demacia. He strangled the king to death with his bare hands, dying only once the monarch had stopped breathing.</p>
      <p>With their king dead, the Demacian army withdrew within its borders. Sion was buried as a national hero in a great monument in Noxus. However, the war led to a decline of Noxian influence for about 50 years, during which Demacia freed several nations of central Valoran from Noxian rule.</p>` },
    { id: 'present', group: 'Timeline', title: 'Recent History and the Present Day', body: `
      <p>Runeterra's recent history covers the second half of the tenth century after the founding of Noxus. The year <b>994 AN</b> onwards is considered the present, when our campaign takes place. This is the period in which most of the canon champions' stories unfold, marked by political upheaval, the return of ancient gods, and global threats.</p>
      <div class="cs-callout"><b>For character creation</b>, focus mainly on the period from the Rune Wars to the present — those are the most important parts of the lore. If something is missing, look in the Regions section, or even on the official <em>Universe of League of Legends</em> website. Here's a brief summary:</div>
      <h4>Noxus</h4>
      <p>In 989, after the disastrous first invasion of Ionia and the corruption of General Darkwill, <b>Jericho Swain</b> orchestrated a coup that shook the foundations of the empire. He overthrew Darkwill and established the <b>Trifarix</b>, a council of three leaders representing the principles of strength. Meanwhile, the Black Rose keeps operating in the shadows, with spies infiltrated in every nation.</p>
      <h4>Demacia</h4>
      <p>After centuries of persecuting mages, the tension exploded in the <b>Great Mage Rebellion</b> of 994, led by <b>Sylas</b>, which plunged the nation into a civil war that continues to this day.</p>
      <h4>Shurima</h4>
      <p>After millennia under the sands, Emperor <b>Azir</b> was resurrected in 989, restoring the Sun Disc and the capital of Shurima. This sparked a struggle for control of the desert against the freed <b>Xerath</b>, whose cultists have begun attacking Shuriman settlements across the continent.</p>
      <h4>Ionia</h4>
      <p>Still an isolated land, recovering from the Noxian invasion, which triggered a cultural and political revolution. There we find the <b>Kinkou Order</b>, one of Ionia's oldest organisations, dedicated to keeping the balance between the material and spirit worlds. Recently a former Kinkou ninja, <b>Zed</b>, formed the <b>Order of Shadow</b> to defend against Noxus in a more violent and brutal way, going against Kinkou teachings.</p>
      <h4>Freljord</h4>
      <p>In recent years, the Freljord has been defined by a desperate struggle for survival, tribal conflict and the terrifying resurgence of ancient demigods. It is led by three great tribes: the <b>Avarosans</b> (followers of war-mother <b>Ashe</b>, descendant of Avarosa), the <b>Winter's Claw</b> (followers of war-mother <b>Sejuani</b>, descendant of Serylda) and the <b>Frostguard</b> (Lissandra's order), who are in constant battle.</p>
      <p>The Void's Watchers are showing signs of awakening. The <b>Ursine</b>, followers of the god Volibear, battle the Winter's Claw for territory. The <b>Hearthblood</b>, followers of Ornn, remain secluded near that god's mountain. The <b>yeti</b>, once blessed by Anivia with mastery of True Ice, have been reduced to feral creatures.</p>` },
    { id: 'r-bilgewater', region: 'bilgewater', group: 'Regions', title: 'Bilgewater', body: `
      <p>Bilgewater is a haven for smugglers, raiders and the unscrupulous, where fortunes are made and ambitions shattered in the blink of an eye. For those fleeing justice, debt or persecution, it is a city of new beginnings; no one on Bilgewater's winding streets cares about your past. It is a melting pot of cultures, races and creeds, bustling at every hour of the day and night.</p>
      <p>Although incredibly dangerous, Bilgewater is also full of opportunity, free from the shackles of government, regulation and moral restraint. If you have the coin, almost anything can be bought in Bilgewater, from forbidden hextech to the favour of local crime bosses. Come dawn, though, the unwary are found floating in the harbour, their purses empty and their throats cut.</p>` },
    { id: 'r-bandle', region: 'bandle', group: 'Regions', title: 'Bandle City', body: `
      <p>Opinions differ on exactly where the yordles' home lies, though some mortals claim to have travelled unseen paths to a land of curious enchantment beyond the material realm. They speak of a place of unbridled magic, where the foolhardy can be led astray among countless wonders and end up lost in a dream…</p>
      <p>In Bandle City, it is said, every sensation is heightened for non-yordles. Colours are brighter. Food and drink intoxicate the senses for years and, once tasted, are never forgotten. The sunlight is eternally golden, the waters crystal clear, and every harvest brings plentiful bounty. Perhaps some of these claims are true, or perhaps none — for none of the storytellers seem to agree on what they actually saw.</p>
      <p>Only one thing is certain: the timeless nature of Bandle City and its inhabitants. That may explain why mortals who manage to return often seem to have aged greatly, while many others never come back at all.</p>` },
    { id: 'r-demacia', region: 'demacia', group: 'Regions', title: 'Demacia', body: `
      <p>A strong, lawful kingdom with a prestigious military history, Demacia has always held justice, honour and duty as its highest values, and its people take immense pride in their cultural heritage. But despite these noble principles, this largely self-sufficient nation has grown increasingly insular and isolationist in recent centuries. Now, Demacia is a kingdom in turmoil.</p>
      <p>The old capital, <b>Zeffira</b>, was founded as a refuge from sorcery after the nightmare of the Rune Wars, and built upon the enigma of <b>petricite</b> — a peculiar white stone that dampens magical energy. After its fall, Demacia moved its capital to the Great City of Demacia. From there the royal family has long overseen the defence of outlying towns and villages, farmland, forests and mineral-rich mountains.</p>
      <p>However, following the sudden death of King <b>Jarvan III</b>, the other noble families have yet to approve the succession of his only heir, the young Prince <b>Jarvan IV</b>, to the throne.</p>
      <p>Those living beyond its heavily guarded borders are viewed with growing suspicion, and many former allies have begun seeking protection elsewhere in these uncertain times. Some dare to whisper that Demacia's golden age is over and that, unless its people are willing to adapt to a changing world — something many believe they simply cannot do — the kingdom's decline may be inevitable.</p>
      <p>And all the petricite in the land will not protect Demacia from itself.</p>` },
    { id: 'r-shadow-isles', region: 'shadow-isles', group: 'Regions', title: 'The Shadow Isles', body: `
      <p>The land now known as the Shadow Isles was once a beautiful realm, but it was shattered by a magical cataclysm. A <b>Black Mist</b> permanently shrouds the isles, and the land itself is tainted, corrupted by malevolent forces. Living things on the Shadow Isles slowly have their life force drained away, which in turn draws the insatiable, predatory spirits of the dead.</p>
      <p>Those who perish in the Black Mist are condemned to haunt this melancholy land for eternity. Worse still, the power of the Shadow Isles grows stronger with each passing year, letting the shades of the undead extend their reach and reap souls all across Runeterra.</p>` },
    { id: 'r-ionia', region: 'ionia', group: 'Regions', title: 'Ionia', body: `
      <p>Ionia — in the original Vastayan naming, <b>the First Lands</b> — is a land of unspoiled beauty and natural magic. Its people, living in settlements scattered across this vast archipelago, are a spiritual folk who seek to live in harmony and balance with the world. There are many orders and sects in Ionia, each following its own (often conflicting) paths and ideals.</p>
      <p>Self-sufficient and isolationist, Ionia stayed largely neutral in the wars that ravaged Valoran over the centuries — until it was invaded by Noxus. That brutal conflict and occupation forced Ionia to rethink its place in the world. How it will respond, and what path it will take, remains uncertain; but hatred of Noxus has led to militarisation and vigilantism, and the hunger for darker arts is on the rise.</p>` },
    { id: 'r-ixtal', region: 'ixtal', group: 'Regions', title: 'Ixtal', body: `
      <p>Renowned for its mastery of elemental magic, Ixtal was one of the first independent nations to join the Shuriman empire. In truth, Ixtali culture is far older — part of the great westward diaspora that gave rise to civilisations such as the Buhru, magnificent Helia and the ascetics of Targon — and they likely played a significant role in creating the first Ascended.</p>
      <p>But the mages of Ixtal survived the Void and, later, the Darkin, withdrawing from their neighbours and drawing the wild nature around them like a shield. Though much had already been lost, they were committed to preserving the little that remained…</p>
      <p>Now, isolated deep in the jungle for thousands of years, the sophisticated arcology-city of <b>Ixaocan</b> remains almost entirely free of outside influence. Having watched from afar the ruin of the Blessed Isles and the Rune Wars that followed, the Ixtali regard every other faction in Runeterra as usurpers and impostors, and use their powerful magic to keep intruders at bay.</p>` },
    { id: 'r-nazumah', region: null, group: 'Regions', title: 'Nazumah', body: `
      <p>Nazumah is a land of valiant warriors and hunters, used to hunting giant, powerful creatures. With a rich, colourful culture that seems to celebrate freedom endlessly every day, its people never forget the freedom they won from the oppression of the so-called "warrior-gods", at the cost of much struggle.</p>
      <p>Among the Nazumites it is normal to find many ethnicities and cultures that fled the Darkin War, with people from many regions seeking the freedom the country offers — or simply chasing the most exotic novelties in its markets.</p>
      <p>Nazumah's relations with other Shurimans tend to be peaceful and friendly, as long as there is no sign that they serve or are tied to an Ascended; that can change quickly when the opposite is discovered. If they notice any sign of slavery or forced servitude, they may take it as a personal goal to help that "sibling of the sands" break free.</p>
      <p>Many of Shurima's most important goods, such as those of the Medumarca market, first pass through Nazumah's markets, where they are traded with great skill and cunning. Trying to cheat a Nazumite merchant is not a good idea — it can even mean banishment from the country.</p>` },
    { id: 'r-freljord', region: 'freljord', group: 'Regions', title: 'The Freljord', body: `
      <p>The Freljord is a harsh and unforgiving land. Proud and fiercely independent, its people are born warriors, with a strong culture of raiding.</p>
      <p>Although there are many individual tribes in the Freljord, battle lines are being drawn in a civil war between three factions that will decide the future of them all. One tribe steadfastly honours the traditions that have ensured its survival; another follows the dream of a united future, as envisioned by an idealistic young woman; while the third worships the power of an enigmatic being. The Freljord is also the only place where <b>True Ice</b> can be found.</p>` },
    { id: 'r-noxus', region: 'noxus', group: 'Regions', title: 'Noxus', body: `
      <p>Noxus is a powerful empire with a fearsome reputation. To those beyond its borders, Noxus is brutal, expansionist and threatening, but those who look past its warlike façade see an unusually inclusive society, where the strengths and talents of its people are respected and cultivated.</p>
      <p>Its people were once a fierce raider culture, until they stormed the ancient city that now lies at the heart of their empire. Threatened on all sides, they aggressively took the fight to their enemies, pushing their borders outward with every passing year. That struggle for survival made the Noxians a deeply proud people who value strength above all — though that strength can take many different forms.</p>
      <p>Anyone can rise to a position of power and respect in Noxus if they show the necessary aptitude, regardless of social standing, origin, homeland or wealth.</p>` },
    { id: 'r-piltover', region: 'piltover', group: 'Regions', title: 'Piltover', body: `
      <p>Piltover, also known as <b>the City of Progress</b>, is a thriving, progressive city whose power and influence are on the rise. It is Valoran's cultural centre, where art, craftsmanship, trade and innovation walk hand in hand. Its power comes not from military might but from the engines of commerce and visionary thinking.</p>
      <p>Perched on the cliffs above the district of Zaun and overlooking the ocean, it sees fleets of ships pass through its gigantic sea gates, bringing goods from all over the world. The wealth this generates has driven unprecedented growth. Piltover has reinvented itself — and keeps reinventing itself — as a city where fortunes can be made and dreams realised. Rising merchant clans fund the most incredible ventures: grand artistic extravaganzas, esoteric <b>hextech</b> research, and architectural monuments that symbolise their power.</p>
      <p>With ever more inventors exploring the emerging knowledge of hextech, Piltover has become a magnet for the world's most skilled artisans.</p>` },
    { id: 'r-zaun', region: 'zaun', group: 'Regions', title: 'Zaun', body: `
      <p>Zaun, also known as <b>the City of Iron and Glass</b>, is a large underground district lying in the deep canyons and valleys that run beneath Piltover. What little light reaches below is filtered through fumes leaking from tangles of corroded pipes, and reflected by the stained glass of its industrial architecture. Zaun and Piltover were once united, but are now separate, if symbiotic, societies.</p>
      <p>Although it exists in perpetual smoky twilight, Zaun thrives; its people are vibrant and its culture rich. Piltover's wealth has let Zaun develop in parallel, a dark reflection of the city above. Many goods bound for Piltover end up in Zaun's black markets, and hextech inventors who find the restrictions above too strict often find their dangerous research welcomed in Zaun.</p>
      <p>The reckless development of volatile technologies and unchecked industry have left vast areas of Zaun polluted and dangerous. In the lowest parts of the city, rivers of toxic sludge stagnate — yet even there, people find a way to survive and thrive.</p>` },
    { id: 'r-shurima', region: 'shurima', group: 'Regions', title: 'Shurima', body: `
      <p>The empire of Shurima was once a thriving civilisation spanning a vast desert. After an age of growth and prosperity, the fall of its gleaming capital left the empire in ruins. Over millennia, the tales of the glorious city of Shurima became myth and religion among the descendants of the scattered survivors.</p>
      <p>Most of Shurima's nomadic inhabitants scratch out a basic living in an unforgiving land. Some defend small outposts built around the few oases. Others seek riches buried among the ruins of the fallen empire, or take mercenary work, earning gold for their deeds before vanishing back into the sands. Now the tribes are stirred by whispers from the heart of the desert: <b>the capital of Shurima has risen again</b>.</p>` },
    { id: 'r-targon', region: 'targon', group: 'Regions', title: 'Targon', body: `
      <p>Like any mythical place, Mount Targon is a beacon for dreamers, madmen and adventurers. A mountainous, sparsely inhabited region west of Shurima, Targon boasts the highest peak in Runeterra. Far from civilisation, Mount Targon is practically inaccessible except to the most determined pilgrims, driven by a deep longing to reach its summit. The few brave enough to survive the gruelling journey to the base of the titanic mountain find a sky glittering with celestial bodies: the sun and moons, but also constellations, planets, blazing comets streaking through the dark, and auspicious alignments of stars. They return haunted and hollow, or transformed beyond recognition.</p>
      <p>Those living at the mountain's base believe these celestial bodies are aspects of long-vanished star beings, ancient and powerful creatures on a scale beyond human understanding. Yet Mount Targon is simply a gateway to the <b>Celestial Realm</b>, and it would be a mistake to attribute much in the way of mortal sensibilities, morals or concerns to what lies beyond the mountain.</p>` },
    { id: 'r-void', region: 'void', group: 'Regions', title: 'The Void', body: `
      <p>The Void is the "Realm of Nothing" that lies beyond the Material Realm.</p>
      <p>It is also a manifestation of that unknowable nothingness: a force of insatiable hunger, waiting through the aeons until its masters, the mysterious <b>Watchers</b>, mark the final moment of destruction.</p>
      <p>To be a mortal touched by the Void's power is to suffer an agonising glimpse of eternal unreality, enough to break even the strongest mind. The denizens of the Void itself are creature-constructs, often of limited awareness, but charged with a single purpose: to bring total oblivion to Runeterra.</p>` },
    { id: 'races', group: 'Peoples', title: 'Races', body: `
      <p>Playable peoples of Runeterra:</p>
      <ul class="lore-races">${['Human', 'Plantfolk', 'Construct', 'Half-dragon', 'Troll', 'Vastaya', 'Minotaur', 'Spirit', 'Yordle'].map(r => `<li>${r}</li>`).join('')}</ul>` }
  ];

  const groups = [...new Set(SECTIONS.map(s => s.group))];
  const panel = document.createElement('aside');
  panel.id = 'lore';
  panel.className = 'drawer wide';
  panel.setAttribute('aria-label', 'World lore');
  panel.setAttribute('aria-hidden', 'true');
  panel.innerHTML = `
    <div class="cs-head">
      <div><div class="eyebrow">The world of the campaign</div><h2>Runeterra Lore</h2></div>
      <button class="btn small" data-lore-close aria-label="Close lore">✕</button>
    </div>
    <input type="search" class="cs-search" placeholder="Search the lore… (e.g. Void, Azir, petricite)" aria-label="Search lore">
    <nav class="cs-index">${groups.map(g => `<div class="lore-group"><span>${g}</span>${SECTIONS.filter(s => s.group === g).map(s => `<a href="#lore-${s.id}" data-lore-jump="lore-${s.id}">${s.title.includes(' — ') ? s.title.split(' — ')[1] : s.title}</a>`).join('')}</div>`).join('')}</nav>
    <div class="cs-body">${groups.map(g => `<h2 class="lore-gh" data-group="${g}">${g}</h2>` + SECTIONS.filter(s => s.group === g).map(s => `<section class="cs-sec" id="lore-${s.id}" data-group="${g}"><h3>${s.title}</h3>${s.body}</section>`).join('')).join('')}
      <p class="cs-empty" hidden>Nothing in the lore matches your search.</p>
    </div>`;
  const backdrop = document.createElement('div');
  backdrop.className = 'cs-backdrop';
  document.body.append(backdrop, panel);

  const search = panel.querySelector('.cs-search');
  const jump = id => {
    const t = panel.querySelector('#' + id);
    if (!t) return;
    t.hidden = false;
    t.scrollIntoView({ behavior: 'smooth', block: 'start' });
    t.classList.add('flash'); setTimeout(() => t.classList.remove('flash'), 900);
  };
  const open = sectionId => {
    panel.classList.add('open'); backdrop.classList.add('open');
    panel.setAttribute('aria-hidden', 'false');
    if (sectionId) setTimeout(() => jump(sectionId), 260);
  };
  const close = () => { panel.classList.remove('open'); backdrop.classList.remove('open'); panel.setAttribute('aria-hidden', 'true'); };
  window.openLore = open;
  // Lore section for a builder region id (used by the Homeland step).
  window.LORE_FOR_REGION = Object.fromEntries(SECTIONS.filter(s => s.region).map(s => [s.region, 'lore-' + s.id]));

  document.addEventListener('click', ev => {
    const opener = ev.target.closest('[data-act="lore"]');
    if (opener) { ev.preventDefault(); open(opener.dataset.section); return; }
    if (ev.target.closest('[data-lore-close]') || ev.target === backdrop) { close(); return; }
    const j = ev.target.closest('[data-lore-jump]');
    if (j && panel.contains(j)) { ev.preventDefault(); jump(j.dataset.loreJump); }
  });
  document.addEventListener('keydown', ev => { if (ev.key === 'Escape' && panel.classList.contains('open')) close(); });
  search.addEventListener('input', () => {
    const q = search.value.trim().toLowerCase();
    let any = false;
    panel.querySelectorAll('.cs-sec').forEach(sec => { const hit = !q || sec.textContent.toLowerCase().includes(q); sec.hidden = !hit; any = any || hit; });
    panel.querySelectorAll('.lore-gh').forEach(h => { h.hidden = !panel.querySelector(`.cs-sec[data-group="${h.dataset.group}"]:not([hidden])`); });
    panel.querySelector('.cs-empty').hidden = any;
  });
})();
