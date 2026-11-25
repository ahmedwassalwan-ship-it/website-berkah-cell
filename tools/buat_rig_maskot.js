/* Membuat lapisan Berkahtron yang bisa digerakkan (cutout animation) dari gambar asli.
 *
 *   node tools/buat_rig_maskot.js [folder-debug]
 *
 * Masukan: design/sumber-aset/maskot-melambai-asli.png (359×439, pose melambai).
 * Hasil di site-live/assets/:
 *   berkahtron-badan.webp  badan tanpa lengan yang melambai
 *   berkahtron-lengan.webp lengan + telapak (kanvas sama dengan badan: cukup ditumpuk,
 *                          lalu diputar di titik bahu PIVOT)
 * Bentuk dan warna tidak digambar ulang: lapisan diambil langsung dari piksel asli.
 * Bekas tangan di pinggiran kepala diisi dengan menyalin pinggiran yang sama dari sudut lain
 * (cincin wajah berbentuk lingkaran); bekas lengan di leher diisi dari sisi kanan (cermin).
 * Dengan folder-debug, pratinjau beberapa sudut lengan disimpan sebagai rig-pratinjau.png.
 */
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'design', 'sumber-aset', 'maskot-melambai-asli.png');
const OUT = path.join(ROOT, 'site-live', 'assets');
const DEBUG = process.argv[2];

// Garis tepi tangan dan lengan, ditelusuri dari gambar asli yang diperbesar (25 Nov 2026).
const ARM = [
  [27, 197], [27, 189], [35, 186], [28, 181], [29, 174], [37, 171], [41, 170], [36, 164], [39, 158], [47, 156],
  [53, 160], [54, 154], [60, 150], [67, 151], [72, 159], [75, 170], [78, 163], [85, 159], [93, 161], [97, 170],
  [98, 185], [97, 198], [99, 206], [106, 214], [118, 221], [132, 228], [146, 236], [154, 248], [152, 262],
  [138, 272], [120, 268], [104, 260], [90, 250], [78, 238], [66, 224], [56, 214], [44, 207], [34, 203],
];
// Bayangan lengan di leher (garis gelap di atas lengan) ikut dihapus dari badan.
const SHADOW = [[94, 199], [104, 202], [126, 216], [128, 226], [118, 222], [99, 210]];
const PIVOT = [140, 252]; // sendi bahu
const JOINT_R = 16;       // lingkaran sendi yang ada di kedua lapisan
const HEAD = { cx: 192, cy: 124, r: 125 }; // garis luar kepala (diukur dari tepi alfa)
const RING = { cx: 188, cy: 113 };         // pusat cincin wajah (tidak sepusat dengan garis luar)
const SHIFT = 50 * Math.PI / 180;          // sumber salinan pinggiran kepala: 50° ke arah atas
const MIRROR_X = 384;                      // x' = MIRROR_X - x: sisi kanan leher/syal sebagai cermin
const GROW = 4;                            // bekas tangan di badan dilebarkan 4 px agar tepi jari tidak tertinggal

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const src = 'data:image/png;base64,' + fs.readFileSync(SRC).toString('base64');
  const res = await page.evaluate(async ({ src, ARM, SHADOW, PIVOT, JOINT_R, HEAD, RING, SHIFT, MIRROR_X, GROW }) => {
    const img = new Image(); img.src = src; await img.decode();
    const W = img.width; const H = img.height;
    const mk = () => { const c = document.createElement('canvas'); c.width = W; c.height = H; return c; };
    const base = mk(); const bg = base.getContext('2d'); bg.drawImage(img, 0, 0);
    const orig = bg.getImageData(0, 0, W, H).data;
    const poly = (grow, extra) => {
      const c = mk(); const g = c.getContext('2d');
      g.beginPath(); ARM.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.fill();
      if (extra) { g.beginPath(); extra.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.fill(); }
      if (grow) { g.lineWidth = grow * 2; g.lineJoin = 'round'; g.stroke(); }
      const d = g.getImageData(0, 0, W, H).data; const m = new Uint8Array(W * H);
      for (let k = 0; k < W * H; k++) m[k] = d[k * 4 + 3] > 127 ? 1 : 0;
      return m;
    };
    const armM = poly(0); const holeM = poly(GROW, SHADOW);
    const inJoint = (x, y) => (x - PIVOT[0]) ** 2 + (y - PIVOT[1]) ** 2 <= JOINT_R ** 2;
    const body = new Uint8ClampedArray(orig); const arm = new Uint8ClampedArray(W * H * 4);
    const copy = (dst, i, j) => { for (let k = 0; k < 4; k++) dst[i + k] = orig[j + k]; };
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const p = y * W + x; const i = p * 4;
      // Tepi luar kepala yang semi-transparan di sela jari bukan bagian lengan.
      const edgeOfHead = orig[i + 3] < 230 && Math.abs(Math.hypot(x - HEAD.cx, y - HEAD.cy) - HEAD.r) < 7;
      if ((armM[p] && !edgeOfHead) || inJoint(x, y)) copy(arm, i, i);
      // Kiri kepala (x < 98, y < 250) aslinya hanya berisi tangan: sisa piksel samar dibersihkan.
      if (!holeM[p] && x < 98 && y < 250 && Math.hypot(x - HEAD.cx, y - HEAD.cy) > HEAD.r + 2) { body[i + 3] = 0; continue; }
      if (!holeM[p] || inJoint(x, y)) continue;
      if (Math.hypot(x - HEAD.cx, y - HEAD.cy) <= HEAD.r - 1) {
        // Pinggiran kepala: salin dari sudut lain pada cincin yang sama.
        const dx = x - RING.cx; const dy = y - RING.cy; const rr = Math.hypot(dx, dy); const a = Math.atan2(dy, dx) + SHIFT;
        copy(body, i, (Math.round(RING.cy + rr * Math.sin(a)) * W + Math.round(RING.cx + rr * Math.cos(a))) * 4);
      } else if (x >= 100 && y >= 205) {
        // Leher dan syal di belakang lengan: cermin dari sisi kanan badan.
        const mx = MIRROR_X - x;
        if (mx >= 0 && mx < W) copy(body, i, (y * W + mx) * 4); else body[i + 3] = 0;
      } else {
        body[i + 3] = 0; // latar belakang
      }
    }
    const put = (data) => { const c = mk(); c.getContext('2d').putImageData(new ImageData(data, W, H), 0, 0); return c; };
    const bc = put(body); const ac = put(arm);
    // Pratinjau: lengan diputar ke beberapa sudut di atas badan, ukuran asli dan ukuran tampil (±90 px)
    const angles = [0, 14, -14, -45, -80];
    const prev = document.createElement('canvas'); prev.width = W * angles.length; prev.height = H + 120; const pg = prev.getContext('2d');
    pg.fillStyle = '#0B1E3B'; pg.fillRect(0, 0, prev.width, prev.height);
    angles.forEach((deg, n) => {
      const one = mk(); const og = one.getContext('2d');
      og.drawImage(bc, 0, 0); og.translate(PIVOT[0], PIVOT[1]); og.rotate(deg * Math.PI / 180); og.translate(-PIVOT[0], -PIVOT[1]); og.drawImage(ac, 0, 0);
      pg.drawImage(one, W * n, 0);
      pg.drawImage(one, W * n + 20, H + 10, 90, 110);
    });
    return { body: bc.toDataURL('image/webp', 0.9), arm: ac.toDataURL('image/webp', 0.9), prev: prev.toDataURL('image/png'), W, H };
  }, { src, ARM, SHADOW, PIVOT, JOINT_R, HEAD, RING, SHIFT, MIRROR_X, GROW });
  const save = (file, url) => { fs.writeFileSync(file, Buffer.from(url.split(',')[1], 'base64')); console.log(path.relative(ROOT, file), fs.statSync(file).size, 'byte'); };
  save(path.join(OUT, 'berkahtron-badan.webp'), res.body);
  save(path.join(OUT, 'berkahtron-lengan.webp'), res.arm);
  if (DEBUG) save(path.join(DEBUG, 'rig-pratinjau.png'), res.prev);
  console.log('kanvas', res.W + '×' + res.H, 'pivot', PIVOT.join(','));
  await browser.close();
}
main().catch((e) => { console.error(e); process.exit(1); });
