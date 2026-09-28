# Lore artwork

Images for the Lore page (`lore.html`). Put the files here and register each one in
`js/lore-images.js` with its slot id, e.g.

```js
'r-demacia': { src: 'assets/lore/demacia.jpg', credit: 'Riot Games' },
```

Slot ids: `cover` (top banner), every section id (`planet`, `titans`, `r-demacia`, `r-void`, …)
and every people as `race-<name>` (`race-humano`, `race-yordle`, …). Hovering an empty frame on
the page shows its slot id. Keep images under ~300 KB (JPG or WebP, up to ~1600px wide).
