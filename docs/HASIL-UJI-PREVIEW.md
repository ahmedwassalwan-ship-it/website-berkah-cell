# Hasil uji preview v3

Tanggal: 6 Oktober 2026 · Acuan: PRD v0.4 · Kode: `site-live/` di branch `claude/sweet-brahmagupta-3nqyo7`.

## Cara uji dan batasannya

- **Perintah:** `node tests/e2e.js` (Playwright + Chromium headless). Hasil lengkap ada di `tests/hasil/log.txt` dan `tests/hasil/hasil.json`. Tangkapan layar ada di `tests/hasil/*.png`.
- **Data:** fixture `tests/fixtures/price_list_publik_2026-10-06.csv`, yaitu ekspor publik 6 Okt 2026 (157 baris). Fixture dikirim ke halaman lewat route interception, jadi **Google Sheets sungguhan tidak dipanggil** dalam uji ini. Ada juga fixture data rusak dan berbahaya yang dibuat di dalam tes.
- **Semua hasil adalah EMULASI Chromium:**
  - Emulasi perangkat (Pixel 7, iPhone 13) hanya meniru ukuran layar, sentuhan, dan user agent.
  - **Belum diuji di Android atau iPhone sungguhan, dan belum diuji di Safari/WebKit.**
  - Gestur Back di HP dan perpindahan ke aplikasi WhatsApp belum diuji.
- **Keyboard di layar** disimulasikan dengan memperkecil viewport, setara perilaku `interactive-widget=resizes-content` di Chrome Android.

## Ringkasan A01–A21

| ID | Status | Bukti utama / alasan |
| --- | --- | --- |
| A01 | LULUS | Grid merek berisi 10 merek (Xiomi → Xiaomi; Redmi dan Poco terpisah), 111 tipe, jumlah per merek sesuai data. Daftar iPhone 18, Vivo 15, Xiaomi 5. |
| A02 | LULUS | "iPhone 11", "  IPHONE 11  ", dan "iphone 11" menemukan iPhone 11 di urutan pertama. "11" menghasilkan beberapa merek. Alias "xiomi" tetap ditemukan. Pencarian kosong kembali ke grid. Hasil muncul < 300 ms (emulasi desktop). |
| A03 | LULUS | iPhone 11: 7 pilihan dalam 6 layanan. Anti Gores Spy dan Bening tidak digabung. Samsung A50S Incel dan OLED terpisah. Tidak ada harga dari tipe lain. |
| A04 | LULUS | Nilai tampil cocok dengan sumber (contoh: Ganti LCD Incel Rp 300.000, 30 menit, 7 hari). "Tidak Ada" pada Garansi tampil "Tanpa garansi". "Jasa" tampil "Jasa servis". "Tidak Ada" pada Kualitas tampil tanpa label. |
| A05 | LULUS | Harga "Rp0", "250rb", kosong, dan negatif tampil "Tanyakan harga". "Rp300,000" terbaca Rp 300.000. Garansi kosong tampil "Garansi: tanyakan ke toko". Baris identik tampil sekali, harga berbeda tidak ditimpa. |
| A06 | LULUS | Koneksi gagal dan respons rusak (halaman login) menampilkan "Daftar harga belum berhasil dimuat", tanpa harga contoh, dan pencarian dinonaktifkan. |
| A07 | LULUS | Semua tautan ke `wa.me/6289625050525`. Pesan layanan terpilih, panel, tidak ditemukan, dan konfirmasi ke owner sudah diperiksa. Tidak ada yang terkirim otomatis. |
| A08 | LULUS (emulasi) | Lebar 360/390/768/1440 tanpa gulir ke samping. Tombol bawah tidak menutupi konten terakhir. Layar pendek 360×640. Simulasi keyboard 360×360 untuk pencarian dan panel. Emulasi Pixel 7 dan iPhone 13. |
| A09 | LULUS (sebagian otomatis) | Urutan Tab, fokus terlihat, Enter membuka merek, fokus pindah ke judul, label kotak cari, area sentuh ≥ 44 px di Beranda/Tipe/Detail, kontras ≥ 4,5:1 pada elemen yang diperiksa. Pembaca layar sungguhan belum diuji. |
| A10 | LULUS | Permintaan luar hanya ke file publik `1mgN8N15…`. Aset tidak memuat Harga_Modal atau ID file utama. Ekspor publik 6 Okt hanya berisi 7 kolom pelanggan, dan file utama berakses Dibatasi (dicek lewat Drive). |
| A11 | BELUM DIUJI | Menunggu review pemilik atas preview. |
| A12 | BELUM BERLAKU | Belum ada rilis produksi. PR tidak di-merge. |
| A13 | LULUS (emulasi) | Detail → Back ke daftar Oppo dengan posisi gulir sama → Back ke Beranda dengan posisi gulir sama → Back keluar. Forward memulihkan posisi gulir. |
| A14 | LULUS (emulasi) | Kata pencarian, hasil, dan posisi gulir pulih. Keyboard tidak muncul sendiri. Satu Back lagi langsung keluar. |
| A15 | BELUM DIUJI (sebagian lulus) | Masuk langsung ke detail lalu Back mengikuti riwayat asli. "Semua merek" berfungsi. 10 huruf lalu 1 Back langsung keluar. Tipe yang tidak ada menampilkan pesan "belum tercantum". **Link yang dibuka dari aplikasi WhatsApp sungguhan belum diuji.** |
| A16 | LULUS (emulasi) | Nama model 61 karakter terbaca utuh di 360 px, juga di header kecil. Elemen yang difokus tidak tertutup header kecil maupun tombol bawah. |
| A17 | LULUS | Ganti tipe dari iPhone 11 ke XR: identitas, layanan, panel, dan pesan ikut berganti. Back kembali ke daftar, lalu ke iPhone 11. |
| A18 | LULUS | Pesan PRD untuk "samsung a55", pesan WhatsApp sesuai PRD (dengan dan tanpa kebutuhan). "Cari tipe lain" memilih teks pencarian. × menghapus. |
| A19 | LULUS | Pesan memuat iPhone 11, tanpa "tidak ditemukan" dan tanpa harga tebakan. Tidak bergantung pada filter. |
| A20 | LULUS | Empat pilihan, "Lewati", tanpa isian wajib, keterangan opsional. Layanan terpilih langsung membuka WhatsApp tanpa panel. |
| A21 | LULUS | Katalog kosong, hasil kosong, dan gagal jaringan masing-masing tampil berbeda. "Coba lagi" memulihkan katalog asli. |

**Pemeriksaan tambahan:**
- **KEAMANAN, LULUS:** nama model dan layanan yang berisi HTML tampil sebagai teks, tidak ada skrip yang berjalan, dan tidak ada error JS. Pemindaian statis tidak menemukan `innerHTML`, `eval`, atau atribut `onclick`.
- **PANEL, LULUS:**
  - Panel bisa ditutup dengan X, Escape, ketuk area gelap, dan Back.
  - Posisi gulir, pilihan layanan, dan fokus pulih setelah panel ditutup.
  - Isian disimpan selama perangkat sama dan dibersihkan saat perangkat berubah.
  - Back pertama hanya menutup panel. Back berikutnya berpindah layar. Forward tidak membuka panel lagi. Tab tetap di dalam panel.

## Temuan data (tanpa mengubah Sheet)

Laporan lengkap ada di `tests/hasil/laporan-data-2026-10-06.txt` (`python3 tools/cek_data.py <ekspor.csv>`).

- **"Jasa" hanya ada di kolom Kualitas, dan pemakaiannya tidak konsisten** untuk layanan yang sama:
  - Baris 37: iPhone 7, Buka Kunci, **Jasa**, Rp50.000, garansi Tidak Ada.
  - Baris 91: iPhone 8, Bypass, **Jasa**, Rp100.000, garansi Tidak Ada.
  - Baris 14: iPhone 8 Plus, Buka Kunci, **Tidak Ada**, Rp150.000.
  - Baris 40: iPhone 7 plus, Bypass, **Tidak Ada**, Rp60.000.
  - Di website, "Jasa" tampil sebagai label netral "Jasa servis". "Tidak Ada" tampil tanpa label.
- **Model yang sama dengan penulisan berbeda dalam satu merek** (ditampilkan sebagai satu tipe; semua baris harga tetap ada):
  - iPhone `XS`/`XS ` (spasi di akhir, baris 5)
  - Oppo `A77S`/`A77s`
  - Redmi `Note 11 Pro`/`note 11 pro`
  - Vivo `Y15s`/`Y15S`
  - Vivo `Y91`/`y91`
- **Kemungkinan model yang sama di merek berbeda** (tidak digabung, perlu dicek pemilik):
  - Redmi 9A dan Xiaomi 9A (yang terakhir dari baris "xiomi").
  - Redmi "Poco M3" dan Poco M3.
  - Xiaomi "Redmi Note 9" dan Redmi Note 9.
- **Garansi "Tidak Ada" pada Ganti LCD iPhone 6S Plus** (baris 10), sementara Ganti LCD lain bergaransi. Data ditampilkan apa adanya ("Tanpa garansi"), mohon dikonfirmasi.
- Tidak ditemukan baris identik, baris bertentangan, maupun harga tidak valid pada data 6 Okt.
