#!/usr/bin/env python3
"""Guard Phase 9 đợt 11H: profile runtime critical / dashboard post-startup split."""

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
    runtime = read("profile-stats.js")
    dashboard = read("profile-dashboard.js")
    post = read("post-startup-loader.js")

    refs = re.findall(r'<script\s+src="([^"]+)"', html)
    styles = re.findall(r'<link\s+rel="stylesheet"\s+href="([^"]+)"', html)

    if "profile-stats.js" not in refs:
        fail("profile-stats.js runtime phải còn ở critical path")
    if "profile-dashboard.js" in refs:
        fail("profile-dashboard.js không được nằm critical path")
    if "profile-stats.css" in styles:
        fail("profile-stats.css không được block first Easy paint")
    if '"profile-dashboard.js"' not in post or '"profile-stats.css"' not in post:
        fail("Post loader thiếu profile dashboard JS/CSS")

    required_runtime = [
        "initializeProfileSystem",
        "normalizeProfileData",
        "loadProfileData",
        "saveProfileData",
        "applyProfileToRuntime",
        "savePromptStats = function",
        "saveTopicLevelSetting = function",
        "saveMemoryNumber = function",
        "startStudyTimer = function",
        "GO_CHU_PROFILE_RUNTIME_READY",
        "getGoChuProfileRuntimeHealth",
    ]
    for snippet in required_runtime:
        if snippet not in runtime:
            fail(f"Profile runtime thiếu critical function/state: {snippet}")

    forbidden_runtime = [
        "function ensureProfileDashboard",
        "function renderProfileDashboard",
        "function exportProfilesBackup",
        "function importProfilesBackup",
        "function addProfileFromDashboard",
        "function renameActiveProfileFromDashboard",
        "function deleteActiveProfileFromDashboard",
        "function resetActiveProfileProgress",
    ]
    for snippet in forbidden_runtime:
        if snippet in runtime:
            fail(f"Profile UI quay lại critical runtime: {snippet}")

    required_dashboard = [
        "function ensureProfileHud",
        "function ensureProfileDashboard",
        "function renderProfileDashboard",
        "function switchProfile",
        "function addProfileFromDashboard",
        "function renameActiveProfileFromDashboard",
        "function deleteActiveProfileFromDashboard",
        "function resetActiveProfileProgress",
        "function exportProfilesBackup",
        "async function importProfilesBackup",
        "GO_CHU_PROFILE_DASHBOARD_READY",
        "ensureProfileHud();",
        "updateProfileHud();",
    ]
    for snippet in required_dashboard:
        if snippet not in dashboard:
            fail(f"Profile dashboard thiếu behavior: {snippet}")

    order = ["profile-dashboard.js", "vietnamese-dashboard.js", "mode-stats.js"]
    positions = {name: post.find(f'"{name}"') for name in order}
    for current, nxt in zip(order, order[1:]):
        if positions[current] < 0 or positions[nxt] < 0 or positions[current] >= positions[nxt]:
            fail(f"Sai post profile dependency order: {current} → {nxt}")

    for snippet in [
        "profileUi:",
        "GO_CHU_PROFILE_DASHBOARD_READY",
        "profileRuntimeReady",
        "profileDashboardReady",
    ]:
        if snippet not in post:
            fail(f"Post runtime validation/health thiếu: {snippet}")

    print("Profile runtime/dashboard split verification: PASS")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
