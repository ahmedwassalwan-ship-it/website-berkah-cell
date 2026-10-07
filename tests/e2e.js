/* Uji penerimaan A01–A21 untuk preview v3.
 * Menjalankan site-live/ di server lokal, data Google Sheets diganti fixture
 * lewat route interception (tanpa jaringan). Semua pengujian adalah EMULASI
 * Chromium (Playwright); bukan perangkat Android/iPhone sungguhan.
 *
 * Jalankan:  node tests/e2e.js            (butuh paket playwright)
 * Hasil:     tests/hasil/hasil.json + tangkapan layar di tests/hasil/
 */
'use strict';
const fs = require('fs');
const path = require('path');
let chromium;
try { ({ chromium } = require('playwright')); } catch (e) { ({ chromium } = require('/opt/node22/lib/node_modules/playwright')); }
const { start } = require('./server');

const OUT = path.join(__dirname, 'hasil');
fs.mkdirSync(OUT, { recursive: true });
const FIX = path.join(__dirname, 'fixtures');
const CSV = fs.readFileSync(path.join(FIX, 'price_list_publik_2026-10-06.csv'), 'utf8');
const HEADER = '"Brand","Model","Layanan","Kualitas","Harga_Jual","Estimasi_Waktu","Garansi"\n';
const BAD = HEADER + [
  '"iphone","<img src=x onerror=window.__xss=1>","Ganti LCD","Incel","Rp0","30 menit","7 hari"',
  '"samsung","A99 ""Kutip"" \'x\'","Ganti <b>LCD</b>","OLED","250rb","",""',
  '"oppo","Reno Super Panjang Sekali Edisi Ultra Pro Max 5G Plus Limited","Ganti LCD","Incel","","30 menit",""',
  '"oppo","Reno Super Panjang Sekali Edisi Ultra Pro Max 5G Plus Limited","Ganti Batrai","Premium","Rp250.000","1 jam","1 bulan"',
  '"oppo","Reno Super Panjang Sekali Edisi Ultra Pro Max 5G Plus Limited","Connector Cas","Premium","Rp80.000","30 menit","7 hari"',
  '"oppo","Reno Super Panjang Sekali Edisi Ultra Pro Max 5G Plus Limited","Ganti Kamera Belakang","Premium","Rp350.000","60 menit","7 hari"',
  '"vivo","Y1","Ganti LCD","","Rp 1.500.000","30 menit","Tidak Ada"',
  '"vivo","Y1","Ganti LCD","","Rp 1.500.000","30 menit","Tidak Ada"',
  '"vivo","Y1","Ganti LCD","","Rp 1.600.000","30 menit","Tidak Ada"',
  '"vivo","Y2","Ganti LCD","Incel","Rp300,000","30 menit","7 hari"',
  '"vivo","Y3","Ganti LCD","Incel","-50000","30 menit","7 hari"',
].join('\n') + '\n';
const EMPTY = HEADER;
const LOGIN_HTML = '<!DOCTYPE html><html><body>Sign in - Google Accounts</body></html>';

const results = {};
function rec(id, status, note) {
  const r = results[id] || (results[id] = { status: 'LULUS', notes: [] });
  if (status === 'GAGAL') r.status = 'GAGAL';
  else if (status !== 'LULUS' && r.status === 'LULUS') r.status = status;
  r.notes.push((status === 'LULUS' ? '✓ ' : status === 'GAGAL' ? '✗ ' : '• ') + note);
}
function expect(id, cond, note, detail) { rec(id, cond ? 'LULUS' : 'GAGAL', note + (cond || detail === undefined ? '' : ' — ' + JSON.stringify(detail))); return cond; }

let base; let browser;
async function newPage(opts = {}) {
  const ctx = await browser.newContext({ viewport: opts.viewport || { width: 390, height: 844 }, deviceScaleFactor: opts.dpr || 1, hasTouch: !!opts.touch, isMobile: !!opts.mobile, userAgent: opts.ua });
  const page = await ctx.newPage();
  page.__errors = []; page.__requests = [];
  page.on('pageerror', (e) => page.__errors.push(e.message));
  page.on('request', (r) => page.__requests.push(r.url()));
  let n = 0;
  await ctx.route('https://docs.google.com/**', (route) => {
    n++;
    const mode = typeof opts.data === 'function' ? opts.data(n) : (opts.data || 'ok');
    if (mode === 'abort') return route.abort('failed');
    if (mode === 'html') return route.fulfill({ status: 200, contentType: 'text/html', headers: { 'access-control-allow-origin': '*' }, body: LOGIN_HTML });
    const body = mode === 'bad' ? BAD : mode === 'empty' ? EMPTY : CSV;
    return route.fulfill({ status: 200, contentType: 'text/csv', headers: { 'access-control-allow-origin': '*' }, body });
  });
  await ctx.route('https://wa.me/**', (route) => route.fulfill({ status: 200, contentType: 'text/html', body: '<p>wa</p>' }));
  return page;
}
const ready = (p) => p.waitForFunction(() => !document.querySelector('[aria-busy="true"]'));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function shot(page, name, full) { await page.screenshot({ path: path.join(OUT, name + '.png'), fullPage: !!full }); }
const decodeWa = (href) => { const u = new URL(href); return { host: u.host, path: u.pathname, text: u.searchParams.get('text') }; };

async function run() {
  const srv = await start(); base = srv.url;
  browser = await chromium.launch();
  try {
    await testCatalog();
    await testSearch();
    await testDetailData();
    await testBadData();
    await testStates();
    await testWhatsApp();
    await testLayout();
    await testMobileEmulation();
    await testKeyboard();
    await testBackBrand();
    await testBackSearch();
    await testDirectEntry();
    await testSticky();
    await testGanti();
    await testNotFound();
    await testPanel();
    await testNetwork();
    await testShare();
    await testMeta();
    await testStore();
    await testDomain();
  } finally {
    await browser.close(); srv.srv.close();
  }
  rec('A11', 'LULUS', 'Pemilik melaporkan preview v3 dan tombol Maps berjalan baik di HP (6 Okt 2026), lalu menyetujui rilis.');
  rec('A12', 'BELUM DIUJI', 'Rilis 6 Okt 2026 (d0f03a1): build produksi sukses dan kartu WhatsApp tampil, tetapi workers.dev diblokir di jaringan WiFi seorang pelanggan (ERR_CERT_AUTHORITY_INVALID, normal lewat VPN). Dicek ulang di berkahcellbatam.com setelah domain aktif.');
  fs.writeFileSync(path.join(OUT, 'hasil.json'), JSON.stringify(results, null, 2));
  const ids = Object.keys(results).sort((a, b) => a.localeCompare(b, 'en', { numeric: true }));
  for (const id of ids) {
    console.log(`${id}: ${results[id].status}`);
    for (const n of results[id].notes) console.log('    ' + n);
  }
  process.exitCode = ids.some((id) => results[id].status === 'GAGAL') ? 1 : 0;
}

/* ---------- A01 ---------- */
async function testCatalog() {
  const p = await newPage(); await p.goto(base); await ready(p);
  const tiles = await p.$$eval('.tile', (e) => e.map((x) => x.querySelector('b').textContent + '|' + x.querySelector('span').textContent));
  const expected = ['Infinix|4 tipe', 'iPhone|18 tipe', 'Itel|3 tipe', 'Oppo|24 tipe', 'Poco|3 tipe', 'Realme|6 tipe', 'Redmi|13 tipe', 'Samsung|20 tipe', 'Vivo|15 tipe', 'Xiaomi|5 tipe'];
  expect('A01', JSON.stringify(tiles) === JSON.stringify(expected), 'Grid merek dan jumlah tipe sesuai data (Xiomi → Xiaomi, Redmi & Poco terpisah)', tiles);
  expect('A01', (await p.textContent('.sec-title small')).includes('111 tipe'), 'Total 111 tipe tercatat setelah penyeragaman huruf model');
  const vis = await p.evaluate(() => ({ clear: getComputedStyle(document.querySelector('.clear')).display, bullet: getComputedStyle(document.querySelector('.grid-brands')).listStyleType }));
  expect('A01', vis.clear === 'none' && vis.bullet === 'none', 'Tombol × tersembunyi saat pencarian kosong; grid tanpa bullet', vis);
  for (const [brand, count] of [['iPhone', 18], ['Vivo', 15], ['Xiaomi', 5]]) {
    await p.click(`.tile:has(b:text-is("${brand}"))`); await p.waitForSelector('.list');
    const n = await p.$$eval('.list li', (e) => e.length);
    expect('A01', n === count, `Daftar tipe ${brand} berisi ${count} tipe`, n);
    await p.goBack(); await p.waitForSelector('.tile');
  }
  await p.click('.tile:has(b:text-is("Xiaomi"))'); await p.waitForSelector('.list');
  const xi = await p.$$eval('.list .t', (e) => e.map((x) => x.textContent));
  expect('A01', xi.includes('9A'), 'Model dari merek "xiomi" tampil di bawah Xiaomi', xi);
  await p.context().close();
}

/* ---------- A02 ---------- */
async function testSearch() {
  const p = await newPage(); await p.goto(base); await ready(p);
  const names = async () => p.$$eval('.list .t', (e) => e.map((x) => x.firstChild.textContent));
  for (const q of ['iPhone 11', '  IPHONE 11  ', 'iphone 11']) {
    await p.fill('#q', q); await sleep(50);
    const n = await names();
    expect('A02', n[0] === 'iPhone 11' && n.includes('iPhone 11 Pro') && n.includes('iPhone 11 Pro Max'), `"${q}" menemukan iPhone 11 di urutan pertama`, n);
  }
  await p.fill('#q', '11'); await sleep(50);
  const n11 = await names();
  expect('A02', n11.includes('iPhone 11') && n11.some((x) => x.startsWith('Redmi Note 11')), 'Angka pendek "11" menghasilkan beberapa merek dengan nama merek + model', n11);
  await p.fill('#q', 'xiomi'); await sleep(50);
  expect('A02', (await names()).includes('Xiaomi 9A'), 'Alias lama "xiomi" tetap menemukan Xiaomi 9A (F10)');
  await p.fill('#q', 'y15s'); await sleep(50);
  expect('A02', JSON.stringify(await names()) === JSON.stringify(['Vivo Y15S']), 'Y15s/Y15S tampil sebagai satu tipe', await names());
  await p.fill('#q', ''); await sleep(50);
  expect('A02', (await p.$$('.tile')).length === 10, 'Pencarian kosong kembali ke grid merek');
  const t0 = Date.now(); await p.fill('#q', 'samsung a'); await p.waitForSelector('.list .t'); const dt = Date.now() - t0;
  expect('A02', dt < 300, `Hasil pencarian muncul dalam ${dt} ms (target < 300 ms, emulasi desktop)`);
  await p.context().close();
}

/* ---------- A03, A04 ---------- */
async function testDetailData() {
  const p = await newPage(); await p.goto(base + '?merek=iphone&tipe=11'); await ready(p);
  const rows = await p.$$eval('.svc', (secs) => secs.map((s) => ({ svc: s.querySelector('h2').textContent, vars: [...s.querySelectorAll('.var')].map((v) => v.innerText.replace(/\s+/g, ' ').trim()) })));
  const all = rows.flatMap((r) => r.vars);
  expect('A03', all.length === 7, 'iPhone 11 menampilkan 7 pilihan harga (6 layanan)', rows);
  expect('A03', rows.find((r) => r.svc === 'Anti Gores').vars.length === 2, 'Anti Gores: dua varian (Spy, Bening) tidak digabung');
  expect('A03', !all.some((t) => t.includes('Rp 230.000') || t.includes('Rp 680.000')), 'Tidak ada harga dari tipe lain');
  const lcd = rows.find((r) => r.svc === 'Ganti LCD').vars[0];
  expect('A04', /Incel/.test(lcd) && /Rp 300\.000/.test(lcd) && /Estimasi 30 menit/.test(lcd) && /Garansi 7 hari/.test(lcd), 'Ganti LCD: Incel, Rp 300.000, 30 menit, 7 hari sesuai sumber', lcd);
  const spy = rows.find((r) => r.svc === 'Anti Gores').vars[0];
  expect('A04', /Tanpa garansi/.test(spy), 'Garansi "Tidak Ada" → "Tanpa garansi"', spy);
  await p.goto(base + '?merek=samsung&tipe=a50s'); await ready(p);
  const a50 = await p.$$eval('.var', (e) => e.map((x) => x.innerText.replace(/\s+/g, ' ')));
  expect('A03', a50.length === 2 && /Incel/.test(a50[0]) && /OLED/.test(a50[1]), 'Samsung A50S: Incel dan OLED tampil sebagai dua pilihan', a50);
  await p.goto(base + '?merek=iphone&tipe=7'); await ready(p);
  const i7 = await p.$$eval('.var', (e) => e.map((x) => x.innerText.replace(/\s+/g, ' ')));
  const kunci = i7.find((t) => /Rp 50\.000/.test(t));
  expect('A04', kunci && /Jasa servis/.test(kunci) && /Tanpa garansi/.test(kunci), 'Kualitas "Jasa" tampil sebagai label "Jasa servis", bukan harga atau gratis', i7);
  await p.goto(base + '?merek=iphone&tipe=8+plus'); await ready(p);
  const p8 = await p.$$eval('.var', (e) => e.map((x) => ({ t: x.innerText.replace(/\s+/g, ' '), q: x.querySelector('.q') ? x.querySelector('.q').textContent : null })));
  const bk = p8.find((x) => /Rp 150\.000/.test(x.t) && x.q === null);
  expect('A04', !!bk, 'Kualitas "Tidak Ada" tidak tampil sebagai label kualitas', p8);
  await p.context().close();
}

/* ---------- A05 + keamanan ---------- */
async function testBadData() {
  const p = await newPage({ data: 'bad' }); await p.goto(base); await ready(p);
  await p.click('.tile:has(b:text-is("iPhone"))'); await p.waitForSelector('.list');
  const t = await p.textContent('.list');
  expect('KEAMANAN', t.includes('<img src=x onerror=window.__xss=1>'), 'Nama model berisi HTML tampil sebagai teks');
  expect('KEAMANAN', (await p.$$('main img[src="x"]')).length === 0 && !(await p.evaluate(() => window.__xss)), 'Tidak ada elemen atau skrip dari data yang dijalankan');
  await p.click('.list a'); await p.waitForSelector('.var');
  expect('A05', (await p.textContent('.var .price')) === 'Tanyakan harga', '"Rp0" tidak ditampilkan sebagai Rp 0 atau gratis');
  await p.goto(base + '?merek=samsung&tipe=' + encodeURIComponent('a99 "kutip" \'x\'')); await ready(p);
  expect('KEAMANAN', (await p.textContent('.svc h2')).includes('Ganti <b>LCD</b>') && (await p.$$('.svc h2 b')).length === 0, 'Nama layanan berisi tag tampil sebagai teks');
  expect('A05', (await p.textContent('.var .price')) === 'Tanyakan harga', '"250rb" (format tidak dikenal) → "Tanyakan harga"');
  expect('A05', (await p.textContent('.var .sub')).includes('Garansi: tanyakan ke toko'), 'Garansi kosong tidak dianggap "Tidak Ada"');
  await p.goto(base + '?merek=vivo&tipe=y1'); await ready(p);
  const y1 = await p.$$eval('.price', (e) => e.map((x) => x.textContent));
  expect('A05', JSON.stringify(y1) === JSON.stringify(['Rp 1.500.000', 'Rp 1.600.000']), 'Baris identik tampil sekali; harga berbeda tidak ditimpa', y1);
  await p.goto(base + '?merek=vivo&tipe=y2'); await ready(p);
  expect('A05', (await p.textContent('.price')) === 'Rp 300.000', 'Pemisah ribuan koma "Rp300,000" tidak mengubah nilai');
  await p.goto(base + '?merek=vivo&tipe=y3'); await ready(p);
  expect('A05', (await p.textContent('.price')) === 'Tanyakan harga', 'Harga negatif → "Tanyakan harga"');
  const body = await p.textContent('body');
  expect('A05', !/Rp 0\b|gratis/i.test(body), 'Tidak ada "Rp 0" atau kata gratis');
  expect('KEAMANAN', p.__errors.length === 0, 'Tidak ada error JavaScript', p.__errors);
  await p.context().close();
}

/* ---------- A06, A21 ---------- */
async function testStates() {
  for (const mode of ['abort', 'html']) {
    const p = await newPage({ data: mode }); await p.goto(base + '?merek=iphone&tipe=11'); await p.waitForSelector('#retry');
    const t = await p.textContent('main');
    expect('A06', t.includes('Daftar harga belum berhasil dimuat') && t.includes('Coba lagi atau hubungi BERKAH CELL.'), `Respons ${mode === 'abort' ? 'koneksi gagal' : 'rusak (halaman login)'} → pesan gagal yang jujur`);
    expect('A06', !/Rp\s?\d/.test(t) && !t.includes('belum tercantum'), 'Tidak ada harga contoh; gagal tidak disebut "belum tercantum"');
    expect('A06', await p.isDisabled('#q'), 'Pencarian dinonaktifkan selama data gagal');
    if (mode === 'abort') await shot(p, 'gagal-memuat-390');
    await p.context().close();
  }
  const pe = await newPage({ data: 'empty' }); await pe.goto(base); await pe.waitForSelector('main .state');
  const te = await pe.textContent('main');
  expect('A21', te.includes('Daftar harga belum tersedia') && !te.includes('belum berhasil dimuat'), 'Katalog sah tapi kosong → "belum tersedia", bukan gangguan koneksi');
  await shot(pe, 'katalog-kosong-390'); await pe.context().close();
  const pn = await newPage(); await pn.goto(base + '?q=zzzz'); await ready(pn);
  const tn = await pn.textContent('main');
  expect('A21', tn.includes('belum tercantum') && !tn.includes('belum berhasil dimuat'), 'Hasil kosong dibedakan dari kegagalan');
  await pn.context().close();
  const pr = await newPage({ data: (n) => (n === 1 ? 'abort' : 'ok') }); await pr.goto(base); await pr.waitForSelector('#retry');
  await pr.click('#retry'); await pr.waitForSelector('.tile');
  expect('A21', (await pr.$$('.tile')).length === 10 && !(await pr.textContent('main')).includes('belum berhasil'), '"Coba lagi" memuat ulang dan menampilkan katalog asli');
  expect('A06', (await pr.$$('.tile')).length === 10, 'Pemulihan setelah gagal tanpa harga contoh');
  await pr.context().close();
}

/* ---------- A07 ---------- */
async function testWhatsApp() {
  const p = await newPage(); await p.goto(base + '?merek=iphone&tipe=11'); await ready(p);
  await p.click('.var >> nth=0');
  const a = decodeWa(await p.getAttribute('.cta a.btn-pri', 'href'));
  expect('A07', a.host === 'wa.me' && a.path === '/6289625050525', 'Tautan ke wa.me/6289625050525', a);
  expect('A07', a.text === 'Halo BERKAH CELL, saya ingin menanyakan servis iPhone 11: Ganti LCD (Incel). Harga di website Rp300.000.', 'Layanan terpilih → pesan berisi tipe, layanan, kualitas, harga', a.text);
  const c = decodeWa(await p.getAttribute('a.link-btn[href*="wa.me"]', 'href'));
  expect('A07', c.path === '/6289625050525' && c.text.includes('mengonfirmasi harga servis iPhone 11') && c.text.includes('Ganti LCD (Incel)'), 'Konfirmasi ke owner memakai nomor yang sama dengan isi sesuai tujuan', c.text);
  const all = await p.$$eval('a[href*="wa.me"]', (e) => e.map((x) => new URL(x.href).pathname));
  expect('A07', all.length > 0 && all.every((x) => x === '/6289625050525'), 'Semua tautan WhatsApp menuju satu nomor toko', all);
  await p.goto(base + '?merek=iphone&tipe=8'); await ready(p);
  await p.click('.var:has-text("Jasa servis")');
  const j = decodeWa(await p.getAttribute('.cta a.btn-pri', 'href'));
  expect('A07', j.text === 'Halo BERKAH CELL, saya ingin menanyakan servis iPhone 8: Bypass (jasa servis). Harga di website Rp100.000.', 'Baris "Jasa" → pesan tanpa menyebut kualitas komponen', j.text);
  expect('A07', p.__requests.every((u) => !u.startsWith('https://wa.me')), 'Tidak ada pesan yang terkirim otomatis (WhatsApp tidak dibuka tanpa ketukan)');
  await p.context().close();
}

/* ---------- A08 ---------- */
async function testLayout() {
  const sizes = [[360, 740], [390, 844], [768, 1024], [1440, 900]];
  for (const [w, hgt] of sizes) {
    for (const [name, url] of [['beranda', ''], ['detail', '?merek=iphone&tipe=11'], ['tipe', '?merek=oppo']]) {
      const p = await newPage({ viewport: { width: w, height: hgt } }); await p.goto(base + url); await ready(p);
      const over = await p.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect('A08', over <= 0, `${name} ${w}px: tanpa gulir ke samping`, over);
      await shot(p, `${name}-${w}`);
      if (name === 'detail') {
        await p.evaluate(() => window.scrollTo(0, document.body.scrollHeight)); await sleep(150);
        const m = await p.evaluate(() => {
          const cta = document.querySelector('.cta').getBoundingClientRect();
          const last = [...document.querySelectorAll('main .box')].pop().getBoundingClientRect();
          return { lastBottom: Math.round(last.bottom), ctaTop: Math.round(cta.top) };
        });
        expect('A08', m.lastBottom <= m.ctaTop, `detail ${w}px: tombol bawah tidak menutupi konten terakhir`, m);
        await shot(p, `detail-${w}-bawah`);
      }
      await p.context().close();
    }
  }
  // Layar pendek dan simulasi keyboard terbuka (viewport diperkecil seperti resizes-content).
  const ps = await newPage({ viewport: { width: 360, height: 640 } }); await ps.goto(base); await ready(ps);
  const sb = await ps.$eval('.searchbox', (e) => e.getBoundingClientRect().bottom);
  expect('A08', sb <= 640, 'Layar pendek 360×640: kotak pencarian terlihat tanpa menggulir', sb);
  await shot(ps, 'beranda-360x640'); await ps.context().close();
  const pk = await newPage({ viewport: { width: 360, height: 360 } }); await pk.goto(base); await ready(pk);
  await pk.fill('#q', 'iphone'); await sleep(50);
  const k = await pk.evaluate(() => ({ input: document.querySelector('#q').getBoundingClientRect().bottom, first: document.querySelector('.list li').getBoundingClientRect().bottom }));
  expect('A08', k.input <= 360 && k.first <= 360, 'Simulasi keyboard terbuka (tinggi 360): kotak pencarian dan hasil pertama tetap terlihat', k);
  await shot(pk, 'pencarian-keyboard-360x360'); await pk.context().close();
  const pp = await newPage({ viewport: { width: 360, height: 360 } }); await pp.goto(base + '?merek=iphone&tipe=11'); await ready(pp);
  await pp.click('.cta button'); await pp.waitForSelector('.sheet');
  await pp.focus('#panel-ket'); await sleep(450);
  const kp = await pp.evaluate(() => { const r = document.querySelector('#panel-ket').getBoundingClientRect(); const s = document.querySelector('.sheet'); return { top: r.top, bottom: r.bottom, sheetScrollable: s.scrollHeight > s.clientHeight }; });
  expect('A08', kp.top >= 0 && kp.bottom <= 360 && kp.sheetScrollable, 'Panel dengan keyboard (tinggi 360): isian keterangan terlihat dan panel bisa digulir', kp);
  await shot(pp, 'panel-keyboard-360x360'); await pp.context().close();
}

/* ---------- A08: emulasi perangkat seluler ---------- */
async function testMobileEmulation() {
  let devices;
  try { ({ devices } = require('playwright')); } catch (e) { ({ devices } = require('/opt/node22/lib/node_modules/playwright')); }
  for (const name of ['Pixel 7', 'iPhone 13']) {
    const d = devices[name];
    const p = await newPage({ viewport: d.viewport, dpr: d.deviceScaleFactor, touch: d.hasTouch, mobile: d.isMobile, ua: d.userAgent });
    await p.goto('about:blank'); await p.goto(base); await ready(p);
    await p.tap('.tile:has(b:text-is("Samsung"))'); await p.waitForSelector('.list');
    await p.tap('.list a:has-text("A50S")'); await p.waitForSelector('.dev h1');
    const over = await p.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    await p.tap('.var >> nth=1');
    const href = await p.getAttribute('.cta a.btn-pri', 'href');
    await p.goBack(); await p.waitForSelector('.list');
    expect('A08', over <= 0 && decodeWa(href).text.includes('Samsung A50S: Ganti LCD (OLED)') && p.url().endsWith('?merek=samsung'), `Emulasi ${name} (Chromium, sentuh): alur ketuk merek → tipe → harga → Back berjalan`, { over });
    await shot(p, 'emulasi-' + name.replace(/\s+/g, '-').toLowerCase());
    await p.context().close();
  }
  rec('A08', 'LULUS', 'Catatan: emulasi Chromium (ukuran, sentuh, user agent). Bukan Android/iPhone sungguhan; Safari/WebKit belum diuji.');
}

/* ---------- A09 ---------- */
async function testKeyboard() {
  const p = await newPage(); await p.goto(base); await ready(p);
  const seq = [];
  for (let i = 0; i < 6; i++) { await p.keyboard.press('Tab'); seq.push(await p.evaluate(() => { const e = document.activeElement; return (e.getAttribute('aria-label') || e.id || e.textContent || '').trim().slice(0, 24); })); }
  expect('A09', seq.includes('q') && seq.some((s) => s.startsWith('Infinix')), 'Tab mencapai kotak pencarian lalu kartu merek', seq);
  const outline = await p.evaluate(() => getComputedStyle(document.activeElement).outlineStyle);
  expect('A09', outline !== 'none', 'Fokus keyboard terlihat (outline)', outline);
  await p.focus('.tile:has(b:text-is("iPhone"))'); await p.keyboard.press('Enter'); await p.waitForSelector('.list');
  expect('A09', p.url().includes('merek=iphone'), 'Enter pada kartu merek membuka daftar tipe');
  const focusH1 = await p.evaluate(() => document.activeElement.tagName);
  expect('A09', focusH1 === 'H1', 'Setelah pindah layar, fokus berada di judul halaman', focusH1);
  expect('A09', (await p.getAttribute('#f', 'id')) === 'f' && (await p.$('label[for="f"]')) !== null, 'Kotak cari tipe punya label untuk alat bantu');
  for (const url of ['', '?merek=iphone', '?merek=iphone&tipe=11']) {
    await p.goto(base + url); await ready(p);
    const small = await p.evaluate(() => [...document.querySelectorAll('header a, main a, main button, #fixed-layer a, #fixed-layer button')]
      .filter((e) => e.offsetParent !== null && !e.closest('.sprite'))
      .map((e) => { const r = e.getBoundingClientRect(); return { t: (e.getAttribute('aria-label') || e.textContent).trim().slice(0, 30), w: Math.round(r.width), h: Math.round(r.height) }; })
      .filter((x) => x.h < 44 || x.w < 44));
    expect('A09', small.length === 0, `Area sentuh ≥ 44 px (${url || 'beranda'})`, small);
  }
  const contrast = await p.evaluate(() => {
    const lum = (c) => { const m = c.match(/\d+(\.\d+)?/g).map(Number); const v = m.slice(0, 3).map((x) => { x /= 255; return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4; }); return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2]; };
    const bgOf = (e) => { while (e) { const c = getComputedStyle(e).backgroundColor; if (c && !c.endsWith(', 0)') && c !== 'transparent') return c; e = e.parentElement; } return 'rgb(255,255,255)'; };
    const out = [];
    for (const sel of ['.hint', '.sub span', '.dev .m', '.q', '.price', '.crumb a', '.svc h2', '.box p', '.box li', '.ftr', '.ftr .ver', '.dev .eb']) {
      const e = document.querySelector(sel); if (!e) continue;
      const a = lum(getComputedStyle(e).color); const b = lum(bgOf(e));
      out.push({ sel, ratio: Math.round(((Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)) * 100) / 100 });
    }
    return out;
  });
  const low = contrast.filter((c) => c.ratio < 4.5);
  expect('A09', low.length === 0, 'Kontras teks ≥ 4,5:1 pada elemen detail yang diperiksa', low.length ? low : contrast);
  await p.context().close();
}

/* ---------- A13 ---------- */
async function testBackBrand() {
  const p = await newPage({ viewport: { width: 390, height: 640 } });
  await p.goto('about:blank'); await p.goto(base); await ready(p);
  await p.evaluate(() => window.scrollTo(0, 200)); await sleep(250);
  await p.click('.tile:has(b:text-is("Oppo"))'); await p.waitForSelector('.list');
  await p.evaluate(() => window.scrollTo(0, 700)); await sleep(250);
  const y1 = await p.evaluate(() => window.scrollY);
  await p.click('.list a:has-text("A77S")'); await p.waitForSelector('.dev h1');
  await p.goBack(); await p.waitForSelector('.list'); await sleep(200);
  const back1 = await p.evaluate(() => ({ url: location.search, y: window.scrollY }));
  expect('A13', back1.url === '?merek=oppo' && Math.abs(back1.y - y1) <= 2, 'Back dari detail → daftar tipe Oppo dengan posisi gulir sama', { back1, y1 });
  await p.goBack(); await p.waitForSelector('.tile'); await sleep(200);
  const back2 = await p.evaluate(() => ({ url: location.search, y: window.scrollY }));
  expect('A13', back2.url === '' && Math.abs(back2.y - 200) <= 2, 'Back berikutnya → Beranda dengan posisi gulir grid sama', back2);
  await p.goBack(); await sleep(300);
  expect('A13', p.url() === 'about:blank', 'Back ketiga keluar ke halaman sebelum website (tidak keluar terlalu awal)', p.url());
  await p.goForward(); await p.waitForSelector('.tile'); await p.goForward(); await p.waitForSelector('.list'); await sleep(200);
  const fw = await p.evaluate(() => ({ url: location.search, y: window.scrollY }));
  expect('A13', fw.url === '?merek=oppo' && Math.abs(fw.y - y1) <= 2, 'Forward mengikuti riwayat yang sama dan memulihkan posisi gulir', fw);
  expect('A13', p.__errors.length === 0, 'Tidak ada error JavaScript', p.__errors);
  rec('A13', 'LULUS', 'Catatan: diuji dengan Back/Forward Chromium (emulasi). Gestur Back Android dan geser tepi iPhone belum diuji di perangkat sungguhan.');
  await p.context().close();
}

/* ---------- A14 ---------- */
async function testBackSearch() {
  const p = await newPage({ viewport: { width: 390, height: 640 } });
  await p.goto('about:blank'); await p.goto(base); await ready(p);
  await p.click('#q'); await p.keyboard.type('a', { delay: 30 }); await sleep(400);
  const count = await p.$$eval('.list li', (e) => e.length);
  await p.evaluate(() => window.scrollTo(0, 900)); await sleep(250);
  const y = await p.evaluate(() => window.scrollY);
  const target = await p.$$eval('.list a', (as) => { const vis = as.find((a) => a.getBoundingClientRect().top > 60); return vis.getAttribute('href'); });
  await p.click(`.list a[href="${target}"]`); await p.waitForSelector('.dev h1');
  await p.goBack(); await p.waitForSelector('.list'); await sleep(200);
  const st = await p.evaluate(() => ({ q: document.querySelector('#q').value, n: document.querySelectorAll('.list li').length, y: window.scrollY, focusedInput: document.activeElement === document.querySelector('#q'), url: location.search }));
  expect('A14', st.q === 'a' && st.n === count && st.url === '?q=a', 'Back → kata pencarian dan daftar hasil pulih', st);
  expect('A14', Math.abs(st.y - y) <= 2, 'Posisi gulir hasil pulih', { y, st: st.y });
  expect('A14', !st.focusedInput, 'Keyboard tidak muncul sendiri (kotak pencarian tidak difokus)');
  await p.goBack(); await sleep(300);
  expect('A14', p.url() === 'about:blank', 'Satu kali Back lagi keluar; huruf yang diketik tidak menambah riwayat', p.url());
  await p.context().close();
}

/* ---------- A15 ---------- */
async function testDirectEntry() {
  const p = await newPage();
  await p.goto('about:blank'); await p.goto(base + '?merek=iphone&tipe=11'); await ready(p);
  const len = await p.evaluate(() => history.length);
  expect('A15', (await p.textContent('.dev h1')) === 'iPhone 11', 'Link langsung ke detail menampilkan iPhone 11');
  await p.goBack(); await sleep(300);
  expect('A15', p.url() === 'about:blank', 'Back mengikuti riwayat asli (tidak ada layar merek/tipe buatan)', { url: p.url(), len });
  await p.goForward(); await ready(p);
  await p.click('.crumb a:text-is("Semua merek")'); await p.waitForSelector('.tile');
  expect('A15', (await p.$$('.tile')).length === 10, '"Semua merek" berfungsi setelah masuk langsung');
  await p.goto('about:blank'); await p.goto(base); await ready(p);
  await p.click('#q'); await p.keyboard.type('samsunga5x', { delay: 40 }); await sleep(450);
  await p.goBack(); await sleep(300);
  expect('A15', p.url() === 'about:blank', 'Mengetik 10 huruf lalu satu Back langsung keluar dari layar (tanpa riwayat per huruf)', p.url());
  await p.goto(base + '?merek=nokia&tipe=3310'); await ready(p);
  const t = await p.textContent('main');
  expect('A15', t.includes('belum tercantum') && (await p.$('.crumb a')) !== null, 'Link ke tipe yang tidak ada → pesan "belum tercantum" + "Semua merek"');
  rec('A15', 'BELUM DIUJI', 'Membuka link dari aplikasi WhatsApp sungguhan belum diuji (hanya emulasi lewat about:blank).');
  await p.context().close();
}

/* ---------- A16 ---------- */
async function testSticky() {
  const p = await newPage({ data: 'bad', viewport: { width: 360, height: 640 } });
  await p.goto(base + '?merek=oppo&tipe=' + encodeURIComponent('reno super panjang sekali edisi ultra pro max 5g plus limited')); await ready(p);
  const h1 = await p.evaluate(() => { const e = document.querySelector('.dev h1'); return { text: e.textContent, over: e.scrollWidth - e.clientWidth, w: e.getBoundingClientRect().right }; });
  expect('A16', h1.text === 'Oppo Reno Super Panjang Sekali Edisi Ultra Pro Max 5G Plus Limited' && h1.over <= 0 && h1.w <= 360, 'Nama model panjang terbaca utuh di detail (360 px)', h1);
  await p.evaluate(() => window.scrollTo(0, 420)); await sleep(250);
  const sticky = await p.evaluate(() => { const s = document.querySelector('.sticky-dev'); const r = s.getBoundingClientRect(); return { hidden: s.hidden, text: s.querySelector('.nm').textContent, bottom: Math.round(r.bottom), over: s.querySelector('.nm').scrollWidth - s.querySelector('.nm').clientWidth }; });
  expect('A16', !sticky.hidden && sticky.text.includes('Reno Super Panjang Sekali Edisi Ultra Pro Max 5G Plus Limited') && sticky.over <= 0, 'Header kecil muncul saat menggulir dan nama panjang tetap utuh', sticky);
  await shot(p, 'header-identitas-360');
  const f = await p.evaluate(() => {
    const st = document.querySelector('.sticky-dev').getBoundingClientRect().bottom;
    const btn = [...document.querySelectorAll('.var')].find((b) => b.getBoundingClientRect().top < st);
    const target = btn || document.querySelector('.var');
    target.focus();
    const r = target.getBoundingClientRect();
    const cta = document.querySelector('.cta').getBoundingClientRect().top;
    return { top: Math.round(r.top), bottom: Math.round(r.bottom), stickyBottom: Math.round(document.querySelector('.sticky-dev').getBoundingClientRect().bottom), ctaTop: Math.round(cta) };
  });
  expect('A16', f.top >= f.stickyBottom && f.bottom <= f.ctaTop, 'Elemen yang mendapat fokus tidak tertutup header kecil maupun tombol bawah', f);
  await p.context().close();
}

/* ---------- A17 ---------- */
async function testGanti() {
  const p = await newPage();
  await p.goto(base + '?merek=iphone'); await ready(p);
  await p.click('.list a:has-text("11")'); await p.waitForSelector('.dev h1');
  await p.click('.dev .btn-sec'); await p.waitForSelector('.notice');
  expect('A17', (await p.textContent('.notice')).includes('Ganti dari iPhone 11') && (await p.textContent('.li.cur')).includes('Sedang dilihat'), '"Ganti tipe HP" membuka daftar iPhone dengan tanda tipe asal');
  await p.click('.list a:has-text("XR")'); await p.waitForSelector('.dev h1');
  expect('A17', (await p.textContent('.dev h1')) === 'iPhone XR' && (await p.$$('.var')).length === 3, 'Identitas dan daftar layanan berganti ke iPhone XR');
  await p.click('.cta button'); await p.waitForSelector('.sheet');
  expect('A17', (await p.textContent('#panel-judul')) === 'Tanya servis iPhone XR' && (await p.textContent('.preview')).includes('iPhone XR'), 'Panel WhatsApp memakai konteks iPhone XR');
  await p.keyboard.press('Escape'); await sleep(250);
  await p.click('.var >> nth=0');
  expect('A17', decodeWa(await p.getAttribute('.cta a.btn-pri', 'href')).text.includes('servis iPhone XR: Ganti LCD (Incel)'), 'Pesan layanan terpilih memakai iPhone XR');
  await p.goBack(); await p.waitForSelector('.notice');
  expect('A17', p.url().endsWith('?merek=iphone'), 'Back → daftar tipe (layar yang dilalui)');
  await p.goBack(); await p.waitForSelector('.dev h1');
  expect('A17', (await p.textContent('.dev h1')) === 'iPhone 11', 'Back berikutnya → detail iPhone 11');
  await p.context().close();
}

/* ---------- A18 ---------- */
async function testNotFound() {
  const p = await newPage(); await p.goto(base); await ready(p);
  await p.fill('#q', 'samsung a55'); await sleep(50);
  const t = await p.textContent('main .state');
  expect('A18', t.includes('Harga untuk “samsung a55” belum tercantum') && t.includes('masih terus dilengkapi'), 'Pesan menyebut kata pencarian dan harga belum tercantum');
  await shot(p, 'tidak-ditemukan-390');
  await p.click('main .state button:has-text("Tanyakan lewat WhatsApp")'); await p.waitForSelector('.sheet');
  const skip = decodeWa(await p.getAttribute('.skip', 'href')).text;
  expect('A18', skip === 'Halo BERKAH CELL, saya mencari harga servis samsung a55, tetapi belum menemukannya di website. Saya ingin menanyakan layanan dan harganya.', '"Tanyakan lewat WhatsApp" → pesan sesuai PRD', skip);
  await p.click('.opt[data-need="lcd"]');
  expect('A18', decodeWa(await p.getAttribute('.sheet .btn-pri', 'href')).text === 'Halo BERKAH CELL, saya ingin menanyakan harga ganti LCD atau layar samsung a55. Harganya belum tercantum di website.', 'Dengan kebutuhan LCD → pesan sesuai contoh PRD');
  await p.click('.x-btn'); await sleep(250);
  await p.click('main .state button:has-text("Cari tipe lain")');
  const sel = await p.evaluate(() => { const i = document.querySelector('#q'); return { focused: document.activeElement === i, s: i.selectionStart, e: i.selectionEnd, len: i.value.length }; });
  expect('A18', sel.focused && sel.s === 0 && sel.e === sel.len, '"Cari tipe lain" memfokuskan pencarian dengan teks terpilih (siap diubah/dihapus)', sel);
  await p.click('.clear'); await sleep(50);
  expect('A18', (await p.inputValue('#q')) === '' && (await p.$$('.tile')).length === 10, 'Tombol × menghapus pencarian');
  await p.context().close();
}

/* ---------- A19, A20, panel ---------- */
async function testPanel() {
  const p = await newPage({ viewport: { width: 390, height: 700 } });
  await p.goto('about:blank'); await p.goto(base + '?merek=iphone'); await ready(p);
  await p.click('.list a:has-text("11")'); await p.waitForSelector('.dev h1');
  // A19 bantuan layanan belum tercantum
  await p.evaluate(() => window.scrollTo(0, document.body.scrollHeight)); await sleep(150);
  await p.click('button:has-text("Tanyakan layanan lain")'); await p.waitForSelector('.sheet');
  const pv = await p.textContent('.preview');
  expect('A19', pv.includes('iPhone 11') && !/tidak ditemukan|belum menemukannya/.test(pv) && !/Rp/.test(pv), 'Pesan membawa iPhone 11 tanpa menyebut tipe tidak ditemukan atau menebak harga', pv);
  expect('A19', (await p.$$('.sheet .opt')).length === 4, 'Bantuan layanan tersedia tanpa filter (F12 tetap P1)');
  await shot(p, 'panel-layanan-belum-ada-390');
  await p.click('.x-btn'); await sleep(250);

  // A20 pilihan opsional dan pesan
  await p.evaluate(() => window.scrollTo(0, 300)); await sleep(200);
  const yBefore = await p.evaluate(() => window.scrollY);
  await p.click('.cta button'); await p.waitForSelector('.sheet');
  const opts = await p.$$eval('.opt', (e) => e.map((x) => x.textContent.trim()));
  expect('A20', JSON.stringify(opts) === JSON.stringify(['Ganti LCD atau layar', 'Ganti baterai', 'Layanan lainnya', 'Belum tahu, ingin menjelaskan keluhan']), 'Empat pilihan kebutuhan sesuai PRD', opts);
  expect('A20', decodeWa(await p.getAttribute('.skip', 'href')).text === 'Halo BERKAH CELL, saya ingin menanyakan servis iPhone 11.', '"Lewati" langsung ke WhatsApp tanpa memilih');
  const msgs = {};
  for (const id of ['lcd', 'baterai', 'lainnya', 'keluhan']) {
    await p.click(`.opt[data-need="${id}"]`);
    msgs[id] = decodeWa(await p.getAttribute('.sheet .btn-pri', 'href')).text;
  }
  expect('A20', msgs.keluhan === 'Halo BERKAH CELL, saya ingin menanyakan servis iPhone 11. Kebutuhan: belum tahu, ingin menjelaskan keluhan.' && msgs.lcd.endsWith('Kebutuhan: ganti LCD atau layar.'), 'Setiap pilihan menghasilkan pesan berkonteks; "Belum tahu" tanpa teks tambahan tetap bisa dikirim', msgs);
  expect('A20', (await p.$$('.sheet [required]')).length === 0, 'Tidak ada isian wajib');
  await p.click('.opt[data-need="baterai"]'); await p.fill('#panel-ket', 'Baterai cepat habis');
  expect('A20', (await p.textContent('.preview')).endsWith('Kebutuhan: ganti baterai. Keterangan: Baterai cepat habis'), 'Keterangan tambahan masuk ke pesan');
  await shot(p, 'panel-whatsapp-390');

  // Tutup: X
  const focusName = async () => p.evaluate(() => document.activeElement && document.activeElement.textContent.trim());
  await p.click('.x-btn'); await sleep(250);
  let s = await p.evaluate(() => ({ open: !document.getElementById('panel-layer').hidden, y: window.scrollY, url: location.search }));
  expect('PANEL', !s.open && Math.abs(s.y - yBefore) <= 2 && s.url === '?merek=iphone&tipe=11', 'X menutup panel; perangkat dan posisi gulir tetap', { s, yBefore });
  expect('PANEL', (await focusName()) === 'Tanya servis via WhatsApp', 'Fokus kembali ke tombol pembuka setelah X');
  // Isian tetap untuk perangkat yang sama
  await p.click('.cta button'); await p.waitForSelector('.sheet');
  expect('PANEL', (await p.getAttribute('.opt[data-need="baterai"]', 'aria-pressed')) === 'true' && (await p.inputValue('#panel-ket')) === 'Baterai cepat habis', 'Isian dipertahankan selama perangkat sama');
  // Escape
  await p.keyboard.press('Escape'); await sleep(250);
  s = await p.evaluate(() => ({ open: !document.getElementById('panel-layer').hidden, y: window.scrollY }));
  expect('PANEL', !s.open && Math.abs(s.y - yBefore) <= 2, 'Escape menutup panel tanpa mengubah posisi gulir', s);
  // Area gelap
  await p.click('.cta button'); await p.waitForSelector('.sheet');
  await p.mouse.click(195, 20); await sleep(250);
  expect('PANEL', await p.evaluate(() => document.getElementById('panel-layer').hidden), 'Ketuk area gelap menutup panel');
  // Fokus terkunci di panel
  await p.click('.cta button'); await p.waitForSelector('.sheet');
  for (let i = 0; i < 14; i++) await p.keyboard.press('Tab');
  expect('PANEL', await p.evaluate(() => !!document.activeElement.closest('#panel-layer')), 'Tab tetap berada di dalam panel');
  expect('PANEL', (await p.getAttribute('.x-btn', 'aria-label')) === 'Tutup pilihan kebutuhan' && (await p.$eval('.x-btn', (e) => { const r = e.getBoundingClientRect(); return r.width >= 44 && r.height >= 44; })), 'Tombol Tutup: label aksesibel dan area 44×44 px');
  expect('PANEL', (await p.getAttribute('.sheet', 'role')) === 'dialog' && (await p.getAttribute('.sheet', 'aria-modal')) === 'true', 'Panel bertanda dialog modal');
  // Back menutup panel sekali, lalu Back berikutnya berpindah layar
  await p.goBack(); await sleep(250);
  s = await p.evaluate(() => ({ open: !document.getElementById('panel-layer').hidden, url: location.search, y: window.scrollY }));
  expect('PANEL', !s.open && s.url === '?merek=iphone&tipe=11' && Math.abs(s.y - yBefore) <= 2, 'Back pertama menutup panel saja', s);
  await p.goBack(); await p.waitForSelector('.list'); await sleep(150);
  expect('PANEL', p.url().endsWith('?merek=iphone'), 'Back berikutnya kembali ke daftar tipe (tidak terjebak)', p.url());
  await p.goForward(); await p.waitForSelector('.dev h1'); await p.goForward(); await sleep(250);
  expect('PANEL', await p.evaluate(() => document.getElementById('panel-layer').hidden), 'Forward tidak membuka panel lagi');
  // Pilihan harga tetap setelah panel ditutup
  await p.click('.var >> nth=1');
  await p.click('button:has-text("Tanyakan layanan lain")'); await p.waitForSelector('.sheet');
  await p.click('.x-btn'); await sleep(250);
  expect('PANEL', (await p.getAttribute('.var >> nth=1', 'aria-pressed')) === 'true' && (await p.textContent('.cta .ctx')).includes('Ganti Kamera Belakang'), 'Pilihan layanan tetap setelah panel ditutup');
  expect('A20', (await p.$('.cta a.btn-pri[href*="wa.me"]')) !== null, 'Layanan terpilih: tombol utama langsung ke WhatsApp tanpa panel');
  // Ganti perangkat → isian dibersihkan
  await p.click('.dev .btn-sec'); await p.waitForSelector('.notice');
  await p.click('.list a:has-text("XR")'); await p.waitForSelector('.dev h1');
  await p.click('.cta button'); await p.waitForSelector('.sheet');
  expect('PANEL', (await p.$$eval('.opt[aria-pressed="true"]', (e) => e.length)) === 0 && (await p.inputValue('#panel-ket')) === '', 'Isian dibersihkan saat perangkat berubah');
  await p.keyboard.press('Escape'); await sleep(200);
  expect('PANEL', p.__errors.length === 0, 'Tidak ada error JavaScript', p.__errors);
  await p.context().close();
}

/* ---------- A10 ---------- */
async function testNetwork() {
  const p = await newPage(); await p.goto(base); await ready(p);
  await p.click('.tile:has(b:text-is("iPhone"))'); await p.waitForSelector('.list');
  await p.click('.list a:has-text("11")'); await p.waitForSelector('.dev h1');
  const ext = p.__requests.filter((u) => !u.startsWith(base));
  expect('A10', ext.length > 0 && ext.every((u) => u.startsWith('https://docs.google.com/spreadsheets/d/1mgN8N15Tu-KvNLs2IblKTKVbbtoIiaPOBd-MiFoL5gA/')), 'Satu-satunya permintaan luar adalah file publik (bukan file utama)', ext);
  const files = fs.readdirSync(path.join(__dirname, '..', 'site-live')).filter((f) => /\.(html|js|css)$/.test(f));
  const leak = files.filter((f) => /harga_modal|1XliPDpr5B6P03NsWQmt/i.test(fs.readFileSync(path.join(__dirname, '..', 'site-live', f), 'utf8')));
  expect('A10', leak.length === 0, 'Aset publik tidak memuat Harga_Modal atau ID file utama', leak);
  rec('A10', 'LULUS', 'Respons asli file publik diperiksa terpisah: ekspor 6 Okt 2026 hanya 7 kolom pelanggan; file utama berakses Dibatasi (dicek lewat Google Drive).');
  await p.context().close();
}

/* ---------- A22: Bagikan harga (F11) ---------- */
async function testShare() {
  const origin = new URL(base).origin;
  const want = origin + '/?merek=iphone&tipe=11';
  // 1. Menu berbagi HP tersedia: navigator.share dipanggil dengan tautan detail.
  let p = await newPage();
  await p.addInitScript(() => { navigator.share = (d) => { window.__shared = d; return Promise.resolve(); }; });
  await p.goto(base + '?merek=iphone&tipe=11'); await ready(p);
  const btn = p.locator('button.share');
  expect('A22', (await btn.textContent()).includes('Bagikan harga ini'), 'Tombol "Bagikan harga ini" ada di detail');
  const box = await btn.boundingBox();
  expect('A22', box && box.height >= 44, 'Area sentuh tombol Bagikan ≥ 44 px', box);
  await btn.click(); await sleep(100);
  const shared = await p.evaluate(() => window.__shared);
  expect('A22', shared && shared.url === want && /iPhone 11/.test(shared.title) && /iPhone 11/.test(shared.text), 'Menu berbagi menerima tautan detail iPhone 11 beserta judul', shared);
  expect('A22', await p.locator('.share-note').isHidden(), 'Setelah berbagi lewat menu HP tidak ada pesan tambahan');
  await p.context().close();
  // 2. Pelanggan membatalkan menu berbagi: tidak ada pesan, tidak menyalin.
  p = await newPage();
  await p.addInitScript(() => { navigator.share = () => Promise.reject(new DOMException('batal', 'AbortError')); navigator.clipboard.writeText = () => { window.__copied = true; return Promise.resolve(); }; });
  await p.goto(base + '?merek=iphone&tipe=11'); await ready(p);
  await p.click('button.share'); await sleep(100);
  expect('A22', (await p.locator('.share-note').isHidden()) && !(await p.evaluate(() => window.__copied)), 'Batal berbagi tidak memunculkan pesan dan tidak menyalin');
  await p.context().close();
  // 3. Tanpa menu berbagi (desktop): tautan disalin ke clipboard.
  p = await newPage();
  await p.context().grantPermissions(['clipboard-read', 'clipboard-write'], { origin });
  await p.addInitScript(() => { try { delete Navigator.prototype.share; } catch (e) { /* abaikan */ } });
  await p.goto(base + '?merek=iphone&tipe=xs%20max'); await ready(p);
  await p.click('button.share'); await p.waitForSelector('.share-note:not(:empty)');
  const clip = await p.evaluate(() => navigator.clipboard.readText());
  const wantMax = origin + '/?merek=iphone&tipe=xs+max';
  expect('A22', clip === wantMax && (await p.textContent('.share-note')).includes('Tautan disalin'), 'Tanpa menu berbagi: tautan disalin dan ada konfirmasi', { clip, wantMax });
  // Tautan yang disalin membuka detail yang sama di tab baru.
  const p2 = await newPage(); await p2.goto('about:blank'); await p2.goto(clip); await ready(p2);
  expect('A22', (await p2.textContent('.dev h1')) === 'iPhone XS Max', 'Tautan bersalin membuka detail iPhone XS Max');
  await p2.goBack(); await sleep(300);
  expect('A22', p2.url() === 'about:blank', 'Back dari tautan yang dibuka mengikuti riwayat asli (A15)', p2.url());
  await p2.context().close();
  await p.context().close();
  // 4. Clipboard ditolak: tampilkan tautan untuk disalin manual.
  p = await newPage();
  await p.addInitScript(() => { try { delete Navigator.prototype.share; } catch (e) { /* abaikan */ } navigator.clipboard.writeText = () => Promise.reject(new Error('ditolak')); });
  await p.goto(base + '?merek=iphone&tipe=11'); await ready(p);
  await p.click('button.share'); await p.waitForSelector('.share-note input');
  const v = await p.evaluate(() => { const i = document.querySelector('.share-note input'); return { value: i.value, focused: document.activeElement === i }; });
  expect('A22', v.value === want && v.focused, 'Clipboard ditolak: tautan tampil di kotak terpilih untuk disalin manual', v);
  await shot(p, 'a22-bagikan-salin-manual');
  await p.context().close();
  // 5. Tautan ke tipe yang sudah tidak ada.
  p = await newPage(); await p.goto(base + '?merek=iphone&tipe=99'); await ready(p);
  expect('A22', (await p.textContent('main')).includes('belum tercantum'), 'Tautan ke tipe yang tidak ada lagi menampilkan pesan "belum tercantum"');
  expect('A22', p.__errors.length === 0, 'Tanpa error JS', p.__errors);
  await p.context().close();
}

/* ---------- A23: Tampilan tautan dan ikon (F18) ---------- */
async function testMeta() {
  const p = await newPage(); await p.goto(base); await ready(p);
  const meta = await p.evaluate(() => {
    const g = (s) => { const e = document.querySelector(s); return e ? (e.getAttribute('content') || e.getAttribute('href')) : null; };
    return {
      title: g('meta[property="og:title"]'), desc: g('meta[property="og:description"]'), img: g('meta[property="og:image"]'),
      w: g('meta[property="og:image:width"]'), h: g('meta[property="og:image:height"]'), alt: g('meta[property="og:image:alt"]'),
      card: g('meta[name="twitter:card"]'), url: g('meta[property="og:url"]'), touch: g('link[rel="apple-touch-icon"]'), manifest: g('link[rel="manifest"]'),
    };
  });
  expect('A23', meta.title && meta.desc && meta.alt && meta.card === 'summary_large_image', 'Judul, deskripsi, teks alternatif gambar, dan jenis kartu tersedia', meta);
  expect('A23', /^https:\/\/[^/]+\/assets\/og-cover\.jpg$/.test(meta.img || '') && meta.w === '1200' && meta.h === '630', 'og:image memakai alamat absolut https dan ukuran 1200×630', meta);
  expect('A23', meta.url === null, 'Tidak ada og:url tetap, sehingga tautan detail yang dibagikan tidak dialihkan ke beranda');
  const localImg = new URL(meta.img).pathname;
  const dims = async (src) => p.evaluate((s) => new Promise((res) => { const i = new Image(); i.onload = () => res([i.naturalWidth, i.naturalHeight]); i.onerror = () => res(null); i.src = s; }), src);
  expect('A23', JSON.stringify(await dims(base.replace(/\/$/, '') + localImg)) === '[1200,630]', 'Gambar tautan termuat dari website dengan ukuran 1200×630');
  expect('A23', fs.statSync(path.join(__dirname, '..', 'site-live', localImg)).size < 300 * 1024, 'Ukuran gambar tautan < 300 KB (batas aman WhatsApp)');
  expect('A23', JSON.stringify(await dims(meta.touch)) === '[180,180]', 'Ikon layar utama iPhone 180×180 termuat');
  // Diambil lewat Playwright: CSP halaman (connect-src) memang tidak mengizinkan fetch ke situs sendiri.
  const mr = await p.context().request.get(new URL(meta.manifest, p.url()).href);
  const man = mr.ok() ? await mr.json() : null;
  expect('A23', man && man.display === 'browser' && man.short_name === 'BERKAH CELL', 'Manifest termuat; mode browser (tombol Back tetap ada di HP)', man);
  for (const ic of (man && man.icons) || []) {
    const [w] = ic.sizes.split('x').map(Number);
    expect('A23', JSON.stringify(await dims(ic.src)) === JSON.stringify([w, w]), 'Ikon manifest ' + ic.sizes + ' termuat dengan ukuran benar');
  }
  const sw = await p.evaluate(() => navigator.serviceWorker && navigator.serviceWorker.controller);
  expect('A23', !sw, 'Tanpa service worker atau cache offline (harga lama tidak tampil)');
  const ext = p.__requests.filter((u) => !u.startsWith(base) && !u.startsWith('data:'));
  expect('A23', ext.every((u) => u.startsWith('https://docs.google.com/spreadsheets/')), 'Tidak ada permintaan jaringan baru selain sumber data', ext);
  rec('A23', 'BELUM DIUJI', 'Kartu pratinjau di WhatsApp/Facebook sungguhan belum diuji: gambar memakai alamat produksi, jadi baru tampil setelah merge ke main.');
  await p.context().close();
}

/* ---------- A24: Informasi toko (F19) ---------- */
// Data persis dari pemilik, 6 Okt 2026.
const STORE = { address: 'Avava Jodoh, Lantai Dasar, Batam', hours: 'Setiap hari, 11.00–20.00 WIB', maps: 'https://share.google/xDIH18tkS00piTNIv' };
async function testStore() {
  const linkOk = (l) => l && l.href === STORE.maps && l.target === '_blank' && /noopener/.test(l.rel);
  const readLink = (p, sel) => p.$eval(sel, (a) => ({ href: a.href, target: a.target, rel: a.rel })).catch(() => null);
  const p = await newPage();
  const csp = []; p.on('console', (m) => { if (/Content Security Policy/i.test(m.text())) csp.push(m.text()); });
  await p.goto(base); await ready(p);
  // Beranda
  const home = await p.$eval('main .store', (s) => ({ addr: s.querySelector('.addr').textContent.trim(), hours: s.querySelector('.hours').textContent.trim(), title: s.querySelector('h2').textContent }));
  expect('A24', home.addr === STORE.address && home.hours === STORE.hours && home.title === 'Kunjungi toko', 'Beranda: blok "Kunjungi toko" dengan alamat dan jam persis data pemilik', home);
  expect('A24', linkOk(await readLink(p, 'main .store a')), 'Beranda: tombol "Buka di Google Maps" ke tautan pemilik, tab baru, rel=noopener');
  const box = await (await p.$('main .store a')).boundingBox();
  expect('A24', box.height >= 44, 'Tombol Maps area sentuh ≥ 44 px', box);
  await p.fill('#q', 'iphone 11'); await sleep(150);
  expect('A24', (await p.$('main .store')) === null, 'Saat mencari, blok toko tidak mengganggu hasil pencarian');
  // Footer (statis, terbaca tanpa JavaScript)
  const ftr = await p.$eval('.ftr', (f) => ({ addr: f.querySelector('.addr').textContent.trim(), hours: f.querySelector('.hours').textContent.trim() }));
  expect('A24', ftr.addr === STORE.address && ftr.hours === STORE.hours && linkOk(await readLink(p, '.ftr a')), 'Footer: alamat, jam, dan tautan Maps sama', ftr);
  // JSON-LD
  const ld = await p.$eval('script[type="application/ld+json"]', (s) => s.textContent).then((x) => { try { return JSON.parse(x); } catch (e) { return null; } });
  const oh = ld && ld.openingHoursSpecification && ld.openingHoursSpecification[0];
  expect('A24', ld && ld.name === 'BERKAH CELL' && ld.address.streetAddress + ', ' + ld.address.addressLocality === STORE.address && ld.hasMap === STORE.maps && ld.telephone === '+6289625050525',
    'Data lokal (JSON-LD) valid: nama, alamat, Maps, dan telepon sama', ld);
  expect('A24', oh && oh.opens === '11:00' && oh.closes === '20:00' && oh.dayOfWeek.length === 7, 'JSON-LD: buka setiap hari 11:00–20:00', oh);
  expect('A24', !('aggregateRating' in (ld || {})) && !('review' in (ld || {})), 'Tanpa rating atau ulasan karangan');
  // Bantuan dan detail
  await p.goto(base + '?bantuan=1'); await ready(p);
  const help = await p.$eval('main .store .addr', (e) => e.textContent.trim()).catch(() => null);
  expect('A24', help === STORE.address && linkOk(await readLink(p, 'main .store a')), 'Bantuan: blok toko dan tautan Maps tampil');
  await p.goto(base + '?merek=iphone&tipe=11'); await ready(p);
  const mini = await p.$eval('main .store-mini', (e) => e.textContent).catch(() => '');
  expect('A24', mini.includes(STORE.address) && mini.includes(STORE.hours) && linkOk(await readLink(p, 'main a.link-btn[href^="https://share.google"]')), 'Detail: kotak Bantuan memuat alamat, jam, dan tautan Maps');
  expect('A24', csp.length === 0 && p.__errors.length === 0, 'Tanpa pelanggaran CSP dan tanpa error JS', { csp, errors: p.__errors });
  const ext = p.__requests.filter((u) => !u.startsWith(base) && !u.startsWith('data:'));
  expect('A24', ext.every((u) => u.startsWith('https://docs.google.com/spreadsheets/')), 'Tidak ada permintaan jaringan baru (tautan Maps hanya dibuka saat diketuk)', ext);
  await shot(p, 'a24-detail-bantuan-toko');
  await p.goto(base + '?bantuan=1'); await ready(p); await shot(p, 'a24-bantuan-toko', true);
  await p.context().close();
  // Saat data gagal dimuat atau katalog kosong, alamat toko tetap tersedia sebagai alternatif.
  for (const mode of ['abort', 'empty']) {
    const pe = await newPage({ data: mode }); await pe.goto(base);
    await pe.waitForSelector(mode === 'abort' ? '#retry' : 'main .state');
    const a = await pe.$eval('main .store .addr', (e) => e.textContent.trim()).catch(() => null);
    expect('A24', a === STORE.address, (mode === 'abort' ? 'Data gagal dimuat' : 'Katalog kosong') + ': blok toko tetap tampil', a);
    await pe.context().close();
  }
  // Tanpa data toko: blok tidak tampil.
  const src = fs.readFileSync(path.join(__dirname, '..', 'site-live', 'app.js'), 'utf8');
  const noStore = src.replace(/STORE: \{[\s\S]*?\n    \},/, 'STORE: null,');
  const q = await newPage();
  expect('A24', noStore !== src, 'Fixture tanpa data toko berhasil dibuat');
  await q.route('**/app.js*', (route) => route.fulfill({ status: 200, contentType: 'application/javascript', body: noStore }));
  await q.goto(base); await ready(q);
  const h1 = (await q.$('main .store')) === null;
  await q.goto(base + '?bantuan=1'); await ready(q);
  const h2 = (await q.$('main .store')) === null;
  await q.goto(base + '?merek=iphone&tipe=11'); await ready(q);
  const h3 = (await q.$('main .store-mini')) === null && (await q.$('main a[href^="https://share.google"]')) === null;
  expect('A24', h1 && h2 && h3 && q.__errors.length === 0, 'Tanpa data toko (STORE: null), blok toko tidak tampil di beranda, bantuan, dan detail', { h1, h2, h3, errors: q.__errors });
  rec('A24', 'LULUS', 'Tujuan tautan pendek Google Maps tidak bisa dibuka dari sesi ini; pemilik mengeceknya di HP pada 6 Okt 2026 (laporan pemilik).');
  await q.context().close();
}

/* ---------- DOMAIN: berkahcellbatam.com dan www (D08) ---------- */
// Domain resmi disimulasikan: permintaan ke berkahcellbatam.com dilayani dari server uji lokal.
async function testDomain() {
  const p = await newPage();
  await p.context().route(/^https:\/\/(www\.)?berkahcellbatam\.com\//, async (route) => {
    const u = new URL(route.request().url());
    const res = await route.fetch({ url: base.replace(/\/$/, '') + u.pathname + u.search });
    await route.fulfill({ response: res });
  });
  await p.goto('https://www.berkahcellbatam.com/?merek=iphone&tipe=11'); await p.waitForURL('https://berkahcellbatam.com/**'); await ready(p);
  expect('DOMAIN', p.url() === 'https://berkahcellbatam.com/?merek=iphone&tipe=11', 'www.berkahcellbatam.com dialihkan ke berkahcellbatam.com dengan tautan yang sama', p.url());
  expect('DOMAIN', (await p.textContent('.dev h1')) === 'iPhone 11', 'Detail iPhone 11 tampil di domain resmi');
  const meta = await p.evaluate(() => ({
    og: document.querySelector('meta[property="og:image"]').content,
    ld: JSON.parse(document.querySelector('script[type="application/ld+json"]').textContent),
  }));
  expect('DOMAIN', meta.og === 'https://berkahcellbatam.com/assets/og-cover.jpg' && meta.ld.url === 'https://berkahcellbatam.com/' && /^https:\/\/berkahcellbatam\.com\//.test(meta.ld.logo) && /^https:\/\/berkahcellbatam\.com\//.test(meta.ld.image),
    'og:image dan JSON-LD memakai https://berkahcellbatam.com', meta);
  expect('DOMAIN', p.__errors.length === 0, 'Tanpa error JS', p.__errors);
  await p.context().close();
  rec('DOMAIN', 'BELUM DIUJI', 'Domain sungguhan (DNS, sertifikat, akses dari ISP yang memblokir workers.dev) baru bisa dicek setelah nameserver aktif di Cloudflare dan PR di-merge.');
}

run().catch((e) => { console.error(e); process.exitCode = 2; });
