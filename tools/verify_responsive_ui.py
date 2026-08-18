#!/usr/bin/env python3
"""Static regression guard cho Phase 9.12A responsive learning UI."""

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
    css_path = ROOT / "ui-responsive-v2.css"
    if not css_path.exists():
        fail("Thiếu ui-responsive-v2.css")
    css = css_path.read_text(encoding="utf-8")

    links = re.findall(r'<link\s+rel="stylesheet"\s+href="([^"]+)"', html)
    if "ui-responsive-v2.css" not in links:
        fail("index.html chưa nạp ui-responsive-v2.css")
    if "ui-scope-fixes.css" not in links:
        fail("Thiếu ui-scope-fixes.css")
    if links.index("ui-responsive-v2.css") <= links.index("ui-scope-fixes.css"):
        fail("ui-responsive-v2.css phải nằm sau ui-scope-fixes.css trong critical cascade")
    if len(links) > 6:
        fail(f"Responsive UI làm critical CSS vượt budget: {len(links)}")

    if "@import" in css:
        fail("Responsive CSS không được tạo @import waterfall")

    required = [
        ("#normalPanel", "Thiếu learning panel layout"),
        ("grid-template-columns: repeat(12", "Learning panel chưa dùng 12-col grid"),
        ("#topicLevelBar", "Thiếu compact Topic/Level toolbar"),
        ("#listenModeBar", "Thiếu Listen toolbar layout"),
        ("#memoryModeBar", "Thiếu Memory toolbar layout"),
        ("#smartReviewBar", "Thiếu Review toolbar layout"),
        ("#input", "Thiếu input responsive rule"),
        ("#nextBtn", "Thiếu Next responsive rule"),
        ("#result:empty", "Feedback rỗng vẫn chiếm chỗ"),
        ("max-height: 164px", "Feedback desktop chưa giới hạn chiều cao"),
        ("listen-mode-bar:not(.active)", "Listen inactive chưa collapse"),
        ("memory-mode-bar:not(.active)", "Memory inactive chưa collapse"),
        ('@media (max-width: 700px)', "Thiếu mobile breakpoint"),
        ('@media (max-height: 520px) and (orientation: landscape)', "Thiếu low-height landscape breakpoint"),
        ("#promptVisualWrap.hidden + #text", "Prompt chưa reclaim grid khi visual ẩn"),
    ]
    for snippet, message in required:
        need(css, snippet, message)

    if css.count("44px !important") < 4:
        fail("HUD mobile/desktop touch target chưa đạt tối thiểu khoảng 44px")
    if "overflow-x: hidden" not in css:
        fail("Thiếu horizontal overflow guard")
    if "100dvh" not in css:
        fail("Responsive shell chưa dùng dynamic viewport height")

    print("Responsive UI static verification: PASS")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
