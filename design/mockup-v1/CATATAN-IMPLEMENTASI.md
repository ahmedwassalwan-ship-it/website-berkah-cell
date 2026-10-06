# Mockup HP v1: catatan untuk review dan implementasi

Tanggal: 6 Oktober 2026 · Acuan: PRD.md v0.3 · Status: **menunggu review pemilik**. Belum ada perubahan pada website publik.

## Isi folder

| Berkas | Isi |
| --- | --- |
| `mockup.html` | Semua layar dalam bingkai HP, lengkap dengan catatan bernomor. Satu file, bisa dibuka offline. |
| `screens/*.png` | Gambar tiap layar untuk dilihat cepat di HP. |
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
   - Panel WhatsApp (usulan): satu kali Back menutup panel. Panel tidak boleh menahan Back berulang kali.
   - Bukti: rekaman layar per alur di Android Chrome (tombol dan gestur), iPhone Safari (geser tepi), dan desktop (Back/Forward), serta link dari chat WhatsApp. Alur yang belum bisa diuji dicatat "belum diuji".
4. **Alamat per layar di Cloudflare Workers.** Kalau memakai alamat path (misalnya `/iphone/11`), `wrangler.jsonc` perlu `assets.not_found_handling: "single-page-application"` supaya link langsung tidak menghasilkan 404. Pilihan antara path dan `#` diputuskan di rencana teknis. F11 (bagikan link dan pemulihan saat data berubah) **tetap P1**. Yang dikerjakan untuk P0 hanyalah tampilan "tipe belum tercantum" agar link lama tidak menampilkan halaman kosong.
5. **Konteks WhatsApp (keputusan 5, 6 Okt 2026).**
   - Pilihan harga dipilih → tombol utama langsung ke WhatsApp membawa layanan, kualitas, dan harga (jika ada di data).
   - Pertanyaan umum → panel F17 opsional, dengan tombol "Lewati, langsung ke WhatsApp".
   - Pesan selalu memakai konteks terbaru setelah ganti tipe atau ganti pencarian.
6. **Kondisi data:** memuat (kerangka abu-abu, tanpa harga), gagal (batas waktu 15 detik, "Coba lagi"), katalog sah kosong, dan tipe tidak ditemukan. Keempatnya punya tampilan berbeda. Tidak ada harga contoh.
7. **Kontras dan sentuhan:** token warna di `mockup.html` bagian 8 sudah dicek (teks pendukung ≥ 6:1). Area sentuh minimal 44 px. Fokus keyboard memakai cincin emas. Gerak dikurangi jika pengguna memintanya.

## Masih terbuka (jangan diputuskan saat implementasi)

- D01: font dan nilai warna final, serta persetujuan mockup.
- D02/D03: termasuk jasa atau tidak, biaya cek, syarat garansi, arti "Tidak Ada" dan "Jasa". Nilai ditampilkan apa adanya, kotak ketentuan dibiarkan kosong.
- D04: nomor toko dan nomor owner.
- D05: pengelompokan Xiaomi, Redmi, Poco, dan "Xiomi", serta penulisan model (misalnya "7 plus" dan "8 Plus").
- File logo resmi beresolusi tinggi.
