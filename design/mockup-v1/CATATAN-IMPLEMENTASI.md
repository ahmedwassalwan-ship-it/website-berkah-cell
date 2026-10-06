# Mockup HP v1: catatan untuk review dan implementasi

Tanggal: 6 Oktober 2026 (revisi 2) · Acuan: PRD.md v0.3 · Status: **menunggu review pemilik**. Belum ada perubahan pada website publik.

**Revisi 2** (review Codex atas commit `b650abd`): panel WhatsApp diberi tombol Tutup yang jelas; catatan review dipisahkan dari layar pelanggan, dan tersedia versi mockup bersih.

## Isi folder

| Berkas | Isi |
| --- | --- |
| `mockup.html` | **Versi anotasi.** Semua layar dengan nomor catatan di luar bingkai HP, catatan, status keputusan, alur Back, sistem visual, dan keputusan terbuka. |
| `mockup-bersih.html` | **Versi bersih** untuk menilai pengalaman pelanggan. Hanya layar HP, tanpa nomor, kode keputusan, atau catatan. |
| `screens/*.png` | Gambar tiap layar dari versi bersih. |
| `src/template.html`, `src/build.py` | Sumber kedua versi. Blok `<!--A-->` hanya untuk versi anotasi, blok `<!--C-->` hanya untuk versi bersih. Bangun ulang dengan `python3 src/build.py`. Skrip ini memeriksa bahwa versi bersih tidak memuat nomor catatan, D02–D05, “Usulan”, atau “Terbuka”. |
| `assets/*.webp` | Logo dan maskot dari website saat ini, dikecilkan (±65 KB, sebelumnya ±680 KB). |

## Sumber yang dipakai

- **Harga dan model:** file publik Price_List yang diunduh pemilik pada 6 Okt 2026, tanpa diubah. Contohnya iPhone 11: Ganti LCD Incel Rp300.000, 30 menit, garansi 7 hari.
- **Logo:** gambar logo yang dipakai website saat ini (197×200 px, latar transparan). File logo resmi beresolusi tinggi belum diterima.
- **Contoh tipe tidak ditemukan:** "Samsung A55" sesuai contoh PRD. Tipe ini memang belum ada di data 6 Okt 2026.

## Catatan implementasi yang wajib

1. **Teks dari Sheet dirender sebagai teks, bukan HTML.** Kode sekarang menyisipkan data lewat `innerHTML` dan `onclick="…'${brand}'…"`. Akibatnya tanda kutip atau `<` di data bisa merusak tampilan atau menjalankan kode. Di implementasi baru:
   - Buat elemen dengan `document.createElement` dan isi lewat `textContent`.
   - Pasang aksi dengan `addEventListener`. Jangan menyusun atribut `onclick` dari data.
   - Buat tautan WhatsApp dengan `encodeURIComponent`.
   - Baca parameter URL sebagai data. Jangan pernah menyisipkannya sebagai HTML.
   - Uji dengan data uji terpisah yang berisi `'`, `"`, `<b>`, dan `&`.
2. **Pencarian F02:** cocokkan ke gabungan "merek + model", tanpa membedakan huruf besar-kecil dan spasi di awal atau akhir. Ketikan "iphone 11" harus menemukan iPhone 11. Di website sekarang ketikan ini gagal.
3. **Back dan pemulihan (F06, A13–A15, A17).** Alamat yang berbeda per layar **belum membuktikan** perilaku Back benar.
   - Membuka merek, tipe, atau detail: simpan dulu posisi gulir layar lama ke `history.state`, lalu `pushState`.
   - Mengetik pencarian: simpan kata ke entri yang sama dengan `replaceState` setelah jeda. Tidak boleh menambah riwayat per huruf.
   - `history.scrollRestoration = 'manual'`. Pada `popstate`, bangun ulang layar dari state, lalu pulihkan kata pencarian, hasil, dan posisi gulir.
   - Tangani `pageshow` untuk halaman yang kembali dari cache browser (Safari iPhone).
   - Masuk langsung dari luar: tidak ada layar buatan. "Semua merek" adalah tautan biasa.
   - Panel WhatsApp: lihat poin 8.
   - Bukti: rekaman layar per alur di Android Chrome (tombol dan gestur), iPhone Safari (geser tepi), dan desktop (Back/Forward), serta link dari chat WhatsApp. Alur yang belum bisa diuji dicatat "belum diuji".
4. **Alamat per layar di Cloudflare Workers.** Kalau memakai alamat path (misalnya `/iphone/11`), `wrangler.jsonc` perlu `assets.not_found_handling: "single-page-application"` supaya link langsung tidak menghasilkan 404. Pilihan antara path dan `#` diputuskan di rencana teknis. F11 (bagikan link dan pemulihan saat data berubah) **tetap P1**. Yang dikerjakan untuk P0 hanyalah tampilan "tipe belum tercantum" agar link lama tidak menampilkan halaman kosong.
5. **Konteks WhatsApp (keputusan 5, 6 Okt 2026).**
   - Pilihan harga dipilih → tombol utama langsung ke WhatsApp membawa layanan, kualitas, dan harga (jika ada di data).
   - Pertanyaan umum → panel F17 opsional, dengan tombol "Lewati, langsung ke WhatsApp".
   - Pesan selalu memakai konteks terbaru setelah ganti tipe atau ganti pencarian.
6. **Kondisi data:** memuat (kerangka abu-abu, tanpa harga), gagal (batas waktu 15 detik, "Coba lagi"), katalog sah kosong, dan tipe tidak ditemukan. Keempatnya punya tampilan berbeda. Tidak ada harga contoh.
7. **Kontras dan sentuhan:** token warna di `mockup.html` bagian 8 sudah dicek (teks pendukung ≥ 6:1). Area sentuh minimal 44 px. Fokus keyboard memakai cincin emas. Gerak dikurangi jika pengguna memintanya.

8. **Panel pilihan kebutuhan (F17): menutup, Back, Escape, dan fokus.**
   - **Struktur:** `role="dialog"`, `aria-modal="true"`, `aria-labelledby` menunjuk ke judul panel. Konten di belakang panel diberi `inert` selama panel terbuka.
   - **Tombol Tutup:** `<button type="button" aria-label="Tutup pilihan kebutuhan">` berisi ikon X (`aria-hidden="true"`). Area sentuh minimal 44 × 44 px, ada di kanan atas, dengan cincin fokus yang terlihat.
   - **Cara menutup:** X, tombol Escape, dan Back HP atau browser. Mengetuk area gelap juga menutup (usulan). Menutup panel tidak membuka WhatsApp dan tidak berpindah layar.
   - **Riwayat (usulan, perlu diuji):** membuka panel menambah **satu** entri `{panel: 'kebutuhan'}`. X, Escape, dan area gelap menutup lewat `history.back()`, sehingga riwayat tidak menumpuk. Back pertama menutup panel, Back berikutnya mengikuti layar sebelumnya. Kalau Forward kembali ke entri panel, panel tidak dibuka ulang dan entri dibersihkan dengan `replaceState`. Panel tidak boleh menahan Back berulang kali (F06).
   - **Yang harus tetap terjaga setelah ditutup:** perangkat yang dilihat, kata pencarian, pilihan harga yang ditandai, dan posisi gulir. Panel hanya lapisan, jadi layar di belakangnya tidak dibangun ulang. Gulir halaman dikunci saat panel terbuka (`position: fixed` dengan `top: -scrollY`), lalu dikembalikan ke `scrollY` yang sama saat ditutup.
   - **Fokus:** saat dibuka, fokus pindah ke judul panel (`tabindex="-1"`) dan dibatasi di dalam panel. Saat ditutup dengan cara apa pun, fokus kembali ke elemen yang membukanya, misalnya “Tanya servis via WhatsApp”, “Tanyakan layanan lain”, atau “Tanyakan lewat WhatsApp”.
   - **Isi panel (usulan):** kebutuhan dan keterangan disimpan selama pelanggan masih di perangkat yang sama, lalu dikosongkan saat ganti perangkat atau ganti kata pencarian.
   - **Bukti:** rekaman layar untuk keempat cara menutup di Android Chrome dan iPhone Safari. Uji keyboard (Tab tidak keluar dari panel, Escape menutup, fokus kembali). Uji pembaca layar TalkBack dan VoiceOver: label tombol dibacakan “Tutup pilihan kebutuhan”.
9. **Ketentuan bisnis di layar pelanggan.** Teks tentang termasuk jasa atau tidak, biaya cek, dan syarat garansi **tidak ditampilkan** sampai D02/D03 diputuskan. Tempatnya disiapkan di kotak Bantuan pada detail harga, di bawah tautan “Konfirmasi ke owner”. Jangan mengisinya dengan teks perkiraan.

## Masih terbuka (jangan diputuskan saat implementasi)

- D01: font dan nilai warna final, serta persetujuan mockup (revisi 2).
- Usulan yang belum disetujui: menutup panel lewat area gelap, satu entri riwayat untuk panel, penyimpanan isi panel per perangkat, baris harga yang bisa diketuk, filter di dalam merek, kalimat pesan WhatsApp, dan header navy yang ikut tergulir.
- D02/D03: termasuk jasa atau tidak, biaya cek, syarat garansi, arti "Tidak Ada" dan "Jasa". Nilai ditampilkan apa adanya, kotak ketentuan dibiarkan kosong.
- D04: nomor toko dan nomor owner.
- D05: pengelompokan Xiaomi, Redmi, Poco, dan "Xiomi", serta penulisan model (misalnya "7 plus" dan "8 Plus").
- File logo resmi beresolusi tinggi.
