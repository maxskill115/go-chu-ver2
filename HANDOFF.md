# HANDOFF — go-chu-ver2

## 1. Mục tiêu + quy tắc

Web HTML/CSS/JS thuần cho bé luyện **đọc → gõ → sửa lỗi → ôn lại → nghe → nhớ**, có Topic/Level, profile, thống kê và hỗ trợ tiếng Việt.

Quy tắc bắt buộc:

- Không backend/refactor lớn khi chưa cần.
- Mỗi đợt lớn: branch → PR → CI → squash merge `main`.
- **Mọi điều tra, plan, thay đổi, PR/commit và việc còn lại đều ghi vào HANDOFF này.**
- Easy-only feature không được lộ Hard/Free.
- UI phải ổn PC + mobile.
- Không đưa API key/credential vào browser/runtime.
- Với hiệu năng: **trace nguyên nhân trước → xác định xong tự fix luôn → không hỏi lại người dùng giữa chừng.**

---

## 2. Roadmap

- [x] Phase 0–8: baseline ver2, diff lỗi, Smart Review, visual, Listen, Memory, Topic/Level, Profiles, Vietnamese input.
- [x] Phase 9.1–9.10: QA, wrapper audit, accessibility, storage, asset fallback, offline visual, deploy QA, UI scope/visual accuracy, freeze diagnostics.
- [x] Phase 9.11: Easy CPU startup rewrite.
- [x] Phase 9.11B: startup network + lazy audio.
- [x] Phase 9.11C: filtered-pool fast-path.
- [x] Phase 9.11D: neutral boot + transition gate.
- [x] Phase 9.11E: critical/post-startup split.
- [x] Phase 9.11F: optional Listen/TTS/Memory runtime split.
- [~] **Phase 9.11G: Easy bootstrap code-volume split** trên `agent/easy-bootstrap-code-split`.
- [ ] Browser/device performance gate.
- [ ] Phase 9.12 responsive UI redesign PC/mobile.
- [~] Phase 10 Google TTS framework xong; MP3 thật chờ user render.

---

## 3. PR / commit chính

- PR #1 → `1e8450b`
- PR #2 → `11b5689`
- PR #3 → `e0fe068`
- PR #4 → `6cc6b00`
- PR #5 → `26cdb63`
- PR #6 → `daecd42`
- PR #7 → `18552e0`
- PR #8 → `e281c40`
- PR #9 → `10d756e`
- PR #10 → `36d16dc`
- PR #12 → `7d598f2`
- PR #13 → `94bb3ef`
- PR #14 → `d750722`
- PR #15 → `0e0ce0e`
- Phase 10 framework PR #17 → `b7e52fd`
- PR #19 → `58f295d`
- PR #20 → `24f6673`
- PR #22 → `14d04bd`
- PR #24 → `ed76406`
- PR #26 → `25d2727`
- Performance/UI plan PR #28 → `1cd65bc`
- Easy CPU PR #29 → `b27de10`
- Startup network PR #31 → `3b13a7a`
- Handoff PR #32 → `2f28b49`
- Easy filtered round PR #33 → `b6876c0`
- Handoff PR #34 → `0c86aba`
- Easy boot/transition PR #35 → `3d63d67`
- Handoff PR #36 → `9128040`
- Critical/post split PR #37 → `0d5afff`
- Handoff 11E PR #38 → `a2c944f`
- Optional Listen/TTS/Memory PR #39 → `c6205f3`
- Handoff 11F PR #40 → `aa8ab06`
- **11G branch `agent/easy-bootstrap-code-split`: PR/commit cập nhật sau CI/merge.**

Tooling cleanup: branch `noop` và các file tạm `EASY_ENTRY_FIX.tmp`, `noop.tmp`, `TEMP_SHOULD_NOT_EXIST.tmp` đã xóa; không nằm release tree.

---

## 4. Mode invariant

Easy-only:

```text
Topic/Level
Smart Review
Visual
Listen/TTS
Memory
adaptive promptStats
```

Hard: prompt Hard + `modeStats.hard`.
Free: Free flow + `modeStats.free`.
Hard/Free không chạy adaptive/UI Easy.

---

## 5. Chuỗi điều tra hiệu năng

### 11 — CPU cache

Loại near-O(n²) topic/effective-level scan bằng cache.

### 11B — network/audio

Bỏ CSS `@import`, defer JS, lazy audio src.

### 11C — filtered round

```text
getLevelPool(topic, level) → shuffle đúng pool → weak insert phù hợp
```

thay cho full-library shuffle rồi filter.

### 11D — phantom init / duplicate UI / mobile focus

- `currentMode="__boot__"` trong module load;
- auxiliary UI double RAF;
- mobile không autofocus; desktop focus sau 2 frame.

### 11E — critical path dài

Trước fix: 30 script / 13 CSS, `script.js` khoảng #23. Free/Visual/Vietnamese/Stats/A11y/Debug chuyển post-startup.

### 11F — Listen/TTS/Memory dependency coupling

Tách `memory-state.js` critical khỏi `memory-mode.js` behavior post-load, thêm `memory-topic-bridge.js`; Listen/TTS/Memory behavior ra hậu kỳ.

Sau 11F critical còn khoảng 14 script / 6 CSS.

---

## 6. Phase 9.11F — đã merge PR #39 → `c6205f3`

Critical:

```text
startup-performance
data-easy
topic-data
memory-state
audio-lazy-bootstrap
script-core
easy-boot-state
smart-review
topic-level
profile-stats
startup-runtime-instrument
easy-entry-transition
script
post-startup-loader
```

Post runtime validation bắt buộc:

```text
freeData
listen
tts
memory
memoryTopic
vietnameseInput
modeStats
storage
performance
```

Debug:

```js
getGoChuPostStartupHealth()
getGoChuMemoryStateHealth()
```

---

## 7. Điều tra 11G — request count không còn là toàn bộ vấn đề

Sau 11F tiếp tục audit critical files theo **trách nhiệm**, không chỉ số request.

Phát hiện rõ:

`script.js` vẫn nằm critical và phải parse/execute trước Easy, nhưng gần như toàn bộ file là:

```text
Free poem selector
Free typing flow
Settings handlers
pointer/keyboard UI handlers
volume/music handlers
Free resize/input throttles
toast helper
```

Trong khi startup Easy thật ở cuối chỉ là:

```js
startStudyTimer();
setMode("easy");
```

=> Dù critical request count đã thấp, browser vẫn phải tải/parse một **khối code Free/Settings lớn** chỉ để tới hai dòng Easy cuối file.

Kết luận root cause 11G: **critical code volume / ownership sai**, không phải chỉ network request count.

---

## 8. Phase 9.11G — fix đang triển khai

Branch:

```text
agent/easy-bootstrap-code-split
```

### 8.1 `easy-start.js` — critical cực nhỏ

Official startup chuyển sang:

```js
startStudyTimer();
setMode("easy");
```

Sau đó set:

```js
GO_CHU_EASY_CORE_STARTED = true
```

Debug:

```js
getGoChuEasyBootstrapHealth()
```

Measure/mark:

```text
easy:bootstrap
easy:coreStarted
```

### 8.2 `script.js` chuyển post-startup

Không còn direct `<script src="script.js">` trong critical HTML.

`script.js` giữ source baseline cũ, gồm hai dòng startup legacy cuối file. Để tránh sửa/risk hàng trăm dòng chỉ vì hai dòng này, `easy-start.js` cài guard:

```text
chỉ suppress setMode("easy")
khi GO_CHU_EXECUTING_POST_SCRIPT === "script.js"
```

=> user click Easy bình thường không bị suppress.

`startStudyTimer()` legacy gọi lần hai vẫn an toàn vì timer implementation idempotent.

### 8.3 Post loader bootstrap marker

`post-startup-loader.js` tải `script.js` riêng đầu tiên và set:

```js
GO_CHU_EXECUTING_POST_SCRIPT = "script.js"
```

trong lúc file thực thi, sau load thì clear marker.

Runtime validation mới:

```text
appUi
legacyEasySuppressed
```

Ngoài các checks 11F.

### 8.4 Warm-up UI guard

Trong hậu kỳ:

- Easy vẫn usable;
- Hard + Free + **Settings** tạm disabled/`aria-busy=true` vì handlers của Settings nay nằm post-loaded `script.js`;
- sau `runtimeValidated=true` tự mở lại.

### 8.5 Critical path 11G

Request count vẫn khoảng 14, nhưng `script.js` lớn được thay bằng `easy-start.js` nhỏ:

```text
startup-performance
data-easy
topic-data
memory-state
audio-lazy-bootstrap
script-core
easy-boot-state
smart-review
topic-level
profile-stats
startup-runtime-instrument
easy-entry-transition
easy-start
post-startup-loader
```

Đây là **giảm critical parse/execute volume**, không phải tối ưu giả bằng chỉ đếm request.

### 8.6 CI/QA 11G

Đã cập nhật:

```text
tools/verify_repository.py
tools/verify_startup_loading.py
tools/verify_easy_transition.py
tools/verify_optional_runtime.py
PERFORMANCE_QA.md
RUNTIME_ARCHITECTURE.md
```

CI phải fail nếu:

- `script.js` quay lại critical path;
- `easy-start.js` mất official startup/legacy guard;
- post loader mất script execution marker;
- legacy Easy không được suppress;
- Settings không bị khóa trong warm-up;
- post dependency order bị phá.

---

## 9. Diagnostics ưu tiên

First Easy:

```js
printGoChuStartupPerformance()
getGoChuEasyBootstrapHealth()
getGoChuBootState()
getGoChuEasyEntryTransitionHealth()
getGoChuPostStartupHealth()
getGoChuMemoryStateHealth()
getGoChuLearningPoolHealth()
getGoChuSmartReviewHealth()
```

Sau post ready:

```js
printGoChuPerformanceHealth()
getGoChuTtsHealth()
getGoChuVisualHealth()
getGoChuStorageHealth()
getGoChuAssetHealth()
```

Stage:

```text
setMode:easy
showText:easy
easy:buildFilteredRound
easy:entrySyncGate
easy:auxUiFlush
easy:bootstrap
easy:coreStarted
postStartup:start
postStartup:ready
```

---

## 10. Ứng viên điều tra tiếp nếu 11G chưa đạt gate

`profile-stats.js` vẫn critical vì initial profile preferences cần trước first round, nhưng file hiện chứa cả **profile runtime + dashboard/backup UI dài**.

Nếu Easy vẫn chậm sau 11G, hướng điều tra tiếp theo là tách:

```text
profile-runtime.js  (critical nhỏ)
profile-dashboard.js (post)
```

Không làm trước khi audit đầy đủ dependencies của mode-stats/storage/dashboard.

---

## 11. Phase 9.12 UI redesign

Chỉ bắt đầu khi performance gate ổn.

PC: compact header, prompt/visual, một toolbar Topic|Level|Nghe|Nhớ|Ôn, Input, Next, fixed feedback.

Mobile: compact HUD/mode, prompt, visual nhỏ, input, Next, 2 hàng tool; không auto-open keyboard; touch target >=48px.

Dashboard desktop tabs; mobile full-screen sheet/tab/accordion.

QA: `360×640`, `390×844`, `430×932`, `768×1024`, `1366×768`, `1440×900`, `1920×1080`, zoom 125/150%.

---

## 12. Việc tiếp theo

1. Hoàn tất 11G trên `agent/easy-bootstrap-code-split`.
2. Mở PR, chạy toàn CI.
3. CI fail → sửa đúng step, không merge mù.
4. CI PASS → squash merge và cập nhật PR/commit thật vào HANDOFF.
5. Test `getGoChuEasyBootstrapHealth()`; sau post ready phải có `legacyScriptEasySuppressed=true`.
6. Nếu Easy vẫn chậm → audit/tách profile runtime/dashboard rồi tự fix.
7. Nếu Easy ổn → Phase 9.12 responsive UI redesign.
