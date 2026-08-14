#!/usr/bin/env python3
"""Vendor đúng các Twemoji SVG đang dùng trong promptVisualRules.

Không tải cả bộ Twemoji. Script đọc code trực tiếp từ visual-data.js và lưu:
    assets/twemoji/<code>.svg

Nguồn pinned:
    https://cdn.jsdelivr.net/gh/jdecked/twemoji@17.0.3/assets/svg/<code>.svg
"""

from __future__ import annotations

import argparse
import re
import sys
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
VISUAL_DATA = ROOT / "visual-data.js"
OUTPUT_DIR = ROOT / "assets" / "twemoji"
VERSION = "17.0.3"
BASE_URL = f"https://cdn.jsdelivr.net/gh/jdecked/twemoji@{VERSION}/assets/svg"


def extract_codes() -> list[str]:
    source = VISUAL_DATA.read_text(encoding="utf-8")
    codes = re.findall(r'\bcode:\s*"([0-9a-f-]+)"', source, flags=re.I)
    result: list[str] = []
    seen: set[str] = set()
    for code in codes:
        value = code.lower()
        if value not in seen:
            seen.add(value)
            result.append(value)
    if not result:
        raise RuntimeError("Không tìm thấy code Twemoji trong visual-data.js")
    return result


def download(url: str, target: Path, timeout: int = 30) -> None:
    request = urllib.request.Request(
        url,
        headers={"User-Agent": "go-chu-ver2-twemoji-vendor/1.0"},
    )
    with urllib.request.urlopen(request, timeout=timeout) as response:
        data = response.read()
    if not data.lstrip().startswith(b"<svg"):
        raise RuntimeError(f"Nội dung không phải SVG: {url}")
    target.write_bytes(data)


def main() -> int:
    parser = argparse.ArgumentParser(description="Tải đúng Twemoji SVG đang dùng về repo")
    parser.add_argument("--force", action="store_true", help="Tải đè file SVG đã có")
    parser.add_argument("--dry-run", action="store_true", help="Chỉ liệt kê URL/file, không tải")
    args = parser.parse_args()

    codes = extract_codes()
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    downloaded = 0
    skipped = 0
    failed = 0

    print(f"Twemoji pinned: {VERSION}")
    print(f"Unique SVG cần dùng: {len(codes)}")

    for index, code in enumerate(codes, 1):
        url = f"{BASE_URL}/{code}.svg"
        target = OUTPUT_DIR / f"{code}.svg"

        if args.dry_run:
            print(f"{index:02d}. {target.relative_to(ROOT)} <- {url}")
            continue

        if target.exists() and target.stat().st_size > 0 and not args.force:
            skipped += 1
            print(f"[{index:02d}/{len(codes):02d}] SKIP {code}")
            continue

        try:
            download(url, target)
            downloaded += 1
            print(f"[{index:02d}/{len(codes):02d}] OK   {code}")
        except Exception as exc:
            failed += 1
            print(f"[{index:02d}/{len(codes):02d}] ERR  {code}: {exc}", file=sys.stderr)

    print("\nHoàn tất")
    print(f"- Tải mới: {downloaded}")
    print(f"- Có sẵn: {skipped}")
    print(f"- Lỗi: {failed}")
    print(f"- Thư mục: {OUTPUT_DIR}")
    return 2 if failed else 0


if __name__ == "__main__":
    raise SystemExit(main())
