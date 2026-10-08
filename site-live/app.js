/* BERKAH CELL — Daftar Harga Servis HP · Versi 3.3
 * Acuan: PRD v0.5, docs/RENCANA-TEKNIS.md.
 * Aturan keamanan: teks dari Sheet SELALU dimasukkan sebagai teks (textContent /
 * createTextNode). Tidak ada innerHTML berisi data dan tidak ada atribut onclick.
 */
(() => {
  'use strict';

  // www.berkahcellbatam.com → berkahcellbatam.com (satu alamat resmi, tautan tetap sama).
  if (location.hostname === 'www.berkahcellbatam.com') {
    location.replace('https://berkahcellbatam.com' + location.pathname + location.search + location.hash);
    return;
  }

  /* ================= Konfigurasi ================= */
  const CONFIG = {
    // File publik "Berkah Cell - Harga Publik (website)": hanya kolom pelanggan,
    // disalin dari file utama lewat IMPORTRANGE. JANGAN arahkan ke file utama.
    SHEET_CSV_URL: 'https://docs.google.com/spreadsheets/d/1mgN8N15Tu-KvNLs2IblKTKVbbtoIiaPOBd-MiFoL5gA/gviz/tq?tqx=out:csv&gid=0',
    WA_NUMBER: '6289625050525', // satu nomor toko untuk servis dan komplain (PRD v0.4)
    WA_DISPLAY: '0896-2505-0525',
    LOAD_TIMEOUT_MS: 15000,
    URL_DEBOUNCE_MS: 300,
    // Data toko dari pemilik (6 Okt 2026). Harus sama dengan footer dan JSON-LD di index.html.
    // Kosongkan (null) untuk menyembunyikan blok toko.
    STORE: {
      address: 'Avava Jodoh, Lantai Dasar, Batam',
      hours: 'Setiap hari, 11.00–20.00 WIB',
      mapsUrl: 'https://maps.app.goo.gl/9f942hFJcCKjUKnj9',
      // Jam yang sama dalam bentuk data, untuk status "Buka sekarang" (setiap hari, WIB).
      open: '11:00', close: '20:00', tz: 'Asia/Jakarta',
    },
    // Keahlian andalan menurut pemilik (8 Okt 2026). Badge di beranda hanya tampil jika
    // ada tipe yang punya layanan ini di daftar harga.
    SPECIALTY: { label: 'Bypass iCloud iPhone', q: 'bypass' },
  };

  // Nama tampilan merek, sama dengan daftar bot Telegram (Price List Manager).
  const BRAND_DISPLAY = {
    iphone: 'iPhone', samsung: 'Samsung', oppo: 'Oppo', vivo: 'Vivo', xiaomi: 'Xiaomi',
    redmi: 'Redmi', poco: 'Poco', realme: 'Realme', infinix: 'Infinix', tecno: 'Tecno',
    itel: 'Itel', honor: 'Honor', huawei: 'Huawei', asus: 'Asus', nokia: 'Nokia', sony: 'Sony',
    motorola: 'Motorola', lenovo: 'Lenovo', 'google pixel': 'Google Pixel', nothing: 'Nothing',
    oneplus: 'OnePlus',
  };
  // Keputusan pemilik 6 Okt 2026: "Xiomi" ditampilkan sebagai Xiaomi; Redmi & Poco tetap terpisah.
  const BRAND_ALIAS = { xiomi: 'xiaomi' };
  // Nama lain yang sering diketik pelanggan (8 Okt 2026); hanya untuk pencarian, tidak ditampilkan.
  const SEARCH_ALIAS = { samsung: ['galaxy', 'samsung galaxy'] };
  // Kata yang sering diketik untuk nama layanan (Sheet menulis "Ganti Batrai"); hanya untuk pencarian.
  const SERVICE_ALIAS = { baterai: 'batrai', batre: 'batrai', battery: 'batrai', icloud: 'bypass', layar: 'lcd' };

  const NEEDS = [
    { id: 'lcd', label: 'Ganti LCD atau layar' },
    { id: 'baterai', label: 'Ganti baterai' },
    { id: 'lainnya', label: 'Layanan lainnya' },
    { id: 'keluhan', label: 'Belum tahu, ingin menjelaskan keluhan' },
  ];

  const SERVICE_ICONS = [
    [['lcd', 'layar', 'touchscreen', 'kaca'], 'screen'],
    [['batrai', 'baterai', 'battery'], 'battery'],
    [['kamera', 'camera'], 'camera'],
    [['cas', 'charger', 'connector', 'konektor', 'flexibel'], 'plug'],
    [['backdoor', 'backglass', 'housing'], 'back'],
    [['anti gores', 'antigores'], 'layers'],
    [['tombol'], 'btn'],
    [['speaker'], 'speaker'],
    [['kunci', 'bypass'], 'lock'],
  ];

  /* ================= Utilitas DOM aman ================= */
  const SVG_NS = 'http://www.w3.org/2000/svg';
  function h(tag, attrs, ...children) {
    const el = document.createElement(tag);
    if (attrs) {
      for (const [k, v] of Object.entries(attrs)) {
        if (v === null || v === undefined || v === false) continue;
        if (k === 'class') el.className = v;
        else if (k === 'text') el.textContent = v;
        else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v);
        else el.setAttribute(k, v === true ? '' : String(v));
      }
    }
    appendAll(el, children);
    return el;
  }
  function appendAll(el, ...children) {
    for (const c of children.flat(Infinity)) {
      if (c === null || c === undefined || c === false) continue;
      el.append(c instanceof Node ? c : document.createTextNode(String(c)));
    }
  }
  function icon(name, size = 20) {
    const svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('width', size);
    svg.setAttribute('height', size);
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    const use = document.createElementNS(SVG_NS, 'use');
    use.setAttribute('href', '#i-' + name);
    svg.append(use);
    return svg;
  }
  function waIcon() { return h('span', { class: 'wa' }, icon('wa', 16)); }
  function waUrl(text) {
    return 'https://wa.me/' + CONFIG.WA_NUMBER + '?text=' + encodeURIComponent(text);
  }
  function waLink(text, label, cls, extra) {
    return h('a', Object.assign({ class: cls, href: waUrl(text), target: '_blank', rel: 'noopener' }, extra || {}),
      cls === 'btn-pri' || cls === 'btn-ghost' ? waIcon() : null, label);
  }

  /* ================= Data ================= */
  const clean = (s) => String(s === null || s === undefined ? '' : s).replace(/\s+/g, ' ').trim();
  const lower = (s) => clean(s).toLowerCase();
  const compact = (s) => s.replace(/[^a-z0-9]/g, '');
  // Bentuk rapat untuk pencarian: hanya huruf dan angka, beserta posisi awal tiap kata.
  // "vivo y91" -> { c: 'vivoy91', starts: {0, 4} }
  function compactInfo(s) {
    let c = ''; let prev = false; const starts = new Set();
    for (const ch of s) {
      const ok = /[a-z0-9]/.test(ch);
      if (ok && !prev) starts.add(c.length);
      if (ok) c += ch;
      prev = ok;
    }
    return { c, starts };
  }
  // Posisi pertama q di bentuk rapat yang dimulai di awal kata, atau -1.
  function compactAt(info, q) {
    if (!q) return -1;
    for (let i = info.c.indexOf(q); i >= 0; i = info.c.indexOf(q, i + 1)) if (info.starts.has(i)) return i;
    return -1;
  }
  const collator = new Intl.Collator('id', { numeric: true, sensitivity: 'base' });

  function parseCSV(text) {
    const rows = []; let row = []; let cur = ''; let inQ = false;
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (inQ) {
        if (c === '"' && text[i + 1] === '"') { cur += '"'; i++; }
        else if (c === '"') inQ = false;
        else cur += c;
      } else if (c === '"') inQ = true;
      else if (c === ',') { row.push(cur); cur = ''; }
      else if (c === '\n') { row.push(cur); rows.push(row); row = []; cur = ''; }
      else if (c !== '\r') cur += c;
    }
    if (cur.length || row.length) { row.push(cur); rows.push(row); }
    return rows;
  }

  function brandKeyOf(raw) { const k = lower(raw); return BRAND_ALIAS[k] || k; }
  function brandNameOf(key) {
    return BRAND_DISPLAY[key] || key.replace(/(^|\s)\S/g, (m) => m.toUpperCase());
  }
  function parsePrice(raw) {
    const s = clean(raw);
    const t = s.replace(/^rp\.?\s*/i, '').replace(/\s+/g, '');
    if (/^\d{1,3}([.,]\d{3})+$/.test(t) || /^\d+$/.test(t)) {
      const value = Number(t.replace(/[.,]/g, ''));
      if (value > 0) return { ok: true, value, raw: s };
    }
    return { ok: false, value: null, raw: s }; // kosong, nol, atau format tidak dikenal
  }
  function formatRp(v) { return 'Rp ' + String(v).replace(/\B(?=(\d{3})+(?!\d))/g, '.'); }
  function formatRpCompact(v) { return 'Rp' + String(v).replace(/\B(?=(\d{3})+(?!\d))/g, '.'); }
  function kualitasInfo(raw) {
    const k = lower(raw);
    if (!k || k === 'tidak ada') return { kind: 'none', text: '' };
    if (k === 'jasa') return { kind: 'jasa', text: 'Jasa servis' };
    return { kind: 'quality', text: clean(raw) };
  }
  function garansiText(raw) {
    const k = lower(raw);
    if (!k) return 'Garansi: tanyakan ke toko';
    if (k === 'tidak ada') return 'Tanpa garansi';
    return 'Garansi ' + clean(raw);
  }
  function upperCount(s) { return (s.match(/[A-Z]/g) || []).length; }

  function buildCatalog(rows) {
    const header = (rows[0] || []).map(lower);
    const col = (n) => header.indexOf(n);
    const ci = {
      brand: col('brand'), model: col('model'), layanan: col('layanan'), kualitas: col('kualitas'),
      harga: col('harga_jual'), est: col('estimasi_waktu') >= 0 ? col('estimasi_waktu') : col('estimasi'), gar: col('garansi'),
    };
    const issues = [];
    const brands = new Map();
    for (let i = 1; i < rows.length; i++) {
      const r = rows[i];
      const get = (k) => (ci[k] >= 0 && r[ci[k]] !== undefined ? clean(r[ci[k]]) : '');
      const brandRaw = get('brand'); const modelRaw = get('model'); const layanan = get('layanan');
      if (!brandRaw && !modelRaw && !layanan) continue;
      if (!brandRaw || !modelRaw || !layanan) { issues.push({ type: 'baris-tidak-lengkap', line: i + 1 }); continue; }
      const bKey = brandKeyOf(brandRaw);
      let b = brands.get(bKey);
      if (!b) { b = { key: bKey, name: brandNameOf(bKey), raw: new Set(), models: new Map() }; brands.set(bKey, b); }
      b.raw.add(lower(brandRaw));
      const mKey = modelRaw.toLowerCase();
      let m = b.models.get(mKey);
      if (!m) { m = { key: mKey, brand: b, spellings: new Map(), rows: [] }; b.models.set(mKey, m); }
      m.spellings.set(modelRaw, (m.spellings.get(modelRaw) || 0) + 1);
      m.rows.push({
        line: i + 1, layanan, kualitasRaw: get('kualitas'), kualitas: kualitasInfo(get('kualitas')),
        price: parsePrice(get('harga')), est: get('est'), garansiRaw: get('gar'), garansi: garansiText(get('gar')),
      });
    }
    const models = [];
    for (const b of brands.values()) {
      for (const m of b.models.values()) {
        let best = null;
        for (const [name, n] of m.spellings) {
          if (!best || n > best.n || (n === best.n && upperCount(name) > upperCount(best.name))) best = { name, n };
        }
        m.name = best.name;
        if (m.spellings.size > 1) issues.push({ type: 'model-beda-penulisan', brand: b.key, spellings: [...m.spellings.keys()] });
        m.fullName = lower(m.name).startsWith(lower(b.name) + ' ') ? m.name : b.name + ' ' + m.name;
        const groups = new Map();
        const seen = new Map();
        for (const row of m.rows) {
          const gKey = row.layanan.toLowerCase();
          if (!groups.has(gKey)) groups.set(gKey, { name: row.layanan, variants: [] });
          const sig = [gKey, lower(row.kualitasRaw), row.price.raw, lower(row.est), lower(row.garansiRaw)].join('|');
          if (seen.has(sig)) { issues.push({ type: 'baris-identik', lines: [seen.get(sig), row.line] }); continue; }
          seen.set(sig, row.line);
          groups.get(gKey).variants.push(row);
          if (!row.price.ok) issues.push({ type: 'harga-tidak-valid', line: row.line, value: row.price.raw });
        }
        m.services = [...groups.values()];
        m.services.forEach((g) => { g.hayC = compactInfo(lower(g.name)); });
        m.optionCount = m.services.reduce((n, s) => n + s.variants.length, 0);
        m.hay = [lower(m.fullName), lower(b.name + ' ' + m.name), ...[...b.raw].map((rb) => rb + ' ' + lower(m.name)), lower(m.name),
          ...(SEARCH_ALIAS[b.key] || []).map((a) => a + ' ' + lower(m.name))];
        m.hayC = m.hay.map(compactInfo);
        models.push(m);
      }
      b.list = [...b.models.values()].sort((x, y) => collator.compare(x.name, y.name));
    }
    const brandList = [...brands.values()].sort((x, y) => collator.compare(x.name, y.name));
    return { brands, brandList, models, issues };
  }

  /* ================= Status aplikasi ================= */
  const S = { status: 'loading', catalog: null };
  const main = document.getElementById('main');
  const fixedLayer = document.getElementById('fixed-layer');
  const panelLayer = document.getElementById('panel-layer');
  const shell = document.getElementById('shell');
  let renderedHref = '';
  let cleanupFns = [];

  /* ================= Rute & riwayat ================= */
  const BASE = location.pathname;
  function readRoute() {
    const p = new URLSearchParams(location.search);
    if (p.has('bantuan')) return { name: 'help' };
    const merek = p.get('merek'); const tipe = p.get('tipe');
    if (merek && tipe) return { name: 'detail', brand: merek, model: tipe };
    if (merek) return { name: 'brand', brand: merek };
    return { name: 'home', q: p.get('q') || '' };
  }
  function urlFor(r) {
    const p = new URLSearchParams();
    if (r.name === 'help') p.set('bantuan', '1');
    if (r.name === 'brand' || r.name === 'detail') p.set('merek', r.brand);
    if (r.name === 'detail') p.set('tipe', r.model);
    if (r.name === 'home' && r.q) p.set('q', r.q);
    const qs = p.toString();
    return BASE + (qs ? '?' + qs : '');
  }
  const newId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  const st = () => history.state || {};

  // Posisi gulir per entri riwayat (di memori + sessionStorage), tanpa replaceState berulang.
  const SCROLL_KEY = 'bc-scroll-v3';
  let scrolls = {};
  try { scrolls = JSON.parse(sessionStorage.getItem(SCROLL_KEY) || '{}') || {}; } catch (e) { scrolls = {}; }
  let scrollSaveTimer = 0;
  function persistScrolls() {
    try {
      const keys = Object.keys(scrolls);
      if (keys.length > 60) keys.slice(0, keys.length - 60).forEach((k) => delete scrolls[k]);
      sessionStorage.setItem(SCROLL_KEY, JSON.stringify(scrolls));
    } catch (e) { /* penyimpanan tidak tersedia: abaikan */ }
  }
  function recordScroll() {
    if (panel.open) return;
    const id = st().id; if (!id) return;
    scrolls[id] = Math.round(window.scrollY);
    clearTimeout(scrollSaveTimer); scrollSaveTimer = setTimeout(persistScrolls, 200);
  }
  window.addEventListener('scroll', recordScroll, { passive: true });
  function restoreScroll() {
    const y = scrolls[st().id] || 0;
    window.scrollTo(0, y);
    requestAnimationFrame(() => window.scrollTo(0, y));
  }

  let pendingUrl = null; let urlTimer = 0;
  function scheduleReplaceUrl(url, patch) {
    pendingUrl = { url, patch };
    clearTimeout(urlTimer);
    urlTimer = setTimeout(flushReplaceUrl, CONFIG.URL_DEBOUNCE_MS);
  }
  function flushReplaceUrl() {
    clearTimeout(urlTimer);
    if (!pendingUrl) return;
    const { url, patch } = pendingUrl; pendingUrl = null;
    try { history.replaceState(Object.assign({}, st(), patch || {}), '', url); } catch (e) { /* batas Safari */ }
    renderedHref = location.href;
  }
  function patchState(patch) {
    try { history.replaceState(Object.assign({}, st(), patch), '', location.href); } catch (e) { /* abaikan */ }
  }

  function navigate(url, extraState) {
    flushReplaceUrl();
    recordScroll(); persistScrolls();
    history.pushState(Object.assign({ id: newId() }, extraState || {}), '', url);
    render();
    window.scrollTo(0, 0);
    focusHeading();
  }
  function focusHeading() {
    const hd = main.querySelector('h1');
    if (hd) { hd.setAttribute('tabindex', '-1'); hd.focus({ preventScroll: true }); }
  }

  document.addEventListener('click', (e) => {
    const a = e.target.closest && e.target.closest('a[data-nav]');
    if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    const href = new URL(a.getAttribute('href'), location.href);
    navigate(href.pathname + href.search);
  });

  window.addEventListener('popstate', (e) => {
    // URL pencarian yang belum tersimpan milik entri yang baru ditinggalkan. Jangan sampai
    // menimpa entri tujuan (mengetik lalu Back dalam 300 ms).
    clearTimeout(urlTimer); pendingUrl = null;
    const s = e.state || {};
    if (panel.open) {
      if (location.href === renderedHref) { closePanelNow(true); return; }
      closePanelNow(false);
    }
    if (s.panel) { // Forward ke entri panel lama: jangan buka ulang panel
      patchState({ panel: false });
      if (location.href === renderedHref) return;
    }
    if (!s.id) patchState({ id: newId() });
    render();
    restoreScroll();
    focusHeading();
  });

  /* ================= Render umum ================= */
  function teardown() {
    cleanupFns.forEach((fn) => fn()); cleanupFns = [];
    fixedLayer.textContent = '';
    document.documentElement.style.setProperty('--cta-h', '0px');
    document.documentElement.style.setProperty('--stick-h', '0px');
    document.body.classList.remove('searching', 'has-cta');
  }
  function setView(title, ...nodes) {
    main.textContent = '';
    appendAll(main, nodes);
    document.title = title ? title + ' | BERKAH CELL' : 'BERKAH CELL — Daftar Harga Servis HP Batam';
    const help = document.querySelector('.btn-help');
    if (help) { if (readRoute().name === 'help') help.setAttribute('aria-current', 'page'); else help.removeAttribute('aria-current'); }
  }
  function render() {
    renderedHref = location.href;
    teardown();
    if (S.status === 'loading') return renderLoading();
    if (S.status === 'error') return renderError();
    if (S.status === 'empty') return renderEmpty();
    const r = readRoute();
    if (r.name === 'help') return renderHelp();
    if (r.name === 'brand') return renderBrand(r);
    if (r.name === 'detail') return renderDetail(r);
    return renderHome(r);
  }
  function crumb(items) {
    return h('nav', { class: 'crumb', 'aria-label': 'Navigasi' },
      h('div', { class: 'wrap' }, h('ol', null, items.map((it) => h('li', null,
        it.href ? h('a', { href: it.href, 'data-nav': true }, it.label) : h('span', { 'aria-current': 'page' }, it.label))))));
  }
  // F19: informasi toko. Tidak merender apa pun tanpa data dari pemilik.
  const hasStore = () => !!(CONFIG.STORE && CONFIG.STORE.address && CONFIG.STORE.mapsUrl);
  // Chrome Android membuka tautan web Maps di tab browser, bukan di aplikasi. Di Android (bukan WebView
  // aplikasi lain) tautan diubah menjadi intent ke aplikasi Google Maps, dengan cadangan tautan yang sama
  // di browser bila aplikasi tidak terpasang. iPhone dan desktop memakai tautan biasa.
  const USE_MAPS_INTENT = /Android/i.test(navigator.userAgent) && !/; wv\)/.test(navigator.userAgent);
  function mapsAttrs(url) {
    if (USE_MAPS_INTENT && /^https:\/\//.test(url)) {
      return { href: 'intent://' + url.slice(8) + '#Intent;scheme=https;package=com.google.android.apps.maps;S.browser_fallback_url=' + encodeURIComponent(url) + ';end' };
    }
    return { href: url, target: '_blank', rel: 'noopener' };
  }
  const mapsLink = (cls, label) => h('a', Object.assign({ class: cls }, mapsAttrs(CONFIG.STORE.mapsUrl)), icon('pin', 16), label);
  function storeBlock() {
    if (!hasStore()) return null;
    const s = CONFIG.STORE;
    return h('section', { class: 'box store', 'aria-labelledby': 'judul-toko' },
      h('h2', { id: 'judul-toko', text: 'Kunjungi toko' }),
      h('p', { class: 'store-line addr' }, icon('pin', 16), s.address),
      s.hours ? h('p', { class: 'store-line hours' }, icon('clock', 16), s.hours) : null,
      openStatusEl(),
      h('div', { class: 'acts' }, mapsLink('btn-sec', 'Buka di Google Maps')));
  }

  // Status buka/tutup dari jam buka pemilik (setiap hari), dihitung dalam WIB, bukan jam HP.
  function openStatus() {
    const s = CONFIG.STORE;
    if (!s || !s.open || !s.close) return null;
    let now;
    try {
      const parts = new Intl.DateTimeFormat('en-GB', { timeZone: s.tz || 'Asia/Jakarta', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(new Date());
      now = Number(parts.find((x) => x.type === 'hour').value) * 60 + Number(parts.find((x) => x.type === 'minute').value);
    } catch (e) { return null; }
    const min = (t) => { const [a, b] = t.split(':').map(Number); return a * 60 + b; };
    const label = (t) => t.replace(':', '.') + ' WIB';
    if (now >= min(s.open) && now < min(s.close)) return { open: true, text: 'Buka sekarang · sampai ' + label(s.close) };
    return { open: false, text: 'Tutup sekarang · buka ' + (now < min(s.open) ? 'hari ini' : 'besok') + ' pukul ' + label(s.open) };
  }
  function openStatusEl() {
    const st = openStatus(); if (!st) return null;
    return h('p', { class: 'open-status' + (st.open ? ' is-open' : '') }, h('span', { class: 'dot', 'aria-hidden': 'true' }), h('span', { class: 'txt', text: st.text }));
  }
  function refreshOpenStatus() {
    const st = openStatus(); if (!st) return;
    document.querySelectorAll('.open-status').forEach((el) => {
      el.classList.toggle('is-open', st.open);
      const t = el.querySelector('.txt'); if (t.textContent !== st.text) t.textContent = st.text;
    });
  }

  // Alur servis di beranda: hanya fakta yang sudah ada (cara kerja situs, alamat, pemeriksaan gratis).
  function stepsBlock() {
    const s = hasStore() ? CONFIG.STORE : null;
    const steps = [
      ['Cek harga di sini', 'Cari tipe HP kamu, lalu pilih layanan yang dibutuhkan.'],
      ['Tanya lewat WhatsApp', 'Pesan sudah berisi tipe HP dan layanan pilihanmu.'],
      ['Bawa HP ke toko', (s ? s.address + '. ' : '') + 'Pemeriksaan gratis.'],
    ];
    return h('section', { class: 'steps', 'aria-labelledby': 'judul-langkah' },
      h('h2', { class: 'sec-title', id: 'judul-langkah', text: 'Cara servis di BERKAH CELL' }),
      h('ol', { class: 'steps-list' }, steps.map(([t, d], i) =>
        h('li', null, h('span', { class: 'n', 'aria-hidden': 'true', text: String(i + 1) }), h('div', null, h('b', { text: t }), h('p', { text: d }))))));
  }
  function storeLine() {
    if (!hasStore()) return null;
    const s = CONFIG.STORE;
    return h('p', { class: 'store-mini' }, 'Toko: ', h('span', { class: 'addr', text: s.address }), s.hours ? ' · ' + s.hours : '');
  }

  function helpCard(title, text, label, onclick) {
    return h('div', { class: 'helpcard' }, h('h2', { text: title }), h('p', { text }),
      h('button', { type: 'button', class: 'link-btn', onclick }, label, icon('chev', 16)));
  }

  /* ================= Beranda & pencarian ================= */
  // Badge keahlian andalan (D10). Tidak tampil bila daftar harga belum punya layanannya.
  function specialtyLink(disabled) {
    const sp = CONFIG.SPECIALTY;
    if (disabled || !sp || !S.catalog || !serviceSearch(S.catalog.models, sp.q).length) return null;
    return h('a', { class: 'andalan', href: urlFor({ name: 'home', q: sp.q }), 'data-nav': true },
      icon('lock', 16), h('span', null, 'Andalan kami: ', h('b', { text: sp.label })), icon('chev', 16));
  }
  function heroBlock(opts) {
    const disabled = !!opts.disabled;
    const input = h('input', {
      type: 'search', id: 'q', name: 'q', autocomplete: 'off', autocapitalize: 'none', spellcheck: 'false',
      enterkeyhint: 'search', placeholder: disabled ? opts.placeholder : 'Ketik tipe HP, mis. iPhone 11',
      disabled, 'aria-describedby': 'q-status',
    });
    const clearBtn = h('button', { type: 'button', class: 'clear', 'aria-label': 'Hapus kata pencarian', hidden: true }, icon('x', 18));
    const form = h('form', { class: 'searchbox' + (disabled ? ' disabled' : ''), role: 'search', onsubmit: (e) => { e.preventDefault(); input.blur(); } },
      h('label', { for: 'q', class: 'vh', text: 'Cari tipe HP' }), icon('search', 22), input, clearBtn);
    const hero = h('section', { class: 'hero' }, h('div', { class: 'wrap' },
      h('img', { class: 'mascot', src: 'assets/maskot-melambai.webp', alt: '', width: 66, height: 81 }),
      h('p', { class: 'eyebrow', text: 'Daftar harga servis HP' }),
      h('h1', null, 'Cari harga ', h('span', { class: 'gold', text: 'servis' }), ' untuk HP kamu'),
      h('p', { class: 'lead', text: 'Ketik tipe HP atau pilih merek di bawah.' }),
      form,
      specialtyLink(disabled),
      // Hanya fakta yang sudah diputuskan pemilik (PRD v0.4): tidak boleh ada klaim karangan.
      h('ul', { class: 'trust', 'aria-label': 'Ketentuan servis' },
        h('li', null, icon('check', 18), 'Pemeriksaan gratis'),
        h('li', null, icon('check', 18), 'Harga termasuk jasa pemasangan'),
        h('li', null, icon('check', 18), 'Garansi tertera per layanan'))));
    return { hero, input, clearBtn };
  }

  // Pelanggan sering mengetik tanpa spasi ("vivoy91") atau dengan spasi lain ("y 91").
  // Selain cocok biasa, kata kunci juga dibandingkan dalam bentuk rapat. Kecocokan rapat
  // harus dimulai di awal kata, supaya "e1" tidak cocok dengan "iphone 13".
  function matcher(q) {
    const n = lower(q); const nc = compact(n);
    const toks = n.split(' ').filter((t) => compact(t)).map((t) => [t, compact(t)]);
    return (m) => {
      let score = -1;
      m.hay.forEach((hs, k) => {
        const hc = m.hayC[k];
        if (hs === n || (nc && hc.c === nc)) score = Math.max(score, 3);
        else if (hs.startsWith(n) || compactAt(hc, nc) === 0) score = Math.max(score, 2);
        else if (hs.includes(n) || compactAt(hc, nc) > 0) score = Math.max(score, 1);
        else if (toks.length && toks.every(([t, tc]) => hs.includes(t) || compactAt(hc, tc) >= 0)) score = Math.max(score, 0);
      });
      return score;
    };
  }
  function search(q) {
    if (!lower(q)) return [];
    const scoreOf = matcher(q);
    const out = [];
    for (const m of S.catalog.models) {
      const score = scoreOf(m);
      if (score >= 0) out.push({ m, score });
    }
    out.sort((a, b) => b.score - a.score || collator.compare(a.m.brand.name, b.m.brand.name) || collator.compare(a.m.name, b.m.name));
    return out.map((x) => x.m);
  }
  // Cadangan bila tidak ada nama tipe yang cocok: cari lewat nama layanan, mis. "bypass",
  // "icloud", "lcd y91", "baterai". Setiap kata harus cocok dengan satu layanan atau nama tipe.
  function svcAlias(t) {
    if (SERVICE_ALIAS[t]) return SERVICE_ALIAS[t];
    const k = t.length >= 3 ? Object.keys(SERVICE_ALIAS).find((a) => a.startsWith(t)) : null;
    return k ? SERVICE_ALIAS[k] : '';
  }
  function serviceSearch(list, q) {
    const toks = lower(q).split(' ').map(compact).filter(Boolean);
    if (!toks.length) return [];
    const inSvc = (g, t) => compactAt(g.hayC, t) >= 0 || compactAt(g.hayC, svcAlias(t)) >= 0;
    const inModel = (m, t) => m.hayC.some((hc) => compactAt(hc, t) >= 0);
    const out = [];
    for (const m of list) {
      const g = m.services.find((sv) => toks.some((t) => inSvc(sv, t)) && toks.every((t) => inSvc(sv, t) || inModel(m, t)));
      if (g) out.push({ m, svc: g });
    }
    return out;
  }
  // Ringkasan satu layanan untuk baris hasil: "Bypass · Rp 100.000" atau rentang harga dari data.
  function svcSummary(g) {
    const prices = g.variants.filter((v) => v.price.ok).map((v) => v.price.value);
    if (!prices.length) return g.name + ' · tanyakan harga';
    const lo = Math.min(...prices); const hi = Math.max(...prices);
    return g.name + ' · ' + (lo === hi ? formatRp(lo) : formatRp(lo) + ' – ' + formatRp(hi));
  }
  const modelHref = (m) => urlFor({ name: 'detail', brand: m.brand.key, model: m.key });
  const brandHref = (b) => urlFor({ name: 'brand', brand: b.key });
  function modelItem(m, opts) {
    const svc = opts && opts.svc ? svcSummary(opts.svc) : m.services.length + ' layanan';
    return h('li', null, h('a', { class: 'li' + (opts && opts.current ? ' cur' : ''), href: modelHref(m), 'data-nav': true },
      h('span', null,
        h('span', { class: 't' }, opts && opts.short ? m.name : m.fullName, opts && opts.current ? h('span', { class: 'badge-cur', text: 'Sedang dilihat' }) : null),
        h('span', { class: 's', text: svc, style: null })),
      icon('chev', 20)));
  }

  function renderHome(r) {
    const { hero, input, clearBtn } = heroBlock({});
    const status = h('p', { class: 'meta-line', id: 'q-status', role: 'status' });
    const body = h('div', { class: 'wrap section' });
    setView('', hero, h('div', { class: 'wrap' }, status), body);
    status.hidden = true;

    function update(q) {
      const n = clean(q);
      document.body.classList.toggle('searching', !!n);
      clearBtn.hidden = !q;
      body.textContent = '';
      if (!n) {
        status.hidden = true; status.textContent = '';
        appendAll(body, brandGrid(), stepsBlock(), helpCard('Tipe HP kamu belum ada?', 'Daftar harga terus dilengkapi. Tanyakan langsung ke kami.',
          'Tanya servis via WhatsApp', () => openPanel({ kind: 'general' })), storeBlock());
        return;
      }
      let res = search(n).map((m) => ({ m }));
      if (!res.length) {
        res = serviceSearch(S.catalog.models, n)
          .sort((a, b) => collator.compare(a.m.brand.name, b.m.brand.name) || collator.compare(a.m.name, b.m.name));
      }
      status.hidden = false;
      if (!res.length) {
        status.textContent = 'Tidak ada tipe yang cocok dengan “' + n + '”.';
        status.classList.add('vh');
        appendAll(body, notFoundState(n, input));
        return;
      }
      status.classList.remove('vh');
      const svcNames = [...new Set(res.map((x) => (x.svc ? x.svc.name : '')))];
      status.textContent = res.length + ' tipe ' + (svcNames.length === 1 && svcNames[0] ? 'dengan layanan ' + svcNames[0] : 'cocok dengan “' + n + '”');
      appendAll(body, h('ul', { class: 'list' }, res.map((x) => modelItem(x.m, { svc: x.svc }))),
        helpCard('Bukan tipe yang kamu cari?', 'Tanyakan tipe lain lewat WhatsApp.', 'Tanya servis via WhatsApp',
          () => openPanel({ kind: 'notfound', query: n })));
    }

    input.value = r.q;
    update(r.q);
    input.addEventListener('input', () => {
      update(input.value);
      scheduleReplaceUrl(urlFor({ name: 'home', q: clean(input.value) }));
    });
    clearBtn.addEventListener('click', () => {
      input.value = ''; update(''); scheduleReplaceUrl(urlFor({ name: 'home', q: '' })); input.focus();
    });
  }
  function brandGrid() {
    const total = S.catalog.models.length;
    return h('section', { 'aria-labelledby': 'judul-merek' },
      h('h2', { class: 'sec-title', id: 'judul-merek' }, 'Pilih merek', h('small', { text: total + ' tipe tercatat' })),
      h('ul', { class: 'grid-brands', role: 'list' }, S.catalog.brandList.map((b) => h('li', { style: null },
        h('a', { class: 'tile', href: brandHref(b), 'data-nav': true }, h('b', { text: b.name }), h('span', { text: b.list.length + ' tipe' }), icon('chev', 18))))));
  }
  function notFoundState(q, input) {
    const top = [...S.catalog.brandList].sort((a, b) => b.list.length - a.list.length).slice(0, 4);
    return h('div', { class: 'state' },
      h('img', { src: 'assets/maskot-bingung.webp', alt: '', width: 78, height: 100 }),
      h('h2', { text: 'Harga untuk “' + q + '” belum tercantum' }),
      h('p', { text: 'Daftar harga kami masih terus dilengkapi. Tanyakan ke BERKAH CELL untuk mengetahui pilihan layanan dan harganya.' }),
      h('div', { class: 'acts' },
        h('button', { type: 'button', class: 'btn-pri', onclick: () => openPanel({ kind: 'notfound', query: q }) }, waIcon(), 'Tanyakan lewat WhatsApp'),
        h('button', { type: 'button', class: 'btn-ghost', onclick: () => { window.scrollTo(0, 0); input.focus(); input.select(); } }, icon('search', 18), 'Cari tipe lain')),
      h('p', { text: 'Atau pilih merek:' }),
      h('div', { class: 'chips' }, top.map((b) => h('a', { class: 'chip', href: brandHref(b), 'data-nav': true, text: b.name })),
        h('a', { class: 'chip', href: urlFor({ name: 'home' }), 'data-nav': true, text: 'Semua merek' })));
  }

  /* ================= Daftar tipe ================= */
  function findBrand(param) { return S.catalog.brands.get(brandKeyOf(param)) || null; }
  function renderBrand(r) {
    const b = findBrand(r.brand);
    if (!b) return renderNotListed(r.brand);
    const ganti = st().ganti ? b.models.get(st().ganti) : null;
    const filterInput = h('input', { type: 'search', id: 'f', autocomplete: 'off', autocapitalize: 'none', spellcheck: 'false', placeholder: 'Cari tipe ' + b.name + '…' });
    const listWrap = h('div');
    setView('Tipe ' + b.name,
      crumb([{ label: 'Semua merek', href: urlFor({ name: 'home' }) }, { label: b.name }]),
      h('div', { class: 'wrap' },
        h('div', { class: 'page-title' }, h('p', { class: 'eb', text: 'Pilih tipe' }), h('h1', { text: b.name }), h('p', { class: 'm', text: b.list.length + ' tipe tercatat' })),
        h('div', { class: 'filter' }, h('label', { for: 'f', class: 'vh', text: 'Cari tipe ' + b.name }), icon('search', 18), filterInput),
        ganti ? h('p', { class: 'notice' }, icon('swap', 16), h('span', null, 'Ganti dari ', h('b', { text: ganti.fullName }), '. Pilih tipe lain di bawah.')) : null,
        listWrap,
        helpCard('Tipe ' + b.name + ' kamu belum ada?', 'Daftar harga terus dilengkapi. Tanyakan langsung ke kami.', 'Tanya servis via WhatsApp',
          () => openPanel({ kind: 'brand', brand: b }))));
    function update(f) {
      const n = lower(f);
      const scoreOf = matcher(n);
      let items = (n ? b.list.filter((m) => scoreOf(m) >= 0) : b.list).map((m) => ({ m }));
      if (n && !items.length) items = serviceSearch(b.list, n);
      listWrap.textContent = '';
      if (!items.length) {
        appendAll(listWrap, h('p', { class: 'meta-line', role: 'status', text: 'Tidak ada tipe ' + b.name + ' yang cocok dengan “' + clean(f) + '”.' }));
        return;
      }
      appendAll(listWrap, h('ul', { class: 'list' }, items.map((x) => modelItem(x.m, { short: true, current: ganti && x.m === ganti, svc: x.svc }))));
    }
    filterInput.value = st().f || '';
    update(filterInput.value);
    filterInput.addEventListener('input', () => {
      update(filterInput.value);
      scheduleReplaceUrl(location.pathname + location.search, { f: filterInput.value });
    });
  }

  /* ================= Detail harga ================= */
  function findModel(r) {
    const b = findBrand(r.brand); if (!b) return null;
    return b.models.get(lower(r.model)) || null;
  }
  function serviceIcon(name) {
    const n = name.toLowerCase();
    for (const [keys, ic] of SERVICE_ICONS) if (keys.some((k) => n.includes(k))) return ic;
    return 'tool';
  }
  function selectedOf(m) {
    const sel = st().sel; if (!sel) return null;
    const [gi, vi] = String(sel).split('-').map(Number);
    const s = m.services[gi]; const v = s && s.variants[vi];
    return v ? { service: s, variant: v, id: sel } : null;
  }
  function qualPart(v) {
    if (v.kualitas.kind === 'quality') return ' (' + v.kualitas.text + ')';
    if (v.kualitas.kind === 'jasa') return ' (jasa servis)';
    return '';
  }
  function selectedMessage(m, sel) {
    let t = 'Halo BERKAH CELL, saya ingin menanyakan servis ' + m.fullName + ': ' + sel.service.name + qualPart(sel.variant) + '.';
    if (sel.variant.price.ok) t += ' Harga di website ' + formatRpCompact(sel.variant.price.value) + '.';
    return t;
  }
  function complaintMessage(m, sel) {
    if (!m) return 'Halo BERKAH CELL, saya ingin mengonfirmasi harga servis yang berbeda dengan daftar harga di website. Mohon dibantu cek.';
    let t = 'Halo BERKAH CELL, saya ingin mengonfirmasi harga servis ' + m.fullName + '. Harga yang saya terima berbeda dengan yang tertera di website.';
    if (sel) t += ' Layanan: ' + sel.service.name + qualPart(sel.variant) + (sel.variant.price.ok ? ', harga di website ' + formatRpCompact(sel.variant.price.value) : '') + '.';
    return t + ' Mohon dibantu cek.';
  }

  // F11: bagikan tautan detail lewat menu berbagi HP; cadangan salin tautan.
  async function shareModel(m, note) {
    const url = location.origin + modelHref(m);
    note.textContent = ''; // live region tetap ada di DOM supaya pesan dibacakan pembaca layar
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Harga servis ' + m.fullName + ' — BERKAH CELL', text: 'Cek harga servis ' + m.fullName + ' di BERKAH CELL:', url });
        return;
      } catch (e) {
        if (e && e.name === 'AbortError') return; // dibatalkan pelanggan
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      appendAll(note, icon('check', 16), 'Tautan disalin. Tempel di chat untuk membagikan.');
    } catch (e) {
      const input = h('input', { type: 'text', readonly: true, value: url, 'aria-label': 'Tautan harga ' + m.fullName });
      appendAll(note, h('span', { text: 'Salin tautan ini:' }), input);
      input.focus(); input.select();
      return;
    }
  }

  function renderDetail(r) {
    const m = findModel(r);
    if (!m) return renderNotListed(r.brand + ' ' + r.model, r.brand);
    const b = m.brand;
    const gantiBtn = (cls) => h('button', { type: 'button', class: cls, onclick: () => navigate(brandHref(b), { ganti: m.key }) }, icon('swap', 16), cls.includes('sm') ? 'Ganti tipe' : 'Ganti tipe HP');
    const h1 = h('h1', { text: m.fullName });
    const shareNote = h('div', { class: 'share-note', role: 'status' });
    const devHead = h('section', { class: 'dev', 'aria-label': 'Perangkat' }, h('div', { class: 'wrap' },
      h('p', { class: 'eb', text: b.name }),
      h('div', { class: 'row1' }, h1, gantiBtn('btn-sec')),
      h('div', { class: 'row2' },
        h('p', { class: 'm', text: m.services.length + ' layanan · ' + m.optionCount + ' pilihan harga' }),
        h('button', { type: 'button', class: 'link-btn share', onclick: () => shareModel(m, shareNote) }, icon('share', 16), 'Bagikan harga ini')),
      shareNote));

    const rowButtons = [];
    const services = h('div', { class: 'services' }, m.services.map((s, gi) => {
      const titleId = 'svc-' + gi;
      return h('section', { class: 'svc', 'aria-labelledby': titleId },
        h('h2', { id: titleId }, h('span', { class: 'ic' }, icon(serviceIcon(s.name), 18)), s.name),
        s.variants.map((v, vi) => {
          const id = gi + '-' + vi;
          const btn = h('button', { type: 'button', class: 'var', 'aria-pressed': 'false', 'data-sel': id },
            h('span', { class: 'radio' }, icon('check', 14)),
            h('span', { class: 'main' },
              h('span', { class: 'top' },
                v.kualitas.kind === 'quality' ? h('span', { class: 'q', text: v.kualitas.text }) :
                  v.kualitas.kind === 'jasa' ? h('span', { class: 'q jasa', text: v.kualitas.text }) : null,
                v.price.ok ? h('span', { class: 'price', text: formatRp(v.price.value) }) : h('span', { class: 'price ask', text: 'Tanyakan harga' })),
              h('span', { class: 'sub' },
                v.est ? h('span', null, icon('clock', 15), 'Estimasi ' + v.est) : null,
                h('span', null, icon('shield', 15), v.garansi))));
          btn.setAttribute('aria-label', [s.name, v.kualitas.text, v.price.ok ? formatRp(v.price.value) : 'tanyakan harga', v.est ? 'estimasi ' + v.est : '', v.garansi].filter(Boolean).join(', '));
          btn.addEventListener('click', () => {
            patchState({ sel: st().sel === id ? null : id });
            syncSelection();
          });
          rowButtons.push(btn);
          return btn;
        }));
    }));

    const complaintLink = h('a', { class: 'link-btn', target: '_blank', rel: 'noopener', href: '#' }, 'Konfirmasi harga ke owner', icon('chev', 16));
    const content = h('div', { class: 'wrap' },
      h('p', { class: 'hint', text: 'Ketuk satu pilihan untuk menanyakannya langsung.' }),
      services,
      h('section', { class: 'box gold', 'aria-labelledby': 'judul-belum-ada' },
        h('h2', { id: 'judul-belum-ada', text: 'Layanan yang kamu cari belum ada?' }),
        h('p', { text: 'Tanyakan ke kami. Kami bantu cek untuk ' + m.fullName + '.' }),
        h('button', { type: 'button', class: 'link-btn', onclick: () => openPanel({ kind: 'unlisted', model: m }) }, 'Tanyakan layanan lain', icon('chev', 16))),
      h('section', { class: 'box', 'aria-labelledby': 'judul-bantuan' },
        h('h2', { id: 'judul-bantuan', text: 'Bantuan' }),
        h('ul', null,
          h('li', { text: 'Harga sudah termasuk jasa pemasangan untuk layanan tersebut.' }),
          h('li', { text: 'Pemeriksaan tidak dikenakan biaya.' }),
          h('li', { text: 'Garansi dan estimasi mengikuti keterangan setiap layanan. Estimasi adalah perkiraan.' })),
        h('p', { text: 'Harga berbeda dari yang ditagih? Sampaikan ke owner lewat WhatsApp toko.' }),
        complaintLink,
        storeLine(),
        hasStore() ? mapsLink('link-btn', 'Buka lokasi toko di Google Maps') : null));

    setView(m.fullName + ' — Harga Servis',
      crumb([{ label: 'Semua merek', href: urlFor({ name: 'home' }) }, { label: b.name, href: brandHref(b) }, { label: m.name }]),
      devHead, content);

    // Header identitas yang menempel saat menggulir.
    const sticky = h('div', { class: 'sticky-dev', hidden: true },
      h('div', { class: 'wrap' }, h('p', { class: 'nm' }, h('small', { text: b.name }), m.fullName), gantiBtn('btn-sec sm')));
    // Bar tombol utama di bawah.
    const ctaCtx = h('p', { class: 'ctx' });
    const ctaSlot = h('div');
    const cta = h('div', { class: 'cta' }, h('div', { class: 'wrap' }, ctaCtx, ctaSlot));
    fixedLayer.append(sticky, cta);
    document.body.classList.add('has-cta');

    const ro = new ResizeObserver(() => {
      document.documentElement.style.setProperty('--cta-h', cta.offsetHeight + 'px');
      if (!sticky.hidden) document.documentElement.style.setProperty('--stick-h', sticky.offsetHeight + 'px');
    });
    ro.observe(cta); ro.observe(sticky);
    const io = new IntersectionObserver(([en]) => {
      const show = !en.isIntersecting && en.boundingClientRect.top < 0;
      sticky.hidden = !show;
      document.documentElement.style.setProperty('--stick-h', show ? sticky.offsetHeight + 'px' : '0px');
    });
    io.observe(h1);
    cleanupFns.push(() => { ro.disconnect(); io.disconnect(); });

    function syncSelection() {
      const sel = selectedOf(m);
      rowButtons.forEach((btn) => btn.setAttribute('aria-pressed', sel && btn.dataset.sel === sel.id ? 'true' : 'false'));
      ctaCtx.textContent = ''; ctaSlot.textContent = '';
      if (sel) {
        appendAll(ctaCtx, h('span', null, 'Dipilih: ', h('b', { text: sel.service.name + (sel.variant.kualitas.text ? ' · ' + sel.variant.kualitas.text : '') })),
          h('span', { class: 'p', text: sel.variant.price.ok ? formatRp(sel.variant.price.value) : 'Tanyakan harga' }));
        ctaCtx.hidden = false;
        ctaSlot.append(waLink(selectedMessage(m, sel), 'Tanya servis ini via WhatsApp', 'btn-pri'));
      } else {
        ctaCtx.hidden = true;
        ctaSlot.append(h('button', { type: 'button', class: 'btn-pri', onclick: () => openPanel({ kind: 'device', model: m }) }, waIcon(), 'Tanya servis via WhatsApp'));
      }
      complaintLink.href = waUrl(complaintMessage(m, sel));
    }
    syncSelection();
  }

  function renderNotListed(text, brandParam) {
    const b = brandParam ? findBrand(brandParam) : null;
    const q = clean(text);
    setView('Tipe belum tercantum',
      crumb([{ label: 'Semua merek', href: urlFor({ name: 'home' }) }].concat(b ? [{ label: b.name, href: brandHref(b) }] : [])),
      h('div', { class: 'wrap' }, h('div', { class: 'state' },
        h('img', { src: 'assets/maskot-bingung.webp', alt: '', width: 78, height: 100 }),
        h('h1', { text: 'Harga untuk “' + q + '” belum tercantum' }),
        h('p', { text: 'Daftar harga kami masih terus dilengkapi. Tanyakan ke BERKAH CELL untuk mengetahui pilihan layanan dan harganya.' }),
        h('div', { class: 'acts' },
          h('button', { type: 'button', class: 'btn-pri', onclick: () => openPanel({ kind: 'notfound', query: q }) }, waIcon(), 'Tanyakan lewat WhatsApp'),
          h('a', { class: 'btn-ghost', href: urlFor({ name: 'home' }), 'data-nav': true }, 'Semua merek')))));
  }

  /* ================= Bantuan ================= */
  function renderHelp() {
    setView('Bantuan',
      crumb([{ label: 'Semua merek', href: urlFor({ name: 'home' }) }, { label: 'Bantuan' }]),
      h('div', { class: 'wrap help' },
        h('div', { class: 'page-title' }, h('p', { class: 'eb', text: 'BERKAH CELL' }), h('h1', { text: 'Bantuan' })),
        h('section', { class: 'box' },
          h('h2', { text: 'Ketentuan harga' }),
          h('ul', null,
            h('li', { text: 'Harga servis yang tercantum sudah termasuk jasa pemasangan untuk layanan tersebut.' }),
            h('li', { text: 'Pemeriksaan tidak dikenakan biaya.' }),
            h('li', { text: 'Garansi mengikuti keterangan pada setiap layanan.' }),
            h('li', { text: 'Estimasi waktu adalah perkiraan, bukan janji pasti.' }),
            h('li', { text: 'Tipe atau layanan yang belum tercantum tetap bisa ditanyakan. Daftar harga terus dilengkapi.' }))),
        h('section', { class: 'box' },
          h('h2', { text: 'Tanya servis' }),
          h('p', null, 'WhatsApp BERKAH CELL: ', h('span', { class: 'phone-no', text: CONFIG.WA_DISPLAY })),
          h('div', { class: 'acts' },
            h('button', { type: 'button', class: 'btn-pri', onclick: () => openPanel({ kind: 'general' }) }, waIcon(), 'Tanya servis via WhatsApp'))),
        storeBlock(),
        h('section', { class: 'box' },
          h('h2', { text: 'Harga berbeda dari yang ditagih?' }),
          h('p', { text: 'Sampaikan ke owner lewat WhatsApp toko yang sama. Sebutkan tipe HP dan layanannya.' }),
          h('div', { class: 'acts' }, waLink(complaintMessage(null), 'Konfirmasi harga ke owner', 'btn-ghost')))));
  }

  /* ================= Kondisi data ================= */
  function renderLoading() {
    const { hero } = heroBlock({ disabled: true, placeholder: 'Memuat daftar harga…' });
    setView('', hero, h('div', { class: 'wrap section', 'aria-busy': 'true' },
      h('p', { class: 'vh', role: 'status', text: 'Memuat daftar harga…' }),
      h('h2', { class: 'sec-title', text: 'Pilih merek' }),
      h('div', { class: 'grid-brands', 'aria-hidden': 'true' }, Array.from({ length: 6 }, () => h('div', { class: 'tile skel' })))));
  }
  function renderError() {
    const { hero } = heroBlock({ disabled: true, placeholder: 'Pencarian tersedia setelah data dimuat' });
    setView('Daftar harga belum berhasil dimuat', hero, h('div', { class: 'wrap' }, h('div', { class: 'state' },
      h('div', { class: 'ico' }, icon('cloudoff', 32)),
      h('h2', { text: 'Daftar harga belum berhasil dimuat' }),
      h('p', { text: 'Coba lagi atau hubungi BERKAH CELL.' }),
      h('div', { class: 'acts' },
        h('button', { type: 'button', class: 'btn-pri', id: 'retry', onclick: () => loadData() }, icon('refresh', 20), 'Coba lagi'),
        h('button', { type: 'button', class: 'btn-ghost', onclick: () => openPanel({ kind: 'error' }) }, waIcon(), 'Hubungi via WhatsApp'))),
      storeBlock()));
  }
  function renderEmpty() {
    setView('Daftar harga belum tersedia', h('div', { class: 'wrap' }, h('div', { class: 'state' },
      h('div', { class: 'ico' }, icon('list', 30)),
      h('h1', { text: 'Daftar harga belum tersedia' }),
      h('p', { text: 'Tanyakan harga servis langsung ke BERKAH CELL.' }),
      h('div', { class: 'acts' }, h('button', { type: 'button', class: 'btn-pri', onclick: () => openPanel({ kind: 'general' }) }, waIcon(), 'Tanya servis via WhatsApp'))),
      storeBlock()));
  }

  async function loadData() {
    S.status = 'loading'; render();
    const ctrl = typeof AbortController === 'function' ? new AbortController() : null;
    const timer = setTimeout(() => ctrl && ctrl.abort(), CONFIG.LOAD_TIMEOUT_MS);
    let rows;
    try {
      const res = await fetch(CONFIG.SHEET_CSV_URL, { signal: ctrl ? ctrl.signal : undefined, cache: 'no-store', credentials: 'omit' });
      if (!res.ok) throw new Error('http ' + res.status);
      rows = parseCSV(await res.text());
      const header = (rows[0] || []).map(lower);
      // Respons yang bukan tabel harga (mis. halaman login) = gagal, bukan katalog kosong.
      if (!['brand', 'model', 'layanan', 'harga_jual'].every((c) => header.includes(c))) throw new Error('format');
    } catch (e) {
      clearTimeout(timer);
      S.status = 'error'; S.catalog = null; render();
      return;
    }
    clearTimeout(timer);
    S.catalog = buildCatalog(rows);
    if (S.catalog.issues.length && window.console) console.info('[BERKAH CELL] Catatan data untuk diperbaiki di Sheet:', S.catalog.issues);
    S.status = S.catalog.models.length ? 'ready' : 'empty';
    render();
    restoreScroll();
  }

  /* ================= Panel kebutuhan WhatsApp (F17) ================= */
  const panel = { open: false, ctx: null, lastFocus: null, y: 0, draft: { key: null, need: null, note: '' } };
  function ctxKey(ctx) {
    if (ctx.model) return 'm:' + ctx.model.brand.key + '|' + ctx.model.key;
    if (ctx.kind === 'notfound') return 'q:' + lower(ctx.query);
    if (ctx.brand) return 'b:' + ctx.brand.key;
    return 'g';
  }
  function panelTitle(ctx) {
    if (ctx.model) return 'Tanya servis ' + ctx.model.fullName;
    if (ctx.kind === 'notfound') return 'Tanya servis ' + clean(ctx.query);
    if (ctx.brand) return 'Tanya servis HP ' + ctx.brand.name;
    return 'Tanya servis HP';
  }
  const NEED_TEXT = { lcd: 'ganti LCD atau layar', baterai: 'ganti baterai', lainnya: 'layanan lainnya', keluhan: 'belum tahu, ingin menjelaskan keluhan' };
  function panelMessage(ctx, need, note) {
    const tail = clean(note) ? ' Keterangan: ' + clean(note) : '';
    if (ctx.kind === 'notfound') {
      const q = clean(ctx.query);
      if (!need) return 'Halo BERKAH CELL, saya mencari harga servis ' + q + ', tetapi belum menemukannya di website. Saya ingin menanyakan layanan dan harganya.' + tail;
      if (need === 'lcd') return 'Halo BERKAH CELL, saya ingin menanyakan harga ganti LCD atau layar ' + q + '. Harganya belum tercantum di website.' + tail;
      if (need === 'baterai') return 'Halo BERKAH CELL, saya ingin menanyakan harga ganti baterai ' + q + '. Harganya belum tercantum di website.' + tail;
      if (need === 'lainnya') return 'Halo BERKAH CELL, saya ingin menanyakan layanan lain untuk ' + q + '. Harganya belum tercantum di website.' + tail;
      return 'Halo BERKAH CELL, saya ingin menjelaskan keluhan pada ' + q + ' karena belum tahu layanan yang dibutuhkan. Tipe ini belum tercantum di website.' + tail;
    }
    let base;
    if (ctx.kind === 'device') base = 'Halo BERKAH CELL, saya ingin menanyakan servis ' + ctx.model.fullName + '.';
    else if (ctx.kind === 'unlisted') base = 'Halo BERKAH CELL, saya ingin menanyakan layanan untuk ' + ctx.model.fullName + ' yang belum tercantum di website.';
    else if (ctx.kind === 'brand') base = 'Halo BERKAH CELL, saya ingin menanyakan servis HP ' + ctx.brand.name + '. Tipe saya belum tercantum di website.';
    else if (ctx.kind === 'error') base = 'Halo BERKAH CELL, saya ingin menanyakan harga servis HP. Daftar harga di website belum bisa dibuka.';
    else base = 'Halo BERKAH CELL, saya ingin menanyakan servis HP.';
    return base + (need ? ' Kebutuhan: ' + NEED_TEXT[need] + '.' : '') + tail;
  }

  function openPanel(ctx) {
    if (panel.open) return;
    const key = ctxKey(ctx);
    // Isian dipertahankan selama konteks perangkat sama; dibersihkan bila perangkat berubah.
    if (panel.draft.key !== key) panel.draft = { key, need: null, note: '' };
    panel.ctx = ctx;
    panel.lastFocus = document.activeElement;
    flushReplaceUrl();

    const title = h('h2', { id: 'panel-judul', tabindex: '-1', text: panelTitle(ctx) });
    const lead = ctx.kind === 'unlisted' ? 'Ceritakan layanan yang kamu cari. Pilihan di bawah boleh dilewati.' : 'Pilih kebutuhan kalau mau. Boleh dilewati.';
    const closeBtn = h('button', { type: 'button', class: 'x-btn', 'aria-label': 'Tutup pilihan kebutuhan', onclick: requestClose }, icon('x', 20));
    const previewText = h('span');
    const go = waLink('', 'Lanjut ke WhatsApp', 'btn-pri');
    const skip = h('a', { class: 'skip', target: '_blank', rel: 'noopener', href: '#' }, 'Lewati, langsung ke WhatsApp');
    const optButtons = NEEDS.map((n) => {
      const b = h('button', { type: 'button', class: 'opt', 'aria-pressed': panel.draft.need === n.id ? 'true' : 'false' },
        h('span', { class: 'radio' }, icon('check', 14)), n.label);
      b.addEventListener('click', () => { panel.draft.need = panel.draft.need === n.id ? null : n.id; sync(); });
      b.dataset.need = n.id;
      return b;
    });
    const note = h('textarea', { id: 'panel-ket', class: 'note', maxlength: '300', rows: '2', autocomplete: 'off' });
    note.value = panel.draft.note;
    note.addEventListener('input', () => { panel.draft.note = note.value; sync(); });
    note.addEventListener('focus', () => setTimeout(() => note.scrollIntoView({ block: 'nearest' }), 300));

    function sync() {
      optButtons.forEach((b) => b.setAttribute('aria-pressed', b.dataset.need === panel.draft.need ? 'true' : 'false'));
      const msg = panelMessage(ctx, panel.draft.need, panel.draft.note);
      previewText.textContent = msg;
      go.href = waUrl(msg);
      skip.href = waUrl(panelMessage(ctx, null, ''));
    }
    const afterOpenWa = () => setTimeout(requestClose, 0);
    go.addEventListener('click', afterOpenWa);
    skip.addEventListener('click', afterOpenWa);

    const sheet = h('div', { class: 'sheet', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'panel-judul' },
      h('div', { class: 'grab', 'aria-hidden': 'true' }),
      h('div', { class: 'sheet-head' }, h('div', null, title, h('p', { class: 'lead', text: lead })), closeBtn),
      h('div', { class: 'opts', role: 'group', 'aria-label': 'Kebutuhan servis (opsional)' }, optButtons),
      h('label', { class: 'note-label', for: 'panel-ket', text: 'Keterangan tambahan (opsional)' }), note,
      h('p', { class: 'preview', 'aria-live': 'polite' }, h('b', { text: 'Pesan yang disiapkan' }), previewText),
      go, skip,
      h('p', { class: 'fine', text: 'Pesan dikirim sendiri olehmu dari WhatsApp. Tidak ada yang terkirim otomatis.' }));
    const scrim = h('div', { class: 'scrim', onclick: requestClose });
    panelLayer.textContent = '';
    panelLayer.append(scrim, sheet);
    sync();

    // Kunci gulir halaman tanpa kehilangan posisi.
    panel.y = window.scrollY;
    document.body.style.position = 'fixed';
    document.body.style.top = '-' + panel.y + 'px';
    document.body.style.left = '0';
    document.body.style.right = '0';
    shell.setAttribute('inert', ''); shell.setAttribute('aria-hidden', 'true');
    fixedLayer.setAttribute('inert', ''); fixedLayer.setAttribute('aria-hidden', 'true');
    panelLayer.hidden = false;
    panel.open = true;
    try { history.pushState(Object.assign({}, st(), { panel: true }), '', location.href); } catch (e) { /* abaikan */ }
    title.focus();
  }
  function requestClose() {
    if (!panel.open) return;
    if (st().panel) history.back(); else closePanelNow(true);
  }
  function closePanelNow(restoreFocus) {
    if (!panel.open) return;
    panel.open = false;
    panelLayer.hidden = true;
    panelLayer.textContent = '';
    shell.removeAttribute('inert'); shell.removeAttribute('aria-hidden');
    fixedLayer.removeAttribute('inert'); fixedLayer.removeAttribute('aria-hidden');
    document.body.style.position = ''; document.body.style.top = ''; document.body.style.left = ''; document.body.style.right = '';
    window.scrollTo(0, panel.y);
    if (restoreFocus && panel.lastFocus && panel.lastFocus.isConnected) panel.lastFocus.focus({ preventScroll: true });
  }
  panelLayer.addEventListener('keydown', (e) => {
    if (!panel.open) return;
    if (e.key === 'Escape') { e.preventDefault(); requestClose(); return; }
    if (e.key !== 'Tab') return;
    const f = [...panelLayer.querySelectorAll('button, a[href], textarea, [tabindex]:not([tabindex="-1"])')].filter((el) => !el.disabled && el.offsetParent !== null);
    if (!f.length) return;
    const first = f[0]; const last = f[f.length - 1];
    if (e.shiftKey && (document.activeElement === first || document.activeElement.id === 'panel-judul')) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });

  /* ================= Mulai ================= */
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  if (!st().id) patchState({ id: newId() });
  if (st().panel) patchState({ panel: false });
  window.addEventListener('pagehide', () => { recordScroll(); persistScrolls(); });
  // Tautan Maps statis di footer ikut memakai intent di Android.
  if (USE_MAPS_INTENT) {
    document.querySelectorAll('a[data-maps]').forEach((a) => {
      const at = mapsAttrs(a.getAttribute('href'));
      a.setAttribute('href', at.href); a.removeAttribute('target'); a.removeAttribute('rel');
    });
  }
  // Status "Buka sekarang" diperbarui tiap menit selama halaman terbuka.
  setInterval(refreshOpenStatus, 60000);
  loadData();
})();
