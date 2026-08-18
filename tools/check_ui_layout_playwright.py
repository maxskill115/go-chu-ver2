#!/usr/bin/env python3
"""Browser layout smoke cho Phase 9.12A.

Cần:
    py -m pip install playwright
    py -m playwright install chromium

Chạy từ repo root:
    py tools/check_ui_layout_playwright.py
"""

from __future__ import annotations

import contextlib
import http.server
import socket
import threading
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

VIEWPORTS = [
    (360, 640),
    (390, 844),
    (430, 932),
    (640, 360),
    (768, 1024),
    (1366, 768),
    (1440, 900),
    (1920, 1080),
]


def free_port() -> int:
    with socket.socket() as sock:
        sock.bind(("127.0.0.1", 0))
        return int(sock.getsockname()[1])


@contextlib.contextmanager
def serve_repo():
    port = free_port()
    handler = lambda *args, **kwargs: http.server.SimpleHTTPRequestHandler(
        *args, directory=str(ROOT), **kwargs
    )
    server = http.server.ThreadingHTTPServer(("127.0.0.1", port), handler)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    try:
        yield f"http://127.0.0.1:{port}/"
    finally:
        server.shutdown()
        server.server_close()


def assert_in_view(page, selector: str, label: str, require_bottom: bool = True):
    box = page.locator(selector).bounding_box()
    if not box:
        raise AssertionError(f"{label}: không có bounding box")
    viewport = page.viewport_size
    assert viewport
    if box["x"] < -2 or box["x"] + box["width"] > viewport["width"] + 2:
        raise AssertionError(f"{label}: tràn ngang {box} / {viewport}")
    if box["y"] < -2:
        raise AssertionError(f"{label}: nằm trên viewport {box}")
    if require_bottom and box["y"] + box["height"] > viewport["height"] + 4:
        raise AssertionError(f"{label}: nằm dưới viewport {box} / {viewport}")
    return box


def wait_post_ready(page):
    page.wait_for_function("window.GO_CHU_POST_STARTUP_READY === true", timeout=10000)


def run_one(browser, base_url: str, width: int, height: int):
    page = browser.new_page(viewport={"width": width, "height": height})
    errors: list[str] = []
    page.on("pageerror", lambda exc: errors.append(f"pageerror: {exc}"))
    page.on("console", lambda msg: errors.append(f"console: {msg.text}") if msg.type == "error" else None)

    try:
        page.goto(base_url, wait_until="domcontentloaded", timeout=10000)
        page.wait_for_selector("#input", state="visible", timeout=10000)
        page.wait_for_function("window.GO_CHU_EASY_CORE_STARTED === true", timeout=10000)

        overflow = page.evaluate("document.documentElement.scrollWidth - window.innerWidth")
        if overflow > 2:
            raise AssertionError(f"{width}x{height}: horizontal overflow {overflow}px")

        assert_in_view(page, ".hud-top", "HUD")
        assert_in_view(page, "#input", "Easy input")
        assert_in_view(page, "#nextBtn", "Easy Next")

        wait_post_ready(page)
        page.wait_for_timeout(120)

        overflow = page.evaluate("document.documentElement.scrollWidth - window.innerWidth")
        if overflow > 2:
            raise AssertionError(f"{width}x{height}: post-ready horizontal overflow {overflow}px")

        # HUD controls after profile module exists.
        for selector, label in [
            ("#game-menu", "Menu"),
            ("#profileDashboardBtn", "Profile"),
            ("#settingsToggleBtn", "Settings"),
        ]:
            box = assert_in_view(page, selector, label)
            if width <= 700 and min(box["width"], box["height"]) < 43:
                raise AssertionError(f"{width}x{height}: {label} touch target < 43px: {box}")

        # Settings must open inside viewport.
        page.locator("#settingsToggleBtn").click()
        page.wait_for_timeout(50)
        assert_in_view(page, "#settingsPanel", "Settings panel", require_bottom=False)
        page.locator("#settingsToggleBtn").click()

        # Profile dashboard must open/close after post-ready.
        page.locator("#profileDashboardBtn").click()
        page.wait_for_selector("#profileDashboardOverlay:not(.hidden)", timeout=3000)
        page.locator("#profileDashboardClose").click()

        # Hard scope.
        page.locator('.mode-btn[data-mode="hard"]').click()
        page.wait_for_function("currentMode === 'hard'", timeout=3000)
        assert_in_view(page, "#input", "Hard input")
        for selector in ["#topicLevelBar", "#listenModeBar", "#memoryModeBar", "#smartReviewBar"]:
            if page.locator(selector).count() and page.locator(selector).is_visible():
                raise AssertionError(f"{width}x{height}: Easy-only control visible in Hard: {selector}")

        # Free setup must not overflow.
        page.locator('.mode-btn[data-mode="free"]').click()
        page.wait_for_function("currentMode === 'free'", timeout=3000)
        page.wait_for_selector("#freeSetupPanel:not(.hidden)", timeout=3000)
        free_overflow = page.evaluate("document.documentElement.scrollWidth - window.innerWidth")
        if free_overflow > 2:
            raise AssertionError(f"{width}x{height}: Free horizontal overflow {free_overflow}px")

        if errors:
            raise AssertionError(f"{width}x{height}: browser errors: {errors}")

    finally:
        page.close()


def main() -> int:
    try:
        from playwright.sync_api import sync_playwright
    except ImportError as exc:
        raise SystemExit("Thiếu Playwright: py -m pip install playwright") from exc

    with serve_repo() as base_url:
        with sync_playwright() as pw:
            browser = pw.chromium.launch(headless=True)
            try:
                for width, height in VIEWPORTS:
                    run_one(browser, base_url, width, height)
                    print(f"PASS {width}x{height}")
            finally:
                browser.close()

    print("Responsive browser layout QA: PASS")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
