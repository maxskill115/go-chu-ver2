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

    required_order = [
        "startup-performance.js",
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
    positions = {ref: refs.index(ref) if ref in refs else -1 for ref in required_order}
    missing_required = [name for name, pos in positions.items() if pos < 0]
    if missing_required:
        fail(f"Thiếu critical script bắt buộc: {missing_required}")
    if any(positions[required_order[i]] >= positions[required_order[i + 1]] for i in range(len(required_order) - 1)):
        fail("Load order critical runtime không đúng")

    post_required = [
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
    leaked = [name for name in post_required if name in refs]
    if leaked:
        fail(f"Post-startup script bị đưa lại critical path: {leaked}")
    missing_post = [name for name in post_required if name not in post]
    if missing_post:
        fail(f"Post loader thiếu module: {missing_post}")

    ok(f"Critical refs {len(refs)} file; post-startup modules {len(post_required)} file")


def check_styles() -> None:
    html = read("index.html")
    scope = read("ui-scope-fixes.css")
    post = read("post-startup-loader.js")
    compact = re.sub(r"\s+", "", scope)

    if 'href="styles.css"' in html:
        fail("Production không được quay lại styles.css/@import waterfall")
    if 'href="ui-scope-fixes.css"' not in html:
        fail("ui-scope-fixes.css phải nằm trong critical CSS cascade")
    if ".hidden-by-mode" not in scope or "display:none!important" not in compact:
        fail("UI scope guard cho hidden-by-mode chưa đủ mạnh")

    optional = ["visual-prompt.css", "vietnamese-input.css", "accessibility.css", "asset-reliability.css"]
    for name in optional:
        if f'href="{name}"' in html:
            fail(f"Optional CSS không được block first paint: {name}")
        if name not in post:
            fail(f"Post loader thiếu optional CSS: {name}")
    ok("Critical/post-startup CSS split hợp lệ")


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


def check_stability_guards() -> None:
    script = read("script.js")
    stability = read("stability-fixes.js")
    performance = read("performance-health.js")

    if "function requestAppFullscreen" in script or "request.call(el)" in script:
        fail("script.js còn auto-fullscreen runtime; đây là nguồn jank/treo đã cấm")
    if 'document.addEventListener("wheel"' in script or 'document.addEventListener("keydown", requestAppFullscreen' in script:
        fail("script.js còn listener fullscreen/event nặng trên wheel/keydown")
    if "requestAnimationFrame" not in script or "scheduleFreeLayoutSync" not in script or "scheduleFreeTypingState" not in script:
        fail("Free mode chưa throttle resize/input theo animation frame")
    if "poemSelectMenu.dataset.rendered" not in stability or "DocumentFragment" not in stability:
        fail("Free dropdown chưa có single-render DOM guard")
    if "--free-poem-icon-url" in stability:
        fail("Free dropdown stability layer không được gắn ảnh nặng cho mọi option")
    if "PerformanceObserver" not in performance or "getGoChuPerformanceHealth" not in performance:
        fail("Thiếu performance diagnostics cho long task/runtime error")
    ok("Freeze/stability guards tồn tại")


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

    required_topic = [
        "GO_CHU_UNIQUE_EASY_PROMPTS",
        "GO_CHU_EASY_PROMPT_SET",
        "goChuTopicNormalizeCache",
        "goChuTopicMatchCache",
        "goChuWordCountCache",
    ]
    if any(name not in topic_data for name in required_topic):
        fail("Thiếu cache topic/word-count cho Easy startup")

    if "goChuTopicPoolCache" not in topic_level or "goChuLevelPoolCache" not in topic_level:
        fail("Thiếu cache topic/level pool")
    if 'const effectiveLevel = getEffectiveLearningLevel();' not in topic_level:
        fail("Smart Easy round chưa tính effective level một lần")
    if '.filter(prompt => promptMatchesLearningFilters(prompt, true))' in topic_level:
        fail("Smart Easy round quay lại tính filter/level lặp trên từng prompt")

    if "goChuVisualMatchCache" not in visual or "schedulePromptVisual" not in visual or "requestAnimationFrame" not in visual:
        fail("Visual chưa cache/defer")
    if 'if(currentMode === "easy" && currentPrompt)' not in visual:
        fail("Visual post-load phải hydrate prompt Easy hiện tại")

    hud_block = re.search(r"function ensureProfileHud\(\).*?\n}\n\nfunction updateProfileHud", profile, flags=re.S)
    if hud_block and "ensureProfileDashboard()" in hud_block.group(0):
        fail("Profile HUD không được dựng dashboard modal ở startup")
    if re.search(r"initializeProfileSystem\(\);\s*ensureProfileHud\(\);\s*updateProfileHud\(\);\s*renderProfileDashboard\(\);", profile):
        fail("Dashboard vẫn render ngay ở startup")

    if "ensureListenVoiceRuntime" not in listen:
        fail("Listen thiếu lazy voice runtime")
    if re.search(r"(?m)^\s*refreshVoiceHotfixUI\(\);\s*$", ux):
        fail("Voice setting vẫn bị enumerate bằng lời gọi standalone ở startup")
    if "hasVietnameseWebVoice(refresh = false)" not in tts:
        fail("Local TTS chưa tránh query Web Speech khi inactive")

    if "hydrateActiveModeStatsFromStorage" not in mode_stats:
        fail("Mode stats chưa hydrate dữ liệu cũ mà không startup write")
    if re.search(r"hydrateActiveModeStatsFromStorage\(\);\s*saveProfileData\(", mode_stats):
        fail("Mode stats không được save profile ngay sau startup hydrate")

    if "requestIdleCallback" not in asset or "scheduleGoChuAssetReliability" not in asset:
        fail("Asset probing chưa defer tới idle")

    if "getGoChuStartupPerformance" not in startup or "printGoChuStartupPerformance" not in startup:
        fail("Thiếu startup performance report")
    if "setModeEasy:start" not in runtime_startup or "easy:firstInputReady" not in runtime_startup:
        fail("Thiếu marker startup Easy")
    if 'currentMode = "__boot__"' not in boot:
        fail("Thiếu neutral Easy boot state")
    if "getGoChuEasyEntryTransitionHealth" not in transition or transition.count("requestAnimationFrame") < 2:
        fail("Thiếu Easy transition gate/double RAF")
    if "GO_CHU_POST_STARTUP_READY" not in post or "getGoChuPostStartupHealth" not in post:
        fail("Thiếu post-startup readiness diagnostics")

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
        "tools/verify_startup_loading.py",
        "tools/verify_easy_entry.py",
        "tools/verify_easy_transition.py",
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
    check_stability_guards()
    check_easy_startup_performance_guards()
    codes = extract_visual_codes()
    check_twemoji_manifest(codes)
    check_tts_manifest()
    check_tools()
    print("\nRepository static verification: PASS")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
