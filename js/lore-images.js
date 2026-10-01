/* Artwork for the Lore page (lore.html).
   Every section, region and people on the page has an image slot. A slot with no entry here shows a
   decorative frame (with the region's sigil and colour where there is one).

   To add an image:
     1. Put the file in assets/lore/ (JPG or WebP, ideally 1600px wide or less, under ~300 KB).
     2. Add a line below with the slot id: 'slot-id': { src: 'assets/lore/file.webp', credit: 'Artist / Riot Games' }
        Optional: pos: '50% 30%' (which part of the picture stays in view when it is cropped),
                  fit: 'contain' (show the whole picture instead of filling the frame).
   Slot ids: 'cover' (top banner), each section id (e.g. 'planet', 'titans', 'r-demacia', 'r-void'),
   and each people as 'race-' + name (e.g. 'race-humano', 'race-yordle', 'race-vastaya').
   Hover over an empty frame on the page to see its slot id.
   Timeline entries with an image show it as a wide banner across the top of the card. */
window.LORE_IMAGES = {
  // capa
  'cover': { src: 'assets/lore/mapa-runeterra.webp', credit: 'Riot Games', pos: '50% 45%' },

  // linha do tempo
  'primordial': { src: 'assets/lore/primordial-yordles.webp', credit: 'Riot Games' },
  'titans': { src: 'assets/lore/guerra-dos-titas.webp', credit: 'Riot Games', pos: '60% 50%' },
  'migration': { src: 'assets/lore/migracao.webp', credit: 'Mapa de Runeterra · Riot Games' },
  'sisters': { src: 'assets/lore/tres-irmas.webp', credit: 'Lissandra, a Ladra de Sonhos · Riot Games', pos: '50% 35%' },
  'golden-age': { src: 'assets/lore/era-de-ouro-shurima.webp', credit: 'Riot Games', pos: '50% 30%' },
  'fall-shurima': { src: 'assets/lore/queda-de-shurima.webp', credit: 'Riot Games' },
  'icathia': { src: 'assets/lore/icathia.webp', credit: 'Riot Games', pos: '55% 40%' },
  'darkin': { src: 'assets/lore/guerra-darkin.webp', credit: 'Riot Games', pos: '60% 40%' },
  'revenant': { src: 'assets/lore/sahn-uzal.webp', credit: 'Riot Games', pos: '50% 22%' },
  'ruination': { src: 'assets/lore/ruina-ilhas-abencoadas.webp', credit: 'Riot Games', pos: '50% 35%' },
  'rune-wars': { src: 'assets/lore/guerras-runicas.webp', credit: 'Riot Games' },
  'resurgence': { src: 'assets/lore/mapa-regioes.webp', credit: 'Riot Games' },
  'demacia-noxus-war': { src: 'assets/lore/guerra-demacia-noxus.webp', credit: 'Riot Games', pos: '50% 35%' },

  // artes das cartas de Legends of Runeterra (Riot Games), do Universo de League of Legends e de artes conceituais da Riot
  'planet': { src: 'assets/lore/planet.webp', credit: "Uma Vez na Vida · Targon · Universo de League of Legends · Riot Games" },
  'runes': { src: 'assets/lore/runes.webp', credit: "Fragmento de Reverência · Legends of Runeterra · Riot Games" },
  'realms': { src: 'assets/lore/realms.webp', credit: "Bardo · Legends of Runeterra · Riot Games" },
  'present': { src: 'assets/lore/present.webp', credit: "Jayce · Legends of Runeterra · Riot Games" },
  'r-bilgewater': { src: 'assets/lore/r-bilgewater.webp', credit: "Angra do Ladrão · Legends of Runeterra · Riot Games" },
  'r-bandle': { src: 'assets/lore/r-bandle.webp', credit: "A Árvore de Bandópolis · Legends of Runeterra · Riot Games" },
  'r-demacia': { src: 'assets/lore/r-demacia.webp', credit: "A Grande Praça · Legends of Runeterra · Riot Games" },
  'r-shadow-isles': { src: 'assets/lore/r-shadow-isles.webp', credit: "Criptas de Helia · Legends of Runeterra · Riot Games" },
  'r-ionia': { src: 'assets/lore/r-ionia.webp', credit: "Monastério de Hirana · Legends of Runeterra · Riot Games" },
  'r-ixtal': { src: 'assets/lore/r-ixtal.webp', credit: "Nidalee · Legends of Runeterra · Riot Games" },
  'r-nazumah': { src: 'assets/lore/r-nazumah.webp', credit: "Teaser de K'Sante · Riot Games" },
  'r-freljord': { src: 'assets/lore/r-freljord.webp', credit: "Templo ao Gelo Verdadeiro · Legends of Runeterra · Riot Games" },
  'r-noxus': { src: 'assets/lore/r-noxus.webp', credit: "Arena de Noxkraya · Legends of Runeterra · Riot Games" },
  'r-piltover': { src: 'assets/lore/r-piltover.webp', credit: "A Universidade de Piltover · Legends of Runeterra · Riot Games" },
  'r-zaun': { src: 'assets/lore/r-zaun.webp', credit: "Beco de Zaun · Jayison Devadas · Riot Games" },
  'r-shurima': { src: 'assets/lore/r-shurima.webp', credit: "Palanque do Imperador · Legends of Runeterra · Riot Games" },
  'r-targon': { src: 'assets/lore/r-targon.webp', credit: "Topo do Targon · Legends of Runeterra · Riot Games" },
  'r-void': { src: 'assets/lore/r-void.webp', credit: "Portal do Vazio · Legends of Runeterra · Riot Games" },
  'race-humano': { src: 'assets/lore/race-humano.webp', credit: "Garen · Legends of Runeterra · Riot Games", pos: '72% 40%' },
  'race-plantifero': { src: 'assets/lore/race-plantifero.webp', credit: "Maokai · Legends of Runeterra · Riot Games" },
  'race-construto': { src: 'assets/lore/race-construto.webp', credit: "Galio · Legends of Runeterra · Riot Games", pos: '62% 30%' },
  'race-meio-dragao': { src: 'assets/lore/race-meio-dragao.webp', credit: "Shyvana · Legends of Runeterra · Riot Games", pos: '50% 30%' },
  'race-troll': { src: 'assets/lore/race-troll.webp', credit: "Trundle · Legends of Runeterra · Riot Games" },
  'race-vastaya': { src: 'assets/lore/race-vastaya.webp', credit: "Ahri · Legends of Runeterra · Riot Games" },
  'race-espirito': { src: 'assets/lore/race-espirito.webp', credit: "Kindred · Legends of Runeterra · Riot Games", pos: '72% 50%' },
  'race-yordle': { src: 'assets/lore/race-yordle.webp', credit: "Teemo · Legends of Runeterra · Riot Games", pos: '62% 50%' },
  'race-minotauro': { src: 'assets/lore/race-minotauro.webp', credit: "Desafiador Minotauro · Legends of Runeterra · Riot Games" },
};
