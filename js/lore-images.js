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
  'migration': { src: 'assets/lore/mapa-runeterra.webp', credit: 'Riot Games' },
  'sisters': { src: 'assets/lore/tres-irmas.webp', credit: 'Riot Games', fit: 'contain' },
  'golden-age': { src: 'assets/lore/era-de-ouro-shurima.webp', credit: 'Riot Games', pos: '50% 30%' },
  'fall-shurima': { src: 'assets/lore/queda-de-shurima.webp', credit: 'Riot Games' },
  'icathia': { src: 'assets/lore/icathia.webp', credit: 'Riot Games', pos: '55% 40%' },
  'darkin': { src: 'assets/lore/guerra-darkin.webp', credit: 'Riot Games', pos: '60% 40%' },
  'revenant': { src: 'assets/lore/sahn-uzal.webp', credit: 'Riot Games', pos: '50% 22%' },
  'ruination': { src: 'assets/lore/ruina-ilhas-abencoadas.webp', credit: 'Riot Games', pos: '50% 35%' },
  'rune-wars': { src: 'assets/lore/guerras-runicas.webp', credit: 'Riot Games' },
  'resurgence': { src: 'assets/lore/mapa-regioes.webp', credit: 'Riot Games' },
  'demacia-noxus-war': { src: 'assets/lore/guerra-demacia-noxus.webp', credit: 'Riot Games', pos: '50% 35%' },

  // artes conceituais do Mapa de Runeterra (map.leagueoflegends.com, Riot Games)
  'planet': { src: 'assets/lore/planet.webp', credit: "As Primeiras Terras · Mapa de Runeterra · Riot Games" },
  'runes': { src: 'assets/lore/runes.webp', credit: "Encarando o Vazio · Mapa de Runeterra · Riot Games" },
  'realms': { src: 'assets/lore/realms.webp', credit: "Os Grandes Monastérios · Mapa de Runeterra · Riot Games" },
  'present': { src: 'assets/lore/present.webp', credit: "Sua Hora mais Sombria · Mapa de Runeterra · Riot Games" },
  'r-bilgewater': { src: 'assets/lore/r-bilgewater.webp', credit: "Baía de Águas de Sentina · Mapa de Runeterra · Riot Games" },
  'r-bandle': { src: 'assets/lore/r-bandle.webp', credit: "Nas Profundezas do Bandobosque · Mapa de Runeterra · Riot Games", pos: '50% 40%' },
  'r-demacia': { src: 'assets/lore/r-demacia.webp', credit: "Cidadela do Amanhecer · Mapa de Runeterra · Riot Games" },
  'r-shadow-isles': { src: 'assets/lore/r-shadow-isles.webp', credit: "Suspenso entre a Vida e a Morte · Mapa de Runeterra · Riot Games" },
  'r-ionia': { src: 'assets/lore/r-ionia.webp', credit: "A Vida Como Entidade Única · Mapa de Runeterra · Riot Games" },
  'r-ixtal': { src: 'assets/lore/r-ixtal.webp', credit: "Uma fronteira inexplorada · Mapa de Runeterra · Riot Games" },
  'r-nazumah': { src: 'assets/lore/r-nazumah.webp', credit: "Cascata Zoantha · Mapa de Runeterra · Riot Games" },
  'r-freljord': { src: 'assets/lore/r-freljord.webp', credit: "Rakelstake · Mapa de Runeterra · Riot Games" },
  'r-noxus': { src: 'assets/lore/r-noxus.webp', credit: "O Bastião Imortal · Mapa de Runeterra · Riot Games" },
  'r-piltover': { src: 'assets/lore/r-piltover.webp', credit: "Avenida Sideral · Mapa de Runeterra · Riot Games" },
  'r-zaun': { src: 'assets/lore/r-zaun.webp', credit: "O Cinza de Zaun · Mapa de Runeterra · Riot Games" },
  'r-shurima': { src: 'assets/lore/r-shurima.webp', credit: "A Cidade do Sol · Mapa de Runeterra · Riot Games" },
  'r-targon': { src: 'assets/lore/r-targon.webp', credit: "Cume do Monte Targon · Mapa de Runeterra · Riot Games" },
  'r-void': { src: 'assets/lore/r-void.webp', credit: "O Toque do Vazio · Mapa de Runeterra · Riot Games" },
  'race-humano': { src: 'assets/lore/race-humano.webp', credit: "O Grande Rio · Mapa de Runeterra · Riot Games" },
  'race-plantifero': { src: 'assets/lore/race-plantifero.webp', credit: "Os Luonn-Kon · Mapa de Runeterra · Riot Games" },
  'race-construto': { src: 'assets/lore/race-construto.webp', credit: "Baronesa Velveteen Lenare · Mapa de Runeterra · Riot Games", pos: '50% 20%' },
  'race-meio-dragao': { src: 'assets/lore/race-meio-dragao.webp', credit: "Os dragões elementais · Mapa de Runeterra · Riot Games" },
  'race-troll': { src: 'assets/lore/race-troll.webp', credit: "Diplomacia Freljordana · Mapa de Runeterra · Riot Games" },
  'race-vastaya': { src: 'assets/lore/race-vastaya.webp', credit: "Neeko · Mapa de Runeterra · Riot Games" },
  'race-espirito': { src: 'assets/lore/race-espirito.webp', credit: "Lago dos lírios iluminados · Mapa de Runeterra · Riot Games", pos: '50% 60%' },
  'race-yordle': { src: 'assets/lore/race-yordle.webp', credit: "Geometria de Trânsito · Mapa de Runeterra · Riot Games" },
};
