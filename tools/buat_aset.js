/* Membuat aset berbagi dan ikon untuk site-live/assets/ dari design/sumber-aset/.
 *
 *   node tools/buat_aset.js [folder-font-inter]
 *
 * Hasil:
 *   og-cover.jpg          1200×630, gambar saat tautan dibagikan (WhatsApp, Facebook)
 *   apple-touch-icon.png  180×180, ikon layar utama iPhone
 *   icon-192.png, icon-512.png  ikon layar utama Android (manifest)
 *
 * folder-font-inter (opsional) berisi inter-latin-{400,700,800}-normal.woff2,
 * misalnya dari `npm pack @fontsource/inter` (folder package/files). Tanpa folder
 * itu dipakai font sistem.
 */
const fs = require('fs');
const path = require('path');
const { chromium } = require(process.env.PLAYWRIGHT_PATH || '/opt/node22/lib/node_modules/playwright');

const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'design', 'sumber-aset');
const OUT = path.join(ROOT, 'site-live', 'assets');
const fontDir = process.argv[2];

const dataUrl = (file, type) => `data:${type};base64,${fs.readFileSync(file).toString('base64')}`;
const LOGO = dataUrl(path.join(SRC, 'logo-asli.png'), 'image/png');
const MASKOT = dataUrl(path.join(SRC, 'maskot-melambai-asli.png'), 'image/png');

function fontFaces() {
  if (!fontDir) return '';
  return [400, 700, 800].map((w) => `@font-face{font-family:Inter;font-weight:${w};src:url(${dataUrl(path.join(fontDir, `inter-latin-${w}-normal.woff2`), 'font/woff2')}) format('woff2')}`).join('');
}

const BASE_CSS = `${fontFaces()}
*{margin:0;box-sizing:border-box}
body{font-family:Inter,"Segoe UI",Roboto,Arial,sans-serif;-webkit-font-smoothing:antialiased}`;

const OG_HTML = `<!doctype html><html><head><meta charset="utf-8"><style>${BASE_CSS}
body{width:1200px;height:630px;overflow:hidden;position:relative;color:#fff;
  background:radial-gradient(900px 520px at 88% 30%,#1A3A6B 0%,rgba(26,58,107,0) 70%),linear-gradient(135deg,#0A1A33 0%,#10284D 100%)}
.bar{position:absolute;left:0;right:0;bottom:0;height:10px;background:linear-gradient(90deg,#C9A54E,#E6C77A,#C9A54E)}
.content{position:absolute;left:76px;top:70px;width:700px}
.brand{display:flex;align-items:center;gap:20px}
.logo{width:92px;height:92px;border-radius:50%;background:#fff;display:flex;align-items:center;justify-content:center;box-shadow:0 0 0 4px rgba(216,181,102,.55)}
.logo img{width:80px;height:80px}
.name{font-size:40px;font-weight:800;letter-spacing:1.5px}
.city{font-size:20px;font-weight:700;color:#D8B566;letter-spacing:3px;margin-top:2px}
h1{font-size:78px;line-height:1.04;font-weight:800;letter-spacing:-2px;margin-top:58px}
h1 span{color:#D8B566}
p.sub{font-size:28px;line-height:1.35;color:#C9D4E8;margin-top:22px;max-width:640px}
.pill{display:inline-flex;align-items:center;gap:12px;margin-top:34px;padding:14px 26px;border-radius:40px;background:#fff;color:#0A1A33;font-size:24px;font-weight:700}
.pill i{width:14px;height:14px;border-radius:50%;background:#25D366;display:block}
.maskot{position:absolute;right:62px;bottom:10px;height:500px;filter:drop-shadow(0 18px 30px rgba(0,0,0,.35))}
</style></head><body>
<div class="content">
  <div class="brand"><div class="logo"><img src="${LOGO}" alt=""></div>
    <div><div class="name">BERKAH CELL</div><div class="city">SERVICE HP · BATAM</div></div></div>
  <h1>Cek harga <span>servis HP</span> kamu</h1>
  <p class="sub">Harga, estimasi, dan garansi per tipe HP.</p>
  <div class="pill"><i></i>Tanya langsung via WhatsApp</div>
</div>
<img class="maskot" src="${MASKOT}" alt="">
<div class="bar"></div>
</body></html>`;

// Ikon: logo di lingkaran putih di atas latar navy, dengan cincin emas.
const iconHtml = (size) => `<!doctype html><html><head><meta charset="utf-8"><style>${BASE_CSS}
body{width:${size}px;height:${size}px;background:#0A1A33;display:flex;align-items:center;justify-content:center}
.c{width:${Math.round(size * 0.8)}px;height:${Math.round(size * 0.8)}px;border-radius:50%;background:#fff;
  box-shadow:0 0 0 ${Math.max(2, Math.round(size * 0.02))}px #C9A54E;display:flex;align-items:center;justify-content:center}
.c img{width:${Math.round(size * 0.68)}px;height:${Math.round(size * 0.68)}px}
</style></head><body><div class="c"><img src="${LOGO}" alt=""></div></body></html>`;

async function shot(browser, html, w, h, file, opts) {
  const page = await browser.newPage({ viewport: { width: w, height: h } });
  await page.setContent(html);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForFunction(() => [...document.images].every((i) => i.complete && i.naturalWidth > 0));
  await page.screenshot(Object.assign({ path: path.join(OUT, file) }, opts));
  await page.close();
  console.log(file, fs.statSync(path.join(OUT, file)).size, 'byte');
}

(async () => {
  const browser = await chromium.launch();
  await shot(browser, OG_HTML, 1200, 630, 'og-cover.jpg', { type: 'jpeg', quality: 86 });
  await shot(browser, iconHtml(180), 180, 180, 'apple-touch-icon.png', { type: 'png' });
  await shot(browser, iconHtml(192), 192, 192, 'icon-192.png', { type: 'png' });
  await shot(browser, iconHtml(512), 512, 512, 'icon-512.png', { type: 'png' });
  await browser.close();
})();
