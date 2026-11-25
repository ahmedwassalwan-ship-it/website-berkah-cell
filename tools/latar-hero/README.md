# Latar samar hero

`scene.js` menggambar laptop yang menjalankan "BERKAH CELL · Bypass Tool" dan iPhone 14 Pro Max
Deep Purple (bentuk generik, tanpa logo merek) dengan Three.js, latar transparan.

Gambar hasilnya dipakai sebagai `site-live/assets/latar-hero-m.webp` (HP) dan `latar-hero-d.webp`
(desktop), dengan opacity rendah dan memudar dari bawah (`.hero-latar` di `styles.css`).
Three.js tidak ikut dipublikasikan: website hanya memuat dua gambar WebP (±15 KB dan ±26 KB).

Untuk membuat ulang, salin `vendor/three` (three r170) ke folder ini, sajikan lewat server statis,
lalu panggil `render(canvas, { w, h, cam, target, fov, shift, ipX, ipZ, ipScale })` dan simpan PNG-nya.
Nilai yang dipakai (25 Nov 2026):
- HP 780×1000: `{"cam":[0,13,56],"target":[-0.5,4.8,0],"fov":30,"shift":[0.08,-0.05],"ipX":4.6,"ipZ":4.5,"ipScale":0.72}`
- Desktop 1800×760: `{"cam":[-3,13,40],"target":[0.5,4.6,0],"fov":30,"shift":[0.14,0.02]}`
