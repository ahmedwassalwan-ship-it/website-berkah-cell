"""Audit ekspor Price_List publik tanpa mengubah Sheet.

Pakai: python3 tools/cek_data.py <file.csv>
Melaporkan pemakaian nilai Kualitas/Garansi, model yang berpotensi ganda,
baris identik, baris bertentangan, dan harga yang tidak valid.
Aturan normalisasi mengikuti keputusan pemilik 6 Okt 2026 (PRD v0.4):
"xiomi" ditampilkan sebagai Xiaomi; Redmi dan Poco tetap merek sendiri.
"""
import csv
import re
import sys
from collections import Counter, defaultdict

BRAND_ALIAS = {"xiomi": "xiaomi"}


def norm(s):
    return re.sub(r"\s+", " ", (s or "").strip())


def key(s):
    return norm(s).lower()


def price_ok(raw):
    t = re.sub(r"^rp\.?\s*", "", norm(raw), flags=re.I).replace(" ", "")
    if re.fullmatch(r"\d{1,3}([.,]\d{3})+|\d+", t):
        return int(re.sub(r"[.,]", "", t)) > 0
    return False


def main(path):
    with open(path, encoding="utf-8") as f:
        rows = [{k.strip().lower(): (v or "") for k, v in r.items()} for r in csv.DictReader(f)]
    print(f"Sumber: {path}\nJumlah baris: {len(rows)}")
    if "harga_modal" in rows[0]:
        print("PERINGATAN: kolom Harga_Modal ada di ekspor publik!")

    for i, r in enumerate(rows, start=2):
        r["_line"] = i
        r["_brand"] = BRAND_ALIAS.get(key(r.get("brand")), key(r.get("brand")))

    print("\n== Nilai Kualitas ==")
    for v, n in Counter(norm(r.get("kualitas")) for r in rows).most_common():
        print(f"  {v or '(kosong)'}: {n}")
    print("\n== Baris dengan Kualitas 'Jasa' atau 'Tidak Ada' ==")
    for r in rows:
        if key(r.get("kualitas")) in ("jasa", "tidak ada"):
            print(f"  baris {r['_line']}: {norm(r['brand'])} | {norm(r['model'])} | {norm(r['layanan'])} | "
                  f"Kualitas={norm(r['kualitas'])} | {norm(r['harga_jual'])} | Garansi={norm(r['garansi'])}")

    print("\n== Nilai Garansi ==")
    for v, n in Counter(norm(r.get("garansi")) for r in rows).most_common():
        print(f"  {v or '(kosong)'}: {n}")
    print("\n== Garansi 'Tidak Ada' per layanan ==")
    by = defaultdict(list)
    for r in rows:
        by[norm(r["layanan"])].append(norm(r.get("garansi")))
    for lay, gs in sorted(by.items()):
        c = Counter(gs)
        if "Tidak Ada" in c:
            print(f"  {lay}: {dict(c)}")

    print("\n== Model yang sama setelah huruf besar-kecil/spasi disamakan (dalam satu merek) ==")
    variants = defaultdict(Counter)
    for r in rows:
        variants[(r["_brand"], key(r["model"]))][r["model"]] += 1
    for (b, m), c in sorted(variants.items()):
        if len(c) > 1:
            print(f"  {b} / {m}: {dict(c)}")

    print("\n== Model yang mungkin sama di merek berbeda (keluarga Xiaomi/Redmi/Poco, perlu dicek pemilik) ==")
    brands_of = defaultdict(set)
    for r in rows:
        brands_of[key(r["model"])].add(r["_brand"])
        for pre in ("redmi ", "poco ", "xiaomi "):
            if key(r["model"]).startswith(pre):
                brands_of[key(r["model"])[len(pre):]].add(f"{r['_brand']} (model ditulis '{norm(r['model'])}')")
    family = {"xiaomi", "redmi", "poco"}
    for m, bs in sorted(brands_of.items()):
        plain = {b.split(" ")[0] for b in bs}
        prefixed = any("model ditulis" in b for b in bs)
        if len(bs) > 1 and (prefixed or len(plain & family) > 1):
            print(f"  {m}: {sorted(bs)}")

    print("\n== Baris identik / bertentangan (merek+model+layanan+kualitas sama) ==")
    groups = defaultdict(list)
    for r in rows:
        groups[(r["_brand"], key(r["model"]), key(r["layanan"]), key(r["kualitas"]))].append(r)
    found = False
    for k, rs in groups.items():
        if len(rs) > 1:
            found = True
            vals = {(norm(r["harga_jual"]), norm(r["estimasi_waktu"]), norm(r["garansi"])) for r in rs}
            kind = "IDENTIK" if len(vals) == 1 else "BERBEDA (jangan ditimpa)"
            print(f"  {kind}: {k} baris {[r['_line'] for r in rs]} -> {sorted(vals)}")
    if not found:
        print("  (tidak ada)")

    print("\n== Harga tidak valid / nol / kosong ==")
    bad = [r for r in rows if not price_ok(r.get("harga_jual"))]
    for r in bad:
        print(f"  baris {r['_line']}: {norm(r['brand'])} {norm(r['model'])} {norm(r['layanan'])} -> '{norm(r['harga_jual'])}'")
    if not bad:
        print("  (tidak ada)")

    print("\n== Nilai dengan spasi berlebih ==")
    sp = [(r["_line"], c, r[c]) for r in rows for c in ("brand", "model", "layanan", "kualitas") if r.get(c) != norm(r.get(c))]
    for line, c, v in sp:
        print(f"  baris {line}: {c}={v!r}")
    if not sp:
        print("  (tidak ada)")


if __name__ == "__main__":
    main(sys.argv[1])
