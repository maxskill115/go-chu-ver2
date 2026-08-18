# HANDOFF — go-chu-ver2

## 1. Mục tiêu

Web HTML/CSS/JS thuần cho bé luyện **đọc → gõ → sửa lỗi → ôn lại → nghe → nhớ**, có chủ đề, cấp độ, hồ sơ riêng, thống kê và hỗ trợ tiếng Việt.

### Quy tắc làm việc bắt buộc

- Không backend khi chưa cần.
- Không refactor lớn nếu không cần.
- Mỗi đợt lớn: branch riêng → PR → CI → squash merge `main`.
- **Mọi thay đổi, plan, điều tra nguyên nhân, PR/commit và việc còn lại đều phải ghi vào HANDOFF này.**
- Easy-only feature không được lộ sang Hard/Free.
- UI phải dùng tốt PC + mobile.
- Không đưa API key/credential vào browser/runtime.
- Với lỗi hiệu năng: **điều tra/trace nguyên nhân trước → xác định xong thì tự fix luôn → không hỏi lại người dùng giữa chừng.**
- Không tối ưu cảm tính bằng CSS nếu chưa xác định hot-path/runtime/network/layout liên quan.

---

## 2. Roadmap hiện tại

### Hoàn tất

- [x] Phase 0 — Khởi tạo ver2.
- [x] Phase 1 — Levenshtein diff + hotfix UI bỏ ô đỏ/SP.
- [x] Phase 2 — Smart random + prompt yếu + Ôn lại.
- [x] Phase 3 — Ảnh + chữ + emoji fallback.
- [x] Phase 4 — Nghe rồi gõ, voice Việt.
- [x] Phase 5 — Nhớ rồi gõ.
- [x] Phase 6 — Chủ đề + cấp độ.
- [x] Phase 7 — Hồ sơ bé + dashboard + backup.
- [x] Phase 8 — Progress theo từ + lỗi dấu + Telex/VNI.

### Phase 9 — Stabilization / performance / responsive

- [x] Đợt 1 — smoke test + QA checklist.
- [x] Đợt 2 — wrapper audit + Hard/Free stats.
- [x] Đợt 3 — accessibility + keyboard.
- [x] Đợt 4 — storage audit.
- [x] Đợt 5 — asset reliability + fallback.
- [x] Đợt 6 — offline visual framework + CI/static verify.
- [x] Đợt 7 — deploy QA prep + readiness report.
- [x] Đợt 8 — UI scope + visual accuracy.
- [x] Đợt 9 — visual mapping round 2.
- [x] Đợt 10 — freeze/stability audit + runtime diagnostics.
- [x] Đợt 11 — Easy CPU startup rewrite.
- [x] Đợt 11B — startup network parallel + lazy audio.
- [x] Đợt 11C — Easy entry fast-path.
- [x] Đợt 11D — Easy boot state + transition gate.
- [~] **Đợt 11E — critical Easy path / post-startup split** trên branch `agent/easy-critical-path-split`.
- [ ] Browser/device performance gate trên Vercel/local thật.
- [ ] **Đợt 12 — responsive UI redesign PC/mobile.**

### Phase 10 — Pre-rendered Google TTS MP3

- [x] Runtime MP3 local-first + Web Speech fallback.
- [x] Google Cloud TTS renderer + Windows `.bat`.
- [x] Manifest deterministic + incremental/resume.
- [ ] Người dùng render MP3 thật.
- [ ] Commit `Audio/tts/*.mp3` + manifest đầy đủ.

---

## 3. PR / commit chính

- Phase 1: PR #1 → `1e8450b`
- Phase 2: PR #2 → `11b5689`
- Phase 3: PR #3 → `e0fe068`
- Phase 4: PR #4 → `6cc6b00`
- Hotfix UX/voice: PR #5 → `26cdb63`
- Phase 5: PR #6 → `daecd42`
- Phase 6: PR #7 → `18552e0`
- Phase 7: PR #8 → `e281c40`
- Phase 8: PR #9 → `10d756e`
- Phase 9 đợt 1: PR #10 → `36d16dc`
- Phase 9 đợt 2: PR #12 → `7d598f2`
- Phase 9 đợt 3: PR #13 → `94bb3ef`
- Phase 9 đợt 4: PR #14 → `d750722`
- Phase 9 đợt 5: PR #15 → `0e0ce0e`
- Phase 10 framework: PR #17 → `b7e52fd`
- Phase 9 đợt 6: PR #19 → `58f295d`
- Phase 9 đợt 7: PR #20 → `24f6673`
- Phase 9 đợt 8: PR #22 → `14d04bd`
- Phase 9 đợt 9: PR #24 → `ed76406`
- Phase 9 đợt 10: PR #26 → `25d2727`
- Performance + responsive plan: PR #28 → `1cd65bc`
- Easy CPU startup rewrite: PR #29 → `b27de10`
- Startup network/lazy audio: PR #31 → `3b13a7a`
- Handoff startup network: PR #32 → `2f28b49`
- Easy entry fast-path: PR #33 → `b6876c0`
- Handoff Easy fast-path: PR #34 → `0c86aba`
- Easy boot/transition 11D: PR #35 → `3d63d67`
- Handoff 11D: PR #36 → `9128040`
- **11E critical/post split: branch `agent/easy-critical-path-split`, PR/commit cập nhật sau CI/merge.**

### Tooling cleanup đã biết

- Branch rỗng `noop` từng tạo nhầm; không ảnh hưởng `main`.
- `EASY_ENTRY_FIX.tmp`, `noop.tmp`, `TEMP_SHOULD_NOT_EXIST.tmp` từng tạo nhầm trong quá trình thao tác tool và đã xóa; không nằm trong tree release.

---

## 4. Mode scope invariant

### Easy-only

Chỉ Easy được chạy/hiển thị:

- Topic / Level.
- Smart Review / Ôn lại.
- Visual prompt.
- Listen / Nghe rồi gõ.
- Memory / Nhớ rồi gõ.
- Adaptive `promptStats`.

### Hard

- Prompt nâng cao + input/check + `modeStats.hard`.
- Không Listen / Memory / Topic-Level / Review / Visual.

### Free

- Setup/custom text/typing Free + `modeStats.free`.
- Không control Easy.

---

## 5. Lịch sử điều tra hiệu năng Easy

### 5.1 Freeze/stability — PR #26

Đã bỏ auto fullscreen trên `click/keydown/wheel`, throttle Free resize/input và tránh dựng lại hàng chục thumbnail mỗi lần mở Free dropdown.

Debug:

```js
printGoChuPerformanceHealth()
```

### 5.2 Easy CPU startup rewrite — PR #29

Root cause: topic/effective-level từng bị tính/filter lặp trên toàn kho Easy, gần O(n²).

Cache:

```js
GO_CHU_UNIQUE_EASY_PROMPTS
GO_CHU_EASY_PROMPT_SET
goChuTopicNormalizeCache
goChuTopicMatchCache
goChuWordCountCache
goChuTopicPoolCache
goChuLevelPoolCache
```

Visual, voice enumeration, dashboard DOM và asset probe đã được lazy/defer.

### 5.3 Startup network + lazy audio — PR #31

Root cause lúc đó:

- 13 CSS qua `@import` waterfall;
- khoảng 27 JS classic script;
- background/UI audio tạo/preload quá sớm.

Fix:

- stylesheet direct trong head;
- JS `defer`;
- `audio-lazy-bootstrap.js` trước core;
- audio chỉ gắn `src` khi thật sự play sau user activation.

### 5.4 Easy entry fast-path — PR #33

Root cause:

```text
toàn bộ easyWords
→ shuffle toàn bộ
→ chèn weak prompt
→ cuối cùng mới filter Chủ đề/Cấp độ
```

Fix:

```text
getEffectiveLearningLevel một lần
→ getLevelPool(topic, level) cached
→ shuffle đúng pool đã lọc
→ chèn weak prompt phù hợp
```

Có weak-prompt cache + timing:

```text
easy:buildFilteredRound
```

### 5.5 Easy boot/transition 11D — PR #35

Điều tra phát hiện:

1. `script-core.js` khởi tạo `currentMode="easy"` trước khi `script.js` gọi `setMode("easy")` → phantom Easy init.
2. `showText()` đã update UI, sau đó wrapper `setMode` update thêm lượt nữa.
3. `input.focus()` giữa critical layout trên mobile mở keyboard/resize viewport quá sớm.

Fix:

- `easy-boot-state.js` → `currentMode="__boot__"` trong lúc module Easy-only nạp;
- `easy-entry-transition.js` coalesce Smart/Topic/Visual/Listen/Memory/Vietnamese UI;
- double RAF cho UI phụ;
- mobile không autofocus khi vừa vào Easy;
- desktop focus sau 2 frame.

Debug:

```js
getGoChuBootState()
getGoChuEasyEntryTransitionHealth()
```

Measures:

```text
easy:entrySyncGate
easy:auxUiFlush
```

CI PR #35 PASS trước merge.

---

## 6. Điều tra 11E — critical execution path vẫn quá dài

Sau 11D tiếp tục audit trực tiếp `index.html` thay vì chờ user gửi log.

### Bằng chứng

Production trước 11E có:

```text
30 external script tag
13 blocking stylesheet
```

`script.js` — file cuối cùng gọi `setMode("easy")` — nằm khoảng **vị trí script #23**.

Trước khi Easy được activate, ordered `defer` chain vẫn chứa cả resource không cần cho first usable Easy frame:

```text
data-poems.js                 (Free-only)
visual-data.js
 twemoji-local-manifest.js
visual-prompt.js
vietnamese-input.js
vietnamese-dashboard.js
```

Sau `script.js` còn các module không cần chặn first paint:

```text
stability-fixes.js
mode-stats.js
storage-health.js
asset-reliability.js
accessibility.js
performance-health.js
debug-smoke.js
```

### Kết luận root cause

`defer` giúp **download song song**, nhưng classic deferred scripts vẫn **execute theo document order**.

Vì `script.js` ở rất muộn, chỉ cần một resource trước nó tải/parse chậm là:

```text
HTML đã hiện
nhưng Easy chưa setMode
→ người dùng cảm giác mode Đơn giản vào rất lâu
```

Đây là bottleneck kiến trúc khác với O(n²), duplicate wrapper hay audio preload đã sửa trước đó.

---

## 7. Phase 9 đợt 11E — fix đang triển khai

Branch:

```text
agent/easy-critical-path-split
```

### 7.1 Critical Easy path mới

`index.html` giờ chỉ giữ các script cần để Easy core hoạt động đúng ngay lập tức:

```text
startup-performance.js

data-easy.js
tts-manifest.js
topic-data.js
audio-lazy-bootstrap.js
script-core.js
easy-boot-state.js
smart-review.js
listen-mode.js
ux-hotfix.js
tts-local.js
memory-mode.js
topic-level.js
profile-stats.js
startup-runtime-instrument.js
easy-entry-transition.js
script.js
post-startup-loader.js
```

Tổng critical script tag mục tiêu: **18** thay vì 30.

`script.js` được đưa từ khoảng vị trí #23 lên gần cuối critical core (~#17), nên `setMode("easy")` không còn chờ Free/visual/Vietnamese-dashboard/stats/debug modules.

### 7.2 Critical CSS mới

First render chỉ giữ:

```text
styles-1.css
styles-2.css
smart-review.css
listen-mode.css
ux-hotfix.css
memory-mode.css
topic-level.css
profile-stats.css
ui-scope-fixes.css
```

Tổng: **9 CSS blocking** thay vì 13.

Post-load CSS:

```text
visual-prompt.css
vietnamese-input.css
accessibility.css
asset-reliability.css
```

### 7.3 `post-startup-loader.js`

Nạp ngay sau `script.js` nhưng **không tải feature phụ ngay**.

Luồng:

```text
script.js → setMode("easy")
→ RAF #1
→ browser paint Easy core
→ RAF #2
→ bắt đầu post-startup downloads
```

13 module hậu kỳ:

```text
data-poems.js
visual-data.js
twemoji-local-manifest.js
visual-prompt.js
vietnamese-input.js
vietnamese-dashboard.js
stability-fixes.js
mode-stats.js
storage-health.js
asset-reliability.js
accessibility.js
performance-health.js
debug-smoke.js
```

Dynamic script dùng:

```js
script.async = false;
```

để browser có thể bắt đầu download các file nhưng vẫn giữ classic dependency execution order.

### 7.4 Race guard Hard/Free

Trong post-startup warm-up:

- Easy vẫn usable.
- Hard + Free tạm `disabled` và `aria-busy=true`.
- Khi post modules sẵn sàng, hai mode tự mở lại.

Lý do:

- Free cần `data-poems.js`.
- Hard/Free stats cần `mode-stats.js`.
- Không cho người dùng vào mode phụ ở cửa sổ vài frame khi extension chưa hoàn chỉnh.

### 7.5 Visual first prompt hydration

`visual-prompt.js` giờ khi được post-load sẽ tự:

```js
if(currentMode === "easy" && currentPrompt){
    schedulePromptVisual(currentPrompt);
}
```

=> prompt/input Easy xuất hiện trước; hình hiện sau một nhịp, đúng chủ đích performance.

### 7.6 Diagnostics 11E

```js
getGoChuPostStartupHealth()
```

Trả:

```text
scheduledAt
startedAt
readyAt
durationMs
ready/loading
loadedScripts / failedScripts
loadedStyles / failedStyles
scriptCount / styleCount
pendingScripts / pendingStyles
```

Global:

```js
GO_CHU_POST_STARTUP_READY
```

Events:

```text
gochu:post-startup-ready
```

Startup marks:

```text
postStartup:start
postStartup:ready
```

### 7.7 CI/QA 11E

`tools/verify_startup_loading.py` đã nâng cấp để fail nếu:

- critical JS > 20;
- post modules quay lại direct script trong `index.html`;
- optional CSS quay lại blocking head;
- mất double RAF;
- dynamic script không `async=false`;
- mất readiness API;
- Hard/Free không bị khóa trong warm-up.

`tools/verify_repository.py` cũng hiểu critical/post split.

`PERFORMANCE_QA.md` đã có test 11E.

---

## 8. Runtime diagnostics hiện có

Khi điều tra Easy:

```js
printGoChuStartupPerformance()
getGoChuBootState()
getGoChuEasyEntryTransitionHealth()
getGoChuPostStartupHealth()
getGoChuLearningPoolHealth()
getGoChuSmartReviewHealth()
```

Sau post-startup ready:

```js
printGoChuPerformanceHealth()
getGoChuVisualHealth()
getGoChuAssetHealth()
getGoChuStorageHealth()
```

Stage quan trọng:

```text
setMode:easy
showText:easy
easy:buildFilteredRound
easy:entrySyncGate
easy:auxUiFlush
postStartup:start
postStartup:ready
```

---

## 9. Responsive UI redesign — Phase 9 đợt 12

**Chưa bắt đầu cho tới khi performance gate sau 11E đạt trên browser/device thật.**

### PC >= 1024px

```text
Menu/Profile/Timer/Settings
Title + Mode
Prompt / visual
1 toolbar compact: Topic | Level | Nghe | Nhớ | Ôn
Input
Tiếp theo
Feedback fixed-height
```

### Mobile <= 767px

```text
☰  Timer  👤 ⚙
Mode compact
Prompt
visual nhỏ
Input
Tiếp theo
2 hàng tool compact
Feedback
```

- không auto-open keyboard khi vừa vào Easy;
- touch target >= 48px;
- Memory details chỉ hiện khi active;
- Replay chỉ hiện khi Listen active.

Dashboard:

- desktop summary cards + tabs;
- mobile full-screen sheet + tab/accordion.

QA:

```text
360×640
390×844
430×932
768×1024
1366×768
1440×900
1920×1080
zoom 125% / 150%
```

---

## 10. Google TTS

Easy-only runtime:

```text
1. MP3 Google TTS local
2. Web Speech vi-*
3. báo thiếu audio
```

Default renderer:

```text
vi-VN-Chirp3-HD-Aoede
rate 0.82
MP3
```

MP3 thật chưa render vì chờ Google Cloud account người dùng.

---

## 11. Visual pipeline

```text
semantic exact/contains
→ local Twemoji SVG nếu có
→ pinned CDN
→ emoji fallback
```

Không match semantic → không hiện hình.

---

## 12. Thứ tự tiếp theo cho phiên làm việc sau

1. Hoàn tất 11E trên `agent/easy-critical-path-split`.
2. Mở PR và chạy toàn CI.
3. CI fail → xem đúng step, sửa ngay trên branch; không merge mù.
4. CI PASS → squash merge `main` và ghi PR/commit thật vào HANDOFF.
5. Test local/Vercel bằng:

```js
printGoChuStartupPerformance()
getGoChuBootState()
getGoChuEasyEntryTransitionHealth()
getGoChuPostStartupHealth()
getGoChuLearningPoolHealth()
getGoChuSmartReviewHealth()
```

6. Xác nhận Easy usable trước `postStartup:start`; post modules hoàn tất sau đó và `ready=true`.
7. Nếu Easy vẫn chậm: tiếp tục trace stage còn lại → **điều tra rồi fix luôn**, không hỏi lại.
8. Chỉ khi Easy ổn mới bắt đầu Phase 9 đợt 12 redesign UI PC/mobile.
9. Sau redesign chạy full QA.
10. Sau cùng hoàn thiện Google TTS binary/Twemoji local nếu muốn offline 100%.
