/* Membuat motif emboss latar belakang untuk site-live/assets/ (tanpa dependensi).
 *
 *   node tools/buat_motif.js
 *
 * Motif: jalur PCB (chip, bus jalur, BGA, via), simbol keahlian hardware BERKAH CELL.
 * Efek emboss dibuat dari dua salinan garis yang sama: sorot terang di kiri atas dan
 * bayangan di kanan bawah, tanpa warna isi, seperti cetak timbul di kertas.
 *
 * Hasil (ubin 240×240 yang menyambung tanpa sambungan terlihat):
 *   motif-emboss-terang.svg  untuk latar krem halaman
 *   motif-emboss-gelap.svg   untuk latar navy (hero dan footer)
 */
const fs = require('fs');
const path = require('path');

const OUT = path.join(__dirname, '..', 'site-live', 'assets');
const T = 240; // ukuran ubin
const R = (v) => Math.round(v * 100) / 100;
const K = 10 * Math.tan(Math.PI / 8); // geser tikungan 45° agar jarak bus tetap 10

// Semua koordinat boleh melewati batas ubin (sampai 2×T). Bagian yang lewat digambar
// ulang di sisi seberang oleh salinan geser -T, sehingga ubin menyambung.
const shapes = [];
const path_ = (d) => shapes.push(`<path d="${d}"/>`);
const ring = (x, y, r) => shapes.push(`<circle cx="${R(x)}" cy="${R(y)}" r="${r}"/>`);

// Chip utama 40×40 di (150,130) dengan penanda pin 1
shapes.push('<rect x="150" y="130" width="40" height="40" rx="5"/>');
ring(158, 138, 1.6);

// Bus mendatar: pin kanan chip → naik 30 → melintasi tepi → turun 30 → pin kiri chip berikutnya
for (let i = 0; i < 3; i++) {
  const y = 140 + 10 * i; const a = 206 + K * i; const d = 330 - K * i;
  path_(`M190 ${y}H${R(a)}L${R(a + 30)} ${y - 30}H${R(d)}L${R(d + 30)} ${y}H${150 + T}`);
}
// Bus tegak: pin bawah chip → geser kiri 30 → melintasi tepi → geser kanan 30 → pin atas chip berikutnya
for (let j = 0; j < 3; j++) {
  const x = 160 + 10 * j; const p = 188 + K * j; const q = 320 - K * j;
  path_(`M${x} 170V${R(p)}L${x - 30} ${R(p + 30)}V${R(q)}L${x} ${R(q + 30)}V${130 + T}`);
}

// BGA di sudut ubin (pusat 278,256): kotak 52×52 dan 4×4 bola solder
shapes.push('<rect x="252" y="230" width="52" height="52" rx="6"/>');
for (const bx of [263, 273, 283, 293]) for (const by of [241, 251, 261, 271]) ring(bx, by, 1.1);

// Jalur keluar BGA, masing-masing berakhir di via (cincin r 3.4)
const V = 3.4;
path_('M252 246H228L212 230V200'); ring(212, 200 - V, V);
path_('M252 266H222L206 282V312'); ring(206, 312 + V, V);
path_('M304 246H330L346 230V205'); ring(346, 205 - V, V);
path_('M268 282V304L284 320H330'); ring(330 + V, 320, V);
path_('M278 230V200'); ring(278, 200 - V, V);

function svg({ shadow, shadowOpacity, light, lightOpacity }) {
  const o = 0.65; // jarak sorot dan bayangan dari garis asli (px)
  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${T}" height="${T}" viewBox="0 0 ${T} ${T}">`
    + '<defs>'
    + `<g id="m" fill="none" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round">${shapes.join('')}</g>`
    + `<g id="t"><use xlink:href="#m"/><use xlink:href="#m" x="-${T}"/><use xlink:href="#m" y="-${T}"/><use xlink:href="#m" x="-${T}" y="-${T}"/></g>`
    + '</defs>'
    + `<use xlink:href="#t" x="${o}" y="${o}" stroke="${shadow}" opacity="${shadowOpacity}"/>`
    + `<use xlink:href="#t" x="-${o}" y="-${o}" stroke="${light}" opacity="${lightOpacity}"/>`
    + '</svg>\n';
}

const files = {
  'motif-emboss-terang.svg': svg({ shadow: '#5A461E', shadowOpacity: 0.11, light: '#FFFFFF', lightOpacity: 0.8 }),
  'motif-emboss-gelap.svg': svg({ shadow: '#000000', shadowOpacity: 0.38, light: '#FFFFFF', lightOpacity: 0.07 }),
};
for (const [name, text] of Object.entries(files)) {
  fs.writeFileSync(path.join(OUT, name), text);
  console.log(name, text.length, 'byte');
}
