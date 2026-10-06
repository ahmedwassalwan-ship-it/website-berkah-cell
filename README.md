# website-berkah-cell

Website daftar harga servis HP BERKAH CELL.

- `site-live/index.html` — kode website (satu file).
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

## Sumber data

Website membaca file Google Sheets publik "Berkah Cell - Harga Publik (website)",
yang menyalin kolom pelanggan dari file utama lewat IMPORTRANGE. File utama
("Berkah Cell Report") berisi Harga_Modal dan data internal, dan harus tetap
berakses **Dibatasi**. Jangan arahkan website ke file utama.
