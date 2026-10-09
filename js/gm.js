/* GM Screen: decrypts js/gm-vault.js in the browser with the GM password (see tools/gm-seal.js).
   The derived key (never the password) is kept in sessionStorage so a reload stays unlocked until
   the tab is closed or "Lock" is pressed. */
(() => {
  'use strict';
  const PT_UI = {
    'Runeterra · Tabletop Chronicle': 'Runeterra · Criador de Ficha',
    'GM Screen': 'Escudo do Mestre',
    'Champion Forge': 'Forja de Campeões',
    'Lock': 'Trancar',
    'Game Master only': 'Somente para o Mestre',
    'Behind the Screen': 'Atrás do Escudo',
    'Enter the GM password to open this page.': 'Digite a senha do Mestre para abrir esta página.',
    'Password': 'Senha',
    'Unlock': 'Destrancar',
    'Unlocking…': 'Destrancando…',
    'Wrong password.': 'Senha incorreta.',
    'This browser cannot decrypt the page (it needs a secure https:// connection).': 'Este navegador não consegue abrir a página (ela precisa de uma conexão segura https://).',
    'The GM page has no sealed content yet.': 'A página do Mestre ainda não tem conteúdo selado.'
  };
  Object.assign(window.I18N.ui, PT_UI);
  const T = window.T;
  document.title = `${T('GM Screen')} · ${T('Champion Forge')}`;
  document.querySelectorAll('[data-t-placeholder]').forEach(el => { el.placeholder = T(el.dataset.tPlaceholder); });

  const KEY = 'runeterra-gm-key';
  const vault = window.GM_VAULT;
  const gate = document.getElementById('gm-gate');
  const room = document.getElementById('gm-room');
  const input = document.getElementById('gm-pass');
  const err = document.getElementById('gm-error');
  const lockBtn = document.querySelector('[data-gm-lock]');
  const b64 = s => Uint8Array.from(atob(s), c => c.charCodeAt(0));
  const toB64 = buf => btoa(String.fromCharCode(...new Uint8Array(buf)));
  const store = {
    get() { try { return sessionStorage.getItem(KEY); } catch (e) { return null; } },
    set(v) { try { sessionStorage.setItem(KEY, v); } catch (e) { /* private mode: stays unlocked until reload */ } },
    clear() { try { sessionStorage.removeItem(KEY); } catch (e) { /* ignore */ } }
  };
  const fail = msg => { err.textContent = T(msg); err.hidden = false; gate.classList.remove('shake'); void gate.offsetWidth; gate.classList.add('shake'); };

  const deriveKey = async password => {
    const base = await crypto.subtle.importKey('raw', new TextEncoder().encode(password.normalize('NFC')), 'PBKDF2', false, ['deriveKey']);
    return crypto.subtle.deriveKey({ name: 'PBKDF2', hash: 'SHA-256', salt: b64(vault.salt), iterations: vault.iter },
      base, { name: 'AES-GCM', length: 256 }, true, ['decrypt']);
  };
  const open = async key => {
    const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: b64(vault.iv) }, key, b64(vault.ct));
    return new TextDecoder().decode(plain);
  };
  const show = (html, rawKey) => {
    document.getElementById('gm-content').innerHTML = html;
    if (window.GM_TOOLS) window.GM_TOOLS.mount(document.getElementById('gm-tools'), rawKey);
    if (window.GM_BULLPEN) window.GM_BULLPEN.render(document.getElementById('gm-bullpen'));
    if (window.GM_FLAVOUR) window.GM_FLAVOUR.render(document.getElementById('gm-flavour'));
    gate.hidden = true; room.hidden = false; lockBtn.hidden = false;
    if (window.GM_LINK) window.GM_LINK.refresh();
  };

  lockBtn.addEventListener('click', () => { store.clear(); location.reload(); });

  if (!vault) { fail('The GM page has no sealed content yet.'); gate.querySelector('button').disabled = true; return; }
  if (!window.crypto || !crypto.subtle) { fail('This browser cannot decrypt the page (it needs a secure https:// connection).'); return; }

  // Already unlocked in this tab?
  const saved = store.get();
  if (saved) {
    crypto.subtle.importKey('raw', b64(saved), 'AES-GCM', false, ['decrypt'])
      .then(open).then(html => show(html, saved)).catch(() => store.clear());
  }

  gate.addEventListener('submit', async ev => {
    ev.preventDefault();
    const btn = gate.querySelector('button[type=submit] span');
    err.hidden = true; btn.textContent = T('Unlocking…');
    try {
      const key = await deriveKey(input.value);
      const html = await open(key);
      const raw = toB64(await crypto.subtle.exportKey('raw', key));
      store.set(raw);
      input.value = '';
      show(html, raw);
    } catch (e) {
      fail('Wrong password.'); input.select();
    } finally { btn.textContent = T('Unlock'); }
  });
  input.focus();
})();
