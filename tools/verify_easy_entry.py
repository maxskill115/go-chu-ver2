#!/usr/bin/env python3
"""Regression guard riêng cho tốc độ vào mode Easy."""

from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]


def fail(message: str) -> None:
    print(f"[FAIL] {message}", file=sys.stderr)
    raise SystemExit(1)


def need(source: str, snippet: str, message: str) -> None:
    if snippet not in source:
        fail(message)


def main() -> int:
    smart = (ROOT / "smart-review.js").read_text(encoding="utf-8")
    topic = (ROOT / "topic-level.js").read_text(encoding="utf-8")

    need(topic, "const sourcePool = getLevelPool(selectedTopicId, effectiveLevel);",
         "Easy round phải lấy thẳng cached level-pool")
    need(topic, "shuffleTopicLearningPool(fallbackPool)",
         "Easy round phải chỉ shuffle pool đã lọc")
    need(topic, "goChuLastEasyRoundBuildMs", "Thiếu timing cho Easy round")
    need(topic, "scheduleTopicLevelBarUpdate", "Topic UI chưa coalesce theo frame")

    if "baseBuildSmartEasyRoundForTopic" in topic:
        fail("Không được quay lại build toàn bộ Easy rồi mới filter")

    need(smart, "goChuWeakPromptCache", "Thiếu weak prompt cache")
    need(smart, "goChuPromptStatsRevision", "Thiếu revision invalidate weak cache")
    need(smart, "scheduleSmartReviewBarUpdate", "Smart Review UI chưa coalesce theo frame")

    if "plainShuffleEasyWords().filter(prompt => weakPrompts.includes(prompt))" in smart:
        fail("Smart Review dùng includes O(n*m); phải dùng Set")

    print("Easy entry fast-path verification: PASS")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
