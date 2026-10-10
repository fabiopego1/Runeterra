/* Opens the GM vault in the browser. The vault holds the GM-only material: the Screen's notes page (HTML) and the
   modules (gm-flavour, gm-twists, gm-tools, gm-villain-data, gm-bullpen) that are run only after unlocking.
   Used by gm.js (the password) and antagonist.js (the key the Screen keeps for the tab). */
(() => {
  'use strict';
  const ORDER = ['gm-flavour', 'gm-twists', 'gm-tools', 'gm-villain-data', 'gm-env-data', 'gm-bullpen'];
  const b64 = s => Uint8Array.from(atob(s), c => c.charCodeAt(0));
  const parse = text => {
    try { const o = JSON.parse(text); if (o && o.v === 2) return o; } catch (e) { /* the old vault was plain HTML */ }
    return { v: 2, html: text, modules: {} };
  };
  async function decrypt(key) {
    const v = window.GM_VAULT;
    const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: b64(v.iv) }, key, b64(v.ct));
    return parse(new TextDecoder().decode(plain));
  }
  async function openRaw(raw) {
    const v = window.GM_VAULT;
    if (!raw || !v || !window.crypto || !crypto.subtle) return null;
    try { return await decrypt(await crypto.subtle.importKey('raw', b64(raw), 'AES-GCM', false, ['decrypt'])); } catch (e) { return null; }
  }
  // runs the modules (all of them in the book's order, or just the ones named) as scripts of the page
  function run(payload, names) {
    for (const n of names || ORDER) {
      const src = payload.modules && payload.modules[n];
      if (!src) continue;
      const s = document.createElement('script');
      s.textContent = src;
      document.head.appendChild(s);
      s.remove();
    }
  }
  window.GM_UNSEAL = { decrypt, openRaw, run, ORDER };
})();
