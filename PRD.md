# PRD Website Daftar Harga Servis BERKAH CELL

Versi 0.7 · 9 Oktober 2026 · Bahasa Indonesia

**Status:** Tujuh pengembangan navigasi dan bantuan katalog beserta seluruh aturan pendukungnya telah disetujui pemilik pada 5 Oktober 2026. Pada 6 Oktober 2026 pemilik menyetujui arah desain Katalog Bertingkat, menyetujui mockup revisi sebagai acuan implementasi preview, serta menetapkan aturan harga, garansi, arti “Jasa”, nomor WhatsApp, dan normalisasi merek (bagian 9). Setelah meninjau preview, pemilik menyetujui paket peningkatan profesional: tautan berbagi, tampilan tautan saat dibagikan, ikon, dan informasi toko (bagian 9). Desain final website, keputusan operasional yang masih terbuka, dan kesiapan publikasi belum ditetapkan.

**Berkas acuan:** PRD.md. Versi 0.7 menggantikan versi 0.6 sebagai dokumen kebutuhan terbaru. Persetujuan kebutuhan tercatat pada bagian 9; status implementasi dan hasil pengujian dicatat terpisah.

**Pemilik produk:** Pemilik BERKAH CELL. **Pengguna dokumen:** Pemilik, desainer, developer, serta AI yang membantu pengembangan berikutnya.

## 1 Tujuan dan arah produk

BERKAH CELL membutuhkan website daftar harga servis HP yang membantu pelanggan menemukan layanan dan harga sesuai perangkatnya, lalu melanjutkan pertanyaan ke toko lewat WhatsApp. Website harus terasa elegan dan mewah, tetap mudah dipakai, dan nyaman dibaca melalui HP.

Redesign mencakup susunan halaman, hierarki informasi, tipografi, komponen, ruang antarelemen, dan alur pencarian. Identitas BERKAH CELL menjadi pegangan selama perubahan tersebut. Keberhasilan visual harus dinilai melalui contoh halaman nyata yang ditinjau pemilik.

PRD ini menjelaskan hasil yang harus dicapai. Teknologi dan cara pelaksanaannya dapat berkembang sepanjang kebutuhan produk, ketepatan data, dan keputusan desain yang disetujui tetap terpenuhi. Pergantian model AI menjadi kesempatan mengevaluasi peningkatan; setiap perubahan tetap dibuktikan dengan desain dan pengujian.

### Hasil yang dituju

- Pelanggan dapat menemukan harga berdasarkan merek, tipe HP, layanan, dan pilihan kualitas yang tersedia.
- Harga, estimasi, dan garansi mudah dibedakan serta dibaca sebelum pelanggan menghubungi toko.
- Pemilik dapat memperbarui informasi servis melalui sumber data yang disepakati.
- Tampilan memiliki identitas BERKAH CELL yang konsisten di HP dan desktop.
- Kode, dokumen, aset, dan catatan pengujian dapat diteruskan kepada developer atau model AI lain.

### Cakupan rilis pertama

Katalog merek dan model HP, pencarian lintas merek, rincian layanan, harga jual, kualitas, estimasi, garansi, tombol WhatsApp, informasi konfirmasi harga ke owner, tampilan responsif, serta keadaan memuat, kosong, dan gagal mengambil data.

Ganti LCD, baterai, dan speaker adalah contoh kebutuhan yang disebut pemilik. Website harus dapat menampung seluruh jenis servis yang sah dalam katalog. Ketersediaan setiap layanan dan harganya mengikuti data toko; contoh kategori bukan pernyataan bahwa semua layanan tersedia untuk semua HP.

Katalog terus dilengkapi ketika ada HP terkait masuk servis, sesuai penjelasan pemilik. Perangkat atau layanan yang belum tercantum tidak otomatis berarti layanan tersebut tidak tersedia.

Cakupan yang disetujui juga meliputi tombol Kembali bawaan HP dan browser, pemulihan pencarian serta posisi gulir, identitas perangkat saat membaca harga, perpindahan model yang cepat, bantuan ketika tipe atau layanan belum tercantum, pilihan kebutuhan servis yang opsional, dan pesan WhatsApp yang membawa konteks pelanggan.

### Di luar cakupan rilis pertama

Pembayaran online, akun pelanggan, pemesanan jadwal, pelacakan servis, inventaris, laporan keuangan, dashboard admin baru, serta integrasi otomatis n8n atau AI Workforce. Penambahannya memerlukan kebutuhan dan pekerjaan tersendiri.

<!-- PAGE -->

## 2 Pengguna dan perjalanan utama

### Pelanggan yang mengetahui tipe HP

Pelanggan membuka website dan mengetik model, misalnya “iPhone 11”. Sistem menampilkan hasil dengan merek dan model yang jelas. Pelanggan memilih perangkat, memeriksa layanan beserta pilihan kualitas dan harga, lalu dapat membuka WhatsApp dengan konteks pilihannya.

### Pelanggan yang ingin menelusuri katalog

Pelanggan memilih merek, memilih model, lalu melihat layanan untuk perangkat tersebut. Tombol Kembali bawaan HP atau browser mengembalikan pelanggan ke layar sebelumnya sesuai alur yang ditempuh. Tombol “Ganti tipe HP” membuka daftar model dalam merek yang sama, sedangkan navigasi “Semua merek” menuju menu merek.

Nama lengkap merek dan model jelas pada halaman harga. Saat judul perangkat tidak lagi terlihat karena pelanggan menggulir, header kecil mempertahankan identitas perangkat tanpa menutupi harga, isi, atau tombol.

### Pelanggan yang tidak menemukan tipe HP

Setelah data berhasil dimuat, pencarian yang tidak menemukan tipe menampilkan kata yang dicari dan penjelasan bahwa harga belum tercantum. Pelanggan mendapat tombol “Tanyakan lewat WhatsApp” dan “Cari tipe lain”. Pencarian juga dapat dihapus dengan mudah. Katalog yang belum memuat tipe tersebut tidak menjadi dasar untuk menyatakan layanan tidak tersedia.

### Pelanggan yang tidak menemukan layanan pada tipe yang tersedia

Halaman detail perangkat menyediakan “Layanan yang kamu cari belum ada? Tanyakan ke kami.” Bantuan ini tidak bergantung pada filter jenis servis. Pelanggan dapat menanyakan layanan di luar daftar dengan merek dan model yang dipilih sebagai konteks.

### Pelanggan yang menanyakan kebutuhan servis

Sebelum berpindah ke WhatsApp untuk pertanyaan umum, pelanggan boleh memilih “Ganti LCD atau layar”, “Ganti baterai”, “Layanan lainnya”, atau “Belum tahu, ingin menjelaskan keluhan”. Pilihan ini opsional dan tombol langsung ke WhatsApp tetap tersedia. Pertanyaan umum mencakup tombol utama tanpa pilihan harga, bantuan layanan yang belum tercantum, tipe tidak ditemukan, dan bantuan umum. Jika pelanggan sudah memilih satu layanan dan kualitas pada detail harga, WhatsApp langsung memakai konteks layanan tersebut tanpa menampilkan pilihan kebutuhan. Masukan tambahan, bila disediakan, juga opsional. Pilihan keluhan tidak dianggap sebagai diagnosis otomatis.

Pesan membawa tipe yang dicari atau perangkat yang dipilih, ditambah kebutuhan servis jika tersedia. Website tidak menebak harga untuk tipe atau layanan yang belum memiliki data. Pelanggan meninjau dan mengirim sendiri pesannya.

### Pelanggan yang ingin mengonfirmasi perbedaan harga

Tindakan utama pada detail harga adalah “Tanya servis via WhatsApp”. “Komplen ke Owner” atau konfirmasi perbedaan harga ditempatkan sebagai bantuan terpisah, bukan tombol utama. Toko memiliki satu nomor WhatsApp; pertanyaan servis dan bantuan atau komplain kepada owner menuju nomor yang sama dengan isi pesan sesuai tujuannya. Kontak owner tidak disebut sebagai saluran pribadi atau nomor terpisah. Pesan yang disiapkan menyebut perangkat dan layanan jika konteks tersebut tersedia.

### Pemilik atau pengelola data

Pengelola memperbarui katalog melalui sumber harga yang disepakati. Setelah pembaruan, versi publik harus dapat menampilkan data terbaru dengan aturan pembaruan yang diketahui pengelola. Pengunjung hanya memperoleh data yang memang ditujukan untuk pelanggan.

### Struktur informasi

1. **Beranda:** identitas resmi, penjelasan singkat, akses langsung ke pencarian dan daftar merek.
2. **Katalog:** pencarian lintas merek, pilihan merek, dan daftar model.
3. **Rincian perangkat:** nama merek dan model, seluruh layanan yang relevan, kualitas, harga, estimasi, garansi, dan tindakan WhatsApp.
4. **Bantuan:** konfirmasi harga dan cara menghubungi toko atau owner.

Struktur ini dapat diwujudkan dalam satu halaman interaktif atau beberapa halaman. Pilihan tersebut ditentukan dalam rencana teknis dan harus mempertahankan perjalanan pengguna yang sama.

### Perilaku navigasi kembali yang disetujui

| Alur yang ditempuh | Hasil tombol Kembali bawaan HP atau browser |
| --- | --- |
| Menu merek → iPhone → iPhone 11 → daftar harga | Kembali ke daftar tipe iPhone yang sebelumnya dibuka. Jika detail satu layanan mempunyai layar tersendiri, kembali dahulu ke daftar layanan iPhone 11. |
| Menu merek → iPhone → daftar tipe | Kembali ke menu merek. |
| Pencarian → hasil → perangkat → harga | Kembali ke hasil pencarian dengan kata pencarian dan posisi gulir sebelumnya. |
| Menu merek sebagai layar pertama kunjungan | Browser boleh kembali ke halaman sebelum website dibuka, jika riwayat tersebut ada. |
| Tautan langsung ke detail dari WhatsApp atau halaman lain | Kembali mengikuti riwayat masuk sebenarnya. Website tidak membuat layar merek atau model buatan untuk menahan pelanggan. |

Aturan mengikuti layar yang benar-benar dilalui. Tombol atau gestur Kembali di HP dan Back browser harus konsisten. Browser Forward, bila tersedia, mengikuti riwayat yang sama. Mengetik setiap huruf pencarian tidak boleh membuat pelanggan harus menekan Kembali berulang kali untuk keluar dari satu layar.

Navigasi “Semua merek” tersedia pada detail, termasuk bila pelanggan masuk langsung dari luar website. Tombol Kembali tidak boleh dibatalkan berulang kali atau menjebak pelanggan. Bila tidak ada halaman sebelumnya, gunakan perilaku bawaan browser tanpa membuat riwayat palsu.

### Prioritas pada layar HP

Pencarian atau tombol yang membawa langsung ke pencarian harus terlihat pada layar awal. Identitas merek tetap hadir tanpa memaksa pelanggan melewati pembuka panjang. Tombol kembali, daftar, serta rincian harga harus dapat digunakan dengan satu tangan dan tanpa pergeseran halaman ke samping.

<!-- PAGE -->

## 3 Kebutuhan fungsional

P0 adalah kebutuhan wajib untuk rilis pertama. P1 adalah peningkatan yang dikerjakan setelah P0 terpenuhi atau bila diperlukan untuk desain yang disepakati.

| ID | Prioritas | Kebutuhan dan hasil yang diharapkan |
| --- | --- | --- |
| F01 | P0 | Daftar merek dibentuk dari katalog yang valid. Setiap merek mengarah ke model yang sesuai. |
| F02 | P0 | Pencarian mencakup seluruh merek dan model, mengabaikan kapitalisasi serta spasi di awal dan akhir. Ketikan tanpa spasi atau dengan spasi berbeda, seperti “vivoy91” atau “y 91”, tetap menemukan tipe yang sesuai. Nama lain yang umum diketik, seperti “galaxy a10” untuk Samsung A10, juga dikenali tanpa mengubah nama tampilan. Bila tidak ada nama tipe yang cocok, pencarian memakai nama layanan (“bypass”, “icloud”, “lcd y91”, “baterai”) dan menampilkan tipe yang punya layanan itu beserta harga dari data. Hasil mencantumkan identitas perangkat. |
| F03 | P0 | Pemilihan model menampilkan seluruh layanan dan varian kualitas yang tersedia untuk model tersebut. Harga dari model lain tidak boleh tercampur. |
| F04 | P0 | Setiap layanan menampilkan nama, kualitas bila ada, harga jual, estimasi bila tersedia, dan garansi sesuai sumber. |
| F05 | P0 | WhatsApp membawa tipe yang dicari atau merek dan model yang dipilih, serta layanan dan kualitas jika tersedia. Harga hanya disertakan bila tersedia untuk pilihan tersebut. Pelanggan meninjau dan mengirim sendiri pesan. |
| F06 | P0 | Tombol Kembali bawaan HP dan browser mengikuti alur yang ditempuh sesuai bagian 2. Pulihkan kata pencarian dan posisi gulir hasil sebelumnya. Sediakan “Semua merek”; jangan menjebak pelanggan dalam website. |
| F07 | P0 | Bedakan keadaan memuat, katalog kosong, tipe tidak ditemukan, layanan belum tercantum, dan data gagal dimuat. Kegagalan pemuatan wajib menyediakan “Coba lagi”; bantuan kontak tetap dapat tersedia. |
| F08 | P0 | Website mengambil data harga dari sumber yang ditetapkan pemilik. Pembaruan harga tidak memerlukan perubahan manual pada setiap komponen UI. |
| F09 | P0 | Bagian bantuan menjelaskan konfirmasi harga dan akses ke owner sesuai tujuan kontak yang telah diverifikasi. |
| F10 | P0 | Nama merek memiliki penulisan yang konsisten. Alias pencarian mempertahankan keterjangkauan data lama tanpa menghilangkan varian layanan. |
| F11 | P0 | Tautan langsung menuju perangkat dapat dibagikan dari detail harga melalui “Bagikan harga ini” (menu berbagi HP atau salin tautan), dengan pemulihan yang jelas bila data sudah berubah atau dihapus. |
| F12 | P1 | Filter jenis servis, seperti LCD atau baterai, dapat ditambahkan jika katalog dan uji pengguna menunjukkan kebutuhan. |
| F13 | P0 | Nama lengkap merek dan model jelas pada detail harga. Header kecil menjaga identitas perangkat tetap terlihat saat menggulir tanpa menutup konten atau tindakan. |
| F14 | P0 | “Ganti tipe HP” membuka pilihan model dalam merek yang sama. Pemilihan model lain memperbarui identitas, daftar layanan, harga, dan konteks WhatsApp. |
| F15 | P0 | Bila tipe tidak ditemukan setelah data berhasil dimuat, tampilkan kata pencarian, penjelasan harga belum tercantum, serta “Tanyakan lewat WhatsApp” dan “Cari tipe lain”. |
| F16 | P0 | Detail perangkat menyediakan “Layanan yang kamu cari belum ada? Tanyakan ke kami.” Pertanyaan membawa konteks perangkat walaupun layanan belum ada dalam katalog. |
| F17 | P0 | Untuk pertanyaan umum, sebelum WhatsApp tawarkan kebutuhan LCD atau layar, baterai, layanan lainnya, atau belum tahu dan ingin menjelaskan keluhan. Pelanggan dapat melewati pilihan dan langsung membuka WhatsApp. Jika layanan sudah dipilih pada detail harga, WhatsApp langsung memakai konteks layanan tersebut. |
| F18 | P0 | Tautan website yang dibagikan di WhatsApp atau media sosial menampilkan judul, deskripsi, dan gambar BERKAH CELL. Website memiliki ikon untuk layar utama HP. Tidak ada penyimpanan harga offline. |
| F19 | P0 | Informasi toko berupa alamat, jam buka, dan tautan Google Maps tampil di website serta tersedia sebagai data lokal untuk mesin pencari. Status “Buka sekarang” atau “Tutup” dihitung dari jam buka pemilik dalam WIB. Setelah pelanggan memilih layanan, bar tombol bawah menampilkan “Tanya via WhatsApp” dan “Lokasi” (Google Maps) berdampingan. Beranda memuat tiga langkah servis yang hanya berisi fakta: cek harga, tanya lewat WhatsApp, bawa HP ke toko dengan pemeriksaan gratis. Isinya hanya dari data yang diberikan pemilik; bagian ini tidak tampil sebelum datanya tersedia. |

### Pesan bantuan dan konteks WhatsApp

Contoh berikut memakai Samsung A55 untuk menjelaskan perilaku. Ini bukan pernyataan tentang keberadaan model tersebut dalam katalog saat ini. Teks dapat dirapikan saat desain, tetapi makna dan tindakan yang disetujui harus dipertahankan.

**Tipe tidak ditemukan:** “Harga untuk ‘Samsung A55’ belum tercantum. Daftar harga kami masih terus dilengkapi. Tanyakan ke BERKAH CELL untuk mengetahui pilihan layanan dan harganya.” Sediakan “Tanyakan lewat WhatsApp” dan “Cari tipe lain”.

**Pesan tanpa pilihan kebutuhan:** “Halo BERKAH CELL, saya mencari harga servis Samsung A55, tetapi belum menemukannya di website. Saya ingin menanyakan layanan dan harganya.”

**Pesan dengan pilihan kebutuhan:** “Halo BERKAH CELL, saya ingin menanyakan harga ganti LCD Samsung A55. Harganya belum tercantum di website.”

**Tipe tersedia, layanan belum tercantum:** pesan menyebut merek dan model yang dipilih serta kebutuhan jika diisi. Jangan menyatakan bahwa tipe tersebut tidak ditemukan.

**Pemuatan gagal:** “Daftar harga belum berhasil dimuat. Coba lagi atau hubungi BERKAH CELL.” Kegagalan pemuatan tidak boleh dinyatakan sebagai bukti bahwa model belum tercantum.

Saat pelanggan mengganti perangkat atau pencarian, pesan harus memakai konteks terbaru. Kata pencarian yang belum cocok dengan katalog diteruskan sebagai masukan pelanggan, tanpa diklaim sebagai identitas perangkat yang telah diverifikasi. Jangan membuat harga, kualitas, atau garansi untuk melengkapi pesan.

### Ketentuan pencarian dan data ganda

Pencarian angka pendek, seperti “11”, boleh menghasilkan beberapa merek. Hasil wajib menyebut merek dan model untuk menghindari salah pilih. Pencarian kosong mengembalikan tampilan katalog yang dapat dipahami.

Baris berbeda kualitas atau harga tidak boleh dihapus hanya karena nama layanan sama. Duplikasi identik perlu ditandai untuk perbaikan data. Sesuai keputusan pemilik 6 Oktober 2026, “Xiomi” ditampilkan sebagai “Xiaomi”, sedangkan Redmi dan Poco tetap menjadi pilihan merek tersendiri. Data sumber dipertahankan. Model atau layanan yang berpotensi ganda diperiksa dan dilaporkan; pilihan harga yang berbeda tidak boleh ditimpa secara otomatis. Perubahan label tidak boleh diam-diam mengubah makna data sumber.

<!-- PAGE -->

## 4 Sumber data dan aturan harga

Sumber data yang digunakan pada preview saat ini adalah Google Sheets dengan tab Price_List. PRD menetapkan Google Sheets sebagai alur kerja awal pengelolaan katalog. Detail cara publikasinya harus diperiksa sebelum produksi agar browser hanya menerima informasi yang memang boleh dipublikasikan.

### Katalog yang terus dilengkapi

Pemilik menjelaskan pada 5 Oktober 2026 bahwa data bertambah ketika ada servis HP terkait masuk. Belum tercantumnya perangkat, layanan, atau harga tidak otomatis berarti BERKAH CELL tidak menyediakan layanan tersebut. Website menjelaskan keterbatasan katalog dan menawarkan pertanyaan ke toko, tanpa menjanjikan ketersediaan yang belum dikonfirmasi.

Hasil pencarian kosong hanya dapat ditentukan setelah katalog berhasil dimuat. Respons gagal, tidak valid, atau belum selesai memakai keadaan pemuatan atau kegagalan yang sesuai. Data sah yang kosong memiliki pesan katalog belum tersedia dan bantuan kontak, bukan gangguan koneksi yang dibuat-buat.

### Data untuk pelanggan

| Kolom sumber | Makna | Perilaku yang diwajibkan |
| --- | --- | --- |
| Brand | Merek HP | Wajib untuk baris yang ditampilkan. Label dan alias mengikuti pemetaan yang disepakati. |
| Model | Tipe HP | Wajib. Pertahankan pembeda model seperti Pro, Plus, Max, dan generasi. |
| Layanan | Jenis servis | Wajib. Label harus dapat dipahami pelanggan. |
| Kualitas | Varian komponen atau jasa | Tampilkan sesuai sumber; kosong tidak boleh berubah menjadi klaim kualitas tertentu. “Jasa” berarti pekerjaan tenaga servis, misalnya pemasangan LCD, baterai, atau housing; nilai ini bukan harga, bukan tanda gratis, dan bukan tingkatan kualitas komponen. Pemetaan tampilannya ditentukan setelah posisi dan penggunaannya dalam ekspor data diperiksa; baris yang ambigu dilaporkan tanpa mengubah Sheet. |
| Harga_Jual | Harga untuk pelanggan | Format rupiah konsisten. Nilai kosong, tidak valid, atau belum ditetapkan meminta konfirmasi. |
| Estimasi_Waktu | Perkiraan durasi | Tampilkan sesuai sumber. Jangan menyatakan estimasi sebagai janji pasti. |
| Garansi | Keterangan garansi | Tampilkan sesuai data setiap layanan. Nilai “Tidak Ada” berarti layanan tersebut tanpa garansi. Data kosong tidak sama dengan “Tidak Ada”. Jangan mengarang syarat atau durasi garansi, dan jangan menerapkan contoh layanan tanpa garansi sebagai aturan otomatis untuk satu kategori. |

### Ketepatan informasi

- Dilarang membuat harga, durasi, garansi, diskon, stok, testimoni, atau janji layanan yang tidak didukung data toko.
- Harga contoh hanya boleh berada pada lingkungan demonstrasi yang diberi label jelas. Saat data produksi gagal, website harus menyatakan kegagalan tersebut.
- Nol tidak otomatis berarti gratis. Nilai nol, negatif, format campuran, dan teks harga perlu aturan validasi yang tegas; kasus yang belum disepakati meminta konfirmasi.
- Pemisah ribuan tidak boleh mengubah nilai harga. Perubahan format angka harus diuji dengan data nyata serta contoh rusak yang terisolasi.
- Harga berbeda menurut kualitas ditampilkan sebagai pilihan berbeda. Harga “mulai dari” hanya digunakan bila dihitung dari varian valid dan dijelaskan konteksnya.
- Harga servis yang tercantum sudah termasuk jasa pemasangan untuk layanan tersebut (keputusan pemilik 6 Oktober 2026). Harga layanan yang berupa jasa pasang tidak boleh disimpulkan sudah termasuk komponen yang dipasang.
- Pemeriksaan tidak dikenakan biaya. Upah yang diberikan pelanggan secara sukarela setelah pemeriksaan bukan biaya wajib.
- Kebijakan pajak dan kemungkinan biaya tambahan lain belum ditetapkan dan tidak boleh dimasukkan ke halaman publik sebelum dikonfirmasi pemilik.

### Kerahasiaan data internal

Harga_Modal, margin, data pelanggan, dan catatan internal tidak boleh ikut dikirim dalam respons data publik, HTML, atau JavaScript. Menghilangkan kolom dari tampilan belum membatasi akses jika kolom tersebut tetap berada dalam respons jaringan.

Rencana teknis dapat memakai sumber publik terpisah yang hanya berisi kolom pelanggan atau layanan penyaring dengan daftar kolom yang diizinkan. Pilih setelah memeriksa sumber sebenarnya. PRD ini tidak menyatakan bahwa endpoint yang sekarang sudah memenuhi ketentuan tersebut.

<!-- PAGE -->

## 5 Panduan desain untuk pengembangan UI

### Identitas dan karakter

Gunakan logo resmi BERKAH CELL dari aset yang diberikan atau yang sudah diverifikasi. Pertahankan bentuk, proporsi, dan detailnya. Identitas warna bertumpu pada biru atau navy; emas digunakan sebagai aksen terbatas. Warna pendukung dan nilai warna tepat ditetapkan ketika desain final dipilih.

Kesan mewah diwujudkan melalui komposisi, tipografi, ruang kosong, keselarasan, serta kualitas detail. Hierarki harga tetap lebih penting daripada hiasan. Perubahan UI harus terlihat pada struktur dan cara informasi disajikan.

### Susunan yang perlu dirancang

- Header ringkas dengan logo dan akses bantuan yang mudah ditemukan.
- Pembuka singkat yang menjelaskan fungsi website dan membawa pelanggan ke pencarian.
- Katalog dengan pilihan merek yang jelas dan daftar model yang mudah dipindai.
- Detail harga dengan identitas merek dan model yang tetap terlihat, hierarki layanan, kualitas, harga, estimasi, garansi, dan tombol kontak.
- Navigasi “Semua merek” serta “Ganti tipe HP” yang mudah ditemukan; bantuan tipe atau layanan yang belum tercantum memiliki tindakan yang jelas.
- Pilihan kebutuhan sebelum WhatsApp dibuat singkat, opsional, dan menyediakan akses langsung ke WhatsApp.
- Bantuan serta ketentuan harga diletakkan pada bagian yang mudah dijangkau tanpa menutup daftar.

### Kriteria visual yang dapat diperiksa

1. Pada layar HP, pelanggan segera menemukan cara mencari harga. Desain pembuka tidak boleh menghalangi tugas tersebut.
2. Harga terlihat jelas dan dekat dengan layanan serta varian yang dimaksud. Informasi pendukung menggunakan penekanan yang lebih rendah.
3. Ukuran font, jarak, bentuk tombol, sudut komponen, dan gaya ikon mengikuti satu sistem yang konsisten.
4. Teks penting tidak terpotong pada nama model panjang atau harga dengan banyak digit.
5. Logo tetap jelas pada ukuran kecil. Maskot, jika digunakan, menjadi aksen yang tidak menutup pencarian, harga, atau tombol.
6. Efek cahaya, bayangan, gradien, dan animasi digunakan secukupnya. Gerakan harus dapat berkurang sesuai preferensi pengguna.
7. Tampilan desktop memanfaatkan ruang dengan susunan yang disengaja. Tampilan HP disusun ulang sesuai keterbatasan ruangnya.

### Arah desain yang disetujui (6 Oktober 2026)

1. **Katalog Bertingkat:** Beranda, Merek, Tipe, dan Detail harga sebagai layar yang berurutan, dengan pencarian besar di halaman awal.
2. **Warna:** header navy; area katalog dan harga terang; aksen emas secukupnya.
3. **Tindakan kontak:** tombol utama “Tanya servis via WhatsApp”; “Komplen ke Owner” menjadi bantuan terpisah.
4. **Maskot:** aksen kecil yang tidak menutupi konten atau tombol.
5. **Pilihan kebutuhan F17:** ditawarkan untuk pertanyaan umum dan tetap dapat dilewati; jika layanan sudah dipilih, WhatsApp langsung memakai konteks layanan tersebut.

Persetujuan ini menetapkan arah, bukan tampilan final. Mockup HP, font, nilai warna, bentuk komponen, dan penempatan detail masih menunggu review pemilik (D01). Mockup untuk review disimpan di `design/mockup-v1/`.

### Bukti persetujuan visual

Simpan screenshot beranda, katalog, dan detail layanan pada HP serta desktop. Catat versi file, tanggal, bagian yang disetujui, dan revisi yang diminta. Kalimat “elegan dan mewah” perlu ditemani contoh yang benar-benar telah dipilih pemilik.

<!-- PAGE -->

## 6 Kualitas penggunaan dan perilaku sistem

Ketentuan pada bagian ini adalah target teknis yang diusulkan untuk rilis pertama. Hasil pengujian aktual perlu dicatat sebelum target dinyatakan terpenuhi.

### Responsif dan keterbacaan

Uji lebar layar 360, 390, 768, dan 1440 piksel. Halaman tidak boleh bergeser horizontal secara tidak sengaja. Daftar merek yang sengaja dapat digeser perlu petunjuk yang jelas. Tombol utama ditargetkan memiliki area sentuh setidaknya 44 × 44 piksel.

Gunakan teks utama sekitar 16 piksel pada HP sebagai titik awal, lalu uji kenyamanannya. Teks harga dan ketentuan penting harus tetap mudah dibaca. Targetkan rasio kontras minimal 4,5 banding 1 untuk teks biasa dan 3 banding 1 untuk teks besar. Ini adalah kriteria penerimaan proyek, bukan klaim bahwa preview sudah lolos audit aksesibilitas.

### Akses dan navigasi

Kolom pencarian memiliki label yang dapat dibaca alat bantu. Semua tombol dan tautan utama dapat digunakan dengan keyboard serta memiliki tanda fokus yang terlihat. Perubahan hasil perlu memberi konteks yang jelas tanpa memindahkan fokus secara membingungkan. Tombol Kembali bawaan HP dan browser wajib memenuhi F06 serta alur pada bagian 2. Arsitektur teknis harus mendukung perilaku tersebut. Header identitas perangkat tidak boleh menutup elemen yang mendapat fokus, rincian harga, atau tombol kontak.

### Kecepatan dan ketahanan

Setelah katalog termuat, pencarian ditargetkan memperbarui hasil dalam 300 milidetik pada perangkat uji yang dicatat. UI awal harus tetap terbaca saat menunggu harga. Waktu tunggu pengambilan data ditargetkan maksimal 15 detik, kemudian tampilkan pesan kegagalan dan tindakan pemulihan.

Kebijakan cache dan pembaruan harga harus didokumentasikan. Bila cache dipakai, tunjukkan status atau waktu yang benar-benar tersedia dari sistem. Jangan mengklaim “baru diperbarui” tanpa bukti. Uji ulang setelah perubahan harga sumber yang diizinkan atau melalui data uji terisolasi.

### Keamanan dasar

Perlakukan isi Sheet sebagai data, bukan HTML atau perintah. Escape teks sebelum dirender. Batasi tujuan tautan kontak ke alamat yang ditetapkan. Jangan menaruh token, kredensial, atau data internal dalam kode browser. Rilis publik harus menggunakan HTTPS.

### Isi dan komunikasi

Gunakan Bahasa Indonesia yang lugas. Istilah layanan dan kualitas harus konsisten serta mengikuti arti yang ditetapkan toko. Kontak WhatsApp hanya menyiapkan percakapan; pengiriman pesan dilakukan pelanggan. Aktivitas uji tidak mengirim pesan ke toko atau pelanggan secara otomatis.

<!-- PAGE -->

## 7 Kriteria penerimaan rilis

Tabel ini menjadi daftar pemeriksaan untuk developer dan AI. Status setiap pemeriksaan dimulai dari belum diuji, lalu diisi lulus atau gagal disertai bukti. Hasil uji preview tidak otomatis berlaku pada versi publik.

| ID | Pemeriksaan | Bukti kelulusan |
| --- | --- | --- |
| A01 | Merek dan model | Sampel lintas merek menampilkan model yang benar; jumlah berasal dari data valid. |
| A02 | Pencarian | Nama lengkap, kapitalisasi berbeda, spasi tambahan, ketikan tanpa spasi (“vivoy91”), nama layanan (“bypass”), dan angka pendek menghasilkan perangkat yang sesuai. |
| A03 | Pilihan layanan | Semua varian kualitas yang sah tetap muncul; tidak ada harga dari perangkat lain. |
| A04 | Ketepatan data | Bandingkan nilai asli dan tampilan untuk harga, kualitas, estimasi, dan garansi pada sampel yang dicatat. |
| A05 | Data bermasalah | Harga kosong atau tidak valid tidak berubah menjadi harga resmi atau layanan gratis. |
| A06 | Data gagal dimuat | Uji koneksi gagal dan respons rusak menghasilkan pesan jujur serta tindakan pemulihan. Tidak muncul harga contoh. |
| A07 | Kontak | Periksa tujuan tautan dan isi pesan untuk layanan terdaftar serta pertanyaan di luar katalog. Sertakan hanya data yang tersedia. Tidak perlu mengirim pesan saat pengujian. |
| A08 | Layar HP dan desktop | Screenshot pada lebar 360, 390, 768, dan 1440 piksel menunjukkan konten terbaca serta tidak tertutup elemen mengambang. |
| A09 | Keyboard dan keterbacaan | Alur utama dapat dijalankan dengan keyboard; label, fokus, ukuran sentuh, dan kontras memenuhi target. |
| A10 | Data internal | Periksa respons jaringan serta aset publik. Harga_Modal, margin, catatan internal, dan kredensial tidak terkirim. |
| A11 | Desain | Pemilik meninjau beranda, katalog, detail, dan keadaan gagal. Versi visual yang disetujui tercatat. |
| A12 | Rilis dan pemulihan | Versi sebelumnya dapat dipulihkan; URL publik, pemuatan harga, navigasi, dan kontak diperiksa setelah publikasi. |
| A13 | Kembali dari penelusuran merek | Dari harga iPhone 11, Kembali menuju layar katalog sebelumnya, lalu daftar merek sesuai urutan yang ditempuh. Uji tombol atau gestur HP dan Back browser; website tidak keluar terlalu awal. |
| A14 | Pemulihan pencarian | Cari tipe, gulir hasil, buka detail, lalu Kembali. Kata pencarian, hasil, dan posisi gulir pulih sehingga pelanggan melanjutkan dari tempat sebelumnya. |
| A15 | Masuk langsung dan keluar | Uji tautan detail dari halaman lain atau WhatsApp bila tersedia. Kembali mengikuti riwayat asli; “Semua merek” tetap berfungsi. Tidak ada penahanan pengguna, riwayat palsu, atau tumpukan riwayat per huruf pencarian. |
| A16 | Identitas saat menggulir | Nama model panjang terbaca pada detail dan header kecil di HP. Nama tetap benar; header tidak menutup harga, tombol, atau fokus keyboard. |
| A17 | Ganti tipe | Dari iPhone 11, gunakan “Ganti tipe HP”, lalu pilih model lain. Identitas, layanan, harga, dan pesan WhatsApp semuanya sesuai model baru. |
| A18 | Tipe tidak ditemukan | Setelah katalog termuat, gunakan pencarian yang tidak cocok. Pesan menyebut pencarian dan harga belum tercantum; kedua tindakan berfungsi. “Cari tipe lain” membuka akses pencarian yang dapat diedit atau dihapus. |
| A19 | Layanan belum tercantum | Pada model yang tersedia, akses bantuan layanan tetap ada tanpa memerlukan filter P1. Pesan membawa model benar tanpa menyatakan perangkat tidak ditemukan atau menebak harga. |
| A20 | Pilihan kebutuhan opsional | Uji keempat pilihan, pilihan lainnya atau keluhan tanpa teks tambahan, dan langsung ke WhatsApp tanpa memilih. Tidak ada isian wajib yang menghalangi; pesan membawa konteks yang tersedia dan tidak mengirim otomatis. Setelah memilih satu layanan dan kualitas pada detail, WhatsApp langsung membawa layanan tersebut tanpa menampilkan pilihan kebutuhan. |
| A21 | Keadaan katalog dan pemulihan | Bedakan katalog sah yang kosong, hasil kosong, dan kegagalan jaringan atau data. “Coba lagi” memuat ulang data; pemulihan menampilkan katalog aktual tanpa harga contoh. |
| A22 | Bagikan harga | Dari detail iPhone 11, “Bagikan harga ini” membuka menu berbagi HP atau menyalin tautan. Tautan membuka detail perangkat yang sama di tab baru, dan Kembali mengikuti A15. Tautan ke tipe yang sudah tidak ada menampilkan pesan belum tercantum. |
| A23 | Tampilan tautan | Halaman memuat judul, deskripsi, dan gambar untuk pratinjau tautan; gambar dapat dimuat dari alamat publik. Ikon layar utama tersedia. Tidak ada permintaan jaringan baru selain sumber data. |
| A24 | Informasi toko | Alamat, jam buka, dan tautan Maps sama persis dengan data dari pemilik dan tampil di beranda, bantuan, dan footer. Status buka/tutup benar sebelum, selama, dan sesudah jam buka WIB, termasuk saat HP memakai zona waktu lain. Setelah memilih layanan, tombol WhatsApp dan Lokasi tampil sebaris tanpa terpotong pada lebar 360 piksel. Data lokal untuk mesin pencari memuat nilai yang sama. Tanpa data, bagian ini tidak tampil. |

### Pemetaan kebutuhan tambahan ke pengujian

F06 diperiksa melalui A13 sampai A15. F13 diperiksa melalui A16 dan A08 sampai A09. F14 diperiksa melalui A17. F15 dan F16 diperiksa melalui A18 sampai A19. F17 serta perluasan F05 diperiksa melalui A20 dan A07. Perluasan F07 diperiksa melalui A06 dan A21. F11 diperiksa melalui A22 dan A15. F18 diperiksa melalui A23. F19 diperiksa melalui A24.

Pada preview HP, sertakan nama model panjang, hasil pencarian kosong, pergantian perangkat, dan isi pesan WhatsApp. Catat versi preview, perangkat atau browser, hasil, dan bukti. Jika gestur Kembali atau perpindahan ke aplikasi WhatsApp belum dapat diuji, catat sebagai belum diuji, bukan lulus.

### Keputusan rilis

Seluruh kebutuhan P0 harus memiliki bukti uji yang sesuai. Kegagalan yang memengaruhi ketepatan harga, akses ke data internal, atau kemampuan pelanggan menggunakan alur utama harus diselesaikan sebelum rilis.

Persetujuan tampilan tidak sama dengan persetujuan mengganti website publik. Catat persetujuan publikasi atas versi yang spesifik, kemudian simpan hasil pemeriksaan setelah rilis.

<!-- PAGE -->

## 8 Kondisi proyek dan acuan yang tersedia

### Website dan data

Website yang dibahas dalam proyek ini semula berada di https://berkahcellbatam.pages.dev/. Sejak 6 Oktober 2026 website dipublikasikan melalui Cloudflare Workers di https://website-berkah-cell.ahmedwassalwan.workers.dev/ dan dibangun otomatis dari branch main repository website-berkah-cell; alamat lama disiapkan sebagai pengalih. Pemeriksaan pada sesi 4 Oktober 2026 menemukan katalog merek, pencarian model, rincian harga, dan tautan WhatsApp.

Sumber data publik website adalah file Google Sheets terpisah yang hanya berisi kolom pelanggan dan disalin dari file utama melalui IMPORTRANGE; file utama berakses terbatas. Nomor WhatsApp toko adalah 089625050525 (format tautan 6289625050525) dan dipakai untuk pertanyaan servis maupun bantuan atau komplain kepada owner.

### Aset dan preview

| Acuan | Status dan kegunaan |
| --- | --- |
| berkah-cell-redesign-preview.html | Draf lokal untuk mengevaluasi komposisi baru. Belum dinyatakan sebagai UI final yang disetujui. |
| assets/img_logo.png | Logo yang diekstrak dari situs dalam sesi sebelumnya. Gunakan aset resmi ini atau pengganti resmi dari pemilik. |
| assets/img_wave.png dan aset maskot lain | Aset dari situs sebelumnya; penggunaannya dalam desain baru masih pilihan desain. |
| Google Sheets Price_List | Sumber katalog yang dipakai preview. Struktur data publik dan aturan validasinya perlu diperiksa untuk rilis. |

Pada sesi sebelumnya, preview berhasil memuat data dan alur pilih iPhone 11 menampilkan tujuh pilihan servis. Pencarian dan tampilan lebar 390 piksel juga telah diperiksa secara terbatas. Catatan tersebut adalah bukti awal, bukan pengujian lengkap terhadap seluruh kriteria pada PRD ini.

### Pekerjaan yang masih perlu diselesaikan

- Memilih desain final berdasarkan review pemilik serta menyimpan screenshot acuan.
- Memastikan lokasi kode produksi, repository bila ada, cara build, cara deploy, dan akses yang diperlukan.
- Memastikan sumber publik tidak mengirim kolom internal walaupun kolom itu disembunyikan oleh UI.
- Menyepakati pemetaan merek dan model, terutama label salah ketik serta hubungan Redmi dan Xiaomi.
- Mengimplementasikan kebutuhan navigasi dan bantuan katalog yang disetujui pada versi 0.2 dalam preview, lalu menjalankan A13 sampai A21.
- Memeriksa seluruh keadaan gagal, data rusak, pembaruan harga, keyboard, dan ukuran layar sasaran.
- Menentukan ketentuan harga, garansi, dan kontak yang akan ditampilkan kepada pelanggan.

### Posisi dokumen ini

PRD v0.2 mencatat kebutuhan tambahan yang disetujui pemilik dan kriteria pengujiannya. Pembaruan dokumen belum menjadi bukti implementasi atau kelulusan fitur. Uji preview pada sesi sebelumnya tetap merupakan catatan historis; pengembangan baru harus diuji pada versi kode yang menerapkannya.

Desain final, kebijakan garansi, kontak, dan keputusan lain yang masih terbuka tetap memiliki status masing-masing pada bagian 9. Perubahan kebutuhan yang telah disetujui perlu dicatat bersama alasan dan keputusan pemilik.

<!-- PAGE -->

## 9 Keputusan pemilik dan riwayat perubahan

### Pengembangan yang telah disetujui

Pada 5 Oktober 2026, pemilik menyetujui seluruh tujuh ide dan aturan pendukung yang dirangkum dalam percakapan, serta meminta semuanya dimasukkan ke PRD untuk disimpan ke GitHub. Persetujuan mencakup:

1. Tombol Kembali bawaan HP dan browser mengikuti alur sebelumnya, termasuk pemulihan pencarian dan posisi gulir.
2. Identitas merek dan model tetap jelas saat membaca serta menggulir halaman harga.
3. Tombol “Ganti tipe HP” serta navigasi “Semua merek”.
4. Bantuan dan tindakan ketika tipe HP belum tercantum.
5. Bantuan ketika layanan belum tercantum pada tipe yang tersedia.
6. Pilihan kebutuhan sebelum WhatsApp yang opsional dan dapat dilewati.
7. Pesan WhatsApp membawa konteks terbaru; pelanggan tetap meninjau dan mengirim sendiri.

Aturan pendukung yang disetujui meliputi sifat katalog yang bertambah saat ada servis masuk, pembedaan hasil kosong dan kegagalan pemuatan, tombol “Coba lagi”, larangan menebak harga, perilaku Kembali yang tidak menjebak pengguna, serta pemeriksaan semua alur melalui preview HP. Kebutuhan tersebut masuk prioritas P0. Persetujuan ini tidak memilih desain visual final atau menandai fitur sebagai sudah diimplementasikan.

### Arah desain yang disetujui pada 6 Oktober 2026

Setelah membandingkan dua arah desain, pemilik menyetujui arah Katalog Bertingkat beserta keputusan warna, tindakan kontak, maskot, dan aturan pilihan kebutuhan F17 seperti tercatat pada bagian 5. Persetujuan ini tidak memilih mockup final dan tidak mengubah prioritas P0/P1; F11 tetap P1. Pengelompokan merek, arti nilai “Tidak Ada” dan “Jasa”, nomor tujuan kontak, serta ketentuan harga dan garansi tetap terbuka.

### Keputusan pemilik pada 6 Oktober 2026 (lanjutan)

Pemilik menyetujui mockup revisi sebagai acuan implementasi preview dan menetapkan:

1. **Harga:** harga servis yang tercantum sudah termasuk jasa pemasangan untuk layanan tersebut. Jangan menyimpulkan bahwa harga layanan jasa pasang sudah termasuk komponen. Pemeriksaan tidak dikenakan biaya; upah sukarela setelah pemeriksaan bukan biaya wajib.
2. **Garansi:** mengikuti data setiap layanan. “Tidak Ada” dipakai untuk layanan tanpa garansi, misalnya bypass, buka kunci, dan antigores; contoh ini bukan aturan untuk mengubah garansi satu kategori secara otomatis. Kolom kosong tidak sama dengan “Tidak Ada”. Syarat dan durasi garansi tidak boleh dikarang.
3. **“Jasa”:** pekerjaan tenaga servis, misalnya pemasangan LCD, baterai, atau housing; pencatatan internal juga dapat mencakup upah sukarela setelah pemeriksaan. Bukan harga, bukan tanda gratis, dan bukan tingkatan kualitas komponen. Pemetaan di UI ditentukan setelah pemeriksaan ekspor data; baris ambigu dilaporkan tanpa mengubah Sheet.
4. **Kontak:** satu nomor WhatsApp, ditampilkan 089625050525 dan ditautkan sebagai 6289625050525, untuk pertanyaan servis maupun bantuan atau komplain kepada owner dengan isi pesan sesuai tujuan.
5. **Merek:** “Xiomi” ditampilkan sebagai “Xiaomi”; Redmi dan Poco tetap merek tersendiri. Data sumber dipertahankan; model dan layanan yang berpotensi ganda diperiksa tanpa menimpa pilihan harga berbeda secara otomatis.

### Keputusan pemilik pada 6 Oktober 2026 (paket profesional)

Setelah meninjau preview v3 di HP dan melaporkan semua fitur berjalan baik, pemilik memilih paket peningkatan berikut:

1. **Paket 1, dikerjakan:** tombol “Bagikan harga ini” pada detail harga (F11 naik dari P1 ke P0), tampilan tautan saat dibagikan, dan ikon layar utama HP (F18).
2. **Paket 2:** informasi toko dan data lokal untuk mesin pencari (F19). Data dari pemilik, 6 Oktober 2026: alamat “Avava Jodoh, Lantai Dasar, Batam”; buka setiap hari pukul 11.00–20.00 WIB; tautan Google Maps https://maps.app.goo.gl/9f942hFJcCKjUKnj9 (diganti pemilik pada 7 Oktober 2026; sebelumnya share.google). Data ini tidak boleh diubah tanpa konfirmasi pemilik. Rating dan ulasan tidak ditampilkan sampai pemilik memberikan datanya.
3. **Ditunda:** domain sendiri dinilai sangat dibutuhkan, tetapi belum sekarang (D08). Pengukuran pengunjung dan Meta Pixel belum dipilih (D09).

### Keputusan yang masih terbuka

Keputusan berikut tidak menghalangi penyimpanan PRD. Isilah sebelum bagian yang terkait diterapkan atau dipublikasikan. Hindari mengubah pertanyaan yang belum terjawab menjadi asumsi pasti.

| ID | Keputusan | Status awal |
| --- | --- | --- |
| D01 | Desain final website, font, nilai warna, dan bentuk komponen | Mockup revisi disetujui 6 Okt 2026 sebagai acuan implementasi preview. 7 Okt 2026: pemilik meminta polesan premium sebelum rilis domain; arah Katalog Bertingkat, warna navy-emas, dan alur tetap. Font Plus Jakarta Sans disimpan di situs sendiri. Pemilik menilai tampilan sudah elegan dan mewah. 8 Okt 2026: atas permintaan pemilik, latar diberi motif emboss jalur PCB (cetak timbul, tanpa warna baru). Motif menunggu review pemilik di preview |
| D02 | Biaya jasa, pemeriksaan, pajak, dan biaya tambahan | Sebagian diputuskan 6 Okt 2026: harga termasuk jasa pemasangan, pemeriksaan tidak dikenakan biaya. Pajak dan biaya tambahan lain masih terbuka |
| D03 | Garansi serta arti nilai “Tidak Ada” dan “Jasa” | Sebagian diputuskan 6 Okt 2026: garansi mengikuti data, “Tidak Ada” berarti tanpa garansi, arti “Jasa” ditetapkan. Syarat garansi lengkap dan pemakaian “Jasa” atau “Tidak Ada” yang tidak konsisten pada kolom Kualitas masih perlu konfirmasi |
| D04 | Nomor toko dan owner | Diputuskan 6 Okt 2026: satu nomor 089625050525 untuk servis dan komplain |
| D05 | Pemetaan merek dan model serta penanganan salah ketik | Merek diputuskan 6 Okt 2026 (Xiomi → Xiaomi; Redmi dan Poco terpisah). Model yang berpotensi ganda, termasuk lintas Xiaomi, Redmi, dan Poco, menunggu pemeriksaan pemilik |
| D06 | Siapa pengelola Sheet, sumber publik yang aman, dan aturan pembaruan harga | Alur kerja perlu didokumentasikan |
| D07 | Lokasi kode produksi, cara deploy, cadangan, dan prosedur pemulihan | Belum terdokumentasi di paket ini |
| D08 | Domain sendiri untuk website | Diputuskan 7 Okt 2026: berkahcellbatam.com (Hostinger, 3 tahun sampai 7 Okt 2029, perpanjangan otomatis), nameserver di Cloudflare. Dipercepat karena workers.dev diblokir sebagian ISP di Indonesia. www dialihkan ke domain utama; workers.dev tetap sebagai cadangan |
| D09 | Pengukuran pengunjung dan Meta Pixel | Ditunda 6 Okt 2026. Bila dipilih, perlu ID, perubahan kebijakan keamanan halaman, dan keterangan privasi |
| D10 | Keahlian andalan | Diputuskan 8 Okt 2026: Bypass iCloud iPhone (layar Hello), tampil sebagai badge di beranda yang membuka harga layanan Bypass. Judul utama tetap umum. Syarat bukti kepemilikan belum ada, sehingga website tidak menulis syarat apa pun |

### Urutan pengerjaan berikutnya

1. Gunakan tujuh pengembangan yang disetujui sebagai acuan, lalu selesaikan keputusan operasional yang masih terbuka sesuai bagian yang akan dikerjakan.
2. Matangkan wireframe, yaitu susunan halaman, dan pilih contoh UI untuk HP serta desktop.
3. Simpan panduan desain final dan catatan persetujuan pemilik.
4. Buat rencana teknis berdasarkan kode serta sumber data sebenarnya.
5. Implementasikan kebutuhan P0 dalam preview yang dapat ditinjau.
6. Jalankan kriteria penerimaan, perbaiki kegagalan, dan lampirkan bukti.
7. Publikasikan versi yang disetujui, periksa hasilnya, lalu perbarui catatan proyek.

### Riwayat dan perubahan versi

- **Versi 0.1, 5 Oktober 2026:** susunan awal kebutuhan, panduan visual awal, 12 kriteria uji, dan keputusan terbuka.
- **Versi 0.2, 5 Oktober 2026:** memasukkan tujuh ide dan semua aturan pendukung yang disetujui pemilik. Memperjelas F05 sampai F07; menambah F13 sampai F17; memperbarui A07 dan menambah A13 sampai A21. Menyesuaikan perjalanan pelanggan, panduan UI, konteks katalog, status persetujuan, serta petunjuk GitHub. Total 17 kebutuhan fungsional dan 21 kriteria penerimaan. F11 dan F12 tetap P1.
- **Versi 0.3, 6 Oktober 2026:** mencatat arah desain Katalog Bertingkat yang disetujui pemilik beserta keputusan warna, tindakan kontak utama, maskot, dan aturan pemicu F17. Memperjelas F17 dan A20; memperbarui bagian 2, 5, dan 9 serta status D01 dan cakupan D03. Mockup final masih menunggu review. Prioritas P0/P1 tidak berubah.
- **Versi 0.4, 6 Oktober 2026:** mencatat persetujuan mockup revisi sebagai acuan implementasi preview serta lima keputusan pemilik: harga termasuk jasa pemasangan dan pemeriksaan tanpa biaya, aturan garansi “Tidak Ada” dan kolom kosong, arti “Jasa”, satu nomor WhatsApp untuk servis dan komplain, serta normalisasi merek Xiomi → Xiaomi dengan Redmi dan Poco terpisah. Memperbarui bagian 2, 3, 4, 8, dan 9 serta status D01 sampai D05. Pajak, biaya tambahan lain, syarat garansi lengkap, dan model yang berpotensi ganda tetap terbuka. Prioritas P0/P1 tidak berubah.
- **Versi 0.5, 6–7 Oktober 2026:** mencatat review pemilik atas preview v3 dan paket peningkatan profesional. F11 naik dari P1 ke P0 dengan tombol “Bagikan harga ini”; menambah F18 (tampilan tautan dan ikon) dan F19 (informasi toko) serta A22 sampai A24; menambah D08 (domain) dan D09 (pengukuran), keduanya ditunda. Data toko untuk F19 diterima pada hari yang sama. Pada 7 Oktober 2026 D08 diputuskan: domain berkahcellbatam.com, setelah workers.dev diketahui diblokir sebagian ISP.
- **Versi 0.6, 8 Oktober 2026:** atas permintaan pemilik, F02 dan A02 mencakup ketikan tanpa spasi atau dengan spasi berbeda (“vivoy91”, “y 91”), karena banyak pelanggan mengetik tipe HP tanpa spasi; alias pencarian “galaxy” untuk Samsung (F10) ditambahkan atas persetujuan pemilik. D01 mencatat motif emboss jalur PCB di latar. Pada polesan terakhir, F19 dan A24 ditambah status buka/tutup dari jam pemilik (WIB) serta tiga langkah servis di beranda; nomor WhatsApp ditulis 0896-2505-0525. D10 mencatat keahlian andalan Bypass iCloud iPhone, dan F02 mencakup pencarian nama layanan. Atas permintaan pemilik, tipe iPhone diurutkan menurut generasi: X, XR, XS, dan XS Max berada di antara 8 Plus dan 11. Prioritas P0/P1 tidak berubah.
- **Versi 0.7, 9 Oktober 2026:** atas permintaan pemilik, F19 dan A24 menambah tombol “Lokasi” di samping “Tanya via WhatsApp” setelah layanan dipilih, supaya pelanggan bisa langsung chat atau datang ke toko. Website menjadi Versi 3.4. Prioritas P0/P1 tidak berubah.

Persetujuan seluruh baseline dapat menghasilkan versi 1.0. Koreksi atau perluasan terbatas menaikkan versi minor; perubahan besar pada cakupan atau aturan bisnis memerlukan versi mayor dan penjelasan dampak.

Setiap catatan perubahan menyebut tanggal, versi, kebutuhan yang berubah, alasan, status persetujuan, dan dokumen atau kode yang terdampak. Pergantian model AI saja tidak mengharuskan perubahan PRD bila kebutuhan produknya tetap sama.

<!-- PAGE -->

## 10 Paket untuk GitHub Drive dan model AI berikutnya

Simpan PRD bersama bukti desain dan kode agar pekerjaan dapat dilanjutkan tanpa bergantung pada riwayat percakapan. Markdown mudah dibaca AI, sedangkan versi dokumen yang dapat diedit memudahkan pemilik meninjau isinya.

### Penempatan di GitHub

Simpan berkas ini sebagai docs/PRD.md di repository website. Jika repository belum memakai folder dokumentasi, PRD.md pada root juga dapat dipilih. Tentukan satu lokasi sebagai acuan utama dan tautkan dari README proyek. Markdown adalah sumber yang diedit; HTML merupakan salinan baca yang diperbarui dari sumber yang sama.

Gunakan riwayat commit untuk melacak perubahan. Contoh pesan commit: docs: approve navigation and catalog assistance requirements v0.2. Versi sebelumnya dapat disimpan sebagai arsip; developer dan AI memakai versi 0.7 sebagai acuan terbaru. Penyimpanan di GitHub tidak menandai website sebagai sudah dipublikasikan atau fitur sebagai sudah diuji.

### Susunan folder yang disarankan

- **01 PRD:** versi yang sedang berlaku, versi sebelumnya, dan riwayat perubahan.
- **02 Desain:** panduan desain final, logo resmi, aset maskot, dan screenshot yang disetujui.
- **03 Kode:** tautan repository atau arsip kode dengan nama versi yang jelas.
- **04 Data:** daftar kolom publik, aturan validasi, serta data uji terisolasi tanpa informasi internal.
- **05 Status dan pengujian:** catatan hasil, masalah tersisa, cara menjalankan proyek, dan langkah rilis.

Nama “versi terbaru” perlu ditemani nomor versi dan tanggal. Simpan versi sebelumnya agar perubahan dapat dibandingkan. Jangan memasukkan kata sandi atau token ke paket yang akan dibagikan kepada AI.

### Isi minimum catatan serah terima

Catat versi PRD, versi desain yang disetujui, versi kode, cara menjalankan preview, sumber data publik, hasil pengujian, keputusan terbuka, dan pekerjaan berikutnya. Bedakan hasil yang sudah diuji dari target yang baru diusulkan. Sertakan tanggal pemeriksaan ketika menyebut kondisi website.

### Teks pembuka saat melanjutkan dengan AI

> Saya ingin melanjutkan website daftar harga servis BERKAH CELL. Gunakan PRD terlampir sebagai acuan kebutuhan, lalu baca panduan desain yang disetujui, kode terbaru, dan catatan status proyek. Jelaskan kondisi yang benar-benar ditemukan serta usulan peningkatan yang berkaitan dengan tujuan saya. Jika dokumen saling bertentangan, sebutkan pertentangannya sebelum mengubah bagian terkait. Pertahankan logo resmi dan ketepatan data toko. Siapkan perubahan pada preview yang dapat saya tinjau, jalankan kriteria penerimaan yang relevan, lalu laporkan hasil beserta keterbatasannya. Publikasi website dan perubahan sumber harga memerlukan instruksi saya untuk tindakan tersebut.

Tambahkan tujuan khusus pada akhir teks itu, misalnya “perbaiki keterbacaan kartu harga di HP” atau “buat dua alternatif susunan halaman utama”. Catat model yang dipakai untuk pelacakan pekerjaan, lalu bandingkan hasil berdasarkan kebutuhan, bukti visual, dan pengujian yang sama.

### Cara menjaga dokumen tetap berguna

Perbarui PRD ketika kebutuhan atau aturan bisnis berubah. Perbarui panduan desain ketika pemilik memilih tampilan baru. Perbarui catatan status setelah pekerjaan dan pengujian selesai. Dengan begitu, model berikutnya menerima kondisi proyek yang benar dan dapat melanjutkan dari bagian yang tepat.
