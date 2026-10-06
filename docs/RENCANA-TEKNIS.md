# Rencana teknis preview v3

Tanggal: 6 Oktober 2026 · Acuan: PRD v0.4, mockup revisi `bf9b25c` (`design/mockup-v1/`).

## Hosting dan navigasi

- **Hosting tetap sama:** Cloudflare Workers dengan static assets dari `site-live/` (`wrangler.jsonc`). Konfigurasi **tidak diubah**.
- **Navigasi memakai query string di halaman yang sama (`/`).** Konfigurasi sekarang tidak punya fallback SPA, jadi alamat path seperti `/iphone/11` akan menghasilkan 404. Query string bekerja tanpa perubahan konfigurasi:
  - Beranda: `/` atau `/?q=iphone+11` (kata pencarian disimpan di alamat).
  - Daftar tipe: `/?merek=iphone`
  - Detail: `/?merek=iphone&tipe=11`
  - Bantuan: `/?bantuan=1`
- **Setiap kartu memakai tautan `<a href>` sungguhan,** jadi tetap bisa dibuka di tab baru. Klik biasa ditangani `pushState`.
- **F11 (bagikan link dan pemulihan saat data berubah) tetap P1.** Tipe yang tidak ada di data hanya menampilkan pesan "belum tercantum" dan tautan "Semua merek".

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
