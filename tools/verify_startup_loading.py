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
    post_loader = read("post-startup-loader.js")

    # CSS critical path: không quay lại @import hoặc đưa optional CSS vào first paint.
    if 'href="styles.css"' in html:
        fail("index.html quay lại styles.css/@import waterfall")

    css_links = re.findall(r'<link\s+rel="stylesheet"\s+href="([^"]+)"', html)
    if not (7 <= len(css_links) <= 10):
        fail(f"Critical CSS count bất thường: {len(css_links)} (kỳ vọng 7-10)")

    post_styles = [
        "visual-prompt.css",
        "vietnamese-input.css",
        "accessibility.css",
        "asset-reliability.css",
    ]
    leaked_styles = [name for name in post_styles if name in css_links]
    if leaked_styles:
        fail(f"Optional CSS quay lại critical path: {leaked_styles}")
    for name in post_styles:
        if name not in post_loader:
            fail(f"Post loader thiếu optional stylesheet: {name}")
    ok(f"Critical CSS: {len(css_links)} file; {len(post_styles)} file chuyển post-startup")

    # JS: startup-performance sync để đo sớm; mọi critical source còn lại defer.
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
            fail(f"Critical script chưa defer: {src}")

    critical_order = [
        "data-easy.js",
        "tts-manifest.js",
        "topic-data.js",
        "audio-lazy-bootstrap.js",
        "script-core.js",
        "easy-boot-state.js",
        "smart-review.js",
        "listen-mode.js",
        "ux-hotfix.js",
        "tts-local.js",
        "memory-mode.js",
        "topic-level.js",
        "profile-stats.js",
        "startup-runtime-instrument.js",
        "easy-entry-transition.js",
        "script.js",
        "post-startup-loader.js",
    ]
    positions = {name: refs.index(name) if name in refs else -1 for name in critical_order}
    missing = [name for name, pos in positions.items() if pos < 0]
    if missing:
        fail(f"Thiếu critical startup script: {missing}")
    for current, nxt in zip(critical_order, critical_order[1:]):
        if positions[current] >= positions[nxt]:
            fail(f"Sai critical load order: {current} phải trước {nxt}")

    post_scripts = [
        "data-poems.js",
        "visual-data.js",
        "twemoji-local-manifest.js",
        "visual-prompt.js",
        "vietnamese-input.js",
        "vietnamese-dashboard.js",
        "stability-fixes.js",
        "mode-stats.js",
        "storage-health.js",
        "asset-reliability.js",
        "accessibility.js",
        "performance-health.js",
        "debug-smoke.js",
    ]
    leaked_scripts = [name for name in post_scripts if name in refs]
    if leaked_scripts:
        fail(f"Optional script quay lại critical path: {leaked_scripts}")
    for name in post_scripts:
        if name not in post_loader:
            fail(f"Post loader thiếu script: {name}")

    if len(refs) > 20:
        fail(f"Critical script count tăng trở lại: {len(refs)}")
    ok(f"Critical JS: {len(refs)} tag; {len(post_scripts)} module chuyển post-startup")

    # Post loader phải cho ít nhất một paint trước khi bắt đầu tải feature phụ.
    if post_loader.count("requestAnimationFrame") < 2:
        fail("Post loader thiếu double requestAnimationFrame sau first paint")
    if "script.async = false" not in post_loader:
        fail("Dynamic post scripts phải giữ execution order bằng async=false")
    if "GO_CHU_POST_STARTUP_READY" not in post_loader or "getGoChuPostStartupHealth" not in post_loader:
        fail("Post loader thiếu readiness/health API")
    if "setFreeModePending(true)" not in post_loader:
        fail("Free mode phải bị khóa trong lúc data-poems/post modules chưa sẵn sàng")
    ok("Post-startup loader có paint gate + ordered scripts + readiness guard")

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

    if positions["audio-lazy-bootstrap.js"] >= positions["script-core.js"]:
        fail("audio-lazy-bootstrap.js phải nạp trước script-core.js")
    ok("Audio network bị trì hoãn tới lúc nguồn đó thật sự play")

    print("\nStartup loading verification: PASS")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
