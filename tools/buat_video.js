/* Membuat video 9:16 yang memperlihatkan cara memakai website BERKAH CELL.
 *
 *   node tools/buat_video.js [folder-hasil] [--alur cari|demo|semua]
 *   (default: video-hasil/ yang tidak ikut di-commit, alur "cari")
 *
 * Alur "cari" (9 Okt 2026): hook → buka berkahcellbatam.com di browser → cari "iphone 11" → klik Ganti LCD
 * → pesan WhatsApp otomatis → Lokasi toko → penutup.
 *   berkahcell-cari-harga-organik-9x16.mp4 / -iklan-9x16.mp4 / berkahcell-cari-harga-cover.png
 * Alur "demo" (8 Okt 2026): tur fitur website.
 *   berkahcell-launching-organik-9x16.mp4 / -iklan-9x16.mp4 / berkahcell-launching-cover.png
 * Versi "organik" menampilkan website apa adanya; versi "iklan" menyembunyikan semua yang menyebut
 * Bypass iCloud supaya aman untuk iklan Meta.
 *
 * Website direkam dari site-live/ lokal di dalam bingkai HP. Harga memakai
 * tests/fixtures/price_list_publik_2026-10-06.csv (dikonfirmasi pemilik masih berlaku, 8 Okt 2026).
 * Jika harga di Sheet berubah, ganti fixture dengan ekspor terbaru sebelum membuat ulang video.
 * Butuh Playwright (Chromium) dan ffmpeg dengan libx264. Video tanpa musik: tambahkan audio di aplikasi.
 */
const fs = require('fs');
const os = require('os');
const path = require('path');
const http = require('http');
const { execFileSync } = require('child_process');
const { chromium } = require(process.env.PLAYWRIGHT_PATH || '/opt/node22/lib/node_modules/playwright');

const ROOT = path.join(__dirname, '..');
const SITE = path.join(ROOT, 'site-live');
const ARGS = process.argv.slice(2);
const ALUR = (ARGS.find((a) => a.startsWith('--alur=')) || '').slice(7) || (ARGS.includes('--alur') ? ARGS[ARGS.indexOf('--alur') + 1] : 'cari');
const OUT = path.resolve(ARGS.find((a, i) => !a.startsWith('--') && ARGS[i - 1] !== '--alur') || path.join(ROOT, 'video-hasil'));
// Sama dengan CONFIG.STORE di site-live/app.js (untuk kartu lokasi di video).
const TOKO = { alamat: 'Avava Jodoh, Lantai Dasar, Batam', status: 'Buka sekarang · sampai 20.00 WIB' };
const CSV = fs.readFileSync(path.join(ROOT, 'tests', 'fixtures', 'price_list_publik_2026-10-06.csv'), 'utf8');
const NOW = new Date('2026-10-08T05:30:00Z'); // 12.30 WIB: toko buka
const S = 0.82; // skala layar HP (390×844) di kanvas 540×960
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const studioHtml = (cari) => `<!doctype html><html lang="id"><head><meta charset="utf-8">
<style>
@font-face{font-family:PJS;font-weight:200 800;src:url(/assets/fonts/plus-jakarta-sans-latin.woff2) format("woff2")}
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:540px;height:960px;overflow:hidden;background:#071226;color:#fff;font-family:PJS,sans-serif;-webkit-font-smoothing:antialiased}
.bg{position:absolute;inset:0;background:radial-gradient(420px 340px at 88% 6%,rgba(216,181,102,.20),rgba(216,181,102,0) 70%),radial-gradient(520px 420px at -10% 104%,rgba(31,95,191,.38),rgba(31,95,191,0) 70%),linear-gradient(180deg,#0B1E3B,#071226)}
.bg::after{content:"";position:absolute;inset:0;background:url(/assets/motif-emboss-gelap.svg) 0 0/240px 240px}
.gold{background:linear-gradient(135deg,#F3DC9A 0%,#D8B566 45%,#B48A32 100%);-webkit-background-clip:text;background-clip:text;color:transparent}
/* Teks keterangan */
.cap{position:absolute;left:30px;right:30px;top:52px;height:104px;text-align:center;transition:opacity .28s ease,transform .28s ease}
.cap.out{opacity:0;transform:translateY(-10px)}
.cap .l1{font-size:29px;font-weight:800;letter-spacing:-.5px;line-height:1.15}
.cap .l2{font-size:29px;font-weight:800;letter-spacing:-.5px;line-height:1.2;padding-bottom:2px}
/* HP */
.phone{position:absolute;left:${(540 - (390 * S + 22)) / 2}px;top:168px;width:${390 * S + 22}px;height:${844 * S + 22}px;border-radius:50px;padding:11px;background:linear-gradient(145deg,#2A3346,#0B0F19 40%,#1C2333);box-shadow:0 0 0 1.5px rgba(216,181,102,.55),0 30px 70px -20px rgba(0,0,0,.85),inset 0 0 0 2px rgba(255,255,255,.06);transform:translateY(900px);transition:transform .9s cubic-bezier(.2,.8,.2,1)}
.phone.in{transform:none}
.screen{position:relative;width:${390 * S}px;height:${844 * S}px;border-radius:40px;overflow:hidden;background:#0A1A33}
.scaled{position:absolute;left:0;top:0;width:390px;height:844px;transform:scale(${S});transform-origin:0 0}
.sbar{height:40px;display:flex;align-items:center;justify-content:space-between;padding:0 26px 0 30px;font-size:15px;font-weight:700;color:#fff;background:#0A1A33}
.sbar svg{display:block}
.island{position:absolute;left:50%;top:9px;width:96px;height:26px;margin-left:-48px;border-radius:14px;background:#000;z-index:2}
iframe{display:block;width:390px;height:${cari ? 748 : 804}px;border:0;background:#F6F4EF}
/* Bilah browser generik (alur cari) */
.bbar{position:relative;height:56px;padding:8px 12px;background:#EEF1F5;border-bottom:1px solid #D9DEE6}
.field{height:40px;border-radius:20px;background:#fff;display:flex;align-items:center;gap:8px;padding:0 14px;font-size:15.5px;color:#1F2430;box-shadow:inset 0 0 0 1px #D5DAE2}
.field .ph{color:#7D8594}.field .lock{display:none;color:#5B6576}.field.done .lock{display:block}
.caret{display:none;width:2px;height:19px;background:#0A1A33;animation:blink 1s steps(1) infinite}.field.focus .caret{display:block}
@keyframes blink{50%{opacity:0}}
.prog{position:absolute;left:0;bottom:-1px;height:3px;width:0;background:linear-gradient(90deg,#B48A32,#F3DC9A)}
.prog.go{width:100%;transition:width .9s cubic-bezier(.3,.6,.3,1)}
.ntab{position:absolute;left:0;top:96px;width:390px;height:748px;background:#F7F8FA;z-index:3;transition:opacity .35s ease}
.ntab.hide{opacity:0;pointer-events:none}
.ntab .globe{position:absolute;left:50%;top:150px;margin-left:-38px;width:76px;height:76px;border-radius:50%;background:#E6EAF0;display:flex;align-items:center;justify-content:center}
.ntab .tiles{position:absolute;left:47px;right:47px;top:270px;display:grid;grid-template-columns:repeat(4,1fr);gap:22px 18px}
.ntab .tiles i{display:block;height:56px;border-radius:16px;background:#E6EAF0}
.sugg{position:absolute;left:0;right:0;top:0;background:#fff;box-shadow:0 10px 24px -14px rgba(10,26,51,.5);display:none}
.sugg.on{display:block}
.sugg .row{display:flex;align-items:center;gap:12px;padding:14px 16px}
.sugg .row img{width:34px;height:34px;border-radius:50%;box-shadow:0 0 0 1.5px rgba(216,181,102,.7)}
.sugg b{display:block;font-size:16px;color:#0F1B2D}.sugg small{display:block;font-size:13px;color:#5B6576;margin-top:1px}
/* Kartu pesan WhatsApp & lokasi (alur cari) */
.sheet{position:absolute;left:0;right:0;bottom:0;z-index:4;background:#fff;color:#0F1B2D;border-radius:24px 24px 0 0;padding:20px 20px 28px;box-shadow:0 -18px 40px -16px rgba(10,26,51,.55);transform:translateY(105%);transition:transform .5s cubic-bezier(.2,.8,.2,1)}
.sheet.on{transform:none}
.sheet .hd{display:flex;align-items:center;gap:10px;font-size:15px;font-weight:800}
.sheet .hd .ic{width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:#25D366;color:#fff}
.sheet .hd small{display:block;font-size:12.5px;font-weight:600;color:#5B6576}
.bubble{margin-top:16px;padding:12px 14px 22px;border-radius:14px 14px 4px 14px;background:#E3F8D9;font-size:15px;line-height:1.45;position:relative}
.bubble::after{content:"✓✓";position:absolute;right:10px;bottom:4px;font-size:11px;color:#4FA3E0;letter-spacing:-2px}
.sheet .send{margin-top:14px;height:48px;border-radius:24px;background:#25D366;color:#fff;font-weight:800;font-size:15.5px;display:flex;align-items:center;justify-content:center;gap:8px}
.map{height:200px;border-radius:16px;overflow:hidden;margin-top:14px;background:#F1ECE0;position:relative}
.map svg{position:absolute;inset:0}
.map .pin{position:absolute;left:236px;top:84px;width:34px;height:44px;margin:-44px 0 0 -17px}
.map .pin svg{position:static;display:block;width:34px;height:44px}
.map .pulse{position:absolute;left:50%;top:100%;width:50px;height:50px;margin:-25px 0 0 -25px;border-radius:50%;background:rgba(201,165,78,.45);animation:pulse 1.6s ease-out infinite}
.map .label{position:absolute;left:236px;top:22px;transform:translateX(-50%);padding:4px 10px;border-radius:12px;background:#0A1A33;color:#F1E3BC;font-size:11.5px;font-weight:800;letter-spacing:1px;white-space:nowrap;box-shadow:0 6px 14px -6px rgba(0,0,0,.5)}
@keyframes pulse{0%{transform:scale(.3);opacity:1}100%{transform:scale(1.6);opacity:0}}
.sheet .addr{margin-top:14px;font-size:17px;font-weight:800}
.sheet .open{margin-top:6px;display:inline-flex;align-items:center;gap:8px;font-size:13.5px;font-weight:700;color:#137A3F}
.sheet .open i{width:8px;height:8px;border-radius:50%;background:#22B35E;box-shadow:0 0 0 3px rgba(34,179,94,.2)}
.sheet .dir{margin-top:14px;height:48px;border-radius:24px;background:#0A1A33;color:#fff;font-weight:800;font-size:15.5px;display:flex;align-items:center;justify-content:center;gap:8px;box-shadow:inset 0 0 0 1px rgba(216,181,102,.4)}
/* Zoom penekanan */
.stage{position:absolute;inset:0;transition:transform .6s cubic-bezier(.2,.8,.2,1)}
.hook .big{font-size:46px;line-height:1.08;font-weight:800;letter-spacing:-1.2px}
.hook .sub{margin-top:22px;font-size:18px;color:#D5DEEC;font-weight:600}
.hook .arrow{margin-top:26px;animation:bob 1s ease-in-out infinite}
@keyframes bob{50%{transform:translateY(8px)}}
/* URL tetap di bawah */
.url{position:absolute;left:50%;bottom:20px;transform:translateX(-50%);display:flex;align-items:center;gap:8px;padding:8px 16px;border-radius:20px;background:rgba(216,181,102,.12);box-shadow:inset 0 0 0 1px rgba(216,181,102,.55);font-size:15px;font-weight:700;color:#F1E3BC;white-space:nowrap;opacity:0;transition:opacity .5s ease}
.url.in{opacity:1}
/* Ketukan */
.tap{position:absolute;width:46px;height:46px;margin:-23px 0 0 -23px;border-radius:50%;background:rgba(255,255,255,.28);border:2px solid rgba(255,255,255,.95);box-shadow:0 0 0 6px rgba(216,181,102,.35);pointer-events:none;z-index:9;animation:tap .65s ease-out forwards}
@keyframes tap{0%{transform:scale(.35);opacity:1}70%{opacity:.9}100%{transform:scale(1.35);opacity:0}}
/* Intro & outro */
.full{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:0 36px;transition:opacity .6s ease}
.full.hide{opacity:0;pointer-events:none}
.full .logo{width:96px;height:96px;border-radius:50%;background:#fff;box-shadow:0 0 0 3px rgba(216,181,102,.8),0 18px 40px -12px rgba(0,0,0,.8)}
.full .brand{margin-top:16px;font-size:24px;font-weight:800;letter-spacing:4px}
.full .tag{margin-top:6px;font-size:12.5px;font-weight:700;letter-spacing:3px;color:#D8B566}
.full .rule{width:46px;height:2px;margin:26px auto;border-radius:2px;background:linear-gradient(90deg,#F3DC9A,#B48A32)}
.full h1{font-size:40px;line-height:1.1;font-weight:800;letter-spacing:-1px}
.full .pill{margin-top:24px;display:inline-flex;align-items:center;gap:10px;padding:13px 22px;border-radius:30px;background:linear-gradient(135deg,#F3DC9A,#C9A54E 55%,#A07E2E);color:#0A1A33;font-size:22px;font-weight:800;box-shadow:0 14px 34px -12px rgba(216,181,102,.7)}
.full .meta{margin-top:22px;font-size:17px;color:#D5DEEC;line-height:1.65}
.full .meta b{color:#fff}
.mascot{width:150px;margin-bottom:4px;filter:drop-shadow(0 14px 22px rgba(0,0,0,.5))}
.pop{opacity:0;transform:translateY(16px) scale(.96);transition:opacity .55s ease,transform .55s cubic-bezier(.2,.8,.2,1)}
.on .pop{opacity:1;transform:none}
.on .pop.d1{transition-delay:.15s}.on .pop.d2{transition-delay:.35s}.on .pop.d3{transition-delay:.55s}.on .pop.d4{transition-delay:.75s}
</style></head><body>
<div class="bg"></div>
<div class="cap out" id="cap"><div class="l1"></div><div class="l2 gold"></div></div>
<div class="stage" id="stage"><div class="phone" id="phone"><div class="screen"><div class="island"></div><div class="scaled">
  <div class="sbar"><span>12.30</span><svg width="62" height="14" viewBox="0 0 62 14" fill="#fff"><rect x="0" y="9" width="3" height="5" rx="1"/><rect x="5" y="6" width="3" height="8" rx="1"/><rect x="10" y="3" width="3" height="11" rx="1"/><rect x="15" y="0" width="3" height="14" rx="1"/><path d="M29 12.5l-2-2.2a3 3 0 014 0zM24.6 8a6.3 6.3 0 018.8 0l-1.4 1.5a4.3 4.3 0 00-6 0zM22 5.2a10 10 0 0114 0l-1.4 1.5a8 8 0 00-11.2 0z"/><rect x="40" y="2" width="19" height="10" rx="3" fill="none" stroke="#fff" stroke-width="1.4"/><rect x="42" y="4" width="13" height="6" rx="1.5"/><rect x="60" y="5" width="2" height="4" rx="1"/></svg></div>
  ${cari ? `<div class="bbar" id="bbar"><div class="field" id="field"><svg class="lock" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 018 0v3"/></svg><span class="u" id="burl"></span><span class="ph" id="bph">Cari atau ketik alamat web</span><i class="caret"></i></div><div class="prog" id="prog"></div></div>` : ''}
  <iframe id="site" src="/"></iframe>
  ${cari ? `<div class="ntab" id="ntab"><div class="globe"><svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="#0A1A33" stroke-width="1.6"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.8 3 2.8 15 0 18M12 3c-2.8 3-2.8 15 0 18"/></svg></div><div class="tiles"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div>
    <div class="sugg" id="sugg"><div class="row"><img src="/assets/logo.webp" alt=""><div><b>berkahcellbatam.com</b><small>BERKAH CELL — Daftar Harga Servis HP Batam</small></div></div></div></div>
  <div class="sheet" id="wa"><div class="hd"><span class="ic"><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3.2a8.7 8.7 0 00-7.5 13.1L3.3 20.8l4.6-1.2A8.7 8.7 0 1012 3.2zm4 10.5c-.2-.1-1.3-.6-1.5-.7-.2-.1-.3-.1-.5.1l-.7.9c-.1.1-.3.2-.5.1a5.9 5.9 0 01-2.9-2.6c-.2-.4.2-.4.6-1.2.1-.1 0-.3 0-.4l-.7-1.6c-.2-.4-.4-.4-.5-.4h-.4a.8.8 0 00-.6.3 2.5 2.5 0 00-.8 1.9 4.4 4.4 0 00.9 2.3 10 10 0 003.8 3.4c1.4.6 2 .7 2.7.6.4-.1 1.3-.5 1.5-1.1.2-.5.2-1 .1-1.1l-.5-.2z"/></svg></span><div>Pesan otomatis ke BERKAH CELL<small>0896-2505-0525</small></div></div><div class="bubble" id="wamsg"></div><div class="send">Kirim pesan</div></div>
  <div class="sheet" id="map"><div class="hd"><span class="ic" style="background:#0A1A33"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D8B566" stroke-width="2"><path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0113 0c0 5.4-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.4"/></svg></span><div>Lokasi toko<small>Ketuk untuk petunjuk arah</small></div></div>
    <div class="map"><svg width="350" height="200" viewBox="0 0 350 200"><rect width="350" height="200" fill="#EFE9DB"/><g fill="#E3DAC4"><rect x="10" y="10" width="96" height="62" rx="7"/><rect x="128" y="10" width="86" height="62" rx="7"/><rect x="10" y="94" width="64" height="96" rx="7"/><rect x="96" y="150" width="70" height="40" rx="7"/><rect x="190" y="94" width="72" height="96" rx="7"/><rect x="284" y="94" width="56" height="96" rx="7"/></g><rect x="96" y="94" width="70" height="40" rx="7" fill="#D3E2C2"/><rect x="236" y="10" width="104" height="62" rx="7" fill="#E9D9AE"/><path d="M0 83h350M117 0v200M225 0v200M0 141h350" stroke="#fff" stroke-width="10"/><path d="M40 200V141H117V83H225V70" fill="none" stroke="#C9A54E" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="1 9"/><circle cx="40" cy="186" r="7" fill="#1F5FBF" stroke="#fff" stroke-width="3"/></svg><div class="label">BERKAH CELL</div><div class="pin"><i class="pulse"></i><svg viewBox="0 0 34 44"><path d="M17 43s-15-13-15-25a15 15 0 0130 0c0 12-15 25-15 25z" fill="#0A1A33" stroke="#D8B566" stroke-width="2"/><circle cx="17" cy="18" r="5.5" fill="#D8B566"/></svg></div></div>
    <div class="addr">BERKAH CELL · ${TOKO.alamat}</div><div class="open"><i></i>${TOKO.status}</div><div class="dir">Petunjuk arah</div></div>` : ''}
</div></div></div></div>
<div class="url" id="url"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D8B566" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.8 3 2.8 15 0 18M12 3c-2.8 3-2.8 15 0 18"/></svg>berkahcellbatam.com</div>
${cari ? `<div class="full hook" id="hook"><div class="big pop">Mau tahu harga</div><div class="big gold pop d1">ganti LCD iPhone 11?</div><div class="sub pop d2">Cek langsung dari HP kamu</div><svg class="arrow pop d3" width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#D8B566" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M6 13l6 6 6-6"/></svg></div>` : ''}
<div class="full${cari ? ' hide' : ''}" id="intro">
  <img class="mascot pop" src="/assets/maskot-melambai.webp" alt="">
  <div class="brand pop d1">BERKAH CELL</div><div class="tag pop d1">SERVICE HP · BATAM</div>
  <div class="rule pop d2"></div>
  <h1 class="pop d2">Sekarang punya<br><span class="gold">website resmi!</span></h1>
  <div class="pill pop d3">berkahcellbatam.com</div>
</div>
<div class="full hide" id="outro">
  <img class="logo pop" src="/assets/logo.webp" alt="">
  <div class="brand pop">BERKAH CELL</div><div class="tag pop">SERVICE HP · BATAM</div>
  <div class="rule pop d1"></div>
  <h1 class="pop d1"><span id="o1">Cek harga servis</span><br><span class="gold" id="o2">langsung di</span></h1>
  <div class="pill pop d2">berkahcellbatam.com</div>
  <div class="meta pop d3">WhatsApp <b>0896-2505-0525</b><br>Avava Jodoh, Lantai Dasar, Batam</div>
</div>
<script>
window.studio = {
  intro() { document.getElementById('intro').classList.add('on'); },
  hook() { document.getElementById('hook').classList.add('on'); },
  phoneIn() {
    document.getElementById('intro').classList.add('hide');
    const hk = document.getElementById('hook'); if (hk) hk.classList.add('hide');
    document.getElementById('phone').classList.add('in');
    document.getElementById('url').classList.add('in');
  },
  say(a, b) {
    const c = document.getElementById('cap');
    c.classList.add('out');
    setTimeout(() => { c.querySelector('.l1').textContent = a; c.querySelector('.l2').textContent = b; c.classList.remove('out'); }, 300);
  },
  tap(x, y) {
    const t = document.createElement('div'); t.className = 'tap'; t.style.left = x + 'px'; t.style.top = y + 'px';
    document.body.appendChild(t); setTimeout(() => t.remove(), 700);
  },
  browserFocus() { const f = document.getElementById('field'); f.classList.add('focus'); document.getElementById('bph').style.display = 'none'; },
  browserText(t) { document.getElementById('burl').textContent = t; document.getElementById('sugg').classList.toggle('on', t.length >= 4); },
  browserGo() {
    document.getElementById('sugg').classList.remove('on');
    const f = document.getElementById('field'); f.classList.remove('focus'); f.classList.add('done');
    document.getElementById('burl').textContent = 'berkahcellbatam.com';
    document.getElementById('prog').classList.add('go');
    setTimeout(() => { document.getElementById('prog').style.opacity = '0'; document.getElementById('ntab').classList.add('hide'); }, 650);
    document.getElementById('site').contentWindow.location.reload();
  },
  zoom(x, k) {
    const s = document.getElementById('stage'); const u = document.getElementById('url');
    if (!k) { s.style.transform = ''; u.classList.add('in'); return; }
    // Titik tetap di y=192: HP membesar ke bawah dan tidak menutupi teks keterangan.
    u.classList.remove('in'); s.style.transformOrigin = x + 'px 192px'; s.style.transform = 'scale(' + k + ')';
  },
  sheet(id, on, text) { if (text) document.getElementById('wamsg').textContent = text; document.getElementById(id).classList.toggle('on', on); },
  outro(a, b) {
    if (a) document.getElementById('o1').textContent = a;
    if (b) document.getElementById('o2').textContent = b;
    document.getElementById('cap').classList.add('out');
    document.getElementById('url').classList.remove('in');
    document.getElementById('phone').classList.remove('in');
    const o = document.getElementById('outro'); o.classList.remove('hide'); setTimeout(() => o.classList.add('on'), 50);
  },
};
</script></body></html>`;

const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.webmanifest': 'application/manifest+json' };
function serve() {
  return new Promise((resolve) => {
    const srv = http.createServer((req, res) => {
      const u = new URL(req.url, 'http://x');
      if (u.pathname === '/__studio') { res.writeHead(200, { 'Content-Type': TYPES['.html'] }); return res.end(studioHtml(u.searchParams.get('alur') === 'cari')); }
      let p = path.normalize(path.join(SITE, decodeURIComponent(u.pathname)));
      if (!p.startsWith(SITE)) { res.writeHead(403); return res.end(); }
      if (fs.existsSync(p) && fs.statSync(p).isDirectory()) p = path.join(p, 'index.html');
      if (!fs.existsSync(p)) { res.writeHead(404); return res.end(); }
      res.writeHead(200, { 'Content-Type': TYPES[path.extname(p)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
      fs.createReadStream(p).pipe(res);
    });
    srv.listen(0, '127.0.0.1', () => resolve({ srv, url: `http://127.0.0.1:${srv.address().port}` }));
  });
}

async function record(browser, base, { alur, bypass, file, cover }) {
  const ctx = await browser.newContext({ viewport: { width: 540, height: 960 }, deviceScaleFactor: 2 });
  await ctx.route('https://docs.google.com/**', (r) => r.fulfill({ status: 200, contentType: 'text/csv', headers: { 'access-control-allow-origin': '*' }, body: CSV }));
  await ctx.route('https://wa.me/**', (r) => r.abort());
  // Versi iklan: badge Bypass di beranda juga disembunyikan (CONFIG.SPECIALTY dikosongkan).
  if (!bypass) {
    const app = fs.readFileSync(path.join(SITE, 'app.js'), 'utf8');
    const noBadge = app.replace(/SPECIALTY: \{[^}]*\},/, 'SPECIALTY: null,');
    if (noBadge === app) throw new Error('CONFIG.SPECIALTY tidak ditemukan di app.js');
    await ctx.route('**/app.js*', (r) => r.fulfill({ status: 200, contentType: 'text/javascript; charset=utf-8', body: noBadge }));
  }
  const page = await ctx.newPage();
  await page.clock.setFixedTime(NOW);
  await page.goto(base + '/__studio?alur=' + alur);
  const fr = await (await page.$('#site')).contentFrame();
  await fr.waitForFunction(() => !document.querySelector('[aria-busy="true"]') && document.querySelector('.tile'));
  await page.evaluate(() => document.fonts.ready);
  await fr.evaluate(() => document.fonts.ready);
  await sleep(300);

  const st = (fn, ...a) => page.evaluate(([f, args]) => window.studio[f](...args), [fn, a]);
  const scrollTo = (y) => fr.evaluate((t) => window.scrollTo({ top: t, behavior: 'smooth' }), y);
  async function tap(selector, click = true, where = fr) {
    const el = where.locator(selector).first();
    const b = await el.boundingBox();
    await st('tap', b.x + b.width / 2, b.y + b.height / 2);
    await sleep(170);
    if (click) await el.click();
  }

  // Rekam layar studio (frame JPEG + timestamp) lewat CDP.
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'bc-video-'));
  const frames = [];
  const cdp = await ctx.newCDPSession(page);
  cdp.on('Page.screencastFrame', async (f) => {
    const name = path.join(tmp, `f${String(frames.length).padStart(5, '0')}.jpg`);
    fs.writeFileSync(name, Buffer.from(f.data, 'base64'));
    frames.push({ name, ts: f.metadata.timestamp });
    try { await cdp.send('Page.screencastFrameAck', { sessionId: f.sessionId }); } catch (e) { /* selesai */ }
  });
  await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 92, maxWidth: 1080, maxHeight: 1920, everyNthFrame: 1 });

  await (alur === 'cari' ? alurCari : alurDemo)({ page, fr, st, tap, scrollTo, bypass, cover });

  await cdp.send('Page.stopScreencast');
  await sleep(200);
  await ctx.close();
  encode(frames, tmp, file);
  fs.rmSync(tmp, { recursive: true, force: true });
}

// Alur "cari" (ide pemilik 9 Okt 2026): buka website dari browser → iphone 11 → Ganti LCD → WhatsApp + Lokasi.
async function alurCari({ page, fr, st, tap, scrollTo, cover }) {
  // 1. Hook: penonton memutuskan lanjut/skip dalam 1–2 detik pertama.
  await st('hook'); await sleep(2100);
  if (cover) await page.screenshot({ path: cover });
  // 2. Buka website di browser (tanpa merek browser/mesin pencari tertentu)
  await st('phoneIn'); await sleep(700);
  await st('say', 'Buka berkahcellbatam.com', 'dari HP mana saja'); await sleep(350);
  await tap('#field', false, page); await st('browserFocus'); await sleep(250);
  const url = 'berkahcellbatam.com';
  for (let i = 1; i <= url.length; i++) { await st('browserText', url.slice(0, i)); await sleep(65); }
  await sleep(450);
  await tap('#sugg .row', false, page); await st('browserGo');
  await sleep(300);
  await fr.waitForFunction(() => !document.querySelector('[aria-busy="true"]') && document.querySelector('.tile'));
  await sleep(1100);
  // 3. Cari tipe
  await st('say', 'Ketik tipe HP kamu,', 'harga langsung muncul'); await sleep(350);
  await tap('#q'); await sleep(200);
  await page.keyboard.type('iphone 11', { delay: 105 }); await sleep(800);
  await tap('.list a.li'); await fr.waitForSelector('.dev h1'); await sleep(1000);
  // 4. Klik Ganti LCD, harga diperbesar
  await st('say', 'Klik layanannya,', 'harga & garansi jelas'); await sleep(300);
  await scrollTo(110); await sleep(650);
  await tap('.var'); await sleep(450);
  const pb = await fr.locator('.var .price').first().boundingBox();
  await st('zoom', pb.x + pb.width / 2, 1.32); await sleep(1600);
  await st('zoom'); await sleep(750);
  // 5. WhatsApp: pesan diambil dari tautan asli di website
  await st('say', 'Chat WhatsApp,', 'pesan sudah terisi otomatis'); await sleep(300);
  const msg = new URL(await fr.getAttribute('.cta a.btn-pri', 'href')).searchParams.get('text');
  await tap('.cta a.btn-pri', false); await sleep(250);
  await st('sheet', 'wa', true, msg); await sleep(2700);
  await st('sheet', 'wa', false); await sleep(450);
  // 6. Lokasi
  await st('say', 'Atau langsung datang', 'Avava Jodoh, Lantai Dasar'); await sleep(300);
  await tap('.cta a.btn-loc', false); await sleep(250);
  await st('sheet', 'map', true); await sleep(2900);
  // 7. Penutup
  await st('outro', 'Cek harga HP kamu', 'sekarang juga di'); await sleep(3400);
}

// Alur "demo" (8 Okt 2026): tur fitur website.
async function alurDemo({ page, fr, st, tap, scrollTo, bypass, cover }) {
  // 1. Intro
  await st('intro'); await sleep(2700);
  if (cover) await page.screenshot({ path: cover });
  // 2. Beranda
  await st('phoneIn'); await sleep(350);
  await st('say', 'Cek harga servis HP', 'kapan saja, dari HP kamu'); await sleep(2300);
  // 3. Cari tipe
  await st('say', 'Ketik tipe HP,', 'harga langsung muncul'); await sleep(500);
  await tap('#q'); await sleep(250);
  await page.keyboard.type('iphone 11', { delay: 115 }); await sleep(900);
  await tap('.list a.li'); await fr.waitForSelector('.dev h1'); await sleep(1300);
  // 4. Pilih layanan → WhatsApp
  await st('say', 'Pilih layanan,', 'chat WhatsApp otomatis'); await sleep(400);
  await scrollTo(110); await sleep(700);
  await tap('.var'); await sleep(1000);
  await tap('.cta a.btn-pri', false); await sleep(1700);
  // 5. Tanpa spasi
  await fr.evaluate(() => history.back()); await fr.waitForSelector('#q'); await sleep(350);
  await st('say', 'Ngetik tanpa spasi?', 'Tetap ketemu'); await sleep(300);
  await tap('.clear'); await sleep(300);
  await page.keyboard.type('vivoy91', { delay: 120 }); await sleep(1500);
  await tap('.clear'); await sleep(450);
  // 6. Andalan Bypass (versi organik)
  if (bypass) {
    await st('say', 'Andalan kami:', 'Bypass iCloud iPhone'); await sleep(450);
    await tap('a.andalan'); await fr.waitForSelector('.list'); await sleep(2300);
    await fr.evaluate(() => history.back()); await fr.waitForSelector('.tile'); await sleep(300);
  }
  // 7. Toko
  await st('say', 'Buka setiap hari 11.00–20.00', 'Avava Jodoh, Lantai Dasar');
  const y = await fr.evaluate(() => { const r = document.querySelector('main .store').getBoundingClientRect(); return Math.round(window.scrollY + r.top - (innerHeight - r.height) / 2); });
  await scrollTo(y); await sleep(1300);
  await tap('main .store a', false); await sleep(1700);
  // 8. Outro
  await st('outro'); await sleep(3400);
}

// Frame dengan jeda tidak rata → MP4 H.264 30 fps konstan (aman untuk WhatsApp, Instagram, TikTok).
function encode(frames, tmp, file) {
  const list = [];
  frames.forEach((f, i) => {
    const next = frames[i + 1];
    const d = next ? Math.max(next.ts - f.ts, 1 / 240) : 0.5;
    list.push(`file '${f.name}'`, `duration ${d.toFixed(4)}`);
  });
  list.push(`file '${frames[frames.length - 1].name}'`);
  const listFile = path.join(tmp, 'list.txt');
  fs.writeFileSync(listFile, list.join('\n'));
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', listFile,
    '-f', 'lavfi', '-i', 'anullsrc=r=44100:cl=stereo',
    '-vf', 'fps=30,scale=1080:1920:flags=lanczos,format=yuv420p', '-c:v', 'libx264', '-preset', 'slow', '-crf', '18',
    '-c:a', 'aac', '-b:a', '96k', '-shortest', '-movflags', '+faststart', file]);
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const { srv, url } = await serve();
  const browser = await chromium.launch();
  try {
    const nama = { cari: 'berkahcell-cari-harga', demo: 'berkahcell-launching' };
    for (const alur of ALUR === 'semua' ? ['cari', 'demo'] : [ALUR]) {
      if (!nama[alur]) throw new Error('Alur tidak dikenal: ' + alur + ' (pilih cari, demo, atau semua)');
      await record(browser, url, { alur, bypass: true, file: path.join(OUT, nama[alur] + '-organik-9x16.mp4'), cover: path.join(OUT, nama[alur] + '-cover.png') });
      await record(browser, url, { alur, bypass: false, file: path.join(OUT, nama[alur] + '-iklan-9x16.mp4') });
    }
  } finally {
    await browser.close(); srv.close();
  }
  for (const f of fs.readdirSync(OUT)) console.log(path.join(OUT, f), Math.round(fs.statSync(path.join(OUT, f)).size / 1024) + ' KB');
})().catch((e) => { console.error(e); process.exitCode = 1; });
