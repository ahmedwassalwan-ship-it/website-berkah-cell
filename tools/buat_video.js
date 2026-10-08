/* Membuat video launching 9:16 yang memperlihatkan cara memakai website BERKAH CELL.
 *
 *   node tools/buat_video.js [folder-hasil]      (default: video-hasil/, tidak ikut di-commit)
 *
 * Hasil:
 *   berkahcell-launching-organik-9x16.mp4  dengan adegan "Andalan: Bypass iCloud iPhone" (posting organik)
 *   berkahcell-launching-iklan-9x16.mp4    tanpa adegan Bypass (aman untuk iklan Meta)
 *   berkahcell-launching-cover.png         cover Reels/TikTok 1080×1920
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
const OUT = path.resolve(process.argv[2] || path.join(ROOT, 'video-hasil'));
const CSV = fs.readFileSync(path.join(ROOT, 'tests', 'fixtures', 'price_list_publik_2026-10-06.csv'), 'utf8');
const NOW = new Date('2026-10-08T05:30:00Z'); // 12.30 WIB: toko buka
const S = 0.82; // skala layar HP (390×844) di kanvas 540×960
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const STUDIO = `<!doctype html><html lang="id"><head><meta charset="utf-8">
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
iframe{display:block;width:390px;height:804px;border:0;background:#F6F4EF}
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
<div class="phone" id="phone"><div class="screen"><div class="island"></div><div class="scaled">
  <div class="sbar"><span>12.30</span><svg width="62" height="14" viewBox="0 0 62 14" fill="#fff"><rect x="0" y="9" width="3" height="5" rx="1"/><rect x="5" y="6" width="3" height="8" rx="1"/><rect x="10" y="3" width="3" height="11" rx="1"/><rect x="15" y="0" width="3" height="14" rx="1"/><path d="M29 12.5l-2-2.2a3 3 0 014 0zM24.6 8a6.3 6.3 0 018.8 0l-1.4 1.5a4.3 4.3 0 00-6 0zM22 5.2a10 10 0 0114 0l-1.4 1.5a8 8 0 00-11.2 0z"/><rect x="40" y="2" width="19" height="10" rx="3" fill="none" stroke="#fff" stroke-width="1.4"/><rect x="42" y="4" width="13" height="6" rx="1.5"/><rect x="60" y="5" width="2" height="4" rx="1"/></svg></div>
  <iframe id="site" src="/"></iframe>
</div></div></div>
<div class="url" id="url"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D8B566" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.8 3 2.8 15 0 18M12 3c-2.8 3-2.8 15 0 18"/></svg>berkahcellbatam.com</div>
<div class="full" id="intro">
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
  <h1 class="pop d1">Cek harga servis<br><span class="gold">langsung di</span></h1>
  <div class="pill pop d2">berkahcellbatam.com</div>
  <div class="meta pop d3">WhatsApp <b>0896-2505-0525</b><br>Avava Jodoh, Lantai Dasar, Batam</div>
</div>
<script>
window.studio = {
  intro() { document.getElementById('intro').classList.add('on'); },
  phoneIn() {
    document.getElementById('intro').classList.add('hide');
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
  outro() {
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
      if (u.pathname === '/__studio') { res.writeHead(200, { 'Content-Type': TYPES['.html'] }); return res.end(STUDIO); }
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

async function record(browser, base, { bypass, file, cover }) {
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
  await page.goto(base + '/__studio');
  const fr = await (await page.$('#site')).contentFrame();
  await fr.waitForFunction(() => !document.querySelector('[aria-busy="true"]') && document.querySelector('.tile'));
  await page.evaluate(() => document.fonts.ready);
  await fr.evaluate(() => document.fonts.ready);
  await sleep(300);

  const st = (fn, ...a) => page.evaluate(([f, args]) => window.studio[f](...args), [fn, a]);
  const scrollTo = (y) => fr.evaluate((t) => window.scrollTo({ top: t, behavior: 'smooth' }), y);
  async function tap(selector, click = true) {
    const el = fr.locator(selector).first();
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

  await cdp.send('Page.stopScreencast');
  await sleep(200);
  await ctx.close();
  encode(frames, tmp, file);
  fs.rmSync(tmp, { recursive: true, force: true });
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
    await record(browser, url, { bypass: true, file: path.join(OUT, 'berkahcell-launching-organik-9x16.mp4'), cover: path.join(OUT, 'berkahcell-launching-cover.png') });
    await record(browser, url, { bypass: false, file: path.join(OUT, 'berkahcell-launching-iklan-9x16.mp4') });
  } finally {
    await browser.close(); srv.close();
  }
  for (const f of fs.readdirSync(OUT)) console.log(path.join(OUT, f), Math.round(fs.statSync(path.join(OUT, f)).size / 1024) + ' KB');
})().catch((e) => { console.error(e); process.exitCode = 1; });
