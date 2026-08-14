#!/usr/bin/env python3
"""Static checks cho go-chu-ver2, không cần browser hay network."""

from __future__ import annotations

import json
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


def check_script_refs() -> None:
    html = read("index.html")
    refs = re.findall(r'<script\s+src="([^"]+)"', html)
    missing = [ref for ref in refs if not (ROOT / ref).exists()]
    if missing:
        fail(f"index.html tham chiếu script không tồn tại: {missing}")
    ok(f"{len(refs)} script refs đều tồn tại")

    required_order = [
        "data-easy.js",
        "tts-manifest.js",
        "visual-data.js",
        "twemoji-local-manifest.js",
        "script-core.js",
        "visual-prompt.js",
        "listen-mode.js",
        "ux-hotfix.js",
        "tts-local.js",
        "memory-mode.js",
        "script.js",
        "debug-smoke.js",
    ]
    positions = {ref: refs.index(ref) if ref in refs else -1 for ref in required_order}
    missing_required = [name for name, pos in positions.items() if pos < 0]
    if missing_required:
        fail(f"Thiếu script bắt buộc: {missing_required}")
    if any(positions[required_order[i]] >= positions[required_order[i + 1]] for i in range(len(required_order) - 1)):
        fail("Load order script quan trọng không đúng")
    ok("Load order runtime chính hợp lệ")


def check_styles() -> None:
    styles = read("styles.css")
    if '@import url("ui-scope-fixes.css");' not in styles:
        fail("styles.css chưa import ui-scope-fixes.css")
    scope = read("ui-scope-fixes.css")
    if ".hidden-by-mode" not in scope or "display:none !important" not in scope.replace(" ", ""):
        fail("UI scope guard cho hidden-by-mode chưa đủ mạnh")
    ok("UI scope stylesheet đã được nạp cuối cascade")


def extract_visual_codes() -> list[str]:
    source = read("visual-data.js")
    codes = re.findall(r'\bcode:\s*"([0-9a-f-]+)"', source, flags=re.I)
    unique = list(dict.fromkeys(code.lower() for code in codes))
    if not unique:
        fail("Không tìm thấy Twemoji code")
    if re.search(r'\bkeywords\s*:', source):
        fail("visual-data.js quay lại keyword mapping rộng; phải dùng exact/contains whitelist")
    if "exact:" not in source or "contains:" not in source:
        fail("visual-data.js thiếu exact/contains semantic mapping")
    ok(f"Twemoji rules: {len(codes)} rule / {len(unique)} code duy nhất")
    return unique


def check_easy_scope_guards() -> None:
    listen = read("listen-mode.js")
    tts = read("tts-local.js")
    smart = read("smart-review.js")
    visual = read("visual-prompt.js")

    required_snippets = [
        (listen, 'bar.classList.toggle("hidden-by-mode", !isEasy)', "Listen bar chưa có Easy-only guard"),
        (tts, 'if(!isEasy)', "Local TTS chưa có Easy-only guard"),
        (smart, 'bar.classList.toggle("hidden-by-mode", !isEasy)', "Smart Review chưa có Easy-only guard"),
        (visual, 'if(currentMode !== "easy")', "Visual chưa có Easy-only guard"),
    ]
    for source, snippet, message in required_snippets:
        if snippet not in source:
            fail(message)
    ok("Easy-only UI/runtime guards tồn tại")


def parse_object_freeze_map(path: str, variable: str) -> dict[str, str]:
    source = read(path)
    match = re.search(rf'{re.escape(variable)}\s*=\s*Object\.freeze\((\{{.*?\}})\);', source, flags=re.S)
    if not match:
        fail(f"Không parse được {variable} trong {path}")
    try:
        value = json.loads(match.group(1))
    except json.JSONDecodeError as exc:
        fail(f"JSON map lỗi trong {path}: {exc}")
    if not isinstance(value, dict):
        fail(f"{variable} không phải object map")
    return value


def check_twemoji_manifest(codes: list[str]) -> None:
    manifest = parse_object_freeze_map("twemoji-local-manifest.js", "window.GO_CHU_TWEMOJI_LOCAL")
    unknown = sorted(set(manifest) - set(codes))
    if unknown:
        fail(f"Twemoji manifest có code không dùng: {unknown}")
    bad_paths = [path for path in manifest.values() if not re.fullmatch(r'assets/twemoji/[0-9a-f-]+\.svg', path)]
    if bad_paths:
        fail(f"Twemoji manifest path sai: {bad_paths[:3]}")
    missing_files = [path for path in manifest.values() if not (ROOT / path).exists()]
    if missing_files:
        fail(f"Twemoji manifest trỏ tới file thiếu: {missing_files[:3]}")
    ok(f"Twemoji local manifest hợp lệ: {len(manifest)}/{len(codes)}")


def check_tts_manifest() -> None:
    source = read("tts-manifest.js")
    if "google-cloud-text-to-speech" not in source:
        fail("tts-manifest.js thiếu provider marker")
    if re.search(r'AIza[0-9A-Za-z_-]{20,}', source):
        fail("Phát hiện chuỗi giống Google API key trong tts-manifest.js")
    ok("TTS manifest không lộ API key dạng phổ biến")


def check_tools() -> None:
    required = [
        "tools/render_google_tts.py",
        "tools/vendor_twemoji.py",
        "tools/verify_repository.py",
        "tools/render_google_tts.bat",
        "tools/vendor_twemoji.bat",
    ]
    for path in required:
        read(path)
    ok("Build/verify tools tồn tại")


def main() -> int:
    check_script_refs()
    check_styles()
    check_easy_scope_guards()
    codes = extract_visual_codes()
    check_twemoji_manifest(codes)
    check_tts_manifest()
    check_tools()
    print("\nRepository static verification: PASS")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
