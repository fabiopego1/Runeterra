/* Shows the "Forja do Antagonista" button in the site header, but only while the GM Screen is unlocked in this tab
   (the Screen keeps its key in sessionStorage). Buttons marked data-gm-only start hidden. */
(() => {
  'use strict';
  const refresh = () => {
    let on = false;
    try { on = !!sessionStorage.getItem('runeterra-gm-key'); } catch (e) { /* private mode */ }
    document.querySelectorAll('[data-gm-only]').forEach(el => { el.hidden = !on; });
  };
  window.GM_LINK = { refresh };
  refresh();
})();
