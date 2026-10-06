"""Bangun dua versi mockup dari template.html.

- ../mockup.html        : versi anotasi (catatan, nomor, status keputusan di luar bingkai HP)
- ../mockup-bersih.html : versi bersih untuk menilai pengalaman pelanggan

Blok <!--A-->...<!--/A--> hanya muncul di versi anotasi,
blok <!--C-->...<!--/C--> hanya muncul di versi bersih.
Jalankan: python3 build.py
"""
import base64
import re
from pathlib import Path

HERE = Path(__file__).resolve().parent
OUT = HERE.parent
ASSETS = {
    "__LOGO__": "logo.webp",
    "__WAVE__": "maskot-melambai.webp",
    "__CONFUSED__": "maskot-bingung.webp",
}


def inline_assets(html: str) -> str:
    for marker, name in ASSETS.items():
        data = base64.b64encode((OUT / "assets" / name).read_bytes()).decode()
        html = html.replace(marker, "data:image/webp;base64," + data)
    return html


def strip(html: str, tag: str) -> str:
    """Hapus blok bertanda, termasuk blok bersarang."""
    token = re.compile(rf"<!--(/?){tag}-->")
    out, depth, pos = [], 0, 0
    for m in token.finditer(html):
        if depth == 0:
            out.append(html[pos:m.start()])
        depth += -1 if m.group(1) else 1
        assert depth >= 0, "penanda tidak seimbang"
        pos = m.end()
    assert depth == 0, "penanda tidak seimbang"
    out.append(html[pos:])
    return "".join(out)


def unwrap(html: str, tag: str) -> str:
    return html.replace(f"<!--{tag}-->", "").replace(f"<!--/{tag}-->", "")


def main() -> None:
    src = (HERE / "template.html").read_text(encoding="utf-8")
    annotated = unwrap(strip(src, "C"), "A")
    clean = unwrap(strip(src, "A"), "C").replace('<body class="annot-on">', "<body>")
    clean = clean.replace("<title>Mockup HP BERKAH CELL v1</title>",
                          "<title>Mockup HP BERKAH CELL bersih</title>")
    for leftover in ('class="pin"', 'class="notes"', "D02", "D03", "D04", "D05", "Usulan", "Terbuka"):
        assert leftover not in re.sub(r"base64,[^\"]+", "", clean), leftover
    (OUT / "mockup.html").write_text(inline_assets(annotated), encoding="utf-8")
    (OUT / "mockup-bersih.html").write_text(inline_assets(clean), encoding="utf-8")
    print("ok")


if __name__ == "__main__":
    main()
