# website-berkah-cell

Website daftar harga servis HP BERKAH CELL.

- `site-live/` — kode website (`index.html`, `styles.css`, `app.js`, `assets/`).
- `PRD.md` — dokumen kebutuhan produk.
- `wrangler.jsonc` — konfigurasi deploy Cloudflare Workers.
- `docs/RENCANA-TEKNIS.md` — rencana teknis preview v3 (navigasi, data, keamanan).
- `docs/HASIL-UJI-PREVIEW.md` — hasil uji A01–A21 dan temuan data.
- `design/mockup-v1/` — mockup yang disetujui sebagai acuan.
- `tools/cek_data.py` — audit ekspor Price_List (hanya membaca).
- `tests/` — uji penerimaan (`node tests/e2e.js`, butuh Playwright).

## Deploy

Repo ini tersambung ke Cloudflare Workers (`website-berkah-cell`). Setiap push ke
branch `main` otomatis dibangun dan dipublikasikan. Hanya isi folder `site-live/`
yang dipublikasikan.

### Pengaturan build Cloudflare

Di dashboard: Workers & Pages → `website-berkah-cell` → Settings → Build.

| Bagian | Pengaturan yang benar |
| --- | --- |
| Branch produksi | `main` (jangan diganti ke branch kerja) |
| Tab **Production** → Deploy command | `npx wrangler deploy` |
| Tab **Previews** → Builds for Preview branches | Aktif |
| Tab **Previews** → Preview command | `npx wrangler versions upload` |
| Build command | Kosong (tidak perlu build, file statis) |
| Root directory | `/` |

Catatan:

- `npx wrangler preview` **bukan** perintah yang valid di Wrangler v4. Jika
  dipakai, semua build preview gagal.
- `versions upload` hanya mengunggah versi baru dengan link preview. Website
  publik tidak berubah. Website publik hanya berubah lewat `wrangler deploy`
  dari `main`.
- Setelah mengubah pengaturan, picu build baru dengan push commit baru ke
  branch. Jangan andalkan **Retry build**: pada 6 Okt 2026, build yang di-retry
  masih menjalankan perintah lama.
- Link preview muncul sebagai komentar bot Cloudflare di PR dan di tab
  Deployments.

## Sumber data

Website membaca file Google Sheets publik "Berkah Cell - Harga Publik (website)",
yang menyalin kolom pelanggan dari file utama lewat IMPORTRANGE. File utama
("Berkah Cell Report") berisi Harga_Modal dan data internal, dan harus tetap
berakses **Dibatasi**. Jangan arahkan website ke file utama.
