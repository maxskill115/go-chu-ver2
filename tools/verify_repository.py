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
    post = read("post-startup-loader.js")
    refs = re.findall(r'<script\s+src="([^"]+)"', html)
    missing = [ref for ref in refs if not (ROOT / ref).exists()]
    if missing:
        fail(f"index.html tham chiếu script không tồn tại: {missing}")

    critical = [
        "startup-performance.js",
        "data-easy.js",
        "topic-data.js",
        "memory-state.js",
        "audio-lazy-bootstrap.js",
        "script-core.js",
        "easy-boot-state.js",
        "smart-review.js",
        "topic-level.js",
        "profile-stats.js",
        "startup-runtime-instrument.js",
        "easy-entry-transition.js",
        "script.js",
        "post-startup-loader.js",
    ]
    positions = {name: refs.index(name) if name in refs else -1 for name in critical}
    missing_critical = [name for name, pos in positions.items() if pos < 0]
    if missing_critical:
        fail(f"Thiếu critical script: {missing_critical}")
    for current, nxt in zip(critical, critical[1:]):
        if positions[current] >= positions[nxt]:
            fail(f"Sai critical order: {current} phải trước {nxt}")

    post_required = [
        "data-poems.js", "tts-manifest.js", "visual-data.js", "twemoji-local-manifest.js",
        "visual-prompt.js", "listen-mode.js", "ux-hotfix.js", "tts-local.js",
        "memory-mode.js", "memory-topic-bridge.js", "vietnamese-input.js",
        "vietnamese-dashboard.js", "stability-fixes.js", "mode-stats.js",
        "storage-health.js", "asset-reliability.js", "accessibility.js",
        "performance-health.js", "debug-smoke.js",
    ]
    leaked = [name for name in post_required if name in refs]
    if leaked:
        fail(f"Post module quay lại critical path: {leaked}")
    missing_post = [name for name in post_required if name not in post]
    if missing_post:
        fail(f"Post loader thiếu module: {missing_post}")
    ok(f"Critical refs {len(refs)}; post modules {len(post_required)}")


def check_styles() -> None:
    html = read("index.html")
    scope = read("ui-scope-fixes.css")
    post = read("post-startup-loader.js")
    compact = re.sub(r"\s+", "", scope)

    if 'href="styles.css"' in html:
        fail("Production không được quay lại styles.css/@import")
    if 'href="ui-scope-fixes.css"' not in html:
        fail("ui-scope-fixes.css phải ở critical cascade")
    if ".hidden-by-mode" not in scope or "display:none!important" not in compact:
        fail("hidden-by-mode guard chưa đủ mạnh")

    optional = [
        "listen-mode.css", "ux-hotfix.css", "memory-mode.css",
        "visual-prompt.css", "vietnamese-input.css", "accessibility.css", "asset-reliability.css"
    ]
    for name in optional:
        if f'href="{name}"' in html:
            fail(f"Optional CSS không được block first paint: {name}")
        if name not in post:
            fail(f"Post loader thiếu optional CSS: {name}")
    ok("Critical/post CSS split hợp lệ")


def extract_visual_codes() -> list[str]:
    source = read("visual-data.js")
    codes = re.findall(r'\bcode:\s*"([0-9a-f-]+)"', source, flags=re.I)
    unique = list(dict.fromkeys(code.lower() for code in codes))
    if not unique:
        fail("Không tìm thấy Twemoji code")
    if re.search(r'\bkeywords\s*:', source):
        fail("Visual quay lại keyword mapping rộng")
    if "exact:" not in source or "contains:" not in source:
        fail("Visual thiếu exact/contains semantic mapping")
    return unique


def check_easy_scope_guards() -> None:
    listen = read("listen-mode.js")
    tts = read("tts-local.js")
    smart = read("smart-review.js")
    visual = read("visual-prompt.js")
    required = [
        (listen, 'bar.classList.toggle("hidden-by-mode", !isEasy)', "Listen thiếu Easy-only guard"),
        (tts, 'if(!isEasy)', "TTS thiếu Easy-only guard"),
        (smart, 'bar.classList.toggle("hidden-by-mode", !isEasy)', "Review thiếu Easy-only guard"),
        (visual, 'if(currentMode !== "easy")', "Visual thiếu Easy-only guard"),
    ]
    for source, snippet, message in required:
        if snippet not in source:
            fail(message)
    ok("Easy-only guards tồn tại")


def check_stability_guards() -> None:
    script = read("script.js")
    stability = read("stability-fixes.js")
    performance = read("performance-health.js")
    if "function requestAppFullscreen" in script or "request.call(el)" in script:
        fail("Auto-fullscreen runtime quay lại")
    if 'document.addEventListener("wheel"' in script:
        fail("Wheel listener nặng quay lại")
    if "scheduleFreeLayoutSync" not in script or "scheduleFreeTypingState" not in script:
        fail("Free mode mất RAF throttle")
    if "poemSelectMenu.dataset.rendered" not in stability or "DocumentFragment" not in stability:
        fail("Free dropdown mất single-render guard")
    if "PerformanceObserver" not in performance or "getGoChuPerformanceHealth" not in performance:
        fail("Thiếu performance diagnostics")
    ok("Stability guards tồn tại")


def check_optional_memory_split() -> None:
    state = read("memory-state.js")
    memory = read("memory-mode.js")
    bridge = read("memory-topic-bridge.js")
    post = read("post-startup-loader.js")

    for snippet in [
        'const GO_CHU_MEMORY_WORDS_KEY', 'let memoryModeActive = false',
        'let buildMemoryRound = function', 'getGoChuMemoryStateHealth'
    ]:
        if snippet not in state:
            fail(f"memory-state thiếu: {snippet}")

    forbidden_redeclare = [
        'const GO_CHU_MEMORY_WORDS_KEY', 'const GO_CHU_MEMORY_SECONDS_KEY',
        'let memoryModeActive', 'let memoryWordCount', 'let memorySeconds',
        'function loadMemoryNumber', 'function saveMemoryNumber', 'function getPromptWordCount'
    ]
    for snippet in forbidden_redeclare:
        if snippet in memory:
            fail(f"memory-mode redeclare critical state: {snippet}")
    if 'buildMemoryRound = function' not in memory or 'GO_CHU_MEMORY_BEHAVIOR_READY' not in memory:
        fail("memory-mode chưa thay stub bằng behavior thật")
    if "GO_CHU_MEMORY_TOPIC_BRIDGE_READY" not in bridge or "promptMatchesTopic" not in bridge:
        fail("Memory topic bridge chưa phục hồi topic filter")

    order = ["listen-mode.js", "ux-hotfix.js", "tts-local.js", "memory-mode.js", "memory-topic-bridge.js", "vietnamese-input.js"]
    positions = {name: post.find(f'"{name}"') for name in order}
    for current, nxt in zip(order, order[1:]):
        if positions[current] < 0 or positions[nxt] < 0 or positions[current] >= positions[nxt]:
            fail(f"Sai optional runtime order: {current} → {nxt}")
    ok("Memory state/behavior split hợp lệ")


def check_easy_startup_performance_guards() -> None:
    topic_data = read("topic-data.js")
    topic_level = read("topic-level.js")
    visual = read("visual-prompt.js")
    profile = read("profile-stats.js")
    listen = read("listen-mode.js")
    ux = read("ux-hotfix.js")
    tts = read("tts-local.js")
    mode_stats = read("mode-stats.js")
    asset = read("asset-reliability.js")
    startup = read("startup-performance.js")
    runtime_startup = read("startup-runtime-instrument.js")
    boot = read("easy-boot-state.js")
    transition = read("easy-entry-transition.js")
    post = read("post-startup-loader.js")

    for name in ["GO_CHU_UNIQUE_EASY_PROMPTS", "GO_CHU_EASY_PROMPT_SET", "goChuTopicNormalizeCache", "goChuTopicMatchCache", "goChuWordCountCache"]:
        if name not in topic_data:
            fail(f"Thiếu topic cache: {name}")
    if "goChuTopicPoolCache" not in topic_level or "goChuLevelPoolCache" not in topic_level:
        fail("Thiếu topic/level pool cache")
    if '.filter(prompt => promptMatchesLearningFilters(prompt, true))' in topic_level:
        fail("Easy round quay lại filter lặp")
    if "goChuVisualMatchCache" not in visual or 'if(currentMode === "easy" && currentPrompt)' not in visual:
        fail("Visual post-load/cache guard thiếu")

    if "ensureListenVoiceRuntime" not in listen or "hasVietnameseWebVoice(refresh = false)" not in tts:
        fail("Listen/TTS lazy voice guard thiếu")
    if re.search(r"(?m)^\s*refreshVoiceHotfixUI\(\);\s*$", ux):
        fail("Voice enumeration quay lại startup")
    if "hydrateActiveModeStatsFromStorage" not in mode_stats:
        fail("Mode stats hydrate guard thiếu")
    if "requestIdleCallback" not in asset or "scheduleGoChuAssetReliability" not in asset:
        fail("Asset probe chưa idle")
    if "getGoChuStartupPerformance" not in startup or "easy:firstInputReady" not in runtime_startup:
        fail("Startup diagnostics thiếu")
    if 'currentMode = "__boot__"' not in boot:
        fail("Neutral boot state thiếu")
    if "getGoChuEasyEntryTransitionHealth" not in transition:
        fail("Easy transition diagnostics thiếu")
    if "getGoChuPostStartupHealth" not in post:
        fail("Post-startup diagnostics thiếu")

    hud_block = re.search(r"function ensureProfileHud\(\).*?\n}\n\nfunction updateProfileHud", profile, flags=re.S)
    if hud_block and "ensureProfileDashboard()" in hud_block.group(0):
        fail("Profile HUD dựng dashboard quá sớm")
    ok("Easy startup performance guards tồn tại")


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
    missing_files = [path for path in manifest.values() if not (ROOT / path).exists()]
    if missing_files:
        fail(f"Twemoji manifest trỏ file thiếu: {missing_files[:3]}")


def check_tts_manifest() -> None:
    source = read("tts-manifest.js")
    if "google-cloud-text-to-speech" not in source:
        fail("TTS manifest thiếu provider")
    if re.search(r'AIza[0-9A-Za-z_-]{20,}', source):
        fail("Phát hiện chuỗi giống Google API key")


def check_tools() -> None:
    for path in [
        "tools/render_google_tts.py", "tools/vendor_twemoji.py", "tools/verify_repository.py",
        "tools/verify_startup_loading.py", "tools/verify_easy_entry.py", "tools/verify_easy_transition.py",
        "tools/render_google_tts.bat", "tools/vendor_twemoji.bat"
    ]:
        read(path)


def main() -> int:
    check_script_refs()
    check_styles()
    check_easy_scope_guards()
    check_stability_guards()
    check_optional_memory_split()
    check_easy_startup_performance_guards()
    codes = extract_visual_codes()
    check_twemoji_manifest(codes)
    check_tts_manifest()
    check_tools()
    print("\nRepository static verification: PASS")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
