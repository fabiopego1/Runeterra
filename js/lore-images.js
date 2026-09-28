/* Artwork for the Lore page (lore.html).
   Every section, region and people on the page has an image slot. A slot with no entry here shows a
   decorative frame (with the region's sigil and colour where there is one).

   To add an image:
     1. Put the file in assets/lore/ (JPG or WebP, ideally 1600px wide or less, under ~300 KB).
     2. Add a line below with the slot id: 'slot-id': { src: 'assets/lore/file.jpg', credit: 'Artist / Riot Games' }
   Slot ids: 'cover' (top banner), each section id (e.g. 'planet', 'titans', 'r-demacia', 'r-void'),
   and each people as 'race-' + name (e.g. 'race-humano', 'race-yordle', 'race-vastaya').
   Hover over an empty frame on the page to see its slot id. */
window.LORE_IMAGES = {
  // 'cover': { src: 'assets/lore/cover.jpg', credit: 'Riot Games' },
};
