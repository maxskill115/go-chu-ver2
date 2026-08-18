#!/usr/bin/env python3
"""Regression guard cho Phase 9 đợt 11D: boot state + Easy transition gate."""

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
    script = (ROOT / "script.js").read_text(encoding="utf-8")

    refs = re.findall(r'<script\s+src="([^"]+)"[^>]*></script>', html)
    required = [
        "script-core.js",
        "easy-boot-state.js",
        "smart-review.js",
        "startup-runtime-instrument.js",
        "easy-entry-transition.js",
        "script.js",
    ]
    missing = [name for name in required if name not in refs]
    if missing:
        fail(f"Thiếu script 11D trong index.html: {missing}")

    for current, nxt in zip(required, required[1:]):
        if refs.index(current) >= refs.index(nxt):
            fail(f"Sai load order 11D: {current} phải trước {nxt}")

    need(boot, 'currentMode = "__boot__"',
         "Boot state phải neutralize currentMode trước module Easy-only")
    need(script, 'setMode("easy")',
         "script.js phải giữ một lần kích hoạt Easy chính thức")

    required_gate = [
        "Double RAF",
        "transitionActive = true",
        "input.disabled = true",
        "mobileAutofocusSkipped",
        "scheduleSmartReviewBarUpdate = function",
        "scheduleTopicLevelBarUpdate = function",
        "schedulePromptVisual = function",
        "updateListenModeBar = function",
        "updateMemoryModeBar = function",
        "renderPromptWordProgress = function",
        "updateVietnameseInputGuide = function",
        "getGoChuEasyEntryTransitionHealth",
    ]
    for snippet in required_gate:
        need(gate, snippet, f"Easy transition gate thiếu guard: {snippet}")

    if "input.focus()" in gate and "coarsePointer" not in gate:
        fail("Autofocus Easy không được chạy vô điều kiện trên mobile")

    print("Easy transition gate verification: PASS")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
