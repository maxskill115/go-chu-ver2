#!/usr/bin/env python3
"""Guard Phase 9 đợt 11F: Listen/TTS/Memory behavior không nằm critical Easy path."""

from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def fail(message: str) -> None:
    print(f"[FAIL] {message}", file=sys.stderr)
    raise SystemExit(1)


def read(path: str) -> str:
    return (ROOT / path).read_text(encoding="utf-8")


def main() -> int:
    html = read("index.html")
    post = read("post-startup-loader.js")
    state = read("memory-state.js")
    memory = read("memory-mode.js")
    bridge = read("memory-topic-bridge.js")
    topic = read("topic-level.js")
    profile = read("profile-stats.js")

    refs = re.findall(r'<script\s+src="([^"]+)"', html)
    critical_required = ["topic-data.js", "memory-state.js", "script-core.js", "topic-level.js", "profile-stats.js", "script.js"]
    for name in critical_required:
        if name not in refs:
            fail(f"Critical path thiếu {name}")

    forbidden_critical = ["tts-manifest.js", "listen-mode.js", "ux-hotfix.js", "tts-local.js", "memory-mode.js"]
    leaked = [name for name in forbidden_critical if name in refs]
    if leaked:
        fail(f"Optional runtime quay lại critical path: {leaked}")

    for snippet in [
        'const GO_CHU_MEMORY_WORDS_KEY', 'const GO_CHU_MEMORY_SECONDS_KEY',
        'let memoryModeActive = false', 'let memoryWordCount', 'let memorySeconds',
        'let buildMemoryRound = function', 'getGoChuMemoryStateHealth'
    ]:
        if snippet not in state:
            fail(f"memory-state thiếu {snippet}")

    for snippet in [
        'const GO_CHU_MEMORY_WORDS_KEY', 'const GO_CHU_MEMORY_SECONDS_KEY',
        'let memoryModeActive', 'let memoryWordCount', 'let memorySeconds',
        'function loadMemoryNumber', 'function saveMemoryNumber', 'function getPromptWordCount'
    ]:
        if snippet in memory:
            fail(f"memory-mode redeclare state: {snippet}")

    if 'buildMemoryRound = function' not in memory or 'GO_CHU_MEMORY_BEHAVIOR_READY' not in memory:
        fail("memory-mode chưa thay stub bằng behavior thật")
    if 'GO_CHU_MEMORY_TOPIC_BRIDGE_READY' not in bridge or 'promptMatchesTopic' not in bridge:
        fail("memory-topic-bridge chưa phục hồi topic filter")
    if 'const baseBuildMemoryRoundForTopic = buildMemoryRound' not in topic:
        fail("topic-level không còn binding Memory stub dự kiến")
    if 'memoryWordCount' not in profile or 'memorySeconds' not in profile:
        fail("profile-stats mất Memory preferences")

    post_order = [
        "tts-manifest.js", "listen-mode.js", "ux-hotfix.js", "tts-local.js",
        "memory-mode.js", "memory-topic-bridge.js", "vietnamese-input.js"
    ]
    positions = {name: post.find(f'"{name}"') for name in post_order}
    for current, nxt in zip(post_order, post_order[1:]):
        if positions[current] < 0 or positions[nxt] < 0 or positions[current] >= positions[nxt]:
            fail(f"Sai post dependency order: {current} → {nxt}")

    for snippet in ["validatePostRuntime", "runtimeValidated", "GO_CHU_MEMORY_BEHAVIOR_READY", "GO_CHU_MEMORY_TOPIC_BRIDGE_READY"]:
        if snippet not in post:
            fail(f"Post runtime validation thiếu {snippet}")

    print("Optional runtime split verification: PASS")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
