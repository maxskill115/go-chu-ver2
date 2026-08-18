#!/usr/bin/env python3
"""Regression guard cho Phase 9 đợt 11D/11G: boot state + Easy transition gate/start."""

from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def fail(message: str) -> None:
    print(f"[FAIL] {message}", file=sys.stderr)
    raise SystemExit(1)


def need(source: str, snippet: str, message: str) -> None:
    if snippet not in source:
        fail(message)


def main() -> int:
    html = (ROOT / "index.html").read_text(encoding="utf-8")
    boot = (ROOT / "easy-boot-state.js").read_text(encoding="utf-8")
    gate = (ROOT / "easy-entry-transition.js").read_text(encoding="utf-8")
    easy_start = (ROOT / "easy-start.js").read_text(encoding="utf-8")
    legacy_script = (ROOT / "script.js").read_text(encoding="utf-8")
    post = (ROOT / "post-startup-loader.js").read_text(encoding="utf-8")

    refs = re.findall(r'<script\s+src="([^"]+)"[^>]*></script>', html)
    required = [
        "script-core.js",
        "easy-boot-state.js",
        "smart-review.js",
        "startup-runtime-instrument.js",
        "easy-entry-transition.js",
        "easy-start.js",
        "post-startup-loader.js",
    ]
    missing = [name for name in required if name not in refs]
    if missing:
        fail(f"Thiếu script boot/transition trong index.html: {missing}")

    for current, nxt in zip(required, required[1:]):
        if refs.index(current) >= refs.index(nxt):
            fail(f"Sai load order boot/transition: {current} phải trước {nxt}")

    if "script.js" in refs:
        fail("script.js Free/Settings không được nằm critical path sau 11G")

    need(boot, 'currentMode = "__boot__"',
         "Boot state phải neutralize currentMode trước module Easy-only")
    need(easy_start, 'startStudyTimer();',
         "easy-start.js phải khởi động study timer")
    need(easy_start, 'setMode("easy");',
         "easy-start.js phải kích hoạt Easy chính thức")
    need(easy_start, 'GO_CHU_EXECUTING_POST_SCRIPT === "script.js"',
         "easy-start.js thiếu guard suppress legacy script startup")
    need(legacy_script, 'setMode("easy")',
         "script.js legacy startup marker không còn để guard 11G xác nhận")
    need(post, '"script.js"',
         "post-startup-loader phải nạp script.js hậu kỳ")

    required_gate = [
        "Double RAF",
        "transitionActive = true",
        "input.disabled = true",
        "mobileAutofocusSkipped",
        "scheduleSmartReviewBarUpdate = function",
        "scheduleTopicLevelBarUpdate = function",
        "getGoChuEasyEntryTransitionHealth",
    ]
    for snippet in required_gate:
        need(gate, snippet, f"Easy transition gate thiếu guard: {snippet}")

    if "input.focus()" in gate and "coarsePointer" not in gate:
        fail("Autofocus Easy không được chạy vô điều kiện trên mobile")

    print("Easy transition/start verification: PASS")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
