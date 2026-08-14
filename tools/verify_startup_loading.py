#!/usr/bin/env python3
"""Static guard cho startup network/load order của go-chu-ver2."""

from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def fail(message: str) -> None:
    print(f"[FAIL] {message}", file=sys.stderr)
    raise SystemExit(1)


def ok(message: str) -> None:
    print(f"[OK] {message}")


def read(path: str) -> str:
    file = ROOT / path
    if not file.exists():
        fail(f"Thiếu file: {path}")
    return file.read_text(encoding="utf-8")


def main() -> int:
    html = read("index.html")
    lazy_audio = read("audio-lazy-bootstrap.js")

    # CSS: không quay lại một stylesheet chứa @import waterfall.
    if 'href="styles.css"' in html:
        fail("index.html quay lại styles.css/@import waterfall")

    css_links = re.findall(r'<link\s+rel="stylesheet"\s+href="([^"]+)"', html)
    if len(css_links) < 10:
        fail(f"CSS direct links quá ít ({len(css_links)}), có thể đã quay lại bundle/import sai")
    if any(path == "styles.css" for path in css_links):
        fail("styles.css không được dùng ở production startup")
    ok(f"CSS direct/parallel: {len(css_links)} stylesheet")

    # JS: startup-performance được phép sync để đo từ sớm; mọi source script còn lại phải defer.
    script_tags = re.findall(r'<script([^>]*)\ssrc="([^"]+)"([^>]*)></script>', html)
    if not script_tags:
        fail("Không tìm thấy external script tags")

    refs: list[str] = []
    for before, src, after in script_tags:
        attrs = f"{before} {after}"
        refs.append(src)
        if src == "startup-performance.js":
            continue
        if not re.search(r'\bdefer\b', attrs):
            fail(f"Script production chưa defer: {src}")
    ok(f"JS parallel discovery: {len(refs) - 1} defer script + startup marker")

    required_order = [
        "data-easy.js",
        "topic-data.js",
        "audio-lazy-bootstrap.js",
        "script-core.js",
        "smart-review.js",
        "visual-prompt.js",
        "listen-mode.js",
        "tts-local.js",
        "memory-mode.js",
        "topic-level.js",
        "profile-stats.js",
        "script.js",
        "mode-stats.js",
        "accessibility.js",
    ]
    positions = {name: refs.index(name) if name in refs else -1 for name in required_order}
    missing = [name for name, pos in positions.items() if pos < 0]
    if missing:
        fail(f"Thiếu startup script bắt buộc: {missing}")
    for current, nxt in zip(required_order, required_order[1:]):
        if positions[current] >= positions[nxt]:
            fail(f"Sai load order: {current} phải trước {nxt}")
    ok("Load order wrapper chính hợp lệ")

    # Audio must not get src until play() after user activation.
    required_audio = [
        'audio.preload = "none"',
        "userActivated",
        "audio.play = function()",
        "audio.src = deferredSrc",
        "pointerdown",
        "keydown",
    ]
    if any(item not in lazy_audio for item in required_audio):
        fail("Lazy audio bootstrap thiếu guard cần thiết")

    unlock_match = re.search(r"function unlockAudio\(\)\{(.*?)\n\s*}", lazy_audio, flags=re.S)
    if unlock_match and ".src" in unlock_match.group(1):
        fail("unlockAudio không được gắn src hàng loạt ở interaction đầu")

    index_lazy = positions["audio-lazy-bootstrap.js"]
    index_core = positions["script-core.js"]
    if index_lazy >= index_core:
        fail("audio-lazy-bootstrap.js phải nạp trước script-core.js")
    ok("Audio network bị trì hoãn tới lúc nguồn đó thật sự play")

    print("\nStartup loading verification: PASS")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
