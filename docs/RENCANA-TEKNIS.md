# Rencana teknis preview v3

Tanggal: 6 Oktober 2026 · Acuan: PRD v0.4, mockup revisi `bf9b25c` (`design/mockup-v1/`).

## Hosting dan navigasi

- **Hosting tetap sama:** Cloudflare Workers dengan static assets dari `site-live/` (`wrangler.jsonc`). Satu-satunya tambahan adalah blok `"previews": {}` yang kosong, karena build preview Cloudflare (`wrangler preview`) mewajibkannya. Perilaku produksi tidak berubah (lihat README, bagian Pengaturan build Cloudflare).
- **Navigasi memakai query string di halaman yang sama (`/`).** Konfigurasi sekarang tidak punya fallback SPA, jadi alamat path seperti `/iphone/11` akan menghasilkan 404. Query string bekerja tanpa perubahan konfigurasi:
  - Beranda: `/` atau `/?q=iphone+11` (kata pencarian disimpan di alamat).
  - Daftar tipe: `/?merek=iphone`
  - Detail: `/?merek=iphone&tipe=11`
  - Bantuan: `/?bantuan=1`
- **Setiap kartu memakai tautan `<a href>` sungguhan,** jadi tetap bisa dibuka di tab baru. Klik biasa ditangani `pushState`.
- **F11 (bagikan link) P0 sejak PRD v0.5.** Tipe yang tidak ada di data menampilkan pesan "belum tercantum" dan tautan "Semua merek".

## Versi 3.1: berbagi, tampilan tautan, dan ikon (PRD v0.5)

- **"Bagikan harga ini" (F11)** ada di kepala detail.
  - Tautannya `location.origin + modelHref(m)`, yaitu alamat detail yang sama dengan kartu tipe.
  - Urutan: `navigator.share` (menu berbagi HP). Jika tidak ada, `navigator.clipboard.writeText` dengan konfirmasi. Jika clipboard ditolak, tautan ditampilkan di kotak teks yang sudah terpilih.
  - Batal berbagi (`AbortError`) tidak memunculkan pesan apa pun.
  - Kotak pesan (`role=status`) selalu ada di DOM, tetapi kosong dan tanpa ruang. Live region yang baru dimunculkan sering tidak dibacakan pembaca layar.
- **Tampilan tautan (F18):** meta Open Graph statis di `index.html`.
  - `og:image` harus alamat absolut. Sejak Versi 3.3 memakai `https://berkahcellbatam.com/assets/og-cover.jpg`.
  - Sengaja **tanpa `og:url`**, karena Facebook akan mengarahkan semua tautan detail ke beranda.
  - Crawler WhatsApp tidak menjalankan JavaScript, jadi judul kartu sama untuk semua halaman. Nama tipe ikut di teks yang dibagikan lewat menu HP.
- **Ikon:** `apple-touch-icon.png` (180), `icon-192.png`, `icon-512.png`, dan `site.webmanifest`.
  - Manifest memakai `display: "browser"`, bukan `standalone`. Dengan begitu, website yang disimpan ke layar utama tetap punya tombol Back browser. Di iPhone, mode standalone tidak punya tombol Back.
  - Tidak ada service worker atau cache offline, supaya harga lama tidak tampil.
- **Aset dibuat ulang** dengan `node tools/buat_aset.js <folder-font-inter>` dari `design/sumber-aset/` (logo dan maskot resolusi asli dari website lama).

## Versi 3.2: informasi toko (F19)

- **Sumber data:** `CONFIG.STORE` di `app.js` (alamat, jam, tautan Maps) dari pemilik pada 6 Okt 2026.
  - Nilai yang sama ditulis statis di footer dan JSON-LD `index.html`, supaya terbaca tanpa JavaScript dan oleh mesin pencari.
  - **Jika data toko berubah, ubah ketiganya.** Uji A24 memeriksa ketiganya sama.
- **Tampil di:**
  - Beranda: blok "Kunjungi toko" di bawah bantuan; tidak tampil saat sedang mencari.
  - Halaman Bantuan: blok yang sama.
  - Detail: satu baris alamat dan jam di kotak Bantuan, plus tautan Maps.
  - Keadaan gagal memuat dan katalog kosong: blok yang sama, supaya pelanggan tetap tahu alamat toko.
- **`STORE: null` menyembunyikan semua blok toko.** Footer dan JSON-LD statis harus dihapus manual.
- **Tautan Maps di Android:** Chrome Android membuka tautan web Maps di tab browser, bukan di aplikasi (dilaporkan pemilik 7 Okt 2026).
  - Di Android, kecuali WebView aplikasi lain (UA berisi `; wv)`), `mapsAttrs()` mengubah tautan menjadi `intent://…;package=com.google.android.apps.maps;S.browser_fallback_url=<tautan asli>;end`, tanpa `target=_blank`. Hasilnya, aplikasi Google Maps terbuka, atau tautan yang sama terbuka di browser bila aplikasi tidak ada.
  - Tautan footer (`a[data-maps]`) ikut diubah saat halaman dimuat.
  - iPhone dan desktop tetap memakai tautan https biasa.
- **JSON-LD** memakai tipe `LocalBusiness`, tanpa rating atau ulasan.
  - Blok `application/ld+json` tidak dijalankan sebagai skrip, jadi CSP tidak diubah.
  - `addressRegion` "Kepulauan Riau" dan zona WIB adalah fakta lokasi Batam, bukan data bisnis.

## Versi 3.3: domain resmi berkahcellbatam.com (D08)

- **Alasan:**
  - Setelah rilis 6 Okt, `*.workers.dev` tidak bisa dibuka di jaringan WiFi seorang pelanggan (`NET::ERR_CERT_AUTHORITY_INVALID`), tetapi normal lewat VPN. Itu tanda intersepsi atau blokir ISP, bukan bug kode.
  - Pada saat yang sama, kartu WhatsApp tetap tampil. Itu bukti server berjalan.
- **Custom domain:** `routes` dengan `custom_domain: true` untuk `berkahcellbatam.com` dan `www.berkahcellbatam.com` di `wrangler.jsonc`.
  - Cloudflare membuat DNS record dan sertifikat sendiri.
  - Syarat: zona `berkahcellbatam.com` sudah **Active** di akun Cloudflare yang sama (nameserver dari Hostinger sudah diarahkan) **sebelum** merge ke `main`. Kalau belum, `wrangler deploy` produksi gagal.
  - Record lama (A/CNAME parkir) untuk apex dan `www` harus dihapus, karena bentrok dengan custom domain.
- **`www` dialihkan ke apex** di awal `app.js` (`location.replace`, path dan query tetap). Dengan begitu tidak perlu Redirect Rule di dashboard.
- **URL absolut** (`og:image`, JSON-LD `url`, `image`, `logo`) memakai `https://berkahcellbatam.com`.
- **workers.dev tetap aktif** sebagai cadangan (`workers_dev: true`).

## Polesan premium sebelum rilis domain (7 Okt 2026)

- **Arah tetap:** Katalog Bertingkat dengan navy dan emas. Tidak ada perubahan alur, teks harga, atau aturan bisnis.
- **Font:** Plus Jakarta Sans (variable, latin, 27 KB).
  - Disimpan di `assets/fonts/` beserta lisensi OFL, lalu di-preload.
  - CSP tidak berubah, karena font berasal dari situs sendiri.
  - Spasi kata dilonggarkan `.09em`, karena font ini rapat.
- **Hero:**
  - gradasi navy dengan cahaya emas tipis dan motif emboss jalur PCB (lihat bagian 8 Okt 2026)
  - kata "servis" bergradasi emas
  - garis emas di bawah hero
- **Baris kepercayaan** di bawah pencarian berisi tiga ketentuan yang sudah diputuskan pemilik: pemeriksaan gratis, harga termasuk jasa pemasangan, garansi tertera per layanan. Klaim lain tidak boleh ditambahkan tanpa keputusan pemilik.
- **Kartu dan elemen lain:**
  - Kartu merek, daftar, layanan, dan bantuan memakai bayangan berlapis dan aksen emas.
  - Pilihan harga terpilih ditandai garis emas.
  - Kartu "Kunjungi toko" dan footer berwarna navy.
  - Header identitas dan bar tombol bawah memakai efek kaca buram.
- **Bug yang diperbaiki:** di daftar tipe, nama tipe menempel dengan jumlah layanan ("A1K2 layanan"). `.li .t` dan `.li .s` sekarang `display:block`.
- **Desktop:** kartu layanan memakai `columns:2` (masonry), supaya tidak ada celah karena tinggi kartu berbeda.
- **Tanpa animasi pindah halaman.** Animasi seperti itu membuat halaman berkedip saat Back. Animasi tersisa: skeleton memuat dan panel. Semuanya mati jika pengguna memilih reduced motion.
- **Kelengkapan situs:**
  - `404.html` bergaya situs, dengan `not_found_handling: "404-page"` di `wrangler.jsonc`
  - `robots.txt` dan `sitemap.xml` ke domain resmi
  - `_headers` untuk header keamanan: nosniff, X-Frame-Options DENY, Referrer-Policy, Permissions-Policy, HSTS tanpa subdomain

## Tambahan dari pemilik (8 Okt 2026)

### Pencarian tanpa spasi

- **Masalah:** banyak pelanggan mengetik tipe HP tanpa spasi, misalnya "vivoy91". Sebelumnya ketikan itu tidak menemukan apa pun.
- **Cara kerja:** setiap nama tipe juga disimpan dalam bentuk rapat (`compactInfo()` di `app.js`).
  - Bentuk rapat hanya berisi huruf dan angka: "vivo y91" menjadi "vivoy91".
  - Posisi awal tiap kata ikut dicatat.
- **Aturan cocok:** kata kunci yang juga dirapatkan dianggap cocok **hanya jika dimulai di awal kata**.
  - "vivoy91", "y 91", "iphone11promax", dan "redminote9" cocok.
  - "e1" tidak memunculkan "iPhone 13", walaupun "iphone13" mengandung "e1".
- **Urutan hasil:** sama persis lebih dulu, lalu awalan, lalu bagian dari nama.
- **Saringan di halaman merek** memakai aturan yang sama (`matcher()`).
- **Alias "galaxy":**
  - `SEARCH_ALIAS = { samsung: ['galaxy', 'samsung galaxy'] }` menambah "galaxy a10" dan "samsung galaxy a10" ke kata kunci setiap tipe Samsung.
  - Alias hanya dipakai untuk pencarian. Nama yang tampil tetap "Samsung A10".
  - Alias untuk merek lain cukup ditambahkan di konstanta yang sama.
- **Bug lama yang ikut diperbaiki:**
  - Masalah: mengetik di pencarian atau saringan lalu menekan Back dalam 300 ms membuat `replaceState` yang tertunda menimpa alamat halaman tujuan. Akibatnya beranda tampil, tetapi alamatnya `?merek=vivo`.
  - Perbaikan: `popstate` sekarang membatalkan URL yang belum tersimpan.

### Motif emboss di latar

- **Motif:** jalur PCB (chip, bus jalur, BGA, via) sebagai simbol keahlian hardware.
- **Efek cetak timbul:** sorot putih di kiri atas dan bayangan di kanan bawah. Tidak ada warna baru.
- **Pembuatan:**
  - Ubin SVG 240×240 dibuat oleh `tools/buat_motif.js` dan menyambung tanpa garis sambungan.
  - Hasilnya ada dua: `assets/motif-emboss-terang.svg` (latar krem) dan `assets/motif-emboss-gelap.svg` (hero dan footer navy).
  - Ukuran sekitar 2 KB per file, dimuat dari situs sendiri, jadi CSP tidak berubah.
- **Penempatan:**
  - Latar krem halaman: motif tipis di sela kartu.
  - Hero: motif dipusatkan di kanan sekitar maskot lewat mask radial, supaya area teks tetap bersih.
  - Footer.
- **Mengubah motif:** edit `tools/buat_motif.js`, lalu jalankan `node tools/buat_motif.js`.

### Polesan terakhir sebelum rilis domain

- **Bug spasi di tombol:**
  - Gejala: di kartu harga tertulis "Garansi7hari", "Gantitipe HP", dan "Bagikanhargaini".
  - Penyebab: stylesheet bawaan Chrome mengatur ulang `word-spacing` pada `button` dan `input`, jadi pelonggaran `.09em` dari `body` tidak ikut.
  - Perbaikan: `button,input,textarea{word-spacing:inherit}`.
- **Status buka/tutup** di kartu "Kunjungi toko":
  - Fungsi `openStatus()` membaca `CONFIG.STORE.open`, `close`, dan `tz`.
  - Waktu dihitung dengan `Intl.DateTimeFormat` dalam zona Asia/Jakarta (WIB), jadi jam atau zona waktu HP tidak berpengaruh.
  - Status diperbarui tiap menit.
  - Hari libur belum dikenal. Jika toko tutup di hari tertentu, data itu harus ditambahkan dari pemilik.
- **"Cara servis di BERKAH CELL"** di beranda (`stepsBlock()`), berisi tiga langkah: cek harga, tanya lewat WhatsApp, bawa HP ke toko.
  - Isinya hanya fakta yang sudah ada: cara kerja situs, alamat, dan pemeriksaan gratis.
  - Tanpa data toko, langkah 3 ditulis tanpa alamat.
- **Nomor WhatsApp** ditulis `0896-2505-0525`. Footer juga mendapat tautan WhatsApp.
- **Kartu toko** memakai motif emboss gelap yang sama dengan hero dan footer.
- **Judul seksi** (`.sec-title`) dirata kiri. Sebelumnya, judul tanpa `small` terdorong ke kanan.

## Riwayat, Back, dan posisi gulir

- `history.scrollRestoration = 'manual'`.
- **Setiap entri riwayat punya `id`.** Posisi gulir disimpan di memori per `id`, dicadangkan ke `sessionStorage`. Cara ini menghindari `replaceState` berulang saat menggulir, yang dibatasi Safari.
- **Pindah layar:** `pushState({id baru})`, lalu render dan gulir ke atas.
- **Back/Forward (`popstate`):** layar dibangun dari URL dan `history.state`, lalu posisi gulir entri itu dipulihkan.
- **Mengetik pencarian atau filter tipe:** `replaceState` setelah jeda 300 ms, sehingga tidak menambah riwayat per huruf.
- **Pilihan harga di detail** disimpan di `history.state.sel` dan pulih saat kembali.
- **"Ganti tipe HP"** membuka daftar tipe merek yang sama, dengan `history.state.ganti` = tipe asal.
- **Panel kebutuhan** menambah satu entri `{panel: true}`:
  - X, Escape, dan area gelap menutup lewat `history.back()`.
  - Back menutup panel tanpa membangun ulang layar.
  - Forward ke entri panel tidak membuka panel lagi; entri itu dibersihkan dengan `replaceState`.

## Data

- **Sumber:** file publik "Berkah Cell - Harga Publik (website)", ekspor CSV gviz. Tidak ada Harga_Modal.
- **Batas waktu 15 detik.** Respons yang tidak punya kolom Brand, Model, Layanan, dan Harga_Jual dianggap gagal.
- **Normalisasi merek:**
  - Nama tampilan mengikuti daftar bot Telegram (iphone → iPhone, dan seterusnya).
  - Alias `xiomi` → Xiaomi.
  - Redmi dan Poco tetap terpisah.
  - Nama asli tetap bisa dicari (F10).
- **Normalisasi model (keputusan teknis):**
  - Model dalam satu merek dikelompokkan tanpa membedakan huruf besar-kecil dan spasi berlebih (Y15s/Y15S, "XS "/"XS"). Semua baris harga tetap ditampilkan.
  - Nama tampilan diambil dari penulisan yang paling sering muncul.
  - Model lintas merek tidak digabung.
  - Baris yang benar-benar identik hanya ditampilkan sekali. Baris dengan nilai berbeda tetap ditampilkan semua. Keduanya dicatat di konsol untuk perbaikan data.
- **Harga:**
  - Format yang diterima: `Rp300.000`, `300.000`, `300,000`, dan `300000`.
  - Nol, kosong, atau format lain ditampilkan sebagai **"Tanyakan harga"**, tidak pernah "Rp 0" atau gratis.
- **Kualitas:**
  - "Tidak Ada" → tanpa label kualitas.
  - "Jasa" → label netral "Jasa servis", bukan label kualitas.
  - Nilai lain → label kualitas apa adanya.
- **Garansi:**
  - "Tidak Ada" → "Tanpa garansi".
  - Kosong → "Garansi: tanyakan ke toko".
  - Nilai lain → "Garansi {nilai}".
- **Estimasi:** ditulis "Estimasi {nilai}". Kalau kosong, tidak ditampilkan.

## Keamanan

- **Semua teks dari Sheet dimasukkan lewat `textContent`.** Elemen dibuat dengan `createElement`, aksi dipasang dengan `addEventListener`. Tidak ada `innerHTML` yang berisi data.
- **Tautan WhatsApp** hanya ke `https://wa.me/6289625050525`, dengan teks pesan di-encode `encodeURIComponent`.
- **CSP lewat meta tag:** skrip dan gaya hanya dari `self`, `connect-src` hanya ke Google Sheets.

## Tata letak

- **Bar bawah dan header identitas:** tinggi bar bawah diukur, lalu konten diberi ruang bawah setinggi bar ditambah safe-area, supaya konten terakhir tidak tertutup. Header identitas yang menempel memakai `scroll-padding-top` supaya elemen yang mendapat fokus tidak tertutup.
- **Keyboard di Android:** viewport memakai `interactive-widget=resizes-content`.
- **Panel:** tinggi maksimal mengikuti `dvh` dan isinya bisa digulir saat keyboard terbuka.

## Pengujian

- **`tests/e2e.js`:** Playwright Chromium dengan data fixture lewat route interception, tanpa jaringan.
- **Lebar layar yang diuji:** 360, 390, 768, 1440, layar pendek 360×640, dan simulasi keyboard terbuka 360×360.
- **Hasilnya** dicatat di `docs/HASIL-UJI-PREVIEW.md`.
- **Batasan:** semuanya emulasi Chromium. Belum ada pengujian di Android, iPhone, atau WebKit sungguhan.
