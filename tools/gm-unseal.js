#!/usr/bin/env node
/* The reverse of gm-seal.js: decrypts js/gm-vault.js into gm/ (git-ignored) so the GM material can be edited.
   Usage:  GM_PASSWORD='…' node tools/gm-unseal.js   then edit gm/src/*.js and run tools/gm-seal.js again. */
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.join(__dirname, '..');
global.window = {};
require(path.join(ROOT, 'js', 'gm-vault.js'));
const v = window.GM_VAULT;

(async () => {
  const password = process.env.GM_PASSWORD;
  if (!password) { console.error('Set GM_PASSWORD.'); process.exit(1); }
  const key = crypto.pbkdf2Sync(password.normalize('NFC'), Buffer.from(v.salt, 'base64'), v.iter, 32, 'sha256');
  const ct = Buffer.from(v.ct, 'base64');
  const d = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(v.iv, 'base64'));
  d.setAuthTag(ct.slice(-16));
  let plain;
  try { plain = Buffer.concat([d.update(ct.slice(0, -16)), d.final()]).toString('utf8'); } catch (e) { console.error('Wrong password.'); process.exit(1); }
  let payload;
  try { payload = JSON.parse(plain); } catch (e) { payload = null; }
  const gm = path.join(ROOT, 'gm');
  fs.mkdirSync(path.join(gm, 'src'), { recursive: true });
  if (payload && payload.v === 2) {
    for (const [n, src] of Object.entries(payload.modules || {})) fs.writeFileSync(path.join(gm, 'src', n + '.js'), src);
    if (payload.html) fs.writeFileSync(path.join(gm, 'content.html'), payload.html);
    console.log(`Wrote ${Object.keys(payload.modules || {}).length} modules to gm/src${payload.html ? ' and gm/content.html' : ''}`);
  } else {
    fs.writeFileSync(path.join(gm, 'content.html'), plain);
    console.log('Wrote gm/content.html (old vault format: HTML only)');
  }
})();
