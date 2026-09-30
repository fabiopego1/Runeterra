/* Icon + regional sigil set. One engraved line style: thin strokes, square caps, currentColor. */
(() => {
  'use strict';
  const svg = (vb, body, cls) => `<svg class="${cls}" viewBox="0 0 ${vb} ${vb}" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-linecap="square" stroke-linejoin="miter">${body}</svg>`;

  // 16px interface icons
  const I = {
    lock: '<rect x="3.5" y="7.5" width="9" height="6.5"/><path d="M5.5 7.5V5.2a2.5 2.5 0 0 1 5 0v2.3"/>',
    check: '<path d="M3 8.5l3 3 7-7"/>',
    info: '<path d="M8 1.5L14.5 8 8 14.5 1.5 8z"/><path d="M8 7.2v4"/><path d="M8 5v.4"/>',
    map: '<path d="M1.5 3.5l4-1.5 5 1.5 4-1.5v10l-4 1.5-5-1.5-4 1.5z"/><path d="M5.5 2v10.5M10.5 3.5V14"/>',
    codex: '<path d="M3 2.5h9.5V14H4a1 1 0 0 1-1-1z"/><path d="M3 12.3a1 1 0 0 1 1-1h8.5"/><path d="M6 5.5h4M6 7.5h4"/>',
    mark: '<path d="M8 1.5l1.3 5.2 5.2 1.3-5.2 1.3L8 14.5 6.7 9.3 1.5 8l5.2-1.3z"/>',
    download: '<path d="M8 2v8.5M4.5 7 8 10.5 11.5 7M2.5 13.5h11"/>',
    close: '<path d="M3.5 3.5l9 9M12.5 3.5l-9 9"/>',
    next: '<path d="M2 8h11M9.5 4.5 13 8l-3.5 3.5"/>',
    prev: '<path d="M14 8H3M6.5 4.5 3 8l3.5 3.5"/>',
    pending: '<path d="M8 4.5L11.5 8 8 11.5 4.5 8z" fill="currentColor"/>',
    print: '<path d="M4 6V2.5h8V6M4 11.5H2.5V6h11v5.5H12M4 9.5h8v4H4z"/>',
    upload: '<path d="M8 10.5V2M4.5 5.5 8 2l3.5 3.5M2.5 13.5h11"/>',
    reset: '<path d="M3 8a5 5 0 1 0 1.6-3.7M3 2.5v3h3"/>',
    file: '<path d="M3.5 1.5h6l3 3v10h-9z"/><path d="M9.5 1.5v3h3M5.5 8.5h5M5.5 11h5"/>',
    chevron: '<path d="M4 6l4 4 4-4"/>',
    warn: '<path d="M8 1.8l6.5 12H1.5z"/><path d="M8 6.2v3.8"/><path d="M8 11.6v.4"/>'
  };
  window.ICO = (name, extra = '') => svg(16, I[name] || '', 'ico ' + extra);

  // 32px regional sigils — engraved emblems, one per land
  const S = {
    demacia: '<path d="M16 5l8 3v7c0 6-4 10-8 12-4-2-8-6-8-12V8z"/><path d="M16 9v13M12 13h8"/><path d="M8 10.5L3 8.5M8 13.5H4M24 10.5l5-2M24 13.5h4"/>',
    noxus: '<path d="M16 3.5l11 22H5z"/><path d="M16 12.5l5 10H11z"/><path d="M9 25.5l-3 4M23 25.5l3 4M16 3.5V1"/>',
    ionia: '<path d="M24.5 9.5A10.5 10.5 0 1 0 26 19"/><path d="M16 10c3.2 3 3.2 8.4 0 11.5-3.2-3.1-3.2-8.5 0-11.5z"/><path d="M16 21.5V26"/>',
    piltover: '<circle cx="16" cy="16" r="6.5"/><circle cx="16" cy="16" r="2.5"/><path d="M16 4.5v3M16 24.5v3M4.5 16h3M24.5 16h3M7.9 7.9l2.1 2.1M22 22l2.1 2.1M24.1 7.9L22 10M10 22l-2.1 2.1"/>',
    zaun: '<path d="M16 3l11 6.5v13L16 29 5 22.5v-13z"/><path d="M13.5 10.5h5M14 10.5l-3 9h10l-3-9"/><path d="M13 16.5h6"/>',
    freljord: '<path d="M16 3v26M5 9.5l22 13M27 9.5l-22 13"/><path d="M13 5.5L16 8l3-2.5M13 26.5L16 24l3 2.5M5.5 13.5L8.5 12 8 8.5M26.5 18.5L23.5 20l.5 3.5M26.5 13.5L23.5 12l.5-3.5M5.5 18.5L8.5 20 8 23.5"/>',
    shurima: '<circle cx="16" cy="14" r="5.5"/><path d="M16 3.5v3M16 21.5v3M5.5 14h3M23.5 14h3M8.6 6.6l2.1 2.1M21.3 19.3l2.1 2.1M23.4 6.6l-2.1 2.1M10.7 19.3l-2.1 2.1"/><path d="M3 27h26M7 27l3-2.5h12l3 2.5"/>',
    targon: '<path d="M3.5 27.5l9-15 4 6 3-4.5 9 13.5z"/><path d="M22.5 3l.8 3.2 3.2.8-3.2.8-.8 3.2-.8-3.2-3.2-.8 3.2-.8z"/>',
    bilgewater: '<circle cx="16" cy="5.5" r="2.2"/><path d="M16 7.7V27M11 11h10"/><path d="M6.5 19c1 6 5 8.5 9.5 8.5s8.5-2.5 9.5-8.5"/><path d="M6.5 19l-2 2.5M6.5 19l2.8 1.2M25.5 19l2 2.5M25.5 19l-2.8 1.2"/>',
    'shadow-isles': '<path d="M16 4c6 6 6 14 0 22-6-8-6-16 0-22z"/><path d="M16 11v7"/><path d="M5 25.5c3.5-2 6 2 11 0s7.5 2 11 0"/>',
    ixtal: '<path d="M16 3c10 7 10 19 0 26C6 22 6 10 16 3z"/><path d="M16 11l5 9H11z"/><path d="M16 20v6"/>',
    bandle: '<path d="M16 16a2 2 0 1 1 2 2 4 4 0 1 1-4-4 6 6 0 1 1 6 6 8 8 0 1 1-8-8 10 10 0 1 1 10 10"/>',
    nazumah: '<path d="M6 6.5c0 10 5 15.5 10 15.5s10-5.5 10-15.5"/><path d="M10.5 9c.8 6.2 3.3 9 5.5 9s4.7-2.8 5.5-9"/><path d="M16 22v7M13.5 26.5h5"/>',
    void: '<path d="M3.5 16.5C8.5 8 22.5 7 28.5 14.5 23 23.5 9.5 25.5 3.5 16.5z"/><path d="M17.5 10.5c2.2 3.4 2 7.6-1.2 11.2-1.4-3.6-1.2-7.6 1.2-11.2z"/>',
    compass: '<circle cx="16" cy="16" r="11"/><path d="M16 3v6M16 23v6M3 16h6M23 16h6"/><path d="M16 11l2 5-2 5-2-5z"/>'
  };
  window.SIGIL = (id, extra = '') => svg(32, S[id] || S.compass, 'sigil ' + extra);

  // Static markup: <span data-ico="map"></span> / <span data-sigil="compass"></span>
  document.querySelectorAll('[data-ico]').forEach(el => { el.innerHTML = window.ICO(el.dataset.ico); });
  document.querySelectorAll('[data-sigil]').forEach(el => { el.innerHTML = window.SIGIL(el.dataset.sigil); });
})();
