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
  'sisters': { src: 'assets/lore/tres-irmas.webp', credit: 'Riot Games', fit: 'contain' },
  'golden-age': { src: 'assets/lore/era-de-ouro-shurima.webp', credit: 'Riot Games', pos: '50% 30%' },
  'fall-shurima': { src: 'assets/lore/queda-de-shurima.webp', credit: 'Riot Games' },
  'revenant': { src: 'assets/lore/sahn-uzal.webp', credit: 'Riot Games', pos: '50% 22%' },
  'ruination': { src: 'assets/lore/ruina-ilhas-abencoadas.webp', credit: 'Riot Games', pos: '50% 35%' },
  'rune-wars': { src: 'assets/lore/guerras-runicas.webp', credit: 'Riot Games' },
  'present': { src: 'assets/lore/mapa-regioes.webp', credit: 'Riot Games' },
};
