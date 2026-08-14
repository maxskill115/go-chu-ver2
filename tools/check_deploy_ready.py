#!/usr/bin/env python3
"""Báo cáo mức sẵn sàng deploy của go-chu-ver2.

Mặc định chỉ in WARN và exit 0 để CI không bị chặn bởi binary đang chờ người dùng.
Dùng --strict để coi các blocker binary là lỗi.
"""

from __future__ import annotations

import argparse
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def read(path: str) -> str:
    file = ROOT / path
    return file.read_text(encoding="utf-8") if file.exists() else ""


def parse_map(path: str, variable: str) -> dict:
    source = read(path)
    match = re.search(rf'{re.escape(variable)}\s*=\s*Object\.freeze\((\{{.*?\}})\);', source, flags=re.S)
    if not match:
        return {}
    try:
        value = json.loads(match.group(1))
        return value if isinstance(value, dict) else {}
    except json.JSONDecodeError:
        return {}


def count_easy_words() -> int:
    source = read("data-easy.js")
    match = re.search(r"\blet\s+easyWords\s*=\s*\[(.*?)\];", source, flags=re.S)
    if not match:
        return 0
    values = re.findall(r'"(?:\\.|[^"\\])*"', match.group(1))
    result = []
    seen = set()
    for raw in values:
        try:
            value = json.loads(raw)
        except json.JSONDecodeError:
            continue
        if value not in seen:
            seen.add(value)
            result.append(value)
    return len(result)


def count_visual_codes() -> int:
    source = read("visual-data.js")
    return len(set(re.findall(r'\bcode:\s*"([0-9a-f-]+)"', source, flags=re.I)))


def main() -> int:
    parser = argparse.ArgumentParser(description="Kiểm tra mức sẵn sàng deploy")
    parser.add_argument("--strict", action="store_true", help="Binary/dependency thiếu sẽ làm exit code != 0")
    args = parser.parse_args()

    easy_total = count_easy_words()
    tts_map = parse_map("tts-manifest.js", "window.GO_CHU_TTS_MANIFEST")
    visual_total = count_visual_codes()
    visual_map = parse_map("twemoji-local-manifest.js", "window.GO_CHU_TWEMOJI_LOCAL")

    music_required = [
        ROOT / "Music" / "background Music1.mp3",
        ROOT / "Music" / "background Music2.mp3",
        ROOT / "Music" / "Click.wav",
        ROOT / "Music" / "dung.wav",
    ]
    music_present = sum(1 for path in music_required if path.exists() and path.stat().st_size > 0)

    external_img_refs = sorted(set(re.findall(r'\.\./IMG/[^"\')]+', read("index.html"))))

    tts_pct = round((len(tts_map) / easy_total) * 100) if easy_total else 0
    visual_pct = round((len(visual_map) / visual_total) * 100) if visual_total else 0

    print("=== GO-CHU-VER2 DEPLOY READINESS ===")
    print(f"TTS local:      {len(tts_map)}/{easy_total} ({tts_pct}%)")
    print(f"Twemoji local:  {len(visual_map)}/{visual_total} ({visual_pct}%)")
    print(f"Music binary:   {music_present}/{len(music_required)}")
    print(f"../IMG refs:     {len(external_img_refs)} dependency path")
    print("CI verifier:     tools/verify_repository.py")

    warnings = []
    if len(tts_map) < easy_total:
        warnings.append("Google TTS MP3 chưa phủ 100%; runtime vẫn có Web Speech fallback.")
    if len(visual_map) < visual_total:
        warnings.append("Twemoji SVG local chưa phủ 100%; runtime vẫn có CDN/emoji fallback.")
    if music_present < len(music_required):
        warnings.append("Music/UI audio binary chưa đủ trên remote.")
    if external_img_refs:
        warnings.append("Repo còn phụ thuộc ../IMG của project cha; UI chính có fallback nhưng standalone chưa tự chứa toàn bộ icon.")

    if warnings:
        print("\nWARNINGS:")
        for item in warnings:
            print(f"- {item}")
    else:
        print("\nREADY: không còn blocker binary/dependency đã biết.")

    if args.strict and warnings:
        return 2
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
