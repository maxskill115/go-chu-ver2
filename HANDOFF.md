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
- [x] **Phase 9.11G: Easy bootstrap code-volume split.**
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
- **Easy bootstrap split PR #41 → `7c1f53b`**

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

thay full-library shuffle rồi filter.

### 11D — phantom init / duplicate UI / mobile focus

- `currentMode="__boot__"` trong module load;
- auxiliary UI double RAF;
- mobile không autofocus; desktop focus sau 2 frame.

### 11E — critical path dài

Trước fix: 30 script / 13 CSS, `script.js` khoảng #23. Free/Visual/Vietnamese/Stats/A11y/Debug chuyển post-startup.

### 11F — Listen/TTS/Memory coupling

Tách `memory-state.js` critical khỏi `memory-mode.js` behavior post-load, thêm `memory-topic-bridge.js`. Listen/TTS/Memory behavior ra hậu kỳ.

### 11G — critical code volume

Sau 11F số request đã thấp nhưng `script.js` lớn vẫn critical. File gần như toàn Free/Settings/event handlers, trong khi Easy startup thật chỉ là:

```js
startStudyTimer();
setMode("easy");
```

Root cause: browser vẫn phải tải/parse **khối Free/Settings lớn** trước hai dòng Easy.

---

## 6. Phase 9.11G — đã merge PR #41 → `7c1f53b`

### 6.1 `easy-start.js` critical

Official startup:

```js
startStudyTimer();
setMode("easy");
```

Debug:

```js
getGoChuEasyBootstrapHealth()
```

Marks/measures:

```text
easy:bootstrap
easy:coreStarted
```

### 6.2 `script.js` chuyển hậu kỳ

`script.js` không còn direct critical tag. Toàn bộ Free/Settings/event-handler code chỉ parse sau first Easy paint.

File vẫn giữ hai dòng startup legacy để giảm risk chỉnh baseline. `easy-start.js` suppress **chỉ** lời gọi `setMode("easy")` khi:

```js
GO_CHU_EXECUTING_POST_SCRIPT === "script.js"
```

=> click Easy của user không bị suppress.

### 6.3 Post-loader 11G

`script.js` được tải riêng đầu tiên trong post stage với execution marker, rồi mới tải các feature khác.

Trong warm-up:

- Easy usable;
- Hard + Free + Settings disabled/`aria-busy=true`;
- sau runtime validation tự mở.

Runtime checks thêm:

```text
appUi
legacyEasySuppressed
```

Sau post-ready cần:

```text
getGoChuEasyBootstrapHealth().legacyScriptEasySuppressed = true
getGoChuPostStartupHealth().runtimeValidated = true
```

### 6.4 Critical path sau 11G

Vẫn khoảng **14 script / 6 CSS**, nhưng code volume critical nhỏ hơn vì `script.js` được thay bằng `easy-start.js`.

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

### 6.5 CI/QA

Đã cập nhật:

```text
tools/verify_repository.py
tools/verify_startup_loading.py
tools/verify_easy_transition.py
tools/verify_optional_runtime.py
PERFORMANCE_QA.md
RUNTIME_ARCHITECTURE.md
```

PR #41 CI **PASS toàn bộ** trước squash merge.

---

## 7. Diagnostics ưu tiên

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

## 8. Ứng viên điều tra tiếp — profile critical code volume

`profile-stats.js` vẫn critical để active profile + Topic/Level/Memory preferences sẵn sàng trước first Easy round.

Nhưng file hiện chứa cả:

```text
profile runtime/storage/preferences/study timer
+
profile HUD
dashboard DOM
summary/weak/topic stats
add/rename/delete
export/import/reset backup UI
```

Nếu tiếp tục tối ưu, phải audit dependency rồi tách:

```text
profile runtime/state (critical nhỏ)
profile dashboard/management UI (post)
```

Không được làm mất profile migration, promptStats routing, Memory preferences, study timer hoặc mode-stats wrappers.

---

## 9. Phase 9.12 UI redesign

Chỉ bắt đầu khi performance gate ổn.

PC: compact header, prompt/visual, toolbar Topic|Level|Nghe|Nhớ|Ôn, Input, Next, fixed feedback.

Mobile: compact HUD/mode, prompt, visual nhỏ, input, Next, 2 hàng tool; không auto-open keyboard; touch target >=48px.

Dashboard desktop tabs; mobile full-screen sheet/tab/accordion.

QA: `360×640`, `390×844`, `430×932`, `768×1024`, `1366×768`, `1440×900`, `1920×1080`, zoom 125/150%.

---

## 10. Việc tiếp theo cho phiên sau

1. Main runtime phải có **`7c1f53b`** + commit HANDOFF bookkeeping sau PR #41.
2. Nếu tiếp tục performance: audit dependency `profile-stats.js` rồi tách runtime/dashboard nếu an toàn; điều tra xong tự fix, không hỏi lại.
3. Browser/Vercel test: `getGoChuEasyBootstrapHealth()` phải `coreStarted=true`; post-ready phải `legacyScriptEasySuppressed=true`, `runtimeValidated=true`.
4. Nếu Easy đạt gate → Phase 9.12 responsive UI redesign.
5. Nếu vẫn chậm → tiếp tục trace critical core remaining stages và fix đúng root cause.
