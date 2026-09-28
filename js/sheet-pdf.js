/* Hero sheet → PDF, drawn from the on-screen sheet itself.
   The sheet is laid out by the browser (in a desktop-width iframe so it always gets the two-column layout),
   then every box, rule, die and word is copied into a vector PDF at the same position, in the same fonts.
   Hero points, collections, back issues and current Health become real PDF form fields, so they stay
   clickable/editable in any PDF reader. */
(() => {
  'use strict';
  const PX = 0.75;                      // CSS px → PDF pt
  const SHEET_W = 780;                  // layout width of the sheet inside the iframe (px)
  const MARGIN = 18;                    // dark margin around each page (px)
  const FONT_FILES = {
    'marcellus|400|normal': 'Marcellus-Regular.ttf',
    'barlow semi condensed|400|normal': 'BarlowSemiCondensed-Regular.ttf',
    'barlow semi condensed|500|normal': 'BarlowSemiCondensed-Medium.ttf',
    'barlow semi condensed|600|normal': 'BarlowSemiCondensed-SemiBold.ttf',
    'barlow semi condensed|400|italic': 'BarlowSemiCondensed-Italic.ttf',
    'ibm plex mono|400|normal': 'IBMPlexMono-Regular.ttf',
    'ibm plex mono|500|normal': 'IBMPlexMono-Medium.ttf'
  };

  // ---------------------------------------------------------------- small parsers
  const parseColor = s => {
    const m = /rgba?\(([^)]+)\)/.exec(s || '');
    if (!m) return null;
    const p = m[1].split(/[\s,/]+/).filter(Boolean).map(Number);
    const a = p.length > 3 ? p[3] : 1;
    if (!(a > 0)) return null;
    return { c: window.PDFLib.rgb(p[0] / 255, p[1] / 255, p[2] / 255), a };
  };
  // Split on a separator that is not inside parentheses.
  const splitTop = (s, sep) => {
    const out = []; let depth = 0, cur = '';
    for (const ch of s) {
      if (ch === '(') depth++;
      if (ch === ')') depth--;
      if (depth === 0 && (sep === ' ' ? /\s/.test(ch) : ch === sep)) { if (cur.trim()) out.push(cur.trim()); cur = ''; } else cur += ch;
    }
    if (cur.trim()) out.push(cur.trim());
    return out;
  };
  const len = (v, ref) => {
    v = v.trim();
    if (v.startsWith('calc(')) {
      const parts = splitTop(v.slice(5, -1), ' ');
      let total = len(parts[0], ref);
      for (let i = 1; i < parts.length; i += 2) total += (parts[i] === '-' ? -1 : 1) * len(parts[i + 1], ref);
      return total;
    }
    if (v.endsWith('%')) return parseFloat(v) / 100 * ref;
    return parseFloat(v) || 0;
  };
  // clip-path → polygon points relative to the element box, or null.
  const clipPoly = (cp, w, h) => {
    if (!cp || cp === 'none') return null;
    let m = /^polygon\((.*)\)$/.exec(cp);
    if (m) return splitTop(m[1], ',').map(pt => { const [x, y] = splitTop(pt, ' '); return [len(x, w), len(y, h)]; });
    m = /^inset\((.*)\)$/.exec(cp);
    if (m) {
      const v = splitTop(m[1], ' ');
      const t = len(v[0], h), r = len(v[1] || v[0], w), b = len(v[2] || v[0], h), l = len(v[3] || v[1] || v[0], w);
      return [[l, t], [w - r, t], [w - r, h - b], [l, h - b]];
    }
    return null;
  };
  const pathOf = pts => 'M ' + pts.map(p => p.join(' ')).join(' L ') + ' Z';

  // ---------------------------------------------------------------- renderer
  const loadScript = src => new Promise((res, rej) => {
    const el = document.createElement('script');
    el.src = src; el.onload = res; el.onerror = () => rej(new Error('could not load ' + src));
    document.head.appendChild(el);
  });

  async function render({ html, cssHref, fontBase, fontkitSrc, pageBg, onStatus }) {
    const L = window.PDFLib;
    const { PDFDocument, rgb, degrees } = L;
    const say = onStatus || (() => {});

    // 1. Lay the sheet out in a desktop-width, same-origin iframe.
    say('Laying out your sheet…');
    const frame = document.createElement('iframe');
    frame.setAttribute('aria-hidden', 'true');
    frame.style.cssText = 'position:fixed;left:-20000px;top:0;width:1440px;height:2000px;border:0;visibility:hidden';
    document.body.appendChild(frame);
    try {
      const fdoc = frame.contentDocument;
      fdoc.open();
      // Lay out with the very font files the PDF embeds, so measured positions and drawn glyphs agree.
      const faces = Object.entries(FONT_FILES).map(([k, f]) => {
        const [fam, w, style] = k.split('|');
        return `@font-face{font-family:"${fam.replace(/\b\w/g, c => c.toUpperCase()).replace('Ibm', 'IBM')}";font-weight:${w};font-style:${style};src:url("${fontBase}${f}") format("truetype")}`;
      }).join('');
      fdoc.write(`<!doctype html><html><head><meta charset="utf-8"><style>${faces}</style><link rel="stylesheet" href="${cssHref}">
        <style>html{font-size:100%}body{background:${pageBg};margin:0}#pdf-root{width:${SHEET_W}px;padding:${MARGIN}px}.hero-sheet{gap:${MARGIN * 2}px}</style></head><body><div id="pdf-root">${html}</div></body></html>`);
      fdoc.close();
      await new Promise(res => (fdoc.readyState === 'complete' ? res() : frame.addEventListener('load', res, { once: true })));
      const want = Object.keys(FONT_FILES).map(k => { const [fam, w, style] = k.split('|'); return `${style === 'italic' ? 'italic ' : ''}${w} 16px "${fam.replace(/\b\w/g, c => c.toUpperCase()).replace('Ibm', 'IBM')}"`; });
      await Promise.race([Promise.all(want.map(f => fdoc.fonts.load(f).catch(() => null))), new Promise(r => setTimeout(r, 6000))]);
      await fdoc.fonts.ready;
      await Promise.all([...fdoc.images].map(im => (im.complete ? 0 : new Promise(r => { im.onload = im.onerror = r; }))));
      const win = frame.contentWindow;
      const cs = el => win.getComputedStyle(el);

      // 2. PDF + fonts
      say('Embedding fonts…');
      const doc = await PDFDocument.create();
      doc.setTitle(fdoc.querySelector('.hs-name') ? fdoc.querySelector('.hs-name').textContent.trim() + ' — Hero Sheet' : 'Hero Sheet');
      doc.setCreator('Runeterra Champion Forge');
      let fonts = {}, fieldFont, fallback;
      if (!window.fontkit && fontkitSrc) await loadScript(fontkitSrc).catch(() => {});   // big: fetched only when exporting
      if (window.fontkit) doc.registerFontkit(window.fontkit);
      try {
        if (!window.fontkit) throw new Error('fontkit missing');
        await Promise.all(Object.entries(FONT_FILES).map(async ([k, f]) => {
          const r = await fetch(fontBase + f);
          if (!r.ok) throw new Error(f);
          const bytes = await r.arrayBuffer();
          fonts[k] = await doc.embedFont(bytes, { subset: true });
          if (k === 'barlow semi condensed|400|normal') fieldFont = await doc.embedFont(bytes); // full font: readers type into fields with it
        }));
        fallback = fonts['barlow semi condensed|400|normal'];
      } catch (e) {                                           // e.g. opened from disk: standard fonts, same layout
        fonts = {};
        fallback = fieldFont = await doc.embedFont(L.StandardFonts.Helvetica);
        fonts['*|700'] = await doc.embedFont(L.StandardFonts.HelveticaBold);
        fonts['*mono'] = await doc.embedFont(L.StandardFonts.Courier);
        fonts['*serif'] = await doc.embedFont(L.StandardFonts.TimesRoman);
      }
      const charsets = new Map();
      const hasAll = (f, s) => {
        if (!f.getCharacterSet) return true;
        if (!charsets.has(f)) charsets.set(f, new Set(f.getCharacterSet()));
        const set = charsets.get(f);
        for (const ch of s) if (!set.has(ch.codePointAt(0))) return false;
        return true;
      };
      const pickFont = s => {
        const fam = s.fontFamily.split(',')[0].replace(/["']/g, '').trim().toLowerCase();
        const w = parseInt(s.fontWeight, 10) || 400, it = s.fontStyle === 'italic' ? 'italic' : 'normal';
        if (fonts[`${fam}|400|normal`]) {
          const ws = Object.keys(fonts).filter(k => k.startsWith(fam + '|') && k.endsWith('|' + it)).map(k => +k.split('|')[1]);
          const pool = ws.length ? ws : Object.keys(fonts).filter(k => k.startsWith(fam + '|')).map(k => +k.split('|')[1]);
          const best = pool.sort((a, b) => Math.abs(a - w) - Math.abs(b - w))[0];
          return fonts[`${fam}|${best}|${ws.length ? it : 'normal'}`] || fonts[`${fam}|${best}|normal`];
        }
        if (fam.includes('mono') && fonts['*mono']) return fonts['*mono'];
        if (fam === 'marcellus' && fonts['*serif']) return fonts['*serif'];
        if (w >= 600 && fonts['*|700']) return fonts['*|700'];
        return fallback;
      };

      // Baseline offset of a font inside its content box (what range rects measure), cached per font setup.
      const baseCache = new Map();
      const baseline = s => {
        const key = [s.fontFamily, s.fontWeight, s.fontStyle, s.fontSize].join('|');
        if (baseCache.has(key)) return baseCache.get(key);
        const probe = fdoc.createElement('span');
        probe.style.cssText = `font-family:${s.fontFamily};font-weight:${s.fontWeight};font-style:${s.fontStyle};font-size:${s.fontSize};line-height:normal;position:absolute;left:0;top:0;white-space:nowrap`;
        probe.textContent = 'Hg';
        const mark = fdoc.createElement('i');
        mark.style.cssText = 'display:inline-block;width:0;height:0;vertical-align:baseline';
        probe.appendChild(mark);
        fdoc.body.appendChild(probe);
        const v = mark.getBoundingClientRect().top - probe.getBoundingClientRect().top;
        probe.remove();
        baseCache.set(key, v);
        return v;
      };

      const form = doc.getForm();
      let fieldN = 0;
      const fields = [];

      // 3. Pages
      const pages = [...fdoc.querySelectorAll('.hs-page')];
      for (let pi = 0; pi < pages.length; pi++) {
        say(`Drawing page ${pi + 1} of ${pages.length}…`);
        const pg = pages[pi];
        const pr = pg.getBoundingClientRect();
        const ox = pr.left - MARGIN, oy = pr.top - MARGIN;
        const W = pr.width + MARGIN * 2, H = pr.height + MARGIN * 2;
        const page = doc.addPage([W * PX, H * PX]);
        const bg = parseColor(pageBg);
        if (bg) page.drawRectangle({ x: 0, y: 0, width: W * PX, height: H * PX, color: bg.c });
        const X = x => (x - ox) * PX;                      // CSS px (viewport) → PDF
        const Y = y => (H - (y - oy)) * PX;
        const svg = (pts, opt) => page.drawSvgPath(pathOf(pts.map(([x, y]) => [x - ox, y - oy])), { x: 0, y: H * PX, scale: PX, ...opt });

        const drawBox = (el, s, r) => {
          const poly = clipPoly(s.clipPath, r.width, r.height);
          const shape = poly ? poly.map(([x, y]) => [r.left + x, r.top + y]) : null;
          const back = parseColor(s.backgroundColor);
          if (back && r.width && r.height) {
            if (shape) svg(shape, { color: back.c, opacity: back.a, borderWidth: 0 });
            else page.drawRectangle({ x: X(r.left), y: Y(r.bottom), width: r.width * PX, height: r.height * PX, color: back.c, opacity: back.a });
          }
          if (s.boxShadow && s.boxShadow !== 'none') {
            for (const sh of splitTop(s.boxShadow, ',')) {
              if (!/inset/.test(sh)) continue;
              const col = parseColor(sh), nums = (sh.replace(/rgba?\([^)]*\)/, '').match(/-?[\d.]+px/g) || []).map(parseFloat);
              const spread = nums[3] || 0;
              if (!col || !spread || nums[0] || nums[1]) continue;
              if (shape) svg(shape, { borderColor: col.c, borderOpacity: col.a, borderWidth: spread * PX });
              else page.drawRectangle({ x: X(r.left + spread / 2), y: Y(r.bottom - spread / 2), width: (r.width - spread) * PX, height: (r.height - spread) * PX, borderColor: col.c, borderOpacity: col.a, borderWidth: spread * PX });
            }
          }
          if (el.classList.contains('term')) return;       // tooltip underline: meaningless on paper
          const side = (w, style, color, x1, y1, x2, y2) => {
            if (!(w > 0) || style === 'none' || style === 'hidden') return;
            const col = parseColor(color);
            if (!col) return;
            const dash = style === 'dotted' ? [w, w * 1.6] : style === 'dashed' ? [w * 3, w * 2] : undefined;
            page.drawLine({ start: { x: X(x1), y: Y(y1) }, end: { x: X(x2), y: Y(y2) }, thickness: w * PX, color: col.c, opacity: col.a, dashArray: dash && dash.map(d => d * PX) });
          };
          const bt = parseFloat(s.borderTopWidth), br = parseFloat(s.borderRightWidth), bb = parseFloat(s.borderBottomWidth), bl = parseFloat(s.borderLeftWidth);
          side(bt, s.borderTopStyle, s.borderTopColor, r.left, r.top + bt / 2, r.right, r.top + bt / 2);
          side(bb, s.borderBottomStyle, s.borderBottomColor, r.left, r.bottom - bb / 2, r.right, r.bottom - bb / 2);
          side(bl, s.borderLeftStyle, s.borderLeftColor, r.left + bl / 2, r.top, r.left + bl / 2, r.bottom);
          side(br, s.borderRightStyle, s.borderRightColor, r.right - br / 2, r.top, r.right - br / 2, r.bottom);
        };

        const range = fdoc.createRange();
        const drawText = (node, s) => {
          const text = node.nodeValue;
          if (!text || !text.trim()) return;
          const col = parseColor(s.color);
          if (!col) return;
          const size = parseFloat(s.fontSize);
          const ls = s.letterSpacing === 'normal' ? 0 : parseFloat(s.letterSpacing) || 0;
          const vertical = s.writingMode.startsWith('vertical');
          const up = s.textTransform === 'uppercase' ? t => t.toUpperCase() : s.textTransform === 'lowercase' ? t => t.toLowerCase() : t => t;
          const base = baseline(s);
          let font = pickFont(s);
          const re = /\S+/g;
          let m;
          if (ls) page.pushOperators(L.setCharacterSpacing(ls * PX));
          while ((m = re.exec(text))) {
            range.setStart(node, m.index);
            range.setEnd(node, m.index + m[0].length);
            const rects = range.getClientRects();
            if (!rects.length) continue;
            const word = up(m[0]);
            const f = hasAll(font, word) ? font : fallback;
            if (rects.length > 1 && !vertical) {             // a long word broken over lines: place it char by char
              for (let i = 0; i < m[0].length; i++) {
                range.setStart(node, m.index + i); range.setEnd(node, m.index + i + 1);
                const cr = range.getClientRects()[0];
                if (cr) page.drawText(up(m[0][i]), { x: X(cr.left), y: Y(cr.top + base), size: size * PX, font: f, color: col.c, opacity: col.a });
              }
              continue;
            }
            const r = rects[0];
            if (vertical) page.drawText(word, { x: X(r.left + base), y: Y(r.bottom), size: size * PX, font: f, color: col.c, opacity: col.a, rotate: degrees(90) });
            else page.drawText(word, { x: X(r.left), y: Y(r.top + base), size: size * PX, font: f, color: col.c, opacity: col.a });
          }
          if (ls) page.pushOperators(L.setCharacterSpacing(0));
        };

        const drawImage = async (img, r) => {
          try {
            const src = img.currentSrc || img.src;
            const bytes = src.startsWith('data:') ? src : await (await fetch(src)).arrayBuffer();
            const im = /^data:image\/png|\.png$/i.test(src) ? await doc.embedPng(bytes) : await doc.embedJpg(bytes);
            const k = Math.max(r.width / im.width, r.height / im.height);      // object-fit: cover
            const w = im.width * k, h = im.height * k;
            page.pushOperators(L.pushGraphicsState(), L.rectangle(X(r.left), Y(r.bottom), r.width * PX, r.height * PX), L.clip(), L.endPath());
            page.drawImage(im, { x: X(r.left + (r.width - w) / 2), y: Y(r.top + (r.height + h) / 2), width: w * PX, height: h * PX });
            page.pushOperators(L.popGraphicsState());
          } catch (e) { /* unsupported image: leave the frame empty */ }
        };

        const addInput = (el, s, r) => {
          const name = `f${++fieldN}_${(el.dataset.bind || 'field').replace(/[^\w]+/g, '_')}`;
          if (el.type === 'checkbox') {
            const cb = form.createCheckBox(name);
            const side = r.width;                            // rotated square: bounding box is the diamond's box
            cb.addToPage(page, { x: X(r.left), y: Y(r.bottom), width: side * PX, height: side * PX, borderWidth: 0, backgroundColor: undefined, borderColor: undefined });
            if (el.checked) cb.check();
            fields.push({ kind: 'check', f: cb, s });
            return;
          }
          // text input: its own rules were drawn by drawBox; the field sits in the content box
          const pl = parseFloat(s.paddingLeft) || 0, prr = parseFloat(s.paddingRight) || 0;
          const tf = form.createTextField(name);
          const col = parseColor(s.color);
          tf.addToPage(page, { x: X(r.left + pl * 0.5), y: Y(r.bottom - 1), width: (r.width - (pl + prr) * 0.5) * PX, height: (r.height - 2) * PX, font: fieldFont, textColor: col ? col.c : rgb(1, 1, 1), borderWidth: 0, backgroundColor: undefined, borderColor: undefined });
          tf.setText(el.value || '');
          tf.setFontSize(Math.round(parseFloat(s.fontSize) * PX * 10) / 10);
          if (s.textAlign === 'center') tf.setAlignment(L.TextAlignment.Center);
          fields.push({ kind: 'text', f: tf });
        };

        const walk = async el => {
          const s = cs(el);
          if (s.display === 'none' || s.visibility === 'hidden') return;
          const r = el.getBoundingClientRect();
          if (el.tagName === 'INPUT') { if (el.type !== 'checkbox') drawBox(el, s, r); addInput(el, s, r); return; }
          drawBox(el, s, r);
          if (el.tagName === 'IMG') { await drawImage(el, r); return; }
          for (const n of el.childNodes) {
            if (n.nodeType === 3) drawText(n, s);
            else if (n.nodeType === 1) await walk(n);
          }
        };
        await walk(pg);
      }

      // 4. Field appearances: diamonds like the sheet, text in the sheet's font.
      const gold = fdoc.defaultView.getComputedStyle(fdoc.documentElement).getPropertyValue('--gold').trim();
      const goldLo = fdoc.defaultView.getComputedStyle(fdoc.documentElement).getPropertyValue('--gold-lo').trim();
      const ink = fdoc.defaultView.getComputedStyle(fdoc.documentElement).getPropertyValue('--ink-0').trim();
      const hex = h => { const m = /^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})/i.exec(h) || [0, 'c8', 'a4', '5e']; return [1, 2, 3].map(i => parseInt(m[i], 16) / 255); };
      const [G, GL, IK] = [hex(gold || '#c8a45e'), hex(goldLo || '#6f5b32'), hex(ink || '#0c0d10')];
      const diamond = (w, h, inset) => {
        const cx = w / 2, cy = h / 2, rx = w / 2 - inset, ry = h / 2 - inset;
        return [L.moveTo(cx, cy + ry), L.lineTo(cx + rx, cy), L.lineTo(cx, cy - ry), L.lineTo(cx - rx, cy), L.closePath()];
      };
      const provider = (cb, widget) => {
        const { width: w, height: h } = widget.getRectangle();
        const off = [L.pushGraphicsState(), L.setLineWidth(0.75), L.setFillingRgbColor(...IK), L.setStrokingRgbColor(...GL), ...diamond(w, h, w * 0.15), L.fillAndStroke(), L.popGraphicsState()];
        const on = [L.pushGraphicsState(), L.setLineWidth(0.75), L.setFillingRgbColor(...G), L.setStrokingRgbColor(...G), ...diamond(w, h, w * 0.15), L.fillAndStroke(),
          L.setLineWidth(1.2), L.setStrokingRgbColor(...IK), ...diamond(w, h, w * 0.26), L.stroke(), L.popGraphicsState()];
        return { normal: { on, off }, down: { on, off } };
      };
      for (const x of fields) {
        if (x.kind === 'check') x.f.updateAppearances(provider);
        else x.f.updateAppearances(fieldFont);
      }
      say('Saving…');
      return await doc.save({ updateFieldAppearances: false });
    } finally {
      frame.remove();
    }
  }

  window.SheetPDF = { render };
})();
